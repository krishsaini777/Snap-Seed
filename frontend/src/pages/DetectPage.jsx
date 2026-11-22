import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiUploadCloud, FiImage, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './DetectPage.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:5000';

const DetectPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to analyze image. Please ensure the backend server is running.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const formatConfidence = (confidence) => {
    if (typeof confidence === 'number') {
      return confidence > 1 ? confidence.toFixed(1) : (confidence * 100).toFixed(1);
    }
    return '0';
  };

  const getConfidenceValue = (confidence) => {
    if (typeof confidence === 'number') {
      return confidence > 1 ? confidence : confidence * 100;
    }
    return 0;
  };

  const getChartData = () => {
    const list = result?.top_predictions || result?.allPredictions || result?.all_predictions;
    if (!list || list.length === 0) return null;

    const labels = list.map((p) =>
      (p.class_name || p.class || 'Unknown').replace(/_/g, ' ')
    );
    const data = list.map((p) => getConfidenceValue(p.confidence));

    return {
      labels,
      datasets: [
        {
          label: 'Confidence (%)',
          data,
          backgroundColor: [
            'rgba(45, 106, 79, 0.85)',
            'rgba(64, 145, 108, 0.75)',
            'rgba(82, 183, 136, 0.65)',
            'rgba(149, 213, 178, 0.6)',
            'rgba(183, 228, 199, 0.55)',
          ],
          borderColor: [
            '#2d6a4f',
            '#40916c',
            '#52b788',
            '#95d5b2',
            '#b7e4c7',
          ],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1b4332',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx) => `${ctx.raw.toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        max: 100,
        grid: { color: 'rgba(45, 106, 79, 0.08)' },
        ticks: { callback: (v) => `${v}%`, font: { size: 12 } },
      },
      y: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return label.length > 25 ? label.substring(0, 22) + '...' : label;
          },
        },
      },
    },
  };

  const confidenceValue = result ? getConfidenceValue(result.confidence) : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (confidenceValue / 100) * circumference;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔍 Disease Detection</h1>
          <p className={styles.subtitle}>
            Upload a crop leaf image to identify potential diseases using AI
          </p>
        </div>

        {!result && !loading && (
          <div className={styles.uploadSection}>
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${
                preview ? styles.dropzoneWithPreview : ''
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className={styles.previewContainer}>
                  <img src={preview} alt="Preview" className={styles.previewImage} />
                  <div className={styles.fileInfo}>
                    <FiImage size={18} />
                    <span>{file.name}</span>
                    <span className={styles.fileSize}>
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <div className={styles.dropIcon}>
                    <FiUploadCloud size={48} />
                  </div>
                  <h3>Drop your leaf image here</h3>
                  <p>or click to browse files</p>
                  <span className={styles.dropHint}>
                    Supports JPG, PNG, WebP — Max 10MB
                  </span>
                </div>
              )}
            </div>

            {preview && (
              <div className={styles.actions}>
                <button onClick={handleAnalyze} className={styles.analyzeBtn}>
                  🔬 Analyze Image
                </button>
                <button onClick={handleReset} className={styles.resetBtn}>
                  <FiRefreshCw size={16} /> Clear
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className={styles.loadingSection}>
            <LoadingSpinner message="Analyzing leaf image with AI..." />
          </div>
        )}

        {error && (
          <div className={styles.errorCard}>
            <FiAlertCircle size={24} />
            <div>
              <h3>Analysis Failed</h3>
              <p>{error}</p>
            </div>
            <button onClick={handleReset} className={styles.resetBtn}>
              <FiRefreshCw size={16} /> Try Again
            </button>
          </div>
        )}

        {result && (
          <div className={styles.resultSection}>
            <div className={styles.resultGrid}>
              {/* Image & Prediction */}
              <div className={styles.resultCard}>
                <div className={styles.resultImageWrap}>
                  {preview && (
                    <img src={preview} alt="Analyzed leaf" className={styles.resultImage} />
                  )}
                </div>
                <div className={styles.predictionInfo}>
                  <span className={styles.predLabel}>Predicted Disease</span>
                  <h2 className={styles.predName}>
                    {result.prediction
                      ? result.prediction.replace(/_/g, ' ')
                      : 'Unknown'}
                  </h2>
                </div>
              </div>

              {/* Confidence */}
              <div className={styles.resultCard}>
                <span className={styles.predLabel}>Confidence Score</span>
                <div className={styles.confidenceRing}>
                  <svg viewBox="0 0 120 120" className={styles.circleSvg}>
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#d8f3dc"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke={
                        confidenceValue >= 80
                          ? '#2d6a4f'
                          : confidenceValue >= 50
                          ? '#40916c'
                          : '#e76f51'
                      }
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 60 60)"
                      className={styles.circleProgress}
                    />
                    <text
                      x="60"
                      y="56"
                      textAnchor="middle"
                      className={styles.circleText}
                      fill="var(--text-primary)"
                      fontSize="22"
                      fontWeight="700"
                    >
                      {formatConfidence(result.confidence)}%
                    </text>
                    <text
                      x="60"
                      y="76"
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="11"
                    >
                      confidence
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Top Predictions Chart */}
            {((result.top_predictions && result.top_predictions.length > 0) ||
              (result.allPredictions && result.allPredictions.length > 0) ||
              (result.all_predictions && result.all_predictions.length > 0)) && (
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Top Predictions</h3>
                <div className={styles.chartWrap}>
                  <Bar data={getChartData()} options={chartOptions} />
                </div>
              </div>
            )}

            <div className={styles.resultActions}>
              <button onClick={handleReset} className={styles.analyzeBtn}>
                <FiRefreshCw size={18} /> Try Another Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectPage;
