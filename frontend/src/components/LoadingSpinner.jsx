import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Analyzing...' }) => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}>
        <div className={styles.leaf}></div>
        <div className={styles.leaf}></div>
        <div className={styles.leaf}></div>
        <div className={styles.leaf}></div>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
