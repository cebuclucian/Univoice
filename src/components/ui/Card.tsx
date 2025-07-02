import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  animation?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'bounceIn';
  delay?: number;
  hover?: 'subtle' | 'scale' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  animation,
  delay = 0,
  hover = 'none'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const animationClasses = {
    fadeInUp: 'animate-fade-in-up',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    scaleIn: 'animate-scale-in',
    bounceIn: 'animate-bounce-in'
  };

  const hoverClasses = {
    subtle: 'hover:shadow-md transition-shadow duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    none: ''
  };

  const classes = `
    bg-white rounded-2xl border border-gray-200 shadow-sm
    ${paddingClasses[padding]}
    ${animation ? animationClasses[animation] : ''}
    ${hoverClasses[hover]}
    ${className}
  `;

  const style = delay > 0 ? { animationDelay: `${delay * 0.1}s` } : undefined;

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};