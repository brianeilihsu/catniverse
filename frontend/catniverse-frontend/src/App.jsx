import { useState } from "react";
import {
  Routes, 
  Route 
} from 'react-router-dom'
import "./App.css";
import Login from "./Components/Login";
import ReportCat from "./Components/ReportCat";
import ImageTest from "./Components/ImageTest";
import Show from "./Components/Show";
import UploadEcommerce from "./Components/UploadEcommerce"

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>App.jsx running properly</h1>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/ReportCat" element={<ReportCat/>}/>
          <Route path="/test" element={<ImageTest/>}/>
          <Route path="/show" element={<Show/>}/>
          <Route path="/uploadEcommerce" element={<UploadEcommerce/>}/>
        </Routes>
    </div>
  );
}

export default App;
