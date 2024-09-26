import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const toMember = () => {
    navigate("/member");
  };

  return (
    <div>
      <Header />
      <div className="content">
        <div className="container">
          <div className="profile-header">
            <img
              src="https://taiwanstraycats.org/images/default-avatar.jpg"
              alt="用戶頭像"
              className="profile-picture"
            />
            <div className="profile-info">
              <h1>123</h1>
              <p>電子郵件: cat.lover@example.com</p>
              <p>加入時間: 2023年1月1日</p>
              <p>發文數: </p>
            </div>
            <button className="edit-profile-btn" onClick={toMember}>
              修改個人資料
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Profile;