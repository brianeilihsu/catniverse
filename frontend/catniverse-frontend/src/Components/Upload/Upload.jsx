import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Upload.css";
import backPic from "../../Image/back.png";

function Upload() {
  const [formData, setFormData] = useState({
    userId:"",
    title: "",
    content: "",
    address: "", 
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [city, setCity] = useState(""); 
  const [district, setDistrict] = useState(""); 
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const cities = {
    "台北市": ["中正區", "大同區", "中山區", "萬華區", "信義區", "松山區", "大安區", "南港區", "北投區", "士林區", "文山區"],
    "新北市": ["板橋區", "三重區", "中和區", "永和區", "新莊區", "新店區", "土城區", "蘆洲區", "汐止區", "三峽區", "樹林區", "淡水區", "瑞芳區", "五股區", "泰山區", "林口區"],
    "桃園市": ["桃園區", "中壢區", "平鎮區", "八德區", "楊梅區", "蘆竹區", "龜山區", "大溪區", "大園區", "觀音區", "龍潭區", "新屋區", "復興區"],
    "台中市": ["中區", "東區", "南區", "西區", "北區", "西屯區", "南屯區", "北屯區", "豐原區", "東勢區", "大甲區", "清水區", "沙鹿區", "梧棲區", "后里區", "神岡區", "潭子區", "大雅區", "新社區", "石岡區", "外埔區", "大安區", "烏日區", "大肚區", "龍井區", "霧峰區", "太平區", "大里區", "和平區"],
    "台南市": ["中西區", "東區", "南區", "北區", "安平區", "安南區", "永康區", "歸仁區", "新化區", "左鎮區", "玉井區", "楠西區", "南化區", "仁德區", "關廟區", "龍崎區", "官田區", "麻豆區", "佳里區", "西港區", "七股區", "將軍區", "學甲區", "北門區", "新營區", "後壁區", "白河區", "東山區", "六甲區", "下營區", "柳營區", "鹽水區", "善化區", "大內區", "山上區", "新市區", "安定區"],
    "高雄市": ["楠梓區", "左營區", "鼓山區", "三民區", "鹽埕區", "前金區", "新興區", "苓雅區", "前鎮區", "小港區", "旗津區", "鳳山區", "大寮區", "鳥松區", "林園區", "仁武區", "大樹區", "大社區", "岡山區", "路竹區", "橋頭區", "梓官區", "彌陀區", "永安區", "燕巢區", "田寮區", "阿蓮區", "茄萣區", "湖內區", "旗山區", "美濃區", "內門區", "杉林區", "甲仙區", "六龜區", "茂林區", "桃源區", "那瑪夏區"],
    "基隆市": ["中正區", "信義區", "仁愛區", "中山區", "安樂區", "暖暖區", "七堵區"],
    "新竹市": ["東區", "北區", "香山區"],
    "新竹縣": ["竹北市", "湖口鄉", "新豐鄉", "新埔鎮", "關西鎮", "芎林鄉", "寶山鄉", "竹東鎮", "五峰鄉", "橫山鄉", "尖石鄉", "北埔鄉", "峨眉鄉"],
    "苗栗縣": ["苗栗市", "竹南鎮", "頭份市", "後龍鎮", "卓蘭鎮", "通霄鎮", "苑裡鎮", "造橋鄉", "三灣鄉", "南庄鄉", "大湖鄉", "公館鄉", "銅鑼鄉", "頭屋鄉", "三義鄉", "西湖鄉", "獅潭鄉", "泰安鄉"],
    "彰化縣": ["彰化市", "鹿港鎮", "和美鎮", "線西鄉", "伸港鄉", "福興鄉", "秀水鄉", "花壇鄉", "芬園鄉", "員林市", "溪湖鎮", "田中鎮", "大村鄉", "埔鹽鄉", "埔心鄉", "永靖鄉", "社頭鄉", "二水鄉", "田尾鄉", "埤頭鄉", "芳苑鄉", "二林鎮", "大城鄉", "竹塘鄉", "溪州鄉"],
    "南投縣": ["南投市", "埔里鎮", "草屯鎮", "竹山鎮", "集集鎮", "名間鄉", "鹿谷鄉", "中寮鄉", "魚池鄉", "國姓鄉", "水里鄉", "信義鄉", "仁愛鄉"],
    "雲林縣": ["斗六市", "斗南鎮", "虎尾鎮", "西螺鎮", "土庫鎮", "北港鎮", "莿桐鄉", "林內鄉", "古坑鄉", "大埤鄉", "崙背鄉", "二崙鄉", "麥寮鄉", "臺西鄉", "東勢鄉", "褒忠鄉", "四湖鄉", "口湖鄉", "水林鄉", "元長鄉"],
    "嘉義市": ["東區", "西區"],
    "嘉義縣": ["太保市", "朴子市", "布袋鎮", "大林鎮", "民雄鄉", "溪口鄉", "新港鄉", "六腳鄉", "東石鄉", "義竹鄉", "鹿草鄉", "水上鄉", "中埔鄉", "竹崎鄉", "梅山鄉", "番路鄉", "大埔鄉", "阿里山鄉"],
    "屏東縣": ["屏東市", "潮州鎮", "東港鎮", "恆春鎮", "萬丹鄉", "長治鄉", "麟洛鄉", "九如鄉", "里港鄉", "鹽埔鄉", "高樹鄉", "萬巒鄉", "內埔鄉", "竹田鄉", "新埤鄉", "枋寮鄉", "新園鄉", "崁頂鄉", "林邊鄉", "南州鄉", "佳冬鄉", "琉球鄉", "車城鄉", "滿州鄉", "枋山鄉", "三地門鄉", "霧臺鄉", "瑪家鄉", "泰武鄉", "來義鄉", "春日鄉", "獅子鄉", "牡丹鄉"],
    "宜蘭縣": ["宜蘭市", "頭城鎮", "羅東鎮", "蘇澳鎮", "礁溪鄉", "壯圍鄉", "員山鄉", "冬山鄉", "五結鄉", "三星鄉", "大同鄉", "南澳鄉"],
    "花蓮縣": ["花蓮市", "鳳林鎮", "玉里鎮", "新城鄉", "吉安鄉", "壽豐鄉", "光復鄉", "豐濱鄉", "瑞穗鄉", "富里鄉", "秀林鄉", "萬榮鄉", "卓溪鄉"],
    "台東縣": ["台東市", "成功鎮", "關山鎮", "卑南鄉", "鹿野鄉", "池上鄉", "東河鄉", "長濱鄉", "太麻里鄉", "大武鄉", "綠島鄉", "海端鄉", "延平鄉", "金峰鄉", "達仁鄉", "蘭嶼鄉"],
    "澎湖縣": ["馬公市", "湖西鄉", "白沙鄉", "西嶼鄉", "望安鄉", "七美鄉"],
    "金門縣": ["金沙鎮", "金湖鎮", "金寧鄉", "金城鎮", "烈嶼鄉", "烏坵鄉"],
    "連江縣": ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"]
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (storedUserId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        userId: storedUserId,
      }));
    }
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const errors = {};

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    files.forEach((file) => {
      if (!validImageTypes.includes(file.type)) {
        errors.image = "只能上傳 JPEG、PNG 或 GIF 圖片。";
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.image = "圖片大小不能超過 5MB。";
      }
    });

    if (Object.keys(errors).length === 0) {
      setImageFiles(files);
      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    } else {
      setErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const address = `${city}${district}`; 

    const updatedFormData = {
      ...formData,
      address, 
    };

    const formErrors = {};
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      try {
        const postResponse = await axios.post(
          `http://140.136.151.71:8787/api/v1/posts/add/${formData.userId}`,
          updatedFormData, 
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const postId = postResponse.data.data.id;

        for (let i = 0; i < imageFiles.length; i++) {
          const imageData = new FormData();
          imageData.append("postId", postId);
          imageData.append("files", imageFiles[i]);

          await axios.post(
            `http://140.136.151.71:8787/api/v1/post-images/upload`,
            imageData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        alert("貼文和圖片成功！");
        navigate("/");
      } catch (error) {
        console.error("上傳貼文失敗：", error);
        alert("上傳貼文失敗");
      }
    } else {
      alert("修正表單錯誤。");
    }
  };

  const handleCityChange = (e) => {
    setCity(e.target.value); 
    setDistrict(""); 
  };

  return (
    <div className="content">
      <br/>
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
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />

          <div className="select-row">
            <select name="city" value={city} onChange={handleCityChange} required>
              <option value="">選擇縣市</option>
              {Object.keys(cities).map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>

            <select
              name="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              disabled={!city}
            >
              <option value="">選擇區域</option>
              {city &&
                cities[city].map((districtName) => (
                  <option key={districtName} value={districtName}>
                    {districtName}
                  </option>
                ))}
            </select>
          </div>

          <input
            type="file"
            id="chooseImage"
            accept="image/*"
            name="file"
            onChange={handleImageChange}
            multiple
          />

          {errors.image && <p style={{ color: "red" }}>{errors.image}</p>}

          <div className="image-preview">
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt="Preview"
                style={{ width: "100px", margin: "5px" }}
              />
            ))}
          </div>

          <button className="submit-btn" type="submit">發布</button>
        </form>
      </main>
    </div>
  );
}

export default Upload;
