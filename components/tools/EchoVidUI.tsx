import React from 'react';
import { VideoIcon } from '../icons/Icons';

// This is a custom footer for the EchoVid page, as seen in the image.
const EchoVidFooter: React.FC = () => {
    return (
        <footer className="bg-dark-bg border-t border-dark-border py-12 mt-auto">
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
                            <li><a href="#" className="text-medium-text hover:text-light-text">Về Chúng Tôi</a></li>
                            <li><a href="#" className="text-medium-text hover:text-light-text">Giá Cả</a></li>
                            <li><a href="#" className="text-medium-text hover:text-light-text">Nghề Nghiệp</a></li>
                            <li><a href="#" className="text-medium-text hover:text-light-text">Liên Hệ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-light-text mb-4">Theo Dõi Chúng Tôi</h4>
                        {/* Placeholder for social icons as in image */}
                    </div>
                </div>
                <div className="border-t border-dark-border pt-8 text-center text-medium-text">
                    <p>&copy; 2025 AI Marketplace. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};


const EchoVidUI: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-dark-bg text-light-text">
            <div className="container mx-auto px-4 pt-16 flex-grow flex flex-col items-center">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <div className="bg-dark-card p-3 rounded-lg border border-dark-border">
                            <VideoIcon className="w-10 h-10 text-rose-400"/>
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight">EchoVid</h1>
                    </div>
                    <p className="text-lg text-medium-text">
                        Tạo video chất lượng chuyên nghiệp từ văn bản hoặc ý tưởng chỉ trong vài phút. Tích hợp sẵn kho cảnh quay và nhạc nền.
                    </p>
                </div>

                {/* Main Content */}
                <div className="w-full max-w-4xl bg-dark-card border border-dark-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold text-light-text mb-4">Chào mừng đến EchoVid</h2>
                    <p className="text-medium-text max-w-xl">
                        Để bắt đầu, hãy tạo hoặc phân tích kịch bản trong "Kịch Bản Pro" và chuyển cảnh qua đây.
                    </p>
                </div>
            </div>
            
            {/* Footer Section */}
            <EchoVidFooter />
        </div>
    );
};

export default EchoVidUI;
