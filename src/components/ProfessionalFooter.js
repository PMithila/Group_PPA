// src/components/ProfessionalFooter.js
import React from 'react';
import './ProfessionalFooter.css';

const ProfessionalFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'API Documentation', href: '#' },
      { label: 'System Status', href: '#' }
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Support', href: '#' },
      { label: 'Training Resources', href: '#' },
      { label: 'Community Forum', href: '#' }
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Partners', href: '#' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'GDPR Compliance', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: 'fab fa-twitter', href: '#', label: 'Twitter' },
    { icon: 'fab fa-linkedin', href: '#', label: 'LinkedIn' },
    { icon: 'fab fa-github', href: '#', label: 'GitHub' },
    { icon: 'fab fa-youtube', href: '#', label: 'YouTube' }
  ];

  return (
    <footer className="professional-footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo">
              <div className="logo-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="brand-text">
                <h3>EduSync Professional</h3>
                <p>Advanced Educational Management System</p>
              </div>
            </div>
            <p className="brand-description">
              Streamline your educational institution with our comprehensive 
              timetable management and administrative tools. Built for modern 
              educational excellence.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <ul>
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h4>Support</h4>
              <ul>
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h4>Company</h4>
              <ul>
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="link-group">
              <h4>Legal</h4>
              <ul>
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest updates and educational insights delivered to your inbox.</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-button">
                <i className="fas fa-paper-plane"></i>
                Subscribe
              </button>
            </div>
            <div className="newsletter-features">
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Privacy Protected</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-clock"></i>
                <span>Weekly Updates</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-times"></i>
                <span>Unsubscribe Anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>
                © {currentYear} EduSync Professional. All rights reserved.
                <span className="version">v2.1.0</span>
              </p>
            </div>
            <div className="footer-meta">
              <div className="system-status">
                <div className="status-indicator online"></div>
                <span>All Systems Operational</span>
              </div>
              <div className="footer-badges">
                <div className="badge">
                  <i className="fas fa-lock"></i>
                  <span>SSL Secured</span>
                </div>
                <div className="badge">
                  <i className="fas fa-cloud"></i>
                  <span>Cloud Hosted</span>
                </div>
                <div className="badge">
                  <i className="fas fa-mobile-alt"></i>
                  <span>Mobile Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
