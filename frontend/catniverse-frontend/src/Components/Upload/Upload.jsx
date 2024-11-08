import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import "croppie/croppie.css";
import Croppie from "croppie";
import "./Upload.css";
import backPic from "../../Image/back.png";
import debounce from "lodash.debounce";
import imageCompression from "browser-image-compression";
import ReactMapGL, { Marker, NavigationControl, Popup } from "react-map-gl";
import mapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import piexif from "piexifjs";
const TOKEN =
  "pk.eyJ1Ijoic2hlZHlqdWFuYTk5IiwiYSI6ImNtMTRnY2U5ajB4ZzYyanBtMjBrMXd1a3UifQ.OcvE1wSjJs8Z1VpQDM12tg";

function Upload() {
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    content: "",
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

  const [newCity, setNewCity] = useState(null);
  const [newDistrict, setNewDistrict] = useState(null);
  const [newStreet, setNewStreet] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const latRef = useRef(null);
  const lngRef = useRef(null);
  const navigate = useNavigate();
  const geocodingClient = mapboxGeocoding({ accessToken: TOKEN });

  const [exifData, setExifData] = useState([]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        userId: storedUserId,
      }));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatAddress = (address) => {
    if (address.includes(",") && address.trim().endsWith("台湾")) {
      const firstSpaceIndex = address.indexOf(" ");

      if (
        firstSpaceIndex !== -1 &&
        /^[\d-]+$/.test(address.slice(0, firstSpaceIndex))
      ) {
        address = address.slice(firstSpaceIndex + 1).trim();
      }

      let parts = address.split(", ").map((part) => part.trim());

      parts = parts.filter(
        (part) => !part.includes("台湾") && !/^\d+$/.test(part)
      );
      console.log(parts);

      if (parts.length >= 3) {
        const street = parts[0];
        const district = parts[1];
        const city = parts[2];

        const formattedAddress = `${city}${district}${street}`;

        setNewStreet(street);
        setNewDistrict(district);
        setNewCity(city);
        setNewAddress(formattedAddress);

        return formattedAddress;
      } else {
        console.log("無法解析地址");
        return address;
      }
    } else if (address.startsWith("台湾")) {
      address = address.replace("台湾", "").replace(/\d+/g, "");
      let parts = address.match(/(.*市)(.*區)?(.*)/);

      if (parts) {
        const street = parts[3];
        const district = parts[2];
        const city = parts[1];

        const formattedAddress = `${city}${district}${street}`;

        setNewStreet(street);
        setNewDistrict(district);
        setNewCity(city);
        setNewAddress(formattedAddress);

        return formattedAddress;
      } else {
        console.log("無法解析地址");
        return address;
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const closeButton = document.querySelector(
        ".mapboxgl-popup-close-button"
      );
      if (closeButton) {
        closeButton.removeAttribute("aria-hidden");
        closeButton.setAttribute("inert", "true");
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

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

      // 使用格式化的地址資訊
      const formattedAddress = formatAddress(rawAddress);

      latRef.current = lat;
      lngRef.current = lng;
      //alert("new: " + latRef.current + " " + lngRef.current);
      setPopupInfo({ lat, lng, address: formattedAddress });
      setSelectedLocation(formattedAddress);
      console.log(`解析後的地址: ${formattedAddress}`);
    } catch (error) {
      console.error("取得地址失敗", error);
      setPopupInfo({ lat, lng, address: "無法取得地址" });
      setSelectedLocation("無法取得地址");
    }
  };

  const debouncedFetchAddress = debounce(fetchAddress, 500);

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
          // 在圖片讀取完成後，提取 EXIF 資訊
          const result = event.target.result;
          let exifObj;

          try {
            exifObj = piexif.load(result); // 提取 EXIF 資訊

            // 只提取 GPS 信息
            const gpsData = exifObj["GPS"];

            if (Object.keys(gpsData).length === 0) {
              console.log(`圖片 ${index + 1} 沒有 GPS 資訊`);
            } else {
              // 解析 GPS 資訊並轉換為小數格式
              const lat = convertDMSToDecimal(
                gpsData[piexif.GPSIFD.GPSLatitude],
                gpsData[piexif.GPSIFD.GPSLatitudeRef]
              );
              const lng = convertDMSToDecimal(
                gpsData[piexif.GPSIFD.GPSLongitude],
                gpsData[piexif.GPSIFD.GPSLongitudeRef]
              );

              // 打印轉換後的 GPS 資訊
              console.log(`圖片 ${index + 1} 的 GPS 資訊: ${lat}, ${lng}`);
              if (!isNaN(lat) && !isNaN(lng)) {
                // 更新地圖視角到該 GPS 位置
                setViewport((prevViewport) => ({
                  ...prevViewport,
                  latitude: lat,
                  longitude: lng,
                  zoom: 15,
                }));

                // 在地圖上添加標記
                setNewPlace({ lat, lng });
                // 進行反向地理編碼以獲取地址
                fetchAddress(lat, lng);
              } else {
                console.log(
                  `Invalid GPS coordinates for image ${
                    index + 1
                  }: lat=${lat}, lng=${lng}`
                );
              }
            }
          } catch (error) {
            console.log(
              `圖片 ${index + 1} 的 GPS 資訊提取失敗: ${error.message}`
            );
          }

          // 將 EXIF 資訊存入狀態中
          setExifData((prevExifData) => [
            ...prevExifData,
            { index, exif: exifObj },
          ]);

          resolve({ index, result });
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

  // Helper function to convert DMS to Decimal format
  function convertDMSToDecimal(dmsArray, ref) {
    if (!dmsArray || dmsArray.length < 3) {
      return NaN;
    }

    const degrees = dmsArray[0][0] / dmsArray[0][1];
    const minutes = dmsArray[1][0] / dmsArray[1][1];
    const seconds = dmsArray[2][0] / dmsArray[2][1];

    let decimal = degrees + minutes / 60 + seconds / 3600;

    // 將南緯或西經轉為負值
    if (ref === "S" || ref === "W") {
      decimal = -decimal;
    }

    return parseFloat(decimal.toFixed(15)); // 保留兩位小數
  }

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

      updateImages(index, croppedImageUrl);
    }
  };

  const updateImages = (index, croppedImageUrl) => {
    setCroppedImages((prevCropped) => {
      const updatedCropped = [...prevCropped];
      updatedCropped[index] = croppedImageUrl;
      return updatedCropped;
    });
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
    setSelectedLocation("");
    setPopupInfo(null);
    setNewPlace(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!newCity || !newDistrict) {
      alert("請選擇有效的城市和區域位置。");
      return;
    }

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

      const formDataWithImages = new FormData();
      formDataWithImages.append("title", formData.title);
      formDataWithImages.append("content", formData.content);
      formDataWithImages.append("stray", strayCatStatus);
      formDataWithImages.append("tipped", earStatus);
      formDataWithImages.append("city", newCity);
      formDataWithImages.append("district", newDistrict);
      formDataWithImages.append("street", newStreet || "");

      if (latRef.current && lngRef.current) {
        formDataWithImages.append("latitude", parseFloat(latRef.current));
        formDataWithImages.append("longitude", parseFloat(lngRef.current));
      }

      croppedBlobs.forEach((croppedBlob, index) => {
        const imageFile = new File([croppedBlob], `croppedImage${index}.png`, {
          type: "image/png",
        });
        formDataWithImages.append("files", imageFile);
      });

      const response = await axios.post(
        "http://140.136.151.71:8787/api/v1/posts/add",
        formDataWithImages,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("With image", response.data.data);
      //await handleFormSubmitWithImages(croppedBlobs.filter(blob => blob));

      setIsLoading(false);
      navigate("/");
    } catch (error) {
      console.error(
        "上傳過程失敗：",
        error.response ? error.response.data : error.message
      );
      alert(error.response?.data?.message || "上傳過程失敗");
    } finally {
      setIsLoading(false);
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
    <>
      {isLoading && (
        <div className="loading-overlay">
          <ClipLoader color={"#666"} size={50} />
        </div>
      )}
      {isMobile ? (
        <div className="mobile-content">
          <br />
          <main>
            <form
              className="mobile-upload-container"
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
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
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
                onDblClick={handleAddClick}
                onMove={(event) => setViewport(event.viewState)}
                style={{ width: "100%", height: "400px" }}
              >
                {newPlace && (
                  <Marker
                    latitude={newPlace.lat}
                    longitude={newPlace.lng}
                    draggable
                    onDragEnd={(event) => {
                      const { lat, lng } = event.lngLat;
                      setNewPlace({ lat, lng });
                      fetchAddress(lat, lng);
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
                <div key={index} className="mobile-image-crop-container">
                  <div className="mobile-image-crop-section">
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
                        disabled={isLoading}  
                      >
                        <i className="fa fa-scissors"></i> 裁剪圖片
                      </button>
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={() => handleCancelCrop(index)}
                        disabled={isLoading}  
                      >
                        取消圖片
                      </button>
                    </div>
                  </div>

                  {croppedImages[index] && (
                    <div className="mobile-image-preview-section">
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

              <button 
                className="submit-btn" 
                type="submit"
                disabled={isLoading}  
              >
                Post
              </button>
            </form>
          </main>
        </div>
      ) : (
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
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
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
                onDblClick={handleAddClick}
                onMove={(event) => setViewport(event.viewState)}
                style={{ width: "100%", height: "400px" }}
              >
                {newPlace && (
                  <Marker
                    latitude={newPlace.lat}
                    longitude={newPlace.lng}
                    draggable
                    onDragEnd={(event) => {
                      const { lat, lng } = event.lngLat;
                      setNewPlace({ lat, lng });
                      fetchAddress(lat, lng);
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
                        disabled={isLoading}  
                      >
                        <i className="fa fa-scissors"></i> 裁剪圖片
                      </button>
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={() => handleCancelCrop(index)}
                        disabled={isLoading}  
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

              <button 
                className="submit-btn" 
                type="submit"
                disabled={isLoading}    
              >
                Post
              </button>
            </form>
          </main>
        </div>
      )}
    </>
  );
}

export default Upload;
