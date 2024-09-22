import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [registerData, setRegisterData] = useState({
    account: "",
    password: "",
    passwordCheck: "",
    email: "",
  });

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

  const handleSubmit = () => {
    if (registerData.password !== registerData.passwordCheck) {
      alert("密碼與確認密碼不一致");

      setRegisterData({
        ...registerData,
        password: "",
        passwordCheck: ""
      });
      
      return;
    }
    else {

    }
  };


  return (
    <div className="ctr">
      <div className="register-container">
        <h1>🐱 台灣浪貓地圖</h1>
        <form>
          <label>帳號</label>
          <input
            type="text"
            id="r_account"
            name="account"
            value={registerData.account}
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

          <button type="button" onClick={handleSubmit}>
            註冊
          </button>
        </form>
        <div className="login-link">
          已有帳號？<Link to="/login">登入</Link>
        </div>
      </div>
    </div>
  );
}
export default Register;
