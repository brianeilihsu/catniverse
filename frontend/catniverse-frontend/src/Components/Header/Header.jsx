import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';  
import guidePic from "../../Image/home.png";
import guidePic2 from "../../Image/map.png";
import guidePic3 from "../../Image/about-us.png";
import guidePic4 from "../../Image/shop.png";
import guidePic5 from "../../Image/login.png";
import guidePic6 from "../../Image/logout.png";
import guidePic7 from "../../Image/profile.png";
import guidePic8 from "../../Image/register.png";
import guidePic9 from "../../Image/post.png";
import guidePic10 from "../../Image/account.png";
import './Header.css';


function Header({ user, onLogout }) {
  const [userId, setUserId] = useState(null); 

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId'); 
    if (storedUserId) {
      setUserId(storedUserId); 
    }
  }, []);

  const handleLogout = () => {
    console.log("Logging out");  
    onLogout();  
  };

  return (
    <div>
      <div className="sidebar">
        <Link to="/"><img className="guidePic-1" src={guidePic} alt="Home" />Home</Link>
        <Link to="/map"><img className="guidePic" src={guidePic2} alt="Map" />Map</Link>
        <Link to="/introduction"><img className="guidePic" src={guidePic3} alt="About as" />About as</Link>
        <Link to="/shop"><img className="guidePic" src={guidePic4} alt="Shop" />Shop</Link>

        {user ? (
          <div>
            <Link to="/upload"><img className="guidePic" src={guidePic9} alt="Upload post" />Upload post</Link>
            <Link to={`/profile/${userId}`}><img className="guidePic" src={guidePic7} alt="Profile" />Profile</Link>
            <Link to="#" onClick={handleLogout}><img className="guidePic-2" src={guidePic6} alt="Logout" />Logout</Link>
            <div className="user-info">
              <p id="username"><img className="guidePic" src={guidePic10} alt="Account" /> {user}</p>
            </div>
          </div>
        ) : (
          <div>
            <Link to="/login"><img className="guidePic" src={guidePic5} alt="Login" />Login</Link>
            <Link to="/register"><img className="guidePic" src={guidePic8} alt="Register" />Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
