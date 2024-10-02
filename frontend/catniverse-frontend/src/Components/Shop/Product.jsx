import React, { useState, useEffect } from 'react';
import productPic from "../../Image/132402_0.jpg";
import axios from 'axios';
import "./Product.css";

function Product({ product }) {
    const [showModal, setShowModal] = useState(false); 
    const [productImageUrls, setProductImageUrls] = useState([]); 
    const [addingToCart, setAddingToCart] = useState(false); 
    const [quantity, setQuantity] = useState(1);  // 控制商品數量的 state

    useEffect(() => {
        if (product.images && Array.isArray(product.images)) {
            const downloadUrls = product.images.map(img => img.downloadUrl);
            fetchProductImages(downloadUrls, product.id); 
        }
    }, [product.images]); 

    const fetchImages = async (downloadUrl) => {
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

    const fetchProductImages = async (downloadUrls, productId) => {
        try {
            const imageBlobPromises = downloadUrls.map(async (downloadUrl) => {
                return fetchImages(downloadUrl); 
            });

            const blobUrls = await Promise.all(imageBlobPromises); 
            setProductImageUrls((prevState) => ({
                ...prevState,
                [productId]: blobUrls, 
            }));
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    const handleProductClick = () => {
        setShowModal(true); 
    };

    const handleCloseModal = () => {
        setShowModal(false); 
    };

    const addToCart = async () => {
        setAddingToCart(true);
        const token = localStorage.getItem('token');

        try {
            await axios.post('http://140.136.151.71:8787/api/v1/cartItems/item/add', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    productId: product.id,
                    quantity: quantity, 
                },
            });
            alert('Product added to cart successfully!');
        } catch (error) {
            console.error('Error adding product to cart:', error);
            alert('Error adding product to cart');
        } finally {
            setAddingToCart(false); 
        }
    };

    // 處理數量增加
    const handleIncreaseQuantity = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    // 處理數量減少
    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };

    const { name, price, solded } = product;

    return (
        <div className="product">
            <div className="product-img" onClick={handleProductClick} style={{ cursor: 'pointer' }}>
                {productImageUrls[product.id] && productImageUrls[product.id].length > 0 ? (
                    <img
                        src={productImageUrls[product.id][0]} 
                        alt={`Product image for ${product.name}`}
                        style={{ width: "100%", height: "auto" }}
                    />
                ) : (
                    <img
                        src={productPic} 
                        alt="Default product pic"
                        style={{ width: "100%", height: "auto" }}
                    />
                )}
                <h2 className='product-title'>{product.name}</h2> 
                <div className="product-info">
                    <div className='product-sold'>
                        <i>{product.solded ? "Sold out" : "In stock"}</i> 
                    </div>
                    <div className='product-price'>
                        <b>${product.price}</b> 
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close-button" onClick={handleCloseModal}>&times;</span>
                        {productImageUrls[product.id] && productImageUrls[product.id].length > 0 ? (
                            productImageUrls[product.id].map((url, index) => (
                                <div key={index} className="modal-img">
                                    <img
                                        src={url}
                                        alt={`Product image ${index}`}
                                        style={{ width: "100%", height: "auto" }}
                                    />
                                </div>
                            ))
                        ) : (
                            <img
                                src={productPic} 
                                alt="Default product pic"
                                style={{ width: "100%", height: "auto" }}
                            />
                        )}
                        <div className="modal-details">
                            <h2 className='modal-header'>{name}</h2> 
                            <div className="modal-price">
                                <b>${price}</b> 
                            </div>
                            <p className="modal-description">
                                {product.description}
                            </p>
                            <p className="modal-sold">
                                {solded ? "Sold out" : "In stock"} 
                            </p>
                            {/* 商品數量調整按鈕 */}
                            <div className="quantity-controls">
                                <button onClick={handleDecreaseQuantity} disabled={quantity === 1}>-</button>
                                <span>{quantity}</span>
                                <button onClick={handleIncreaseQuantity}>+</button>
                            </div>
                            <button 
                                className="buy-button" 
                                disabled={solded || addingToCart} 
                                onClick={addToCart}
                            >
                                {solded ? "Sold out" : addingToCart ? "Adding..." : "Add Cart"} 
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Product;