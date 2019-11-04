import React from 'react';
import PropTypes from 'prop-types';

class Modal extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onCancel: PropTypes.func.isRequired,
  }
  render() {
    return (
      <React.Fragment>
        <div className="shadow" onClick={ this.props.onCancel }></div>
        <div className="dialog-box">
          { this.props.children }
        </div>
      </React.Fragment>
    );
  }
}

export default Modal;
