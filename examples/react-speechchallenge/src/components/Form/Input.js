import React from 'react';
import './index.css';

function Input({ ...otherProps }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <input className="Input" {...otherProps} />;
}

export default Input;
