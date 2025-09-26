import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon, PencilIcon } from '../../icons/Icons';

interface TopCompetitor {
    title: string;
}

interface KeywordAnalysis {
    user_intent: string;
    estimated_difficulty: 'Thấp' | 'Trung bình' | 'Cao';
    content_formats: string[];
    related_long_tail_keywords: string[];
    suggested_video_angles: string[];
    top_competitors: TopCompetitor[];
}

interface SubAnalysisResult {
    keyword: string;
    competitors: TopCompetitor[];
}

interface KeywordResearcherProps {
  onNavigateToOptimizer: (data: { keyword: string }) => void;
}

const KeywordResearcher: React.FC<KeywordResearcherProps> = ({ onNavigateToOptimizer }) => {
    const [keyword, setKeyword] = useState('');
    const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedLongTail, setSelectedLongTail] = useState<SubAnalysisResult | null>(null);
    const [isSubLoading, setIsSubLoading] = useState(false);

    const handleResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) {
            setError('Vui lòng nhập từ khóa.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setSelectedLongTail(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Thực hiện phân tích từ khóa YouTube toàn diện cho: "${keyword}".
            1.  **Phân tích cốt lõi:** Xác định ý định người dùng, độ khó ước tính ('Thấp', 'Trung bình', 'Cao'), định dạng nội dung phù hợp, 10 từ khóa đuôi dài liên quan và 3-5 góc video độc đáo.
            2.  **Bối cảnh cạnh tranh:** Sử dụng Google Search để tìm 3 video YouTube hàng đầu cho từ khóa này. Chỉ trích xuất tiêu đề của chúng.
            **Định dạng:** Phản hồi bằng một đối tượng JSON hợp lệ duy nhất. Cấu trúc phải là: { "user_intent": "...", "estimated_difficulty": "...", "content_formats": [...], "related_long_tail_keywords": [...], "suggested_video_angles": [...], "top_competitors": [ { "title": "..." } ] }`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                }
            });
            const cleanedText = response.text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
            setAnalysis(JSON.parse(cleanedText));
        } catch (err) {
            console.error(err);
            setError('Không thể nghiên cứu từ khóa. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLongTailClick = async (longTailKeyword: string) => {
        if (selectedLongTail?.keyword === longTailKeyword) {
            setSelectedLongTail(null);
            return;
        }
        
        setIsSubLoading(true);
        setSelectedLongTail({ keyword: longTailKeyword, competitors: [] });
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Sử dụng Google Search để tìm 3 video YouTube hàng đầu cho từ khóa: "${longTailKeyword}". Chỉ trả về tiêu đề. Định dạng phản hồi dưới dạng một đối tượng JSON duy nhất: { "competitors": [ { "title": "..." } ] }`;

            const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: prompt,
                 config: {
                    tools: [{ googleSearch: {} }],
                }
            });
            const cleanedText = response.text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
            const result = JSON.parse(cleanedText);
            setSelectedLongTail({ keyword: longTailKeyword, competitors: result.competitors });
        } catch (err) {
            console.error(err);
            setSelectedLongTail(null);
        } finally {
            setIsSubLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <form onSubmit={handleResearch} className="space-y-4 bg-dark-card border border-dark-border p-6 rounded-xl">
                    <label htmlFor="keyword-input" className="block text-lg font-semibold text-light-text">
                        Nhập từ khóa để khám phá mỏ vàng
                    </label>
                     <p className="text-sm text-medium-text">
                        Vượt xa các từ khóa đơn giản. Khám phá ý định người dùng, bối cảnh cạnh tranh và các góc tiếp cận độc đáo.
                    </p>
                    <input
                        id="keyword-input"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Ví dụ: 'học guitar online'..."
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !keyword.trim()}
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold p-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-dark-border transition-colors"
                    >
                        {isLoading ? 'Đang nghiên cứu...' : <><SparklesIcon className="w-5 h-5" /> Nghiên cứu</>}
                    </button>
                    {error && <p className="text-red-400 mt-2">{error}</p>}
                </form>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                 <h2 className="text-lg font-semibold mb-4 px-2">Báo cáo chiến lược</h2>
                 <div className="h-[75vh] overflow-y-auto pr-2">
                    {isLoading && <div className="text-center p-8">
                        <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-sky-400 mx-auto mb-4"></div>
                        <p className="font-semibold">AI đang phân tích dữ liệu...</p>
                    </div>}
                    {analysis && !isLoading && (
                        <div className="space-y-6 animate-fade-in p-2">
                            <h3 className="font-bold text-lg">Phân tích cho: "{keyword}"</h3>
                            <div>
                                <h4 className="font-semibold text-sky-400">Ý định người dùng</h4>
                                <p className="text-sm text-medium-text">{analysis.user_intent}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sky-400">Độ khó ước tính</h4>
                                <p className="text-sm text-medium-text">{analysis.estimated_difficulty}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sky-400">Đối thủ hàng đầu cho "{keyword}"</h4>
                                <ul className="list-decimal list-inside text-sm text-medium-text mt-1 space-y-1">
                                    {analysis.top_competitors.map((comp, i) => <li key={i}>{comp.title}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sky-400">Từ khóa đuôi dài (Bấm để xem đối thủ)</h4>
                                <div className="flex flex-col gap-2 mt-2">
                                    {analysis.related_long_tail_keywords.map(kw => (
                                        <div key={kw}>
                                            <button onClick={() => handleLongTailClick(kw)} className="w-full text-left bg-dark-bg border border-dark-border p-3 rounded-lg hover:bg-dark-border transition-colors text-sm font-medium">
                                                {kw}
                                            </button>
                                            {selectedLongTail?.keyword === kw && (
                                                <div className="bg-dark-bg border-l-4 border-sky-500 p-4 mt-2 rounded-r-lg animate-fade-in">
                                                    {isSubLoading ? (
                                                        <p className="text-xs text-medium-text">Đang tìm đối thủ...</p>
                                                    ) : (
                                                        <div>
                                                            <h5 className="font-semibold text-xs mb-2 text-light-text">Đối thủ cho "{kw}":</h5>
                                                            <ul className="list-decimal list-inside text-xs space-y-1 text-medium-text">
                                                                {selectedLongTail.competitors.length > 0 ? selectedLongTail.competitors.map((c, i) => <li key={i}>{c.title}</li>) : <li>Không tìm thấy đối thủ trực tiếp. Cơ hội lớn!</li>}
                                                            </ul>
                                                            <button onClick={() => onNavigateToOptimizer({ keyword: kw })} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors">
                                                                <PencilIcon className="w-4 h-4"/>
                                                                Phân Tích SEO & Lên Gói Chiến Thắng
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sky-400">Góc tiếp cận video đề xuất</h4>
                                 <ul className="list-disc list-inside text-sm text-medium-text mt-1 space-y-1">
                                    {analysis.suggested_video_angles.map(angle => <li key={angle}>{angle}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sky-400">Định dạng nội dung phù hợp</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {analysis.content_formats.map(format => <span key={format} className="text-xs bg-dark-bg border border-dark-border px-2 py-1 rounded-full">{format}</span>)}
                                </div>
                            </div>
                        </div>
                    )}
                     {!isLoading && !analysis && (
                        <p className="text-medium-text p-4 text-center">Kết quả phân tích từ khóa sẽ xuất hiện ở đây.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default KeywordResearcher;