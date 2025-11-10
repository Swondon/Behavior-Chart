import React from 'react';
import { type ClipRequest, type BehaviorChart } from '../pages/charts';
import { useAuth } from '../context/AuthContext';
import './PendingRequests.css';

interface PendingRequestsProps {
  requests: ClipRequest[];
  chart: BehaviorChart;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

function PendingRequests({ requests, chart, onApprove, onReject }: PendingRequestsProps) {
  const { user } = useAuth();
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="pending-requests-container">
      <h3>Pending Clip Requests</h3>
      {requests.map(req => (
        <div key={req.id} className="pending-request-item">
          <div className="request-info">
            <p>
              <strong>{req.requesterName}</strong> wants to clip
              <strong> {req.targetPersonName} </strong>
              <span className={req.direction === 'up' ? 'clip-up-text' : 'clip-down-text'}>
                {req.direction}
              </span>.
            </p>
            <p className="request-reason">
              <em>Reason:</em> "{req.reason}"
            </p>
          </div>
          {/* Show buttons if the user is the chart owner OR if they are not the one who made the request */}
          {user && (user.uid === chart.ownerId || user.uid !== req.requesterId) && (
            <div className="request-actions">
              <button className="approve-btn" onClick={() => onApprove(req.id)}>
                Approve
              </button>
              <button className="reject-btn" onClick={() => onReject(req.id)}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PendingRequests;