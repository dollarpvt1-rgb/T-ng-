import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, UsersIcon, RocketIcon, TrophyIcon, ExternalLinkIcon, PencilIcon, BookOpenIcon } from '../../icons/Icons';

type Step = 'topic' | 'microNiches' | 'roadmap';

interface Competitor {
  channel_name: string;
  channel_url: string;
  estimated_subscribers: string;
}

interface MicroNiche {
  niche_name: string;
  description: string;
  opportunity_level: 'Cao' | 'Trung bình' | 'Thấp';
  competitors: Competitor[];
}

interface VideoIdea {
    video_number: number;
    title: string;
    strategy: string;
}

interface NicheFinderProps {
  onNavigate?: (toolId: string, data: any) => void;
}


const NicheFinder: React.FC<NicheFinderProps> = ({ onNavigate }) => {
    const [step, setStep] = useState<Step>('topic');
    const [topic, setTopic] = useState('');
    const [microNiches, setMicroNiches] = useState<MicroNiche[]>([]);
    const [selectedMicroNiche, setSelectedMicroNiche] = useState<MicroNiche | null>(null);
    const [roadmap, setRoadmap] = useState<VideoIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = () => {
        setStep('topic');
        setTopic('');
        setSelectedMicroNiche(null);
        setMicroNiches([]);
        setRoadmap([]);
        setError(null);
    };

    const handleBackToTopic = () => {
        setStep('topic');
        setMicroNiches([]);
        setError(null);
    };

    const handleBackToNiches = () => {
        setStep('microNiches');
        setRoadmap([]);
        setSelectedMicroNiche(null);
        setError(null);
    };

    const handleWriteScript = (videoIdea: VideoIdea) => {
        if (onNavigate) {
            onNavigate('script-pro', { idea: videoIdea.title });
        }
    };


    const findMicroNiches = async () => {
        if (!topic.trim()) {
            setError('Vui lòng nhập một chủ đề.');
            return;
        }
        if (!process.env.API_KEY) { 
            setError("API Key phải được cấu hình trong môi trường.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Với vai trò là một chuyên gia chiến lược YouTube, hãy phân tích chủ đề "${topic}" và tạo ra các "Ngách Siêu Nhỏ" (Micro-Niches) độc đáo.

            **Nhiệm vụ:**
            1.  **Phân tích 3 yếu tố:**
                *   **Đối tượng:** Xác định các nhóm khán giả khác nhau (ví dụ: người mới bắt đầu, chuyên gia, người bận rộn).
                *   **Góc tiếp cận:** Đề xuất các góc tiếp cận độc đáo (ví dụ: ngân sách thấp, thử thách 7 ngày, không cần dụng cụ).
                *   **Chủ đề con:** Liệt kê các chủ đề con phổ biến.
            2.  **Tạo khoảng 10 Ngách Siêu Nhỏ:** Kết hợp các yếu tố trên để tạo ra các ngách có độ cạnh tranh thấp nhưng tiềm năng cao.
            3.  **Do Thám Đối Thủ:** Với **MỖI** ngách siêu nhỏ, sử dụng Google Search để tìm 2-3 đối thủ hàng đầu. Cung cấp tên kênh, URL và số lượng người đăng ký ước tính của họ.
            4.  **Đánh giá Cơ hội:** Đưa ra mức độ cơ hội (Cao, Trung bình, Thấp) cho mỗi ngách.

            **QUAN TRỌNG:** Định dạng **TOÀN BỘ** phản hồi của bạn dưới dạng một đối tượng JSON hợp lệ duy nhất. **KHÔNG** bao gồm bất kỳ văn bản, giải thích, hay dấu markdown nào (như \`\`\`json) trước hoặc sau đối tượng JSON. Cấu trúc phải như sau:
            {
              "micro_niches": [
                {
                  "niche_name": "Tên ngách siêu nhỏ, ví dụ: 'Học guitar 5 phút cho người bận rộn'",
                  "description": "Giải thích ngắn gọn tại sao đây là một ngách tốt.",
                  "opportunity_level": "Cao" | "Trung bình" | "Thấp",
                  "competitors": [
                    {
                      "channel_name": "Tên kênh đối thủ",
                      "channel_url": "URL kênh đối thủ",
                      "estimated_subscribers": "Số người đăng ký ước tính, ví dụ: '~15k subs'"
                    }
                  ]
                }
              ]
            }`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                }
            });
            const text = response.text;
            const cleanedText = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
            const result = JSON.parse(cleanedText) as { micro_niches: MicroNiche[] };
            setMicroNiches(result.micro_niches);
            setStep('microNiches');
        } catch (err) {
            console.error(err);
            setError('Không thể tìm thấy ngách. Có thể chủ đề quá hẹp hoặc đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const findContentRoadmap = async (niche: MicroNiche) => {
        setSelectedMicroNiche(niche);
        if (!process.env.API_KEY) { 
            setError("API Key phải được cấu hình trong môi trường.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Là một nhà sản xuất nội dung YouTube dày dạn kinh nghiệm, hãy tạo một "Lộ Trình Nội Dung Khởi Đầu" cho một kênh mới trong ngách: "${niche.niche_name}".

            **Yêu cầu:**
            1. Đề xuất một lộ trình chi tiết cho 20 video đầu tiên.
            2. Các video này phải được sắp xếp theo một trình tự chiến lược để thu hút khán giả mục tiêu, xây dựng uy tín và khuyến khích đăng ký.
            3. Với mỗi video, cung cấp:
                *   \`video_number\`: Số thứ tự của video.
                *   \`title\`: Một tiêu đề hấp dẫn, chuẩn SEO.
                *   \`strategy\`: Giải thích ngắn gọn (1-2 câu) về mục đích chiến lược của video này trong lộ trình.
            
            **QUAN TRỌNG:** Định dạng TOÀN BỘ phản hồi của bạn dưới dạng một đối tượng JSON hợp lệ duy nhất. Cấu trúc phải như sau:
            {
              "roadmap": [
                {
                  "video_number": 1,
                  "title": "Tiêu đề video đầu tiên",
                  "strategy": "Mục đích của video này là..."
                }
              ]
            }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            roadmap: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        video_number: { type: 'INTEGER' },
                                        title: { type: 'STRING' },
                                        strategy: { type: 'STRING' }
                                    },
                                    required: ['video_number', 'title', 'strategy']
                                }
                            }
                        }
                    }
                }
            });
            const result = JSON.parse(response.text) as { roadmap: VideoIdea[] };
            setRoadmap(result.roadmap);
            setStep('roadmap');
        } catch (err) {
            setError('Không thể tạo lộ trình nội dung. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getOpportunityColor = (level: string) => {
        if (level === 'Cao') return 'text-emerald-400';
        if (level === 'Trung bình') return 'text-amber-400';
        return 'text-red-400';
    }
    
    const getOpportunityRingColor = (level: string) => {
        if (level === 'Cao') return 'hover:border-emerald-500';
        if (level === 'Trung bình') return 'hover:border-amber-500';
        return 'hover:border-red-500';
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 p-3 bg-dark-bg border border-dark-border rounded-lg">
                 <div className="flex items-center text-sm text-medium-text flex-wrap gap-x-2">
                    <button onClick={step !== 'topic' ? handleBackToTopic : undefined} disabled={step === 'topic' || isLoading} className={`font-semibold transition-colors ${step === 'topic' ? 'text-sky-400' : 'hover:text-light-text'}`}>Bước 1: Chủ đề</button>
                    <span className="mx-1">&rarr;</span>
                    <button onClick={step === 'roadmap' ? handleBackToNiches : undefined} disabled={step !== 'roadmap' || isLoading} className={`font-semibold transition-colors ${step === 'microNiches' ? 'text-sky-400' : ''} ${step === 'roadmap' ? 'hover:text-light-text' : 'cursor-default'}`}>Bước 2: Chọn Ngách</button>
                     <span className="mx-1">&rarr;</span>
                    <span className={`font-semibold ${step === 'roadmap' ? 'text-sky-400' : ''}`}>Bước 3: Lộ Trình</span>
                </div>
                {step !== 'topic' && 
                    <button onClick={handleReset} disabled={isLoading} className="text-sm font-semibold bg-dark-border px-3 py-1.5 rounded-md text-medium-text hover:text-light-text transition-colors disabled:opacity-50">
                        Làm lại từ đầu
                    </button>
                }
            </div>
             {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 animate-fade-in">{error}</div>}

            {isLoading && (
                <div className="text-center p-8 animate-fade-in">
                    <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-sky-400 mx-auto mb-4"></div>
                    <p className="font-semibold text-light-text">AI đang phân tích chiến lược...</p>
                    <p className="text-sm text-medium-text">Quá trình này có thể mất một chút thời gian.</p>
                </div>
            )}

            {!isLoading && step === 'topic' && (
                <div className="space-y-4 animate-fade-in max-w-lg mx-auto text-center">
                    <label className="block font-semibold text-lg text-light-text">Nhập một chủ đề rộng để tìm "ngách trong ngách"</label>
                     <p className="text-sm text-medium-text">Cung cấp một lĩnh vực bạn quan tâm, AI sẽ tìm ra những thị trường tiềm năng ít cạnh tranh nhất.</p>
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ví dụ: nấu ăn, marketing, du lịch, học guitar..." className="w-full bg-dark-bg border border-dark-border p-3 rounded-lg text-center"/>
                    <button onClick={findMicroNiches} disabled={!topic.trim()} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold p-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-dark-border disabled:cursor-not-allowed">
                        <SparklesIcon className="w-5 h-5"/>Tìm Cơ Hội Vàng
                    </button>
                </div>
            )}
            
            {!isLoading && step === 'microNiches' && (
                <div className="animate-fade-in">
                    <h3 className="font-bold text-xl mb-4 text-center">Đã tìm thấy <span className="text-sky-400">{microNiches.length}</span> Ngách Siêu Nhỏ cho chủ đề "{topic}"</h3>
                    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                        {microNiches.map(niche => (
                            <div key={niche.niche_name} className={`bg-dark-bg border border-dark-border p-5 rounded-lg transition-all duration-300 flex flex-col ${getOpportunityRingColor(niche.opportunity_level)}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg text-light-text flex-1 pr-4">{niche.niche_name}</h4>
                                    <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 ${getOpportunityColor(niche.opportunity_level)} bg-dark-card border border-dark-border`}>
                                        <TrophyIcon className="w-4 h-4" />
                                        Cơ hội: {niche.opportunity_level}
                                    </div>
                                </div>
                                <p className="text-sm text-medium-text mt-1 mb-4 border-l-2 border-dark-border pl-3">{niche.description}</p>
                                
                                <div className="bg-dark-card border border-dark-border rounded-md p-3 mb-4">
                                    <h5 className="flex items-center gap-2 text-sm font-semibold text-medium-text mb-2"><UsersIcon className="w-4 h-4"/>Đối Thủ Chính</h5>
                                    <div className="space-y-2">
                                        {niche.competitors.map(comp => (
                                            <div key={comp.channel_name} className="flex justify-between items-center text-xs">
                                                <a href={comp.channel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyan-400 hover:underline">
                                                    {comp.channel_name} <ExternalLinkIcon className="w-3 h-3"/>
                                                </a>
                                                <span className="text-light-text font-mono">{comp.estimated_subscribers}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => findContentRoadmap(niche)} className="w-full mt-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                    <RocketIcon className="w-5 h-5"/>Chọn & Lên Lộ Trình
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && step === 'roadmap' && selectedMicroNiche && (
                 <div className="animate-fade-in max-w-4xl mx-auto">
                    <div className="text-center mb-6">
                      <h3 className="font-bold text-xl">Lộ Trình 20 Video Khởi Đầu cho Ngách:</h3>
                      <p className="text-sky-400 font-semibold text-lg">"{selectedMicroNiche.niche_name}"</p>
                    </div>
                    <div className="space-y-4">
                         {roadmap.map(idea => (
                            <div key={idea.video_number} className="bg-dark-bg border border-dark-border p-5 rounded-lg">
                                <div className="flex gap-5 items-start">
                                    <div className="flex-shrink-0 bg-sky-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg mt-1">
                                        {idea.video_number}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-semibold text-light-text">{idea.title}</h4>
                                        <div className="flex items-start gap-2 text-sm text-medium-text mt-2 italic">
                                            <BookOpenIcon className="w-6 h-6 flex-shrink-0 text-cyan-400 not-italic mt-0.5"/>
                                            <p>
                                                <span className="font-semibold text-cyan-400 not-italic">Chiến lược: </span>
                                                {idea.strategy}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                 <div className="mt-4 pt-4 border-t border-dark-border/50">
                                    <button
                                        onClick={() => handleWriteScript(idea)}
                                        disabled={!onNavigate}
                                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:bg-dark-border disabled:cursor-not-allowed"
                                        title={!onNavigate ? "Chức năng điều hướng không khả dụng" : "Viết kịch bản cho video này"}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Viết Kịch Bản Với AI
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NicheFinder;