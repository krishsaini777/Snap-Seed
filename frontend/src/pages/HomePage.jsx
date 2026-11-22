import React from 'react';
import { Link } from 'react-router-dom';
import { FiUpload, FiCpu, FiZap, FiArrowRight, FiCheck } from 'react-icons/fi';
import { GiWheat, GiCorn, GiGrapes, GiTomato } from 'react-icons/gi';
import styles from './HomePage.module.css';

const crops = [
  'Apple', 'Blueberry', 'Cherry', 'Corn', 'Grape',
  'Orange', 'Peach', 'Pepper', 'Potato', 'Raspberry',
  'Soybean', 'Squash', 'Strawberry', 'Tomato'
];

const cropEmojis = {
  Apple: '🍎', Blueberry: '🫐', Cherry: '🍒', Corn: '🌽', Grape: '🍇',
  Orange: '🍊', Peach: '🍑', Pepper: '🌶️', Potato: '🥔', Raspberry: '🫐',
  Soybean: '🫘', Squash: '🎃', Strawberry: '🍓', Tomato: '🍅'
};

const features = [
  {
    icon: <FiUpload size={32} />,
    title: 'Upload Leaf Image',
    description: 'Simply upload a photo of your crop leaf. Support for drag-and-drop and multiple image formats.',
  },
  {
    icon: <FiCpu size={32} />,
    title: 'AI Analysis',
    description: 'Our trained deep learning models analyze the leaf pattern to identify diseases with high accuracy.',
  },
  {
    icon: <FiZap size={32} />,
    title: 'Instant Results',
    description: 'Get disease predictions with confidence scores and top predictions in seconds.',
  },
];

const steps = [
  { number: '01', title: 'Capture', desc: 'Take a clear photo of the affected crop leaf' },
  { number: '02', title: 'Upload', desc: 'Drag and drop or browse to upload the image' },
  { number: '03', title: 'Analyze', desc: 'Our AI model processes and classifies the disease' },
  { number: '04', title: 'Results', desc: 'View prediction, confidence score, and recommendations' },
];

const stats = [
  { value: '38', label: 'Disease Classes', icon: '🔬' },
  { value: '14', label: 'Crop Species', icon: '🌱' },
  { value: '5', label: 'AI Models', icon: '🤖' },
];

const HomePage = () => {
  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroBlob1}></div>
          <div className={styles.heroBlob2}></div>
          <div className={styles.heroBlob3}></div>
        </div>
        <div className={styles.heroContent}>
          <span className={styles.badge}>🌿 AI-Powered Plant Health</span>
          <h1 className={styles.heroTitle}>
            AI-Powered<br />
            <span className={styles.gradient}>Crop Disease Detection</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Protect your crops with cutting-edge artificial intelligence. Upload a leaf image
            and get instant disease diagnosis powered by deep learning models trained on
            thousands of plant images.
          </p>
          <div className={styles.heroCta}>
            <Link to="/detect" className={styles.ctaButton}>
              Get Started <FiArrowRight />
            </Link>
            <Link to="/compare" className={styles.ctaSecondary}>
              View Models
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why CropGuard AI?</h2>
          <p className={styles.sectionSubtitle}>
            Fast, accurate, and easy-to-use crop disease detection at your fingertips
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>Four simple steps to diagnose crop diseases</p>
        </div>
        <div className={styles.stepsGrid}>
          {steps.map((step, i) => (
            <div key={i} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              {i < steps.length - 1 && <div className={styles.stepConnector}></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Supported Crops */}
      <section className={styles.cropsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Supported Crops</h2>
          <p className={styles.sectionSubtitle}>
            Our models are trained to detect diseases across 14 different crop species
          </p>
        </div>
        <div className={styles.cropsGrid}>
          {crops.map((crop, i) => (
            <div key={i} className={styles.cropBadge}>
              <span className={styles.cropEmoji}>{cropEmojis[crop]}</span>
              <span className={styles.cropName}>{crop}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to Protect Your Crops?</h2>
          <p className={styles.ctaDesc}>
            Start detecting crop diseases now with our AI-powered tool. It's fast, free, and accurate.
          </p>
          <Link to="/detect" className={styles.ctaButton}>
            Start Detection <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2024 CropGuard AI — AI-Based Crop Disease Detection System</p>
      </footer>
    </div>
  );
};

export default HomePage;
