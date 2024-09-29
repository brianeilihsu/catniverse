import React, { useState } from 'react';
import propTypes from 'prop-types';
import productPic from "../../Image/132402_0.jpg";
import "./Product.css";

function Product(props) {
    const [showModal, setShowModal] = useState(false); // 控制弹窗显示

    const handleProductClick = () => {
        setShowModal(true); // 点击商品时显示弹窗
    };

    const handleCloseModal = () => {
        setShowModal(false); // 关闭弹窗
    };

    return (
        <div className="product">
            {/* 商品图片 */}
            <div className="product-img" onClick={handleProductClick} style={{ cursor: 'pointer' }}>
                <img src={productPic} alt="product pic"></img>
                    {/* 商品标题 */}
                <h2 className='product-title'>{props.name}</h2>
                {/* 商品价格和库存状态 */}
                <div className="product-info">
                    <div className='product-sold'>
                        <i>{props.solded ? "Sold out" : "In stock"}</i>
                    </div>
                    <div className='product-price'>
                        <b>${props.price}</b>
                    </div>
            </div>
            
            </div>

            {/* 弹窗详情 */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close-button" onClick={handleCloseModal}>&times;</span>
                        <div className="modal-img">
                            <img src={productPic} alt="product pic"></img>
                        </div>
                        <div className="modal-details">
                            <h2 className='modal-header'>{props.name}</h2>
                            <div className="modal-price">
                                <b>${props.price}</b>
                            </div>
                            <p className="modal-description">
                                商品详情: 10cm 高度，占用100字左右内容描述
                            </p>
                            <p className="modal-sold">
                                {props.solded ? "Sold out" : "In stock"}
                            </p>
                            <button className="buy-button" disabled={props.solded}>
                                {props.solded ? "Sold out" : "加入购物车"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

Product.propTypes = {
    name: propTypes.string,
    price: propTypes.number,
    solded: propTypes.bool,
};

Product.defaultProps = {
    name: "Product",
    price: 456,
    solded: false,
};

export default Product;
