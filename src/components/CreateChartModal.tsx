import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, type User as AuthUser } from '../context/AuthContext';
import { type BehaviorChart, type Person } from '../pages/charts';
import './CreateChartModal.css';

interface CreateChartModalProps {
  onClose: () => void;
}

function CreateChartModal({ onClose }: CreateChartModalProps) {
  const [chartName, setChartName] = useState('');
  const [approvalMode, setApprovalMode] = useState<'none' | 'any_user' | 'owner'>('none');
  const { user, setUser } = useAuth(); // Also get setUser to update local context
  const navigate = useNavigate();

  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartName.trim() || !user) return;

    const creatorAsPerson: Person = {
      id: user.uid,
      name: user.displayName || 'New User',
      username: user.email ? `@${user.email.split('@')[0]}` : '@user',
      level: 3, // Start at "Ready to Learn"
    };

    const newChart: BehaviorChart = {
      name: chartName,
      ownerId: user.uid,
      shareCode: generateShareCode(),
      people: [creatorAsPerson],
      memberIds: [user.uid],
      approvalMode: approvalMode,
    };

    try {
      await addDoc(collection(db, "charts"), newChart);

      // Update the user's joinedCharts array in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        joinedCharts: arrayUnion(newChart.shareCode)
      });
      // Also update the local user context
      setUser((prevUser) => prevUser ? { ...prevUser, joinedCharts: [...(prevUser.joinedCharts || []), newChart.shareCode] } : null);

      navigate(`/chart/${newChart.shareCode}`);
      onClose(); // Close modal after creation
    } catch (error) {
      console.error("Error creating new chart:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Create a New Chart</h2>
        <form onSubmit={handleCreateChart} className="create-form">
          <input
            type="text"
            placeholder="Enter Chart Name"
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            autoFocus
          />
          <div className="approval-mode-selector">
            <label>Approval for clipping:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="none"
                  checked={approvalMode === 'none'}
                  onChange={(e) => setApprovalMode(e.target.value as any)}
                /> <span>No one (immediate)</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="any_user"
                  checked={approvalMode === 'any_user'}
                  onChange={(e) => setApprovalMode(e.target.value as any)}
                /> <span>Anyone who has access</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="owner"
                  checked={approvalMode === 'owner'}
                  onChange={(e) => setApprovalMode(e.target.value as any)}
                /> <span>The chart owner</span>
              </label>
            </div>
          </div>
          <button type="submit" disabled={!chartName.trim()}>Create Chart</button>
        </form>
      </div>
    </div>
  );
}

export default CreateChartModal;