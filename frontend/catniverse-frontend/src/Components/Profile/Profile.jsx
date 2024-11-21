import React, { useState, useEffect, useRef, Suspense } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import "./Profile.css";
import uploadPic from "../../Image/post.png";
import XPic from "../../Image/x-mark.png";
import settingPic from "../../Image/settings.png";
import HeartPic from "../../Image/comment-heart.png";
import HeartPicFilled from "../../Image/heart.png";
import CommentPic from "../../Image/comment.png";
import defaultAvatar from "../../Image/account.png";
const Slider = React.lazy(() => import("react-slick"));

function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState({ posts: ["loading"] });
  const [postImageUrls, setPostImageUrls] = useState({});
  const [showOutDelete, setShowOutDelete] = useState(false);
  const [showInDelete, setShowInDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const token = localStorage.getItem("token");
  const sliderRefs = useRef({});
  const observerRefs = useRef({});

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("hasReloaded")) {
      sessionStorage.setItem("hasReloaded", "true");
      window.location.reload();
    }

    const fetchUserData = async (userId) => {
      try {
        setUserData({ posts: ["loading"] });

        const response = await axios.get(
          `http://140.136.151.71:8787/api/v1/users/${userId}/user`
        );
        const user = response.data.data;

        let avatarUrl = null;
        if (user.userAvatar && user.userAvatar.downloadUrl) {
          avatarUrl = await fetchImage(user.userAvatar.downloadUrl);
        }

        if (user.posts.length > 0) {
          await Promise.all(
            user.posts.map(async (post) => {
              const downloadUrls = post.postImages.map(
                (img) => img.downloadUrl
              );
              await fetchPostImages(downloadUrls, post.id);
              await checkIfLiked(post.id);
            })
          );
        }

        setUserData({
          ...user,
          userAvatarUrl: avatarUrl,
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

        if (
          userData.posts &&
          userData.posts.length > 0 &&
          postId === userData.posts[0]?.id &&
          blobUrls.length > 0
        ) {
          preloadImage(blobUrls[0]);
        }

        applyIntersectionObserver(postId);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    const preloadImage = (url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);
    };

    const applyIntersectionObserver = (postId) => {
      const postImages = document.querySelectorAll(
        `[data-post-id="${postId}"] img.lazyload`
      );
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove("lazyload");
            obs.unobserve(img);
          }
        });
      });

      postImages.forEach((img) => observer.observe(img));
      observerRefs.current[postId] = observer;
    };

    const userId = localStorage.getItem("userId");

    if (id && userId) {
      fetchUserData(id);
    }

    return () => {
      Object.values(observerRefs.current).forEach((observer) =>
        observer.disconnect()
      );
    };
  }, [id]);

  const toMember = () => {
    navigate("/member");
  };

  const handleUpload = () => {
    navigate("/upload");
  };

  const handlePostClick = (postId) => {
    if (selectedPost?.id === postId) {
      return;
    }
    const post = userData.posts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
      if (!comments[post.id]) {
        fetchComments(post.id);
      }

      setShowModal(true);
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
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
      const response = await axios.delete(
        `http://140.136.151.71:8787/api/v1/posts/delete/${postId}`
      );

      if (response.status === 200) {
        setUserData((prevUserData) => {
          const updatedPosts = prevUserData.posts.filter(
            (post) => post.id !== postId
          );
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
      const response = await axios.delete(
        `http://140.136.151.71:8787/api/v1/comments/delete/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
        await axios.delete(
          "http://140.136.151.71:8787/api/v1/likes/remove-like",
          {
            params: { postId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: false,
        }));

        setSelectedPost((prevState) => ({
          ...prevState,
          total_likes: prevState.total_likes - 1,
        }));

        setUserData((prevUserData) => {
          const updatedPosts = prevUserData.posts.map((post) =>
            post.id === postId
              ? { ...post, total_likes: post.total_likes - 1 }
              : post
          );
          return { ...prevUserData, posts: updatedPosts };
        });
      } else {
        await axios.post(
          "http://140.136.151.71:8787/api/v1/likes/add-like",
          null,
          {
            params: { postId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: true,
        }));

        setSelectedPost((prevState) => ({
          ...prevState,
          total_likes: prevState.total_likes + 1,
        }));

        setUserData((prevUserData) => {
          const updatedPosts = prevUserData.posts.map((post) =>
            post.id === postId
              ? { ...post, total_likes: post.total_likes + 1 }
              : post
          );
          return { ...prevUserData, posts: updatedPosts };
        });
      }
    } catch (error) {
      console.error(`Error updating like for post ${postId}:`, error);
    }
  };

  const checkIfLiked = async (postId) => {
    try {
      const response = await axios.get(
        "http://140.136.151.71:8787/api/v1/likes/existed",
        {
          params: { postId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      const response = await axios.get(
        `http://140.136.151.71:8787/api/v1/comments/from-post/${postId}`
      );
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
      const response = await axios.get(
        `http://140.136.151.71:8787${downloadUrl}`,
        { responseType: "blob" }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleAddComment = async (postId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;

    try {
      await axios.post(
        `http://140.136.151.71:8787/api/v1/comments/add/${postId}`,
        null,
        {
          params: { content: commentText },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      {isMobile ? (
        <div className="mobile-type">
          <button className="mobile-setting-btn" onClick={handleSettingOut}>
            <img src={settingPic} alt="Settings" />
          </button>
          <div className="mobile-profile-content">
            <div className="mobile-container">
              <div className="mobile-profile-header">
                <img
                  src={userData.userAvatarUrl || defaultAvatar}
                  alt="用戶頭像"
                  className="profile-picture"
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                  }}
                  loading="lazy"
                />
                <div className="mobile-profile-info">
                  <h2>{userData.username}</h2>
                  <p>{userData.email}</p>
                  <p>{userData.bio}</p>
                  <p>
                    {new Date(userData.joinDate).toLocaleDateString("zh-TW")}
                  </p>
                  <p>
                    Number of posts:{" "}
                    {userData.posts ? userData.posts.length : 0}
                  </p>
                </div>
                <button className="mobile-edit-profile-btn" onClick={toMember}>
                  Modify
                </button>
              </div>

              <div className="mobile-posts">
                {userData.posts && userData.posts[0] === "loading" ? (
                  <div className="loading-overlay">
                    <ClipLoader color="#666" size={50} />
                  </div>
                ) : userData.posts && userData.posts.length > 0 ? (
                  userData.posts.map((post) => (
                    <div className="mobile-mypost" key={post.id}>
                      <div
                        className="title-and-btn"
                        onClick={() => handlePostClick(post.id)}
                      >
                        <h3>{post.title}</h3>
                        {showOutDelete && (
                          <button
                            className="X-btn"
                            onClick={(event) =>
                              handleDeletePost(event, post.id)
                            }
                          >
                            <img src={XPic} alt="Delete Post" />
                          </button>
                        )}
                      </div>

                      {postImageUrls[post.id] &&
                      postImageUrls[post.id].length === 1 ? (
                        <div
                          className="g-container"
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <img
                            src={postImageUrls[post.id][0].replace(
                              ".png",
                              "-lowres.webp"
                            )}
                            data-src={postImageUrls[post.id][0].replace(
                              ".png",
                              ".webp"
                            )}
                            srcSet={`
              ${postImageUrls[post.id][0].replace(".png", "-320w.webp")} 320w,
              ${postImageUrls[post.id][0].replace(".png", "-640w.webp")} 640w,
              ${postImageUrls[post.id][0].replace(".png", "-1024w.webp")} 1024w
            `}
                            sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 100vw"
                            alt="Post image"
                            className="profilePost-image"
                            style={{ width: "100%", height: "180px" }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <React.Suspense fallback={<div>Loading slider...</div>}>
                          <Slider
                            {...sliderSettings}
                            ref={(slider) =>
                              (sliderRefs.current[post.id] = slider)
                            }
                          >
                            {postImageUrls[post.id] &&
                              postImageUrls[post.id].map((url, index) => (
                                <div key={index}>
                                  <img
                                    src={url.replace(".png", "-lowres.webp")}
                                    data-src={url.replace(".png", ".webp")}
                                    srcSet={`
                      ${url.replace(".png", "-320w.webp")} 320w,
                      ${url.replace(".png", "-640w.webp")} 640w,
                      ${url.replace(".png", "-1024w.webp")} 1024w
                    `}
                                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 100vw"
                                    alt={`Post image ${index}`}
                                    className="profilePost-image"
                                    style={{ width: "100%", height: "180px" }}
                                    onClick={(e) =>
                                      handleImageClick(
                                        e,
                                        sliderRefs.current[post.id]
                                      )
                                    }
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                          </Slider>
                        </React.Suspense>
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
            <img
              className="uploadPost-img"
              src={uploadPic}
              alt="Upload Product"
            />
          </button>
          {showModal && selectedPost && (
            <div className="overlay">
              <div
                className="mobile-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="closed-button" onClick={handleCloseModal}>
                  &times;
                </span>

                <div className="mobile-profile-post" key={selectedPost.id}>
                  <div className="mobile-post-header">
                    <Link
                      to={`/profile/${selectedPost.userId}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <img
                        src={
                          userData.userAvatarUrl
                            ? userData.userAvatarUrl.replace(
                                ".png",
                                "-lowres.webp"
                              )
                            : defaultAvatar
                        }
                        data-src={
                          userData.userAvatarUrl
                            ? userData.userAvatarUrl.replace(".png", ".webp")
                            : defaultAvatar
                        }
                        srcSet={
                          userData.userAvatarUrl
                            ? `
                  ${userData.userAvatarUrl.replace(".png", "-50w.webp")} 50w,
                  ${userData.userAvatarUrl.replace(".png", "-100w.webp")} 100w
                `
                            : `
                  ${defaultAvatar} 50w,
                  ${defaultAvatar} 100w
                `
                        }
                        sizes="50px"
                        alt="使用者頭像"
                        className="mobile-user-avatar"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          backgroundColor: "#f0f0f0",
                        }}
                        loading="lazy"
                      />
                    </Link>
                    <Link
                      to={`/profile/${selectedPost.userId}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <span className="mobile-user-name">
                        {userData ? userData.username : "未知使用者"}
                      </span>
                    </Link>
                  </div>

                  <h4>{selectedPost.title}</h4>

                  {postImageUrls[selectedPost.id] &&
                  Array.isArray(postImageUrls[selectedPost.id]) &&
                  postImageUrls[selectedPost.id].length === 1 ? (
                    <div
                      className="g-container"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={postImageUrls[selectedPost.id][0].replace(
                          ".png",
                          "-lowres.webp"
                        )}
                        data-src={postImageUrls[selectedPost.id][0].replace(
                          ".png",
                          ".webp"
                        )}
                        srcSet={`  
                ${postImageUrls[selectedPost.id][0].replace(
                  ".png",
                  "-320w.webp"
                )} 320w,
                ${postImageUrls[selectedPost.id][0].replace(
                  ".png",
                  "-640w.webp"
                )} 640w,
                ${postImageUrls[selectedPost.id][0].replace(
                  ".png",
                  "-1024w.webp"
                )} 1024w
              `}
                        sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 100vw"
                        alt="Post image"
                        className="mobile-post-image"
                        style={{
                          width: "100%",
                          height: "350px",
                          backgroundColor: "#f0f0f0",
                        }}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    postImageUrls[selectedPost.id] &&
                    Array.isArray(postImageUrls[selectedPost.id]) && (
                      <Suspense fallback={<div>Loading slider...</div>}>
                        <Slider
                          {...sliderSettings}
                          ref={(slider) =>
                            (sliderRefs.current[selectedPost.id] = slider)
                          }
                        >
                          {postImageUrls[selectedPost.id].map((url, index) => (
                            <div
                              className="g-container"
                              key={index}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src={url.replace(".png", "-lowres.webp")}
                                data-src={url.replace(".png", ".webp")}
                                srcSet={`  
                        ${url.replace(".png", "-320w.webp")} 320w,
                        ${url.replace(".png", "-640w.webp")} 640w,
                        ${url.replace(".png", "-1024w.webp")} 1024w
                      `}
                                sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 100vw"
                                alt={`Post image ${index}`}
                                className="mobile-post-image"
                                onClick={(e) =>
                                  handleImageClick(e, sliderRefs.current[selectedPost.id])
                                }
                                style={{
                                  width: "100%",
                                  height: "350px",
                                  backgroundColor: "#f0f0f0",
                                }}
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </Slider>
                      </Suspense>
                    )
                  )}

                  <div className="post-content">
                    <p className="post-text">{selectedPost.content}</p>
                    <p className="post-location">
                      發布地址：{selectedPost.city}
                      {selectedPost.district}
                      {selectedPost.street}
                    </p>
                    <p className="post-date">
                      發布於：
                      {new Date(selectedPost.createdAt).toLocaleString(
                        "zh-TW",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )}
                    </p>
                  </div>

                  <div className="post-actions">
                    <button
                      className="action-btn"
                      onClick={() => handleLike(selectedPost.id)}
                      style={{
                        color: likedPosts[selectedPost.id]
                          ? "#9E1212"
                          : "black",
                        fontWeight: likedPosts[selectedPost.id]
                          ? "bold"
                          : "normal",
                      }}
                    >
                      <img
                        className="heart-pic"
                        src={
                          likedPosts[selectedPost.id]
                            ? HeartPicFilled
                            : HeartPic
                        }
                        alt="讚"
                      />
                      {selectedPost.total_likes}
                    </button>
                    <button
                      className="comment-btn"
                      onClick={() => toggleComments(selectedPost.id)}
                    >
                      <img
                        className="comment-pic"
                        src={CommentPic}
                        alt="留言"
                      />
                      {selectedPost.total_comments}
                    </button>
                  </div>

                  {comments[selectedPost.id] &&
                    comments[selectedPost.id].visible && (
                      <>
                        <div className="comments-section">
                          {comments[selectedPost.id]?.list ? (
                            comments[selectedPost.id].list.length > 0 ? (
                              comments[selectedPost.id].list.map(
                                (comment, index) => (
                                  <div
                                    className="comment"
                                    key={comment.id || index}
                                  >
                                    <img
                                      src={comment.userAvatar || defaultAvatar}
                                      alt="評論者頭像"
                                      className="comment-avatar"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        backgroundColor: "#f0f0f0",
                                      }}
                                      loading="lazy"
                                    />
                                    <div className="comment-content">
                                      <div className="comment-author">
                                        {comment.username}
                                      </div>
                                      <div className="comment-text">
                                        {comment.content}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <div>No comment</div>
                            )
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
                          />
                          <button
                            className="send-btn"
                            onClick={() => handleAddComment(selectedPost.id)}
                          >
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
      ) : (
        <div className="desktop-type">
          <div className="content">
            <div className="container">
              <button className="setting-btn" onClick={handleSettingOut}>
                <img src={settingPic} alt="Settings" />
              </button>
              <div className="profile-header">
                <img
                  src={
                    (userData.userAvatarUrl &&
                      userData.userAvatarUrl.replace(/\.png$/i, ".webp")) ||
                    defaultAvatar
                  }
                  alt="用戶頭像"
                  className="profile-picture"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                  }}
                  loading="lazy"
                />
                <div className="profile-info">
                  <h1>{userData.username}</h1>
                  <p>Email: {userData.email}</p>
                  <p>Personal profile: {userData.bio}</p>
                  <p>
                    Join date:{" "}
                    {new Date(userData.joinDate).toLocaleDateString("zh-TW")}
                  </p>
                  <p>
                    Number of posts:{" "}
                    {userData.posts ? userData.posts.length : 0}
                  </p>
                </div>
                <button className="edit-profile-btn" onClick={toMember}>
                  Modify profile
                </button>
              </div>

              <div className="posts">
                {userData.posts && userData.posts[0] === "loading" ? (
                  <div className="loading-overlay">
                    <ClipLoader color="#666" size={50} />
                  </div>
                ) : userData.posts && userData.posts.length > 0 ? (
                  userData.posts.map((post) => (
                    <div className="mypost" key={post.id}>
                      <div
                        className="title-and-btn"
                        onClick={() => handlePostClick(post.id)}
                      >
                        <h3>{post.title}</h3>
                        {showOutDelete && (
                          <button
                            className="X-btn"
                            onClick={(event) =>
                              handleDeletePost(event, post.id)
                            }
                          >
                            <img src={XPic} alt="Delete Post" />
                          </button>
                        )}
                      </div>

                      {postImageUrls[post.id] &&
                      postImageUrls[post.id].length === 1 ? (
                        <div
                          className="g-container"
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <img
                            src={postImageUrls[post.id][0].replace(
                              ".png",
                              "-lowres.webp"
                            )}
                            data-src={postImageUrls[post.id][0].replace(
                              ".png",
                              ".webp"
                            )}
                            srcSet={`
              ${postImageUrls[post.id][0].replace(".png", "-320w.webp")} 320w,
              ${postImageUrls[post.id][0].replace(".png", "-640w.webp")} 640w,
              ${postImageUrls[post.id][0].replace(".png", "-1024w.webp")} 1024w
            `}
                            sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 100vw"
                            alt="Post image"
                            className="profilePost-image"
                            style={{ width: "100%", height: "220px" }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <React.Suspense fallback={<div>Loading slider...</div>}>
                          <Slider
                            {...sliderSettings}
                            ref={(slider) =>
                              (sliderRefs.current[post.id] = slider)
                            }
                          >
                            {postImageUrls[post.id] &&
                              postImageUrls[post.id].map((url, index) => (
                                <div key={index}>
                                  <img
                                    src={url.replace(".png", "-lowres.webp")}
                                    data-src={url.replace(".png", ".webp")}
                                    srcSet={`
                      ${url.replace(".png", "-320w.webp")} 320w,
                      ${url.replace(".png", "-640w.webp")} 640w,
                      ${url.replace(".png", "-1024w.webp")} 1024w
                    `}
                                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 100vw"
                                    alt={`Post image ${index}`}
                                    className="profilePost-image"
                                    style={{ width: "100%", height: "220px" }}
                                    onClick={(e) =>
                                      handleImageClick(
                                        e,
                                        sliderRefs.current[post.id]
                                      )
                                    }
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                          </Slider>
                        </React.Suspense>
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
            <img
              className="uploadPost-img"
              src={uploadPic}
              alt="Upload Product"
            />
          </button>

          {showModal && selectedPost && (
            <div className="overlay">
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <span className="closed-button" onClick={handleCloseModal}>
                  &times;
                </span>
                <div className="modal-image">
                  {postImageUrls[selectedPost.id] &&
                  postImageUrls[selectedPost.id].length === 1 ? (
                    <img
                      src={postImageUrls[selectedPost.id][0].replace(
                        ".png",
                        ".webp"
                      )}
                      className="modalPost-image"
                      alt="Post image"
                      style={{ width: "500px", height: "660px" }}
                      loading="lazy"
                    />
                  ) : (
                    <Slider
                      {...sliderSettings}
                      ref={(slider) =>
                        (sliderRefs.current[selectedPost.id] = slider)
                      }
                    >
                      {postImageUrls[selectedPost.id] &&
                        postImageUrls[selectedPost.id].map((url, index) => (
                          <div key={index}>
                            <img
                              src={url.replace(".png", ".webp")}
                              className="modalPost-image"
                              alt={`Post image ${index}`}
                              style={{ width: "500px", height: "660px" }}
                              onClick={(e) =>
                                handleImageClick(
                                  e,
                                  sliderRefs.current[selectedPost.id]
                                )
                              }
                              loading="lazy"
                            />
                          </div>
                        ))}
                    </Slider>
                  )}
                </div>
                <div
                  className="modalPost-content"
                  style={{ width: "500px", height: "660px" }}
                >
                  <div>
                    <button className="setting2-btn" onClick={handleSettingIn}>
                      <img src={settingPic} alt="Settings" />
                    </button>
                    <h2 className="modalPost-title">{selectedPost.title}</h2>
                  </div>
                  <p className="modalPost-text">{selectedPost.content}</p>
                  <p className="address">
                    發布地址: {selectedPost.city}
                    {selectedPost.district}
                    {selectedPost.street}
                  </p>
                  <p className="date">
                    發布於：
                    {new Date(selectedPost.createdAt).toLocaleString("zh-TW", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                  <p className="stray">
                    是否為流浪貓: {selectedPost.isStray ? "是" : "否"}
                  </p>

                  <div className="modalPost-actions">
                    <button
                      className="action-btn"
                      onClick={() => handleLike(selectedPost.id)}
                      style={{
                        color: likedPosts[selectedPost.id]
                          ? "#9E1212"
                          : "black",
                        fontWeight: likedPosts[selectedPost.id]
                          ? "bold"
                          : "normal",
                      }}
                    >
                      <img
                        className="heart-pic"
                        src={
                          likedPosts[selectedPost.id]
                            ? HeartPicFilled
                            : HeartPic
                        }
                        alt="讚"
                      />
                      {selectedPost.total_likes}
                    </button>
                    <button
                      className="comment-btn"
                      onClick={() => toggleComments(selectedPost.id)}
                    >
                      <img
                        className="comment-pic"
                        src={CommentPic}
                        alt="留言"
                      />
                      {selectedPost.total_comments}
                    </button>
                  </div>
                  {comments[selectedPost.id] &&
                    comments[selectedPost.id].visible && (
                      <>
                        <div className="comments-section">
                          {comments[selectedPost.id]?.list ? (
                            comments[selectedPost.id].list.length > 0 ? (
                              comments[selectedPost.id].list.map(
                                (comment, index) => (
                                  <div
                                    className="comment"
                                    key={comment.id || index}
                                  >
                                    <img
                                      src={comment.userAvatar || defaultAvatar}
                                      alt="評論者頭像"
                                      className="comment-avatar"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                      }}
                                      loading="lazy"
                                    />
                                    <div className="comment-content">
                                      <div className="title-and-btn">
                                        <div className="comment-author">
                                          {comment.username}
                                        </div>
                                        {showInDelete && (
                                          <button
                                            className="X-in-btn"
                                            onClick={() =>
                                              handleDeleteComment(comment.id)
                                            }
                                          >
                                            <img
                                              src={XPic}
                                              alt="Delete Comment"
                                            />
                                          </button>
                                        )}
                                      </div>
                                      <div className="comment-text">
                                        {comment.content}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <div>No comment</div>
                            )
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
                          />
                          <button
                            className="send-btn"
                            onClick={() => handleAddComment(selectedPost.id)}
                          >
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
      )}
    </div>
  );
}

export default Profile;
