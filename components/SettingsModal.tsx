import React, { useState, useEffect } from 'react';
import { useAPIKey } from '../contexts/APIKeyContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, saveApiKey, clearApiKey } = useAPIKey();
  const [currentKey, setCurrentKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setCurrentKey(apiKey || '');
        setIsSaved(false);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiKey(currentKey);
    setIsSaved(true);
    setTimeout(() => {
        onClose();
    }, 1500);
  };

  const handleClear = () => {
      clearApiKey();
      setCurrentKey('');
  }

  const getMaskedKey = (key: string) => {
      if (key.length <= 8) return '****';
      return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
    >
      <div 
        className="bg-dark-card rounded-2xl border border-dark-border p-8 w-full max-w-lg relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-medium-text hover:text-light-text transition-colors"
          aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 id="settings-modal-title" className="text-2xl font-bold text-light-text mb-2">Cài Đặt API Key</h2>
          <p className="text-medium-text">Cung cấp API Key của bạn để sử dụng các công cụ AI tạo sinh.</p>
        </div>

        <div className="space-y-4">
            <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-medium-text mb-2">
                    Google AI API Key của bạn
                </label>
                <input 
                    type="password" 
                    id="apiKey" 
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    placeholder={apiKey ? `Đã lưu key: ${getMaskedKey(apiKey)}` : "Dán API Key của bạn vào đây"}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue" 
                />
            </div>
            <div className="text-xs text-medium-text bg-dark-bg border-l-4 border-amber-500 p-3 rounded-r-lg">
                <p className="font-semibold mb-1">Quyền riêng tư & Bảo mật:</p>
                <p>API Key của bạn chỉ được lưu trữ trên trình duyệt này và không bao giờ được gửi đến máy chủ của chúng tôi. Nó được sử dụng trực tiếp để giao tiếp với Google AI API từ phía bạn.</p>
            </div>
            <p className="text-sm text-medium-text">
                Bạn có thể lấy API Key của mình tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Google AI Studio</a>.
            </p>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-border flex items-center justify-end gap-4">
            <button
                onClick={handleClear}
                className="text-medium-text hover:text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                Xóa Key
            </button>
            <button 
                onClick={handleSave}
                className={`min-w-[120px] bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors ${isSaved ? 'bg-emerald-500' : ''}`}
            >
                {isSaved ? 'Đã lưu!' : 'Lưu Thay Đổi'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;