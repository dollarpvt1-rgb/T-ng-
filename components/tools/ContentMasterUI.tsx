import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, CopyIcon, ClipboardCheckIcon, PencilIcon, SendIcon, DownloadIcon } from '../icons/Icons';

// New constants for styles
const WRITING_STYLES = [
    'Chuyên nghiệp & Trang trọng',
    'Thân mật & Gần gũi',
    'Thuyết phục & Bán hàng',
    'Hấp dẫn & Kể chuyện',
    'Đơn giản & Dễ hiểu',
    'Tối ưu SEO',
    'Học thuật & Nghiên cứu',
    'Hài hước & Dí dỏm',
];

const ContentMasterUI: React.FC = () => {
    // State variables
    const [originalText, setOriginalText] = useState('');
    const [rewrittenText, setRewrittenText] = useState('');
    const [style, setStyle] = useState(WRITING_STYLES[0]);
    const [customRequest, setCustomRequest] = useState('');
    const [keywords, setKeywords] = useState('');
    const [refinementPrompt, setRefinementPrompt] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleRewrite = async () => {
        if (!originalText.trim()) {
            setError('Vui lòng nhập nội dung cần viết lại.');
            return;
        }
        if (!process.env.API_KEY) {
            setError("API Key không được cấu hình. Vui lòng thiết lập biến môi trường API_KEY.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setRewrittenText('');

        let prompt = `Bạn là một chuyên gia biên tập nội dung. Hãy viết lại đoạn văn bản sau đây theo phong cách "${style}".`;

        if (customRequest.trim()) {
            prompt += ` Ngoài ra, hãy tuân thủ yêu cầu đặc biệt sau: "${customRequest}".`;
        }
        
        if (style.includes('SEO') && keywords.trim()) {
            prompt += ` Hãy đảm bảo tối ưu hóa cho các từ khóa sau: "${keywords}".`;
        }
        prompt += ` Giữ nguyên ý nghĩa cốt lõi của văn bản gốc.\n\n**Văn bản gốc:**\n---\n${originalText}\n---\n\n**Văn bản viết lại:**`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setRewrittenText(response.text);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể viết lại nội dung. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefine = async () => {
        if (!rewrittenText || !refinementPrompt.trim()) return;

        setIsRefining(true);
        setError(null);

        const prompt = `Bạn là một biên tập viên AI. Văn bản hiện tại là:\n\n---\n${rewrittenText}\n---\n\nHãy chỉnh sửa văn bản trên dựa theo yêu cầu sau: "${refinementPrompt}".\n\nChỉ trả về TOÀN BỘ văn bản đã được cập nhật.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setRewrittenText(response.text);
            setRefinementPrompt('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể tinh chỉnh nội dung. ${errorMessage}`);
        } finally {
            setIsRefining(false);
        }
    };

    const handleCopy = () => {
        if (!rewrittenText) return;
        navigator.clipboard.writeText(rewrittenText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSaveAsTxt = () => {
        if (!rewrittenText) return;
        const blob = new Blob([rewrittenText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = originalText.substring(0, 20).replace(/\s+/g, '_').toLowerCase() || 'content_master_ai';
        link.download = `${filename}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Input Panel */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Nội dung gốc</h2>
                <textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    rows={8}
                    placeholder="Dán hoặc nhập văn bản của bạn ở đây..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue flex-grow"
                    disabled={isLoading}
                />
                <div className="mt-6 space-y-4">
                     <div>
                        <label htmlFor="style-select" className="block text-sm font-semibold text-medium-text mb-2">Chọn phong cách viết</label>
                        <select
                            id="style-select"
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            {WRITING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                     <div>
                        <label htmlFor="custom-request" className="block text-sm font-semibold text-medium-text mb-2">Thêm yêu cầu tùy chỉnh (tùy chọn)</label>
                        <textarea
                            id="custom-request"
                            value={customRequest}
                            onChange={(e) => setCustomRequest(e.target.value)}
                            rows={2}
                            placeholder="Ví dụ: 'nhấn mạnh vào lợi ích cho doanh nghiệp nhỏ', 'giữ giọng văn hài hước'..."
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm"
                            disabled={isLoading}
                        />
                     </div>
                     {style.includes('SEO') && (
                         <div className="animate-fade-in">
                             <label htmlFor="keywords-input" className="block text-sm font-semibold text-medium-text mb-2">Từ khóa SEO (cách nhau bằng dấu phẩy)</label>
                             <input
                                id="keywords-input"
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="ví dụ: công cụ AI, viết nội dung, marketing"
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5"
                                disabled={isLoading}
                             />
                         </div>
                     )}
                </div>
                <button
                    onClick={handleRewrite}
                    disabled={isLoading || !originalText.trim()}
                    className="w-full mt-6 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:bg-dark-border disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? 'Đang xử lý...' : 'Viết Lại & Tối Ưu Hóa'}
                </button>
                {error && <p className="mt-3 text-xs text-center text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
            </div>

            {/* Output Panel */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col">
                 <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                     <h2 className="text-xl font-bold">Kết quả tối ưu</h2>
                     <div className="flex items-center gap-2">
                         <button
                            onClick={handleSaveAsTxt}
                            disabled={!rewrittenText || isLoading || isRefining}
                            className="flex items-center gap-2 bg-dark-border hover:bg-emerald-600 text-light-text font-semibold py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50"
                         >
                            <DownloadIcon className="w-4 h-4" />
                            Lưu (.txt)
                         </button>
                         <button
                            onClick={handleCopy}
                            disabled={!rewrittenText || isLoading || isRefining}
                            className="flex items-center gap-2 bg-dark-border hover:bg-brand-blue text-light-text font-semibold py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50"
                         >
                            {isCopied ? <ClipboardCheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                            {isCopied ? 'Đã chép!' : 'Sao chép'}
                         </button>
                     </div>
                 </div>
                 <div className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text flex-grow min-h-[300px] overflow-y-auto relative">
                    { (isLoading || isRefining) && (
                        <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-10">
                             <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-brand-blue"></div>
                        </div>
                    )}
                    {!rewrittenText && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-medium-text">
                            <PencilIcon className="w-12 h-12 text-dark-border mb-4"/>
                            <h3 className="font-semibold text-light-text">Kết quả sẽ xuất hiện ở đây</h3>
                            <p className="text-sm">Nội dung được AI viết lại sẽ sẵn sàng để bạn sử dụng.</p>
                        </div>
                    )}
                    {rewrittenText && <pre className="whitespace-pre-wrap font-sans">{rewrittenText}</pre>}
                 </div>
                 {rewrittenText && !isLoading && (
                    <div className="mt-4 pt-4 border-t border-dark-border animate-fade-in">
                        <label htmlFor="refinement-prompt" className="block text-sm font-semibold text-medium-text mb-2">Phòng Tinh Chỉnh Tương Tác</label>
                        <div className="flex items-center gap-2">
                            <input
                                id="refinement-prompt"
                                type="text"
                                value={refinementPrompt}
                                onChange={(e) => setRefinementPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isRefining && handleRefine()}
                                placeholder="Yêu cầu chỉnh sửa, ví dụ: 'làm cho đoạn 2 ngắn hơn'..."
                                className="flex-grow bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-sm"
                                disabled={isRefining}
                            />
                            <button
                                onClick={handleRefine}
                                disabled={isRefining || !refinementPrompt.trim()}
                                className="bg-brand-blue hover:bg-blue-600 text-white p-2.5 rounded-lg disabled:bg-dark-border"
                                aria-label="Gửi yêu cầu tinh chỉnh"
                            >
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ContentMasterUI;