import React from 'react';
import { GoogleIcon } from './icons/Icons.js';

interface AuthModalProps {
  mode: 'login' | 'signup';
  isOpen: boolean;
  onClose: () => void;
  onGoogleAuthClick: () => void;
  onAuthSuccess: () => void; // Thêm prop mới
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, isOpen, onClose, onGoogleAuthClick, onAuthSuccess }) => {
  if (!isOpen) return null;

  const isLogin = mode === 'login';
  const title = isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản';
  const subtitle = isLogin ? 'Chào mừng trở lại!' : 'Bắt đầu hành trình AI của bạn.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic xác thực thật sẽ ở đây
    onAuthSuccess(); // Gọi hàm khi xác thực thành công (mô phỏng)
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-dark-card rounded-2xl border border-dark-border p-8 w-full max-w-md relative animate-fade-in"
        onClick={(e) => e.stopPropagation()} // Ngăn việc click bên trong modal làm đóng modal
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

        <div className="text-center mb-6">
          <h2 id="auth-modal-title" className="text-2xl font-bold text-light-text mb-2">{title}</h2>
          <p className="text-medium-text">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-medium-text mb-2">Tên</label>
                <input type="text" id="name" name="name" required className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-medium-text mb-2">Email</label>
              <input type="email" id="email" name="email" required className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-medium-text mb-2">Mật khẩu</label>
              <input type="password" id="password" name="password" required className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue" />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-6">
            {title}
          </button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-card text-medium-text">HOẶC</span>
            </div>
        </div>

        <button 
            onClick={onGoogleAuthClick}
            className="w-full flex items-center justify-center gap-3 bg-dark-border hover:bg-gray-600 text-light-text font-semibold py-3 px-4 rounded-lg transition-colors"
        >
            <GoogleIcon className="w-5 h-5" />
            Tiếp tục với Google
        </button>

      </div>
    </div>
  );
};

export default AuthModal;