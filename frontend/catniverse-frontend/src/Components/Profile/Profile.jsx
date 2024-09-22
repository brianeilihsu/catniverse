import React, { useState } from "react";
import Header from "../Header/Header";
import "./Profile.css";

function Profile({ account, posts }) {
  const toMember = () => {
    // 修改個人資料的邏輯
    console.log("修改個人資料");
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
              <h1>{account}</h1>
              <p>電子郵件: cat.lover@example.com</p>
              <p>加入時間: 2023年1月1日</p>
              <p>發文數: {posts.num}</p>
            </div>
            <button className="edit-profile-btn" onClick={toMember}>
              修改個人資料
            </button>
          </div>

          <div className="posts">
            {posts.map((post, index) => (
              <div className="post" key={index}>
                <img
                  src={post.imageUrl}
                  alt={post.altText}
                  className="post-image"
                />
                <div className="post-content">
                  <p>{post.content}</p>
                  <div className="post-stats">
                    <span>❤️ {post.likes} 讚</span>
                    <span>💬 {post.comments} 留言</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Profile;