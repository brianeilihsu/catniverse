import React, { useEffect, useRef, useState, Suspense } from "react";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { feature } from "topojson-client";
import "./Map.css";
import townTopoData from "../../../src/taiwan-townships.json";
import countyTopoData from "../../../src/taiwan-countyships.json";
import { regionOptions } from "./regionOptions";
import { countyOptions } from "./countyOptions";
import HeartPic from "../../Image/comment-heart.png";
import HeartPicFilled from "../../Image/heart.png";
import CommentPic from "../../Image/comment.png";
import mapPic from "../../Image/map.png";
import filterPic from "../../Image/filter.png";
import defaultAvatar from "../../Image/account.png";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2hlZHlqdWFuYTk5IiwiYSI6ImNtMTRnY2U5ajB4ZzYyanBtMjBrMXd1a3UifQ.OcvE1wSjJs8Z1VpQDM12tg";

const Slider = React.lazy(() => import("react-slick"));

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geolocateControlRef = useRef(null);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [cats, setCats] = useState([]);
  const [catsImageUrls, setCatsImageUrls] = useState({});
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
  const [selectedPostData, setSelectedPostData] = useState(null);
  const [postImagesUrls, setPostImageUrls] = useState({});
  const [catPositioningEnabled, setCatPositioningEnabled] = useState(true);
  const [catDensityEnabled, setCatDensityEnabled] = useState(false);
  const [densityByCounty, setDensityByCounty] = useState({});
  const [densityByRegion, setDensityByRegion] = useState({});
  const [countyId, setCountyId] = useState(null);
  const [regionId, setRegionId] = useState(null);
  const [catLat, setCatLat] = useState(null);
  const [catLng, setCatLng] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userImageUrls, setUserImageUrls] = useState("");
  const [username, setUsername] = useState("");
  const directions = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocation, setIsLocation] = useState(false);
  const [isCatLocation, setIsCatLocation] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [step, setStep] = useState(0);

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
  

  const twBoundaries = feature(
    townTopoData,
    townTopoData.objects["TOWN_MOI_1130718"]
  );
  const twCountyBoundaries = feature(
    countyTopoData,
    countyTopoData.objects["COUNTY_MOI_1130718"]
  );

  const towns = selectedCounty ? regionOptions[selectedCounty] || [] : [];

  const cityCenters = {
    臺北市: [121.5735, 25.0829],
    新北市: [121.6739, 24.9157],
    桃園市: [121.2168, 24.9376],
    台中市: [120.6736, 24.1477],
    臺南市: [120.3325, 23.0481],
    高雄市: [120.6396, 23.0835],
    基隆市: [121.7419, 25.133],
    新竹市: [120.9647, 24.8039],
    嘉義市: [120.4473, 23.4755],
    新竹縣: [121.1252, 24.7033],
    苗栗縣: [120.9417, 24.4893],
    彰化縣: [120.4818, 23.992],
    南投縣: [120.9876, 23.8388],
    雲林縣: [120.3897, 23.7559],
    嘉義縣: [120.574, 23.4588],
    屏東縣: [120.62, 22.5495],
    宜蘭縣: [121.7195, 24.6929],
    花蓮縣: [121.3542, 23.7569],
    臺東縣: [121.1132, 22.7583],
    澎湖縣: [119.6151, 23.5655],
    金門縣: [118.3171, 24.4321],
    連江縣: [119.5397, 26.1974],
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    removeBoundaries();
    drawBoundaries();
  }, [
    selectedCounty,
    selectedDistrict,
    catPositioningEnabled,
    catDensityEnabled,
    countyId,
    selectedRegion,
  ]);

  const drawBoundaries = async () => {
    if (catPositioningEnabled) {
      if (selectedCounty && selectedDistrict) {
        drawRegionBoundary(selectedRegion);
      } else if (selectedCounty && !selectedDistrict) {
        drawCountyBoundary(countyId, selectedCounty);
      }
    } else if (catDensityEnabled) {
      if (selectedDistrict) {
        drawDensityByCatCount();
        drawDensityRegionBoundary(selectedCounty);
        drawRegionBoundary(selectedRegion);
      } else if (selectedCounty) {
        drawDensityByCatCount();
        drawDensityRegionBoundary(selectedCounty);
        drawCountyBoundary(countyId, selectedCounty);
      } else if (
        !selectedCounty &&
        !selectedDistrict &&
        densityByCounty &&
        Object.keys(densityByCounty).length > 0
      ) {
        drawDensityByCatCount();
      }
    }
  };

  const removeBoundaries = () => {
    removeLayerAndSource("selected-county", ["selected-county"]);
    removeLayerAndSource("selected-region", ["selected-region"]);

    removeLayer("selected-city-line");
    removeLayerAndSource("selected-city-density", ["selected-city-density"]);

    removeLayer("region-density-line");
    removeLayerAndSource("region-density", [
      "region-density-fill",
      "region-density-line",
      "region-names",
    ]); // 确保删除 region-density 所有关联图层
  };

  const removeLayer = (layerName) => {
    if (mapRef.current && mapRef.current.getLayer(layerName)) {
      mapRef.current.removeLayer(layerName);
    }
  };

  const removeLayerAndSource = (sourceName, layerNames = []) => {
    if (mapRef.current) {
      layerNames.forEach((layerName) => {
        if (mapRef.current.getLayer(layerName)) {
          mapRef.current.removeLayer(layerName);
        }
      });
      if (mapRef.current.getSource(sourceName)) {
        mapRef.current.removeSource(sourceName);
      }
    }
  };

  const handleCountyChange = (e) => {
    const selectedCity = countyOptions.find(
      (city) => city.name === e.target.value
    );
    setSelectedCounty(selectedCity.name);
    setCountyId(selectedCity.geometryIndex);
    setSelectedRegion(null);
    setSelectedDistrict("");
    setNeuteredCount(0);
    setNotNeuteredCount(0);
  };

  const handleRegionChange = (e) => {
    if (regionOptions[selectedCounty]) {
      const selectedRegion = regionOptions[selectedCounty].find(
        (region) => region.geometryIndex === Number(e.target.value)
      );
      setSelectedRegion(Number(e.target.value));
      setSelectedDistrict(selectedRegion.name);
      setNeuteredCount(0);
      setNotNeuteredCount(0);
      setRegionId(Number(e.target.value));
    } else {
      console.log("未找到對應的縣市");
    }
  };

  const handleCatPositioningChange = (e) => {
    const isChecked = e.target.checked;
    setIsLoading(true);
    setCatPositioningEnabled(isChecked);

    if (isChecked) {
      setCatDensityEnabled(false);
    } else if (!catDensityEnabled) {
      setCatPositioningEnabled(true);
      alert("至少需要啟用一個模式：貓咪定位或貓咪密度");
    }
    setIsLoading(false);
  };

  const handleCatDensityChange = (e) => {
    const isChecked = e.target.checked;
    setIsLoading(true);
    setCatDensityEnabled(isChecked);

    if (isChecked) {
      setCatPositioningEnabled(false);
      fetchMapDensity();
    } else if (!catPositioningEnabled) {
      setCatDensityEnabled(true);
      alert("至少需要啟用一個模式：貓咪定位或貓咪密度");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedCounty) {
      fetchTipped();
    }
  }, [selectedCounty, selectedDistrict]);

  useEffect(() => {
    if (selectedCounty && catPositioningEnabled) {
      fetchCatsData();
    }
  }, [selectedCounty, catPositioningEnabled]);

  useEffect(() => {
    setIsLoading(true);
    const map = mapRef.current;

    if (map) {
      const updateLayerVisibility = () => {
        if (map.isStyleLoaded()) {
          map.getStyle().layers.forEach((layer) => {
            if (layer.type === "symbol" && layer.layout["text-field"]) {
              map.setLayoutProperty(
                layer.id,
                "visibility",
                catDensityEnabled ? "none" : "visible"
              );
            }
          });
          setIsLoading(false);
        } else {
          map.once("styledata", updateLayerVisibility);
          setIsLoading(false);
        }
      };
      updateLayerVisibility();
    }
  }, [catDensityEnabled]);

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

      let shouldPreventScroll = false;

      canvas.addEventListener(
        "touchmove",
        (e) => {
          if (shouldPreventScroll) {
            e.preventDefault();
          }
        },
        { passive: false }
      );

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showAccuracyCircle: false,
        fitBoundsOptions: null,
      });

      map.addControl(geolocateControl);

      map.on("load", () => {
        map.resize();
        if (catPositioningEnabled) {
          geolocateControl.trigger();
        }
      });

      geolocateControlRef.current = geolocateControl;

      geolocateControl.on("geolocate", (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
      });

      mapRef.current = map;
    }

    if (geolocateControlRef.current) {
      const visibility = catDensityEnabled ? "hidden" : "visible";
      document
        .querySelectorAll(".mapboxgl-user-location")
        .forEach((element) => {
          element.style.visibility = visibility;
        });
    }
  }, [catPositioningEnabled, catDensityEnabled]);

  useEffect(() => {
    let markers = [];
    if (
      mapRef.current &&
      selectedCounty &&
      cats.length > 0 &&
      catPositioningEnabled
    ) {
      cats.forEach((cat) => {
        const catImageUrls =
          catsImageUrls[cat.postId] && catsImageUrls[cat.postId].length > 0
            ? catsImageUrls[cat.postId][0]
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
            fetchPostData(cat.postId, isMobile);
            setCatLat(cat.latitude);
            setCatLng(cat.longitude);
            setShowModal(true);
          });

          markers.push(marker);
        }
      });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [selectedCounty, cats, catsImageUrls, catPositioningEnabled, isMobile]);

  useEffect(() => {
    if (selectedPostData) {
      fetchComments(selectedPostData.id);
      checkIfLiked(selectedPostData.id);
    }
  }, [selectedPostData]);

  const fetchMapDensity = async () => {
    setIsLoading(true);
    setDensityByCounty({});
    setDensityByRegion({});
    try {
      const response = await axios.get(
        "http://140.136.151.71:8787/api/v1/map/density"
      );
      const posts = response.data.data;
      const densityMap = {};

      posts.forEach((entry) => {
        const regionName = entry.city;

        if (densityMap[regionName]) {
          densityMap[regionName] += entry.total_stray;
        } else {
          densityMap[regionName] = entry.total_stray;
        }
      });
      setDensityByCounty(densityMap);

      const densityRegionMap = {};
      posts.forEach((entry) => {
        const regionName = entry.district;
        densityRegionMap[regionName] =
          (densityRegionMap[regionName] || 0) + entry.total_stray;
      });

      setDensityByRegion(densityRegionMap);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching popular posts: ", error);
      setIsLoading(false);
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
        [postId]: { visible: true, list: commentsWithUserInfo },
      }));
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
    }
  };

  const fetchUserDetails = async (userId) => {
    return axios.get(`http://140.136.151.71:8787/api/v1/users/${userId}/user`);
  };

  const handleLike = async (postId) => {
    const isLiked = likedPosts[postId];
    try {
      if (isLiked) {
        await axios.delete(
          "http://140.136.151.71:8787/api/v1/likes/remove-like",
          {
            params: { postId: postId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: false,
        }));

        setSelectedPostData((prevState) => ({
          ...prevState,
          total_likes: prevState.total_likes - 1,
        }));
      } else {
        await axios.post(
          "http://140.136.151.71:8787/api/v1/likes/add-like",
          null,
          {
            params: { postId: postId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: true,
        }));

        setSelectedPostData((prevState) => ({
          ...prevState,
          total_likes: prevState.total_likes + 1,
        }));
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
          params: { postId: postId },
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

  const handleCloseModal = () => {
    setSelectedPostData(null);
    setShowModal(false);
  };

  const handleAddComment = async (postId) => {
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

      setSelectedPostData((prevSelectedCat) => ({
        ...prevSelectedCat,
        total_comments: prevSelectedCat.total_comments + 1,
      }));

      if (Array.isArray(prevPosts)) {
        return prevPosts.map((post) =>
          post.id === postId
            ? { ...post, total_comments: post.total_comments + 1 }
            : post
        );
      } else {
        console.error("prevPosts is not an array:", prevPosts);
        return prevPosts;
      }
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

  const drawCountyBoundary = (countyIndex, countyName) => {
    const selectedCountyFeature = twCountyBoundaries.features[countyIndex];

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
          "line-width": 2,
        },
      });
      const cityCenter = cityCenters[countyName];
      if (mapRef.current && cityCenter) {
        mapRef.current.flyTo({
          center: cityCenter,
          zoom: 10.5,
          speed: 1.5,
        });
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
      mapRef.current.fitBounds(bounds, { padding: 70 });
    }
  };

  useEffect(() => {
    if (densityByCounty && Object.keys(densityByCounty).length > 0) {
      drawBoundaries();
    }
  }, [
    densityByCounty,
    selectedCounty,
    selectedDistrict,
    catPositioningEnabled,
    catDensityEnabled,
    countyId,
    selectedRegion,
  ]);

  const drawDensityByCatCount = () => {
    const flattenedCounties = Object.values(countyOptions).flat();

    const maxCatCount = Math.max(
      ...flattenedCounties.map((county) => densityByCounty[county.name] || 0)
    );
    const calculatedStep = maxCatCount / 6;
    setStep(calculatedStep);

    const features = flattenedCounties.map((county) => {
      const countyName = county.name;
      const catCount = densityByCounty[countyName] || 0;
      let color = "#FFFFFF";

      if (catCount > calculatedStep * 5) {
        color = "hsl(129, 55%, 40%)";
      } else if (catCount > calculatedStep * 4) {
        color = "hsl(129, 60%, 52%)";
      } else if (catCount > calculatedStep * 3) {
        color = "hsl(129, 65%, 63%)";
      } else if (catCount > calculatedStep * 2) {
        color = "hsl(129, 70%, 72%)";
      } else if (catCount > calculatedStep) {
        color = "hsl(129, 80%, 82%)";
      } else if (catCount >= 0) {
        color = "hsl(129, 86%, 91%)";
      }

      const selectedFeature = twCountyBoundaries.features[county.geometryIndex];
      return {
        type: "Feature",
        geometry: selectedFeature.geometry,
        properties: {
          countyName,
          color,
          catCount,
        },
      };
    });

    const geojsonData = {
      type: "FeatureCollection",
      features,
    };

    if (mapRef.current.getSource("selected-city-density")) {
      mapRef.current.getSource("selected-city-density").setData(geojsonData);
    } else {
      mapRef.current.addSource("selected-city-density", {
        type: "geojson",
        data: geojsonData,
      });
    }

    if (!mapRef.current.getLayer("selected-city-density")) {
      mapRef.current.addLayer({
        id: "selected-city-density",
        type: "fill",
        source: "selected-city-density",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 1,
        },
      });
    }

    if (!mapRef.current.getLayer("selected-city-line")) {
      mapRef.current.addLayer({
        id: "selected-city-line",
        type: "line",
        source: "selected-city-density",
        paint: {
          "line-color": "hsl(128, 82%, 11%)",
          "line-width": 1,
        },
      });
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
      const response = await axios.get(
        `http://140.136.151.71:8787/api/v1/map/region`,
        {
          params: { city: selectedCounty },
        }
      );
      const posts = response.data.data;
      setCats(posts);

      const imageUrls = {};
      let neutered = 0;
      let notNeutered = 0;

      posts.forEach((post) => {
        if (post.downloadUrl && post.downloadUrl.length > 0) {
          imageUrls[post.postId] = [placeholderColor];
        } else {
          console.warn(`Post ${post.postId} 沒有圖片`);
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
        if (post.downloadUrl) {
          const url = await fetchImage(post.downloadUrl);
          const postImagesUrls = [url];

          setCatsImageUrls((prevState) => ({
            ...prevState,
            [post.postId]: postImagesUrls,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching region-based posts: ", error);
    }
    setLoading(false);
  };

  const fetchTipped = async () => {
    try {
      const response = await axios.get(
        `http://140.136.151.71:8787/api/v1/map/density`
      );
      const posts = response.data.data;

      let neutered = 0;
      let notNeutered = 0;

      let districtNeutered = 0;
      let districtNotNeutered = 0;

      posts.forEach((post) => {
        if (selectedCounty && post.city === selectedCounty) {
          neutered += post.total_tipped;
          notNeutered += post.total_cat - post.total_tipped;
        }
        if (selectedDistrict && post.district === selectedDistrict) {
          districtNeutered = post.total_tipped;
          districtNotNeutered = post.total_cat - post.total_tipped;
        }
      });

      setNeuteredCount(neutered);
      setNotNeuteredCount(notNeutered);

      if (selectedDistrict) {
        setNeuteredCount(districtNeutered);
        setNotNeuteredCount(districtNotNeutered);
      }
    } catch (error) {
      console.error("Error fetching region-based posts: ", error);
    }
  };

  const fetchPostData = async (postId, isMobile) => {
    setPostImageUrls({});
    try {
      const response = await axios.get(
        `http://140.136.151.71:8787/api/v1/posts/post-id/${postId}`
      );
      const post = response.data.data;

      if (post && post.postImages && post.postImages.length > 0) {
        const imageUrls = await Promise.all(
          post.postImages.map(async (image) => {
            const url = await fetchPostImage(image.downloadUrl);
            return url;
          })
        );

        setPostImageUrls((prevState) => ({
          ...prevState,
          [postId]: imageUrls,
        }));
      }

      setSelectedPostData(post);

      if (isMobile) {
        fetchUserAvatar(post.userId);
        const userResponse = await fetchUserDetails(post.userId);
        const user = userResponse.data.data;
        setUsername(user.username);
      }
    } catch (error) {
      console.error("Error fetching  posts: ", error);
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

  const fetchPostImage = async (downloadUrl) => {
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

  const fetchUserAvatar = async (id) => {
    try {
      const response = await axios.get(
        `http://140.136.151.71:8787/api/v1/user-avatar/download/${id}`,
        { responseType: "blob" }
      );
      const avatarUrl = URL.createObjectURL(response.data);
      setUserImageUrls(avatarUrl);
    } catch (error) {
      console.error("Error fetching userAvatar", error);
    }
  };

  const handleDirection = () => {
    if (!directions.current && mapRef.current) {
      directions.current = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/walking",
      });
      mapRef.current.addControl(directions.current, "top-left");
    }
    setShowModal(false);

    if (userLocation) {
      directions.current.setOrigin(userLocation);
      directions.current.setDestination([catLng, catLat]);
      setIsCatLocation(true);
      setIsLocation(true);
    } else {
      alert("導航功能無法啟用，請確保已經獲取使用者和貓咪的位置信息");
    }
  };

  const handleReset = () => {
    if (directions.current && mapRef.current) {
      mapRef.current.removeControl(directions.current);
      directions.current = null;
    }

    setSelectedCounty("");
    setSelectedRegion(null);
    setSelectedDistrict("");
    setNeuteredCount(0);
    setNotNeuteredCount(0);
    setLoading(false);
    setCountyId(null);
    setIsCatLocation(false);
    setIsLocation(false);

    if (mapRef.current) {
      const map = mapRef.current;

      map.flyTo({
        center: [120.906189, 23.634318],
        zoom: 7,
      });
    }
  };

  const drawDensityRegionBoundary = (selectedCounty) => {
    if (!selectedCounty) return;

    const regionsInCounty = regionOptions[selectedCounty] || [];

    const maxCatCount = Math.max(
      ...regionsInCounty.map((region) => densityByRegion[region.name] || 0)
    );

    const calculatedStep = maxCatCount / 6;
    setStep(calculatedStep);

    const features = regionsInCounty.map((region) => {
      const regionName = region.name;
      const catCount = densityByRegion[regionName] || 0;

      let color = "#FFFFFF";
      if (catCount > calculatedStep * 5) {
        color = "hsl(129, 55%, 40%)";
      } else if (catCount > calculatedStep * 4) {
        color = "hsl(129, 60%, 52%)";
      } else if (catCount > calculatedStep * 3) {
        color = "hsl(129, 65%, 63%)";
      } else if (catCount > calculatedStep * 2) {
        color = "hsl(129, 70%, 72%)";
      } else if (catCount > calculatedStep) {
        color = "hsl(129, 80%, 82%)";
      } else if (catCount >= 0) {
        color = "hsl(129, 86%, 91%)";
      }

      const selectedFeature = twBoundaries.features[region.geometryIndex];

      return {
        type: "Feature",
        geometry: selectedFeature.geometry,
        properties: {
          regionName,
          color,
          catCount,
        },
      };
    });

    if (mapRef.current.getLayer("region-density-fill")) {
      mapRef.current.removeLayer("region-density-fill");
    }
    if (mapRef.current.getLayer("region-density-line")) {
      mapRef.current.removeLayer("region-density-line");
    }
    if (mapRef.current.getLayer("region-names")) {
      mapRef.current.removeLayer("region-names");
    }
    if (mapRef.current.getSource("region-density")) {
      mapRef.current.removeSource("region-density");
    }

    mapRef.current.addSource("region-density", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features,
      },
    });

    mapRef.current.addLayer({
      id: "region-density-fill",
      type: "fill",
      source: "region-density",
      paint: {
        "fill-color": ["get", "color"],
        "fill-opacity": 1,
      },
    });

    mapRef.current.addLayer({
      id: "region-density-line",
      type: "line",
      source: "region-density",
      paint: {
        "line-color": "hsl(128, 82%, 11%)",
        "line-width": 1,
      },
    });

    mapRef.current.addLayer({
      id: "region-names",
      type: "symbol",
      source: "region-density",
      layout: {
        "text-field": ["get", "regionName"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 12,
        "text-offset": [0, 0.6],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#000000",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 1,
      },
    });
  };

  const toggleDirectionPanel = (isVisible) => {
    const directionsPanel = document.querySelector(".mapbox-directions-panel");
    const profileSwitcher = document.querySelector(".mapbox-directions-profile");
  
    const routeSummary = document.querySelector(
      ".mapbox-directions-route-summary"
    );
    const stepsContainer = document.querySelector(".mapbox-directions-steps");
  
    if (directionsPanel) {
      directionsPanel.style.display = isVisible ? "block" : "none";
    }
    if (profileSwitcher) {
      profileSwitcher.style.display = isVisible ? "block" : "none";
    }
    if (routeSummary) {
      routeSummary.style.display = isVisible ? "block" : "none";
    }
    if (stepsContainer) {
      stepsContainer.style.display = isVisible ? "block" : "none";
    }
  };
  
  
  const handleCloseDirection = () => {
    if (directions.current && mapRef.current) {
      toggleDirectionPanel(false);
      setIsLocation(false); 
    }
  };
  
  const handleShowDirection = () => {
    if (directions.current && mapRef.current) {
      toggleDirectionPanel(true);
      setIsLocation(true);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <ClipLoader color={"#666"} size={50} />
        </div>
      )}
      {isMobile ? (
        <div className="mobile-map">
          <div ref={mapContainerRef} className="mobile-map-container" />
          <button
            onClick={toggleSidebar}
            className="mobile-sidebar-toggle-button"
          >
            <img
              src={filterPic}
              style={{ width: "25px", height: "25px" }}
            ></img>
          </button>

          {isSidebarOpen && (
            <div className="cat-sidebar">
              <div className="mobile-select">
                <div className="mobile-cat-select">
                  <input
                    type="checkbox"
                    name="貓咪定位"
                    checked={catPositioningEnabled}
                    onChange={handleCatPositioningChange}
                  />
                  <label className="location">貓咪定位</label>
                  <input
                    type="checkbox"
                    name="貓咪密度"
                    checked={catDensityEnabled}
                    onChange={handleCatDensityChange}
                  />
                  <label>貓咪密度</label>
                </div>
                <div className="mobile-info-box-select">
                  <h3>選擇台灣縣市、區與里</h3>

                  <label>選擇縣市</label>
                  <select value={selectedCounty} onChange={handleCountyChange}>
                    <option value="" disabled>
                      請選擇縣市
                    </option>
                    {countyOptions.map((county) => (
                      <option key={county.name} value={county.name}>
                        {county.name}
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
                  {catPositioningEnabled && isCatLocation && (
                    <button
                      className="closeDirection"
                      onClick={
                        isLocation ? handleCloseDirection : handleShowDirection
                      }
                    >
                      {isLocation ? "關閉導航" : "開啟導航"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="mobile-info-box">
            <h3>貓咪資訊</h3>
            <p>
              <strong>未絕育數量:</strong> {notNeuteredCount}
            </p>
            <p>
              <strong>已絕育數量:</strong> {neuteredCount}
            </p>
          </div>
          {catDensityEnabled && (
            <div className="mobile-legend">
              <div className="mobile-legend-title">貓咪密度</div>
              <div className="mobile-legend-item">
                <span className="color-box color-1"></span> &gt;{" "}
                {Math.ceil(step * 5)}
              </div>
              <div className="legend-item">
                <span className="color-box color-2"></span>{" "}
                {Math.ceil(step * 4)} - {Math.ceil(step * 5)}
              </div>
              <div className="legend-item">
                <span className="color-box color-3"></span>{" "}
                {Math.ceil(step * 3)} - {Math.ceil(step * 4)}
              </div>
              <div className="legend-item">
                <span className="color-box color-4"></span>{" "}
                {Math.ceil(step * 2)} - {Math.ceil(step * 3)}
              </div>
              <div className="legend-item">
                <span className="color-box color-5"></span> {Math.ceil(step)} -{" "}
                {Math.ceil(step * 2)}
              </div>
              <div className="legend-item">
                <span className="color-box color-6"></span> 0 -{" "}
                {Math.ceil(step)}
              </div>
            </div>
          )}
          {loading && (
            <div className="loading-overlay">
              <ClipLoader color={"#666"} size={50} />
            </div>
          )}
          {showModal && selectedPostData && (
            <div className="overlay">
              <div
                className="mobile-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="closed-button" onClick={handleCloseModal}>
                  &times;
                </span>
                <div className="mobile-map-post" key={selectedPostData.id}>
                  <div className="mobile-post-header">
                    <div className="mph">
                      <Link
                        to={`/profile/${selectedPostData.userId}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <img
                          src={
                            userImageUrls
                              ? userImageUrls.replace(".png", "-lowres.webp")
                              : defaultAvatar
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
                        to={`/profile/${selectedPostData.userId}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <span className="mobile-user-name">
                          {username ? username : "未知使用者"}
                        </span>
                      </Link>
                    </div>
                    <div className="locatoinBtn">
                      <button
                        className="mobile-location-btn"
                        onClick={handleDirection}
                      >
                        <img src={mapPic} alt="Map" />
                      </button>
                    </div>
                  </div>
                  <h4>{selectedPostData.title}</h4>
                  {postImagesUrls[selectedPostData?.id] &&
                  Array.isArray(postImagesUrls[selectedPostData?.id]) &&
                  postImagesUrls[selectedPostData?.id]?.length === 1 ? (
                    <div
                      className="g-container"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={postImagesUrls[selectedPostData.id][0].replace(
                          ".png",
                          "-lowres.webp"
                        )}
                        data-src={postImagesUrls[
                          selectedPostData.id
                        ][0].replace(".png", ".webp")}
                        srcSet={`  
                ${postImagesUrls[selectedPostData.id][0].replace(
                  ".png",
                  "-320w.webp"
                )} 320w,
                ${postImagesUrls[selectedPostData.id][0].replace(
                  ".png",
                  "-640w.webp"
                )} 640w,
                ${postImagesUrls[selectedPostData.id][0].replace(
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
                    postImagesUrls[selectedPostData.id] &&
                    Array.isArray(postImagesUrls[selectedPostData.id]) && (
                      <Suspense fallback={<div>Loading slider...</div>}>
                        <Slider {...sliderSettings(sliderRefs)}>
                          {postImagesUrls[selectedPostData.id].map(
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
                                    handleImageClick(e, sliderRefs.current)
                                  }
                                  style={{
                                    width: "100%",
                                    height: "350px",
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
                    <p className="post-text">{selectedPostData.content}</p>
                    <p className="post-location">
                      發布地址：{selectedPostData.city}
                      {selectedPostData.district}
                      {selectedPostData.street}
                    </p>
                    <p className="post-date">
                      發布於：
                      {new Date(selectedPostData.createdAt).toLocaleString(
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
                      onClick={() => handleLike(selectedPostData.id)}
                      style={{
                        color: likedPosts[selectedPostData.id]
                          ? "#9E1212"
                          : "black",
                        fontWeight: likedPosts[selectedPostData.id]
                          ? "bold"
                          : "normal",
                      }}
                    >
                      <img
                        className="heart-pic"
                        src={
                          likedPosts[selectedPostData.id]
                            ? HeartPicFilled
                            : HeartPic
                        }
                        alt="讚"
                      />
                      {selectedPostData.total_likes}
                    </button>
                    <button
                      className="comment-btn"
                      onClick={() => toggleComments(selectedPostData.id)}
                    >
                      <img
                        className="comment-pic"
                        src={CommentPic}
                        alt="留言"
                      />
                      {selectedPostData.total_comments}
                    </button>
                  </div>
                  {comments[selectedPostData.id] &&
                    comments[selectedPostData.id].visible && (
                      <>
                        <div className="comments-section">
                          {comments[selectedPostData.id]?.list ? (
                            comments[selectedPostData.id].list.length > 0 ? (
                              comments[selectedPostData.id].list.map(
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
                            onClick={() =>
                              handleAddComment(selectedPostData.id)
                            }
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
        <div className="map">
          <div
            ref={mapContainerRef}
            className="map-container"
            style={{ height: "100vh", width: "100%" }}
          />
          <div className="cat-select">
            <input
              type="checkbox"
              name="貓咪定位"
              checked={catPositioningEnabled}
              onChange={handleCatPositioningChange}
            />
            <label className="location">貓咪定位</label>
            <input
              type="checkbox"
              name="貓咪密度"
              checked={catDensityEnabled}
              onChange={handleCatDensityChange}
            />
            <label>貓咪密度</label>
          </div>

          {catDensityEnabled && (
            <div className="legend">
              <div className="legend-title">貓咪密度</div>
              <div className="legend-item">
                <span className="color-box color-1"></span> &gt;{" "}
                {Math.ceil(step * 5)}
              </div>
              <div className="legend-item">
                <span className="color-box color-2"></span>{" "}
                {Math.ceil(step * 4)} - {Math.ceil(step * 5)}
              </div>
              <div className="legend-item">
                <span className="color-box color-3"></span>{" "}
                {Math.ceil(step * 3)} - {Math.ceil(step * 4)}
              </div>
              <div className="legend-item">
                <span className="color-box color-4"></span>{" "}
                {Math.ceil(step * 2)} - {Math.ceil(step * 3)}
              </div>
              <div className="legend-item">
                <span className="color-box color-5"></span> {Math.ceil(step)} -{" "}
                {Math.ceil(step * 2)}
              </div>
              <div className="legend-item">
                <span className="color-box color-6"></span> 0 -{" "}
                {Math.ceil(step)}
              </div>
            </div>
          )}
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
              {countyOptions.map((county) => (
                <option key={county.name} value={county.name}>
                  {county.name}
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
          {loading && (
            <div className="loading-overlay">
              <ClipLoader color={"#666"} size={50} />
            </div>
          )}
          {showModal && selectedPostData && (
            <div className="overlay">
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <span className="closed-button" onClick={handleCloseModal}>
                  &times;
                </span>
                <div className="modal-image">
                  {postImagesUrls[selectedPostData?.id] &&
                  postImagesUrls[selectedPostData?.id]?.length === 1 ? (
                    <img
                      src={postImagesUrls[selectedPostData.id][0]?.replace(
                        ".png",
                        ".webp"
                      )}
                      className="modalPost-image"
                      alt="Cat image"
                      style={{ width: "500px", height: "660px" }}
                      loading="lazy"
                    />
                  ) : (
                    <Suspense fallback={<div>Loading slider...</div>}>
                      <Slider
                        {...sliderSettings(sliderRefs)}
                      >
                        {postImagesUrls[selectedPostData?.id]?.map(
                          (url, index) => (
                            <div key={index}>
                              <img
                                src={url?.replace(".png", ".webp")}
                                className="modalPost-image"
                                alt={`Cat image ${index}`}
                                style={{ width: "500px", height: "660px" }}
                                loading="lazy"
                                onClick={(e) =>
                                  handleImageClick(e, sliderRefs.current)
                                }
                              />
                            </div>
                          )
                        )}
                      </Slider>
                    </Suspense>
                  )}
                </div>
                <div
                  className="modalPost-content"
                  style={{ width: "500px", height: "660px" }}
                >
                  <div>
                    <button className="location-btn" onClick={handleDirection}>
                      <img src={mapPic} alt="Map" />
                    </button>
                    <h2 className="modalPost-title">
                      {selectedPostData.title}
                    </h2>
                  </div>
                  <p className="modalPost-text">{selectedPostData.content}</p>
                  <p className="address">
                    發布地址: {selectedPostData.city}
                    {selectedPostData.district}
                    {selectedPostData.street}
                  </p>
                  <p className="date">
                    發布於：
                    {new Date(selectedPostData.createdAt).toLocaleString(
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
                  <p className="stray">
                    是否為流浪貓: {selectedPostData.isStray ? "是" : "否"}
                  </p>

                  <div className="modalPost-actions">
                    <button
                      className="action-btn"
                      onClick={() => handleLike(selectedPostData.id)}
                      style={{
                        color: likedPosts[selectedPostData.id]
                          ? "#9E1212"
                          : "black",
                        fontWeight: likedPosts[selectedPostData.id]
                          ? "bold"
                          : "normal",
                      }}
                    >
                      <img
                        className="heart-pic"
                        src={
                          likedPosts[selectedPostData.id]
                            ? HeartPicFilled
                            : HeartPic
                        }
                        alt="讚"
                      />
                      {selectedPostData.total_likes}
                    </button>
                    <button
                      className="comment-btn"
                      onClick={() => toggleComments(selectedPostData.id)}
                    >
                      <img
                        className="comment-pic"
                        src={CommentPic}
                        alt="留言"
                      />
                      {selectedPostData.total_comments}
                    </button>
                  </div>

                  {comments[selectedPostData.id] &&
                    comments[selectedPostData.id].visible && (
                      <>
                        <div className="comments-section">
                          {comments[selectedPostData.id]?.list ? (
                            comments[selectedPostData.id].list.length > 0 ? (
                              comments[selectedPostData.id].list.map(
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
                            onClick={() =>
                              handleAddComment(selectedPostData.id)
                            }
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
    </>
  );
};

export default Map;
