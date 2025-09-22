import React from 'react';
import { GoogleIcon } from './icons/Icons';

interface HeroProps {
  onSignupClick: () => void;
  onGoogleSignupClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSignupClick, onGoogleSignupClick }) => {
  return (
    <section 
      className="text-center py-16 md:py-24 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(at 20% 25%, hsla(212,100%,50%,0.2) 0px, transparent 50%),
          radial-gradient(at 80% 30%, hsla(271,76%,53%,0.25) 0px, transparent 50%),
          radial-gradient(at 50% 90%, hsla(212,100%,50%,0.15) 0px, transparent 50%)
        `,
      }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
       <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-brand-purple/20 rounded-full blur-3xl"
        style={{ filter: 'blur(100px)' }}
      ></div>
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-light-text to-medium-text">
          Sàn Giao Dịch Tối Ưu Cho Công Cụ AI
        </h1>
        <p className="text-lg md:text-xl text-medium-text max-w-3xl mx-auto mb-8">
          Khai phá tiềm năng của bạn với AI tiên tiến. Tìm kiếm, so sánh và đăng ký các công cụ tốt nhất cho mọi nhiệm vụ, tất cả ở một nơi.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#tools"
            className="w-full sm:w-auto bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg shadow-blue-500/30"
          >
            Khám Phá Công Cụ
          </a>
          <button
            onClick={onGoogleSignupClick}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-light-text hover:bg-gray-200 text-dark-bg font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105"
          >
            <GoogleIcon className="w-5 h-5" />
            Đăng ký miễn phí với Google
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;