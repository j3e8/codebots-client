import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

class Drawer extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onCancel: PropTypes.func.isRequired,
    display: PropTypes.bool.isRequired,
  }
  render() {
    return (
      <React.Fragment>
        <CSSTransition in={ this.props.display } timeout={500} classNames="fade" unmountOnExit>
          <div className="shadow" onClick={ this.props.onCancel }></div>
        </CSSTransition>
        <CSSTransition in={ this.props.display } timeout={500} classNames="slide" unmountOnExit>
          <div className="drawer">
            { this.props.children }
          </div>
        </CSSTransition>
      </React.Fragment>
    );
  }
}

export default Drawer;
