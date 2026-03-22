const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Canteen name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Canteen name cannot exceed 100 characters']
    },
    location: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Canteen', canteenSchema);
