import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "./Member.css";

function Member() {
  const [formData, setFormData] = useState({
    avatar: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [userData, setUserData] = useState({});
  const [image, setImage] = useState(null); 
  const [imagePreview, setImagePreview] = useState(""); 
  const [errors, setErrors] = useState({}); 
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchUserData = async (userId) => {
      try {
        const response = await axios.get(
          `http://140.136.151.71:8787/api/v1/users/${userId}/user`
        );
        const user = response.data.data;
        setUserData(user);

        setFormData({
          avatar: "",
          username: user.username,
          email: user.email,
          password: "",
          confirmPassword: "",
        });

        if (user.userAvatar && user.userAvatar.downloadUrl) {
          const avatarUrl = await fetchImage(user.userAvatar.downloadUrl);
          setImagePreview(avatarUrl);
        }
      } catch (error) {
        console.error(`Error fetching user data for userId ${userId}:`, error);
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

    if (userId) {
      fetchUserData(userId);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0]; 
    const errors = {};

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      errors.avatar = `只能上傳 JPEG、PNG 或 GIF 圖片。`;
    }

    if (file.size > 5 * 1024 * 1024) {
      errors.avatar = `圖片大小不能超過 5MB。`;
    }

    if (Object.keys(errors).length === 0) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setErrors(errors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      alert("密碼與確認密碼不一致，請重新輸入。");
  
      setFormData((prevData) => ({
        ...prevData,
        password: "",
        confirmPassword: ""
      }));
  
      return;
    }
  
    const userId = localStorage.getItem("userId");
    const profileData = new FormData();
    profileData.append("username", formData.username);
    profileData.append("email", formData.email);
  
    if (formData.password && formData.confirmPassword) {
      profileData.append("password", formData.password);
      profileData.append("confirmPassword", formData.confirmPassword);
    }
  
    if (image) {
      profileData.append("avatar", image); 
    }
  
    try {
      await axios.post(
        `http://140.136.151.71:8787/api/v1/users/${userId}/update`,
        profileData
      );
      console.log("User profile updated successfully:", formData);
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };
  


  return (
    <div>
      <div className="content">
        <div className="container">
          <h2>修改個人資料</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <img
              src={imagePreview}
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
              onChange={handleImageChange}
            />
            {errors.avatar && <p style={{ color: "red" }}>{errors.avatar}</p>}

            <label htmlFor="username">使用者名稱：</label>
            <input
              type="text"
              id="user"
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

            <button type="submit">更新資料</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Member;
