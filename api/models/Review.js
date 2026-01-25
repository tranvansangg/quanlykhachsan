import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userCountry: {
      type: String,
      default: "Unknown",
    },
    verified: {
      type: Boolean,
      default: false, // true nếu user đã lưu trú thực tế
    },
    // Các tiêu chí đánh giá
    ratings: {
      staff: { type: Number, min: 1, max: 10, required: true },
      facilities: { type: Number, min: 1, max: 10, required: true },
      cleanliness: { type: Number, min: 1, max: 10, required: true },
      comfort: { type: Number, min: 1, max: 10, required: true },
      valueForMoney: { type: Number, min: 1, max: 10, required: true },
      location: { type: Number, min: 1, max: 10, required: true },
    },
    // Điểm tổng (trung bình cộng của 6 tiêu chí)
    overallRating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    comment: {
      type: String,
      required: true,
    },
    positivePoints: [String], // VD: ["Nhân viên thân thiện", "Phòng sạch sẽ", "WiFi nhanh"]
    negativePoints: [String], // VD: ["Tầm nhìn kém", "Tiếng ồn"]
    visitDate: {
      type: Date,
    },
    helpful: {
      type: Number,
      default: 0, // Số người bấm "Hữu ích"
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);
