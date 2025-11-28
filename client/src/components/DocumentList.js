import React, { useState } from 'react';
import { Tabs, Card, Button, Empty, Tag, Input, message, Modal, Spin } from 'antd';
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  UserOutlined,
  CommentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './DocumentList.css';

const { TabPane } = Tabs;
const { TextArea } = Input;

const DocumentList = ({
  appointmentId,
  documents = [],
  userRole = 'patient', // 'patient' or 'doctor'
  onRefresh
}) => {
  const [commentText, setCommentText] = useState('');
  const [commentingDocId, setCommentingDocId] = useState(null);
  const [loadingComment, setLoadingComment] = useState(false);

  // Filter documents by category
  const preAppointmentDocs = documents.filter(doc => doc.category === 'pre-appointment');
  const postAppointmentDocs = documents.filter(doc => doc.category === 'post-appointment');

  // Download document
  const handleDownload = async (document) => {
    try {
      const res = await axios.get(
        `/api/v1/appointment/${appointmentId}/document/${document._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Document downloaded successfully');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to download document');
    }
  };

  // Add comment to document (doctor only)
  const handleAddComment = async (documentId) => {
    if (!commentText.trim()) {
      message.warning('Please enter a comment');
      return;
    }

    setLoadingComment(true);

    try {
      const res = await axios.post(
        `/api/v1/appointment/${appointmentId}/document/${documentId}/comment`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (res.data.success) {
        message.success('Comment added successfully');
        setCommentText('');
        setCommentingDocId(null);

        // Refresh document list
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoadingComment(false);
    }
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') {
      return <FilePdfOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />;
    }
    return <FileImageOutlined style={{ fontSize: '32px', color: '#1890ff' }} />;
  };

  // Get uploader role badge
  const getUploaderBadge = (uploaderRole) => {
    if (uploaderRole === 'doctor') {
      return <Tag color="blue">Doctor</Tag>;
    }
    return <Tag color="green">Patient</Tag>;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  // Render document card
  const renderDocumentCard = (document) => (
    <div key={document._id} className="document-card-mobile">
      {/* File Header */}
      <div className="document-header-mobile">
        <div className="document-icon-mobile">
          {getFileIcon(document.fileType)}
        </div>
        <div className="document-title-mobile">
          <h4 className="document-filename">{document.filename}</h4>
          <div className="document-meta">
            <UserOutlined /> {document.uploadedBy?.firstName} {document.uploadedBy?.lastName}
            {' '}
            {getUploaderBadge(document.uploaderRole)}
          </div>
          <div className="document-meta">
            <ClockCircleOutlined /> {moment(document.uploadedAt).format('MMM DD, HH:mm')} • {formatFileSize(document.fileSize)}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={() => handleDownload(document)}
        className="document-download-btn-mobile"
        block
      >
        Download
      </Button>

      {/* Comments Section */}
      {document.comments && document.comments.length > 0 && (
        <div className="document-comments-section">
          <div className="comments-header">
            <CommentOutlined /> Comments ({document.comments.length})
          </div>
          {document.comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-author">
                Dr. {comment.userId?.firstName} {comment.userId?.lastName}
              </div>
              <div className="comment-text">{comment.text}</div>
              <div className="comment-time">
                {moment(comment.createdAt).fromNow()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment (Doctor only) */}
      {userRole === 'doctor' && (
        <div className="document-comment-form">
          {commentingDocId === document._id ? (
            <div className="comment-form-active">
              <TextArea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your comment here..."
                className="comment-textarea-mobile"
              />
              <div className="comment-form-actions">
                <Button
                  type="primary"
                  onClick={() => handleAddComment(document._id)}
                  loading={loadingComment}
                  block
                >
                  Submit Comment
                </Button>
                <Button
                  onClick={() => {
                    setCommentingDocId(null);
                    setCommentText('');
                  }}
                  block
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              icon={<CommentOutlined />}
              onClick={() => setCommentingDocId(document._id)}
              block
              className="add-comment-btn-mobile"
            >
              Add Comment
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // Render empty state
  const renderEmptyState = (category) => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span>
          No {category} documents uploaded yet
        </span>
      }
    />
  );

  return (
    <div className="document-list-container-mobile">
      <Tabs defaultActiveKey="pre" className="document-tabs-mobile">
        <TabPane
          tab={
            <span className="tab-label-mobile">
              Pre
              {preAppointmentDocs.length > 0 && (
                <Tag color="blue" className="tab-badge-mobile">
                  {preAppointmentDocs.length}
                </Tag>
              )}
            </span>
          }
          key="pre"
        >
          <div className="documents-grid-mobile">
            {preAppointmentDocs.length > 0 ? (
              preAppointmentDocs.map((doc) => renderDocumentCard(doc))
            ) : (
              renderEmptyState('pre-appointment')
            )}
          </div>
        </TabPane>

        <TabPane
          tab={
            <span className="tab-label-mobile">
              Post
              {postAppointmentDocs.length > 0 && (
                <Tag color="green" className="tab-badge-mobile">
                  {postAppointmentDocs.length}
                </Tag>
              )}
            </span>
          }
          key="post"
        >
          <div className="documents-grid-mobile">
            {postAppointmentDocs.length > 0 ? (
              postAppointmentDocs.map((doc) => renderDocumentCard(doc))
            ) : (
              renderEmptyState('post-appointment')
            )}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DocumentList;
