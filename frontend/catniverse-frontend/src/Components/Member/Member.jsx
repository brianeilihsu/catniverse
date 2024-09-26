import React, { useState } from "react";
import Header from "../Header/Header";
import { useNavigate } from "react-router-dom";
import "./Member.css";

function Member() {
  const [formData, setFormData] = useState({
    avatar: "",
    username: "貓咪愛好者",
    email: "catloverts@example.com",
    password: "",
    confirmPassword: "",
    bio: "我是一位熱愛貓咪的志工，常常在台北市進行TNR工作。希望能為流浪貓咪們盡一份心力！",
    location: "taipei",
    notifications: "all",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 處理表單提交邏輯，可以在此執行 API 請求以更新用戶資料
    const profileData = new FormData();
    for (let key in formData) {
      profileData.append(key, formData[key]);
    }
    // 發送表單資料（formData）到後端
    console.log("Form submitted:", formData);
    navigate("/profile");
  };

  return (
    <div>
      <Header />
      <div className="content">
        <div className="container">
          <h2>修改個人資料</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <img
              src="https://taiwanstraycats.org/default-avatar.jpg"
              alt="用戶頭像"
              className="avatar-preview"
              id="avatarPreview"
            />

            <label htmlFor="avatar">更新頭像：</label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
            />

            <label htmlFor="username">使用者名稱：</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">電子郵件：</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="password">新密碼：（如不修改請留空）</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <label htmlFor="confirmPassword">確認新密碼：</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <label htmlFor="bio">個人簡介：</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="說說你對浪貓的看法或你的救援經驗..."
            />

            <label htmlFor="location">所在地區：</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="taipei">台北市</option>
              <option value="newtaipei">新北市</option>
              <option value="taoyuan">桃園市</option>
              <option value="taichung">台中市</option>
              <option value="tainan">台南市</option>
              <option value="kaohsiung">高雄市</option>
              {/* 其他縣市選項 */}
            </select>

            <label htmlFor="notifications">電子郵件通知：</label>
            <select
              id="notifications"
              name="notifications"
              value={formData.notifications}
              onChange={handleChange}
            >
              <option value="all">接收所有通知</option>
              <option value="important">只接收重要通知</option>
              <option value="none">不接收通知</option>
            </select>

            <button type="submit">更新資料</button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Member;
