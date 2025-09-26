import React from 'react';
import { RocketIcon } from '../icons/Icons';

interface AIStudioProUIProps {
    onGoBack: () => void;
}

const AIStudioProUI: React.FC<AIStudioProUIProps> = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-medium-text p-8 bg-dark-bg">
            <RocketIcon className="w-16 h-16 mx-auto mb-4 text-dark-border" />
            <h3 className="text-xl font-bold text-light-text">AI Studio Pro Sắp Ra Mắt</h3>
            <p className="max-w-sm mt-2">
                Công cụ sản xuất video ngắn tự động đang trong giai đoạn phát triển cuối cùng.
                Hãy quay lại sớm để trải nghiệm tương lai của việc sáng tạo nội dung!
            </p>
        </div>
    );
};

export default AIStudioProUI;