import Featured from "../../components/featured/Featured";
import FeaturedProperties from "../../components/featuredProperties/FeaturedProperties";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Navbar from "../../components/navbar/Navbar";
import PropertyList from "../../components/propertyList/PropertyList";
import "./home.css";

const Home = () => {
  return (
    <div className="home-wrapper">
      <Navbar />
      <Header />

      {/* Scrolling Banner Section */}
      <section className="marquee-section">
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="marquee-text">✨ Đặt ngay hôm nay & nhận ưu đãi độc quyền lên đến 40% ✨</span>
            <span className="marquee-text">✨ Miễn phí hủy đến 24 giờ trước ngày nhận phòng ✨</span>
            <span className="marquee-text">✨ Hàng ngàn khách sạn & resort tuyệt vời đang chờ bạn ✨</span>
            <span className="marquee-text">✨ Đặt ngay hôm nay & nhận ưu đãi độc quyền lên đến 40% ✨</span>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="home-section featured-section">
        <div className="section-container">
          <h2 className="section-title">Khám Phá Các Thành Phố Hàng Đầu</h2>
          <p className="section-subtitle">Những điểm đến du lịch phổ biến nhất</p>
          <Featured />
        </div>
      </section>

      {/* Property Types Section */}
      <section className="home-section property-section">
        <div className="section-container">
          <h2 className="section-title">Tìm Kiếm Theo Loại Chỗ Ở</h2>
          <p className="section-subtitle">Chọn từ các loại chỗ ở yêu thích của bạn</p>
          <PropertyList />
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="home-section hotels-section">
        <div className="section-container">
          <h2 className="section-title">Khách Sạn Nổi Bật</h2>
          <p className="section-subtitle">Những lựa chọn tốt nhất được lựa chọn dành cho bạn</p>
          <FeaturedProperties />
        </div>
      </section>

      {/* Newsletter Section */}
      <MailList />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
