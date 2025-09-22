
import React from 'react';

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ label, isActive, onClick }) => {
  const baseClasses = "px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 cursor-pointer";
  const activeClasses = "bg-brand-blue text-white shadow-md shadow-blue-500/20";
  const inactiveClasses = "bg-dark-card hover:bg-dark-border text-medium-text hover:text-light-text";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};

export default CategoryPill;
