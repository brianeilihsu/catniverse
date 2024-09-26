import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; // 引入 axios
import "./Register.css";

function Register() {
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    passwordCheck: "",
    email: "",
  });
  const [error, setError] = useState(""); // 用於顯示錯誤消息
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

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 防止表單提交導致頁面刷新

    if (!registerData.username || !registerData.email || !registerData.password || !registerData.passwordCheck) {
      alert("所有欄位均為必填項！");
      return;
    }

    if (registerData.password !== registerData.passwordCheck) {
      alert("密碼與確認密碼不一致");

      setRegisterData({
        ...registerData,
        password: "",
        passwordCheck: ""
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://140.136.151.71:8787/api/v1/users/add",
        registerData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("註冊成功！");
      navigate("/login"); // 成功後導航到登入頁面
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        setError(error.response.data.message || "註冊失敗，請稍後再試。");
      } else {
        console.error("Error registering:", error);
        setError("註冊失敗，請稍後再試。");
      }
    }
  };

  return (
    <div className="ctr">
      <div className="register-container">
        <h1>🐱 台灣浪貓地圖</h1>
        {error && <p className="error">{error}</p>} {/* 顯示錯誤消息 */}
        <form onSubmit={handleSubmit}>
          <label>使用者名稱</label>
          <input
            type="text"
            id="r_account"
            name="username"
            value={registerData.username}
            onChange={handleChange}
            required
          />

          <label>密碼</label>
          <input
            type="password"
            id="r_password"
            name="password"
            className="pass-key"
            value={registerData.password}
            onChange={handleChange}
            required
          />

          <label>確認密碼</label>
          <input
            type="password"
            id="r_password_check"
            name="passwordCheck"
            className="pass-key"
            value={registerData.passwordCheck}
            onChange={handleChange}
            required
          />

          <label>電子郵件</label>
          <input
            type="email"
            id="r_email"
            name="email"
            value={registerData.email}
            onChange={handleChange}
            required
          />

          <button type="submit">註冊</button>
        </form>
        <div className="login-link">
          已有帳號？<Link to="/login">登入</Link>
        </div>
      </div>
    </div>
  );
}
export default Register;
