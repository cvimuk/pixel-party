import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}) => {
  const baseStyles = "font-pixel text-xs sm:text-sm px-4 py-3 sm:px-6 sm:py-4 border-4 border-black transition-all transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-retro-active focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#FFCC00] text-black shadow-retro hover:bg-[#FFE066]",
    secondary: "bg-[#4ECDC4] text-black shadow-retro hover:bg-[#73DACE]",
    danger: "bg-[#FF6B6B] text-white shadow-retro hover:bg-[#FF8787]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'LOADING...' : children}
    </button>
  );
};

export default RetroButton;