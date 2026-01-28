import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  roomTypes: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      price: Number,
      numberOfBeds: Number,
      bedType: String,
      maxPeople: Number,
    },
  ],
  selectedRooms: {
    type: Map,
    of: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  dates: {
    startDate: Date,
    endDate: Date,
  },
  cardholderName: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "completed"],
    default: "confirmed",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "refunded"],
    default: "completed",
  },
  cancelDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Booking", bookingSchema);
