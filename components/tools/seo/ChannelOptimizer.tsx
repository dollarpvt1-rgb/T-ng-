import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, SitemapIcon, UsersIcon, DollarSignIcon, WrenchIcon, ArrowLeftIcon } from '../../icons/Icons';

type Step = 'input' | 'dashboard';
type ModuleKey = 'branding_impression' | 'content_strategy' | 'audience_engagement' | 'monetization_potential';
type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface Score {
    score: number;
    feedback: string;
}

interface AnalysisResult {
    [key: string]: any;
}

interface AnalysisModule {
    key: ModuleKey;
    title: string;
    description: string;
    icon: React.FC<any>;
    prompt: (url: string) => string;
}

// --- Analysis Modules Definition ---
const ANALYSIS_MODULES: AnalysisModule[] = [
    {
        key: 'branding_impression',
        title: 'Thương Hiệu & Ấn Tượng Đầu Tiên',
        description: 'AI sẽ đánh giá banner, logo, tên kênh để xem chúng có chuyên nghiệp và truyền tải đúng giá trị hay không.',
        icon: SparklesIcon,
        prompt: (url) => `Là một chuyên gia thương hiệu YouTube, hãy phân tích kênh tại ${url}. Tập trung vào ấn tượng đầu tiên.
        1.  Sử dụng Google Search để tìm tên kênh, mô tả banner và logo nếu có.
        2.  Đánh giá nhận diện hình ảnh (banner, logo, sự nhất quán của thumbnail).
        3.  Đánh giá tên kênh và slogan (nếu có).
        4.  Cung cấp điểm thương hiệu tổng thể (1-10) và phản hồi.
        5.  Đề xuất 3 tên kênh thay thế và 3 slogan.
        Phản hồi CHỈ bằng một đối tượng JSON hợp lệ:
        { "channel_name_feedback": "...", "visual_identity_feedback": "...", "branding_score": { "score": 8, "feedback": "..." }, "suggested_names": ["...", "...", "..."], "suggested_taglines": ["...", "...", "..."] }`
    },
    {
        key: 'content_strategy',
        title: '"Soi" Chiến Lược Nội Dung',
        description: 'Phân tích sâu các video gần đây để tìm ra "trụ cột nội dung", các định dạng hiệu quả và "khoảng trống nội dung".',
        icon: SitemapIcon,
        prompt: (url) => `Là một nhà chiến lược nội dung YouTube, hãy phân tích kênh tại ${url}.
        1.  Sử dụng Google Search để tìm các tiêu đề và chủ đề video gần đây.
        2.  Xác định 3 "Trụ cột nội dung" hàng đầu (chủ đề/định dạng thành công lặp lại).
        3.  Xác định 3 "Khoảng trống nội dung" hoặc "Lãnh thổ chưa được khai phá" (chủ đề liên quan mà kênh chưa khai thác).
        4.  Cung cấp điểm chiến lược nội dung tổng thể (1-10) và phản hồi.
        5.  Đề xuất 5 ý tưởng video cụ thể, có tiềm năng viral dựa trên phân tích của bạn.
        Phản hồi CHỈ bằng một đối tượng JSON hợp lệ:
        { "content_pillars": [ { "pillar": "...", "explanation": "..." } ], "content_gaps": [ { "gap": "...", "opportunity": "..." } ], "content_strategy_score": { "score": 7, "feedback": "..." }, "suggested_video_ideas": ["...", "...", "..."] }`
    },
    {
        key: 'audience_engagement',
        title: 'Tiềm Năng Thu Hút Khán Giả',
        description: 'AI sẽ đóng vai một khán giả tiềm năng để đánh giá xem tiêu đề và thumbnail có thực sự hấp dẫn và kích thích click hay không.',
        icon: UsersIcon,
        prompt: (url) => `Đóng vai một người xem tiềm năng, hãy phân tích chiến lược thu hút khán giả cho kênh tại ${url}.
        1.  Sử dụng Google Search để tìm các tiêu đề video và mô tả thumbnail gần đây.
        2.  Phân tích "Tiềm năng Tỷ lệ nhấp (CTR)" của tiêu đề và thumbnail. Chúng có gây tò mò không? Rõ ràng không? Có cảm xúc không?
        3.  Phân tích chiến lược "Kêu gọi hành động" (CTA) trong mô tả hoặc bình luận (nếu có thể thấy).
        4.  Cung cấp điểm thu hút (1-10) và phản hồi.
        5.  Đề xuất một "Công thức tiêu đề vượt trội" và một "Công thức thumbnail vượt trội" để tăng cường sự thu hút.
        Phản hồi CHỈ bằng một đối tượng JSON hợp lệ:
        { "ctr_potential_feedback": "...", "cta_strategy_feedback": "...", "engagement_score": { "score": 6, "feedback": "..." }, "superior_title_formula": "...", "superior_thumbnail_formula": "..." }`
    },
    {
        key: 'monetization_potential',
        title: 'Khám Phá Cơ Hội Kiếm Tiền',
        description: 'Phân tích ngách của bạn và đề xuất các phương pháp kiếm tiền sáng tạo ngoài quảng cáo YouTube (sản phẩm số, affiliate...).',
        icon: DollarSignIcon,
        prompt: (url) => `Là một nhà tư vấn kinh doanh YouTube, hãy phân tích tiềm năng kiếm tiền cho kênh tại ${url}.
        1.  Sử dụng Google Search để xác định ngách và nhân khẩu học khán giả của kênh.
        2.  Dựa trên ngách, đề xuất 5 luồng kiếm tiền tiềm năng ngoài quảng cáo YouTube chuẩn (ví dụ: sản phẩm affiliate, khóa học số, tài trợ, merchandise, huấn luyện).
        3.  Với mỗi luồng, cung cấp một lời giải thích ngắn gọn tại sao nó lại phù hợp.
        4.  Cung cấp điểm tiềm năng kiếm tiền tổng thể (1-10) và phản hồi.
        Phản hồi CHỈ bằng một đối tượng JSON hợp lệ:
        { "monetization_streams": [ { "stream": "...", "reason": "..." } ], "monetization_score": { "score": 9, "feedback": "..." } }`
    }
];

// --- Helper Components ---
const ScoreDisplay: React.FC<{ scoreData: Score; color: string }> = ({ scoreData, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold">Điểm đánh giá</span>
            <span className={`text-lg font-bold ${color}`}>{scoreData.score}/10</span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2.5">
            <div className={`bg-gradient-to-r ${color === 'text-emerald-400' ? 'from-emerald-500 to-green-400' : color === 'text-sky-400' ? 'from-sky-500 to-blue-400' : 'from-rose-500 to-red-400'} h-2.5 rounded-full`} style={{ width: `${scoreData.score * 10}%` }}></div>
        </div>
        <p className="text-xs text-medium-text mt-2">{scoreData.feedback}</p>
    </div>
);

const ResultRenderer = ({ resultKey, data }: { resultKey: ModuleKey, data: any }) => {
    switch(resultKey) {
        case 'branding_impression':
            return (
                <div className="space-y-4 text-sm">
                    <ScoreDisplay scoreData={data.branding_score} color="text-sky-400" />
                    <div><strong className="text-light-text">Tên kênh:</strong> <span className="text-medium-text">{data.channel_name_feedback}</span></div>
                    <div><strong className="text-light-text">Nhận diện hình ảnh:</strong> <span className="text-medium-text">{data.visual_identity_feedback}</span></div>
                    <div><strong className="text-light-text">Gợi ý tên kênh:</strong> <ul className="list-disc list-inside text-medium-text">{data.suggested_names.map((name: string, i: number) => <li key={i}>{name}</li>)}</ul></div>
                    <div><strong className="text-light-text">Gợi ý slogan:</strong> <ul className="list-disc list-inside text-medium-text">{data.suggested_taglines.map((tag: string, i: number) => <li key={i}>{tag}</li>)}</ul></div>
                </div>
            );
        case 'content_strategy':
            return (
                <div className="space-y-4 text-sm">
                    <ScoreDisplay scoreData={data.content_strategy_score} color="text-emerald-400" />
                    <div><strong className="text-light-text">Trụ cột nội dung:</strong> {data.content_pillars.map((p: any, i: number) => <div key={i} className="mt-1 border-l-2 border-dark-border pl-2"><p className="font-semibold">{p.pillar}</p><p className="text-xs text-medium-text">{p.explanation}</p></div>)}</div>
                    <div><strong className="text-light-text">Khoảng trống nội dung:</strong> {data.content_gaps.map((g: any, i: number) => <div key={i} className="mt-1 border-l-2 border-dark-border pl-2"><p className="font-semibold">{g.gap}</p><p className="text-xs text-medium-text">{g.opportunity}</p></div>)}</div>
                    <div><strong className="text-light-text">Ý tưởng video:</strong> <ul className="list-disc list-inside text-medium-text">{data.suggested_video_ideas.map((idea: string, i: number) => <li key={i}>{idea}</li>)}</ul></div>
                </div>
            );
        case 'audience_engagement':
             return (
                <div className="space-y-4 text-sm">
                    <ScoreDisplay scoreData={data.engagement_score} color="text-amber-400" />
                    <div><strong className="text-light-text">Tiềm năng CTR:</strong> <span className="text-medium-text">{data.ctr_potential_feedback}</span></div>
                    <div><strong className="text-light-text">Chiến lược CTA:</strong> <span className="text-medium-text">{data.cta_strategy_feedback}</span></div>
                    <div><strong className="text-light-text">Công thức tiêu đề vượt trội:</strong> <p className="text-medium-text italic bg-dark-bg p-2 rounded-md mt-1">"{data.superior_title_formula}"</p></div>
                    <div><strong className="text-light-text">Công thức thumbnail vượt trội:</strong> <p className="text-medium-text italic bg-dark-bg p-2 rounded-md mt-1">"{data.superior_thumbnail_formula}"</p></div>
                </div>
            );
        case 'monetization_potential':
             return (
                <div className="space-y-4 text-sm">
                    <ScoreDisplay scoreData={data.monetization_score} color="text-rose-400" />
                    <div><strong className="text-light-text">Các luồng kiếm tiền tiềm năng:</strong>
                    {data.monetization_streams.map((s: any, i: number) => <div key={i} className="mt-2 border-l-2 border-dark-border pl-2">
                        <p className="font-semibold">{s.stream}</p>
                        <p className="text-xs text-medium-text">{s.reason}</p>
                    </div>)}
                    </div>
                </div>
            );
        default:
            return <p>Không thể hiển thị kết quả.</p>;
    }
};

const ChannelOptimizer: React.FC = () => {
    const [step, setStep] = useState<Step>('input');
    const [channelUrl, setChannelUrl] = useState('');
    const [analysisStates, setAnalysisStates] = useState<Record<ModuleKey, { status: AnalysisStatus; error?: string; result?: any }>>({
        branding_impression: { status: 'idle' },
        content_strategy: { status: 'idle' },
        audience_engagement: { status: 'idle' },
        monetization_potential: { status: 'idle' },
    });
    
    const runAnalysis = async (moduleKey: ModuleKey) => {
        if (!process.env.API_KEY) { 
            setAnalysisStates(prev => ({...prev, [moduleKey]: { status: 'error', error: "API Key phải được cấu hình trong môi trường." }}));
            return;
        }

        setAnalysisStates(prev => ({ ...prev, [moduleKey]: { status: 'loading' } }));
        
        try {
            const module = ANALYSIS_MODULES.find(m => m.key === moduleKey);
            if (!module) throw new Error("Module không hợp lệ.");

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: module.prompt(channelUrl),
                config: { tools: [{ googleSearch: {} }] },
            });
            
            const text = response.text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
            const result = JSON.parse(text);
            setAnalysisStates(prev => ({ ...prev, [moduleKey]: { status: 'success', result } }));

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
            setAnalysisStates(prev => ({ ...prev, [moduleKey]: { status: 'error', error: `Phân tích thất bại. ${errorMessage}` } }));
        }
    };

    if (step === 'input') {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-dark-bg border border-dark-border rounded-xl p-8 text-center">
                    <form onSubmit={(e) => { e.preventDefault(); if (channelUrl.trim()) setStep('dashboard'); }}>
                        <WrenchIcon className="w-12 h-12 mx-auto text-dark-border mb-4"/>
                        <h2 className="text-2xl font-bold mb-2">Bảng Điều Khiển Tăng Trưởng Kênh</h2>
                        <p className="text-medium-text mb-6">Nhập URL kênh YouTube của bạn để mở khóa bảng điều khiển chiến lược do AI cung cấp.</p>
                        <input
                            type="url"
                            value={channelUrl}
                            onChange={(e) => setChannelUrl(e.target.value)}
                            placeholder="https://www.youtube.com/@tên-kênh-của-bạn"
                            className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
                            required
                        />
                        <button type="submit" className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-dark-border">
                            Mở Bảng Điều Khiển
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => setStep('input')} className="flex items-center gap-2 text-medium-text hover:text-light-text font-semibold transition-colors group">
                     <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>Phân tích kênh khác</span>
                </button>
                <p className="text-sm bg-dark-bg border border-dark-border px-3 py-1.5 rounded-md text-light-text truncate">{channelUrl}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ANALYSIS_MODULES.map(module => {
                    const state = analysisStates[module.key];
                    const Icon = module.icon;

                    return (
                        <div key={module.key} className="bg-dark-bg border border-dark-border rounded-xl p-6 flex flex-col">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="bg-dark-card p-3 rounded-lg border border-dark-border"><Icon className="w-6 h-6 text-sky-400"/></div>
                                <div>
                                    <h3 className="font-bold text-lg text-light-text">{module.title}</h3>
                                    <p className="text-sm text-medium-text">{module.description}</p>
                                </div>
                            </div>
                           
                            <div className="mt-auto pt-4 border-t border-dark-border/50">
                                {state.status === 'idle' && (
                                    <button onClick={() => runAnalysis(module.key)} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-lg">
                                        Chạy Phân Tích
                                    </button>
                                )}
                                {state.status === 'loading' && (
                                    <div className="text-center text-medium-text py-2">
                                        <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-sky-400 mx-auto"></div>
                                        <span className="text-xs mt-2 block">Đang phân tích...</span>
                                    </div>
                                )}
                                {state.status === 'error' && (
                                    <div className="text-center">
                                        <p className="text-xs text-red-400 mb-2">{state.error}</p>
                                        <button onClick={() => runAnalysis(module.key)} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg text-sm">
                                            Thử Lại
                                        </button>
                                    </div>
                                )}
                                {state.status === 'success' && state.result && (
                                    <div className="animate-fade-in">
                                        <ResultRenderer resultKey={module.key} data={state.result} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChannelOptimizer;
