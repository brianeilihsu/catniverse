import React, { useState } from "react";
import { Link } from "react-router-dom";
import productPic from "../../Image/132402_0.jpg";
import productPic2 from "../../Image/132403_0.jpg";
import productPic3 from "../../Image/132404_0.jpg";
import backPic from "../../Image/back.png";
import "./Cart.css";

function Cart() {
  const [selectedItems, setSelectedItems] = useState([false, false, false]); // 追踪選中的商品
  const [quantities, setQuantities] = useState([1, 1, 1]); // 追踪商品數量

  const productINcart = [
    {
      picURL: productPic,
      name: "product1",
      originalPrice: 29,
      brand: ["A店"],
    },
    {
      picURL: productPic2,
      name: "product2",
      originalPrice: 29,
      brand: ["B店"],
    },
    {
      picURL: productPic3,
      name: "product3",
      originalPrice: 29,
      brand: ["C店"],
    },
  ];

  const handleCheckboxChange = (index) => {
    const updatedSelection = [...selectedItems];
    updatedSelection[index] = !updatedSelection[index];
    setSelectedItems(updatedSelection);
  };

  const handleQuantityChange = (index, increment) => {
    const updatedQuantities = [...quantities];
    updatedQuantities[index] = Math.max(
      1,
      updatedQuantities[index] + increment
    );
    setQuantities(updatedQuantities);
  };

  const productDisplay = productINcart.map((p, index) => (
    <li key={index} className="cart-item">
      <input
        type="checkbox"
        className="select-product-checkbox"
        checked={selectedItems[index]}
        onChange={() => handleCheckboxChange(index)}
      />
      <img className="product-pic-inCart" src={p.picURL} alt="product pic" />
      <div className="product-details">
        <div className="product-tags">
          {p.brand.map((tag, idx) => (
            <span key={idx} className="product-tag">
              {tag}
            </span>
          ))}
        </div>
        <h2 className="product-name">{p.name}</h2>
        <div className="product-prices">
          <span className="original-price">${p.originalPrice}</span>
        </div>
      </div>
      <div className="product-quantity">
        <button
          className="remove"
          onClick={() => handleQuantityChange(index, -1)}
        >
          -
        </button>
        <span>{quantities[index]}</span>
        <button className="add" onClick={() => handleQuantityChange(index, 1)}>
          +
        </button>
      </div>
    </li>
  ));

  return (
    <div>
      <br/>
      <div className="container_cart">
        <div className="cartpage">
          <div className="backLogo">
            <Link to={`/shop`} className="back-container">
              <button className="back-btn">
                <img className="backPic" src={backPic} />
              </button>
              <p>Back</p>
            </Link>
          </div>
          <h1 className="cart-header">shopping cart</h1>
          <ul className="cart-list">{productDisplay}</ul>
          <div className="cart-total-price">
            total $000 <button className="cart-buy-btn">buy</button>
          </div>
        </div>
      </div>
      <br />
    </div>
  );
}

export default Cart;
