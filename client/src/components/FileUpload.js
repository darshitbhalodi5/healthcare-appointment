import React, { useState } from 'react';
import { Upload, message, Progress } from 'antd';
import { InboxOutlined, FilePdfOutlined, FileImageOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import './FileUpload.css';

const { Dragger } = Upload;

const FileUpload = ({
  appointmentId,
  onUploadSuccess,
  label = "Upload Documents",
  showUploadList = true,
  maxFiles = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);

  // Validate file before upload
  const beforeUpload = (file) => {
    // Check file type
    const isPDF = file.type === 'application/pdf';
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';

    if (!isPDF && !isImage) {
      message.error('You can only upload PDF, JPG, or PNG files!');
      return Upload.LIST_IGNORE;
    }

    // Check file size (10 MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return Upload.LIST_IGNORE;
    }

    // Check max files
    if (fileList.length >= maxFiles) {
      message.error(`You can only upload up to ${maxFiles} files!`);
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload, we'll handle it manually
  };

  // Handle file selection
  const handleChange = (info) => {
    let newFileList = [...info.fileList];

    // Limit to maxFiles
    newFileList = newFileList.slice(-maxFiles);

    setFileList(newFileList);
  };

  // Upload file to server
  const handleUpload = async (file) => {
    if (!appointmentId) {
      message.error('Appointment ID is required');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await axios.post(
        `/api/v1/appointment/${appointmentId}/upload-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (res.data.success) {
        message.success(`${file.name} uploaded successfully!`);

        // Remove uploaded file from list
        setFileList(prev => prev.filter(f => f.uid !== file.uid));

        // Callback to parent component
        if (onUploadSuccess) {
          onUploadSuccess(res.data.document);
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload all files in the list
  const handleUploadAll = async () => {
    if (fileList.length === 0) {
      message.warning('Please select files to upload');
      return;
    }

    for (const fileItem of fileList) {
      await handleUpload(fileItem.originFileObj);
    }
  };

  // Remove file from list
  const handleRemove = (file) => {
    setFileList(prev => prev.filter(f => f.uid !== file.uid));
  };

  // Get icon for file type
  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
    }
    return <FileImageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
  };

  return (
    <div className="file-upload-container">
      <Dragger
        multiple
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onRemove={handleRemove}
        showUploadList={false}
        disabled={uploading}
        accept=".pdf,.jpg,.jpeg,.png"
        className="mobile-dragger compact"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{label}</p>
        <p className="ant-upload-hint">
          PDF, JPG, PNG • Max 10 MB
        </p>
      </Dragger>

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <Progress percent={uploadProgress} status="active" strokeWidth={8} />
        </div>
      )}

      {/* File List */}
      {showUploadList && fileList.length > 0 && (
        <div className="file-list-container">
          <h5 className="file-list-title">Selected Files ({fileList.length}/{maxFiles})</h5>
          <div className="file-list">
            {fileList.map((file) => (
              <div key={file.uid} className="file-item">
                <div className="file-item-content">
                  <div className="file-icon">
                    {getFileIcon(file)}
                  </div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <DeleteOutlined
                  onClick={() => handleRemove(file)}
                  className="file-delete-icon"
                />
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary upload-btn-mobile"
            onClick={handleUploadAll}
            disabled={uploading || fileList.length === 0}
          >
            {uploading ? 'Uploading...' : `Upload ${fileList.length} File(s)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
