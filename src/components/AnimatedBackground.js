// Enhanced Animated Background Component
import React from 'react';

const AnimatedBackground = ({ variant = 'default' }) => {
  const getBackgroundStyle = () => {
    const variants = {
      default: {
        background: `
          linear-gradient(135deg, #667eea 0%, #764ba2 100%),
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
        `
      },
      dashboard: {
        background: `
          linear-gradient(135deg, #667eea 0%, #764ba2 100%),
          radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.4) 0%, transparent 50%)
        `
      },
      auth: {
        background: `
          linear-gradient(135deg, #4facfe 0%, #00f2fe 100%),
          radial-gradient(circle at 30% 70%, rgba(79, 172, 254, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 70% 30%, rgba(0, 242, 254, 0.3) 0%, transparent 50%)
        `
      }
    };
    return variants[variant] || variants.default;
  };

  return (
    <>
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>
      
      <style jsx="true">{`
        .animated-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          ${getBackgroundStyle().background}
          animation: gradientShift 15s ease infinite;
        }
        
        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          animation: float 20s infinite linear;
        }
        
        .shape-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 25s;
        }
        
        .shape-2 {
          width: 120px;
          height: 120px;
          top: 70%;
          left: 80%;
          animation-delay: -5s;
          animation-duration: 30s;
        }
        
        .shape-3 {
          width: 60px;
          height: 60px;
          top: 30%;
          left: 70%;
          animation-delay: -10s;
          animation-duration: 20s;
        }
        
        .shape-4 {
          width: 100px;
          height: 100px;
          top: 80%;
          left: 20%;
          animation-delay: -15s;
          animation-duration: 35s;
        }
        
        .shape-5 {
          width: 40px;
          height: 40px;
          top: 50%;
          left: 50%;
          animation-delay: -20s;
          animation-duration: 15s;
        }
        
        @keyframes gradientShift {
          0%, 100% {
            filter: hue-rotate(0deg);
          }
          50% {
            filter: hue-rotate(30deg);
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          33% {
            transform: translateY(-30px) rotate(120deg);
            opacity: 1;
          }
          66% {
            transform: translateY(30px) rotate(240deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0px) rotate(360deg);
            opacity: 0.7;
          }
        }
        
        @media (max-width: 768px) {
          .shape {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;
