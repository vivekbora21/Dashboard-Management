import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showUploadControls, setShowUploadControls] = useState(false);

  const [formData, setFormData] = useState({
    productName: "",
    productCategory: "",
    productPrice: "",
    sellingPrice: "",
    quantity: "",
    userId: "",
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
    try {
      const res = await fetch("http://localhost:8000/manual-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        toast.error("Failed to add product: " + res.statusText);
        return;
      }
      await res.json();
      toast.success("Manual product added successfully");
      navigate('/dashboard/products');
    } catch (err) {
      console.error(err);
      toast.error("Network error: Failed to add product");
    }
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
      soldDate: "",
    });
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <p>Upload your product Excel or add products manually</p>
      </div>

      {/* Selection Cards */}
      <div className="selection-cards">
        <div
          className="card-option"
          onClick={() => {
            setShowUploadControls(!showUploadControls);
            setShowManualForm(false);
          }}
        >
          📁 Upload Products
        </div>
        <div
          className="card-option"
          onClick={() => {
            setShowManualForm(!showManualForm);
            setShowUploadControls(false);
          }}
        >
          ✏️ Add Manually
        </div>
      </div>

      {/* Upload Section (conditionally shown) */}
      {showUploadControls && (
        <section className="upload-section">
          <div className="section-icon">📁</div>
          <h3>Upload File</h3>
          <div className="upload-controls">
            <input
              type="file"
              accept=".csv"
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
        </section>
      )}

      {/* Manual Form (conditionally shown) */}
      {showManualForm && (
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
              <select
                id="productCategory"
                name="productCategory"
                value={formData.productCategory}
                onChange={handleChange}
                required
                className="form-input"
              >
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
                type="number"
                id="userId"
                name="userId"
                placeholder="Enter numeric user ID"
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
            <div className="form-group">
              <label htmlFor="soldDate">Sold Date</label>
              <input
                type="date"
                id="soldDate"
                name="soldDate"
                placeholder="YYYY-MM-DD"
                value={formData.soldDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <button type="submit" className="submit-btn">
              Save Product
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default AddProduct;
