import React, { useState } from "react";
import { toast } from 'react-toastify';

const AddProduct = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    productCategory: "",
    productPrice: "",
    sellingPrice: "",
    quantity: "",
    userId: "",
    ratings: "",
    discounts: "",
  });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return toast.error("Please select a file first");
    const fd = new FormData();
    fd.append("file", selectedFile);

    // send to FastAPI endpoint
    await fetch("http://localhost:8000/upload-csv", {
      method: "POST",
      body: fd,
    })
      .then((res) => res.json())
      .then(() => toast.success("CSV uploaded successfully"))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:8000/manual-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => toast.success("Manual product added successfully"))
      .catch((err) => console.error(err));

    // reset form
    setFormData({
      productName: "",
      productCategory: "",
      productPrice: "",
      sellingPrice: "",
      quantity: "",
      userId: "",
      ratings: "",
      discounts: "",
    });
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <p>Upload your product Excel or add products manually</p>
      </div>

      {/* Upload Section */}
      <section className="upload-section">
        <div className="section-icon">📁</div>
        <h3>Upload File</h3>
        <div className="upload-controls">
          <input type="file" accept=".csv" onChange={handleFileChange} className="file-input" />
          <button onClick={handleFileUpload} className="primary-btn">
            Upload 
          </button>
        </div>
        <p>
          <a href="/Sample.xlsx" download className="download-link">
            ⬇ Download Sample Excel
          </a>
        </p>
      </section>

      {/* Manual Update Section */}
      <section className="manual-section">
        <div className="section-icon">✏️</div>
        <h3>Manual Product Entry</h3>
        <form onSubmit={handleManualSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input
              type="text"
              id="productName"
              name="productName"
              placeholder="Enter product name"
              value={formData.productName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productCategory">Product Category *</label>
            <input
              type="text"
              id="productCategory"
              name="productCategory"
              placeholder="Enter category"
              value={formData.productCategory}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="productPrice">Product Price (In Rupees)*</label>
            <input
              type="number"
              id="productPrice"
              name="productPrice"
              placeholder="0.00"
              value={formData.productPrice}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="sellingPrice">Selling Price (In Rupees)*</label>
            <input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              placeholder="0"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="userId">User ID *</label>
            <input
              type="text"
              id="userId"
              name="userId"
              placeholder="Enter user ID"
              value={formData.userId}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ratings">Ratings</label>
            <input
              type="number"
              step="0.1"
              id="ratings"
              name="ratings"
              placeholder="0.0"
              value={formData.ratings}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="discounts">Discounts</label>
            <input
              type="text"
              id="discounts"
              name="discounts"
              placeholder="In rupees"
              value={formData.discounts}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <button type="submit" className="submit-btn">
            Save Product
          </button>
        </form>
      </section>
    </div>
  );
};



export default AddProduct;
