import React from "react";
import { REGIONS } from "../data/bonesData";

const VIEW_PRESETS = {
  front: { name: "正面", position: [0, 2, 12], target: [0, 1, 0] },
  back: { name: "背面", position: [0, 2, -12], target: [0, 1, 0] },
  left: { name: "左侧", position: [-12, 2, 0], target: [0, 1, 0] },
  right: { name: "右侧", position: [12, 2, 0], target: [0, 1, 0] },
  top: { name: "俯视", position: [0, 12, 0.1], target: [0, 0, 0] },
};

export default function ControlPanel({
  autoRotate,
  onToggleAutoRotate,
  onSetView,
  showLabels,
  onToggleLabels,
  explodeFactor,
  onExplodeChange,
  showAll,
  hideAll,
  onStartQuiz,
  quizActive,
}) {
  return (
    <div className="control-panel">
      <div className="control-section">
        <h4 className="control-section-title">视角预设</h4>
        <div className="view-presets">
          {Object.entries(VIEW_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className="view-preset-btn"
              onClick={() => onSetView(preset.position, preset.target)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <h4 className="control-section-title">视图控制</h4>
        <div className="toggle-controls">
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={onToggleAutoRotate}
            />
            <span className="toggle-text">自动旋转</span>
          </label>

          <label className="toggle-control">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={onToggleLabels}
            />
            <span className="toggle-text">显示标注</span>
          </label>
        </div>
      </div>

      <div className="control-section">
        <h4 className="control-section-title">分解视图</h4>
        <div className="explode-control">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodeFactor}
            onChange={(e) => onExplodeChange(parseFloat(e.target.value))}
            className="explode-slider"
          />
          <div className="explode-labels">
            <span>复原</span>
            <span className="explode-value">
              {Math.round(explodeFactor * 100)}%
            </span>
            <span>分解</span>
          </div>
        </div>
      </div>

      <div className="control-section">
        <h4 className="control-section-title">显示控制</h4>
        <div className="display-controls">
          <button className="display-btn" onClick={showAll}>
            显示全部
          </button>
          <button className="display-btn" onClick={hideAll}>
            隐藏全部
          </button>
        </div>
      </div>

      <div className="control-section">
        <h4 className="control-section-title">学习模式</h4>
        <button
          className={`quiz-btn ${quizActive ? "active" : ""}`}
          onClick={onStartQuiz}
        >
          {quizActive ? "退出测验" : "🎯 考考你"}
        </button>
      </div>

      <div className="control-section">
        <h4 className="control-section-title">颜色图例</h4>
        <div className="color-legend">
          {Object.values(REGIONS).map((region) => (
            <div key={region.id} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: region.color }}
              />
              <span className="legend-name">{region.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
