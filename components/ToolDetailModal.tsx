import React from 'react';
import { AITool } from '../types.js';
import { SparklesIcon } from './icons/Icons.js';

interface ToolDetailModalProps {
  tool: AITool | null;
  onClose: () => void;
  onAccessTool: (tool: AITool) => void;
}

const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ tool, onClose, onAccessTool }) => {
  if (!tool) return null;

  const handleAccessClick = () => {
    if (tool) {
      onAccessTool(tool);
    }
  };

  const renderAccessInfo = () => {
    let accessText = "Truy cập miễn phí";
    if (tool.accessLevel === 'creator') accessText = "Yêu cầu Gói Người Sáng Tạo";
    if (tool.accessLevel === 'professional') accessText = "Yêu cầu Gói Chuyên Nghiệp";
    
    return (
      <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            {tool.usageType === 'credits' && tool.creditCost && (
              <>
                <SparklesIcon className="w-6 h-6 text-amber-400" />
                <span className="text-3xl font-extrabold text-light-text">{tool.creditCost} Tín dụng</span>
              </>
            )}
             {tool.usageType === 'unlimited' && (
                <span className="text-3xl font-extrabold text-emerald-400">Không giới hạn</span>
            )}
          </div>
          <span className="text-sm text-medium-text">{accessText}</span>
      </div>
    );
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tool-detail-modal-title"
    >
      <div 
        className="bg-dark-card rounded-2xl border border-dark-border p-8 w-full max-w-3xl relative animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-medium-text hover:text-light-text transition-colors z-10"
          aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-start gap-6 mb-6">
            <div className="bg-dark-bg p-4 rounded-lg border border-dark-border flex-shrink-0">
              {tool.icon}
            </div>
            <div>
                <h2 id="tool-detail-modal-title" className="text-3xl font-bold text-light-text mb-1">{tool.name}</h2>
                <p className="text-medium-text">{tool.description}</p>
            </div>
        </div>

        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-light-text mb-3">Mô Tả Chi Tiết</h3>
                <p className="text-medium-text leading-relaxed">{tool.longDescription || 'Chưa có mô tả chi tiết.'}</p>
            </div>
            
            {tool.features && tool.features.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-light-text mb-4">Tính Năng Chính</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                        {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-medium-text">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 text-brand-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {feature}
                        </li>
                        ))}
                    </ul>
                </div>
            )}

            {tool.gallery && tool.gallery.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-light-text mb-4">Thư Viện Ảnh</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {tool.gallery.map((image, index) => (
                            <a href={image} target="_blank" rel="noopener noreferrer" key={index}>
                                <img src={image} alt={`${tool.name} example ${index + 1}`} className="rounded-lg object-cover w-full h-40 hover:opacity-80 transition-opacity" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="mt-8 pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
            {renderAccessInfo()}
            <button 
                onClick={handleAccessClick}
                disabled={tool.status === 'coming_soon'}
                className="w-full sm:w-auto bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg shadow-blue-500/30 text-center disabled:bg-dark-border disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
            >
                {tool.status === 'coming_soon' ? 'Sắp ra mắt' : 'Truy Cập Ứng Dụng'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ToolDetailModal;