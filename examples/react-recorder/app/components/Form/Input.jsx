import React from 'react';
import './index.css';

function Input({ ...otherProps }) {
  return <input className="Input" {...otherProps} />;
}

export default Input;
