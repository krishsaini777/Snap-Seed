import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiClock, FiImage, FiAlertCircle, FiInbox } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './HistoryPage.module.css';

const API_URL = 'http://localhost:5000';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const resData = response.data;
      const data = Array.isArray(resData)
        ? resData
        : (resData.predictions || resData.history || resData.data || []);
      setHistory(data);
    } catch (err) {
      setError('Failed to load prediction history. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatConfidence = (confidence) => {
    if (typeof confidence === 'number') {
      return confidence > 1 ? `${confidence.toFixed(1)}%` : `${(confidence * 100).toFixed(1)}%`;
    }
    return 'N/A';
  };

  const getConfidenceColor = (confidence) => {
    const val = typeof confidence === 'number' ? (confidence > 1 ? confidence : confidence * 100) : 0;
    if (val >= 80) return '#2d6a4f';
    if (val >= 50) return '#40916c';
    return '#e76f51';
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>📋 Prediction History</h1>
          </div>
          <LoadingSpinner message="Loading history..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📋 Prediction History</h1>
          <p className={styles.subtitle}>View all your past disease detection results</p>
        </div>

        {error && (
          <div className={styles.errorCard}>
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!error && history.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiInbox size={48} />
            </div>
            <h3>No Predictions Yet</h3>
            <p>Upload an image on the Detect page to get started. Your prediction results will appear here.</p>
          </div>
        )}

        {history.length > 0 && (
          <>
            <div className={styles.countBadge}>
              {history.length} prediction{history.length !== 1 ? 's' : ''} found
            </div>
            <div className={styles.historyGrid}>
              {history.map((item, index) => (
                <div key={index} className={styles.historyCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIndex}>#{history.length - index}</span>
                    <span className={styles.cardDate}>
                      <FiClock size={14} />
                      {formatDate(item.timestamp || item.date || item.created_at)}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardLeft}>
                      <div className={styles.imageName}>
                        <FiImage size={16} />
                        <span>{item.image_name || item.filename || 'Unknown file'}</span>
                      </div>
                      <h3 className={styles.prediction}>
                        {(item.prediction || item.disease || 'Unknown')
                          .replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <div className={styles.cardRight}>
                      <span
                        className={styles.confidenceBadge}
                        style={{
                          backgroundColor: `${getConfidenceColor(item.confidence)}15`,
                          color: getConfidenceColor(item.confidence),
                          borderColor: `${getConfidenceColor(item.confidence)}30`,
                        }}
                      >
                        {formatConfidence(item.confidence)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
