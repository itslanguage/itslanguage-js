import React from 'react';
import PropTypes from 'prop-types';

import '../styles/global.css';

function App({ Component, pageProps }) {
  /* eslint-disable react/jsx-props-no-spreading */
  return <Component {...pageProps} />;
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  /* eslint-disable react/forbid-prop-types */
  pageProps: PropTypes.object.isRequired,
};

export default App;
