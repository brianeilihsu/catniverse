import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Member.css";
import backPic from "../../Image/back.png";
import defaultAvatar from "../../Image/account.png";

function Member() {
  const [userData, setUserData] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        const response = await axios.get(
          `http://140.136.151.71:8787/api/v1/users/${userId}/user`
        );
        const user = response.data.data;
        setUserData(user);

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
  }, [userId]);

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
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userData.password && userData.password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "密碼與確認密碼不一致",
      }));
      return;
    }
    try {
      await axios.put(
        `http://140.136.151.71:8787/api/v1/users/${userId}/update`,
        userData
      );
      console.log("User profile updated successfully:", userData);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }

    try {
      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);
        await axios.put(
          `http://140.136.151.71:8787/api/v1/user-avatar/${userId}/update`,
          imageData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("User avatar updated successfully:", imageData);
      }
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error("Error updating user avatar:", error);
    }
  };

  return (
    <div>
      {isMobile ? (
        <div className="mobile-member-content">
          <div className="mobile-member-container">
            <div className="mobile-backLogo">
              <Link to={`/profile/${userId}`} className="back-container">
                <button className="back-btn">
                  <img className="backPic" src={backPic} />
                </button>
                <p>Back</p>
              </Link>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <img
                src={imagePreview || defaultAvatar}
                alt="用戶頭像"
                className="avatar-preview"
                id="avatarPreview"
              />

              <label htmlFor="avatar">Update avatar:</label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                onChange={handleImageChange}
              />
              {errors.avatar && <p style={{ color: "red" }}>{errors.avatar}</p>}

              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="user"
                name="username"
                value={userData.username || ""}
                onChange={handleChange}
                required
              />

              <label htmlFor="bio">Personal profile:</label>
              <textarea
                id="bio"
                name="bio"
                value={userData.bio || ""}
                onChange={handleChange}
                required
              />

              <label htmlFor="password">
                New password: (please leave it blank if you do not want to
                change it)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password || ""}
                onChange={handleChange}
              />

              <label htmlFor="confirmPassword">Confirm new password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {errors.confirmPassword && (
                <p style={{ color: "red" }}>{errors.confirmPassword}</p>
              )}

              <button className="submit-btn" type="submit">
                Update
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="desktop-member-content">
          <div className="container">
            <div className="backLogo">
              <Link to={`/profile/${userId}`} className="back-container">
                <button className="back-btn">
                  <img className="backPic" src={backPic} />
                </button>
                <p>Back</p>
              </Link>
            </div>
            <h1>Modify profile</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <img
                src={imagePreview || defaultAvatar}
                alt="用戶頭像"
                className="avatar-preview"
                id="avatarPreview"
              />

              <label htmlFor="avatar">Update avatar:</label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                onChange={handleImageChange}
              />
              {errors.avatar && <p style={{ color: "red" }}>{errors.avatar}</p>}

              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="user"
                name="username"
                value={userData.username || ""}
                onChange={handleChange}
                required
              />

              <label htmlFor="bio">Personal profile:</label>
              <textarea
                id="bio"
                name="bio"
                value={userData.bio || ""}
                onChange={handleChange}
                required
              />

              <label htmlFor="password">
                New password: (please leave it blank if you do not want to
                change it)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password || ""}
                onChange={handleChange}
              />

              <label htmlFor="confirmPassword">Confirm new password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {errors.confirmPassword && (
                <p style={{ color: "red" }}>{errors.confirmPassword}</p>
              )}

              <button className="submit-btn" type="submit">
                Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Member;
