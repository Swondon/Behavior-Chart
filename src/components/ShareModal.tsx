import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './ShareModal.css';

interface ShareModalProps {
  shareCode: string;
  onClose: () => void;
}

function ShareModal({ shareCode, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/chart/${shareCode}`;
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2000);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Share this Chart</h2>
        
        <div className="share-option qr-code-container">
          <QRCodeCanvas value={shareUrl} size={180} bgColor={"#ffffff"} fgColor={"#000000"} />
          <p>Scan the QR Code</p>
        </div>

        <div className="share-option">
          <h3>Share with a code</h3>
          <div className="share-code-box">{shareCode}</div>
        </div>

        <div className="share-option">
          <h3>Share with a link</h3>
          <div className="share-link-box">
            <input type="text" value={shareUrl} readOnly />
            <button onClick={handleCopyLink}>{copyButtonText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;