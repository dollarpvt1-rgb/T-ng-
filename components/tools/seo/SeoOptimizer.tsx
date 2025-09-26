import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CopyIcon, SparklesIcon, ChartIcon, TargetIcon, EyeIcon, InfinityIcon, ImageIcon, DownloadIcon } from '../../icons/Icons';

// --- Interfaces for data structure ---
interface Competitor {
  title: string;
  thumbnail_description: string;
  views: string;
  channel_name: string;
}

interface WinningPackage {
  strategy_name: string;
  strategy_explanation: string;
  title: string;
  thumbnail_idea: string;
  ctr_score: number;
  description: string;
  tags: string[];
}

interface AnalysisResult {
  competitive_analysis: Competitor[];
  winning_packages: WinningPackage[];
}

interface SeoOptimizerProps {
  initialData?: { keyword?: string };
}

type Step = 'input' | 'loading' | 'results';

const STRATEGY_ICONS: { [key: string]: React.FC<any> } = {
  'Tối Ưu Hóa Trực Diện': TargetIcon,
  'Direct Optimization': TargetIcon,
  'Góc Tiếp Cận "Tò Mò"': EyeIcon,
  'Curiosity-Driven Approach': EyeIcon,
  'Giá Trị Dài Hạn': InfinityIcon,
  'Evergreen Value': InfinityIcon,
};

const STRATEGY_COLORS: { [key: string]: string } = {
  'Tối Ưu Hóa Trực Diện': 'border-sky-500',
  'Direct Optimization': 'border-sky-500',
  'Góc Tiếp Cận "Tò Mò"': 'border-amber-500',
  'Curiosity-Driven Approach': 'border-amber-500',
  'Giá Trị Dài Hạn': 'border-emerald-500',
  'Evergreen Value': 'border-emerald-500',
};


const SeoOptimizer: React.FC<SeoOptimizerProps> = ({ initialData }) => {
    const [videoIdea, setVideoIdea] = useState('');
    const [step, setStep] = useState<Step>('input');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
    
    useEffect(() => {
        if (initialData?.keyword) {
            setVideoIdea(initialData.keyword);
        }
    }, [initialData]);

    const handleCopy = (key: string, textToCopy: string) => {
        if (copiedStates[key]) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedStates(prev => ({ ...prev, [key]: true }));
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [key]: false }));
            }, 2500);
        });
    };

    const handleReset = () => {
        setStep('input');
        setVideoIdea(initialData?.keyword || '');
        setResult(null);
        setError(null);
        setExpandedPackage(null);
    };

    const handleOptimize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoIdea.trim()) {
            setError('Vui lòng nhập ý tưởng video hoặc tiêu đề.');
            return;
        }
        if (!process.env.API_KEY) {
            setError("API Key phải được cấu hình trong môi trường.");
            return;
        }

        setStep('loading');
        setError(null);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `As a world-class YouTube Click-Through Rate (CTR) and SEO strategist, perform a comprehensive analysis for the following video idea: "${videoIdea}".

            **CRITICAL REQUIREMENT: LANGUAGE ADAPTATION**
            1.  First, **detect the language** of the user's video idea provided above.
            2.  **ALL of your output**—including strategy names (e.g., translate 'Direct Optimization' into the detected language), explanations, titles, thumbnail ideas, descriptions, and tags—**MUST be in the SAME language you detected**. For example, if the idea is in Japanese, the entire JSON response must be in Japanese.

            **Tasks:**
            1.  **Competitive Analysis:** Use Google Search to find the top 3 YouTube videos ranking for this idea. For each, extract: title, a brief description of their thumbnail, estimated views, and channel name.
            2.  **Generate 3 "Winning Packages":** Based on the analysis, create 3 unique SEO/CTR packages, each with a different strategy:
                *   **Package 1: Direct Optimization:** Clear, SEO-focused title. Direct, easy-to-understand thumbnail.
                *   **Package 2: Curiosity-Driven Approach:** Title that creates an information gap. Thumbnail that is intriguing, shocking, or asks a question.
                *   **Package 3: Evergreen Value:** "Ultimate Guide," "Secrets of," "Common Mistakes" style title. Clean, professional thumbnail focusing on text.
            3.  **Package Details:** Each package must include: strategy name, a brief explanation, title, thumbnail idea, a potential CTR score (1-10), a full video description, and a list of tags (max 500 characters).

            **VERY IMPORTANT: FORMATTING**
            Format your **ENTIRE** response as a single, valid JSON object. Do **NOT** include any text, explanations, or markdown fences (like \`\`\`json) before or after the JSON object. The structure must be exactly as follows:
            {
              "competitive_analysis": [
                { "title": "...", "thumbnail_description": "...", "views": "...", "channel_name": "..." }
              ],
              "winning_packages": [
                { "strategy_name": "Direct Optimization", "strategy_explanation": "...", "title": "...", "thumbnail_idea": "...", "ctr_score": 8, "description": "...", "tags": ["...", "..."] }
              ]
            }`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });

            const text = response.text;
            const cleanedText = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
            const parsedResult: AnalysisResult = JSON.parse(cleanedText);

            // Sắp xếp các gói theo điểm CTR từ cao đến thấp
            parsedResult.winning_packages.sort((a, b) => b.ctr_score - a.ctr_score);
            
            setResult(parsedResult);
            setStep('results');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể phân tích. ${errorMessage}`);
            setStep('input');
        }
    };

    if (step === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-medium-text">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-sky-500 mb-4"></div>
                <p className="font-semibold text-light-text">AI đang phân tích đối thủ & xây dựng chiến lược...</p>
                <p className="text-sm">Quá trình này có thể mất một chút thời gian.</p>
            </div>
        );
    }
    
    if (step === 'results' && result) {
        return (
            <div className="animate-fade-in space-y-8">
                 <div>
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl md:text-2xl font-bold text-light-text line-clamp-2">Phân tích cho: "{videoIdea}"</h2>
                         <button onClick={handleReset} className="text-sm flex-shrink-0 font-semibold bg-dark-border px-4 py-2 rounded-md text-medium-text hover:text-light-text transition-colors">
                            Thử Lại
                         </button>
                    </div>
                   
                    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Bối Cảnh Cạnh Tranh</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {result.competitive_analysis.map((comp, i) => (
                                <div key={i} className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                                    <p className="font-semibold text-light-text text-sm mb-2 line-clamp-2">{comp.title}</p>
                                    <p className="text-xs text-medium-text mb-3"><span className="font-semibold text-light-text">{comp.channel_name}</span> - {comp.views}</p>
                                    <div className="flex items-start gap-2 text-xs text-medium-text border-l-2 border-dark-border pl-2">
                                        <ImageIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                                        <span><span className="font-semibold text-light-text">Thumbnail:</span> {comp.thumbnail_description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-light-text text-center mb-6">Đề Xuất 3 Gói Chiến Thắng</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {result.winning_packages.map((pkg) => {
                            const strategyKey = Object.keys(STRATEGY_ICONS).find(key => pkg.strategy_name.includes(key)) || pkg.strategy_name;
                            const Icon = STRATEGY_ICONS[strategyKey] || SparklesIcon;
                            const borderColor = STRATEGY_COLORS[strategyKey] || 'border-dark-border';
                            const isExpanded = expandedPackage === pkg.strategy_name;

                            return (
                                <div key={pkg.strategy_name} className={`bg-dark-card border-2 ${isExpanded ? borderColor : 'border-dark-border'} rounded-xl p-5 flex flex-col space-y-4`}>
                                    <div className="text-center">
                                        <Icon className="w-8 h-8 mx-auto mb-2 text-sky-400"/>
                                        <h3 className="text-lg font-bold">{pkg.strategy_name}</h3>
                                        <p className="text-xs text-medium-text h-8">{pkg.strategy_explanation}</p>
                                    </div>
                                    <div className="text-center bg-dark-bg p-3 rounded-lg border border-dark-border">
                                        <span className="text-xs font-semibold text-medium-text">TIỀM NĂNG CTR</span>
                                        <p className="text-3xl font-extrabold text-sky-400">{pkg.ctr_score}<span className="text-lg">/10</span></p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Tiêu đề đề xuất:</h4>
                                        <p className="text-sm bg-dark-bg p-3 rounded-md border border-dark-border">{pkg.title}</p>
                                    </div>
                                     <div>
                                        <h4 className="font-semibold text-sm mb-1">Ý tưởng Thumbnail:</h4>
                                        <p className="text-sm bg-dark-bg p-3 rounded-md border border-dark-border">{pkg.thumbnail_idea}</p>
                                    </div>
                                    <button onClick={() => setExpandedPackage(isExpanded ? null : pkg.strategy_name)} className="w-full text-sm font-semibold bg-dark-border hover:bg-sky-500 p-2.5 rounded-lg transition-colors">
                                        {isExpanded ? 'Ẩn chi tiết' : 'Xem Chi Tiết & Sao Chép'}
                                    </button>

                                    {isExpanded && (
                                        <div className="animate-fade-in space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-sm mb-1">Mô tả</h4>
                                                <div className="relative bg-dark-bg p-3 rounded-md border border-dark-border">
                                                    <button onClick={() => handleCopy(`desc_${pkg.strategy_name}`, pkg.description)} className="absolute top-2 right-2 text-xs bg-dark-border hover:bg-brand-blue p-1.5 rounded-md">{copiedStates[`desc_${pkg.strategy_name}`] ? 'Đã chép' : 'Chép'}</button>
                                                    <pre className="text-xs text-medium-text whitespace-pre-wrap font-sans">{pkg.description}</pre>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm mb-1">Thẻ Tags</h4>
                                                 <div className="relative bg-dark-bg p-3 rounded-md border border-dark-border">
                                                    <button onClick={() => handleCopy(`tags_${pkg.strategy_name}`, pkg.tags.join(', '))} className="absolute top-2 right-2 text-xs bg-dark-border hover:bg-brand-blue p-1.5 rounded-md">{copiedStates[`tags_${pkg.strategy_name}`] ? 'Đã chép' : 'Chép'}</button>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {pkg.tags.map(tag => <span key={tag} className="text-xs bg-dark-card text-cyan-300 px-2 py-1 rounded-full border border-dark-border">{tag}</span>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 md:p-8 text-center">
                <form onSubmit={handleOptimize}>
                    <ChartIcon className="w-12 h-12 mx-auto text-dark-border mb-4"/>
                    <label htmlFor="video-idea" className="block text-xl md:text-2xl font-bold text-light-text mb-2">
                        Trở thành Bậc Thầy SEO YouTube
                    </label>
                    <p className="text-medium-text mb-6">Nhập ý tưởng video (bất kỳ ngôn ngữ nào), AI sẽ phân tích đối thủ và đưa ra 3 chiến lược để bạn thống trị kết quả tìm kiếm.</p>
                    <textarea
                        id="video-idea"
                        rows={3}
                        value={videoIdea}
                        onChange={(e) => setVideoIdea(e.target.value)}
                        placeholder="Ví dụ: cách làm bánh mì tại nhà, review iPhone 15, hướng dẫn thiền cho người mới bắt đầu..."
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                        type="submit"
                        disabled={!videoIdea.trim()}
                        className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-dark-border"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Tối ưu hóa
                    </button>
                    {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default SeoOptimizer;
