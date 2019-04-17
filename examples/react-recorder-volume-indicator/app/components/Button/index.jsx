import React from 'react';
import PropTypes from 'prop-types';
import './index.css';

const Button = ({ children, onClick }) => (
  <button type="button" onClick={onClick} className="Button">
    {children}
  </button>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Button;
