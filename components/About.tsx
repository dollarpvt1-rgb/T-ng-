import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-dark-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-light-text to-medium-text">
                Về Chúng Tôi
            </h2>
            <p className="text-lg md:text-xl text-medium-text mb-8">
                Sứ mệnh của chúng tôi là dân chủ hóa quyền truy cập vào các công cụ trí tuệ nhân tạo tiên tiến nhất. Chúng tôi tin rằng AI có sức mạnh để thay đổi thế giới, và chúng tôi muốn trao quyền cho các nhà sáng tạo, nhà phát triển và doanh nghiệp để khai thác tiềm năng đó.
            </p>
            <a
                href="#"
                className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
                Tìm Hiểu Thêm Về Đội Ngũ
            </a>
        </div>
      </div>
    </section>
  );
};

export default About;
