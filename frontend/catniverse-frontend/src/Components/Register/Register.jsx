import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Register.css";
import logo from "../../Image/cat-lover(1).png";

function Register() {
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    passwordCheck: "",
    email: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.lineHeight = '0';
    document.body.style.backgroundColor='hsl(0, 0%, 95%)';

    return () => {
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.body.style.display = '';
      document.body.style.justifyContent = '';
      document.body.style.alignItems = '';
      document.body.style.lineHeight = '';
      document.body.style.backgroundColor='';
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
        alert(error.response.data.message);
      } else {
        console.error("Error registering:", error);
        alert("註冊失敗，請稍後再試。");
      }
    }
  };

  return (
    <div className="ctr">
      <div className="register-container">
        <div className="logo">
          <img src={logo}></img>
          <h1>Sign Up</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            id="r_account"
            name="username"
            value={registerData.username}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            id="r_password"
            name="password"
            className="pass-key"
            value={registerData.password}
            onChange={handleChange}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            id="r_password_check"
            name="passwordCheck"
            className="pass-key"
            value={registerData.passwordCheck}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            id="r_email"
            name="email"
            value={registerData.email}
            onChange={handleChange}
            required
          />

          <button className=".register-btn" type="submit">Register</button>
        </form>
        <div className="login-link">
          Already have an account?<Link to="/login"> Sign in</Link>
        </div>
      </div>
    </div>
  );
}
export default Register;
