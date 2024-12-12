import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import backPic from "../../Image/back.png";
import binPic from "../../Image/recycle-bin.png";
import "./Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [itemsImageUrls, setItemsImageUrls] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const cartId = localStorage.getItem("cartId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCartData = async () => {
      if (cartId && token) {
        try {
          const response = await axios.get(
            `https://api.catniverse.website:5000/api/v1/carts/user-cart`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const cartData = response.data.data;

          setCartItems(cartData.items);
          setSelectedItems(new Array(cartData.items.length).fill(false));
          setQuantities(cartData.items.map((item) => item.quantity));

          const imagePromises = cartData.items.map(async (item) => {
            if (item.product.images && item.product.images.length > 0) {
              const downloadUrl = item.product.images[0].downloadUrl;
              const imageUrl = await fetchImage(downloadUrl);
              return { productId: item.product.id, imageUrl };
            }
            return null;
          });

          const images = await Promise.all(imagePromises);

          const imageUrlMap = images.reduce((acc, img) => {
            if (img) acc[img.productId] = img.imageUrl;
            return acc;
          }, {});

          setItemsImageUrls(imageUrlMap);
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      }
    };

    const fetchImage = async (downloadUrl) => {
      try {
        const response = await axios.get(
          `https://api.catniverse.website:5000${downloadUrl}`,
          {
            responseType: "blob",
          }
        );
        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchCartData();
  }, [cartId, token]);

  const handleCheckboxChange = (index) => {
    const updatedSelection = [...selectedItems];
    updatedSelection[index] = !updatedSelection[index];
    setSelectedItems(updatedSelection);
  };

  const handleQuantityChange = async (index, increment) => {
    const updatedQuantities = [...quantities];

    if (updatedQuantities[index] + increment < 0) {
      return;
    }

    updatedQuantities[index] = updatedQuantities[index] + increment;
    const updatedQuantity = updatedQuantities[index];
    const itemId = cartItems[index].product.id;

    setQuantities(updatedQuantities);

    try {
      const response = await axios.put(
        `https://api.catniverse.website:5000/api/v1/cartItems/item/update/${itemId}`,
        null,
        {
          params: {
            quantity: updatedQuantity,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Update quantity success");
      }
    } catch (error) {
      console.error("Update quantity wrong:", error);
    }
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item, index) => {
      return total + item.product.price * quantities[index];
    }, 0);
  };

  const handleDeleteItem = async () => {
    const itemsToDelete = cartItems.filter((_, index) => selectedItems[index]);

    if (itemsToDelete.length === 0) {
      return;
    }

    try {
      const deletePromises = itemsToDelete.map(async (item, index) => {
        const itemId = item.product.id;
        await axios.delete(
          `https://api.catniverse.website:5000/api/v1/cartItems/item/remove/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      });

      await Promise.all(deletePromises);

      const updatedCartItems = cartItems.filter(
        (_, index) => !selectedItems[index]
      );
      setCartItems(updatedCartItems);
      setSelectedItems(new Array(updatedCartItems.length).fill(false));

      console.log("Items deleted successfully");
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  const handleBuy = async () => {
    const selectedCartItems = cartItems.filter(
      (_, index) => selectedItems[index]
    );

    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to place an order.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const orderResponse = await axios.post(
        `https://api.catniverse.website:5000/api/v1/orders/order`,
        null,
        {
          params: {
            userId: userId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (orderResponse.status === 200) {
        console.log("Order created successfully", orderResponse.data);
        alert("Order created successfully!");

        const clearCartResponse = await axios.delete(
          `https://api.catniverse.website:5000/api/v1/carts/${cartId}/clear`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (clearCartResponse.status === 200) {
          console.log("Cart cleared successfully");
          setCartItems([]);
          setSelectedItems([]);
          setQuantities([]);
          alert("Cart cleared successfully!");
        }
      }
    } catch (error) {
      console.error("Error during order creation or cart clearing:", error);
      alert("Failed to create order or clear cart. Please try again.");
    }
  };

  return (
    <>
      {isMobile ? (
        <div>
          <div className="mobile-container_cart">
            <div className="mobile-cartpage">
              <div className="backLogo">
                <Link to={`/shop`} className="back-container">
                  <button className="back-btn">
                    <img className="backPic" src={backPic} alt="back" />
                  </button>
                  <p>Back</p>
                </Link>
              </div>
              <h1 className="cart-header">Shopping Cart</h1>
              <button className="bin-btn" onClick={handleDeleteItem}>
                <img src={binPic}></img>
              </button>
              <ul className="cart-list">
                {cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <li key={index} className="cart-item">
                      <input
                        type="checkbox"
                        className="select-product-checkbox"
                        checked={selectedItems[index]}
                        onChange={() => handleCheckboxChange(index)}
                      />
                      <img
                        className="product-pic-inCart"
                        src={
                          itemsImageUrls[item.product.id] ||
                          "/default-image.jpg"
                        } 
                        alt="product pic"
                      />
                      <div className="product-details">
                        <div className="product-tags">
                          <span>{item.product.brand}</span>
                        </div>
                        <h2 className="product-name">{item.product.name}</h2>
                        <div className="product-prices">
                          <span className="original-price">
                            ${item.product.price}
                          </span>
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
                        <button
                          className="add"
                          onClick={() => handleQuantityChange(index, 1)}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="empty">Your cart is empty</p>
                )}
              </ul>

              <div className="cart-total-price">
                Total ${calculateTotalPrice()}{" "}
                <button className="cart-buy-btn" onClick={handleBuy}>
                  Buy
                </button>
              </div>
            </div>
          </div>
          <br />
        </div>
      ) : (
        <div>
          <br />
          <div className="container_cart">
            <div className="cartpage">
              <div className="backLogo">
                <Link to={`/shop`} className="back-container">
                  <button className="back-btn">
                    <img className="backPic" src={backPic} alt="back" />
                  </button>
                  <p>Back</p>
                </Link>
              </div>
              <h1 className="cart-header">Shopping Cart</h1>
              <button className="bin-btn" onClick={handleDeleteItem}>
                <img src={binPic}></img>
              </button>
              <ul className="cart-list">
                {cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <li key={index} className="cart-item">
                      <input
                        type="checkbox"
                        className="select-product-checkbox"
                        checked={selectedItems[index]}
                        onChange={() => handleCheckboxChange(index)}
                      />
                      <img
                        className="product-pic-inCart"
                        src={
                          itemsImageUrls[item.product.id] ||
                          "/default-image.jpg"
                        } 
                        alt="product pic"
                      />
                      <div className="product-details">
                        <div className="product-tags">
                          <span>{item.product.brand}</span>
                        </div>
                        <h2 className="product-name">{item.product.name}</h2>
                        <div className="product-prices">
                          <span className="original-price">
                            ${item.product.price}
                          </span>
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
                        <button
                          className="add"
                          onClick={() => handleQuantityChange(index, 1)}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="empty">Your cart is empty</p>
                )}
              </ul>

              <div className="cart-total-price">
                Total ${calculateTotalPrice()}{" "}
                <button className="cart-buy-btn" onClick={handleBuy}>
                  Buy
                </button>
              </div>
            </div>
          </div>
          <br />
        </div>
      )}
    </>
  );
}

export default Cart;
