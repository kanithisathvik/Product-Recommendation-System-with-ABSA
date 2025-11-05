import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Sparkles, Mic, GitCompare, Heart, Filter, Star, Clock, Info, ArrowRight } from 'lucide-react';
import ProductTags from '../components/ProductTags';
import SmartRecommendations from '../components/SmartRecommendations';
import RatingBreakdown from '../components/RatingBreakdown';
import RatingBreakdownModal from '../components/RatingBreakdownModal';
import PromptAssistBar from '../components/PromptAssistBar';
import ShareProductButton from '../components/ShareProductButton';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Sparkles, text: 'AI-Powered Search', desc: 'Natural language search with intelligent recommendations', gradient: 'from-purple-500 to-pink-500', route: '/' },
    { icon: Mic, text: 'Voice Search', desc: 'Speak your requirements and search by voice', gradient: 'from-blue-500 to-cyan-500', route: '/' },
    { icon: GitCompare, text: 'Product Comparison', desc: 'Compare multiple products side-by-side', gradient: 'from-emerald-500 to-teal-500', route: '/compare' },
    { icon: Heart, text: 'Favorites & Wishlist', desc: 'Save your favorite products', gradient: 'from-red-500 to-pink-500', route: '/favorites' },
    { icon: Filter, text: 'Aspect-Based Filtering', desc: 'Filter by aspects like battery, display, performance', gradient: 'from-amber-500 to-orange-500', route: '/' },
    { icon: Star, text: 'Sentiment Analysis', desc: 'Detailed sentiment scores and review analysis', gradient: 'from-violet-500 to-purple-500', route: '/' },
    { icon: Clock, text: 'Search History', desc: 'Access previous searches and re-run them', gradient: 'from-indigo-500 to-blue-500', route: '/history' },
    { icon: Info, text: 'Product Details Modal', desc: 'Comprehensive product info and reviews', gradient: 'from-cyan-500 to-teal-500', route: '/' }
  ];

  const demoProduct = {
    id: 'demo-1',
    product_name: 'Demo Laptop Pro 14',
    brand: 'DemoBrand',
    category: 'ultraportable',
    selling_price: 99999,
    rating: 4.6,
    sentiments: {
      'battery life': { positive: 22, negative: 3 },
      'display': { positive: 18, negative: 4 },
      'performance': { positive: 20, negative: 5 },
      'build quality': { positive: 15, negative: 2 }
    },
    ratingDistribution: { 5: 120, 4: 45, 3: 12, 2: 4, 1: 3 }
  };

  const [demoPrompt, setDemoPrompt] = useState('light thin laptop with great battery');
  const [rbModal, setRbModal] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '2rem'
    }}>
      <Navbar />
      <div className="hero" style={{textAlign: 'center'}}>
        <div className="badge">
          <Sparkles className="badge-icon" />
          <span>Explore Our Features</span>
        </div>
        <h1 className="hero-title">Powerful Features at Your Fingertips</h1>
        <p className="hero-desc" style={{maxWidth: 800, margin: '0 auto 3rem'}}>
          Discover all the features that make our product recommendation system stand out.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(feature.route)}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(59,130,246,0.1) 100%)',
                  borderRadius: '1.5rem',
                  border: '2px solid rgba(168,85,247,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="feature-button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(168,85,247,0.3)';
                  e.currentTarget.style.borderColor = '#a855f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)';
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(168,85,247,0.3)'
                }}>
                  <Icon size={28} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                    {feature.text}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {feature.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', fontSize: '0.9rem', fontWeight: 600 }}>
                    Try it now <ArrowRight size={16} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Demo Components */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'left',
          background: 'rgba(31,41,55,0.6)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '1rem' }}>Lab Components</h3>

          {/* Prompt Assist Demo */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Prompt Assist</div>
            <input value={demoPrompt} onChange={(e)=>setDemoPrompt(e.target.value)} placeholder="type prompt" style={{ width:'100%', padding:'0.5rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e5e7eb' }} />
            <PromptAssistBar prompt={demoPrompt} onApply={()=>{}} />
          </div>

          {/* ProductTags Demo */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Product Tags</div>
            <div style={{ color: 'white', fontWeight: 700 }}>{demoProduct.product_name}</div>
            <ProductTags product={demoProduct} onTagClick={()=>{}} />
          </div>

          {/* Rating Breakdown Demo */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Rating Breakdown</div>
            <RatingBreakdown distribution={demoProduct.ratingDistribution} onClick={()=> setRbModal(demoProduct.ratingDistribution)} />
          </div>

          {/* Smart Recommendations Demo (uses demo data as both base and pool) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Smart Recommendations</div>
            <SmartRecommendations baseProducts={[demoProduct]} allProducts={[demoProduct]} />
          </div>

          {/* Share Product Demo */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Share Product</div>
            <ShareProductButton product={demoProduct} />
          </div>
        </div>

        {rbModal && (
          <RatingBreakdownModal distribution={rbModal} onClose={()=> setRbModal(null)} />
        )}

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

export default FeaturesPage;
