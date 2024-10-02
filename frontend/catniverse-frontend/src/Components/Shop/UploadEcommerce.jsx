import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UploadEcommerce.css';
import backPic from '../../Image/back.png'; 
import { Link } from 'react-router-dom';

const ProductManagement = () => {
  const [productData, setProductData] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null); 
  const [editedProduct, setEditedProduct] = useState({}); 
  const [showForm, setShowForm] = useState(false); 
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    price: '',
    inventory: '',
    description: '',
    category: '',
  }); 
  const [images, setImages] = useState([]); 
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editedImages, setEditedImages] = useState(null); 
  const [editedImagePreviews, setEditedImagePreviews] = useState(null); 
  const [productImageUrls, setProductImageUrls] = useState({}); 
  const [errors, setErrors] = useState({});

  const fetchProductData = async () => {
    try {
      const response = await axios.get(
        `http://140.136.151.71:8787/api/v1/products/all`
      );
      const products = response.data.data;
      setProductData(products);

      products.forEach(product => {
        const downloadUrls = product.images.map(img => img.downloadUrl);
        fetchProductImages(downloadUrls, product.id);
      });
    } catch (error) {
      console.error(`Error fetching product data:`, error);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  const fetchProductImages = async (downloadUrls, productId) => {
    try {
      const imageBlobPromises = downloadUrls.map(async (downloadUrl) => {
        const response = await axios.get(
          `http://140.136.151.71:8787${downloadUrl}`,
          { responseType: "blob" }
        );
        return URL.createObjectURL(response.data);
      });

      const blobUrls = await Promise.all(imageBlobPromises);
      setProductImageUrls((prevState) => ({
        ...prevState,
        [productId]: blobUrls, 
      }));
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleEditChange = (e, field) => {
    setEditedProduct({
      ...editedProduct,
      [field]: e.target.value,
    });
  };

  const handleNewProductChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleEditedImageChange = (e) => {
    const file = e.target.files[0]; 
  
    if (file) {
      const errors = {};
  
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        errors.editedImages = `只能上傳 JPEG、PNG 或 GIF 圖片。`;
      }
  
      if (file.size > 5 * 1024 * 1024) {
        errors.editedImages = `圖片大小不能超過 5MB。`;
      }
  
      if (Object.keys(errors).length === 0) {
        setEditedImages(file);
        setEditedImagePreviews(URL.createObjectURL(file));
      } else {
        setErrors(errors);
      }
    } else {
      setEditedImagePreviews(null); // 沒有選擇圖片時，清除預覽
    }
  };
  
  const startEditing = (product) => {
    setEditingProductId(product.id);
    setEditedProduct({ ...product });
    setEditedImages(""); // Reset image when starting a new edit
    setEditedImagePreviews(""); // Clear previous image previews
  };

  const deleteProduct = async (productId) => {
    const token = localStorage.getItem('token'); 
  
    try {
      const response = await axios.delete(`http://140.136.151.71:8787/api/v1/products/product/${productId}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        setProductData(prevData => prevData.filter(product => product.id !== productId));
        alert("Product deleted successfully!");
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const saveEdits = async (productId, imageId) => {
    const token = localStorage.getItem('token');
  
    try {
      await axios.put(`http://140.136.151.71:8787/api/v1/products/product/${productId}/update`, editedProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      fetchProductData(); // 成功更新後重新獲取數據

      setEditingProductId(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }

    if (editedImages) {
      try {
        const formData = new FormData();
        formData.append('file', editedImages);
  
        await axios.put(
          `http://140.136.151.71:8787/api/v1/product-images/image/${imageId}/update`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        console.log('Image updated successfully');
        fetchProductData(); // 更新圖片後也重新獲取數據
      } catch (error) {
        console.error('Error updating product image:', error);
        alert('Error updating product image');
      }
    }
  };
  
  const cancelEdits = () => {
    setEditingProductId(null);
    setEditedProduct({});
    setEditedImages("");
    setEditedImagePreviews("");
  };

  const handleNewProductSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      setErrors({ form: 'Please fill in all required fields.' });
      return;
    }

    try {
      const productResponse = await axios.post(
        'http://140.136.151.71:8787/api/v1/products/add',
        newProduct,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const productId = productResponse.data.data.id;

      // If there are images, upload them
      if(images.length > 0){
        const formData = new FormData();
        formData.append('productId', productId);
        images.forEach((image) => {
          formData.append('files', image); // Append each file to FormData
        });

        await axios.post(
          `http://140.136.151.71:8787/api/v1/product-images/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      alert('Product added successfully!');
      fetchProductData(); // 成功新增後重新獲取數據
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      brand: '',
      price: '',
      inventory: '',
      description: '',
      category: '',
    });
    setImages([]);
    setImagePreviews([]);
    setErrors({});
  };

  return (
    <div className='justify'>
      <br />
      <div className="pl-container">
        <div className="backLogo">
          <Link to={`/shop`} className="back-container">
            <button className="back-btn">
              <img className="backPic" src={backPic} alt="Back" />
            </button>
            <p>Back</p>
          </Link>
        </div>
        <div className="p-list">
          <h2>Product List</h2>
          <table id="productTable">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Category</th>
                <th>Product Image</th>
                <th>Description</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody>
              {productData.map((product) => (
                <tr key={product.id}>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="text"
                        value={editedProduct.name || ''}
                        onChange={(e) => handleEditChange(e, 'name')}
                      />                    
                    ) : (
                      product.name
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="text"
                        value={editedProduct.brand}
                        onChange={(e) => handleEditChange(e, 'brand')}
                      />
                    ) : (
                      product.brand
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="number"
                        value={editedProduct.price}
                        onChange={(e) => handleEditChange(e, 'price')}
                      />
                    ) : (
                      product.price
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="number"
                        value={editedProduct.inventory}
                        onChange={(e) => handleEditChange(e, 'inventory')}
                      />
                    ) : (
                      product.inventory
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="text"
                        value={editedProduct.category ? editedProduct.category.name : ''}
                        onChange={(e) => handleEditChange(e, 'category')}
                      />                    
                    ) : (
                      product.category.name
                    )}
                  </td>
                  <td>
                    {productImageUrls[product.id] && productImageUrls[product.id].length > 0 ? (
                      productImageUrls[product.id].map((url, index) => (
                        <div key={index}>
                          <img
                            src={url}
                            alt={`Product image ${index}`}
                            className="product-image"
                            style={{ width: "100%", height: "auto" }}
                          />
                        </div>
                      ))
                    ) : (
                      <span>No Image Available</span>
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="text"
                        value={editedProduct.description}
                        onChange={(e) => handleEditChange(e, 'description')}
                      />
                    ) : (
                      product.description
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <>
                        <button
                          className="save-btn"
                          onClick={() =>
                            saveEdits(
                              product.id,
                              product.images.length > 0 ? product.images[0].id : null 
                            )
                          }
                        >
                          Save
                        </button>
                        <button className="cancel-btn" onClick={cancelEdits}>Cancel</button>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleEditedImageChange}
                        />
                        {editedImagePreviews && (
                          <div className="image-preview">  
                            <img src={editedImagePreviews} alt="Preview" style={{ width: '100px', margin: '5px' }} />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <button className="edit-btn" onClick={() => startEditing(product)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => deleteProduct(product.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <br />
      <button onClick={() => setShowForm((prevShowForm) => !prevShowForm)} className="new-product-btn">
        {showForm ? 'Close' : 'Add'}
      </button>
      <br />
      <br />
      {showForm && (
        <div className="p-container">
          <div className="product-form">
            <h2>Add New Product</h2>
            <form id="productForm" onSubmit={handleNewProductSubmit}>
              <div className="form-group">
                <label htmlFor="name">Product Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleNewProductChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="brand">Brand:</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={newProduct.brand}
                  onChange={handleNewProductChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price:</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleNewProductChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="inventory">Inventory:</label>
                <input
                  type="number"
                  id="inventory"
                  name="inventory"
                  value={newProduct.inventory}
                  onChange={handleNewProductChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleNewProductChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select
                  id="category"
                  name="category"
                  value={newProduct.category}
                  onChange={handleNewProductChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="computers-technology">Computers & Technology Products</option>
                  <option value="mobile-accessories">Mobile Phones & Accessories</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty-skincare">Perfumes, Beauty & Skincare</option>
                  <option value="designer-luxury">Designer Brands & Luxury Goods</option>
                  <option value="video-games">Video Games & Related Products</option>
                  <option value="audio-equipment">Headphones & Audio Recording Equipment</option>
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
              </div>
              <div className="form-group">
                <label htmlFor="images">Product Image</label>
                <div className="image-upload" onClick={() => document.getElementById('images').click()}>
                  <p>Click or drag images here</p>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </div>
                <div className="image-preview">
                  {imagePreviews.map((preview, index) => (
                    <img key={index} src={preview} alt="Preview" style={{ width: '100px', margin: '5px' }} />
                  ))}
                </div>
              </div>
              <button className="submit-btn" type="submit">
                Upload Product
              </button>
            </form>
          </div>
        </div>
      )}
      <br />
    </div>
  );
};

export default ProductManagement;
