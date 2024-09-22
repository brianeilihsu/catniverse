import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [email, setEmail] = useState("");

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

  const handleRegister = () => {
    if (password !== passwordCheck) {
      alert("密碼與確認密碼不一致");
      setPassword("");
      setPasswordCheck("");
      return;
    }
  };

  const handleGetAccount = (event) => {
    setAccount(event.target.value);
  };

  const handleGetPassword = (event) => {
    setPassword(event.target.value);
  };

  const handlePasswordCheck = (event) => {
    setPasswordCheck(event.target.value);
  };
  
  const handleGetEmail = (event) => {
    setEmail(event.target.value);
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
            value={account}
            onChange={handleGetAccount}
            required
          />

          <label>密碼</label>
          <input
            type="password"
            id="r_password"
            className="pass-key"
            value={password}
            onChange={handleGetPassword}
            required
          />

          <label>確認密碼</label>
          <input
            type="password"
            id="r_password_check"
            className="pass-key"
            value={passwordCheck}
            onChange={handlePasswordCheck}
            required
          />

          <label>電子郵件</label>
          <input
            type="email"
            id="r_email"
            value={email}
            onChange={handleGetEmail}
            required
          />

          <button type="button" onClick={handleRegister}>
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
