import React, { useState } from "react";
import Product from "./Product.jsx";
import "./Shop.css";
import cartPic from "../../Image/shopping-cart.png";
import orderPic from "../../Image/search.png";

function Shop() {
  const [name, setName] = useState("");

  function handleNameChange(event) {
    setName(event.target.value);
  }

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
        <Product name="product1" price={1221} solded={false} />
        <Product name="product1" price={11758} solded={true} />
        <Product />
        <Product />
        <br />
        <Product />
        <Product />
        <Product />
      </div>

      {/* 按鈕包裹圖片 */}
      <button className="cart-btn">
        <img className="cart-img" src={cartPic} alt="Shopping Cart" />
      </button>

      <button className="order-btn">
        <img className="order-img" src={orderPic} alt="Search Orders" />
      </button>
    </div>
  );
}

export default Shop;
