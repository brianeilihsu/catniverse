import React, { useState, useRef, useEffect } from "react";
import 'croppie/croppie.css';
import Croppie from "croppie";

const Map = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, size: 0 });
  const [croppedInfo, setCroppedInfo] = useState({ size: 0 });
  const [file, setFile] = useState(null);

  const cropContainerRef = useRef(null);
  const croppieInstance = useRef(null);  // Ref for the croppie instance

  // Initialize Croppie when imageSrc changes
  useEffect(() => {
    if (imageSrc && cropContainerRef.current) {
      if (croppieInstance.current) {
        croppieInstance.current.destroy();  // Destroy previous instance if any
      }
      // Create Croppie instance
      croppieInstance.current = new Croppie(cropContainerRef.current, {
        viewport: { width: 300, height: 200, type: "square" },
        boundary: { width: 350, height: 350 },
        url: imageSrc
      });
    }
  }, [imageSrc]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image")) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);  // 將 base64 圖片設為 Croppie 的來源
      };
      reader.readAsDataURL(file);  // 讀取檔案並轉換成 base64 URL
    } else {
      alert("請上傳一個圖片檔案！");
    }
  };

  const handleCrop = async () => {
    if (croppieInstance.current) {
      const croppedDataUrl = await croppieInstance.current.result({
        type: "canvas",
        format: "jpeg",
        quality: 0.85,
        size: { width: 300, height: 200 },  // 裁剪的寬度與高度
      });
      setCroppedImage(croppedDataUrl);
      setCroppedInfo({ size: Math.round((croppedDataUrl.length * 0.75) / 1000) }); // 計算裁剪後圖片大小
    }
  };

  const handleImageLoaded = (img) => {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const size = Math.round(file.size / 1000);  // 計算圖片大小 KB
    setImageInfo({ width, height, size });
  };

  return (
    <div>
      <label className="btn btn-info">
        <input
          id="upload_img"
          style={{ display: "none" }}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <i className="fa fa-photo"></i> 上傳圖片
      </label>

      {/* 顯示原始圖片資訊 */}
      {file && (
        <div>
          <p>原始圖片尺寸: {imageInfo.width} x {imageInfo.height}</p>
          <p>檔案大小: 約 {imageInfo.size} KB</p>
        </div>
      )}

      {/* Croppie 裁剪區 */}
      {imageSrc && (
        <div id="oldImg" ref={cropContainerRef} style={{ height: "350px", width: "350px" }}>
          {/* 這裡將會初始化 Croppie */}
        </div>
      )}

      {/* 裁剪按鈕 */}
      {imageSrc && (
        <button id="crop_img" className="btn btn-info" onClick={handleCrop}>
          <i className="fa fa-scissors"></i> 裁剪圖片
        </button>
      )}

      {/* 顯示裁剪後的圖片和資訊 */}
      {croppedImage && (
        <div>
          <h3>裁剪後的圖片預覽：</h3>
          <img src={croppedImage} alt="Cropped" />
          <p>裁剪圖片尺寸: 300 x 200</p>
          <p>檔案大小: 約 {croppedInfo.size} KB</p>
        </div>
      )}
    </div>
  );
};

export default Map;
