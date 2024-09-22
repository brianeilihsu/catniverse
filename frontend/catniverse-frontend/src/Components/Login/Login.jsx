import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.lineHeight = '0';

    return () => {
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.body.style.display = '';
      document.body.style.justifyContent = '';
      document.body.style.alignItems = '';
      document.body.style.lineHeight = '';
    };
  }, []); 

  const handleGetAccount = (event) => {
    setAccount(event.target.value);
  }

  const handleGetPassword = (event) => {
    setPassword(event.target.value);
  }

  const handleLogin = () => {
    if (account == "123" && password == 123) {
      navigate("/");
    } else {
      // 如果帳號或密碼錯誤，顯示提示信息
      alert("帳號或密碼錯誤，請再試一次。");
    }
  }

  return (
    <div>
      <div className="login-container">
        <h1>台灣浪貓地圖</h1>
        <div className="logo">
          <img src="img/login_cat.jpg" alt="台灣浪貓地圖 Logo" />
        </div>
        <form>
          <input
            type="text"
            id="account"
            placeholder="帳號"
            value={account}
            onChange={handleGetAccount}
            required
          />
          <input
            type="password"
            id="password"
            placeholder="密碼"
            value={password}
            onChange={handleGetPassword}
            required
          />
          <button type="button" onClick={handleLogin}>
            登入
          </button>
        </form>
        <div className="links">
          <Link to="/register">註冊新帳號</Link>
        </div>
      </div>
    </div>
  );
}
export default Login;
