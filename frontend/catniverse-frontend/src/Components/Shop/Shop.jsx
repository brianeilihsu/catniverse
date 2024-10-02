import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Product from "./Product.jsx";
import "./Shop.css";
import cartPic from "../../Image/shopping-cart.png";
import orderPic from "../../Image/search.png";
import uploadPic from "../../Image/product.png";

function Shop() {
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [productData, setProductData] = useState([]);
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
    navigate("/order");
  };

  return (
    <div className="justify">
      <h1 className="shop-title">Shop</h1>
      <div className="search">
        <input
          className="search-in"
          value={name}
          onChange={handleNameChange}
          placeholder="Search"
        />
        <button className="search-btn">Search</button>
      </div>

      <div className="product-list">
        {productData.map((product) => (
          <Product key={product.id} product={product} />
        ))}
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
