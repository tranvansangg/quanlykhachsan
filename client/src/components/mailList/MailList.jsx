import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./mailList.css";

const MailList = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary-700 to-primary-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Tiết kiệm thời gian, tiết kiệm tiền!
        </h1>
        <p className="text-lg text-primary-100 mb-8">
          Đăng ký để nhận những ưu đãi tốt nhất được gửi trực tiếp đến hộp thư
          của bạn
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubscribe()}
            className="flex-1 max-w-md px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 placeholder-slate-500"
          />
          <button 
            className="px-6 py-3 bg-white hover:bg-slate-100 text-primary-700 font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            onClick={handleSubscribe}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            <span>Đăng ký</span>
          </button>
        </div>
        {subscribed && (
          <div className="mt-4 inline-block px-4 py-2 bg-green-400 text-green-900 rounded-lg font-semibold animate-pulse">
            ✓ Cảm ơn! Hãy kiểm tra email của bạn
          </div>
        )}
      </div>
    </div>
  );
};

export default MailList;