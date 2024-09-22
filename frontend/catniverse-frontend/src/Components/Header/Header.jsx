import React, { useState } from "react";
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ account }) {
    return (
        
        <div>
            <div className="sidebar">
                <Link to="/">首頁</Link>
                <Link to="/map">地圖</Link>
                <Link to="/introduction">關於我們</Link>
                <Link to="/help">如何幫助</Link>


                {account == null ? (
                    <div>
                        <Link to="/login">登入</Link>
                        <Link to="/register">註冊</Link>
                    </div>
                ) : (
                    <div>
                        <Link to="/upload">上傳圖片</Link>
                        <Link to="/profile">個人檔案</Link>
                        <Link to="#" >登出</Link>
                    </div>
                )}


                {account != null && (
                    <p id="username">登入帳號: {account}</p>
                )}


            </div>
        </div>
    );
}

export default Header;
