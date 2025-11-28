import React, { useState } from 'react';
import { Tabs, Button, Empty, Tag, Input, message } from 'antd';
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  CommentOutlined
} from '@ant-design/icons';
import axios from 'axios';
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
  const [expandedComments, setExpandedComments] = useState({});

  // Truncate text helper
  const truncateText = (text, maxLength = 10) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Toggle comment expansion
  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Filter documents by category
  const preAppointmentDocs = documents.filter(doc => doc.category === 'pre-appointment');
  const postAppointmentDocs = documents.filter(doc => doc.category === 'post-appointment');

  // Download document
  const handleDownload = async (doc) => {
    try {
      const res = await axios.get(
        `/api/v1/appointment/${appointmentId}/document/${doc._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename);
      window.document.body.appendChild(link);
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
      return <FilePdfOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />;
    }
    return <FileImageOutlined style={{ fontSize: '20px', color: '#1890ff' }} />;
  };

  // Get uploader role badge
  const getUploaderBadge = (uploaderRole) => {
    if (uploaderRole === 'doctor') {
      return <Tag color="blue">Dr.</Tag>;
    }
    return <Tag color="green">Pt.</Tag>;
  };

  // Render document card
  const renderDocumentCard = (document) => {
    const uploaderName = `${document.uploadedBy?.firstName || ''} ${document.uploadedBy?.lastName || ''}`.trim();
    const fileName = document.filename || 'Unknown';

    return (
      <div key={document._id} className="document-card-mobile compact-view">
        {/* One-liner: Icon, Filename, Patient Name, Download Button */}
        <div className="document-one-liner">
          <div className="document-icon-compact">
            {getFileIcon(document.fileType)}
          </div>
          <div className="document-info-compact">
            <span className="filename-compact" title={fileName}>
              {truncateText(fileName, 15)}
            </span>
            <span className="separator">•</span>
            <span className="uploader-name-compact" title={uploaderName}>
              {truncateText(uploaderName, 12)}
            </span>
          </div>
          <div className="uploader-badge-compact">
            {getUploaderBadge(document.uploaderRole)}
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(document)}
            className="document-download-btn-compact"
            size="small"
          />
        </div>

        {/* Comments Section - Only show if comments exist */}
        {document.comments && document.comments.length > 0 && (
          <div className="document-comments-compact">
            {document.comments.map((comment) => {
              const isExpanded = expandedComments[comment._id];
              const commentText = comment.text || '';
              const shouldTruncate = commentText.length > 50;
              const displayText = isExpanded || !shouldTruncate
                ? commentText
                : commentText.substring(0, 50);

              return (
                <div key={comment._id} className="comment-item-compact">
                  <CommentOutlined className="comment-icon-compact" />
                  <div className="comment-content-compact">
                    <span className="comment-text-compact">{displayText}</span>
                    {shouldTruncate && (
                      <span
                        className="comment-show-more"
                        onClick={() => toggleCommentExpansion(comment._id)}
                      >
                        {isExpanded ? ' Show less' : '... Show more'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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
  };

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
