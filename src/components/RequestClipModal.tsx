import React, { useState } from 'react';
import './RequestClipModal.css';

interface RequestClipModalProps {
  personName: string;
  direction: 'up' | 'down';
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

function RequestClipModal({ personName, direction, onClose, onSubmit }: RequestClipModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Request to Clip {direction}</h2>
        <p>Why are you clipping {personName} {direction}?</p>
        <form onSubmit={handleSubmit} className="create-form">
          <textarea
            placeholder="Enter a reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            autoFocus
          />
          <button type="submit" disabled={!reason.trim()}>Submit Request</button>
        </form>
      </div>
    </div>
  );
}

export default RequestClipModal;