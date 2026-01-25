import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faTwitter, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import "./footer.css";

const Footer = () => {
  const footerSections = [
    {
      title: "Khám phá",
      items: ["Thành phố", "Khu vực", "Sân bay", "Khách sạn", "Kỳ nghỉ"]
    },
    {
      title: "Loại chỗ ở",
      items: ["Nhà", "Căn hộ", "Resort", "Biệt thự", "Nhà nghỉ"]
    },
    {
      title: "Hỗ trợ",
      items: ["Trung tâm hỗ trợ", "Đối tác", "Bảo an", "Điều khoản dịch vụ", "Chính sách bảo mật"]
    },
    {
      title: "Công ty",
      items: ["Về chúng tôi", "Sự nghiệp", "Phát triển bền vững", "Báo chí", "Nhà đầu tư"]
    }
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-white font-semibold mb-4 text-sm font-display">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          {/* Bottom Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left - Copyright & Links */}
            <div className="text-center md:text-left">
              <p className="text-slate-400 text-sm mb-3">
                © 2026 HotelBook - Tất cả quyền được bảo lưu
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Điều khoản dịch vụ
                </a>
                <span className="text-slate-600">•</span>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
                <span className="text-slate-600">•</span>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Chính sách cookie
                </a>
              </div>
            </div>

            {/* Right - Social Links & Contact */}
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                {[
                  { icon: faFacebook, label: "Facebook" },
                  { icon: faTwitter, label: "Twitter" },
                  { icon: faLinkedin, label: "LinkedIn" },
                  { icon: faGlobe, label: "Website" },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                    aria-label={social.label}
                  >
                    <FontAwesomeIcon icon={social.icon} className="text-sm" />
                  </a>
                ))}
              </div>
              <div className="hidden md:flex flex-col gap-2 text-sm text-slate-400">
                <a href="mailto:contact@hotelbook.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faEnvelope} className="text-primary-700" />
                  contact@hotelbook.com
                </a>
                <a href="tel:+84123456789" className="flex items-center gap-2 hover:text-white transition-colors">
                  <FontAwesomeIcon icon={faPhone} className="text-primary-700" />
                  +84 (123) 456-789
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
