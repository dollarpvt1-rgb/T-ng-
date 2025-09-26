import React, { useState } from 'react';
import { YouTubeIcon, FacebookIcon, TikTokIcon, LinkIcon, SettingsIcon, CheckCircleIcon } from './icons/Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccounts: Record<string, boolean>;
  onConnect: (platformId: string) => void;
  onDisconnect: (platformId: string) => void;
}

type Tab = 'general' | 'connections';

const PLATFORMS = [
  { 
    id: 'youtube', 
    name: 'YouTube', 
    description: 'Tự động đăng tải video, phân tích dữ liệu kênh, tối ưu hóa SEO video...', 
    icon: <YouTubeIcon className="w-8 h-8 text-red-600" />,
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    description: 'Đăng tải video và Reels, quản lý trang, tương tác với bình luận...', 
    icon: <FacebookIcon className="w-8 h-8 text-blue-600" />,
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    description: 'Đăng tải video ngắn, theo dõi xu hướng, phân tích hiệu suất...', 
    icon: <TikTokIcon className="w-8 h-8 text-light-text" />,
  },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, connectedAccounts, onConnect, onDisconnect }) => {
  const [activeTab, setActiveTab] = useState<Tab>('connections');

  if (!isOpen) return null;

  const renderGeneralTab = () => (
    <div className="animate-fade-in">
        <h3 className="text-lg font-semibold text-light-text mb-2">Cài đặt Chung</h3>
        <p className="text-center text-medium-text py-8">
            Các tùy chọn cài đặt chung sẽ sớm được cập nhật tại đây.
        </p>
    </div>
  );

  const renderConnectionsTab = () => (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold text-light-text mb-2">Kết nối tài khoản của bạn</h3>
      <p className="text-sm text-medium-text mb-6">Liên kết các nền tảng mạng xã hội để mở khóa các tính năng tự động hóa và phân tích sâu hơn trong các công cụ AI của chúng tôi.</p>
      
      <div className="space-y-4">
        {PLATFORMS.map(platform => {
          const isConnected = connectedAccounts[platform.id];
          return (
            <div key={platform.id} className="bg-dark-bg border border-dark-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {platform.icon}
                <div>
                  <h4 className="font-bold text-light-text">{platform.name}</h4>
                  <p className="text-xs text-medium-text">{platform.description}</p>
                </div>
              </div>
              {isConnected ? (
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                        <CheckCircleIcon className="w-5 h-5"/>
                        Đã kết nối
                    </span>
                    <button 
                        onClick={() => onDisconnect(platform.id)}
                        className="bg-dark-border hover:bg-red-600/50 text-light-text font-semibold py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
                    >
                        Hủy
                    </button>
                </div>
              ) : (
                <button 
                  onClick={() => onConnect(platform.id)}
                  className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm whitespace-nowrap"
                >
                  Kết nối
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
    >
      <div 
        className="bg-dark-card rounded-2xl border border-dark-border p-8 w-full max-w-2xl relative animate-fade-in"
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
          <h2 id="settings-modal-title" className="text-2xl font-bold text-light-text mb-2">Cài đặt</h2>
          <p className="text-medium-text">Quản lý các tài khoản đã liên kết của bạn.</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-dark-border mb-6">
          <nav className="flex -mb-px space-x-6" aria-label="Tabs">
            <button 
                onClick={() => setActiveTab('connections')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'connections' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-medium-text hover:text-light-text'}`}
            >
                <LinkIcon className="w-5 h-5" />
                Tài khoản liên kết
            </button>
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'general' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-medium-text hover:text-light-text'}`}
            >
                <SettingsIcon className="w-5 h-5" />
                Cài đặt chung
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div>
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'connections' && renderConnectionsTab()}
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;