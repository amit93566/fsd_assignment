import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipments',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RETURNED', 'OVERDUE', 'PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'ACTIVE'
  },
  returnedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
reservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
reservationSchema.index({ user: 1 });
reservationSchema.index({ equipment: 1 });
reservationSchema.index({ toDate: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ user: 1, status: 1 });

export default mongoose.model('Reservation', reservationSchema);

