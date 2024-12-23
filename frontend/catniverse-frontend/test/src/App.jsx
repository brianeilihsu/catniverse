import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Introduction from "./Components/Introduction/Introduction";
import Map from "./Components/Map/Map";
import Shop from "./Components/Shop/Shop";
import Upload from "./Components/Upload/Upload";
import Member from "./Components/Member/Member";
import Profile from "./Components/Profile/Profile";
import UploadEcommerce from "./Components/Shop/UploadEcommerce";
import Cart from "./Components/Shop/Cart";
import Order from "./Components/Shop/Order";
import Index from "./Components/Index/Index";
import Header from "./Components/Header/Header";
import Chart from "./Components/Chart/Chart";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [noHeaderRoutes, setNoHeaderRoutes] = useState(["/login", "/register"]);
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const isLoggingOut = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("userId");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedUserId) {
      setUserid(storedUserId);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!username && isLoggingOut.current) {
      navigate("/");
      isLoggingOut.current = false;
    }
  }, [username, navigate]);

  useEffect(() => {
    setNoHeaderRoutes(isMobile ? ["/login", "/register"] : ["/login", "/register", "/chart"]);
  }, [isMobile]);

  const handleLogout = () => {
    localStorage.clear();
    setUsername("");
    setUserid("");
    isLoggingOut.current = true;
    navigate("/");
  };

  return (
    <div>
      {!noHeaderRoutes.includes(location.pathname) && (
        <Header user={username} onLogout={handleLogout} />
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/map" element={<Map />} />
        <Route path="/member" element={<Member />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/login" element={<Login setUsername={setUsername} />} />
        <Route path="/uploadEcommerce" element={<UploadEcommerce />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/chart" element={<Chart/>} />
      </Routes>
    </div>
  );
}

export default App;
