import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import './NoticeForm.css';

const NoticeForm = ({ notice, onClose, isAdmin }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    targetAudience: {
      isGlobal: true,
      roles: [],
      departments: [],
      years: [],
      courses: []
    },
    scheduledDate: '',
    expiresAt: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || '',
        content: notice.content || '',
        category: notice.category || 'general',
        priority: notice.priority || 'medium',
        targetAudience: notice.targetAudience || {
          isGlobal: true,
          roles: [],
          departments: [],
          years: [],
          courses: []
        },
        scheduledDate: notice.scheduledDate ? new Date(notice.scheduledDate).toISOString().slice(0, 16) : '',
        expiresAt: notice.expiresAt ? new Date(notice.expiresAt).toISOString().slice(0, 16) : ''
      });
    }
  }, [notice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('targetAudience.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        targetAudience: {
          ...formData.targetAudience,
          [field]: field === 'isGlobal' ? value === 'true' : value.split(',').filter(v => v.trim())
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('targetAudience', JSON.stringify(formData.targetAudience));
      if (formData.scheduledDate) {
        formDataToSend.append('scheduledDate', new Date(formData.scheduledDate).toISOString());
      }
      if (formData.expiresAt) {
        formDataToSend.append('expiresAt', new Date(formData.expiresAt).toISOString());
      }

      files.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      if (notice) {
        await axios.put(`/api/notices/${notice._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/notices', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{notice ? 'Edit Notice' : 'Create Notice'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="6"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="general">General</option>
                <option value="academics">Academics</option>
                <option value="events">Events</option>
                <option value="exams">Exams</option>
                <option value="circulars">Circulars</option>
                <option value="placement">Placement</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {isAdmin && (
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.targetAudience.isGlobal}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      targetAudience: {
                        ...formData.targetAudience,
                        isGlobal: e.target.checked
                      }
                    });
                  }}
                />
                Global Notice (All Users)
              </label>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Scheduled Date (Optional)</label>
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Expires At (Optional)</label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Attachments</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, index) => (
                  <span key={index} className="file-item">{file.name}</span>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : notice ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeForm;

