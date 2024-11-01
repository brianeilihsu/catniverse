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
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    console.log("Logging out");
    onLogout();
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div>
      {isMobile ? (
        <div>
          {!isSidebarOpen && (
            <div className="sidebar-row">
              <button onClick={toggleSidebar} className="sidebar-toggle-button">
                ☰
              </button>
              <h1
                className="mobile-index-title"
                style={{ fontFamily: "Times New Roman" }}
              >
                MeowTaiwan
              </h1>
            </div>
          )}
          {isSidebarOpen && (
            <div className="sidebar-overlay" onClick={closeSidebar}></div>
          )}

          {isSidebarOpen && (
            <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
              <Link to="/">
                <img
                  className="guidePic"
                  src={guidePic}
                  alt="Home"
                  style={{ width: "15px", height: "15px" }}
                />
                Home
              </Link>
              <Link to="/map">
                <img
                  className="guidePic"
                  src={guidePic2}
                  alt="Map"
                  style={{ width: "20px", height: "20px" }}
                />
                Map
              </Link>
              <Link to="/chart">
                <img
                  className="guidePic"
                  src={guidePic10}
                  alt="Chart"
                  style={{ width: "20px", height: "20px" }}
                />
                Chart
              </Link>
              <Link to="/introduction">
                <img
                  className="guidePic"
                  src={guidePic3}
                  alt="About us"
                  style={{ width: "20px", height: "20px" }}
                />
                About us
              </Link>
              <Link to="/shop">
                <img
                  className="guidePic"
                  src={guidePic4}
                  alt="Shop"
                  style={{ width: "20px", height: "20px" }}
                />
                Shop
              </Link>
              {user ? (
                <div>
                  <Link to={`/profile/${userId}`}>
                    <img
                      className="guidePic"
                      src={guidePic7}
                      alt="Profile"
                      style={{ width: "20px", height: "20px" }}
                    />
                    Profile
                  </Link>
                  <Link to="#" onClick={handleLogout}>
                    <img
                      className="guidePic"
                      src={guidePic6}
                      alt="Logout"
                      style={{ width: "18px", height: "18px" }}
                    />
                    Logout
                  </Link>
                  <div className="mobile-user-info">
                    <img
                      className="guidePic"
                      src={guidePic9}
                      alt="Account"
                      style={{ width: "20px", height: "20px" }}
                    />
                    <p id="username"> {user}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Link to="/login">
                    <img
                      className="guidePic"
                      src={guidePic5}
                      alt="Login"
                      style={{ width: "20px", height: "20px" }}
                    />
                    Login
                  </Link>
                  <Link to="/register">
                    <img
                      className="guidePic"
                      src={guidePic8}
                      alt="Register"
                      style={{ width: "20px", height: "20px" }}
                    />
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="desktop-sidebar">
          <Link to="/">
            <img
              className="guidePic"
              src={guidePic}
              alt="Home"
              style={{ width: "20px", height: "20px" }}
            />
            Home
          </Link>
          <Link to="/map">
            <img
              className="guidePic"
              src={guidePic2}
              alt="Map"
              style={{ width: "25px", height: "25px" }}
            />
            Map
          </Link>
          <Link to="/chart">
            <img
              className="guidePic"
              src={guidePic10}
              alt="Chart"
              style={{ width: "25px", height: "25px" }}
            />
            Chart
          </Link>
          <Link to="/introduction">
            <img
              className="guidePic"
              src={guidePic3}
              alt="About us"
              style={{ width: "25px", height: "25px" }}
            />
            About us
          </Link>
          <Link to="/shop">
            <img
              className="guidePic"
              src={guidePic4}
              alt="Shop"
              style={{ width: "25px", height: "25px" }}
            />
            Shop
          </Link>
          {user ? (
            <div>
              <Link to={`/profile/${userId}`}>
                <img
                  className="guidePic"
                  src={guidePic7}
                  alt="Profile"
                  style={{ width: "25px", height: "25px" }}
                />
                Profile
              </Link>
              <Link to="#" onClick={handleLogout}>
                <img
                  className="guidePic"
                  src={guidePic6}
                  alt="Logout"
                  style={{ width: "22.5px", height: "22.5px" }}
                />
                Logout
              </Link>
              <div className="user-info">
                <img
                  className="guidePic"
                  src={guidePic9}
                  alt="Account"
                  style={{ width: "25px", height: "25px" }}
                />
                <p id="username"> {user}</p>
              </div>
            </div>
          ) : (
            <div>
              <Link to="/login">
                <img
                  className="guidePic"
                  src={guidePic5}
                  alt="Login"
                  style={{ width: "25px", height: "25px" }}
                />
                Login
              </Link>
              <Link to="/register">
                <img
                  className="guidePic"
                  src={guidePic8}
                  alt="Register"
                  style={{ width: "25px", height: "25px" }}
                />
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Header;
