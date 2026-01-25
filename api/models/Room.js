import mongoose from "mongoose";
const RoomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    maxPeople: {
      type: Number,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    // Bed information
    bedType: {
      type: String,
      enum: ['Single', 'Double', 'Twin', 'Queen', 'King', 'Bunk'],
      default: 'Double',
    },
    numberOfBeds: {
      type: Number,
      default: 1,
    },
    // Guest information
    adults: {
      type: Number,
      default: 2,
    },
    children: {
      type: Number,
      default: 0,
    },
    photos: [String], // Base64 encoded images
    roomNumbers: [{ number: Number, unavailableDates: { type: [Date] } }],
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);
