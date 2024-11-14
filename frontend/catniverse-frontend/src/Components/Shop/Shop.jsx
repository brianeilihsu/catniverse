import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import Product from "./Product.jsx";
import "./Shop.css";
import cartPic from "../../Image/shopping-cart.png";
import orderPic from "../../Image/search.png";
import uploadPic from "../../Image/product.png";

function Shop() {
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [productData, setProductData] = useState([]);
  const [userData, setUserData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedRoles = JSON.parse(localStorage.getItem("roles"));

    if (
      Array.isArray(storedRoles) &&
      storedRoles.some((role) => role.name === "ROLE_ADMIN")
    ) {
      setIsAdmin(true);
    }

    const fetchProductData = async () => {
      try {
        const response = await axios.get(
          `https://api.catniverse.website/api/v1/products/all`
        );
        const products = response.data.data;
        setProductData(products);

        const uniqueCategories = [
          ...new Set(products.map((product) => product.category.name)),
        ];
        const uniqueBrands = [
          ...new Set(products.map((product) => product.brand)),
        ];
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
      } catch (error) {
        console.error(`Error fetching product data:`, error);
      }
    };

    fetchProductData();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchUserData = async (userId) => {
      try {
        if (!userData[userId]) {
          const response = await axios.get(
            `https://api.catniverse.website/api/v1/users/${userId}/user`
          );
          const user = response.data.data;

          setUserData((prevState) => ({
            ...prevState,
            [userId]: user,
          }));

          if (user.cart && user.cart.cartId) {
            localStorage.setItem("cartId", user.cart.cartId);
          }
        }
      } catch (error) {
        console.error(`Error fetching user data for userId ${userId}:`, error);
      }
    };

    if (userId) {
      fetchUserData(userId);
    }
  }, [userData]);

  const fetchFilteredProducts = async () => {
    setIsLoading(true);
    try {
      let response;
      const noSearchCriteria =
        !selectedCategory && !selectedBrand && name.trim() === "";

      if (noSearchCriteria) {
        response = await axios.get(
          `https://api.catniverse.website/api/v1/products/all`
        );
      } else if (selectedCategory && selectedBrand) {
        try {
          response = await axios.get(
            `https://api.catniverse.website/api/v1/products/products/by/category-and-brand`,
            { params: { category: selectedCategory, brand: selectedBrand } }
          );
        } catch (e) {
          alert("搜尋失敗，沒有符合條件的商品！");
        }
      } else if (selectedBrand && name.trim() !== "") {
        try {
          response = await axios.get(
            `https://api.catniverse.website/api/v1/products/products/by/brand-and-name`,
            { params: { brand: selectedBrand, name } }
          );
        } catch (e) {
          alert("搜尋失敗，沒有符合條件的商品！");
        }
      } else if (name.trim() !== "") {
        response = await axios.get(
          `https://api.catniverse.website/api/v1/products/products/${name}/products`
        );
      } else if (selectedCategory) {
        response = await axios.get(
          `https://api.catniverse.website/api/v1/products/product/${selectedCategory}/all/products`
        );
      } else if (selectedBrand) {
        response = await axios.get(
          `https://api.catniverse.website/api/v1/products/product/by-brand`,
          { params: { brand: selectedBrand } }
        );
      }

      const products = response?.data?.data || [];

      if (!noSearchCriteria && products.length === 0) {
        alert("搜尋失敗，沒有符合條件的商品！");
      }

      setProductData(products);
    } catch (error) {
      console.error(`Error fetching filtered product data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!name && !selectedCategory && !selectedBrand) {
      fetchFilteredProducts();
    }
  }, [name, selectedCategory, selectedBrand]);

  const handleSearch = () => {
    if (!isLoading) {
      fetchFilteredProducts();
    }
  };

  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleCategoryChange(event) {
    setSelectedCategory(event.target.value);
  }

  function handleBrandChange(event) {
    setSelectedBrand(event.target.value);
  }

  const handleUpload = () => {
    navigate("/uploadEcommerce");
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const handleOrder = () => {
    navigate("/order", { state: { productData } });
  };

  return (
    <>
      {isMobile ? (
        <div>
          <div className="mobile-justify">
            <div className="mobile-search">
              <input
                className="search-in"
                value={name}
                onChange={handleNameChange}
                placeholder="Search (e.g. product name)"
              />
              <button className="search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>
            <div className="mobile-searchKey">
              <select
                className="categorySearch"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                ) : (
                  <option>No category found</option>
                )}
              </select>
              <select
                className="brandSearch"
                value={selectedBrand}
                onChange={handleBrandChange}
              >
                <option value="">Select Brand</option>
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))
                ) : (
                  <option>No brand found</option>
                )}
              </select>
            </div>
            {isLoading ? (
              <div className="loading-overlay">
                <ClipLoader color={"#666"} size={50} />
              </div>
            ) : (
              <div className="mobile-product-list">
                {productData.length > 0 ? (
                  productData.map((product) => (
                    <Product key={product.id} product={product} />
                  ))
                ) : (
                  <p>No products found</p>
                )}
              </div>
            )}

            {isAdmin && (
              <button className="upload-btn" onClick={handleUpload}>
                <img
                  className="upload-img"
                  src={uploadPic}
                  alt="Upload Product"
                />
              </button>
            )}

            <button className="cart-btn" onClick={handleCart}>
              <img className="cart-img" src={cartPic} alt="Shopping Cart" />
            </button>
            <button className="order-btn" onClick={handleOrder}>
              <img className="order-img" src={orderPic} alt="Search Orders" />
            </button>
            <br />
          </div>
        </div>
      ) : (
        <div>
          <div className="justify">
            <h1 className="shop-title">Shop</h1>
            <div className="search">
              <input
                className="search-in"
                value={name}
                onChange={handleNameChange}
                placeholder="Search (e.g. product name)"
              />
              <button className="search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>

            <div className="searchKey">
              <select
                className="categorySearch"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                ) : (
                  <option>No category found</option>
                )}
              </select>
              <select
                className="brandSearch"
                value={selectedBrand}
                onChange={handleBrandChange}
              >
                <option value="">Select Brand</option>
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))
                ) : (
                  <option>No brand found</option>
                )}
              </select>
            </div>
            {isLoading ? (
              <div className="loading-overlay">
                <ClipLoader color={"#666"} size={50} />
              </div>
            ) : (
              <div className="product-list">
                {productData.length > 0 ? (
                  productData.map((product) => (
                    <Product key={product.id} product={product} />
                  ))
                ) : (
                  <p>No products found</p>
                )}
              </div>
            )}

            {isAdmin && (
              <button className="upload-btn" onClick={handleUpload}>
                <img
                  className="upload-img"
                  src={uploadPic}
                  alt="Upload Product"
                />
              </button>
            )}

            <button className="cart-btn" onClick={handleCart}>
              <img className="cart-img" src={cartPic} alt="Shopping Cart" />
            </button>
            <button className="order-btn" onClick={handleOrder}>
              <img className="order-img" src={orderPic} alt="Search Orders" />
            </button>
            <br />
          </div>
        </div>
      )}
    </>
  );
}

export default Shop;
