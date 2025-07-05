import React, { useEffect } from 'react';

const AlertModal = ({ 
  show, 
  onHide, 
  title = "Alert", 
  message = "",
  variant = "info",
  size = ""
}) => {
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

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅';
      case 'danger':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getHeaderClass = () => {
    switch (variant) {
      case 'success':
        return 'text-success';
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'info':
      default:
        return 'text-info';
    }
  };

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
            <h5 className={`modal-title ${getHeaderClass()}`}>
              {getIcon()} {title}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
              {message}
            </p>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className={`btn btn-${variant === 'danger' ? 'danger' : 'primary'}`} 
              onClick={onHide}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
