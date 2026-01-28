import Review from "../models/Review.js";

// Sample review data
const sampleReviews = [
  {
    userId: "user123",
    hotelId: "hotel_001", // Replace with actual hotel ID
    rating: 9,
    comment:
      "Khách sạn tuyệt vời! Phòng sạch sẽ, nhân viên thân thiện và phục vụ rất tốt. Vị trí ngay trung tâm thành phố, tiện lợi cho việc đi lại. Chắc chắn sẽ quay lại.",
    verified: true,
    userName: "Nguyễn Văn A",
    userCountry: "Vietnam",
    positivePoints: [
      "Phòng rộng rãi và sạch sẽ",
      "Nhân viên lịch sự và hỗ trợ",
      "Vị trí tuyệt vời",
      "WiFi nhanh",
    ],
    negativePoints: [],
    ratings: {
      staff: 9,
      facilities: 8,
      cleanliness: 10,
      comfort: 9,
      valueForMoney: 8,
      location: 10,
    },
    createdAt: new Date("2025-12-15"),
    updatedAt: new Date("2025-12-15"),
  },
  {
    userId: "user456",
    hotelId: "hotel_001",
    rating: 7,
    comment:
      "Khách sạn khá tốt nhưng giá cũi hơi cao so với dịch vụ. Phòng đẹp, tuy nhiên tiếng ồn từ đường phố khá lớn vào buổi tối. Bữa sáng không có gì đặc biệt.",
    verified: true,
    userName: "Trần Thị B",
    userCountry: "Vietnam",
    positivePoints: [
      "Phòng thoải mái",
      "Lễ tân hỗ trợ tốt",
      "Gần chợ Bến Thành",
    ],
    negativePoints: ["Giá hơi cao", "Tiếng ồn đường phố", "Bữa sáng đơn giản"],
    ratings: {
      staff: 8,
      facilities: 7,
      cleanliness: 8,
      comfort: 7,
      valueForMoney: 6,
      location: 7,
    },
    createdAt: new Date("2025-12-10"),
    updatedAt: new Date("2025-12-10"),
  },
  {
    userId: "user789",
    hotelId: "hotel_001",
    rating: 8,
    comment:
      "Trải nghiệm lưu trú tuyệt vời! Tất cả mọi thứ đều hoàn hảo từ khi check-in đến check-out. Nhân viên đặc biệt khiến kỳ nghỉ của tôi thêm phần đáng nhớ. Giá cả hợp lý so với chất lượng.",
    verified: true,
    userName: "Lê Minh C",
    userCountry: "United States",
    positivePoints: [
      "Quản lý sạch sẽ tuyệt vời",
      "Nhân viên chuyên nghiệp",
      "Tiện nghi hiện đại",
      "Giá hợp lý",
    ],
    negativePoints: [],
    ratings: {
      staff: 9,
      facilities: 9,
      cleanliness: 10,
      comfort: 8,
      valueForMoney: 8,
      location: 8,
    },
    createdAt: new Date("2025-12-05"),
    updatedAt: new Date("2025-12-05"),
  },
  {
    userId: "user321",
    hotelId: "hotel_001",
    rating: 6,
    comment:
      "Khách sạn trung bình. Phòng nhỏ hơn mong đợi, nhưng sạch sẽ. Nhân viên lễ tân hơi lạnh lùng. Thêm một số tiện ích sẽ làm cho nơi đây tốt hơn.",
    verified: true,
    userName: "Phạm Đức D",
    userCountry: "Thailand",
    positivePoints: ["Vị trí tốt", "Phòng sạch"],
    negativePoints: [
      "Phòng nhỏ",
      "Nhân viên không thân thiện",
      "Tiện nghi cơ bản",
    ],
    ratings: {
      staff: 5,
      facilities: 6,
      cleanliness: 7,
      comfort: 6,
      valueForMoney: 6,
      location: 7,
    },
    createdAt: new Date("2025-11-28"),
    updatedAt: new Date("2025-11-28"),
  },
  {
    userId: "user654",
    hotelId: "hotel_001",
    rating: 10,
    comment:
      "Tuyệt vời! Đây là lần đầu tiên tôi ở khách sạn này và tôi vô cùng hài lòng. Mọi chi tiết đều được chăm sóc cẩn thận. Sẽ giới thiệu cho bạn bè!",
    verified: true,
    userName: "Hoàng Anh E",
    userCountry: "Vietnam",
    positivePoints: [
      "Hoàn hảo trong mọi khía cạnh",
      "Dịch vụ xuất sắc",
      "Môi trường thoải mái",
      "Giá trị tuyệt vời",
    ],
    negativePoints: [],
    ratings: {
      staff: 10,
      facilities: 10,
      cleanliness: 10,
      comfort: 10,
      valueForMoney: 10,
      location: 9,
    },
    createdAt: new Date("2025-11-20"),
    updatedAt: new Date("2025-11-20"),
  },
];

// Seed function
export const seedReviews = async () => {
  try {
    // Clear existing reviews (optional)
    // await Review.deleteMany({});

    // Insert sample data
    const inserted = await Review.insertMany(sampleReviews);
    console.log(`✅ Inserted ${inserted.length} sample reviews`);
    return inserted;
  } catch (err) {
    console.error("❌ Error seeding reviews:", err);
    throw err;
  }
};

// Export for use in other files
export default sampleReviews;
