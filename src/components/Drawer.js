import React from 'react';
import PropTypes from 'prop-types';

class Drawer extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onCancel: PropTypes.func.isRequired,
  }
  render() {
    return (
      <React.Fragment>
        <div className="shadow" onClick={ this.props.onCancel }></div>
        <div className="drawer">
          { this.props.children }
        </div>
      </React.Fragment>
    );
  }
}

export default Drawer;
