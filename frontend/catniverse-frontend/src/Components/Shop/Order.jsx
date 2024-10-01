import React, { useState } from "react";
import { Link } from "react-router-dom";
import productPic from "../../Image/132402_0.jpg";
import productPic2 from "../../Image/132403_0.jpg";
import productPic3 from "../../Image/132404_0.jpg";
import backPic from "../../Image/back.png";
import "./Order.css";

function Order() {
  // State to manage expansion for each order date
  const [expandedOrders, setExpandedOrders] = useState({
    "2019/05/11 13:45": false,
    "2019/05/13 01:55": false,
  });

  // Define orders with different times and statuses
  const ordersByDate = [
    {
      date: "2019/05/11 13:45",
      total: 123,
      status: "Shipped",
      orderList: [
        {
          picURL: productPic,
          name: "product1",
          quantity: 1,
          price: 50,
          brand: ["A店"],
        },
        {
          picURL: productPic2,
          name: "product2",
          quantity: 1,
          price: 1552,
          brand: ["B店"],
        },
      ],
    },
    {
      date: "2019/05/13 01:55",
      total: 1663,
      status: "Cancelled",
      orderList: [
        {
          picURL: productPic3,
          name: "product3",
          quantity: 3,
          price: 510,
          brand: ["C店"],
        },
      ],
    },
  ];

  // Function to toggle expanded state for each order date
  const toggleExpand = (date) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [date]: !prev[date], // Toggle between expanded and collapsed states
    }));
  };

  return (
    <div>
      <br />
      <div className="container_order">
        <div className="backLogo">
          <Link to={`/shop`} className="back-container">
            <button className="back-btn">
              <img className="backPic" src={backPic} />
            </button>
            <p>Back</p>
          </Link>
        </div>
        <h1 className="order-header">My orders</h1>
        <div className="orderpage">
          {ordersByDate.map((order, index) => (
            <ul key={index} className="order-list">
              {/* Add order status to the top right */}
              <div className="order-status">
                <span>{order.status}</span>
              </div>

              {/* Always show the first product */}
              {order.orderList.slice(0, 1).map((o, idx) => (
                <li key={idx} className="cart-item">
                  <img
                    className="product-pic-inOrder"
                    src={o.picURL}
                    alt="product pic"
                  />
                  <div className="product-details">
                    <div className="product-tags">
                      {o.brand.map((tag, idx) => (
                        <span key={idx} className="product-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="order-product-name">{o.name}</h2>
                    <div className="order-prices">
                      <span className="order-price">${o.price}</span>
                    </div>
                  </div>
                  <div className="order-product-quantity">
                    <span className="order-quantity">x{o.quantity}</span>
                  </div>
                </li>
              ))}

              {/* Conditionally show other products if expanded */}
              {expandedOrders[order.date] &&
                order.orderList.length > 1 &&
                order.orderList.slice(1).map((o, idx) => (
                  <li key={idx} className="cart-item">
                    <img
                      className="product-pic-inOrder"
                      src={o.picURL}
                      alt="product pic"
                    />
                    <div className="product-details">
                      <div className="product-tags">
                        {o.brand.map((tag, idx) => (
                          <span key={idx} className="product-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="order-product-name">{o.name}</h2>
                      <div className="order-prices">
                        <span className="order-price">${o.price}</span>
                      </div>
                    </div>
                    <div className="order-product-quantity">
                      <span className="order-quantity">x{o.quantity}</span>
                    </div>
                  </li>
                ))}

              {/* Show expand/collapse button only if there is more than 1 product */}
              {order.orderList.length > 1 && (
                <div className="expend">
                  <button
                    className="expend-btn"
                    onClick={() => toggleExpand(order.date)}
                  >
                    {expandedOrders[order.date] ? "⇧ collapse ⇧" : "⇩ expend ⇩"}
                  </button>
                </div>
              )}

              <div className="order-total-prices">
                date: {order.date}
                <b>
                  <span className="order-total-price">
                    Total ${order.total}
                  </span>
                </b>
              </div>
            </ul>
          ))}
        </div>
        <br />
      </div>
      <br />
    </div>
  );
}

export default Order;
