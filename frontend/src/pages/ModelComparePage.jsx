import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiAward, FiAlertCircle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './ModelComparePage.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const API_URL = 'http://localhost:5000';

const ModelComparePage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const resData = response.data;
      let data = [];
      if (Array.isArray(resData)) {
        data = resData;
      } else if (Array.isArray(resData.models)) {
        data = resData.models;
      } else if (Array.isArray(resData.data)) {
        data = resData.data;
      } else if (resData.data && typeof resData.data === 'object') {
        data = Object.entries(resData.data).map(([name, m]) => ({
          name,
          model_name: name,
          accuracy: m.accuracy,
          precision: m.precision_macro || m.precision || 0,
          recall: m.recall_macro || m.recall || 0,
          f1_score: m.f1_macro || m.f1_score || m.f1 || 0,
          training_time: m.training_time_sec ? `${m.training_time_sec}s` : (m.training_time || 'N/A'),
          model_size: m.model_file_size_mb ? `${m.model_file_size_mb} MB` : (m.model_size || 'N/A'),
          ...m,
        }));
      }
      setModels(data);
    } catch (err) {
      setError('Failed to load model data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getBestModel = () => {
    if (models.length === 0) return null;
    return models.reduce((best, model) =>
      (model.accuracy || 0) > (best.accuracy || 0) ? model : best
    );
  };

  const formatPercent = (val) => {
    if (typeof val !== 'number') return 'N/A';
    return val > 1 ? `${val.toFixed(2)}%` : `${(val * 100).toFixed(2)}%`;
  };

  const getVal = (val) => {
    if (typeof val !== 'number') return 0;
    return val > 1 ? val : val * 100;
  };

  const colors = [
    { bg: 'rgba(45, 106, 79, 0.75)', border: '#2d6a4f' },
    { bg: 'rgba(64, 145, 108, 0.7)', border: '#40916c' },
    { bg: 'rgba(82, 183, 136, 0.65)', border: '#52b788' },
    { bg: 'rgba(149, 213, 178, 0.6)', border: '#95d5b2' },
    { bg: 'rgba(27, 67, 50, 0.7)', border: '#1b4332' },
  ];

  const radarColors = [
    'rgba(45, 106, 79, 0.25)',
    'rgba(64, 145, 108, 0.2)',
    'rgba(82, 183, 136, 0.2)',
    'rgba(149, 213, 178, 0.2)',
    'rgba(27, 67, 50, 0.2)',
  ];

  const barChartData = {
    labels: models.map((m) => m.name || m.model_name || 'Unknown'),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: models.map((m) => getVal(m.accuracy)),
        backgroundColor: models.map((_, i) => colors[i % colors.length].bg),
        borderColor: models.map((_, i) => colors[i % colors.length].border),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1b4332',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `Accuracy: ${ctx.raw.toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: Math.max(0, Math.min(...models.map((m) => getVal(m.accuracy))) - 5),
        max: 100,
        grid: { color: 'rgba(45, 106, 79, 0.08)' },
        ticks: { callback: (v) => `${v}%` },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const radarChartData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
    datasets: models.map((model, i) => ({
      label: model.name || model.model_name || 'Unknown',
      data: [
        getVal(model.accuracy),
        getVal(model.precision || model.precision_macro),
        getVal(model.recall || model.recall_macro),
        getVal(model.f1_score || model.f1_macro),
      ],
      backgroundColor: radarColors[i % radarColors.length],
      borderColor: colors[i % colors.length].border,
      borderWidth: 2,
      pointBackgroundColor: colors[i % colors.length].border,
      pointRadius: 4,
    })),
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#1b4332',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}%`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: false,
        min: Math.max(0, Math.min(
          ...models.flatMap((m) => [
            getVal(m.accuracy),
            getVal(m.precision),
            getVal(m.recall),
            getVal(m.f1_score),
          ])
        ) - 5),
        max: 100,
        grid: { color: 'rgba(45, 106, 79, 0.1)' },
        angleLines: { color: 'rgba(45, 106, 79, 0.1)' },
        pointLabels: { font: { size: 13, weight: '600' } },
        ticks: { stepSize: 5, font: { size: 10 }, backdropColor: 'transparent' },
      },
    },
  };

  const bestModel = getBestModel();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>📊 Model Comparison</h1>
          </div>
          <LoadingSpinner message="Loading model data..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📊 Model Comparison</h1>
          <p className={styles.subtitle}>
            Compare the performance of different deep learning models for crop disease detection
          </p>
        </div>

        {error && (
          <div className={styles.errorCard}>
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!error && models.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No Model Data Available</h3>
            <p>Model comparison data will appear once models are trained and evaluated.</p>
          </div>
        )}

        {models.length > 0 && (
          <>
            {/* Best Model Banner */}
            {bestModel && (
              <div className={styles.bestBanner}>
                <FiAward size={24} />
                <div>
                  <span className={styles.bestLabel}>Best Performing Model</span>
                  <span className={styles.bestName}>
                    {bestModel.name || bestModel.model_name} — {formatPercent(bestModel.accuracy)} accuracy
                  </span>
                </div>
              </div>
            )}

            {/* Comparison Table */}
            <div className={styles.tableCard}>
              <h3 className={styles.sectionTitle}>Performance Metrics</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Accuracy</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1-Score</th>
                      <th>Training Time</th>
                      <th>Model Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model, i) => {
                      const isBest = bestModel && (model.name || model.model_name) === (bestModel.name || bestModel.model_name);
                      return (
                        <tr key={i} className={isBest ? styles.bestRow : ''}>
                          <td className={styles.modelName}>
                            {isBest && <FiAward size={14} className={styles.crownIcon} />}
                            {model.name || model.model_name || 'Unknown'}
                          </td>
                          <td>{formatPercent(model.accuracy)}</td>
                          <td>{formatPercent(model.precision || model.precision_macro)}</td>
                          <td>{formatPercent(model.recall || model.recall_macro)}</td>
                          <td>{formatPercent(model.f1_score || model.f1_macro)}</td>
                          <td>{model.training_time || (model.training_time_sec ? `${model.training_time_sec}s` : 'N/A')}</td>
                          <td>{model.model_size || (model.model_file_size_mb ? `${model.model_file_size_mb} MB` : 'N/A')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <h3 className={styles.sectionTitle}>Accuracy Comparison</h3>
                <div className={styles.chartWrap}>
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>

              <div className={styles.chartCard}>
                <h3 className={styles.sectionTitle}>Multi-Metric Comparison</h3>
                <div className={styles.chartWrap}>
                  <Radar data={radarChartData} options={radarChartOptions} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModelComparePage;
