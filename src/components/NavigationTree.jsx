import React, { useState } from 'react';
import { REGIONS, REGION_BONES } from '../data/bonesData';

export default function NavigationTree({ 
  selectedBone, 
  onSelectBone, 
  onSelectRegion,
  visibleRegions,
  onToggleRegion 
}) {
  const [expandedRegions, setExpandedRegions] = useState(
    Object.keys(REGIONS).reduce((acc, key) => ({ ...acc, [REGIONS[key].id]: true }), {})
  );
  
  const toggleRegion = (regionId) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionId]: !prev[regionId]
    }));
  };
  
  const handleBoneClick = (boneId) => {
    onSelectBone(boneId);
  };
  
  const handleRegionClick = (regionId) => {
    onSelectRegion(regionId);
  };
  
  const handleRegionVisibility = (e, regionId) => {
    e.stopPropagation();
    onToggleRegion(regionId);
  };
  
  return (
    <div className="navigation-tree">
      <h3 className="nav-title">骨骼导航</h3>
      
      {Object.values(REGIONS).map(region => {
        const bones = REGION_BONES[region.id] || [];
        const isExpanded = expandedRegions[region.id];
        const isVisible = visibleRegions.includes(region.id);
        
        return (
          <div key={region.id} className="region-group">
            <div 
              className={`region-header ${selectedBone && bones.find(b => b.id === selectedBone) ? 'has-selection' : ''}`}
              onClick={() => handleRegionClick(region.id)}
            >
              <button 
                className="expand-btn"
                onClick={(e) => { e.stopPropagation(); toggleRegion(region.id); }}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
              
              <div 
                className="region-color" 
                style={{ backgroundColor: region.color }}
              />
              
              <span className="region-name">{region.name}</span>
              
              <label className="visibility-toggle">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => handleRegionVisibility(e, region.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            
            {isExpanded && (
              <div className="bones-list">
                {bones.map(bone => (
                  <div
                    key={bone.id}
                    className={`bone-item ${selectedBone === bone.id ? 'selected' : ''}`}
                    onClick={() => handleBoneClick(bone.id)}
                  >
                    <div 
                      className="bone-indicator"
                      style={{ 
                        backgroundColor: selectedBone === bone.id ? region.color : 'transparent',
                        borderColor: region.color
                      }}
                    />
                    <span className="bone-name">{bone.name}</span>
                    <span className="bone-name-en">{bone.nameEn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
