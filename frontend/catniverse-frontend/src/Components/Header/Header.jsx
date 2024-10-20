import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import guidePic from "../../Image/home.png";
import guidePic2 from "../../Image/map.png";
import guidePic3 from "../../Image/about-us.png";
import guidePic4 from "../../Image/shop.png";
import guidePic5 from "../../Image/login.png";
import guidePic6 from "../../Image/logout.png";
import guidePic7 from "../../Image/profile.png";
import guidePic8 from "../../Image/register.png";
import guidePic9 from "../../Image/account.png";
import guidePic10 from "../../Image/chart.png";
import "./Header.css";

function Header({ user, onLogout }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleLogout = () => {
    console.log("Logging out");
    onLogout();
    window.location.reload();
  };

  return (
    <div>
      <div className="sidebar">
        <Link to="/">
          <img 
            className="guidePic" 
            src={guidePic} alt="Home" 
            style={{width:"20px", height:"20px"}}
          />
          Home
        </Link>
        <Link to="/map">
          <img 
            className="guidePic" 
            src={guidePic2} alt="Map" 
            style={{width:"25px", height:"25px"}}
          />
          Map
        </Link>
        <Link to="/chart">
          <img 
            className="guidePic" 
            src={guidePic10} alt="Chart" 
            style={{width:"25px", height:"25px"}}
          />
          Chart
        </Link>
        <Link to="/introduction">
          <img 
            className="guidePic" 
            src={guidePic3} alt="About as" 
            style={{width:"25px", height:"25px"}}
          />
          About as
        </Link>
        <Link to="/shop">
          <img 
            className="guidePic" 
            src={guidePic4} alt="Shop" 
            style={{width:"25px", height:"25px"}}
          />
          Shop
        </Link>

        {user ? (
          <div>
            <Link to={`/profile/${userId}`}>
              <img 
                className="guidePic" 
                src={guidePic7} alt="Profile" 
                style={{width:"25px", height:"25px"}}
              />
              Profile
            </Link>
            <Link to="#" onClick={handleLogout}>
              <img 
                className="guidePic" 
                src={guidePic6} alt="Logout" 
                style={{width:"22.5px", height:"22.5px"}}
              />
              Logout
            </Link>
            <div className="user-info">
              <img 
                className="guidePic" 
                src={guidePic9} alt="Account" 
                style={{width:"25px", height:"25px"}}
              />
              <p id="username"> {user}</p>
            </div>
          </div>
        ) : (
          <div>
            <Link to="/login">
              <img 
                className="guidePic" 
                src={guidePic5} alt="Login" 
                style={{width:"25px", height:"25px"}}
              />
              Login
            </Link>
            <Link to="/register">
              <img 
                className="guidePic" 
                src={guidePic8} alt="Register" 
                style={{width:"25px", height:"25px"}}
              />
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
