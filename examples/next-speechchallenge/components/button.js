import React from 'react';
import PropTypes from 'prop-types';

import styles from './button.module.css';

function Button(props) {
  const { children, ...otherProps } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <button type="button" className={styles.Button} {...otherProps}>
      {children && children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Button;
