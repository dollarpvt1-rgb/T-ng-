import React from 'react';
import { AITool } from '../types';

interface ToolCardProps {
  tool: AITool;
  onDetailsClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onDetailsClick }) => {
  const isComingSoon = tool.status === 'coming_soon';

  return (
    <div className={`bg-dark-card rounded-xl border border-dark-border p-6 flex flex-col hover:border-brand-blue hover:shadow-2xl hover:shadow-brand-blue/10 transition-all duration-300 group ${isComingSoon ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
          {tool.icon}
        </div>
        <span className="text-lg font-bold text-emerald-400">{tool.price}</span>
      </div>
      
      <h3 className="text-xl font-bold text-light-text mb-2">{tool.name}</h3>
      <p className="text-medium-text flex-grow mb-4">{tool.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {tool.tags.map(tag => (
          <span key={tag} className="text-xs font-medium bg-dark-border text-medium-text px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      
      <button 
        onClick={onDetailsClick}
        disabled={isComingSoon}
        className={`w-full mt-auto text-light-text font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 ${isComingSoon ? 'bg-dark-border cursor-not-allowed' : 'bg-dark-border group-hover:bg-brand-blue'}`}
      >
        {isComingSoon ? 'Chờ ra mắt' : 'Xem Chi Tiết'}
      </button>
    </div>
  );
};

export default ToolCard;
