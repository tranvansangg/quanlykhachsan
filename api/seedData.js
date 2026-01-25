import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./models/Hotel.js";
import Room from "./models/Room.js";
import User from "./models/User.js";
import Review from "./models/Review.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    // Create sample users
    const users = await User.insertMany([
      {
        username: "user1",
        email: "user1@example.com",
        country: "Vietnam",
        city: "Hanoi",
        phone: "0912345678",
        password: bcrypt.hashSync("password123", bcrypt.genSaltSync(10)),
        isAdmin: false,
        disabled: false,
      },
      {
        username: "user2",
        email: "user2@example.com",
        country: "Vietnam",
        city: "Ho Chi Minh",
        phone: "0912345679",
        password: bcrypt.hashSync("password123", bcrypt.genSaltSync(10)),
        isAdmin: false,
        disabled: false,
      },
    ]);
    console.log(`Created ${users.length} users`);

    // Create sample hotels
    const hotel1 = await Hotel.create({
      name: "Luxury Hotel Hanoi",
      type: "hotel",
      city: "Hanoi",
      address: "123 Main Street, Hanoi",
      distance: "2km from city center",
      photos: ["https://via.placeholder.com/300"],
      title: "Best Luxury Hotel",
      desc: "Experience luxury at its finest",
      rating: 4.5,
      cheapestPrice: 150,
      featured: true,
      rooms: [],
    });

    const hotel2 = await Hotel.create({
      name: "Budget Hotel Ho Chi Minh",
      type: "hotel",
      city: "Ho Chi Minh",
      address: "456 Beach Road, HCM",
      distance: "1km from beach",
      photos: ["https://via.placeholder.com/300"],
      title: "Best Budget Hotel",
      desc: "Affordable and comfortable stay",
      rating: 4.0,
      cheapestPrice: 50,
      featured: false,
      rooms: [],
    });

    console.log(`Created ${2} hotels`);

    // Create sample rooms
    const room1 = await Room.create({
      title: "Deluxe Room",
      price: 150,
      maxPeople: 2,
      desc: "Spacious deluxe room with modern amenities",
      roomNumbers: [{ number: 101 }, { number: 102 }, { number: 103 }],
      hotelId: hotel1._id,
      photos: ["https://via.placeholder.com/300"],
      bedType: "King",
      numberOfBeds: 1,
      adults: 2,
      children: 0,
    });

    const room2 = await Room.create({
      title: "Standard Room",
      price: 80,
      maxPeople: 2,
      desc: "Comfortable standard room",
      roomNumbers: [{ number: 201 }, { number: 202 }],
      hotelId: hotel1._id,
      photos: ["https://via.placeholder.com/300"],
      bedType: "Double",
      numberOfBeds: 1,
      adults: 2,
      children: 0,
    });

    const room3 = await Room.create({
      title: "Budget Room",
      price: 50,
      maxPeople: 1,
      desc: "Compact budget room",
      roomNumbers: [{ number: 301 }, { number: 302 }, { number: 303 }],
      hotelId: hotel2._id,
      photos: ["https://via.placeholder.com/300"],
      bedType: "Single",
      numberOfBeds: 1,
      adults: 1,
      children: 0,
    });

    console.log(`Created ${3} rooms`);

    // Add rooms to hotels
    await Hotel.findByIdAndUpdate(
      hotel1._id,
      { rooms: [room1._id, room2._id] },
      { new: true }
    );

    await Hotel.findByIdAndUpdate(
      hotel2._id,
      { rooms: [room3._id] },
      { new: true }
    );

    console.log("Added rooms to hotels");

    // Create sample reviews
    const review1 = await Review.create({
      hotelId: hotel1._id,
      userId: users[0]._id,
      userName: "John Doe",
      userCountry: "Vietnam",
      verified: true,
      ratings: {
        staff: 5,
        facilities: 4,
        cleanliness: 5,
        comfort: 4,
        valueForMoney: 4,
        location: 5,
      },
      overallRating: 4.5,
      comment: "Amazing hotel with excellent service!",
      positivePoints: ["Great location", "Friendly staff", "Clean rooms"],
      negativePoints: ["A bit pricey"],
      visitDate: new Date("2024-01-15"),
    });

    const review2 = await Review.create({
      hotelId: hotel2._id,
      userId: users[1]._id,
      userName: "Jane Smith",
      userCountry: "Vietnam",
      verified: true,
      ratings: {
        staff: 4,
        facilities: 3,
        cleanliness: 4,
        comfort: 3,
        valueForMoney: 5,
        location: 4,
      },
      overallRating: 3.8,
      comment: "Good value for money, nice stay!",
      positivePoints: ["Affordable", "Good location", "Helpful staff"],
      negativePoints: ["Limited facilities"],
      visitDate: new Date("2024-01-10"),
    });

    console.log(`Created ${2} reviews`);

    // Add reviews to hotel
    await Hotel.findByIdAndUpdate(
      hotel1._id,
      { $push: { reviews: review1._id } },
      { new: true }
    );

    await Hotel.findByIdAndUpdate(
      hotel2._id,
      { $push: { reviews: review2._id } },
      { new: true }
    );

    console.log("✅ Sample data seeded successfully!");
    console.log(`
Summary:
- ${users.length} users
- ${2} hotels
- ${3} rooms
- ${2} reviews
    `);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
