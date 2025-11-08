import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import NoticeCard from '../components/NoticeCard';
import NoticeForm from '../components/NoticeForm';
import DateFilter from '../components/DateFilter';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    search: '',
    isArchived: false
  });
  const [stats, setStats] = useState({
    totalNotices: 0,
    totalViews: 0,
    totalUsers: 0
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchNotices();
    fetchStats();
  }, [filters]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      if (filters.isArchived) params.append('isArchived', 'true');

      const response = await axios.get(`/api/notices?${params.toString()}`);
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`/api/analytics?${params.toString()}`);
      setStats({
        totalNotices: response.data.analytics.totalNotices,
        totalViews: response.data.analytics.totalViews,
        totalUsers: response.data.analytics.totalUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await axios.delete(`/api/notices/${id}`);
        fetchNotices();
        fetchStats();
      } catch (error) {
        console.error('Error deleting notice:', error);
        alert('Error deleting notice');
      }
    }
  };

  const handleArchive = async (id) => {
    try {
      await axios.patch(`/api/notices/${id}/archive`);
      fetchNotices();
    } catch (error) {
      console.error('Error archiving notice:', error);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNotice(null);
    fetchNotices();
    fetchStats();
  };

  if (loading && notices.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Create Notice
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Notices</h3>
          <div className="stat-value">{stats.totalNotices}</div>
        </div>
        <div className="stat-card">
          <h3>Total Views</h3>
          <div className="stat-value">{stats.totalViews}</div>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
      </div>

      <DateFilter filters={filters} setFilters={setFilters} />

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
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={filters.isArchived}
                onChange={(e) => setFilters({ ...filters, isArchived: e.target.checked })}
              />
              Show Archived
            </label>
          </div>
        </div>
      </div>

      {showForm && (
        <NoticeForm
          notice={editingNotice}
          onClose={handleFormClose}
          isAdmin={true}
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
              onArchive={handleArchive}
              isAdmin={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

