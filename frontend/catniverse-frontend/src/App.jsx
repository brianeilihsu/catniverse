import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Introduction from "./Components/Introduction/Introduction";
import Map from "./Components/Map/Map";
import Shop from "./Components/Shop/Shop";
import Member from "./Components/Member/Member";
import Profile from "./Components/Profile/Profile";
import ReportCat from "./Components/ReportCat";
import ImageTest from "./Components/ImageTest";
import Show from "./Components/Show";
import UploadEcommerce from "./Components/UploadEcommerce";
import Index from "./Components/Index/Index";
import Header from "./Components/Header/Header";

function App() {
  const location = useLocation(); 
  const noHeaderRoutes = ["/login", "/register", "/uploadEcommerce"];
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    fetchData();
  }, []);

  // 登出功能
  const handleLogout = () => {
    localStorage.removeItem("username");  // 清空localStorage中的username
    setUsername("");  // 重置username狀態
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
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/login" element={<Login setUsername={setUsername} />} />
        <Route path="/ReportCat" element={<ReportCat />} />
        <Route path="/test" element={<ImageTest />} />
        <Route path="/show" element={<Show />} />
        <Route path="/uploadEcommerce" element={<UploadEcommerce />} />
      </Routes>
    </div>
  );
}

export default App;
