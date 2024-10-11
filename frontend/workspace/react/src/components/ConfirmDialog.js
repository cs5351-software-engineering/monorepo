import React, { useState, useEffect } from 'react';
import '../styles/ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(10);
      return;
    }

    if (timeLeft === 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, onClose]);

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h2>Confirm Action</h2>
        <p>{message}</p>
        <div className="confirm-dialog-buttons">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="confirm-button" onClick={onConfirm}>
            Confirm ({timeLeft})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;