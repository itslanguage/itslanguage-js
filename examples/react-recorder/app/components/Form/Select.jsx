import React from 'react';
import PropTypes from 'prop-types';
import './index.css';

function Select({ children, ...otherProps }) {
  return (
    <select className="Input" {...otherProps}>
      {children}
    </select>
  );
}

Select.propTypes = {
  children: PropTypes.node,
};

Select.defaultProps = {
  children: null,
};

export default Select;
