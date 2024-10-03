import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "./Profile.css";
import uploadPic from "../../Image/post.png";
import XPic from "../../Image/x-mark.png";
import settingPic from "../../Image/settings.png";
import HeartPic from "../../Image/comment-heart.png";
import HeartPicFilled from "../../Image/heart.png";
import CommentPic from "../../Image/comment.png";

function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState({});
  const [userImageUrls, setUserImageUrls] = useState("");
  const [postImageUrls, setPostImageUrls] = useState({});
  const [showOutDelete, setShowOutDelete] = useState(false);
  const [showInDelete, setShowInDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const sliderRefs = useRef({});

  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        const response = await axios.get(`http://140.136.151.71:8787/api/v1/users/${userId}/user`);
        const user = response.data.data;
        setUserData(user);
  
        if (user.userAvatar && user.userAvatar.downloadUrl) {
          const avatarUrl = await fetchImage(user.userAvatar.downloadUrl);
          setUserImageUrls(avatarUrl);
        }
  
        user.posts.forEach((post) => {
          const downloadUrls = post.postImages.map((img) => img.downloadUrl);
          fetchPostImages(downloadUrls, post.id);
  
          checkIfLiked(post.id, userId);
        });
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
    const userId = localStorage.getItem("userId"); 
  
    if (id && userId) {
      fetchUserData(id);
    }
  }, [id]);

  const toMember = () => {
    navigate("/member");
  };

  const handleUpload = () => {
    navigate("/upload");
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    fetchComments(post.id); 
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSettingOut = () => {
    setShowOutDelete(!showOutDelete);
  };

  const handleSettingIn = () => {
    setShowInDelete(!showInDelete);
  };

  const handleDeletePost = async (event, postId) => {
    event.stopPropagation();

    try {
      const response = await axios.delete(`http://140.136.151.71:8787/api/v1/posts/delete/${postId}`);
  
      if (response.status === 200) {
        setUserData((prevUserData) => {
          const updatedPosts = prevUserData.posts.filter((post) => post.id !== postId);
          return {
            ...prevUserData,
            posts: updatedPosts,
          };
        });
        alert("Post deleted successfully");
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error occurred while deleting the post");
    }
  };  

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(`http://140.136.151.71:8787/api/v1/comments/delete/${commentId}`);
  
      if (response.status === 200) {
        setComments((prevComments) => {
          const updatedComments = prevComments[selectedPost.id].list.filter(
            (comment) => comment.id !== commentId
          );
          return {
            ...prevComments,
            [selectedPost.id]: {
              ...prevComments[selectedPost.id],
              list: updatedComments,
            },
          };
        });
  
        setSelectedPost((prevSelectedPost) => ({
          ...prevSelectedPost,
          total_comments: prevSelectedPost.total_comments - 1,
        }));
  
        alert("Comment deleted successfully");
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Error occurred while deleting the comment");
    }
  };
  

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
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
  
        setSelectedPost((prevState) => ({
          ...prevState,
          total_likes: prevState.total_likes - 1,
        }));
      } else {
        await axios.post("http://140.136.151.71:8787/api/v1/likes/add-like", null, {
          params: { userId, postId },
        });
  
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: true,
        }));
  
        setSelectedPost((prevState) => ({
          ...prevState,
          total_likes: prevState.total_likes + 1,
        }));
      }
    } catch (error) {
      console.error(`Error updating like for post ${postId}:`, error);
    }
  };  

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
        [postId]: { visible: true, list: commentsWithUserInfo },
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

      setCommentText("");
      fetchComments(postId); 
    } catch (error) {
      console.error(`Error posting comment for post ${postId}:`, error);
    }
  };

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
          <button className="setting-btn" onClick={handleSettingOut}>
            <img src={settingPic} alt="Settings" />
          </button>
          <div className="profile-header">
            <img 
              src={userImageUrls} 
              alt="用户头像" 
              className="profile-picture" 
              style={{width:"100px", height:"100px", borderRadius:"50%"}}
            />
            <div className="profile-info">
              <h1>{userData.username}</h1>
              <p>Email: {userData.email}</p>
              <p>Join date: {new Date(userData.joinDate).toLocaleDateString("zh-TW")}</p>
              <p>Number of posts: {userData.posts ? userData.posts.length : 0}</p>
            </div>
            <button className="edit-profile-btn" onClick={toMember}>Modify profile</button>
          </div>

          <div className="posts">
            {userData.posts && userData.posts.length > 0 ? (
              userData.posts.map((post) => (
                <div className="post" key={post.id}>
                  <div className="title-and-btn" onClick={() => handlePostClick(post)}>
                    <h3>{post.title}</h3>
                    {showOutDelete && (
                      <button className="X-btn" onClick={(event) => handleDeletePost(event, post.id)}>
                        <img src={XPic} alt="Delete Post" />
                      </button>
                    )}
                  </div>

                  {postImageUrls[post.id] && postImageUrls[post.id].length === 1 ? (
                    <div className="g-container" style={{ display: "flex", justifyContent: "center" }}>
                      <img
                        src={postImageUrls[post.id][0]}
                        alt="Post image"
                        className="profilePost-image"
                        style={{ width: "100%", height: "220px" }}
                      />
                    </div>
                  ) : (
                    <Slider {...sliderSettings} ref={(slider) => (sliderRefs.current[post.id] = slider)}>
                      {postImageUrls[post.id] &&
                        postImageUrls[post.id].map((url, index) => (
                          <div key={index}>
                            <img
                              src={url}
                              alt={`Post image ${index}`}
                              className="profilePost-image"
                              style={{ width: "100%", height: "220px" }}
                              onClick={(e) => handleImageClick(e, sliderRefs.current[post.id])}
                            />
                          </div>
                        ))}
                    </Slider>
                  )}
                </div>
              ))
            ) : (
              <p>No post</p>
            )}
          </div>
        </div>
      </div>

      <button className="uploadPost-btn" onClick={handleUpload}>
        <img className="uploadPost-img" src={uploadPic} alt="Upload Product" />
      </button>

      {showModal && selectedPost && (
        <div className="overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="closed-button" onClick={handleCloseModal}>&times;</span>
            <div className="modal-image">
            {postImageUrls[selectedPost.id] && postImageUrls[selectedPost.id].length === 1 ? (
              <img
                src={postImageUrls[selectedPost.id][0]}
                alt="Post image"
                style={{ width: "500px", height: "660px" }}
              />
            ) : (
              <Slider {...sliderSettings} ref={(slider) => (sliderRefs.current[selectedPost.id] = slider)}>
                {postImageUrls[selectedPost.id] &&
                  postImageUrls[selectedPost.id].map((url, index) => (
                    <div key={index}>
                      <img
                        src={url}
                        className="modalPost-image"
                        alt={`Post image ${index}`}
                        style={{ width: "500px", height: "660px"}}
                        onClick={(e) => handleImageClick(e, sliderRefs.current[selectedPost.id])}
                      />
                    </div>
                  ))}
              </Slider>
            )}
            </div>
            <div 
              className="modalPost-content"
              style={{ width: "500px", height: "660px"}}
            >
              <div>
                <button className="setting2-btn" onClick={handleSettingIn}>
                  <img src={settingPic} alt="Settings" />
                </button>
                <h2 className="modalPost-title">{selectedPost.title}</h2>
              </div>
              <p className="modalPost-text">{selectedPost.content}</p>
              <p className="address">發布地址: {selectedPost.address}</p>
              <p className="date">
                發布於：{new Date(selectedPost.createdAt).toLocaleString("zh-TW", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>

              <div className="modalPost-actions">
              <button
                  className="action-btn"
                  onClick={() => handleLike(selectedPost.id)}
                  style={{
                    color: likedPosts[selectedPost.id] ? "#9E1212" : "black",
                    fontWeight: likedPosts[selectedPost.id] ? "bold" : "normal",
                  }}
                >
                  <img
                    className="heart-pic"
                    src={likedPosts[selectedPost.id] ? HeartPicFilled : HeartPic}
                    alt="讚"
                  />
                  {selectedPost.total_likes}
                </button>
                <button className="comment-btn" onClick={() => toggleComments(selectedPost.id)}>
                  <img className="comment-pic" src={CommentPic} alt="留言" />
                  {selectedPost.total_comments}
                </button>
              </div>
              {comments[selectedPost.id] && comments[selectedPost.id].visible && (
                <>
                  <div className="comments-section">
                    {comments[selectedPost.id]?.list?.length > 0 ? (
                      comments[selectedPost.id].list.map((comment, index) => (
                        <div className="comment" key={comment.id || index}>
                          <img
                            src={comment.userAvatar}
                            alt="評論者頭像"
                            className="comment-avatar"
                            style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                          />
                          <div className="comment-content">
                            <div className="title-and-btn">
                              <div className="comment-author">{comment.username}</div>
                              {showInDelete && (
                                <button className="X-in-btn" onClick={() => handleDeleteComment(comment.id)}>
                                  <img src={XPic} alt="Delete Comment" />
                                </button>
                              )}
                            </div>
                            <div className="comment-text">{comment.content}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>Loading comments...</div>
                    )}
                  </div>
                  <div className="new-comment">
                    <input
                      type="text"
                      placeholder="寫下你的評論..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="writeComment"
                    />
                    <button className="send-btn" onClick={() => handleAddComment(selectedPost.id)}>
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
