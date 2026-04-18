import React from 'react'

const Button = ({ 
  children, 
  onClick,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
  ...props 
}) => {
  const baseClasses = "w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center";
  const variants = {
    primary: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed transform-none hover:scale-100" : "cursor-pointer";

  return (
    <button 
      type={type}
      className={`${baseClasses} ${variants[variant]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;