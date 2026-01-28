import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Lazy initialize transporter - will be created when needed
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email connection error:", error.message);
      } else {
        console.log("✅ Gmail service ready!");
      }
    });
  }
  return transporter;
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    res.status(200).json({ message: "User has been created successfully." });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    if (user.disabled) return next(createError(403, "User is disabled."));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ token, details: { ...otherDetails }, isAdmin });
  } catch (err) {
    next(err);
  }
};

// Forgot Password - Generate and send OTP
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createError(400, "Email is required"));
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "Email not found in our system!"));
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "HotelBook - Mã xác minh đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Đặt Lại Mật Khẩu</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn.</p>
          <p style="font-size: 16px; font-weight: bold;">Mã OTP của bạn là: <span style="color: #667eea; font-size: 24px;">${otp}</span></p>
          <p>Mã này sẽ hết hạn trong 10 phút.</p>
          <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">© 2026 HotelBook. All rights reserved.</p>
        </div>
      `,
    };

    await getTransporter().sendMail(mailOptions);

    res.status(200).json({
      message: "OTP has been sent to your email",
      email: email.replace(/(.{2})(.*)(.{2})/, "$1****$3"), // Mask email for security
    });
  } catch (err) {
    next(err);
  }
};

// Verify OTP
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(createError(400, "Email and OTP are required"));
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return next(createError(400, "OTP not found or expired. Please request a new one."));
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return next(createError(400, "OTP has expired. Please request a new one."));
    }

    // Verify OTP
    if (user.otp !== otp) {
      return next(createError(400, "Invalid OTP"));
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return next(createError(400, "Email, OTP, and new password are required"));
    }

    if (newPassword.length < 6) {
      return next(createError(400, "Password must be at least 6 characters long"));
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    // Verify OTP again
    if (!user.otp || user.otp !== otp) {
      return next(createError(400, "Invalid OTP"));
    }

    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return next(createError(400, "OTP has expired"));
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    next(err);
  }
};
