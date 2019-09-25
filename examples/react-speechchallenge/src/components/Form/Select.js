import React from 'react';
import PropTypes from 'prop-types';
import './index.css';

function Select({ children, ...otherProps }) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
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
