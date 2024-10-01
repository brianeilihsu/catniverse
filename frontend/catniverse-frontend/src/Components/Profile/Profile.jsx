import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios"; 
import Slider from "react-slick"; 
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();  
  const [userData, setUserData] = useState({});
  const [userImageUrls, setUserImageUrls] = useState(""); 
  const [postImageUrls, setPostImageUrls] = useState({}); 
  const [currentSlide, setCurrentSlide] = useState(0);

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
          setUserImageUrls(avatarUrl);
        }

        user.posts.forEach(post => {
          const downloadUrls = post.postImages.map(img => img.downloadUrl);
          fetchPostImages(downloadUrls, post.id);
        });

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

    const fetchPostImages = async (downloadUrls, postId) => {
      try {
        const imageBlobPromises = downloadUrls.map(async (downloadUrl) => {
          const response = await axios.get(
            `http://140.136.151.71:8787${downloadUrl}`,
            { responseType: "blob" }
          );
          return URL.createObjectURL(response.data);
        });

        const blobUrls = await Promise.all(imageBlobPromises);
        setPostImageUrls((prevState) => ({
          ...prevState,
          [postId]: blobUrls, 
        }));
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    if (id) {
      fetchUserData(id); 
    }
  }, [id]);  

  const toMember = () => {
    navigate("/member");
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
          <div className="profile-header">
            <img
              src={userImageUrls}  
              alt="用戶頭像"
              className="profile-picture"
            />
            <div className="profile-info">
              <h1>{userData.username}</h1>  
              <p>Email: {userData.email}</p>  
              <p>Join date: {new Date(userData.joinDate).toLocaleDateString("zh-TW")}</p>  
              <p>Number of posts: {userData.posts ? userData.posts.length : 0}</p>  
            </div>
            <button className="edit-profile-btn" onClick={toMember}>
              Modify profile
            </button>
          </div>

          <div className="posts">
            {userData.posts && userData.posts.length > 0 ? (
              userData.posts.map((post) => {
                let sliderRef = React.createRef();

                return (
                  <div className="post" key={post.id}>
                    <h3>{post.title}</h3>

                    <Slider {...sliderSettings(sliderRef)}>
                      {postImageUrls[post.id] &&
                        postImageUrls[post.id].map((url, index) => (
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
                      <p>{post.content}</p>
                      <p>發布地址: {post.address}</p>
                      <p>
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
              <p>目前沒有發表任何貼文。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
