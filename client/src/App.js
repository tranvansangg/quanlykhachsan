import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import ScrollToTop from "./components/scrollToTop/ScrollToTop";
import Home from "./pages/home/Home";
import Hotel from "./pages/hotel/Hotel";
import List from "./pages/list/List";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import Favorites from "./pages/favorites/Favorites";
import Account from "./pages/account/Account";
import Settings from "./pages/settings/Settings";
import Payment from "./pages/payment/Payment";
import MyBookings from "./pages/myBookings/MyBookings";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/hotels" element={<List/>}/>
        <Route path="/hotels/:id" element={<Hotel/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/favorites" element={<Favorites/>}/>
        <Route path="/account" element={<Account/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/payment" element={<Payment/>}/>
        <Route path="/my-bookings" element={<MyBookings/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
