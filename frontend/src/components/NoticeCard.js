import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './NoticeCard.css';

const NoticeCard = ({ notice, onEdit, onDelete, onArchive, onView, onAcknowledge, isAdmin, isStudent, canEdit }) => {
  const navigate = useNavigate();

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

  const handleClick = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/notice/${notice._id}`);
    }
  };

  return (
    <div className="notice-card">
      <div className="notice-header">
        <div>
          <h3 className="notice-title" onClick={handleClick}>
            {notice.title}
          </h3>
          <div className="notice-meta">
            <span className={`badge ${getPriorityColor(notice.priority)}`}>
              {notice.priority}
            </span>
            <span className="badge badge-primary">{notice.category}</span>
            <span>By {notice.author?.name || 'Unknown'}</span>
            <span>{format(new Date(notice.publishedAt), 'MMM dd, yyyy')}</span>
            <span>👁 {notice.views} views</span>
          </div>
        </div>
      </div>

      <div className="notice-content" onClick={handleClick}>
        {notice.content.length > 150
          ? `${notice.content.substring(0, 150)}...`
          : notice.content}
      </div>

      {notice.attachments && notice.attachments.length > 0 && (
        <div className="notice-attachments-preview">
          📎 {notice.attachments.length} attachment(s)
        </div>
      )}

      <div className="notice-footer">
        <div className="notice-actions">
          {isStudent && onAcknowledge && (
            <button
              className="btn btn-success btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onAcknowledge(notice._id);
              }}
            >
              Acknowledge
            </button>
          )}
          {(isAdmin || canEdit) && (
            <>
              {onEdit && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(notice);
                  }}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notice._id);
                  }}
                >
                  Delete
                </button>
              )}
              {isAdmin && onArchive && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(notice._id);
                  }}
                >
                  {notice.isArchived ? 'Unarchive' : 'Archive'}
                </button>
              )}
            </>
          )}
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleClick}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default NoticeCard;

