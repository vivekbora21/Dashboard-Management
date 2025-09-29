import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '',
    productPrice: '',
    sellingPrice: '',
    quantity: '',
    userId: '',
    ratings: '',
    discounts: '',
    soldDate: '',
  });

  const categories = [
    'Laptops', 'Electronics', 'Fitness', 'Mobiles', 'Home Appliances',
    'Clothings', 'Shoes', 'Books', 'Home decor', 'Self care'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      const sortedProducts = response.data.sort((a, b) => new Date(b.soldDate) - new Date(a.soldDate));
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName || '',
      productCategory: product.productCategory || '',
      productPrice: product.productPrice || '',
      sellingPrice: product.sellingPrice || '',
      quantity: product.quantity || '',
      userId: product.userId || '',
      ratings: product.ratings || '',
      discounts: product.discounts || '',
      soldDate: product.soldDate || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${editingProduct.id}`, formData);
      toast.success('Product updated successfully');
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-container">
      <h1>Products Management</h1>
      <table className="products-table">
        <thead>
          <tr>
            <th>SL No</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Product Price (₹)</th>
            <th>Selling Price (₹)</th>
            <th>Quantity</th>
            <th>Ratings</th>
            <th>Discounts</th>
            <th>Sold Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product, index) => {
            const slNo = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={product.id}>
                <td>{slNo}</td>
                <td>{product.productName}</td>
                <td>{product.productCategory}</td>
                <td>{product.productPrice} ₹</td>
                <td>{product.sellingPrice} ₹</td>
                <td>{product.quantity}</td>
                <td>{product.ratings}</td>
                <td>{product.discounts}</td>
                <td>{product.soldDate}</td>
                <td>
                  <button className="update-btn" onClick={() => handleUpdate(product)}>Update</button>
                  <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Product</h2>
            <form onSubmit={handleFormSubmit} className="product-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Product Category *</label>
                <select
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Product Price (₹) *</label>
                <input
                  type="number"
                  name="productPrice"
                  value={formData.productPrice}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Selling Price (₹) *</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>User ID *</label>
                <input
                  type="number"
                  name="userId"
                  value={formData.userId}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ratings</label>
                <input
                  type="number"
                  name="ratings"
                  value={formData.ratings}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Discounts</label>
                <input
                  type="text"
                  name="discounts"
                  value={formData.discounts}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Sold Date</label>
                <input
                  type="date"
                  name="soldDate"
                  value={formData.soldDate}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">Update Product</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

