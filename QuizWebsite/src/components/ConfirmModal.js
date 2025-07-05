import React, { Component } from 'react';

class ConfirmModal extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setupEventListeners();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show) {
      this.setupEventListeners();
    }
  }

  componentWillUnmount() {
    this.cleanupEventListeners();
  }

  setupEventListeners = () => {
    if (this.props.show) {
      document.addEventListener('keydown', this.handleKeyDownEvent);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  cleanupEventListeners = () => {
    document.removeEventListener('keydown', this.handleKeyDownEvent);
    document.body.style.overflow = 'unset';
  };

  handleKeyDownEvent = (e) => {
    if (e.key === 'Escape') {
      this.props.onHide();
    }
  };

  handleConfirm = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
    this.props.onHide();
  };

  handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.onHide();
    }
  };

  render() {
    const { 
      show, 
      title = "Confirm Action", 
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      confirmVariant = "primary",
      size = ""
    } = this.props;

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
      onClick={this.handleBackdropClick}
    >
      <div className={`modal-dialog modal-sm modal-dialog-centered`} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {confirmVariant === 'danger' ? '⚠️' : 'ℹ️'} {title}
            </h5>            <button
              type="button"
              className="btn-close"
              onClick={this.props.onHide}
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
              onClick={this.props.onHide}
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              className={`btn btn-${confirmVariant}`} 
              onClick={this.handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default ConfirmModal;
