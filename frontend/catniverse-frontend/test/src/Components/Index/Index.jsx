import React, { useState, useEffect, useRef, Suspense } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import HeartPic from "../../Image/comment-heart.png";
import HeartPicFilled from "../../Image/heart.png";
import CommentPic from "../../Image/comment.png";
import defaultAvatar from "../../Image/account.png";
import "./Index.css";

const Slider = React.lazy(() => import("react-slick"));

function Index() {
  const [postData, setPostData] = useState([]);
  const [userData, setUserData] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [postImageUrls, setPostImageUrls] = useState({});
  const [userImageUrls, setUserImageUrls] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const observerRef = useRef(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const sliderRef = useRef({});
  const [cnt, setCnt] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const taiwanRegions = [
    "臺北市",
    "新北市",
    "桃園市",
    "台中市",
    "臺南市",
    "高雄市",
    "基隆市",
    "新竹市",
    "新竹縣",
    "苗栗縣",
    "彰化縣",
    "南投縣",
    "雲林縣",
    "嘉義市",
    "嘉義縣",
    "屏東縣",
    "宜蘭縣",
    "花蓮縣",
    "臺東縣",
    "澎湖縣",
    "金門縣",
    "連江縣",
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleInitialLoad = async () => {
      if (!sessionStorage.getItem("hasReloaded")) {
        sessionStorage.setItem("hasReloaded", "true");
        window.location.reload();
      }

      if (!observerRef.current) {
        observerRef.current = true;
        setIsLoading(true);
        await handlePopularPost();
        setIsLoading(false);
      }
    };

    handleInitialLoad();
  }, []);

  const fetchPostData = async (posts) => {
    const userId = localStorage.getItem("userId");
  
    const postPromises = posts.map(async (post) => {
      const userPromise = fetchUserData(post.userId);
      const commentsPromise = fetchComments(post.id);
      const imagePromise =
        post.postImages && post.postImages.length > 0
          ? fetchPostImages(
              post.postImages.map((img) => img.downloadUrl),
              post.id
            )
          : Promise.resolve();
  
      const likedPromise = userId ? checkIfLiked(post.id) : Promise.resolve();
  
      await Promise.all([userPromise, commentsPromise, imagePromise, likedPromise]);
      return post; 
    });
  
    const processedPosts = await Promise.all(postPromises);
    return processedPosts; 
  };  

  const fetchAnotherPostData = async (posts) => {
    const userId = localStorage.getItem("userId");

    const postPromises = posts.map(async (post) => {
      const userPromise = fetchUserData(post.userId);
      const commentsPromise = fetchComments(post.id);
      const imagePromise =
        post.postImages && post.postImages.length > 0
          ? fetchPostImages(
              post.postImages.map((img) => img.downloadUrl),
              post.id
            )
          : Promise.resolve();

      const likedPromise = userId ? checkIfLiked(post.id) : Promise.resolve();

      return Promise.all([
        userPromise,
        commentsPromise,
        imagePromise,
        likedPromise,
      ]);
    });

    await Promise.all(postPromises);
    setPostData(posts);
  };

  const fetchPostImages = async (downloadUrls, postId) => {
    try {
      const imageBlobPromises = downloadUrls.map(async (downloadUrl) => {
        const response = await axios.get(
          `https://api.catniverse.website:5000${downloadUrl.replace(".png", ".webp")}`,
          {
            responseType: "blob",
          }
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

  const fetchUserData = async (userId) => {
    if (userData[userId]) return;
    try {
      const response = await axios.get(
        `https://api.catniverse.website:5000/api/v1/users/${userId}/user`
      );
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
    } catch (error) {
      console.error(`Error fetching user data for userId ${userId}:`, error);
    }
  };

  const fetchImage = async (downloadUrl) => {
    try {
      const response = await axios.get(
        `https://api.catniverse.website:5000${downloadUrl}`,
        { responseType: "blob" }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handlePopularPost = async () => {
    try {
      setCnt(1);
      setPostData([]);
      setIsLoading(true);
      const response = await axios.get(
        `https://api.catniverse.website:5000/api/v1/posts/popular?page=${cnt}`
      );
      const posts = response.data.data;
      const processedPosts = await fetchPostData(posts);

    setPostData((prevPosts) => {
      const allPosts = [...prevPosts, ...processedPosts];
      const uniquePosts = Array.from(
        new Set(allPosts.map((post) => post.id))
      ).map((id) => allPosts.find((post) => post.id === id));
      return uniquePosts;
    });
    } catch (error) {
      console.error("Error fetching popular posts: ", error);
    }
    setIsLoading(false);
  };

  const handleLatestPost = async () => {
    try {
      setCnt(1);
      setPostData([]);
      setIsLoading(true);
      const response = await axios.get(
        "https://api.catniverse.website:5000/api/v1/posts/latest"
      );
      const posts = response.data.data;
      await fetchAnotherPostData(posts);
    } catch (error) {
      console.error("Error fetching latest posts: ", error);
    }
    setIsLoading(false);
  };

  const handleRegionPost = async (e) => {
    const region = e.target.value;
    setSelectedRegion(region);

    try {
      setCnt(1);
      setPostData([]);
      setIsLoading(true);
      if (region) {
        const response = await axios.get(
          `https://api.catniverse.website:5000/api/v1/posts/region`,
          {
            params: { city: region },
          }
        );
        const posts = response.data.data;
        await fetchAnotherPostData(posts);
      } else {
        handlePopularPost();
      }
    } catch (error) {
      console.error("Error fetching region-based posts: ", error);
    }
    setIsLoading(false);
  };

  const checkIfLiked = async (postId) => {
    try {
      const response = await axios.get(
        "https://api.catniverse.website:5000/api/v1/likes/existed",
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
        //console.error(`Error checking like status for post ${postId}:`, error);
      }
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(
        `https://api.catniverse.website:5000/api/v1/comments/from-post/${postId}`
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
        [postId]: { visible: false, list: commentsWithUserInfo },
      }));
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
    }
  };

  const fetchUserDetails = async (userId) => {
    return axios.get(`https://api.catniverse.website:5000/api/v1/users/${userId}/user`);
  };

  const fetchCommentImage = async (downloadUrl) => {
    try {
      const response = await axios.get(
        `https://api.catniverse.website:5000${downloadUrl}`,
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
      alert("請先登入才可留言！")
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;

    try {
      const response = await axios.post(
        `https://api.catniverse.website:5000/api/v1/comments/add/${postId}`,
        null,
        {
          params: { content: commentText },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPostData((prevState) =>
          prevState.map((post) =>
            post.id === postId
              ? { ...post, total_comments: post.total_comments + 1 }
              : post
          )
        );
        await fetchComments(postId);
        setCommentText("");
      }
    } catch (error) {
      console.error(`Error posting comment for post ${postId}:`, error);
    }
  };

  const handleLike = async (postId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("請先登入才可按讚！")
      return;
    }

    const isLiked = likedPosts[postId];

    try {
      if (isLiked) {
        await axios.delete(
          "https://api.catniverse.website:5000/api/v1/likes/remove-like",
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

        setPostData((prevState) =>
          prevState.map((post) =>
            post.id === postId
              ? { ...post, total_likes: post.total_likes - 1 }
              : post
          )
        );
      } else {
        await axios.post(
          "https://api.catniverse.website:5000/api/v1/likes/add-like",
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

        setPostData((prevState) =>
          prevState.map((post) =>
            post.id === postId
              ? { ...post, total_likes: post.total_likes + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error(`Error updating like for post ${postId}:`, error);
      alert("帳號憑證已過期，請重新登入！")
    }
  };

  const loadMorePosts = async () => {
    try {
      let newCount = cnt + 1;
      setCnt(newCount);
  
      const response = await axios.get(
        `https://api.catniverse.website:5000/api/v1/posts/popular?page=${newCount}`
      );
      const newPosts = response.data.data;
  
      const processedNewPosts = await fetchPostData(newPosts);
  
      setPostData((prevPosts) => {
        const allPosts = [...prevPosts, ...processedNewPosts];
        const uniquePosts = Array.from(
          new Set(allPosts.map((post) => post.id))
        ).map((id) => allPosts.find((post) => post.id === id));
        return uniquePosts;
      });
  
      setVisibleCount((prevCount) => prevCount + 5); 
    } catch (error) {
      console.error("Error loading more posts:", error);
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
      {isMobile ? (
        <div className="mobile-container">
          <div className="mobile-filter">
            <button className="popular" onClick={handlePopularPost}>
              Popular
            </button>
            <button className="latest" onClick={handleLatestPost}>
              Latest
            </button>
            <select
              className="region"
              value={selectedRegion}
              onChange={handleRegionPost}
            >
              <option value="">Region</option>
              {taiwanRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div className="mobile-content">
            <div className="NoContainer">
              <br />
              {isLoading === true ? (
                <div className="loading-overlay">
                  <ClipLoader color={"#666"} size={50} />
                </div>
              ) : (
                <>
                  <div id="mobile-post-list">
                    {postData.length > 0 ? (
                      postData.slice(0, visibleCount).map((post) => {
                        let sliderRef = React.createRef();
                        const user = userData[post.userId];
                        const avatarUrl = userImageUrls[post.userId];
                        const postComments = comments[post.id]?.list || [];

                        return (
                          <div className="mobile-post" key={post.id}>
                            {/* Header Section */}
                            <div className="mobile-post-header">
                              <Link
                                to={`/profile/${post.userId}`}
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                }}
                              >
                                <img
                                  src={
                                    avatarUrl
                                      ? avatarUrl.replace(
                                          ".png",
                                          "-lowres.webp"
                                        )
                                      : defaultAvatar
                                  }
                                  alt="使用者頭像"
                                  className="user-avatar"
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
                                to={`/profile/${post.userId}`}
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                }}
                              >
                                <span className="user-name">
                                  {user ? user.username : "未知使用者"}
                                </span>
                              </Link>
                            </div>

                            <h4>{post.title}</h4>

                            {postImageUrls[post.id] &&
                            Array.isArray(postImageUrls[post.id]) &&
                            postImageUrls[post.id].length === 1 ? (
                              <div
                                className="g-container"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <img
                                  src={postImageUrls[post.id][0].replace(
                                    ".png",
                                    "-lowres.webp"
                                  )}
                                  alt="Post image"
                                  className="post-image"
                                  style={{
                                    width: "95%",
                                    height: "400px",
                                    aspectRatio: "16/9",
                                    backgroundColor: "#f0f0f0",
                                  }}
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              postImageUrls[post.id] &&
                              Array.isArray(postImageUrls[post.id]) && (
                                <Suspense
                                  fallback={<div>Loading slider...</div>}
                                >
                                  <Slider {...sliderSettings(sliderRef)}>
                                    {postImageUrls[post.id].map(
                                      (url, index) => (
                                        <div
                                          className="g-container"
                                          key={index}
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <img
                                            src={url.replace(
                                              ".png",
                                              "-lowres.webp"
                                            )}
                                            alt={`Post image ${index}`}
                                            className="post-image"
                                            style={{
                                              width: "95%",
                                              height: "400px",
                                              aspectRatio: "16/9",
                                              backgroundColor: "#f0f0f0",
                                            }}
                                            loading="lazy"
                                            onClick={(e) =>
                                              handleImageClick(
                                                e,
                                                sliderRef.current
                                              )
                                            }
                                          />
                                        </div>
                                      )
                                    )}
                                  </Slider>
                                </Suspense>
                              )
                            )}
                            <div className="post-content">
                              <p className="post-text">{post.content}</p>
                              <p className="post-stray">流浪狀態：{post.stray === true? "流浪貓" : "非流浪貓"}</p>
                              <p className="post-cropped">剪耳狀態：{post.tipped === true? "已剪耳" : "未剪耳"}</p>
                              <p className="post-location">
                                發布地址：{post.city}
                                {post.district}
                                {post.street}
                              </p>
                              <p className="post-date">
                                發布於：
                                {new Date(post.createdAt).toLocaleString(
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
                                onClick={() => handleLike(post.id)}
                                style={{
                                  color: likedPosts[post.id]
                                    ? "#9E1212"
                                    : "black",
                                  fontWeight: likedPosts[post.id]
                                    ? "bold"
                                    : "normal",
                                }}
                              >
                                <img
                                  className="heart-pic"
                                  src={
                                    likedPosts[post.id]
                                      ? HeartPicFilled
                                      : HeartPic
                                  }
                                  alt="讚"
                                />
                                {post.total_likes}
                              </button>
                              <button
                                className="comment-btn"
                                onClick={() => toggleComments(post.id)}
                              >
                                <img
                                  className="comment-pic"
                                  src={CommentPic}
                                  alt="留言"
                                />
                                {post.total_comments}
                              </button>
                            </div>
                            {comments[post.id] && comments[post.id].visible && (
                              <>
                                <div className="comments-section">
                                  {comments[post.id]?.list ? (
                                    comments[post.id].list.length > 0 ? (
                                      postComments.map((comment, index) => (
                                        <div
                                          className="comment"
                                          key={comment.id || index}
                                        >
                                          <img
                                            src={
                                              comment.userAvatar ||
                                              defaultAvatar
                                            }
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
                                      ))
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
                                    onChange={(e) =>
                                      setCommentText(e.target.value)
                                    }
                                  />
                                  <button
                                    className="send-btn"
                                    onClick={() => handleAddComment(post.id)}
                                  >
                                    Send
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p>There are no posts yet</p>
                    )}
                  </div>
                  <div className="load-more-container">
                    {visibleCount && (
                      <button className="load-more" onClick={loadMorePosts}>
                        Loading more posts...
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="desktop-container">
          <div className="chooseType">
            <h1
              className="index-title"
              style={{ fontFamily: "Times New Roman" }}
            >
              Catniverse
            </h1>
            <button className="popular" onClick={handlePopularPost}>
              Popular
            </button>
            <button className="latest" onClick={handleLatestPost}>
              Latest
            </button>
            <select
              className="region"
              value={selectedRegion}
              onChange={handleRegionPost}
            >
              <option value="">Region</option>
              {taiwanRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div className="content">
            <div className="NoContainer">
              <br />
              {isLoading === true ? (
                <div className="loading-overlay">
                  <ClipLoader color={"#666"} size={50} />
                </div>
              ) : (
                <>
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
                              <Link
                                to={`/profile/${post.userId}`}
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                }}
                              >
                                <img
                                  src={
                                    avatarUrl
                                      ? avatarUrl.replace(
                                          ".png",
                                          "-lowres.webp"
                                        )
                                      : defaultAvatar
                                  }
                                  data-src={
                                    avatarUrl
                                      ? avatarUrl.replace(".png", ".webp")
                                      : defaultAvatar
                                  }
                                  srcSet={
                                    avatarUrl
                                      ? `
                            ${avatarUrl.replace(".png", "-50w.webp")} 50w,
                            ${avatarUrl.replace(".png", "-100w.webp")} 100w
                          `
                                      : `
                            ${defaultAvatar} 50w,
                            ${defaultAvatar} 100w
                          `
                                  }
                                  sizes="50px"
                                  alt="使用者頭像"
                                  className="user-avatar"
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
                                to={`/profile/${post.userId}`}
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                }}
                              >
                                <span className="user-name">
                                  {user ? user.username : "未知使用者"}
                                </span>
                              </Link>
                            </div>

                            <h4>{post.title}</h4>

                            {postImageUrls[post.id] &&
                            Array.isArray(postImageUrls[post.id]) &&
                            postImageUrls[post.id].length === 1 ? (
                              <div
                                className="g-container"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
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
                              ${postImageUrls[post.id][0].replace(
                                ".png",
                                "-320w.webp"
                              )} 320w,
                              ${postImageUrls[post.id][0].replace(
                                ".png",
                                "-640w.webp"
                              )} 640w,
                              ${postImageUrls[post.id][0].replace(
                                ".png",
                                "-1024w.webp"
                              )} 1024w
                            `}
                                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 100vw"
                                  alt="Post image"
                                  className="post-image"
                                  style={{
                                    width: "95%",
                                    height: "500px",
                                    aspectRatio: "16/9",
                                    backgroundColor: "#f0f0f0",
                                  }}
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              postImageUrls[post.id] &&
                              Array.isArray(postImageUrls[post.id]) && (
                                <Suspense
                                  fallback={<div>Loading slider...</div>}
                                >
                                  <Slider {...sliderSettings(sliderRef)}>
                                    {postImageUrls[post.id].map(
                                      (url, index) => (
                                        <div
                                          className="g-container"
                                          key={index}
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <img
                                            src={url.replace(
                                              ".png",
                                              "-lowres.webp"
                                            )}
                                            data-src={url.replace(
                                              ".png",
                                              ".webp"
                                            )}
                                            srcSet={`  
                                      ${url.replace(".png", "-320w.webp")} 320w,
                                      ${url.replace(".png", "-640w.webp")} 640w,
                                      ${url.replace(
                                        ".png",
                                        "-1024w.webp"
                                      )} 1024w
                                    `}
                                            sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 100vw"
                                            alt={`Post image ${index}`}
                                            className="post-image"
                                            onClick={(e) =>
                                              handleImageClick(
                                                e,
                                                sliderRef.current
                                              )
                                            }
                                            style={{
                                              width: "95%",
                                              height: "500px",
                                              aspectRatio: "16/9",
                                              backgroundColor: "#f0f0f0",
                                            }}
                                            loading="lazy"
                                          />
                                        </div>
                                      )
                                    )}
                                  </Slider>
                                </Suspense>
                              )
                            )}
                            <div className="post-content">
                              <p className="post-text">{post.content}</p>
                              <p className="post-stray">流浪狀態：{post.stray === true? "流浪貓" : "非流浪貓"}</p>
                              <p className="post-cropped">剪耳狀態：{post.tipped === true? "已剪耳" : "未剪耳"}</p>
                              <p className="post-location">
                                發布地址：{post.city}
                                {post.district}
                                {post.street}
                              </p>
                              <p className="post-date">
                                發布於：
                                {new Date(post.createdAt).toLocaleString(
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
                                onClick={() => handleLike(post.id)}
                                style={{
                                  color: likedPosts[post.id]
                                    ? "#9E1212"
                                    : "black",
                                  fontWeight: likedPosts[post.id]
                                    ? "bold"
                                    : "normal",
                                }}
                              >
                                <img
                                  className="heart-pic"
                                  src={
                                    likedPosts[post.id]
                                      ? HeartPicFilled
                                      : HeartPic
                                  }
                                  alt="讚"
                                />
                                {post.total_likes}
                              </button>
                              <button
                                className="comment-btn"
                                onClick={() => toggleComments(post.id)}
                              >
                                <img
                                  className="comment-pic"
                                  src={CommentPic}
                                  alt="留言"
                                />
                                {post.total_comments}
                              </button>
                            </div>
                            {comments[post.id] && comments[post.id].visible && (
                              <>
                                <div className="comments-section">
                                  {comments[post.id]?.list ? (
                                    comments[post.id].list.length > 0 ? (
                                      postComments.map((comment, index) => (
                                        <div
                                          className="comment"
                                          key={comment.id || index}
                                        >
                                          <img
                                            src={
                                              comment.userAvatar ||
                                              defaultAvatar
                                            }
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
                                      ))
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
                                    onChange={(e) =>
                                      setCommentText(e.target.value)
                                    }
                                  />
                                  <button
                                    className="send-btn"
                                    onClick={() => handleAddComment(post.id)}
                                  >
                                    Send
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p>There are no posts yet</p>
                    )}
                  </div>

                  {visibleCount && (
                    <button className="load-more" onClick={loadMorePosts}>
                      Loading more posts...
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
