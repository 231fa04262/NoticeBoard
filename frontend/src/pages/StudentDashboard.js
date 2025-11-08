import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NoticeCard from '../components/NoticeCard';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchNotices();
  }, [filters]);

  useEffect(() => {
    if (notifications.length > 0) {
      fetchNotices();
    }
  }, [notifications]);

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

  const handleAcknowledge = async (id) => {
    try {
      await axios.post(`/api/notices/${id}/acknowledge`);
      fetchNotices();
    } catch (error) {
      console.error('Error acknowledging notice:', error);
    }
  };

  if (loading && notices.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      {notifications.length > 0 && (
        <div className="success">
          You have {notifications.length} new notification(s)!
        </div>
      )}

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

      <div className="notices-list">
        {notices.length === 0 ? (
          <div className="card">No notices found</div>
        ) : (
          notices.map(notice => (
            <NoticeCard
              key={notice._id}
              notice={notice}
              onView={() => navigate(`/notice/${notice._id}`)}
              onAcknowledge={handleAcknowledge}
              isStudent={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

