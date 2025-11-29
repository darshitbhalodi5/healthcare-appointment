import React from 'react';
import { Card } from 'antd';
import { RobotOutlined, StarFilled } from '@ant-design/icons';
import './AISummaryPlaceholder.css';

const AISummaryPlaceholder = ({ compact = false }) => {
  return (
    <Card className={`ai-summary-placeholder ${compact ? 'compact' : ''}`}>
      <div className="ai-summary-header">
        <div className="ai-icon-container">
          <RobotOutlined className="ai-icon" />
          <StarFilled className="sparkle-icon" />
        </div>
        <div className="ai-summary-title">
          <h4>AI Patient Summary</h4>
          <span className="ai-badge">Coming Soon</span>
        </div>
      </div>

      <div className="ai-summary-content">
        <div className="shimmer-line long"></div>
        <div className="shimmer-line medium"></div>
        <div className="shimmer-line short"></div>
      </div>
    </Card>
  );
};

export default AISummaryPlaceholder;
