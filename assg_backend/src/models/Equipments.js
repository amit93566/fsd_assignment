import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    condition: {
        type: String, enum: ["Excellent", "Good", "Fair", "Damaged"],
        default: "Good",
    },
    quantity: { type: Number, required: true, default: 0 },
    availability: { type: Boolean, default: true },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


export default mongoose.model('Equipments', equipmentSchema);
