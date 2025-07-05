import React, { useEffect } from 'react';

const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  size = ""
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onHide();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  useEffect(() => {
    const handleKeyDownEvent = (e) => {
      if (e.key === 'Escape') {
        onHide();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDownEvent);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent);
      document.body.style.overflow = 'unset';
    };
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1055
      }} 
      tabIndex="-1" 
      role="dialog"
      onClick={handleBackdropClick}
    >
      <div className={`modal-dialog modal-sm modal-dialog-centered`} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {confirmVariant === 'danger' ? '⚠️' : 'ℹ️'} {title}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onHide}
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              className={`btn btn-${confirmVariant}`} 
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
