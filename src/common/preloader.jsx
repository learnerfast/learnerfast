'use client';
import React, { useEffect, useState } from 'react';

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div id="preloader">
      <div className="realistic-loader">
        {/* Header skeleton */}
        <div className="skeleton-header">
          <div className="skeleton-logo"></div>
          <div className="skeleton-nav">
            <div className="skeleton-nav-item"></div>
            <div className="skeleton-nav-item"></div>
            <div className="skeleton-nav-item"></div>
            <div className="skeleton-nav-item"></div>
          </div>
        </div>
        
        {/* Hero section skeleton */}
        <div className="skeleton-hero">
          <div className="skeleton-hero-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-title-small"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
        
        {/* Content cards skeleton */}
        <div className="skeleton-cards">
          <div className="skeleton-card">
            <div className="skeleton-card-image"></div>
            <div className="skeleton-card-content">
              <div className="skeleton-card-title"></div>
              <div className="skeleton-card-text"></div>
            </div>
          </div>
          <div className="skeleton-card">
            <div className="skeleton-card-image"></div>
            <div className="skeleton-card-content">
              <div className="skeleton-card-title"></div>
              <div className="skeleton-card-text"></div>
            </div>
          </div>
          <div className="skeleton-card">
            <div className="skeleton-card-image"></div>
            <div className="skeleton-card-content">
              <div className="skeleton-card-title"></div>
              <div className="skeleton-card-text"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;