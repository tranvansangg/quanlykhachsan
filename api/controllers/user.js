import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const updateUser = async (req,res,next)=>{
  try {
    let updateData = { ...req.body };
    // If password is provided, hash it
    if (updateData.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(updateData.password, salt);
    } else {
      // If no password provided, don't update it
      delete updateData.password;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
}
export const deleteUser = async (req,res,next)=>{
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
}
export const setUserDisabled = async (req, res, next) => {
  try {
    const { disabled } = req.body;
    let newStatus = disabled;
    if (typeof newStatus === "undefined") {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json("User not found.");
      newStatus = !user.disabled;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { disabled: newStatus },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
}
export const getUser = async (req,res,next)=>{
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
export const getUsers = async (req,res,next)=>{
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Cần nhập mật khẩu cũ và mật khẩu mới" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tìm thấy" });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác" });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Update password
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    res.status(200).json({ message: "Đổi mật khẩu thành công", user: updatedUser });
  } catch (err) {
    next(err);
  }
}

export const updateUserSettings = async (req, res, next) => {
  try {
    const { language, emailNotifications, smsNotifications, pushNotifications, marketingEmails, twoFactorAuth, privateProfile, allowMessagesFromStrangers, defaultCurrency } = req.body;

    const settings = {
      language,
      emailNotifications,
      smsNotifications,
      pushNotifications,
      marketingEmails,
      twoFactorAuth,
      privateProfile,
      allowMessagesFromStrangers,
      defaultCurrency,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { settings } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Người dùng không tìm thấy" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
}