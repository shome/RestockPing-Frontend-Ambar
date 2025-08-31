import React, { useState, useEffect } from 'react';
import './WelcomePage.scss';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const WelcomePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features: Feature[] = [
    {
      id: 1,
      title: "Smart Inventory Tracking",
      description: "Monitor your stock levels in real-time with intelligent alerts and predictions",
      icon: "📦"
    },
    {
      id: 2,
      title: "Automated Reordering",
      description: "Never run out of stock with our AI-powered reorder suggestions",
      icon: "🤖"
    },
    {
      id: 3,
      title: "Analytics Dashboard",
      description: "Get insights into your inventory patterns and optimize your operations",
      icon: "📊"
    },
    {
      id: 4,
      title: "Multi-Platform Sync",
      description: "Access your inventory data from anywhere, anytime",
      icon: "🔄"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  const handleGetStarted = () => {
    alert('Welcome to RestockPing! This would navigate to the main application.');
  };

  const handleLearnMore = () => {
    alert('This would open detailed information about RestockPing features.');
  };

  return (
    <div className={`welcome-page ${isLoaded ? 'loaded' : ''}`}>
      <div className="welcome-container">
        {/* Header */}
        <header className="welcome-header">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <h1 className="logo-text">RestockPing</h1>
          </div>
          <nav className="nav-menu">
            <button className="nav-btn">Home</button>
            <button className="nav-btn">Features</button>
            <button className="nav-btn">About</button>
            <button className="nav-btn">Contact</button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to the Future of
              <span className="highlight"> Inventory Management</span>
            </h1>
            <p className="hero-subtitle">
              Streamline your business operations with intelligent stock tracking, 
              automated reordering, and powerful analytics. Join thousands of businesses 
              that trust RestockPing to keep their inventory optimized.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleLearnMore}
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-header">
                <span className="card-icon">📱</span>
                <span className="card-title">Live Dashboard</span>
              </div>
              <div className="card-content">
                <div className="metric">
                  <span className="metric-value">98%</span>
                  <span className="metric-label">Stock Accuracy</span>
                </div>
                <div className="metric">
                  <span className="metric-value">24/7</span>
                  <span className="metric-label">Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Why Choose RestockPing?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={feature.id}
                className={`feature-card ${index === currentFeature ? 'active' : ''}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Inventory Management?</h2>
            <p className="cta-subtitle">
              Join thousands of businesses that have already optimized their operations with RestockPing
            </p>
            <button 
              className="btn btn-primary btn-large"
              onClick={handleGetStarted}
            >
              Start Your Free Trial
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="welcome-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>RestockPing</h3>
              <p>Smart inventory management for modern businesses</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 RestockPing. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;
