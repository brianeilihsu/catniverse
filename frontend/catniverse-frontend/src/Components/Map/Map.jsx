import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import axios from "axios";
import { feature } from "topojson-client"; // 匯入 topojson-client 的 feature 函數
import "./Map.css";
import topoData from "../../../src/taiwan-townships.json";
import countyBoundaries from "../../../src/countyboundary.json";
import { regionOptions } from "./regionOptions"; // 引入區域資料

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2hlZHlqdWFuYTk5IiwiYSI6ImNtMTRnY2U5ajB4ZzYyanBtMjBrMXd1a3UifQ.OcvE1wSjJs8Z1VpQDM12tg";

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedCounty, setSelectedCounty] = useState(""); // 選擇的縣市
  const [selectedRegion, setSelectedRegion] = useState(null); // 選擇的區域
  const [userLocation, setUserLocation] = useState(null); // 使用者位置狀態
  const [areaName, setAreaName] = useState(""); // 顯示查詢到的區域名稱
  const [cats, setCats] = useState([]); // 保存貓咪的數據
  const [catsImageUrls, setCatsImageUrls] = useState({});

  // 使用 topojson-client 將 topoData 轉換為 geojson
  const twBoundaries = feature(topoData, topoData.objects["TOWN_MOI_1130718"]); // 使用 taiwan-townships.json 來獲取鄉鎮區

  // 取得台灣縣市的邏輯 (使用 countyBoundaries)
  const cities = Object.keys(
    countyBoundaries.features.reduce((acc, feature) => {
      acc[feature.properties.COUNTYNAME] = true;
      return acc;
    }, {})
  );

  // 根據選擇的縣市顯示對應的鄉鎮市區選項
  const towns = selectedCounty ? regionOptions[selectedCounty] || [] : [];

  const handleCountyChange = (e) => {
    const county = e.target.value;
    setSelectedCounty(county);
    setSelectedRegion(null); // 清空選擇的鄉鎮市區
    removeRegionBoundary(); // 移除先前選擇的鄉鎮市區邊界
    drawCountyBoundary(county); // 選擇縣市時繪製邊界
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(Number(e.target.value));
    removeCountyBoundary(); // 當選擇區域時，移除縣市邊界圖層
  };

  // 監聽 selectedCounty 的變化並抓取貓咪數據
  useEffect(() => {
    if (selectedCounty) {
      fetchCatsData();
    }
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedRegion !== null) {
      drawRegionBoundary(selectedRegion);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        zoom: 7,
        center: [120.906189, 23.634318],
        maxBounds: [
          [118.0, 20.0],
          [123.5, 26.5],
        ],
      });

      map.addControl(new mapboxgl.NavigationControl());
      mapRef.current = map;
    }
  });

  useEffect(() => {
    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        zoom: 7,
        center: [120.906189, 23.634318],
        maxBounds: [
          [118.0, 20.0],
          [123.5, 26.5],
        ],
      });

      map.addControl(new mapboxgl.NavigationControl());

      const canvas = map.getCanvas();

      canvas.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
        },
        { passive: true }
      );

      mapRef.current = map;
    }
  }, []);

  useEffect(() => {
    let markers = [];
    if (
      mapRef.current &&
      selectedCounty &&
      cats.length > 0 
    ) {
      console.log("123");
      cats.forEach((cat) => {
        const catImageUrls =
          catsImageUrls[cat.id] && catsImageUrls[cat.id].length > 0
            ? catsImageUrls[cat.id] // 使用图片
            : null;

        if (catImageUrls) {
          const catMarker = document.createElement("div");
          catMarker.style.backgroundImage = `url(${catImageUrls})`;
          catMarker.style.width = "50px";
          catMarker.style.height = "50px";
          catMarker.style.backgroundSize = "cover";
          catMarker.style.zIndex = "10";

          const marker = new mapboxgl.Marker(catMarker)
            .setLngLat([cat.longitude, cat.latitude])
            .addTo(mapRef.current);

          marker.getElement().addEventListener("click", () => {
            setMessage({
              location: `${cat.longitude}, ${cat.latitude}`,
              isStray: cat.isStray ? "是" : "否",
            });
            fetchAddress(cat.longitude, cat.latitude);
          });

          markers.push(marker); // 保存标记
        }
      });

      console.log("当前标记信息: ", markers);
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [selectedCounty, cats, catsImageUrls]);

  // 繪製縣市邊界
  const drawCountyBoundary = (selectedCountyName) => {
    const selectedCountyFeature = countyBoundaries.features.find(
      (feature) => feature.properties.COUNTYNAME === selectedCountyName
    );

    if (mapRef.current && selectedCountyFeature) {
      // 刪除先前的縣市圖層（如果有的話）
      if (mapRef.current.getLayer("selected-county")) {
        mapRef.current.removeLayer("selected-county");
      }
      if (mapRef.current.getSource("selected-county")) {
        mapRef.current.removeSource("selected-county");
      }

      mapRef.current.addSource("selected-county", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [selectedCountyFeature],
        },
      });

      mapRef.current.addLayer({
        id: "selected-county",
        type: "line", // 使用線條代替陰影
        source: "selected-county",
        layout: {},
        paint: {
          "line-color": "#0000FF", // 藍色線條
          "line-width": 3,
        },
      });

      // 讓地圖聚焦到選擇的縣市
      const bounds = new mapboxgl.LngLatBounds();
      selectedCountyFeature.geometry.coordinates[0].forEach((coord) => {
        bounds.extend(coord);
      });
      mapRef.current.fitBounds(bounds, { padding: 20 });
    }
  };

  // 移除縣市邊界圖層
  const removeCountyBoundary = () => {
    if (mapRef.current) {
      if (mapRef.current.getLayer("selected-county")) {
        mapRef.current.removeLayer("selected-county");
      }
      if (mapRef.current.getSource("selected-county")) {
        mapRef.current.removeSource("selected-county");
      }
    }
  };

  const removeRegionBoundary = () => {
    if (mapRef.current) {
      if (mapRef.current.getLayer("selected-region")) {
        mapRef.current.removeLayer("selected-region");
      }
      if (mapRef.current.getSource("selected-region")) {
        mapRef.current.removeSource("selected-region");
      }
    }
  };

  // 繪製鄉鎮市區邊界
  const drawRegionBoundary = (regionIndex) => {
    const selectedFeature = twBoundaries.features[regionIndex];

    if (mapRef.current && selectedFeature) {
      // 刪除先前的區域圖層（如果有的話）
      if (mapRef.current.getLayer("selected-region")) {
        mapRef.current.removeLayer("selected-region");
      }
      if (mapRef.current.getSource("selected-region")) {
        mapRef.current.removeSource("selected-region");
      }

      mapRef.current.addSource("selected-region", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [selectedFeature],
        },
      });

      mapRef.current.addLayer({
        id: "selected-region",
        type: "line",
        source: "selected-region",
        layout: {},
        paint: {
          "line-color": "#FF0000",
          "line-width": 2,
        },
      });

      // 讓地圖聚焦到選擇的區域
      const bounds = new mapboxgl.LngLatBounds();
      selectedFeature.geometry.coordinates[0].forEach((coord) => {
        bounds.extend(coord);
      });
      mapRef.current.fitBounds(bounds, { padding: 20 });
    }
  };

  const fetchCatsData = async () => {
    setCatsImageUrls({});
    try {
      const response = await axios.get(
        `http://140.136.151.71:8787/api/v1/posts/region`,
        {
          params: { city: selectedCounty },
        }
      );
      const posts = response.data.data;
      setCats(posts); // 將返回的貓咪數據存入 cats state
      console.log(posts);

      const imageUrls = {}; // 用來保存每個 post 的圖片

      // 遍歷每個 post
      for (const post of posts) {
        if (post.postImages && post.postImages.length > 0) {
          // 如果該 post 有圖片，處理每張圖片
          const postImagesUrls = [];
          for (const image of post.postImages) {
            const url = await fetchImage(image.downloadUrl); // 獲取圖片 URL
            postImagesUrls.push(url); // 保存每個 post 的圖片 URL
          }
          imageUrls[post.id] = postImagesUrls; // 將該 post 的所有圖片 URL 保存到對應的 post.id 中
        } else {
          console.warn(`Post ${post.id} 沒有圖片`);
        }
      }

      setCatsImageUrls(imageUrls); // 更新圖片 URLs 狀態
    } catch (error) {
      console.error("Error fetching region-based posts: ", error);
    }
  };

  const fetchImage = async (downloadUrl) => {
    try {
      const response = await axios.get(
        `http://140.136.151.71:8787${downloadUrl}`,
        { responseType: "blob" }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleLocateUser = () => {
    if (userLocation && mapRef.current) {
      const map = mapRef.current;
      map.flyTo({
        center: userLocation,
        zoom: 14,
        essential: true,
      });
    } else {
      alert("無法獲取您的位置。請確保已啟用位置服務並允許瀏覽器訪問您的位置。");
    }
  };

  const handleReset = () => {
    setSelectedCounty("");
    setSelectedRegion(null);

    if (mapRef.current) {
      const map = mapRef.current;

      // 移除選中的圖層和數據源
      removeCountyBoundary();
      removeRegionBoundary();

      map.flyTo({
        center: [120.906189, 23.634318],
        zoom: 7,
      });
    }
  };

  return (
    <div>
      <div
        ref={mapContainerRef}
        className="map-container"
        style={{ height: "100vh", width: "100%" }}
      />

      <div className="info-box">
        <h3>貓咪資訊</h3>
        <p>
          <strong>是否為流浪貓:</strong> {cats.isStray || "未知"}
        </p>
        <p>
          <strong>經緯度:</strong> {cats.location || "未知"}
        </p>
        <p>
          <strong>地址:</strong> {cats.address || "地址獲取中..."}
        </p>
      </div>

      {/* 縣市、區域選擇器 */}
      <div className="info-box-select">
        <h3>選擇台灣縣市、區與里</h3>

        <label>選擇縣市</label>
        <select value={selectedCounty} onChange={handleCountyChange}>
          <option value="" disabled>
            請選擇縣市
          </option>
          {cities.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>

        <label>選擇鄉鎮市區</label>
        <select
          value={selectedRegion !== null ? selectedRegion : ""}
          onChange={handleRegionChange}
          disabled={!selectedCounty}
        >
          <option value="" disabled>
            請選擇鄉鎮市區
          </option>
          {towns.map((region, index) => (
            <option key={index} value={region.geometryIndex}>
              {region.name}
            </option>
          ))}
        </select>

        <button onClick={handleReset}>重新選擇</button>
      </div>

      <div className="button-container">
        <button className="locate-button" onClick={handleLocateUser}>
          定位到我
        </button>
      </div>
    </div>
  );
};

export default Map;
