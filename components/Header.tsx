import React from 'react';
import { SettingsIcon, UserIcon, LogoutIcon, SparklesIcon } from './icons/Icons.js'; // Thêm SparklesIcon

interface HeaderProps {
  isLoggedIn: boolean;
  username: string;
  credits: number; // Thêm prop credits
  onLoginClick: () => void;
  onSignupClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username, credits, onLoginClick, onSignupClick, onSettingsClick, onLogoutClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-sm border-b border-dark-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.207 12.793-1.414 1.414L12 13.414l-2.793 2.793-1.414-1.414L10.586 12 7.793 9.207l1.414-1.414L12 10.586l2.793-2.793 1.414 1.414L13.414 12l2.793 2.793z"/>
            </svg>
            <span className="text-xl font-bold text-light-text">YTLab</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#tools" className="text-medium-text hover:text-light-text transition-colors">Công Cụ</a>
            <a href="#pricing" className="text-medium-text hover:text-light-text transition-colors">Giá Cả</a>
            <a href="#about" className="text-medium-text hover:text-light-text transition-colors">Về Chúng Tôi</a>
            <a href="#" className="text-medium-text hover:text-light-text transition-colors">Liên Hệ</a>
          </nav>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-1.5 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-amber-400"/>
                  <span className="font-semibold text-light-text">{credits}</span>
                  <span className="text-sm text-medium-text">Tín dụng</span>
                </div>
                <div className="flex items-center gap-2 text-medium-text">
                  <UserIcon className="w-5 h-5"/>
                  <span className="font-semibold hidden sm:inline">Chào, {username}!</span>
                </div>
                <button onClick={onSettingsClick} className="text-medium-text hover:text-light-text p-2 rounded-full transition-colors">
                    <SettingsIcon className="w-6 h-6" />
                </button>
                <button onClick={onLogoutClick} className="text-medium-text hover:text-light-text p-2 rounded-full transition-colors" title="Đăng xuất">
                  <LogoutIcon className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                 <button onClick={onSettingsClick} className="text-medium-text hover:text-light-text p-2 rounded-full transition-colors">
                    <SettingsIcon className="w-6 h-6" />
                 </button>
                <button onClick={onLoginClick} className="text-medium-text hover:text-light-text font-semibold transition-colors">
                  Đăng Nhập
                </button>
                <button onClick={onSignupClick} className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                  Đăng Ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;