import Equipments from '../models/Equipments.js';
import Reservation from '../models/Reservation.js';
import logger from '../config/logger.js';

/**
 * Automatically return equipment for expired reservations
 * This function checks for active reservations that have passed their toDate
 * and returns the equipment to inventory
 * Called on each API request instead of using cron
 */
export const checkAndProcessExpiredReservations = async () => {
  try {
    const now = new Date();
    
    // Find all active reservations that have passed their return date (not PENDING or already RETURNED)
    const expiredReservations = await Reservation.find({
      status: 'ACTIVE',
      toDate: { $lte: now }
    }).populate('equipment');

    if (expiredReservations.length === 0) {
      return; // No expired reservations, return silently
    }

    logger.info(`Processing ${expiredReservations.length} expired reservations`);

    // Process each expired reservation
    for (const reservation of expiredReservations) {
      try {
        const equipment = await Equipments.findById(reservation.equipment._id || reservation.equipment);
        
        if (!equipment) {
          logger.warn(`Equipment not found for reservation ${reservation._id}`);
          reservation.status = 'RETURNED';
          reservation.returnedAt = now;
          await reservation.save();
          continue;
        }

        // Return the equipment quantity to inventory
        equipment.quantity += reservation.quantity;
        equipment.updatedAt = now;
        await equipment.save();

        // Mark reservation as returned
        reservation.status = 'RETURNED';
        reservation.returnedAt = now;
        await reservation.save();

        logger.info(`Automatically returned ${reservation.quantity} ${equipment.name} for reservation ${reservation._id}`);
      } catch (err) {
        logger.error(`Error processing reservation ${reservation._id}:`, err);
      }
    }

    logger.info('Completed processing expired reservations');
  } catch (error) {
    logger.error('Error in checkAndProcessExpiredReservations:', error);
  }
};


/**
 * Get reservations for a user
 */
export const getUserReservations = async (userId) => {
  try {
    const reservations = await Reservation.find({ user: userId })
      .populate('equipment', 'name category condition')
      .sort({ createdAt: -1 });
    
    return reservations;
  } catch (error) {
    logger.error('Error fetching user reservations:', error);
    throw error;
  }
};

