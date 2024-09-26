import { useState, useEffect } from "react";
import Header from "../Header/Header";
import { simplemaps_countrymap_mapdata } from "./mapData";
import TaiwanMapSVG from "../../Image/tw.svg";
import './Map.css';

function Map() {
  const [tooltipContent, setTooltipContent] = useState("");

  // 處理每個區域的動態效果
  const handleMouseOver = (regionId) => {
    const regionData = simplemaps_countrymap_mapdata.state_specific[regionId];
    if (regionData) {
      setTooltipContent(`${regionData.name}`);
    }
  };

  const handleMouseOut = () => {
    setTooltipContent("");
  };

  // 將地圖區域的樣式動態綁定
  const getRegionStyle = (regionId) => {
    const regionData = simplemaps_countrymap_mapdata.state_specific[regionId];
    if (regionData) {
      return {
        fill: regionData.color,
        cursor: "pointer",
      };
    }
    return {};
  };

  return (
    <div>
      <Header />
      <div className="map-container">
        <h2>台灣互動地圖</h2>
        <div style={{ position: "relative" }}>
          <img
            src={TaiwanMapSVG}
            alt="Taiwan Map"
            style={{ width: "100%", height: "auto" }}
            useMap="#taiwan-map"
          />
          {/* 添加互動區域 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 600"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {/* 假設 Changhua 的 path 是以下這段 */}
            <path
              id="TWCHA"
              d="M563.1 480.3l4.2 1.3 2.9 2.5 1.9 4.6 0.7 5.5 3.3 3.9 8.5 2.5 3.2 2.6 2.3 3.6 1.4 2.9 0 2.8 0.9 2.5 3.1 0.5 3.9 2.6 0.1 1 0 2.6-3.1 1.1-0.9 2.1 0.4 2.9-1.4 3.3-1.2 3.9-0.1 4.1-0.8 4.7-0.7 9.7 1.5 4.5 2.6 2.4 2.8 1 4.1 2.1-0.7 2.5-2.8 1.1-1.8 1.7-1.7 1.1-0.7 0.5-8.7-1.7-4.2 0.1-8.7-4.4-14.2-1.6-8.4-3.2-4.8-1.3-5.4-0.3-15.9 1.9-5.5-3.2 0.6-1 1.1-5.1 0.9-2.1 5.1-4.9 1.5-2.1 1.9-5.6 3-5.6 4.2-11.6 1.9-3.3 2.2-2.2 1.8-1.2 1.5-0.8 1.2-1 0.4-2.2 0.9-2 3.7-2.9 0.8-2.2 0.4-7.2 0.7-2 1.9-1.9 8.2-9.5z" // 使用真實的 path
              style={getRegionStyle("TWCHA")}
              onMouseOver={() => handleMouseOver("TWCHA")}
              onMouseOut={handleMouseOut}
            />
            
            {/* 其他區域... */}
          </svg>
        </div>
        {tooltipContent && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "white",
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
