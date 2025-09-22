import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-bg border-t border-dark-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-light-text mb-4">AI Marketplace</h3>
            <p className="text-medium-text">Nền tảng của bạn để khám phá các công cụ AI tốt nhất.</p>
          </div>
          <div>
            <h4 className="font-semibold text-light-text mb-4">Công Cụ</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-medium-text hover:text-light-text">Tạo Hình Ảnh</a></li>
              <li><a href="#" className="text-medium-text hover:text-light-text">Văn Bản & Viết Lách</a></li>
              <li><a href="#" className="text-medium-text hover:text-light-text">Tạo Video</a></li>
              <li><a href="#" className="text-medium-text hover:text-light-text">Marketing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-light-text mb-4">Công Ty</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-medium-text hover:text-light-text">Về Chúng Tôi</a></li>
              <li><a href="#pricing" className="text-medium-text hover:text-light-text">Giá Cả</a></li>
              <li><a href="#" className="text-medium-text hover:text-light-text">Nghề Nghiệp</a></li>
              <li><a href="#" className="text-medium-text hover:text-light-text">Liên Hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-light-text mb-4">Theo Dõi Chúng Tôi</h4>
            <div className="flex space-x-4">
                {/* Placeholder for social icons */}
            </div>
          </div>
        </div>
        <div className="border-t border-dark-border pt-8 text-center text-medium-text">
          <p>&copy; {new Date().getFullYear()} AI Marketplace. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;