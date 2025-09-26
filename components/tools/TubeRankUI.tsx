import React, { useState } from 'react';
import { KeyIcon, UsersIcon, SitemapIcon, ChartIcon, WrenchIcon, ArrowLeftIcon } from '../icons/Icons.js';
import KeywordResearcher from './seo/KeywordResearcher.js';
import CompetitorAnalyzer from './seo/CompetitorAnalyzer.js';
import NicheFinder from './seo/NicheFinder.js';
import SeoOptimizer from './seo/SeoOptimizer.js';
import ChannelOptimizer from './seo/ChannelOptimizer.js';

const SEO_TOOLS = [
    { id: 'keyword', name: 'Nghiên cứu Từ khóa', description: 'Khám phá từ khóa tiềm năng, ý định người dùng và bối cảnh cạnh tranh.', icon: KeyIcon },
    { id: 'competitor', name: 'Phân tích Đối thủ', description: 'Do thám kênh đối thủ để tìm điểm mạnh, điểm yếu và lỗ hổng chiến lược.', icon: UsersIcon },
    { id: 'niche', name: 'Tìm Ngách Tiềm Năng', description: 'Phát hiện các "ngách siêu nhỏ" có độ cạnh tranh thấp và tiềm năng phát triển cao.', icon: SitemapIcon },
    { id: 'optimizer', name: 'Tối ưu SEO Video', description: 'Nhận gói tiêu đề, mô tả và thumbnail được tối ưu hóa để đạt thứ hạng cao.', icon: ChartIcon },
    { id: 'channel', name: 'Tối ưu Toàn diện Kênh', description: 'Chạy một "bài kiểm tra sức khỏe" toàn diện cho kênh của bạn về branding, nội dung, và kiếm tiền.', icon: WrenchIcon },
];

type SeoToolId = 'keyword' | 'competitor' | 'niche' | 'optimizer' | 'channel';

interface TubeRankUIProps {
    onNavigate: (toolId: string, data: any) => void;
}

const TubeRankUI: React.FC<TubeRankUIProps> = ({ onNavigate }) => {
    const [activeTool, setActiveTool] = useState<SeoToolId | null>(null);
    const [initialDataForTool, setInitialDataForTool] = useState<any>(null);

    const handleSelectTool = (toolId: SeoToolId, data: any = null) => {
        setInitialDataForTool(data);
        setActiveTool(toolId);
    };

    const handleBackToDashboard = () => {
        setActiveTool(null);
        setInitialDataForTool(null);
    };

    const renderDashboard = () => (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-light-text mb-2">Bảng Điều Khiển Chiến Lược YouTube</h2>
                <p className="text-medium-text max-w-2xl mx-auto">Chọn một công cụ chuyên dụng để phân tích, tối ưu và thống trị ngách của bạn.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SEO_TOOLS.map(tool => {
                    const Icon = tool.icon;
                    return (
                        <div key={tool.id} className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col group hover:border-sky-500 transition-colors duration-300">
                             <div className="bg-dark-bg p-3 rounded-lg border border-dark-border self-start mb-4">
                                <Icon className="w-7 h-7 text-sky-400"/>
                            </div>
                            <h3 className="text-lg font-bold text-light-text mb-2">{tool.name}</h3>
                            <p className="text-sm text-medium-text flex-grow mb-6">{tool.description}</p>
                            <button 
                                onClick={() => handleSelectTool(tool.id as SeoToolId)}
                                className="w-full mt-auto text-light-text font-semibold py-2.5 px-4 rounded-lg bg-dark-border group-hover:bg-sky-500 transition-colors duration-300"
                            >
                                Khởi chạy
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderActiveTool = () => {
        if (!activeTool) return null;

        const currentTool = SEO_TOOLS.find(t => t.id === activeTool);

        const ToolHeader: React.FC = () => (
            <div className="mb-8">
                <button 
                    onClick={handleBackToDashboard} 
                    className="flex items-center gap-2 text-medium-text hover:text-light-text font-semibold mb-4 transition-colors group"
                >
                    <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>Quay lại Bảng điều khiển TubeRank</span>
                </button>
                 {currentTool && <h2 className="text-2xl font-bold text-light-text">{currentTool.name}</h2>}
            </div>
        );

        switch(activeTool) {
            case 'keyword':
                return (
                    <div className="animate-fade-in">
                        <ToolHeader />
                        <KeywordResearcher onNavigateToOptimizer={(data) => handleSelectTool('optimizer', data)} />
                    </div>
                );
            case 'competitor':
                return (
                    <div className="animate-fade-in">
                        <ToolHeader />
                        <CompetitorAnalyzer />
                    </div>
                );
            case 'niche':
                 return (
                    <div className="animate-fade-in">
                        <ToolHeader />
                        <NicheFinder onNavigate={onNavigate} />
                    </div>
                );
            case 'optimizer':
                return (
                    <div className="animate-fade-in">
                        <ToolHeader />
                        <SeoOptimizer initialData={initialDataForTool} />
                    </div>
                );
            case 'channel':
                return (
                    <div className="animate-fade-in">
                        <ToolHeader />
                        <ChannelOptimizer />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-dark-bg border border-dark-border rounded-xl p-4 md:p-8">
            {activeTool ? renderActiveTool() : renderDashboard()}
        </div>
    );
};

export default TubeRankUI;