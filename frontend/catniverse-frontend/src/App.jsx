import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Index from "./Components/Index/Index";
import Introduction from "./Components/Introduction/Introduction";
import Map from "./Components/Map/Map";
import Shop from "./Components/Shop/Shop";
import Profile from "./Components/Profile/Profile";
import ReportCat from "./Components/ReportCat";
import ImageTest from "./Components/ImageTest";
import Show from "./Components/Show";
import UploadEcommerce from "./Components/UploadEcommerce";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/map" element={<Map />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ReportCat" element={<ReportCat />} />
        <Route path="/test" element={<ImageTest />} />
        <Route path="/show" element={<Show />} />
        <Route path="/uploadEcommerce" element={<UploadEcommerce />} />
      </Routes>
    </div>
  );
}

export default App;
