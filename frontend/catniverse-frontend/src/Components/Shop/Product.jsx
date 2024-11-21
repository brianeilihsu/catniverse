import React, { useState, useEffect } from 'react';
import productPic from "../../Image/132402_0.jpg";
import ClipLoader from 'react-spinners/ClipLoader';
import axios from 'axios';
import "./Product.css";

function Product({ product }) {
    const [showModal, setShowModal] = useState(false); 
    const [productImageUrls, setProductImageUrls] = useState([]); 
    const [addingToCart, setAddingToCart] = useState(false); 
    const [isMobile, setIsMobile] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);  

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
      }, []);

    useEffect(() => {
        if (product.images && Array.isArray(product.images)) {
            const downloadUrls = product.images.map(img => img.downloadUrl);
            fetchProductImages(downloadUrls, product.id); 
        } else {
            setIsLoading(false);
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
            setIsLoading(false);
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
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching images:", error);
            setIsLoading(false);
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
                    quantity: quantity
                },
            });
            alert('Product added to cart successfully!');
            setShowModal(false);
        } catch (error) {
            console.error('Error adding product to cart:', error);
            alert('Error adding product to cart');
        } finally {
            setAddingToCart(false); 
        }
    };

    const handleIncreaseQuantity = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };

    const { name, price, solded } = product;

    return (
        <>
        {isLoading ? (
            <div className="loading-overlay">
                <ClipLoader color={"#666"} size={50} />
            </div>
        ) : isMobile ? (
            <div className="mobile-product">
                <div className="mobile-product-img" onClick={handleProductClick} style={{ cursor: 'pointer' }}>
                    {productImageUrls[product.id] && productImageUrls[product.id].length > 0 ? (
                        <img
                            src={productImageUrls[product.id][0]} 
                            alt={`Product image for ${product.name}`}
                            style={{ width: "150px", height: "150px" }}
                        />
                    ) : (
                        <img
                            src={productPic} 
                            alt="Default product pic"
                            style={{ width: "150px", height: "150px" }}
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
                    <div className="mobile-modal-overlay">
                        <div className="mobile-modal-content">
                            <span className="close-button" onClick={handleCloseModal}>&times;</span>
                            {productImageUrls[product.id] && productImageUrls[product.id].length > 0 ? (
                                productImageUrls[product.id].map((url, index) => (
                                    <div key={index} className="mobile-modal-img">
                                        <img
                                            src={url}
                                            alt={`Product image ${index}`}
                                            style={{ width: "100%", height: "300px" }}
                                            loading="lazy"
                                        />
                                    </div>
                                ))
                            ) : (
                                <img
                                    src={productPic} 
                                    alt="Default product pic"
                                    style={{ width: "100%", height: "300px" }}
                                    loading="lazy"
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
                                <div className="quantity-controls">
                                    <button className="d-btn" onClick={handleDecreaseQuantity} disabled={quantity === 1}>-</button>
                                    <span>{quantity}</span>
                                    <button className="i-btn" onClick={handleIncreaseQuantity}>+</button>
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
        ) : (
            <div className="product">
                <div className="product-img" onClick={handleProductClick} style={{ cursor: 'pointer' }}>
                    {productImageUrls[product.id] && productImageUrls[product.id].length > 0 ? (
                        <img
                            src={productImageUrls[product.id][0]} 
                            alt={`Product image for ${product.name}`}
                            style={{ width: "100%", height: "200px" }}
                        />
                    ) : (
                        <img
                            src={productPic} 
                            alt="Default product pic"
                            style={{ width: "100%", height: "200px" }}
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
                                            style={{ width: "100%", height: "350px" }}
                                            loading="lazy"
                                        />
                                    </div>
                                ))
                            ) : (
                                <img
                                    src={productPic} 
                                    alt="Default product pic"
                                    style={{ width: "100%", height: "350px" }}
                                    loading="lazy"
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
                                <div className="quantity-controls">
                                    <button className="d-btn" onClick={handleDecreaseQuantity} disabled={quantity === 1}>-</button>
                                    <span>{quantity}</span>
                                    <button className="i-btn" onClick={handleIncreaseQuantity}>+</button>
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
        )}
    </>
    );
}

export default Product;
