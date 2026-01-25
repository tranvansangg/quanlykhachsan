import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./models/Hotel.js";

dotenv.config();

mongoose.connect(process.env.MONGO).then(async () => {
  try {
    // Delete all existing hotels
    await Hotel.deleteMany({});
    
    // Create sample hotels for each city
    const hotels = [
      {
        name: "Hotel Hanoi Center",
        type: "hotel",
        city: "hanoi",
        address: "123 Le Loi, Hoan Kiem, Hanoi",
        distance: "0.5",
        title: "Luxury Hotel in Hanoi",
        desc: "5-star luxury hotel in the heart of Hanoi",
        cheapestPrice: 150,
        featured: true,
        star: 5,
        photos: ["https://cf.bstatic.com/xdata/images/hotel/max500/425080.jpg?k=e863e52aa0e62eed1f2ab0e6d84c5e3fef30c99da06a6282e76a1c7e04aacc22&o="],
        rooms: []
      },
      {
        name: "Hotel Hanoi Riverside",
        type: "hotel",
        city: "hanoi",
        address: "456 Hang Dao, Hoan Kiem, Hanoi",
        distance: "1.0",
        title: "Riverside Hotel",
        desc: "Beautiful hotel with river views",
        cheapestPrice: 120,
        featured: false,
        star: 4,
        photos: ["https://cf.bstatic.com/xdata/images/hotel/max500/237384.jpg?k=d5f6e5d9e5d5d5d5d5d5d5d5d5d5d5d5d5d5&o="],
        rooms: []
      },
      {
        name: "Hotel HCMC City",
        type: "hotel",
        city: "saigon",
        address: "789 Nguyen Hue, District 1, HCMC",
        distance: "0.8",
        title: "Modern Hotel in Saigon",
        desc: "Modern 5-star hotel in Saigon city",
        cheapestPrice: 180,
        featured: true,
        star: 5,
        photos: ["https://cf.bstatic.com/xdata/images/hotel/max500/431299.jpg?k=e7c8f0d9f7d5d5d5d5d5d5d5d5d5d5d5d5d5&o="],
        rooms: []
      },
      {
        name: "Hotel Da Nang Beach",
        type: "hotel",
        city: "danang",
        address: "321 Vo Nguyen Giap, Da Nang",
        distance: "0.3",
        title: "Beachfront Hotel",
        desc: "Luxury beachfront hotel in Da Nang",
        cheapestPrice: 160,
        featured: true,
        star: 5,
        photos: ["https://cf.bstatic.com/xdata/images/hotel/max500/330733.jpg?k=d5e7f7f5d5d5d5d5d5d5d5d5d5d5d5d5d5d5&o="],
        rooms: []
      },
      {
        name: "Apartment Hanoi",
        type: "apartment",
        city: "hanoi",
        address: "555 Tran Hung Dao, Hanoi",
        distance: "2.0",
        title: "Cozy Apartment",
        desc: "Modern apartment complex",
        cheapestPrice: 80,
        featured: false,
        star: 3,
        photos: ["https://cf.bstatic.com/xdata/images/hotel/max500/224134.jpg?k=d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5&o="],
        rooms: []
      }
    ];
    
    const result = await Hotel.insertMany(hotels);
    console.log("Created:", result.length, "hotels");
    
    // Verify
    const all = await Hotel.find();
    console.log("Hotels created:", all.map(h => ({ name: h.name, city: h.city, featured: h.featured, photos: h.photos?.length || 0 })));
    
    process.exit(0);
  } catch (e) {
    console.log("Error:", e.message);
    process.exit(1);
  }
});
