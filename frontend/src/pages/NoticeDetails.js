import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './NoticeDetails.css';

const NoticeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      const response = await axios.get(`/api/notices/${id}`);
      setNotice(response.data.notice);
      setAcknowledged(
        response.data.notice.acknowledgments?.some(
          ack => ack.userId._id === user.id || ack.userId === user.id
        )
      );
    } catch (error) {
      console.error('Error fetching notice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await axios.post(`/api/notices/${id}/comment`, { comment });
      setComment('');
      fetchNotice();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  const handleAcknowledge = async () => {
    try {
      await axios.post(`/api/notices/${id}/acknowledge`);
      setAcknowledged(true);
      fetchNotice();
    } catch (error) {
      console.error('Error acknowledging notice:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'badge-danger';
      case 'high':
        return 'badge-warning';
      case 'medium':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!notice) {
    return <div className="error">Notice not found</div>;
  }

  return (
    <div className="notice-details">
      <div className="notice-details-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="card notice-details-card">
        <div className="notice-header">
          <h1 className="notice-title">{notice.title}</h1>
          <div className="notice-badges">
            <span className={`badge ${getPriorityColor(notice.priority)}`}>
              {notice.priority}
            </span>
            <span className="badge badge-primary">{notice.category}</span>
          </div>
        </div>

        <div className="notice-meta">
          <p><strong>Author:</strong> {notice.author?.name || 'Unknown'}</p>
          <p><strong>Published:</strong> {format(new Date(notice.publishedAt), 'PPpp')}</p>
          <p><strong>Views:</strong> {notice.views}</p>
        </div>

        <div className="notice-content">
          <p>{notice.content}</p>
        </div>

        {notice.attachments && notice.attachments.length > 0 && (
          <div className="notice-attachments">
            <h3>Attachments</h3>
            {notice.attachments.map((attachment, index) => (
              <a
                key={index}
                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${attachment.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-link"
              >
                📎 {attachment.originalName}
              </a>
            ))}
          </div>
        )}

        {user.role === 'student' && !acknowledged && (
          <button className="btn btn-success" onClick={handleAcknowledge}>
            Acknowledge Notice
          </button>
        )}

        {acknowledged && (
          <div className="success">✓ You have acknowledged this notice</div>
        )}
      </div>

      <div className="card comments-section">
        <h2>Comments</h2>
        <div className="comments-list">
          {notice.comments && notice.comments.length > 0 ? (
            notice.comments.map((comment, index) => (
              <div key={index} className="comment">
                <div className="comment-header">
                  <strong>{comment.userId?.name || 'Unknown'}</strong>
                  <span>{format(new Date(comment.createdAt), 'PPpp')}</span>
                </div>
                <div className="comment-content">{comment.comment}</div>
              </div>
            ))
          ) : (
            <p>No comments yet</p>
          )}
        </div>

        <form onSubmit={handleComment} className="comment-form">
          <div className="form-group">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default NoticeDetails;

