import React from 'react';
import PropTypes from 'prop-types';

import Head from 'next/head';
import styles from './layout.module.css';

function Layout({ children }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
