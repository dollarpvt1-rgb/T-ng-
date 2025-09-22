import React, { useState } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { CopyIcon, DownloadIcon, SparklesIcon, SendIcon } from '../icons/Icons';

const GOALS = [
    { id: 'improve', name: 'Cải thiện & Sửa lỗi'},
    { id: 'shorten', name: 'Rút gọn'},
    { id: 'expand', name: 'Mở rộng'},
    { id: 'change_tone', name: 'Thay đổi văn phong'},
    { id: 'seo', name: 'Tối ưu SEO'},
];

const TONES = [
    { id: 'professional', name: 'Chuyên nghiệp' },
    { id: 'friendly', name: 'Thân thiện' },
    { id: 'persuasive', name: 'Thuyết phục' },
    { id: 'humorous', name: 'Hài hước' },
    { id: 'empathetic', name: 'Đồng cảm' },
];

const ContentMasterUI: React.FC = () => {
    const [originalText, setOriginalText] = useState('');
    const [rewrittenText, setRewrittenText] = useState('');
    const [goal, setGoal] = useState(GOALS[0].id);
    const [tone, setTone] = useState(TONES[0].id);
    const [seoKeywords, setSeoKeywords] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // State cho tính năng chat
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const wordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const getSystemInstruction = () => "Bạn là một chuyên gia biên tập và copywriter bậc thầy. Nhiệm vụ của bạn là tạo mới hoặc viết lại văn bản được cung cấp theo hướng dẫn của người dùng, cải thiện chất lượng của nó trong khi vẫn giữ lại thông điệp cốt lõi. Luôn luôn chỉ trả về văn bản đã được viết lại hoặc tạo mới một cách đầy đủ. Không thêm bất kỳ lời nói đầu, lời giải thích hay câu thoại nào như 'Đây là phiên bản đã chỉnh sửa của bạn:'.";

    const constructUserPrompt = (text: string, currentGoal: string, currentTone: string, currentSeoKeywords: string) => {
        const selectedGoal = GOALS.find(g => g.id === currentGoal)?.name || 'Cải thiện & Sửa lỗi';
        const selectedTone = TONES.find(t => t.id === currentTone)?.name || 'Chuyên nghiệp';

        let instruction = `Mục tiêu: ${selectedGoal}.`;
        if (currentGoal === 'change_tone') {
            instruction += ` Hãy viết lại theo văn phong: ${selectedTone}.`;
        }
        if (currentGoal === 'seo') {
            instruction += ` Tối ưu hóa cho các từ khóa sau: "${currentSeoKeywords || 'không có'}".`;
        }
        
        return `Văn bản gốc:\n"""\n${text}\n"""\n\nHướng dẫn:\n${instruction}`;
    };

    const handleOptimize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originalText.trim()) {
            setError('Vui lòng nhập văn bản gốc để tối ưu hóa.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setRewrittenText('');
        setChatSession(null);
        setChatHistory([]);

        try {
            const userPrompt = constructUserPrompt(originalText, goal, tone, seoKeywords);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction: getSystemInstruction(),
                    temperature: 0.7,
                },
            });

            const initialText = response.text;
            setRewrittenText(initialText);

            // Khởi tạo phiên chat với ngữ cảnh ban đầu
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: [
                    { role: 'user', parts: [{ text: userPrompt }] },
                    { role: 'model', parts: [{ text: initialText }] }
                ],
                config: {
                    systemInstruction: getSystemInstruction(),
                }
            });
            setChatSession(chat);

        } catch (err) {
            console.error('Lỗi khi gọi Gemini API:', err);
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể tối ưu hóa nội dung. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim() || isChatLoading) return;
        
        const userMessage = chatMessage.trim();
        setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
        setChatMessage('');
        setIsChatLoading(true);
        setError(null);

        try {
            let currentChat = chatSession;
            // Nếu chưa có session, tạo mới
            if (!currentChat) {
                 const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                 currentChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: getSystemInstruction() }
                });
                setChatSession(currentChat);
            }

            const response: GenerateContentResponse = await currentChat.sendMessage({ message: userMessage });
            const updatedText = response.text;
            setRewrittenText(updatedText);

        } catch (err) {
            console.error('Lỗi khi gửi tin nhắn chat:', err);
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể thực hiện yêu cầu. ${errorMessage}`);
            setChatHistory(prev => prev.slice(0, -1));
            setChatMessage(userMessage);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleCopy = () => {
        if (!rewrittenText || isCopied) return;
        navigator.clipboard.writeText(rewrittenText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        });
    };

    const handleDownload = () => {
        if (!rewrittenText) return;
        const blob = new Blob([rewrittenText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `content-master-ai-optimized.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cột Input */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-6">
                <form onSubmit={handleOptimize} className="flex flex-col gap-6 h-full">
                    <div>
                        <h2 className="text-xl font-bold text-light-text mb-4">Văn Bản Gốc</h2>
                        <div className="relative">
                            <textarea
                                value={originalText}
                                onChange={(e) => setOriginalText(e.target.value)}
                                placeholder="Dán văn bản của bạn ở đây để có bản nháp đầu tiên..."
                                className="w-full h-64 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue transition-shadow resize-none"
                                disabled={isLoading || isChatLoading}
                            />
                            <span className="absolute bottom-3 right-3 text-xs text-medium-text bg-dark-bg px-2 py-1 rounded">
                                {wordCount(originalText)} từ
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-light-text mb-4">Tùy Chọn Tối Ưu Hóa (cho bản nháp đầu)</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="goal" className="block text-sm font-medium text-medium-text mb-2">Mục tiêu</label>
                                <select id="goal" value={goal} onChange={e => setGoal(e.target.value)} disabled={isLoading || isChatLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                                    {GOALS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            
                            {goal === 'change_tone' && (
                                <div className="animate-fade-in">
                                    <label htmlFor="tone" className="block text-sm font-medium text-medium-text mb-2">Văn phong</label>
                                    <select id="tone" value={tone} onChange={e => setTone(e.target.value)} disabled={isLoading || isChatLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                                        {TONES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {goal === 'seo' && (
                                <div className="animate-fade-in">
                                    <label htmlFor="seoKeywords" className="block text-sm font-medium text-medium-text mb-2">Từ khóa SEO (phân cách bằng dấu phẩy)</label>
                                    <input
                                        type="text"
                                        id="seoKeywords"
                                        value={seoKeywords}
                                        onChange={e => setSeoKeywords(e.target.value)}
                                        placeholder="Ví dụ: AI, marketing, nội dung"
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        disabled={isLoading || isChatLoading}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isChatLoading || !originalText.trim()}
                        className="w-full mt-auto bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-dark-border disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <SparklesIcon className="w-5 h-5" />
                        )}
                        <span>{isLoading ? 'Đang tạo bản nháp...' : 'Tạo Bản Nháp Đầu Tiên'}</span>
                    </button>
                </form>
            </div>

            {/* Cột Output & Chat */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-light-text">Trình Biên Tập AI</h2>
                    {rewrittenText && !isLoading && (
                        <div className="flex items-center gap-2">
                             <button onClick={handleCopy} disabled={isCopied} className="flex items-center gap-2 bg-dark-border hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-lg transition-all text-sm disabled:opacity-70">
                                <CopyIcon className="w-4 h-4" />
                                <span>{isCopied ? 'Đã sao chép!' : 'Sao chép'}</span>
                            </button>
                            <button onClick={handleDownload} className="flex items-center gap-2 bg-dark-border hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                                <DownloadIcon className="w-4 h-4" />
                                <span>Tải xuống</span>
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="relative flex-grow flex flex-col min-h-[300px]">
                    <div className="absolute inset-0 bg-dark-bg border border-dark-border rounded-lg p-4 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-medium-text">
                                <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-brand-blue mb-4"></div>
                                <p className="font-semibold">AI đang tinh chỉnh từng câu chữ...</p>
                            </div>
                        ) : (
                            <pre className="text-light-text whitespace-pre-wrap font-sans text-base leading-relaxed">
                                {rewrittenText || <span className="text-medium-text">Nội dung đã tối ưu hóa sẽ xuất hiện ở đây. Bắt đầu bằng cách tạo bản nháp hoặc ra lệnh trực tiếp trong khung chat bên dưới.</span>}
                            </pre>
                        )}
                    </div>
                    {rewrittenText && !isLoading && (
                         <span className="absolute bottom-3 right-3 text-xs text-medium-text bg-dark-card px-2 py-1 rounded z-10">
                            {wordCount(rewrittenText)} từ
                        </span>
                    )}
                </div>

                 {/* Khung chat chỉnh sửa */}
                <div className="mt-6 pt-6 border-t border-dark-border">
                    <div className="max-h-40 overflow-y-auto mb-4 space-y-3 pr-2">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className="flex">
                                {msg.role === 'user' && (
                                    <div className="ml-auto bg-brand-blue text-white rounded-lg py-2 px-4 max-w-sm animate-fade-in">
                                        {msg.text}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-dark-border rounded-lg py-2 px-4 inline-flex items-center gap-2">
                                    <span className="w-2 h-2 bg-medium-text rounded-full animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 bg-medium-text rounded-full animate-pulse delay-150"></span>
                                    <span className="w-2 h-2 bg-medium-text rounded-full animate-pulse delay-300"></span>
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Yêu cầu AI tạo mới hoặc chỉnh sửa..."
                            className="flex-grow bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue transition-shadow"
                            disabled={isChatLoading || isLoading}
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isChatLoading || isLoading || !chatMessage.trim()}
                            className="bg-brand-blue hover:bg-blue-600 text-white font-bold p-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:bg-dark-border disabled:cursor-not-allowed disabled:scale-100 flex-shrink-0"
                            aria-label="Gửi yêu cầu"
                        >
                            {isChatLoading ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <SendIcon className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContentMasterUI;