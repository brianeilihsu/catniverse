// src/ProductForm.jsx
import React, { useState } from "react";
import axios from "axios";
import "./Assets/UploadEcommerce.css";

function ProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    inventory: "",
    description: "",
    category: "",
  });
  const [productImages, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({}); // State for validation errors

  // Validation rules
  const validateForm = () => {
    const errors = {};

    if (formData.name.trim().length < 3) {
      errors.name = "Product name must be at least 3 characters long.";
    }

    if (formData.brand.trim().length < 2) {
      errors.brand = "Brand must be at least 2 characters long.";
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = "Price must be a positive number.";
    }

    if (!formData.inventory || formData.inventory < 0) {
      errors.inventory = "Inventory cannot be negative.";
    }

    if (!formData.description.trim()) {
      errors.description = "Description cannot be empty.";
    }

    if (!formData.category) {
      errors.category = "Category must be selected.";
    }

    if (productImages.length === 0) {
      errors.productImages = "At least one productImage must be uploaded.";
    } else {
      productImages.forEach((productImage, index) => {
        if (!["productImage/jpeg", "productImage/png", "productImage/gif"].includes(productImage.type)) {
          errors.productImages = `Only JPEG, PNG, or GIF productImages are allowed. Invalid file type: ${productImage.name}`;
        }
        if (productImage.size > 5 * 1024 * 1024) {
          // Max size: 5MB
          errors.productImages = `Image ${productImage.name} exceeds the 5MB size limit.`;
        }
      });
    }

    return errors;
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle productImage input change and preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data before submission
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      try {
        // API call to add product
        const productResponse = await axios.post(
          "http://140.136.151.71:8787/api/v1/products/add",
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const productId = productResponse.data.data.id; // Assuming your product returns an ID

        // Upload productImages after product is added
        for (let i = 0; i < productImages.length; i++) {
          const formData = new FormData();
          formData.append("productId", productId);
          formData.append("files", productImages[i]);

          await axios.post(
            `http://140.136.151.71:8787/api/v1/productImages/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        alert("Product and productImages uploaded successfully!");
      } catch (error) {
        console.error("Error uploading product:", error);
        alert("Error uploading product");
      }
    } else {
      alert("Please fix the form errors before submitting.");
    }
  };

  return (
    <div className="container">
      <h1>E-commerce Product Upload</h1>
      <form id="productForm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="brand">Brand:</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />
          {errors.brand && <p style={{ color: "red" }}>{errors.brand}</p>}
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
          {errors.price && <p style={{ color: "red" }}>{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="inventory">Inventory:</label>
          <input
            type="number"
            id="inventory"
            name="inventory"
            value={formData.inventory}
            onChange={handleChange}
            min="0"
            required
          />
          {errors.inventory && (
            <p style={{ color: "red" }}>{errors.inventory}</p>
          )}
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
          {errors.description && (
            <p style={{ color: "red" }}>{errors.description}</p>
          )}
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="computers-technology">
              Computers & Technology Products
            </option>
            <option value="mobile-accessories">
              Mobile Phones & Accessories
            </option>
            <option value="fashion">Fashion</option>
            <option value="beauty-skincare">Perfumes, Beauty & Skincare</option>
            <option value="designer-luxury">
              Designer Brands & Luxury Goods
            </option>
            <option value="video-games">Video Games & Related Products</option>
            <option value="audio-equipment">
              Headphones & Audio Recording Equipment
            </option>
            <option value="cameras-photography">Cameras & Photography</option>
            <option value="furniture-home">Furniture & Home Goods</option>
            <option value="tv-appliances">TVs & Other Appliances</option>
            <option value="baby-kids">Baby & Kids</option>
            <option value="books">Books</option>
            <option value="leisure-toys">Leisure & Toys</option>
            <option value="health-supplements">Health & Supplements</option>
            <option value="sports-equipment">Sports Equipment</option>
            <option value="food-beverages">Food & Beverages</option>
            <option value="pet-supplies">Pet Supplies</option>
            <option value="tickets-vouchers">Tickets & Gift Vouchers</option>
            <option value="auto-parts">Auto & Motorcycle Parts</option>
            <option value="others">Others</option>
          </select>
          {errors.category && <p style={{ color: "red" }}>{errors.category}</p>}
        </div>
        <div>
          <label htmlFor="productImages">Product Images:</label>
          <div
            className="productImage-upload"
            onClick={() => document.getElementById("productImages").click()}
          >
            <p>Click or drag and drop productImages here</p>
            <input
              type="file"
              id="productImages"
              name="productImages"
              accept="productImage/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>
          <div className="productImage-preview">
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt="Preview"
                style={{ width: "100px", margin: "5px" }}
              />
            ))}
          </div>
          {errors.productImages && <p style={{ color: "red" }}>{errors.productImages}</p>}
        </div>
        <button type="submit">Upload Product</button>
      </form>
    </div>
  );
}

export default ProductForm;
