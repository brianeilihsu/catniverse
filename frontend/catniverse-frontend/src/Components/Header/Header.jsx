import React from "react";
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {

  const handleLogout = () => {
    onLogout();  // 調用父組件傳遞的登出功能
  };

  return (
    <div>
      <div className="sidebar">
        <Link to="/">首頁</Link>
        <Link to="/map">地圖</Link>
        <Link to="/introduction">關於我們</Link>
        <Link to="/shop">義賣專區</Link>

        {user ? (
          <div>
            <Link to="/upload">上傳圖片</Link>
            <Link to="/profile">個人檔案</Link>
            <Link to="#" onClick={handleLogout}>登出</Link>
            <p id="username">登入帳號: {user}</p>
          </div>
        ) : (
          <div>
            <Link to="/login">登入</Link>
            <Link to="/register">註冊</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
