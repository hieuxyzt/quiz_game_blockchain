import React, { Component } from 'react';

class AlertModal extends Component {
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

  handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.onHide();
    }
  };

  getIcon = () => {
    const { variant } = this.props;
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

  getHeaderClass = () => {
    const { variant } = this.props;
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

  render() {
    const { show, title = "Alert", message = "", size = "" } = this.props;

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
            <h5 className={`modal-title ${this.getHeaderClass()}`}>
              {this.getIcon()} {title}
            </h5>            <button
              type="button"
              className="btn-close"
              onClick={this.props.onHide}
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
              className={`btn btn-${this.props.variant === 'danger' ? 'danger' : 'primary'}`} 
              onClick={this.props.onHide}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default AlertModal;
