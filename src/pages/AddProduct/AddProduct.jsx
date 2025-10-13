import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api.js";
import "./AddProduct.css";
import { MdDriveFolderUpload } from 'react-icons/md';
import Loading from "../../components/Loading";

const AddProduct = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showUploadControls, setShowUploadControls] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);


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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "productName": {
        if (!value.trim()) error = "Product name is required";
        break;
      }

      case "productCategory": {
        if (!value.trim()) error = "Product category is required";
        break;
      }

      case "productPrice": {
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) error = "Product price must be greater than 0";
        break;
      }

      case "sellingPrice": {
        const sellPrice = parseFloat(value);
        if (isNaN(sellPrice) || sellPrice <= 0) error = "Selling price must be greater than 0";
        break;
      }

      case "quantity": {
        const qty = parseInt(value, 10);
        if (isNaN(qty) || qty <= 0) error = "Quantity must be greater than 0";
        break;
      }

      case "ratings": {
        if (value !== "") {
          const rating = parseFloat(value);
          if (isNaN(rating) || rating < 0 || rating > 5) error = "Ratings must be between 0 and 5";
        }
        break;
      }

      default:
        break;
    }

    return error;
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return toast.error("Please select a file first");

    setUploading(true);
    const fd = new FormData();
    fd.append("file", selectedFile);

    try {
      const res = await api.post("/upload-excel/", fd);
      const data = res.data;

      toast.success(`${data.products.length} products uploaded successfully`);
      setSelectedFile(null);
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        toast.error("Upload failed: " + err.response.data.detail);
      } else {
        toast.error("Network error: Failed to upload");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
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
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        toast.error("Failed to add product: " + err.response.data.detail);
      } else {
        toast.error("Network error: Failed to add product");
      }
    } finally {
      setSubmitting(false);
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
        <h1> Products Management <MdDriveFolderUpload/></h1>
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
          <div className="instructions">
            <h4>How to Upload Products:</h4>
            <ol>
              <li>Download the sample Excel file using the <a href="/Sample.xlsx">link</a> below.</li>
              <li>Open the file and fill in details for up to 10 products. Do not exceed 10 products.</li>
              <li>Save the file and select it using the file input below.</li>
              <li>Click the "Upload" button to submit your products.</li>
            </ol>
          </div>
          <div className="upload-controls">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="file-input"
            />
            <button onClick={handleFileUpload} className="primary-btn" disabled={uploading}>
              {uploading ? <Loading size={20} /> : "Upload"}
            </button>
          </div>
          <p>
            <a href="/Sample.xlsx" download className="download-link">
              Download Excel File
            </a>
          </p>
        </section>
      )}
      {showManualForm && (
        <section className="manual-section">
          <div className="section-icon">✏️</div>
          <h3>Manual Product Entry</h3>
          <form onSubmit={handleManualSubmit} className="product-form">
            <div className="form-group">
              <label htmlFor="productName">Product Name *</label>
              <input type="text" id="productName" name="productName" value={formData.productName} onChange={handleChange} onBlur={handleBlur} required className={`form-input ${errors.productName ? 'error' : ''}`}/>
              {errors.productName && <span className="error-message">{errors.productName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="productCategory">Product Category *</label>
              <select id="productCategory" name="productCategory" value={formData.productCategory} onChange={handleChange} onBlur={handleBlur} required className={`form-input ${errors.productCategory ? 'error' : ''}`}>
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
              {errors.productCategory && <span className="error-message">{errors.productCategory}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="productPrice">Product Price (₹)*</label>
              <input type="number" id="productPrice" name="productPrice" value={formData.productPrice} onChange={handleChange} onBlur={handleBlur} required className={`form-input ${errors.productPrice ? 'error' : ''}`}/>
              {errors.productPrice && <span className="error-message">{errors.productPrice}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="sellingPrice">Selling Price (₹)*</label>
              <input type="number" id="sellingPrice" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} onBlur={handleBlur} required className={`form-input ${errors.sellingPrice ? 'error' : ''}`}/>
              {errors.sellingPrice && <span className="error-message">{errors.sellingPrice}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} onBlur={handleBlur} required className={`form-input ${errors.quantity ? 'error' : ''}`}/>
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ratings">Ratings (out of 5)</label>
              <input type="number" step="0.1" id="ratings" name="ratings" value={formData.ratings} onChange={handleChange} onBlur={handleBlur} className={`form-input ${errors.ratings ? 'error' : ''}`}/>
              {errors.ratings && <span className="error-message">{errors.ratings}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="discounts">Discounts (₹)</label>
              <input type="text" id="discounts" name="discounts" value={formData.discounts} onChange={handleChange} className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="soldDate">Sold Date</label>
              <input type="date" id="soldDate" name="soldDate" value={formData.soldDate} onChange={handleChange} className="form-input" />
            </div>
            <button type="submit" className="submit-btn" disabled={Object.values(errors).some(error => error) || submitting}>
              {submitting ? <Loading size={20} /> : "Save Product"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default AddProduct;
