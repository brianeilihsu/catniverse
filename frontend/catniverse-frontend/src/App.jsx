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
import ReportCat from "./Components/ReportCat";
import ImageTest from "./Components/ImageTest";
import Show from "./Components/Show";
import UploadEcommerce from "./Components/Shop/UploadEcommerce";
import Cart from "./Components/Shop/Cart";
import Order from "./Components/Shop/Order";
import Index from "./Components/Index/Index";
import Header from "./Components/Header/Header";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const noHeaderRoutes = ["/login", "/register", "/map"];
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const isLoggingOut = useRef(false);

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
    if (!username && isLoggingOut.current) {
      navigate("/");
      isLoggingOut.current = false;
    }
  }, [username, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setUsername("");
    setUserid("");
    isLoggingOut.current = true;
    navigate("/");
  };

  // 用于区分刷新与关闭页面
  useEffect(() => {
    let isPageClosing = true; // 标记是否正在关闭页面

    const markPageReload = () => {
      // 标记页面加载，用于区分刷新与关闭
      sessionStorage.setItem("isPageReload", "true");
    };

    const handleBeforeUnload = (event) => {
      if (!sessionStorage.getItem("isPageReload")) {
        localStorage.clear(); // 页面关闭时清除 localStorage
      }
      // 显示默认的关闭提示（可选）
      event.preventDefault();
      event.returnValue = "";
    };

    const handleUnload = () => {
      if (isPageClosing) {
        sessionStorage.removeItem("isPageReload"); // 页面关闭时移除标记
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        isPageClosing = true; // 页面即将不可见，可能正在关闭
      } else {
        isPageClosing = false; // 页面重新可见，用户没有关闭页面
      }
    };

    // 初始化页面加载时标记
    markPageReload();

    // 监听页面关闭和刷新
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
        <Route path="/ReportCat" element={<ReportCat />} />
        <Route path="/test" element={<ImageTest />} />
        <Route path="/show" element={<Show />} />
        <Route path="/uploadEcommerce" element={<UploadEcommerce />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
      </Routes>
    </div>
  );
}

export default App;
