import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import Header from "../Header/Header.jsx";

function Index() {
  const [postData, setPostData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    axios
      .get("")
      .then((response) => {
        setPostData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const loadMorePosts = () => {
    setVisibleCount((prevCount) => prevCount + 10); 
  };

  return (
    <div>
      <Header />
      <div className="content">
        <div className="container">
          <h1>台灣浪貓地圖社群</h1>

          <div id="post-list">
            {postData.length > 0 ? (
              postData.slice(0, visibleCount).map((post) => (
                <div className="post">
                  <div className="post-header">
                    <img
                      src={post.userImage}
                      alt="使用者頭像"
                      className="user-avatar"
                    />
                    <span className="user-name">{post.userName}</span>
                  </div>
                  <img src={post.postImage} alt="" className="post-image" />
                  <div className="post-content">
                    <p className="post-text">{post.postContent}</p>
                    <p className="post-location">{post.postLocation}</p>
                    <p className="post-date">發布於：{post.postDate}</p>
                  </div>
                  <div className="post-actions">
                    <button className="action-btn">
                      <img src="" alt="讚" />
                      喜歡
                    </button>
                    <button className="action-btn">
                      <img src="" alt="留言" />
                      留言
                    </button>
                    <button className="action-btn">
                      <img src="" alt="分享" />
                      分享
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>目前沒有貼文。</p>
            )}
          </div>
          <a href="" className="load-more" onClick={loadMorePosts}>
            載入更多貼文
          </a>
        </div>
      </div>
    </div>
  );
}
export default Index;
