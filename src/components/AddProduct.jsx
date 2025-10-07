import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import "./AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showUploadControls, setShowUploadControls] = useState(false);
  const [uploadedProducts, setUploadedProducts] = useState([]);

  const [formData, setFormData] = useState({
    productName: "",
    productCategory: "",
    productPrice: "",
    sellingPrice: "",
    quantity: "",
    ratings: "",
    discounts: "",
    soldDate: "",
  });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return toast.error("Please select a file first");

    const fd = new FormData();
    fd.append("file", selectedFile);

    try {
      const res = await api.post("/upload-excel/", fd);
      const data = res.data;

      toast.success(`${data.products.length} products uploaded successfully`);
      setUploadedProducts(data.products);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        toast.error("Upload failed: " + err.response.data.detail);
      } else {
        toast.error("Network error: Failed to upload");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      productName: formData.productName,
      productCategory: formData.productCategory,
      productPrice: parseFloat(formData.productPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantity: parseInt(formData.quantity, 10),
      userId: 0, 
    };

    if (formData.ratings !== "" && !isNaN(parseFloat(formData.ratings))) {
      dataToSend.ratings = parseFloat(formData.ratings);
    }
    if (formData.discounts !== "") {
      dataToSend.discounts = formData.discounts;
    }
    if (formData.soldDate !== "") {
      dataToSend.soldDate = formData.soldDate;
    }

    try {
      const res = await api.post("/manual-update/", dataToSend);
      toast.success("Manual product added successfully");
      setUploadedProducts((prev) => [...prev, res.data.productName]);
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        toast.error("Failed to add product: " + err.response.data.detail);
      } else {
        toast.error("Network error: Failed to add product");
      }
    }
    setFormData({
      productName: "",
      productCategory: "",
      productPrice: "",
      sellingPrice: "",
      quantity: "",
      ratings: "",
      discounts: "",
      soldDate: "",
    });
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <p>Upload your product Excel or add products manually</p>
      </div>

      <div className="selection-cards">
        <div
          className="card-option"
          onClick={() => {
            setShowUploadControls(!showUploadControls);
            setShowManualForm(false);
          }}
        >
          📁 Upload Products
          <p>Add upto 10 data at once</p>
        </div>
        <div
          className="card-option"
          onClick={() => {
            setShowManualForm(!showManualForm);
            setShowUploadControls(false);
          }}
        >
          ✏️ Add Manually
          <p>Add one product at a time</p>
        </div>
      </div>

      {showUploadControls && (
        <section className="upload-section">
          <div className="section-icon">📁</div>
          <h3>Upload File</h3>
          <div className="upload-controls">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="file-input"
            />
            <button onClick={handleFileUpload} className="primary-btn">
              Upload
            </button>
          </div>
          <p>
            <a href="/Sample.xlsx" download className="download-link">
              ⬇ Download Sample Excel
            </a>
          </p>
          {uploadedProducts.length > 0 && (
            <div className="uploaded-products">
              <h4>Uploaded Products:</h4>
              <ul>
                {uploadedProducts.map((p, index) => (
                  <li key={index}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
      {showManualForm && (
        <section className="manual-section">
          <div className="section-icon">✏️</div>
          <h3>Manual Product Entry</h3>
          <form onSubmit={handleManualSubmit} className="product-form">
            <div className="form-group">
              <label htmlFor="productName">Product Name *</label>
              <input type="text" id="productName" name="productName" value={formData.productName}onChange={handleChange} required className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="productCategory">Product Category *</label>
              <select id="productCategory" name="productCategory" value={formData.productCategory} onChange={handleChange} required className="form-input">
                <option value="">Select a category</option>
                <option value="Laptops">Laptops</option>
                <option value="Electronics">Electronics</option>
                <option value="Fitness">Fitness</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Clothings">Clothings</option>
                <option value="Shoes">Shoes</option>
                <option value="Books">Books</option>
                <option value="Home decor">Home decor</option>
                <option value="Self care">Self care</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="productPrice">Product Price (₹)*</label>
              <input type="number" id="productPrice" name="productPrice" value={formData.productPrice} onChange={handleChange} required className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="sellingPrice">Selling Price (₹)*</label>
              <input type="number" id="sellingPrice" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="ratings">Ratings (out of 5)</label>
              <input type="number" step="0.1" id="ratings" name="ratings" value={formData.ratings} onChange={handleChange} className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="discounts">Discounts (₹)</label>
              <input type="text" id="discounts" name="discounts" value={formData.discounts} onChange={handleChange} className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="soldDate">Sold Date</label>
              <input type="date" id="soldDate" name="soldDate" value={formData.soldDate} onChange={handleChange} className="form-input" />
            </div>
            <button type="submit" className="submit-btn">Save Product</button>
          </form>
        </section>
      )}
    </div>
  );
};

export default AddProduct;
