import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

console.log("Testing email configuration:");
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS ? "****" : "NOT SET");

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email connection error:", error.message);
    } else {
        console.log("✅ Email service ready!");
    }
    process.exit(0);
});
