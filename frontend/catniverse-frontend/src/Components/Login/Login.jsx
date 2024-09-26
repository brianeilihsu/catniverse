import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

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

  const handleGetEmail = (event) => {
    setEmail(event.target.value);
  }

  const handleGetPassword = (event) => {
    setPassword(event.target.value);
  }

  const handleLogin = async (e) => {

    e.preventDefault();
    
    try {
      const response = await axios.post("http://140.136.151.71:8787/api/v1/auth/login", {
        email: email,
        password: password,
      });
      // 請求成功時
      console.log('Response data:', response.data);
      
      // 如果有拿到 JWT Token，通常會存到 Local Storage 或 State 中
      const jwtToken = response.data.data.jwt;  // 假設後端回傳的 JWT 存在 data.jwt 中
      localStorage.setItem('token', jwtToken);  // 儲存到 Local Storage 中

      // 設定訊息
      setMessage('Login successful! Token saved.');
      navigate("/");

    } catch (error) {
      // 錯誤處理
      if (error.response && error.response.status === 401) {
        setMessage('Login failed: Invalid email or password.');
      } else {
        setMessage('An error occurred: ' + error.message);
      }
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
            placeholder="信箱"
            value={email}
            onChange={handleGetEmail}
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
