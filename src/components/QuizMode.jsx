import React, { useState, useEffect, useCallback } from 'react';
import { BONES } from '../data/bonesData';

const TOTAL_QUESTIONS = 10;

export default function QuizMode({ 
  active, 
  onBoneSelect, 
  quizBones, 
  setQuizBones,
  onClose,
  onQuestionGenerated
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questionBone, setQuestionBone] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  
  const generateQuestion = useCallback(() => {
    const availableBones = BONES.filter(b => !questionHistory.includes(b.id));
    if (availableBones.length === 0) {
      setShowResult(true);
      return null;
    }
    const randomBone = availableBones[Math.floor(Math.random() * availableBones.length)];
    setQuestionHistory(prev => [...prev, randomBone.id]);
    return randomBone;
  }, [questionHistory]);
  
  const processAnswer = useCallback((boneId) => {
    if (!active || answered || !questionBone) return false;
    
    setAnswered(true);
    
    if (boneId === questionBone.id) {
      setScore(prev => prev + 1);
      setLastAnswerCorrect(true);
      setQuizBones({ [boneId]: 'correct' });
    } else {
      setLastAnswerCorrect(false);
      setQuizBones({ 
        [boneId]: 'wrong',
        [questionBone.id]: 'correct'
      });
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 >= TOTAL_QUESTIONS) {
        setShowResult(true);
        setQuizBones({});
        if (onQuestionGenerated) onQuestionGenerated(null);
      } else {
        setCurrentQuestion(prev => prev + 1);
        setAnswered(false);
        setLastAnswerCorrect(null);
        const nextBone = generateQuestion();
        if (nextBone) {
          setQuestionBone(nextBone);
          setQuizBones({ [nextBone.id]: 'highlight' });
          if (onQuestionGenerated) onQuestionGenerated(nextBone);
        }
      }
    }, 1500);
    
    return true;
  }, [active, answered, questionBone, currentQuestion, generateQuestion, setQuizBones, onQuestionGenerated]);
  
  useEffect(() => {
    if (onBoneSelect) {
      onBoneSelect.current = processAnswer;
    }
  }, [processAnswer, onBoneSelect]);
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setShowResult(false);
    setQuestionHistory([]);
    setLastAnswerCorrect(null);
    setQuizBones({});
    const bone = BONES[Math.floor(Math.random() * BONES.length)];
    setQuestionBone(bone);
    setQuestionHistory([bone.id]);
    setQuizBones({ [bone.id]: 'highlight' });
    if (onQuestionGenerated) onQuestionGenerated(bone);
  };
  
  const handleClose = () => {
    setQuizBones({});
    if (onQuestionGenerated) onQuestionGenerated(null);
    onClose();
  };
  
  useEffect(() => {
    if (active) {
      const bone = BONES[Math.floor(Math.random() * BONES.length)];
      setQuestionBone(bone);
      setQuestionHistory([bone.id]);
      setQuizBones({ [bone.id]: 'highlight' });
      if (onQuestionGenerated) onQuestionGenerated(bone);
    }
    return () => {
      setQuizBones({});
      if (onQuestionGenerated) onQuestionGenerated(null);
    };
  }, [active, setQuizBones, onQuestionGenerated]);
  
  if (!active) return null;
  
  const getScoreMessage = () => {
    const percentage = (score / TOTAL_QUESTIONS) * 100;
    if (percentage >= 90) return { text: '🏆 优秀！你是骨骼专家！', color: '#4CAF50' };
    if (percentage >= 70) return { text: '👍 很棒！继续加油！', color: '#2196F3' };
    if (percentage >= 50) return { text: '📚 还不错，多练习会更好！', color: '#FF9800' };
    return { text: '💪 继续努力，多复习一下！', color: '#F44336' };
  };
  
  return (
    <div className="quiz-overlay">
      <div className="quiz-panel">
        <div className="quiz-header">
          <h2>🎯 骨骼知识测验</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        {!showResult ? (
          <>
            <div className="quiz-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentQuestion + 1) / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                第 {currentQuestion + 1} / {TOTAL_QUESTIONS} 题
              </div>
              <div className="score-display">
                得分: {score}
              </div>
            </div>
            
            <div className="quiz-question">
              <p className="question-prompt">请在3D模型上点击</p>
              <h3 className="question-bone">{questionBone?.name}</h3>
              <p className="question-bone-en">{questionBone?.nameEn}</p>
            </div>
            
            {lastAnswerCorrect !== null && (
              <div className={`quiz-feedback ${lastAnswerCorrect ? 'correct' : 'wrong'}`}>
                {lastAnswerCorrect ? '✅ 回答正确！' : '❌ 回答错误，正确位置已标出'}
              </div>
            )}
            
            <div className="quiz-instructions">
              💡 提示：可以旋转、缩放3D模型来寻找目标骨骼
            </div>
          </>
        ) : (
          <div className="quiz-result">
            <h3>测验完成！</h3>
            <div className="final-score">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {TOTAL_QUESTIONS}</span>
            </div>
            <p className="score-message" style={{ color: getScoreMessage().color }}>
              {getScoreMessage().text}
            </p>
            <div className="quiz-actions">
              <button className="quiz-btn primary" onClick={resetQuiz}>
                再来一次
              </button>
              <button className="quiz-btn secondary" onClick={handleClose}>
                返回学习
              </button>
            </div>
          </div>
        )}
      </div>
      
      {!showResult && (
        <div 
          className="quiz-click-catcher"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      )}
    </div>
  );
}
