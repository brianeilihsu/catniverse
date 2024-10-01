import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../Image/cat-lover.png";


function Login({ setUsername }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');
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

  const fetchRole = async (email) => {
    try {
      const response = await axios.get(
        `http://140.136.151.71:8787/api/v1/users/get-by-email`,
        {
          params: { email: email }
        }
      );
  
      const user = response.data.data;
  
      if (Array.isArray(user.roles)) {
        localStorage.setItem("roles", JSON.stringify(user.roles)); 
      }
  
    } catch (error) {
      console.error(`Error fetching user data for email ${email}:`, error);
    }
  };
  
  

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
      
      const jwtToken = response.data.data.token;  
      localStorage.setItem('token', jwtToken);  

      const userId = response.data.data.id;
      localStorage.setItem("userId", userId); 

      const response2 = await axios.get(`http://140.136.151.71:8787/api/v1/users/${userId}/user`);

      if (response2.data && response2.data.data.username) {
        const username = response2.data.data.username;
        localStorage.setItem("username", username); 
        setUsername(username);
        setMessage('Login successful! Token saved.');
        fetchRole(email);
        navigate("/");
      } else {
        console.error('Failed to fetch username');
      }
    } catch (error) {
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
        <div className="logo">
          <img src={logo} alt="" />
          <h1>Sign in</h1>
        </div>
        <form>
          <input
            type="text"
            id="account"
            placeholder="Email"
            value={email}
            onChange={handleGetEmail}
            required
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={handleGetPassword}
            required
          />
          <button type="login-button" onClick={handleLogin}>
            Login
          </button>
        </form>
        <div className="links">
          <Link to="/register">Register a new account</Link>
        </div>
      </div>
    </div>
  );
}
export default Login;