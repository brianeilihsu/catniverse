import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import Slider from "react-slick";
import HeartPic from "../../Image/comment-heart.png";
import HeartPicFilled from "../../Image/heart.png"; 
import CommentPic from "../../Image/comment.png";
import "./Index.css";

function Index() {
  const [postData, setPostData] = useState([]);
  const [userData, setUserData] = useState({});
  const [visibleCount, setVisibleCount] = useState(10);
  const [postImageUrls, setPostImageUrls] = useState({});
  const [userImageUrls, setUserImageUrls] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comments, setComments] = useState({}); 
  const [commentText, setCommentText] = useState(""); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await axios.get("http://140.136.151.71:8787/api/v1/posts/all");
        const posts = response.data.data;
        setPostData(posts);

        posts.forEach((post) => {
          fetchUserData(post.userId);
          fetchComments(post.id);
          if (post.postImages && post.postImages.length > 0) {
            const downloadUrls = post.postImages.map((img) => img.downloadUrl);
            fetchPostImages(downloadUrls, post.id);
          }
        });

        const userId = localStorage.getItem("userId");
        if (userId) {
          posts.forEach((post) => {
            checkIfLiked(post.id, userId);
          });
        }
      } catch (error) {
        console.error("Error fetching post data: ", error);
      }
    };

    const fetchPostImages = async (downloadUrls, postId) => {
      try {
        const imageBlobPromises = downloadUrls.map(async (downloadUrl) => {
          const response = await axios.get(`http://140.136.151.71:8787${downloadUrl}`, { responseType: "blob" });
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

    const fetchUserData = async (userId) => {
      try {
        if (!userData[userId]) {
          const response = await axios.get(`http://140.136.151.71:8787/api/v1/users/${userId}/user`);
          const user = response.data.data;

          setUserData((prevState) => ({
            ...prevState,
            [userId]: user,
          }));

          if (user.userAvatar && user.userAvatar.downloadUrl) {
            const avatarUrl = await fetchImage(user.userAvatar.downloadUrl);
            setUserImageUrls((prevState) => ({
              ...prevState,
              [userId]: avatarUrl,
            }));
          }
        }
      } catch (error) {
        console.error(`Error fetching user data for userId ${userId}:`, error);
      }
    };

    const fetchImage = async (downloadUrl) => {
      try {
        const response = await axios.get(`http://140.136.151.71:8787${downloadUrl}`, { responseType: "blob" });
        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchPostData();
  }, [userData]);

  const checkIfLiked = async (postId, userId) => {
    try {
      const response = await axios.get("http://140.136.151.71:8787/api/v1/likes/existed", {
        params: { userId, postId },
      });
      if (response.data.data) {
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: true,
        }));
      } else {
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: false,
        }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: false,
        }));
      } else {
        console.error(`Error checking like status for post ${postId}:`, error);
      }
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`http://140.136.151.71:8787/api/v1/comments/from-post/${postId}`);
      const commentsData = response.data.data || [];
      const commentsWithUserInfo = await Promise.all(
        commentsData.map(async (comment) => {
          const userResponse = await fetchUserDetails(comment.userId);
          const user = userResponse.data.data;
          let avatarUrl = null;
          if (user.userAvatar && user.userAvatar.downloadUrl) {
            avatarUrl = await fetchCommentImage(user.userAvatar.downloadUrl);
          }
          return {
            ...comment,
            username: user.username,
            userAvatar: avatarUrl,
          };
        })
      );

      setComments((prevState) => ({
        ...prevState,
        [postId]: { visible: false, list: commentsWithUserInfo },
      }));
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
    }
  };

  const fetchUserDetails = async (userId) => {
    return axios.get(`http://140.136.151.71:8787/api/v1/users/${userId}/user`);
  };

  const fetchCommentImage = async (downloadUrl) => {
    try {
      const response = await axios.get(`http://140.136.151.71:8787${downloadUrl}`, { responseType: "blob" });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleAddComment = async (postId) => {
    const userId = localStorage.getItem('userId'); 
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;
  
    try {
      const commentData = {
        userId: userId,   
        postId: postId,
        content: commentText,
      };
  
      await axios.post(`http://140.136.151.71:8787/api/v1/comments/add`, commentData, {
        headers: {
          'Content-Type': 'application/json',  
        },
      });
  
      await fetchComments(postId); 
      setCommentText(""); 
    } catch (error) {
      console.error(`Error posting comment for post ${postId}:`, error);
    }
  };

  const handleLike = async (postId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    const isLiked = likedPosts[postId];

    try {
      if (isLiked) {
        await axios.delete("http://140.136.151.71:8787/api/v1/likes/remove-like", {
          params: { userId, postId },
        });
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: false,
        }));
      } else {
        await axios.post("http://140.136.151.71:8787/api/v1/likes/add-like", null, {
          params: { userId, postId },
        });
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: true,
        }));
      }
    } catch (error) {
      console.error(`Error updating like for post ${postId}:`, error);
    }
  };

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

  const toggleComments = (postId) => {
    setComments((prevState) => ({
      ...prevState,
      [postId]: {
        ...prevState[postId],
        visible: !prevState[postId]?.visible,  
      },
    }));
  };

  return (
    <div>
      <div className="content">
        <div className="container">
          <h1 className="index-title">台灣浪貓地圖社群</h1>

          <div id="post-list">
            {postData.length > 0 ? (
              postData.slice(0, visibleCount).map((post) => {
                let sliderRef = React.createRef();
                const user = userData[post.userId];
                const avatarUrl = userImageUrls[post.userId];
                const postComments = comments[post.id]?.list || [];

                return (
                  <div className="post" key={post.id}>
                    <div className="post-header">
                      <Link to={`/profile/${post.userId}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <img
                          src={avatarUrl}
                          alt="使用者頭像"
                          className="user-avatar"
                          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                        />
                      </Link>
                      <Link to={`/profile/${post.userId}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <span className="user-name">{user ? user.username : "未知使用者"}</span>
                      </Link>
                    </div>

                    <h4>{post.title}</h4>

                    <Slider {...sliderSettings(sliderRef)}>
                      {postImageUrls[post.id] &&
                        postImageUrls[post.id].map((url, index) => (
                          <div
                            className="g-container"
                            key={index}
                            style={{ display: "flex", justifyContent: "center"}}
                          >
                            <img
                              src={url}
                              alt={`Post image ${index}`}
                              className="post-image"
                              onClick={(e) => handleImageClick(e, sliderRef.current)}
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
                      <button
                        className="action-btn"
                        onClick={() => handleLike(post.id)}
                        style={{
                          color: likedPosts[post.id] ? "#9E1212" : "black",
                          fontWeight: likedPosts[post.id] ? "bold" : "normal",
                        }}
                      >
                        <img
                          className="heart-pic"
                          src={likedPosts[post.id] ? HeartPicFilled : HeartPic}
                          alt="讚"
                        />
                        Like
                      </button>
                      <button className="comment-btn" onClick={() => toggleComments(post.id)}>
                        <img className="comment-pic" src={CommentPic} alt="留言" />
                        Comment
                      </button>
                    </div>
                    {comments[post.id] && comments[post.id].visible && (
                      <div className="comments-section">
                        {comments[post.id]?.list?.length > 0 ? (
                          postComments.map((comment, index) => (
                            <div className="comment" key={comment.id || index}>
                              <img
                                src={comment.userAvatar}
                                alt="評論者頭像"
                                className="comment-avatar"
                                style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                              />
                              <div className="comment-content">
                                <div className="comment-author">{comment.username}</div>
                                <div className="comment-text">{comment.content}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div>Loading comments...</div>
                        )}
                        <div className="new-comment">
                          <input
                            type="text"
                            placeholder="寫下你的評論..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                          />
                          <button className="send-btn" onClick={() => handleAddComment(post.id)}>
                            Send
                          </button>
                        </div>
                      </div>
                    )}
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
