import Equipments from "../models/Equipments.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import logger from "../config/logger.js";
import mongoose from "mongoose";
import { checkAndProcessExpiredReservations } from "../services/autoReturnService.js";

export const createEquipment = async (req, res) => {
  try {
    const { ename, category, condition, quantity } = req.body;

    logger.info(`Creating new equipment`);

    const equipment = new Equipments({
      name: ename,
      category,
      condition,
      quantity,
    });
    await equipment.save();

    logger.info(`Equipment created successfully`);
    res.status(201).json({
      status: "success",
      message: "Equipment created successfully",
      data: equipment,
    });
  } catch (error) {
    logger.error("Error creating equipment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create equipment",
      data: null,
    });
  }
};

export const getEquipment = async (req, res) => {
  try {
    await checkAndProcessExpiredReservations();
    
    const { search, category, condition, page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const validPage = pageNum > 0 ? pageNum : 1;
    const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 10;
    logger.info(`Fetching equipment with search: ${search}, category: ${category}, condition: ${condition}, page: ${validPage}, limit: ${validLimit}`);

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (condition) {
      query.condition = { $regex: `^${condition}$`, $options: 'i' };
    }

    const totalCount = await Equipments.countDocuments(query);
    
   
    const skip = (validPage - 1) * validLimit;
    

    const equipment = await Equipments.find(query)
      .skip(skip)
      .limit(validLimit)
      .sort({ createdAt: -1 }); 

  
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    logger.info(`Retrieved ${equipment.length} equipment items (page ${validPage} of ${totalPages}, total: ${totalCount})`);
    
    res.status(200).json({
      status: "success",
      message: "Equipment items fetched successfully",
      data: equipment,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit: validLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    logger.error("Error fetching equipment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch equipment",
      data: null,
    });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, condition, quantity } = req.body;

    logger.info(`Updating equipment with ID: ${id}`);

    const equipment = await Equipments.findByIdAndUpdate(
      id,
      { name, category, condition, quantity },
      { new: true }
    );

    if (!equipment) {
      logger.warn(`Equipment with ID ${id} not found for update`);
      return res.status(404).json({
        status: "error",
        message: "Equipment not found",
        data: null,
      });
    }

    logger.info(`Equipment updated successfully`);
    res.status(200).json({
      status: "success",
      message: "Equipment updated successfully",
      data: equipment,
    });
  } catch (error) {
    logger.error("Error updating equipment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update equipment",
      data: null,
    });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Attempting to delete equipment with ID`);

    const equipment = await Equipments.findByIdAndDelete(id);

    if (!equipment) {
      logger.warn(`Equipment with ID ${id} not found for deletion`);
      return res.status(404).json({
        status: "error",
        message: "Equipment not found",
        data: null,
      });
    }

    logger.info(`Equipment deleted successfully: ${equipment.name}`);
    res.status(200).json({
      status: "success",
      message: "Equipment deleted successfully",
      data: null,
    });
  } catch (error) {
    logger.error("Error deleting equipment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete equipment",
      data: null,
    });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    await checkAndProcessExpiredReservations();
    
    const userId = req.user.id;
    const { search, status, page = 1, limit = 10 } = req.query;
    
    // Parse page and limit as integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Validate pagination parameters
    const validPage = pageNum > 0 ? pageNum : 1;
    const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 10;
    
    logger.info(`Fetching reservations for user ${userId} with search: ${search}, status: ${status}, page: ${validPage}, limit: ${validLimit}`);

    let query = { user: userId };

   
    if (status) {
      query.status = { $regex: `^${status}$`, $options: 'i' };
    }

    // Calculate skip value for pagination
    const skip = (validPage - 1) * validLimit;
    
    let reservations;
    let totalCount;
    
    if (search && search.trim()) {
      // First, find all equipment IDs that match the search
      const searchRegex = search.trim();
      const matchingEquipments = await Equipments.find({
        $or: [
          { name: { $regex: searchRegex, $options: 'i' } },
          { category: { $regex: searchRegex, $options: 'i' } }
        ]
      }).select('_id');
      
      const equipmentIds = matchingEquipments.map(eq => eq._id);
      
      // If no equipment matches, return empty results
      if (equipmentIds.length === 0) {
        totalCount = 0;
        reservations = [];
      } else {
        // Update query to include equipment filter
        const searchQuery = {
          ...query,
          equipment: { $in: equipmentIds }
        };
        
        // Get total count for search results
        totalCount = await Reservation.countDocuments(searchQuery);
        
        // Fetch paginated reservations
        reservations = await Reservation.find(searchQuery)
          .populate('equipment', 'name category condition')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validLimit);
      }
    } else {
      // Standard query without search
      totalCount = await Reservation.countDocuments(query);
      reservations = await Reservation.find(query)
        .populate('equipment', 'name category condition')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    logger.info(`Retrieved ${reservations.length} reservations (page ${validPage} of ${totalPages}, total: ${totalCount})`);

    res.status(200).json({
      status: "success",
      message: "Reservations fetched successfully",
      data: reservations,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit: validLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    logger.error("Error fetching reservations:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reservations",
      data: null,
    });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    await checkAndProcessExpiredReservations();
    
    const { search, category, status, page = 1, limit = 10 } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    
    // Parse page and limit as integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Validate pagination parameters
    const validPage = pageNum > 0 ? pageNum : 1;
    const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 10;
    
    logger.info(`Fetching all reservations with search: ${search}, category: ${category}, status: ${status}, page: ${validPage}, limit: ${validLimit}, role: ${userRole}`);

    // Build base query
    let query = {};

    // If user is STAFF, filter reservations to only show those from students in their class
    if (userRole === 'STAFF') {
      // Get the staff user's class
      let staffUserId = userId;
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        staffUserId = new mongoose.Types.ObjectId(userId);
      }
      
      const staffUser = await User.findById(staffUserId);
      
      if (!staffUser || !staffUser.sclass) {
        return res.status(400).json({
          status: "error",
          message: "Staff member must be assigned to a class",
          data: null,
        });
      }

      // Get all students in the staff's class
      const studentsInClass = await User.find({ 
        role: 'STUDENT', 
        sclass: staffUser.sclass 
      }).select('_id');

      // If no students in class, return empty result
      if (studentsInClass.length === 0) {
        return res.status(200).json({
          status: "success",
          message: "No students found in your class",
          data: [],
          pagination: {
            currentPage: validPage,
            totalPages: 0,
            totalCount: 0,
            limit: validLimit,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      }

      const studentIds = studentsInClass.map(student => student._id);
      
      // Filter reservations to only include those from students in this class
      query.user = { $in: studentIds };
      logger.info(`Staff filtering: Showing reservations from ${studentIds.length} students in class ${staffUser.sclass}`);
    }

    // Filter by status
    if (status) {
      query.status = { $regex: `^${status}$`, $options: 'i' };
    }

    // Calculate skip value for pagination
    const skip = (validPage - 1) * validLimit;
    
    let reservations;
    let totalCount;
    
    // Handle search and category filtering
    if ((search && search.trim()) || category) {
      // Build equipment query for search/category filtering
      const equipmentQuery = {};
      
      if (search && search.trim()) {
        if (category) {
          // If category filter is active, only search in name field
          equipmentQuery.name = { $regex: search.trim(), $options: 'i' };
        } else {
          // If no category filter, search in both name and category
          equipmentQuery.$or = [
            { name: { $regex: search.trim(), $options: 'i' } },
            { category: { $regex: search.trim(), $options: 'i' } }
          ];
        }
      }
      
      if (category) {
        equipmentQuery.category = { $regex: `^${category}$`, $options: 'i' };
      }
      
      // Find matching equipment
      const matchingEquipments = await Equipments.find(equipmentQuery).select('_id');
      const equipmentIds = matchingEquipments.map(eq => eq._id);
      
      // If no equipment matches, return empty results
      if (equipmentIds.length === 0) {
        totalCount = 0;
        reservations = [];
      } else {
        // Update query to include equipment filter
        query.equipment = { $in: equipmentIds };
        
        // Get total count for search results
        totalCount = await Reservation.countDocuments(query);
        
        // Fetch paginated reservations
        reservations = await Reservation.find(query)
          .populate('user', 'name email role')
          .populate('equipment', 'name category condition')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validLimit);
      }
    } else {
      // Standard query without search/category
      totalCount = await Reservation.countDocuments(query);
      reservations = await Reservation.find(query)
        .populate('user', 'name email role')
        .populate('equipment', 'name category condition')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    logger.info(`Retrieved ${reservations.length} reservations (page ${validPage} of ${totalPages}, total: ${totalCount})`);

    res.status(200).json({
      status: "success",
      message: "All reservations fetched successfully",
      data: reservations,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit: validLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    logger.error("Error fetching reservations:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reservations",
      data: null,
    });
  }
};

export const returnEquipment = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user.id;
    
    logger.info(`Returning equipment for reservation ${reservationId}`);

    const reservation = await Reservation.findById(reservationId)
      .populate('equipment');

    if (!reservation) {
      logger.warn(`Reservation ${reservationId} not found`);
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
        data: null,
      });
    }

    // Check if user owns the reservation or is admin
    if (reservation.user.toString() !== userId && req.user.role !== 'ADMIN') {
      logger.warn(`User ${userId} unauthorized to return reservation ${reservationId}`);
      return res.status(403).json({
        status: "error",
        message: "Unauthorized to return this equipment",
        data: null,
      });
    }

    // Check if already returned
    if (reservation.status === 'RETURNED') {
      logger.warn(`Reservation ${reservationId} already returned`);
      return res.status(400).json({
        status: "error",
        message: "Equipment already returned",
        data: null,
      });
    }

    // Return equipment to inventory
    const equipment = await Equipments.findById(reservation.equipment._id || reservation.equipment);
    if (equipment) {
      equipment.quantity += reservation.quantity;
      equipment.updatedAt = new Date();
      await equipment.save();
    }

    // Update reservation
    reservation.status = 'RETURNED';
    reservation.returnedAt = new Date();
    await reservation.save();

    logger.info(`Equipment returned successfully for reservation ${reservationId}`);

    res.status(200).json({
      status: "success",
      message: "Equipment returned successfully",
      data: reservation,
    });
  } catch (error) {
    logger.error("Error returning equipment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to return equipment",
      data: null,
    });
  }
};

export const requestEquipment = async (req, res) => {
  try {
    await checkAndProcessExpiredReservations();
    
    const { id } = req.params;
    const { quantity, toDate, fromDate } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request
    
    logger.info(`Requesting equipment with ID: ${id} by user ${userId}`);

    // Validate dates first
    if (!fromDate || !toDate) {
      logger.warn("Missing fromDate or toDate");
      return res.status(400).json({
        status: "error",
        message: "Both fromDate and toDate are required",
        data: null,
      });
    }

    // Parse dates - handle various formats
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    
    const fromDateParsed = fromDateObj.getTime();
    const toDateParsed = toDateObj.getTime();

    // Debug logging
    logger.info(`Original dates - fromDate: "${fromDate}", toDate: "${toDate}"`);
    logger.info(`Parsed timestamps - fromDate: ${fromDateParsed}, toDate: ${toDateParsed}`);
    logger.info(`Date objects - fromDate: ${fromDateObj.toISOString()}, toDate: ${toDateObj.toISOString()}`);

    if (isNaN(fromDateParsed) || isNaN(toDateParsed)) {
      logger.warn(`Invalid date format - fromDate: ${fromDate}, toDate: ${toDate}`);
      return res.status(400).json({
        status: "error",
        message: "Invalid date format. Please use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)",
        data: null,
      });
    }

    // Allow same date (same day rental) but not end date before start date
    if (toDateParsed < fromDateParsed) {
      logger.warn(`End date is before start date - fromDate: ${new Date(fromDateParsed)}, toDate: ${new Date(toDateParsed)}`);
      return res.status(400).json({
        status: "error",
        message: "End date cannot be before start date",
        data: null,
      });
    }
    
    // Optional: Check if reservation period is reasonable (e.g., not more than 30 days)
    const daysDiff = (toDateParsed - fromDateParsed) / (1000 * 60 * 60 * 24);
    if (daysDiff > 30) {
      logger.warn(`Reservation period too long: ${daysDiff} days`);
      return res.status(400).json({
        status: "error",
        message: "Reservation period cannot exceed 30 days",
        data: null,
      });
    }

    if (fromDateParsed < Date.now()) {
      logger.warn(`Start date is in the past`);
      return res.status(400).json({
        status: "error",
        message: "Start date cannot be in the past",
        data: null,
      });
    }

    // Validate quantity
    if (!quantity || quantity < 1) {
      logger.warn("Invalid quantity requested");
      return res.status(400).json({
        status: "error",
        message: "Quantity must be at least 1",
        data: null,
      });
    }

    // Check if equipment exists and has enough quantity
    const equipment = await Equipments.findById(id);
    if (!equipment) {
      logger.warn(`Equipment with ID ${id} not found for request`);
      return res.status(404).json({
        status: "error",
        message: "Equipment not found",
        data: null,
      });
    }

    if (equipment.quantity < quantity) {
      logger.warn(`Equipment with ID ${id} has not enough quantity for request`);
      return res.status(400).json({
        status: "error",
        message: "Equipment has not enough quantity for request",
        data: null,
      });
    }

    // Create reservation as PENDING (requires staff approval)
    const reservation = new Reservation({
      user: userId,
      equipment: id,
      quantity,
      fromDate: fromDateObj,
      toDate: toDateObj,
      status: 'PENDING'
    });
    await reservation.save();

    // Don't subtract quantity yet - wait for staff approval
    // Quantity will be subtracted when staff accepts the reservation

    logger.info(`Equipment requested successfully: ${equipment.name}, Reservation ID: ${reservation._id}`);
    
    res.status(200).json({
      status: "success",
      message: "Equipment requested successfully",
      data: {
        equipment,
        reservation: {
          id: reservation._id,
          fromDate: reservation.fromDate,
          toDate: reservation.toDate,
          quantity: reservation.quantity
        }
      },
    });
  } catch (error) {
    logger.error("Error in request:", error);
    res.status(500).json({
      status: "error",
      message: "Error in request",
      data: null,
    });
  }
};

export const rejectEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Rejecting reservation with ID: ${id}`);

    const reservation = await Reservation.findById(id);
    
    if (!reservation) {
      logger.warn(`Reservation with ID ${id} not found`);
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
        data: null,
      });
    }

    if (reservation.status !== 'PENDING') {
      logger.warn(`Reservation ${id} cannot be rejected (status: ${reservation.status})`);
      return res.status(400).json({
        status: "error",
        message: "Only pending reservations can be rejected",
        data: null,
      });
    }

    // Change status to REJECTED
    reservation.status = 'REJECTED';
    await reservation.save();

    logger.info(`Equipment rejected for reservation ${id}`);

    res.status(200).json({
      status: "success",
      message: "Equipment request rejected",
      data: reservation,
    });
  } catch (error) { 
    logger.error("Error rejecting equipment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to reject equipment",
      data: null,
    });
  }
};

export const acceptEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Accepting reservation with ID: ${id}`);

    const reservation = await Reservation.findById(id)
      .populate('equipment');
    
    if (!reservation) {
      logger.warn(`Reservation with ID ${id} not found`);
      return res.status(404).json({
        status: "error",
        message: "Reservation not found",
        data: null,
      });
    }

    if (reservation.status !== 'PENDING') {
      logger.warn(`Reservation ${id} is not pending (status: ${reservation.status})`);
      return res.status(400).json({
        status: "error",
        message: "Reservation is not pending",
        data: null,
      });
    }

    // Change status to ACTIVE and process the reservation
    reservation.status = 'ACTIVE';
    
    // Deduct quantity from equipment
    const equipment = await Equipments.findById(reservation.equipment._id || reservation.equipment);
    if (equipment) {
      if (equipment.quantity < reservation.quantity) {
        logger.warn(`Not enough quantity available for reservation ${id}`);
        return res.status(400).json({
          status: "error",
          message: "Not enough quantity available",
          data: null,
        });
      }
      equipment.quantity -= reservation.quantity;

      await equipment.save();
    }
    
    await reservation.save();

    logger.info(`Equipment accepted successfully for reservation ${id}`);

    res.status(200).json({
      status: "success",
      message: "Equipment accepted successfully",
      data: reservation,
    });
  } catch (error) { 
    logger.error("Error accepting equipment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to accept equipment",
      data: null,
    });
  }
};
