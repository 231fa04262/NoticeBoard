import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import NoticeCard from '../components/NoticeCard';
import NoticeForm from '../components/NoticeForm';
import './Dashboard.css';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchNotices();
  }, [filters]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/notices?${params.toString()}`);
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await axios.delete(`/api/notices/${id}`);
        fetchNotices();
      } catch (error) {
        console.error('Error deleting notice:', error);
        alert('Error deleting notice');
      }
    }
  };

  const handleEdit = (notice) => {
    if (notice.author._id === user.id || notice.author === user.id) {
      setEditingNotice(notice);
      setShowForm(true);
    } else {
      alert('You can only edit your own notices');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNotice(null);
    fetchNotices();
  };

  if (loading && notices.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Faculty Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Create Notice
        </button>
      </div>

      <div className="filters">
        <div className="filters-row">
          <div className="form-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="academics">Academics</option>
              <option value="events">Events</option>
              <option value="exams">Exams</option>
              <option value="circulars">Circulars</option>
              <option value="placement">Placement</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search notices..."
            />
          </div>
        </div>
      </div>

      {showForm && (
        <NoticeForm
          notice={editingNotice}
          onClose={handleFormClose}
          isAdmin={false}
        />
      )}

      <div className="notices-list">
        {notices.length === 0 ? (
          <div className="card">No notices found</div>
        ) : (
          notices.map(notice => (
            <NoticeCard
              key={notice._id}
              notice={notice}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={notice.author._id === user.id || notice.author === user.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;

