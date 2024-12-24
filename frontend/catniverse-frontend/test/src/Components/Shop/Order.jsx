import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import productPic from "../../Image/132402_0.jpg";
import backPic from "../../Image/back.png";
import "./Order.css";

function Order() {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [productImageUrls, setProductImageUrls] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const location = useLocation();
  const { productData } = location.state || { productData: [] };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `https://api.catniverse.website:5000/api/v1/orders/${userId}/user-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const orderData = response.data.data;
        const parsedOrders = orderData.map((order) => ({
          date: order.orderDate,
          total: order.totalAmount,
          status: order.status,
          orderList: order.items.map((item) => ({
            productId: item.productId,
            picURL: productImageUrls[item.productId] || productPic,
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
            brand: [item.productBrand],
          })),
        }));
        setOrdersByDate(parsedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (userId && token) {
      fetchOrders();
    }
  }, [userId, token, productImageUrls]);

  const fetchImages = async (downloadUrl) => {
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

  useEffect(() => {
    const fetchProductImages = async () => {
      const newProductImageUrls = {};

      for (const product of productData) {
        if (product.images && product.images.length > 0) {
          const downloadUrl = product.images[0].downloadUrl;
          const imageUrl = await fetchImages(downloadUrl);
          newProductImageUrls[product.id] = imageUrl;
        }
      }

      setProductImageUrls(newProductImageUrls);
    };

    if (productData.length > 0) {
      fetchProductImages();
    }
  }, [productData]);

  const toggleExpand = (date) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  return (
    <>
      {isMobile ? (
        <div>
          <div className="mobile-container_order">
            <div className="mobile-orderpage">
              <div className="backLogo">
                <Link to={`/shop`} className="back-container">
                  <button className="back-btn">
                    <img className="backPic" src={backPic} alt="Back" />
                  </button>
                  <p>Back</p>
                </Link>
              </div>
              <h1 className="order-header">My orders</h1>
              {ordersByDate.length > 0 ? (
                ordersByDate.map((order, index) => (
                  <ul key={index} className="order-list">
                    <div className="order-status">
                      <span>{order.status}</span>
                    </div>

                    {order.orderList.slice(0, 1).map((o, idx) => (
                      <li key={idx} className="cart-item">
                        <img
                          className="product-pic-inOrder"
                          src={productImageUrls[o.productId] || productPic}
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

                    {expandedOrders[order.date] &&
                      order.orderList.length > 1 &&
                      order.orderList.slice(1).map((o, idx) => (
                        <li key={idx} className="cart-item">
                          <img
                            className="product-pic-inOrder"
                            src={productImageUrls[o.productId] || productPic}
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
                            <span className="order-quantity">
                              x{o.quantity}
                            </span>
                          </div>
                        </li>
                      ))}

                    {order.orderList.length > 1 && (
                      <div className="expend">
                        <button
                          className="expend-btn"
                          onClick={() => toggleExpand(order.date)}
                        >
                          {expandedOrders[order.date]
                            ? "⇧ collapse ⇧"
                            : "⇩ expend ⇩"}
                        </button>
                      </div>
                    )}

                    <div className="order-total-prices">
                      date:
                      {new Date(order.date).toLocaleString("zh-TW", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                      <b>
                        <span className="order-total-price">
                          Total ${order.total}
                        </span>
                      </b>
                    </div>
                  </ul>
                ))
              ) : (
                <p className="justify-p">No orders found.</p>
              )}
            </div>
            <br />
          </div>
          <br />
        </div>
      ) : (
        <div>
          <br />
          <div className="container_order">
            <div className="backLogo">
              <Link to={`/shop`} className="back-container">
                <button className="back-btn">
                  <img className="backPic" src={backPic} alt="Back" />
                </button>
                <p>Back</p>
              </Link>
            </div>
            <h1 className="order-header">My orders</h1>
            <div className="orderpage">
              {ordersByDate.length > 0 ? (
                ordersByDate.map((order, index) => (
                  <ul key={index} className="order-list">
                    <div className="order-status">
                      <span>{order.status}</span>
                    </div>

                    {order.orderList.slice(0, 1).map((o, idx) => (
                      <li key={idx} className="cart-item">
                        <img
                          className="product-pic-inOrder"
                          src={productImageUrls[o.productId] || productPic}
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

                    {expandedOrders[order.date] &&
                      order.orderList.length > 1 &&
                      order.orderList.slice(1).map((o, idx) => (
                        <li key={idx} className="cart-item">
                          <img
                            className="product-pic-inOrder"
                            src={productImageUrls[o.productId] || productPic}
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
                            <span className="order-quantity">
                              x{o.quantity}
                            </span>
                          </div>
                        </li>
                      ))}

                    {order.orderList.length > 1 && (
                      <div className="expend">
                        <button
                          className="expend-btn"
                          onClick={() => toggleExpand(order.date)}
                        >
                          {expandedOrders[order.date]
                            ? "⇧ collapse ⇧"
                            : "⇩ expend ⇩"}
                        </button>
                      </div>
                    )}

                    <div className="order-total-prices">
                      date:
                      {new Date(order.date).toLocaleString("zh-TW", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                      <b>
                        <span className="order-total-price">
                          Total ${order.total}
                        </span>
                      </b>
                    </div>
                  </ul>
                ))
              ) : (
                <p className="justify-p">No orders found.</p>
              )}
            </div>
            <br />
          </div>
          <br />
        </div>
      )}
    </>
  );
}

export default Order;
