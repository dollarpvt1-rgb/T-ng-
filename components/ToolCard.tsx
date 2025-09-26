import React from 'react';
import { AITool } from '../types.js';
import { RocketIcon, SparklesIcon } from './icons/Icons.js';

interface ToolCardProps {
  tool: AITool;
  onDetailsClick: () => void;
  hasAccess: boolean;
  onUpgradeClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onDetailsClick, hasAccess, onUpgradeClick }) => {
  const isComingSoon = tool.status === 'coming_soon';

  const renderUsageInfo = () => {
    if (tool.usageType === 'credits' && tool.creditCost) {
      return (
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="w-4 h-4 text-amber-400" />
          <span className="text-lg font-bold text-amber-400">{tool.creditCost}</span>
          <span className="text-xs text-medium-text">Tín dụng</span>
        </div>
      );
    }
    if (tool.accessLevel === 'free') {
       return <span className="text-lg font-bold text-emerald-400">Miễn phí</span>;
    }
    return <span className="text-lg font-bold text-emerald-400">Không giới hạn</span>;
  };

  const renderActionButton = () => {
    if (isComingSoon) {
      return (
        <button disabled className="w-full mt-auto text-light-text font-semibold py-2.5 px-4 rounded-lg bg-dark-border cursor-not-allowed">
          Chờ ra mắt
        </button>
      );
    }

    if (!hasAccess) {
      return (
        <button 
          onClick={onUpgradeClick}
          className="w-full mt-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RocketIcon className="w-5 h-5" />
          Nâng Cấp
        </button>
      );
    }
    
    return (
      <button 
        onClick={onDetailsClick}
        className="w-full mt-auto text-light-text font-semibold py-2.5 px-4 rounded-lg bg-dark-border group-hover:bg-brand-blue transition-colors duration-300"
      >
        Xem Chi Tiết
      </button>
    );
  };

  return (
    <div className={`bg-dark-card rounded-xl border border-dark-border p-6 flex flex-col hover:border-brand-blue hover:shadow-2xl hover:shadow-brand-blue/10 transition-all duration-300 group ${isComingSoon ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
          {tool.icon}
        </div>
        <div className="text-right">
            {renderUsageInfo()}
            {tool.specialFeature && (
                 <span className="block text-xs font-semibold bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded-full mt-1">
                    Tính Năng Đặc Thù
                 </span>
            )}
        </div>
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
      
      {renderActionButton()}
    </div>
  );
};

export default ToolCard;