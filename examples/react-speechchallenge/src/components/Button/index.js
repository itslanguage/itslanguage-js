import React from 'react';
import PropTypes from 'prop-types';
import './index.css';

function Button(props) {
  const { children, ...otherProps } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <button type="button" className="Button" {...otherProps}>
      {children && children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
};

Button.defaultProps = {
  children: null,
};

export default Button;
