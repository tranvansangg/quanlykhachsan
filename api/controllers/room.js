import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

export const createRoom = async (req, res, next) => {
  // Get hotelId from body or params
  const hotelId = req.body.hotelId || req.params.hotelid;

  // Validate required fields
  const { title, price, maxPeople, desc } = req.body;
  if (!hotelId || !title || !price || !maxPeople || !desc) {
    return next(createError(400, "Vui lòng điền tất cả các trường bắt buộc"));
  }

  const newRoom = new Room({
    ...req.body,
    hotelId: hotelId,
  });

  try {
    const savedRoom = await newRoom.save();
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { rooms: savedRoom._id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json(savedRoom);
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};
export const updateRoomAvailability = async (req, res, next) => {
  try {
    await Room.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $push: {
          "roomNumbers.$.unavailableDates": req.body.dates
        },
      }
    );
    res.status(200).json("Room status has been updated.");
  } catch (err) {
    next(err);
  }
};
export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  try {
    await Room.findByIdAndDelete(req.params.id);
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate("hotelId");
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate("hotelId");
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};

export const getRoomsByHotel = async (req, res, next) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId });
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};
