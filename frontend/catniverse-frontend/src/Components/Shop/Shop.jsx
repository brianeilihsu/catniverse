import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Product from "./Product.jsx";
import "./Shop.css";
import cartPic from "../../Image/shopping-cart.png";
import orderPic from "../../Image/search.png";
import uploadPic from "../../Image/product.png";

function Shop() {
  const [name, setName] = useState(""); // 搜索输入
  const [isAdmin, setIsAdmin] = useState(false);
  const [productData, setProductData] = useState([]); // 商品数据
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedRoles = JSON.parse(localStorage.getItem("roles"));

    if (
      Array.isArray(storedRoles) &&
      storedRoles.some((role) => role.name === "ROLE_ADMIN")
    ) {
      setIsAdmin(true);
    }

    // 初始化获取所有商品数据
    const fetchProductData = async () => {
      try {
        const response = await axios.get(
          `http://140.136.151.71:8787/api/v1/products/all`
        );
        const products = response.data.data;
        setProductData(products);
      } catch (error) {
        console.error(`Error fetching product data:`, error);
      }
    };

    fetchProductData();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchUserData = async (userId) => {
      try {
        if (!userData[userId]) {
          const response = await axios.get(
            `http://140.136.151.71:8787/api/v1/users/${userId}/user`
          );
          const user = response.data.data;

          setUserData((prevState) => ({
            ...prevState,
            [userId]: user,
          }));

          if (user.cart.cartId) {
            localStorage.setItem("cartId", user.cart.cartId);
          }
        }
      } catch (error) {
        console.error(`Error fetching user data for userId ${userId}:`, error);
      }
    };

    if (userId) {
      fetchUserData(userId);
    }
  }, [userData]);

  // 监听输入框的变化，如果输入框为空，动态获取所有商品
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get(
          `http://140.136.151.71:8787/api/v1/products/all`
        );
        const products = response.data.data;
        setProductData(products);
      } catch (error) {
        console.error(`Error fetching all products:`, error);
      }
    };

    if (name.trim() === "") {
      // 如果输入框为空，动态获取所有商品
      fetchAllProducts();
    }
  }, [name]);

  // 过滤商品的函数，只有点击Search时才会触发
  const fetchFilteredProducts = async () => {
    try {
      let response;
      if (name.includes("/")) {
        const [category, brand] = name.split("/"); 
        response = await axios.get(
          `http://140.136.151.71:8787/api/v1/products/products/by/category-and-brand`,
          { params: { category, brand } }
        );
      } else if (name.includes("-")) {
        const [brand, productName] = name.split("-"); 
        response = await axios.get(
          `http://140.136.151.71:8787/api/v1/products/products/by/brand-and-name`,
          { params: { brand, name: productName } }
        );
      } else {
        response = await axios.get(
          `http://140.136.151.71:8787/api/v1/products/products/${name}/products`
        );
      }
      const products = response.data.data;
      setProductData(products);
    } catch (error) {
      console.error(`Error fetching filtered product data:`, error);
    }
  };

  // 当用户点击Search按钮时，调用 fetchFilteredProducts
  const handleSearch = () => {
    if (name.trim() !== "") {
      fetchFilteredProducts();
    }
  };

  function handleNameChange(event) {
    setName(event.target.value); 
  }

  const handleUpload = () => {
    navigate("/uploadEcommerce");
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const handleOrder = () => {
    navigate("/order", { state: { productData } });
  };

  return (
    <div className="justify">
      <h1 className="shop-title">Shop</h1>
      <div className="search">
        <input
          className="search-in"
          value={name}
          onChange={handleNameChange}
          placeholder="Search (e.g. category/brand or brand-name)"
        />
        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="product-list">
        {productData.length > 0 ? (
          productData.map((product) => (
            <Product key={product.id} product={product} />
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>

      {isAdmin && (
        <button className="upload-btn" onClick={handleUpload}>
          <img className="upload-img" src={uploadPic} alt="Upload Product" />
        </button>
      )}

      <button className="cart-btn" onClick={handleCart}>
        <img className="cart-img" src={cartPic} alt="Shopping Cart" />
      </button>
      <button className="order-btn" onClick={handleOrder}>
        <img className="order-img" src={orderPic} alt="Search Orders" />
      </button>
      <br />
    </div>
  );
}

export default Shop;
