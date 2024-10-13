import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "croppie/croppie.css";
import Croppie from "croppie";
import "./Upload.css"; 
import backPic from "../../Image/back.png";
import imageCompression from 'browser-image-compression';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import mapboxSdk from '@mapbox/mapbox-sdk';
import mapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
const TOKEN = 'pk.eyJ1Ijoic2hlZHlqdWFuYTk5IiwiYSI6ImNtMTRnY2U5ajB4ZzYyanBtMjBrMXd1a3UifQ.OcvE1wSjJs8Z1VpQDM12tg';

function Upload() {
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    content: "",
    address: "",
  });

  const [imageFiles, setImageFiles] = useState([]); 
  const [imageSrcs, setImageSrcs] = useState([]); 
  const [croppedImages, setCroppedImages] = useState([]); 
  const [croppieInstances, setCroppieInstances] = useState([]); 
  const fileInputRef = useRef(null); 
  const [earStatus, setEarStatus] = useState(null); 
  const [strayCatStatus, setStrayCatStatus] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 25.033, 
    longitude: 121.5654, 
    zoom: 10,
  });

  const [newPlace, setNewPlace] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null); 
  const [selectedLocation, setSelectedLocation] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const geocodingClient = mapboxGeocoding({ accessToken: TOKEN });

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        userId: storedUserId,
      }));
    }
  }, []);

  const formatAddress = (address) => {
    const parts = address.split(", ").map((part) => part.trim()); 

    const [street, number, district, city] = parts;
    setNewAddress(`${city}${district}${street}${number}號`);

    return `${city}${district}${street}${number}號`;
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await geocodingClient
        .reverseGeocode({
          query: [lng, lat],
          limit: 1, 
          language: ["zh"],
        })
        .send();

      const place = response.body.features[0];
      const rawAddress = place?.place_name || "無法取得地址";
      const formattedAddress = formatAddress(rawAddress); 

      setPopupInfo({ lat, lng, address: formattedAddress });
      setSelectedLocation(formattedAddress); 
    } catch (error) {
      console.error("取得地址失敗", error);
      setPopupInfo({ lat, lng, address: "無法取得地址" });
      setSelectedLocation("無法取得地址");
    }
  };

  const handleAddClick = (event) => {
    const { lng, lat } = event.lngLat;
    setNewPlace({ lat, lng });
    fetchAddress(lat, lng); 
  };


  useEffect(() => {
    imageSrcs.forEach((src, index) => {
      const cropContainerRef = document.getElementById(
        `cropContainer-${index}`
      );
      if (cropContainerRef && !croppieInstances[index]) {
        const newCroppie = new Croppie(cropContainerRef, {
          viewport: { width: 250, height: 250, type: "square" },
          boundary: { width: 400, height: 300 },
          enableResize: false,
          enableZoom: true,
          url: src,
        });

        setCroppieInstances((prevInstances) => {
          const updatedInstances = [...prevInstances];
          updatedInstances[index] = newCroppie;
          return updatedInstances;
        });
      }
    });
  }, [imageSrcs, croppieInstances]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const fileReaders = files.map((file, index) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({ index, result: event.target.result });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders)
      .then((results) => {
        setImageFiles(files);
        const srcs = results.map((r) => r.result);
        setImageSrcs(srcs);
      })
      .catch((error) => {
        console.error("圖片讀取失敗：", error);
      });
  };

  const handleCrop = async (index) => {
    if (croppieInstances[index]) {
      const croppedBlob = await croppieInstances[index].result({
        type: "blob", 
        format: "png", 
        quality: 1,
        size: { width: 1000, height: 1000 }, 
      });

      const compressedBlob = await imageCompression(croppedBlob, {
        maxSizeMB: 1,  
        maxWidthOrHeight: 1000, 
        useWebWorker: true,  
      });

      const croppedImageUrl = URL.createObjectURL(compressedBlob);

      setCroppedImages((prevCropped) => {
        const updatedCropped = [...prevCropped];
        updatedCropped[index] = croppedImageUrl; 
        return updatedCropped;
      });
    }
  };

  const handleCancelCrop = (index) => {
    if (croppieInstances[index]) {
      croppieInstances[index].destroy(); 
      const updatedInstances = [...croppieInstances];
      updatedInstances[index] = null;
      setCroppieInstances(updatedInstances);
    }

    setImageSrcs((prevSrcs) => prevSrcs.filter((_, idx) => idx !== index));
    setCroppedImages((prevCropped) =>
      prevCropped.filter((_, idx) => idx !== index)
    );

    setImageFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));

    const updatedFileList = Array.from(fileInputRef.current.files).filter(
      (_, idx) => idx !== index
    );

    const dataTransfer = new DataTransfer();
    updatedFileList.forEach((file) => {
      dataTransfer.items.add(file); 
    });
    fileInputRef.current.files = dataTransfer.files;
  };

  const handleFormSubmitWithImages = async (croppedBlobs) => {
    const updatedFormData = {
      ...formData,
      tipped: earStatus,
      stray: strayCatStatus,
      address: newAddress,
    };
  
    const formDataWithImages = new FormData();
  
    for (const key in updatedFormData) {
      formDataWithImages.append(key, updatedFormData[key]);
    }

    croppedBlobs.forEach((croppedBlob, index) => {
      const imageFile = new File([croppedBlob], `croppedImage${index}.png`, {
        type: "image/png",
      });
      formDataWithImages.append("files", imageFile);
    });
  
    try {
      const response = await axios.post(
        `http://140.136.151.71:8787/api/v1/posts/add`,
        formDataWithImages, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
            'Authorization': `Bearer ${token}`,

          },
        }
      );
      console.log("表單和圖片上傳成功", response.data);
    } catch (error) {
      console.error("上傳失敗：", error);
      throw error;
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const croppedBlobs = await Promise.all(
        croppedImages.map(async (imageUrl) => {
          if (imageUrl) {
            const response = await fetch(imageUrl);
            return await response.blob(); 
          }
          return null;
        })
      );
  
      await handleFormSubmitWithImages(croppedBlobs.filter(blob => blob)); 
  
      alert("表單和圖片一起上傳成功！");
      navigate("/");
    } catch (error) {
      console.error("上傳過程失敗：", error);
      alert("上傳過程失敗");
    }
  };  

  const handleEarStatusChange = (e) => {
    const selectedStatus = e.target.value === "已剪耳" ? true : false;
    setEarStatus(selectedStatus);
  
    if (selectedStatus) {
      setStrayCatStatus(true);
    } else {
      setStrayCatStatus(null);
    }
  };
  
  const handleStrayCatStatusChange = (e) => {
    setStrayCatStatus(e.target.value === "流浪貓" ? true : false);
  };

  return (
    <div className="content">
    <br />
    <main>
      <form
        className="container"
        encType="multipart/form-data"
        method="post"
        id="formBox"
        name="form"
        onSubmit={handleSubmit}
      >
        <div className="backLogo">
          <Link to={`/profile/${userId}`} className="back-container">
            <button className="back-btn">
              <img className="backPic" src={backPic} alt="back" />
            </button>
            <p>Back</p>
          </Link>
        </div>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="標題"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <textarea
          id="content"
          name="content"
          placeholder="貼文內容"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          required
        />

      <ReactMapGL
        mapboxAccessToken={TOKEN}
        initialViewState={viewport}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        localIdeographFontFamily="'sans-serif'"
        onDblClick={handleAddClick} // 綁定雙擊事件
        onMove={(event) => setViewport(event.viewState)} // 更新地圖狀態
        style={{ width: "100%", height: "400px" }}
      >
        {newPlace && (
          <Marker
            latitude={newPlace.lat}
            longitude={newPlace.lng}
            draggable // 允許拖動
            onDragEnd={(event) => {
              const { lat, lng } = event.lngLat;
              setNewPlace({ lat, lng });
              fetchAddress(lat, lng); // 拖動後重新取得地址
            }}
          />
        )}

        {popupInfo && (
          <Popup
            latitude={popupInfo.lat}
            longitude={popupInfo.lng}
            anchor="top"
            onClose={() => setPopupInfo(null)}
          >
            <div>{popupInfo.address}</div> 
          </Popup>
        )}

        <NavigationControl position="bottom-right" />
      </ReactMapGL>

      <div className="selected-location">
        <p>選擇的地點: {selectedLocation}</p>
      </div>

        <div className="checkbox-section">
          <label className="checkbox">
            <input
              type="radio"
              name="earStatus"
              value="已剪耳"
              checked={earStatus === true}
              onChange={handleEarStatusChange}
            />
            已剪耳
          </label>
          <label className="checkbox">
            <input
              type="radio"
              name="earStatus"
              value="未剪耳"
              checked={earStatus === false}
              onChange={handleEarStatusChange}
            />
            未剪耳
          </label>
        </div>

        {earStatus === false && (
          <div className="checkbox-section">
            <label className="checkbox">
              <input
                type="radio"
                name="strayCatStatus"
                value="流浪貓"
                checked={strayCatStatus === true}
                onChange={handleStrayCatStatusChange}
              />
              流浪貓
            </label>
            <label className="checkbox">
              <input
                type="radio"
                name="strayCatStatus"
                value="非流浪貓"
                checked={strayCatStatus === false}
                onChange={handleStrayCatStatusChange}
              />
              非流浪貓
            </label>
          </div>
        )}

        <input
          type="file"
          id="chooseImage"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          ref={fileInputRef}
        />
        {imageSrcs.map((src, index) => (
          <div key={index} className="image-crop-container">
            <div className="image-crop-section">
              <div
                id={`cropContainer-${index}`}
                style={{ height: "300px", width: "400px" }}
              ></div>

              <div className="justify-btn">
                <button
                  id={`crop_img_${index}`}
                  className="btn-info"
                  type="button"
                  onClick={() => handleCrop(index)}
                >
                  <i className="fa fa-scissors"></i> 裁剪圖片
                </button>
                <button
                  className="btn-danger"
                  type="button"
                  onClick={() => handleCancelCrop(index)}
                >
                  取消圖片
                </button>
              </div>
            </div>

            {croppedImages[index] && (
              <div className="image-preview-section">
                <h3 className="Hthree">裁剪後的圖片預覽：</h3>
                <img
                  src={croppedImages[index]}
                  alt={`Cropped Preview ${index}`}
                  style={{ width: "250px" }}
                  loading="lazy"
                />
              </div>
            )}
          </div>
        ))}

        <button className="submit-btn" type="submit">
          Post
        </button>
      </form>
    </main>
  </div>
  );
}

export default Upload;
