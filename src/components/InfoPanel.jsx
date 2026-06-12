import React from 'react';
import { REGIONS } from '../data/bonesData';

export default function InfoPanel({ bone, onClose }) {
  if (!bone) return null;
  
  const region = REGIONS[bone.region.toUpperCase()];
  
  return (
    <div className="info-panel">
      <div className="info-panel-header" style={{ borderLeftColor: region?.color }}>
        <div>
          <h2 className="bone-title">{bone.name}</h2>
          <p className="bone-title-en">{bone.nameEn}</p>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="info-content">
        <div className="info-section">
          <div className="info-label">所属区域</div>
          <div className="info-value">
            <span 
              className="region-badge"
              style={{ backgroundColor: region?.color }}
            >
              {region?.name}
            </span>
            <span className="region-badge-en">{region?.nameEn}</span>
          </div>
        </div>
        
        <div className="info-section">
          <div className="info-label">数量</div>
          <div className="info-value quantity">
            <span className="quantity-number">{bone.quantity}</span>
            <span className="quantity-unit">块</span>
          </div>
        </div>
        
        <div className="info-section">
          <div className="info-label">生理功能</div>
          <div className="info-value function">
            {bone.function}
          </div>
        </div>
        
        <div className="info-section">
          <div className="info-label">连接关节</div>
          <div className="info-value joints">
            {bone.joints}
          </div>
        </div>
      </div>
      
      <div className="info-panel-footer">
        <div className="info-tip">
          💡 点击3D模型中的其他骨骼查看更多信息
        </div>
      </div>
    </div>
  );
}
