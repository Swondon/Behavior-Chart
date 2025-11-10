import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinChartModal.css';

interface JoinChartModalProps {
  onClose: () => void;
}

function JoinChartModal({ onClose }: JoinChartModalProps) {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/chart/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Join a Chart</h2>
        <form onSubmit={handleJoinSubmit} className="join-form">
          <input
            type="text"
            placeholder="Enter 6-Digit Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            autoFocus
          />
          <button type="submit">Join</button>
        </form>
      </div>
    </div>
  );
}

export default JoinChartModal;