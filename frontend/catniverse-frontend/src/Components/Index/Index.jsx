import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./index.css";
import { Link } from "react-router-dom";
import Slider from "react-slick"; 

function Index() {
  const [postData, setPostData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [imageUrls, setImageUrls] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://140.136.151.71:8787/api/v1/posts/all"
        );
        setPostData(response.data.data);

        response.data.data.forEach((post) => {
          if (post.postImages && post.postImages.length > 0) {
            const downloadUrls = post.postImages.map((img) => img.downloadUrl);
            fetchImages(downloadUrls, post.id);
          }
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    const fetchImages = async (downloadUrls, postId) => {
      try {
        const imageBlobPromises = downloadUrls.map(async (downloadUrl) => {
          const response = await axios.get(
            `http://140.136.151.71:8787${downloadUrl}`,
            { responseType: "blob" }
          );
          return URL.createObjectURL(response.data);
        });

        const blobUrls = await Promise.all(imageBlobPromises);
        setImageUrls((prevState) => ({
          ...prevState,
          [postId]: blobUrls,
        }));
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchData();
  }, []);

  const loadMorePosts = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  const handleImageClick = (e, sliderRef) => {
    const clickX = e.clientX; 
    const imageWidth = e.target.clientWidth; 

    if (clickX < imageWidth / 2) {
      sliderRef.slickPrev(); 
    } else {
      sliderRef.slickNext(); 
    }
  };

  const sliderSettings = (sliderRef) => ({
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, 
    dots: false, 
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex), 
    ref: sliderRef,
  });

  return (
    <div>
      <div className="content">
        <div className="container">
          <h1>台灣浪貓地圖社群</h1>

          <div id="post-list">
            {postData.length > 0 ? (
              postData.slice(0, visibleCount).map((post) => {
                let sliderRef = React.createRef(); 
                return (
                  <div className="post" key={post.id}>
                    <div className="post-header">
                      <Link
                        to={`/profile/${post.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <img
                          src="你的頭像圖片URL"
                          alt="使用者頭像"
                          className="user-avatar"
                          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                        />
                      </Link>
                      <Link
                        to={`/profile/${post.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <span className="user-name">{post.userId}</span>
                      </Link>
                    </div>

                    <h4>{post.title}</h4>

                    <Slider {...sliderSettings(sliderRef)}>
                      {imageUrls[post.id] &&
                        imageUrls[post.id].map((url, index) => (
                          <div key={index}>
                            <img
                              src={url}
                              alt={`Post image ${index}`}
                              className="post-image"
                              style={{ width: "100%", height: "auto" }}
                              onClick={(e) =>
                                handleImageClick(e, sliderRef.current)
                              }
                            />
                          </div>
                        ))}
                    </Slider>

                    <div className="post-content">
                      <p className="post-text">{post.content}</p>
                      <p className="post-location">發布地址：{post.address}</p>
                      <p className="post-date">
                        發布於：
                        {new Date(post.createdAt).toLocaleString("zh-TW", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
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
                );
              })
            ) : (
              <p>目前沒有貼文。</p>
            )}
          </div>

          <a href="#" className="load-more" onClick={loadMorePosts}>
            載入更多貼文
          </a>
        </div>
      </div>
    </div>
  );
}

export default Index;
