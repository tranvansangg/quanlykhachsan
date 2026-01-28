import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    favorites: {
      type: [String], // Array of hotel IDs
      default: [],
    },
    address: {
      type: String,
      default: "",
    },
    settings: {
      language: {
        type: String,
        default: "vi",
      },
      defaultCurrency: {
        type: String,
        default: "VND",
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      bookingNotifications: {
        type: Boolean,
        default: true,
      },
      reviewNotifications: {
        type: Boolean,
        default: true,
      },
      priceAlerts: {
        type: Boolean,
        default: false,
      },
      privateProfile: {
        type: Boolean,
        default: false,
      },
      showEmail: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
