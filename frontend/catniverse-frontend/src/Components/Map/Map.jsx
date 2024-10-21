import React, { useEffect, useRef, useState, Suspense} from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import axios from "axios";
import { feature } from "topojson-client"; 
import "./Map.css";
import topoData from "../../../src/taiwan-townships.json";
import countyBoundaries from "../../../src/countyboundary.json";
import { regionOptions } from "./regionOptions"; 
import HeartPic from "../../Image/comment-heart.png";
import HeartPicFilled from "../../Image/heart.png";
import CommentPic from "../../Image/comment.png";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2hlZHlqdWFuYTk5IiwiYSI6ImNtMTRnY2U5ajB4ZzYyanBtMjBrMXd1a3UifQ.OcvE1wSjJs8Z1VpQDM12tg";

const Slider = React.lazy(() => import('react-slick'));

const sliderSettings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  dots: false,
};

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedCounty, setSelectedCounty] = useState(""); 
  const [selectedRegion, setSelectedRegion] = useState(null); 
  const [userLocation, setUserLocation] = useState(null); 
  const [areaName, setAreaName] = useState(""); 
  const [cats, setCats] = useState([]); 
  const [catsImageUrls, setCatsImageUrls] = useState({});
  const [selectedCat, setSelectedCat] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const token = localStorage.getItem("token");
  const sliderRefs = useRef({});
  const dataCache = useRef({});
  const [loading, setLoading] = useState(false);
  const [notNeuteredCount, setNotNeuteredCount] = useState(0);
  const [neuteredCount, setNeuteredCount] = useState(0);

  const twBoundaries = feature(topoData, topoData.objects["TOWN_MOI_1130718"]); 

  const cities = Object.keys(
    countyBoundaries.features.reduce((acc, feature) => {
      acc[feature.properties.COUNTYNAME] = true;
      return acc;
    }, {})
  );

  const towns = selectedCounty ? regionOptions[selectedCounty] || [] : [];

  const handleCountyChange = (e) => {
    const county = e.target.value;
    setSelectedCounty(county);
    setSelectedRegion(null); 
    removeRegionBoundary(); 
    drawCountyBoundary(county); 
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(Number(e.target.value));
    removeCountyBoundary(); // 當選擇區域時，移除縣市邊界圖層
  };

  // 監聽 selectedCounty 的變化並抓取貓咪數據
  useEffect(() => {
    if (selectedCounty) {
      fetchCatsData();
    }
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedRegion !== null) {
      drawRegionBoundary(selectedRegion);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        zoom: 7,
        center: [120.906189, 23.634318],
        maxBounds: [
          [118.0, 20.0],
          [123.5, 26.5],
        ],
      });

      map.addControl(new mapboxgl.NavigationControl());

      const canvas = map.getCanvas();

      canvas.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
        },
        { passive: true }
      );

      mapRef.current = map;
    }
  }, []);

  useEffect(() => {
    let markers = [];
    if (
      mapRef.current &&
      selectedCounty &&
      cats.length > 0 
    ) {
      cats.forEach((cat) => {
        const catImageUrls =
          catsImageUrls[cat.id] && catsImageUrls[cat.id].length > 0
            ? catsImageUrls[cat.id] // 使用图片
            : null;

        if (catImageUrls) {
          const catMarker = document.createElement("div");
          catMarker.style.backgroundImage = `url(${catImageUrls})`;
          catMarker.style.width = "50px";
          catMarker.style.height = "50px";
          catMarker.style.backgroundSize = "cover";
          catMarker.style.zIndex = "10";

          const marker = new mapboxgl.Marker(catMarker)
            .setLngLat([cat.longitude, cat.latitude])
            .addTo(mapRef.current);

          marker.getElement().addEventListener("click", () => {
            setSelectedCat(cat); 
            setShowModal(true); 
          });

          markers.push(marker);
        }
      });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [selectedCounty, cats, catsImageUrls]);

  useEffect(() => {
    if (selectedCat) {
      fetchComments(selectedCat.id);
      checkIfLiked(selectedCat.id);
    }
  }, [selectedCat]);

  const fetchComments = async (catId) => {
    try {
      const response = await axios.get(`http://140.136.151.71:8787/api/v1/comments/from-post/${catId}`);
      const commentsData = response.data.data || [];
      const commentsWithUserInfo = await Promise.all(
        commentsData.map(async (comment) => {
          const userResponse = await fetchUserDetails(comment.userId);
          const user = userResponse.data.data;
          let avatarUrl = null;
          if (user.userAvatar && user.userAvatar.downloadUrl) {
            avatarUrl = await fetchImage(user.userAvatar.downloadUrl);
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
        [catId]: { visible: true, list: commentsWithUserInfo },
      }));
    } catch (error) {
      console.error(`Error fetching comments for post ${catId}:`, error);
    }
  };

  const fetchUserDetails = async (userId) => {
    return axios.get(`http://140.136.151.71:8787/api/v1/users/${userId}/user`);
  };

  const handleLike = async (catId) => {
    const isLiked = likedPosts[catId];
    try {
      if (isLiked) {
        await axios.delete("http://140.136.151.71:8787/api/v1/likes/remove-like", {
          params: { postId: catId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLikedPosts((prevState) => ({
          ...prevState,
          [catId]: false,
        }));

        setSelectedCat((prevState) => ({
          ...prevState,
          total_likes: prevState.total_likes - 1,
        }));
      } else {
        await axios.post("http://140.136.151.71:8787/api/v1/likes/add-like", null, {
          params: { postId: catId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLikedPosts((prevState) => ({
          ...prevState,
          [catId]: true,
        }));

        setSelectedCat((prevState) => ({
          ...prevState,
          total_likes: prevState.total_likes + 1,
        }));
      }
    } catch (error) {
      console.error(`Error updating like for post ${catId}:`, error);
    }
  };

  const checkIfLiked = async (catId) => {
    try {
      const response = await axios.get("http://140.136.151.71:8787/api/v1/likes/existed", {
        params: { postId: catId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.data) {
        setLikedPosts((prevState) => ({
          ...prevState,
          [catId]: true,
        }));
      } else {
        setLikedPosts((prevState) => ({
          ...prevState,
          [catId]: false,
        }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setLikedPosts((prevState) => ({
          ...prevState,
          [catId]: false,
        }));
      } else {
        console.error(`Error checking like status for post ${catId}:`, error);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedCat(null); 
    setShowModal(false); 
  };

  const handleAddComment = async (catId) => {
    if (!commentText.trim()) return;
  
    try {
      await axios.post(`http://140.136.151.71:8787/api/v1/comments/add/${catId}`, null, {
        params: { content: commentText },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      setCommentText("");
      fetchComments(catId);
  
      setSelectedCat((prevSelectedCat) => ({
        ...prevSelectedCat,
        total_comments: prevSelectedCat.total_comments + 1,
      }));
  
      setCats((prevCats) =>
        prevCats.map((cat) =>
          cat.id === catId ? { ...cat, total_comments: cat.total_comments + 1 } : cat
        )
      );
    } catch (error) {
      console.error(`Error posting comment for post ${catId}:`, error);
    }
  };  

  const toggleComments = (catId) => {
    setComments((prevState) => ({
      ...prevState,
      [catId]: {
        ...prevState[catId],
        visible: !prevState[catId]?.visible,
      },
    }));
  };


  const drawCountyBoundary = (selectedCountyName) => {
    const selectedCountyFeature = countyBoundaries.features.find(
      (feature) => feature.properties.COUNTYNAME === selectedCountyName
    );

    if (mapRef.current && selectedCountyFeature) {
      if (mapRef.current.getLayer("selected-county")) {
        mapRef.current.removeLayer("selected-county");
      }
      if (mapRef.current.getSource("selected-county")) {
        mapRef.current.removeSource("selected-county");
      }

      mapRef.current.addSource("selected-county", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [selectedCountyFeature],
        },
      });

      mapRef.current.addLayer({
        id: "selected-county",
        type: "line", 
        source: "selected-county",
        layout: {},
        paint: {
          "line-color": "#0000FF", 
          "line-width": 3,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      selectedCountyFeature.geometry.coordinates[0].forEach((coord) => {
        bounds.extend(coord);
      });
      mapRef.current.fitBounds(bounds, { padding: 20 });
    }
  };

  const removeCountyBoundary = () => {
    if (mapRef.current) {
      if (mapRef.current.getLayer("selected-county")) {
        mapRef.current.removeLayer("selected-county");
      }
      if (mapRef.current.getSource("selected-county")) {
        mapRef.current.removeSource("selected-county");
      }
    }
  };

  const removeRegionBoundary = () => {
    if (mapRef.current) {
      if (mapRef.current.getLayer("selected-region")) {
        mapRef.current.removeLayer("selected-region");
      }
      if (mapRef.current.getSource("selected-region")) {
        mapRef.current.removeSource("selected-region");
      }
    }
  };

  const drawRegionBoundary = (regionIndex) => {
    const selectedFeature = twBoundaries.features[regionIndex];

    if (mapRef.current && selectedFeature) {
      if (mapRef.current.getLayer("selected-region")) {
        mapRef.current.removeLayer("selected-region");
      }
      if (mapRef.current.getSource("selected-region")) {
        mapRef.current.removeSource("selected-region");
      }

      mapRef.current.addSource("selected-region", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [selectedFeature],
        },
      });

      mapRef.current.addLayer({
        id: "selected-region",
        type: "line",
        source: "selected-region",
        layout: {},
        paint: {
          "line-color": "#FF0000",
          "line-width": 2,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      selectedFeature.geometry.coordinates[0].forEach((coord) => {
        bounds.extend(coord);
      });
      mapRef.current.fitBounds(bounds, { padding: 20 });
    }
  };

  const fetchCatsData = async () => {
    if (dataCache.current[selectedCounty]) {
      setCats(dataCache.current[selectedCounty]);  
      return;
    }
    setCatsImageUrls({});
    setLoading(true);
  const placeholderColor = "#ccc"; 

  try {
    const response = await axios.get(`http://140.136.151.71:8787/api/v1/posts/region`, {
      params: { city: selectedCounty },
    });
    const posts = response.data.data;
    setCats(posts);
    console.log(posts);

    const imageUrls = {}; 
    let neutered = 0;  
    let notNeutered = 0; 

    posts.forEach(post => {
      if (post.postImages && post.postImages.length > 0) {
        imageUrls[post.id] = [placeholderColor]; 
      } else {
        console.warn(`Post ${post.id} 沒有圖片`);
      }
      if (post.tipped) {
        neutered += 1;  
      } else {
        notNeutered += 1;  
      }
    });
    setNeuteredCount(neutered);
    setNotNeuteredCount(notNeutered);
    setCatsImageUrls(imageUrls);  

    for (const post of posts) {
      if (post.postImages && post.postImages.length > 0) {
        const postImagesUrls = [];
        for (const image of post.postImages) {
          const url = await fetchImage(image.downloadUrl);  
          postImagesUrls.push(url);
        }

        setCatsImageUrls(prevState => ({
          ...prevState,
          [post.id]: postImagesUrls,
        }));
      }
    }
  } catch (error) {
    console.error("Error fetching region-based posts: ", error);
  }
    setLoading(false);
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

  const handleLocateUser = () => {
    if (userLocation && mapRef.current) {
      const map = mapRef.current;
      map.flyTo({
        center: userLocation,
        zoom: 14,
        essential: true,
      });
    } else {
      alert("無法獲取您的位置。請確保已啟用位置服務並允許瀏覽器訪問您的位置。");
    }
  };

  const handleReset = () => {
    setSelectedCounty("");
    setSelectedRegion(null);

    if (mapRef.current) {
      const map = mapRef.current;

      removeCountyBoundary();
      removeRegionBoundary();

      map.flyTo({
        center: [120.906189, 23.634318],
        zoom: 7,
      });
    }
  };

  return (
    <div className="map">
      <div
        ref={mapContainerRef}
        className="map-container"
        style={{ height: "100vh", width: "100%" }}
      />
      <button className="locate-button" onClick={handleLocateUser}>
        定位到我
      </button>
      <div className="info-box">
        <h3>貓咪資訊</h3>
        <p>
          <strong>未絕育數量:</strong> {notNeuteredCount}
        </p>
        <p>
          <strong>已絕育數量:</strong> {neuteredCount}
        </p>
      </div>
      <div className="info-box-select">
        <h3>選擇台灣縣市、區與里</h3>

        <label>選擇縣市</label>
        <select value={selectedCounty} onChange={handleCountyChange}>
          <option value="" disabled>
            請選擇縣市
          </option>
          {cities.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>

        <label>選擇鄉鎮市區</label>
        <select
          value={selectedRegion !== null ? selectedRegion : ""}
          onChange={handleRegionChange}
          disabled={!selectedCounty}
        >
          <option value="" disabled>
            請選擇鄉鎮市區
          </option>
          {towns.map((region, index) => (
            <option key={index} value={region.geometryIndex}>
              {region.name}
            </option>
          ))}
        </select>

        <button onClick={handleReset}>重新選擇</button>
      </div>
      {loading && <div className="loading-overlay">Loading...</div>} 
      {showModal && selectedCat && (
        <div className="overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="closed-button" onClick={handleCloseModal}>
              &times;
            </span>
            <div className="modal-image">
              {catsImageUrls[selectedCat.id] && catsImageUrls[selectedCat.id].length === 1 ? (
                <img
                  src={catsImageUrls[selectedCat.id][0].replace(".png", ".webp")}
                  className="modalPost-image"
                  alt="Cat image"
                  style={{ width: "500px", height: "660px" }}
                  loading="lazy"
                />
              ) : (
                <Suspense fallback={<div>Loading slider...</div>}>
                  <Slider {...sliderSettings} ref={(slider) => (sliderRefs.current[selectedCat.id] = slider)}>
                    {catsImageUrls[selectedCat.id] &&
                      catsImageUrls[selectedCat.id].map((url, index) => (
                        <div key={index}>
                          <img
                            src={url.replace(".png", ".webp")}
                            className="modalPost-image"
                            alt={`Cat image ${index}`}
                            style={{ width: "500px", height: "660px" }}
                            loading="lazy"
                          />
                        </div>
                      ))}
                  </Slider>
                </Suspense>
              )}
            </div>
            <div className="modalPost-content" style={{ width: "500px", height: "660px" }}>
              <div>
                <h2 className="modalPost-title">{selectedCat.title}</h2>
              </div>
              <p className="modalPost-text">{selectedCat.content}</p>
              <p className="address">發布地址: {selectedCat.city}{selectedCat.district}{selectedCat.street}</p>
              <p className="date">
                發布於：{new Date(selectedCat.createdAt).toLocaleString("zh-TW", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
              <p className="stray">是否為流浪貓: {selectedCat.isStray ? "是" : "否"}</p>

              <div className="modalPost-actions">
                <button
                  className="action-btn"
                  onClick={() => handleLike(selectedCat.id)}
                  style={{
                    color: likedPosts[selectedCat.id] ? "#9E1212" : "black",
                    fontWeight: likedPosts[selectedCat.id] ? "bold" : "normal",
                  }}
                >
                  <img
                    className="heart-pic"
                    src={likedPosts[selectedCat.id] ? HeartPicFilled : HeartPic}
                    alt="讚"
                  />
                  {selectedCat.total_likes}
                </button>
                <button className="comment-btn" onClick={() => toggleComments(selectedCat.id)}>
                  <img className="comment-pic" src={CommentPic} alt="留言" />
                  {selectedCat.total_comments}
                </button>
              </div>

              {comments[selectedCat.id] && comments[selectedCat.id].visible && (
                <>
                  <div className="comments-section">
                    {comments[selectedCat.id]?.list?.length > 0 ? (
                      comments[selectedCat.id].list.map((comment, index) => (
                        <div className="comment" key={index}>
                          <img
                            src={comment.userAvatar ? comment.userAvatar.replace(".png", ".webp") : "defaultAvatar.webp"}
                            alt="評論者頭像"
                            className="comment-avatar"
                            style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                            loading="lazy"
                          />
                          <div className="comment-content">
                            <div className="title-and-btn">
                              <div className="comment-author">{comment.username}</div>
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
                    <button className="send-btn" onClick={() => handleAddComment(selectedCat.id)}>
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
};

export default Map;
