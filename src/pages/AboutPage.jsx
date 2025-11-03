import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={isDark ? 'dark' : ''} style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '2rem',
      position: 'relative'
    }}>
  <Navbar />
  <div className="hero" style={{textAlign: 'left', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem'}}>
        <div className="badge" style={{ justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Zap className="badge-icon" />
          <span>About This Project</span>
        </div>
        <h1 className="hero-title" style={{textAlign: 'center', marginBottom: '3rem'}}>
          Advanced Product Recommendation System
        </h1>
        {/* Executive Summary */}
        <div style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(99,102,241,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(59,130,246,0.1) 100%)',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          border: '1px solid rgba(168,85,247,0.3)',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(168,85,247,0.15)'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #c084fc, #34d399)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem'
          }}>
            Executive Summary
          </h2>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: isDark ? '#e2e8f0' : '#d1d5db',
            marginBottom: '1rem'
          }}>
            The Advanced Product Recommendation System leverages AI and NLP to deliver personalized, aspect-aware product recommendations. By implementing Aspect-Based Sentiment Analysis (ABSA), it extracts nuanced insights from reviews and matches them with customer requirements.
          </p>
        </div>

        {/* Problem Statement */}
        <div style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(168,85,247,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(168,85,247,0.1) 100%)',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          border: '1px solid rgba(168,85,247,0.3)',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(168,85,247,0.15)'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem'
          }}>
            Problem Statement
          </h2>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: isDark ? '#e2e8f0' : '#d1d5db',
            marginBottom: '1rem'
          }}>
            Traditional e-commerce platforms struggle to interpret semantic user queries and subjective quality requirements like "good battery life" or "excellent display quality". This leads to poor matches and user frustration.
          </p>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: isDark ? '#e2e8f0' : '#d1d5db'
          }}>
            Existing systems underuse rich, aspect-specific insights hidden in reviews.
          </p>
        </div>

        {/* Solution & Approach */}
        <div style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(52,211,153,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(52,211,153,0.1) 100%)',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          border: '1px solid rgba(52,211,153,0.3)',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(52,211,153,0.15)'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #34d399, #3b82f6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem'
          }}>
            Solution & Technical Approach
          </h2>
          <ul style={{
            fontSize: '1.05rem',
            lineHeight: 1.9,
            color: isDark ? '#e2e8f0' : '#d1d5db',
            paddingLeft: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#c084fc' }}>NLP:</strong> Parse user intent and detect product aspects.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#34d399' }}>ABSA:</strong> Extract aspect-level sentiments from reviews.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#60a5fa' }}>Ranking:</strong> Weight aspect sentiments by user interest.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#f472b6' }}>Real-time:</strong> Analyze on demand.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#fbbf24' }}>Voice:</strong> Speech-to-text for hands-free search.
            </li>
          </ul>
        </div>

        {/* Future Enhancements & Team condensed */}
        <div style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(99,102,241,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(99,102,241,0.1) 100%)',
          padding: '2rem',
          borderRadius: '1.5rem',
          border: '1px solid rgba(99,102,241,0.3)',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(99,102,241,0.15)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Future Enhancements
          </h2>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.9,
            color: isDark ? '#e2e8f0' : '#d1d5db',
            paddingLeft: '1.5rem'
          }}>
            <li>Integrate multiple e-commerce APIs</li>
            <li>Collaborative filtering personalization</li>
            <li>Real-time price tracking</li>
            <li>Multi-language support</li>
            <li>Mobile apps and better visualization</li>
          </ul>
        </div>

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button type="button" onClick={() => navigate('/')} style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
            borderRadius: '0.75rem',
            color: 'white',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer'
          }}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
