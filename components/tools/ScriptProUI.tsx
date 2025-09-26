import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
    SparklesIcon, CopyIcon, VideoIcon, PencilIcon, DownloadIcon, 
    UsersIcon, BookOpenIcon, SitemapIcon, ClipboardCheckIcon, RocketIcon 
} from '../icons/Icons.js';
import { SubscriptionPlan } from '../../types.js';

// --- Interfaces ---
interface ScriptProUIProps {
  onNavigateToVideo: (toolId: string, data: any) => void;
  initialData?: { idea?: string };
  subscriptionPlan: SubscriptionPlan; // Thêm gói đăng ký
}

interface CharacterProfile {
  name: string;
  description: string;
  motivation: string; // User-editable
}

interface ScriptAnalysis {
  pacing: { analysis: string; suggestion: string };
  dialogue: { analysis: string; suggestion: string };
  structure: { analysis: string; suggestion: string };
}

interface ProductionAssets {
    logline?: string;
    synopsis?: string;
    shotlist?: string;
}

type ResultTab = 'script' | 'characters' | 'analysis';


// --- Constants for Dropdowns ---
const TARGET_FORMATS = [ 'Video YouTube', 'Video Ngắn (Shorts, Reels, TikTok)', 'Quảng Cáo (TVC, Online Ad)', 'Podcast', 'Thuyết Minh Phim/Tài Liệu', 'Kịch Bản Sân Khấu' ];
const STYLES = [ 'Kể chuyện (Storytelling)', 'Truyền cảm hứng (Inspirational)', 'Vlog', 'Hài Kịch (Comedy)', 'Lãng Mạn (Romance)', 'Hành Động (Action)', 'Phiêu Lưu (Adventure)', 'Kinh Dị (Horror)', 'Giật Gân (Thriller)', 'Khoa Học Viễn Tưởng (Sci-Fi)', 'Giả Tưởng (Fantasy)', 'Chính Kịch (Drama)', 'Bí Mật (Mystery)', 'Phim Tài Liệu (Documentary)', 'Hoạt Hình (Animation)', 'Lịch Sử (Historical)', 'Tội Phạm (Crime)', 'Nhạc Kịch (Musical)', 'Phim Noir (Film Noir)', 'Miền Tây (Western)', 'Sitcom (Hài kịch tình huống)', 'Phim Câm (Silent Film)' ];
const LANGUAGES = [ 'Tiếng Việt (Vietnamese)', 'Tiếng Anh (English)', 'Tiếng Nhật (Japanese)', 'Tiếng Hàn (Korean)', 'Tiếng Trung (Mandarin)', 'Tiếng Tây Ban Nha (Spanish)', 'Tiếng Pháp (French)', 'Tiếng Đức (German)', 'Tiếng Nga (Russian)', 'Tiếng Hindi (Hindi)' ];
const WRITING_LEVELS = [ 'Đơn giản (Simple)', 'Trung bình (Intermediate)', 'Nâng cao (Advanced)', 'Chuyên nghiệp (Professional)' ];


const ScriptProUI: React.FC<ScriptProUIProps> = ({ onNavigateToVideo, initialData, subscriptionPlan }) => {
    // Input states
    const [idea, setIdea] = useState('');
    const [format, setFormat] = useState(TARGET_FORMATS[0]);
    const [style, setStyle] = useState(STYLES[0]);
    const [length, setLength] = useState(10);
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [writingLevel, setWritingLevel] = useState(WRITING_LEVELS[1]);
    const [refinementPrompt, setRefinementPrompt] = useState('');

    // Result & UI states
    const [finalScript, setFinalScript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<ResultTab>('script');
    
    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);

    // Advanced Toolkit States
    const [characters, setCharacters] = useState<CharacterProfile[]>([]);
    const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
    const [isSyncingCharacters, setIsSyncingCharacters] = useState(false);
    
    const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const [productionAssets, setProductionAssets] = useState<ProductionAssets | null>(null);
    const [isLoadingAssets, setIsLoadingAssets] = useState<'logline' | 'shotlist' | null>(null);

    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    // --- Logic khóa tính năng ---
    const hasAdvancedAccess = subscriptionPlan === 'professional' || subscriptionPlan === 'team';

    useEffect(() => {
        if (initialData?.idea) setIdea(initialData.idea);
    }, [initialData]);

    const resetAdvancedTools = () => {
        setActiveTab('script');
        setCharacters([]);
        setScriptAnalysis(null);
        setProductionAssets(null);
    };
    
    const handleScanCharacters = async (script: string) => {
        setIsLoadingCharacters(true);
        setCharacters([]);
        const prompt = `Đọc kịch bản sau đây. Xác định tất cả các nhân vật có lời thoại. Với mỗi nhân vật, tạo một mô tả ngắn gọn (một câu) dựa trên hành động và lời nói của họ. Trả về kết quả dưới dạng một mảng JSON các đối tượng, mỗi đối tượng có khóa "name" và "description".
        Ví dụ: [{"name": "THÁM TỬ K", "description": "Một thám tử hoài nghi dựa vào các phương pháp cũ kỹ."}]
        Kịch bản:
        ---
        ${script}
        ---`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash', contents: prompt,
                 config: { responseMimeType: "application/json" }
            });
            const parsedCharacters = JSON.parse(response.text) as Omit<CharacterProfile, 'motivation'>[];
            setCharacters(parsedCharacters.map(c => ({...c, motivation: ''})));
        } catch (e) {
            console.error("Không thể quét nhân vật:", e);
        } finally {
            setIsLoadingCharacters(false);
        }
    };
    
    const generateScript = async () => {
        if (!process.env.API_KEY || !idea.trim()) {
            setError(process.env.API_KEY ? "Vui lòng nhập ý tưởng kịch bản." : "API Key không được cấu hình.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setFinalScript('');
        resetAdvancedTools();

        const prompt = `Là một nhà biên kịch chuyên nghiệp, hãy viết một kịch bản hoàn chỉnh dựa trên các thông số sau:
            **Ý Tưởng:** "${idea}"
            **Định dạng:** ${format}
            **Phong cách:** ${style}
            **Thời lượng:** ${length} phút
            **Ngôn ngữ:** ${language}
            **Trình độ viết:** ${writingLevel}
            **YÊU CẦU ĐỊNH DẠNG QUAN TRỌNG:** Sử dụng định dạng kịch bản tiêu chuẩn (TIÊU ĐỀ CẢNH, HÀNH ĐỘNG, NHÂN VẬT, LỜI THOẠI) và cấu trúc phù hợp với định dạng đã chọn.`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setFinalScript(response.text);
            handleScanCharacters(response.text); // Automatically scan characters after generation
        } catch (err) {
            setError(`Không thể tạo kịch bản. ${(err as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- All other handlers (refine, save, copy, etc.) ---
    const handleRefineScript = async () => {
        if (!refinementPrompt.trim() || !finalScript) return;
        setIsRefining(true);
        setError(null);
        const prompt = `Là một biên tập viên kịch bản, sửa đổi kịch bản sau đây dựa trên hướng dẫn: "${refinementPrompt}".
        **KỊCH BẢN GỐC:**\n---\n${finalScript}\n---
        Trả về TOÀN BỘ kịch bản đã được viết lại.`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setFinalScript(response.text);
            setRefinementPrompt('');
        } catch (err) {
            setError(`Không thể tinh chỉnh. ${(err as Error).message}`);
        } finally {
            setIsRefining(false);
        }
    };

    const handleCharacterMotivationChange = (index: number, motivation: string) => {
        const updatedCharacters = [...characters];
        updatedCharacters[index].motivation = motivation;
        setCharacters(updatedCharacters);
    };

    const handleSyncCharacters = async () => {
        setIsSyncingCharacters(true);
        setError(null);
        const prompt = `Là một biên tập viên kịch bản, đây là kịch bản gốc:\n---\n${finalScript}\n---\n
        Và đây là hồ sơ nhân vật được cập nhật:\n---\n${JSON.stringify(characters)}\n---\n
        Vui lòng viết lại toàn bộ kịch bản, đảm bảo lời thoại và hành động của mỗi nhân vật hoàn toàn nhất quán với hồ sơ mới của họ. Giữ nguyên cốt truyện và cấu trúc cảnh gốc. Chỉ trả về kịch bản đã được viết lại hoàn chỉnh.`;
         try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setFinalScript(response.text);
            setActiveTab('script'); // Switch back to script tab to see changes
        } catch (err) {
            setError(`Không thể đồng bộ hóa nhân vật. ${(err as Error).message}`);
        } finally {
            setIsSyncingCharacters(false);
        }
    };

    const handleAnalyzeScript = async () => {
        setIsLoadingAnalysis(true);
        setScriptAnalysis(null);
        const prompt = `Là một cố vấn kịch bản chuyên nghiệp, hãy phân tích kịch bản sau: \n---\n${finalScript}\n---\n
        Cung cấp phản hồi về 3 lĩnh vực: Nhịp độ (Pacing), Lời thoại (Dialogue), và Cấu trúc (Structure). Với mỗi lĩnh vực, đưa ra một phân tích ngắn gọn và một đề xuất có thể hành động để cải thiện.
        Trả về kết quả dưới dạng một đối tượng JSON: { "pacing": { "analysis": "...", "suggestion": "..." }, "dialogue": { ... }, "structure": { ... } }`;
         try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
            setScriptAnalysis(JSON.parse(response.text));
        } catch (err) {
             setError(`Không thể phân tích kịch bản. ${(err as Error).message}`);
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    const handleOptimizeByAnalysis = async () => {
        if (!scriptAnalysis || !finalScript) return;
        setIsOptimizing(true);
        setError(null);

        const prompt = `Là một biên tập viên kịch bản chuyên nghiệp. Đây là kịch bản gốc:
        --- KỊCH BẢN GỐC ---
        ${finalScript}
        --- KẾT THÚC KỊCH BẢN GỐC ---

        Và đây là những gợi ý cải thiện mà bạn đã đưa ra trước đó:
        --- GỢI Ý CẢI THIỆN ---
        ${JSON.stringify(scriptAnalysis, null, 2)}
        --- KẾT THÚC GỢI Ý ---

        Nhiệm vụ của bạn là viết lại TOÀN BỘ kịch bản, áp dụng một cách cẩn thận những gợi ý này để cải thiện nhịp độ, lời thoại và cấu trúc. Giữ nguyên cốt truyện và nhân vật cốt lõi. Chỉ trả về kịch bản hoàn chỉnh đã được viết lại.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setFinalScript(response.text);
            setActiveTab('script'); // Automatically switch to the script tab to show the result
        } catch (err) {
            setError(`Không thể tối ưu hóa. ${(err as Error).message}`);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleGenerateProdAssets = async (type: 'logline' | 'shotlist') => {
        setIsLoadingAssets(type);
        const prompt = type === 'logline'
            ? `Đọc kịch bản này:\n---\n${finalScript}\n---\n Tạo một logline hấp dẫn (1 câu) và một synopsis ngắn gọn (3-4 câu). Trả về dưới dạng JSON: { "logline": "...", "synopsis": "..." }`
            : `Là một trợ lý đạo diễn, đọc các dòng hành động của kịch bản này:\n---\n${finalScript}\n---\n Với mỗi cảnh, đề xuất một vài cảnh quay cơ bản (ví dụ: WIDE SHOT, CLOSE UP). Không đề xuất cho lời thoại. Trả về một chuỗi văn bản được định dạng đơn giản.`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', contents: prompt,
                config: { responseMimeType: type === 'logline' ? "application/json" : undefined }
            });
            if (type === 'logline') {
                const assets = JSON.parse(response.text);
                setProductionAssets(prev => ({...prev, ...assets}));
            } else {
                 setProductionAssets(prev => ({...prev, shotlist: response.text}));
            }
        } catch (err) {
             setError(`Không thể tạo tài sản sản xuất. ${(err as Error).message}`);
        } finally {
            setIsLoadingAssets(null);
        }
    };

    const handleSaveAsTxt = () => {
        if (!finalScript) return;
        const blob = new Blob([finalScript], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = idea.substring(0, 30).replace(/\s+/g, '_').toLowerCase() || 'kich_ban';
        link.download = `${filename}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCopy = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({...prev, [key]: true}));
        setTimeout(() => setCopiedStates(prev => ({...prev, [key]: false})), 2000);
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'script':
                return (
                    <>
                        <div className="mb-4 pb-4 border-b border-dark-border">
                            <h3 className="text-lg font-bold mb-2">Phòng Tinh Chỉnh AI</h3>
                            <textarea value={refinementPrompt} onChange={(e) => setRefinementPrompt(e.target.value)} placeholder="Yêu cầu AI chỉnh sửa kịch bản bên dưới..." rows={2} className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-sm" disabled={isRefining}/>
                            <button onClick={handleRefineScript} disabled={isRefining || !refinementPrompt.trim()} className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm disabled:bg-dark-border">
                                <SparklesIcon className="w-4 h-4" /> {isRefining ? 'Đang tinh chỉnh...' : 'Tinh Chỉnh Kịch Bản'}
                            </button>
                        </div>
                        <div className="flex-grow min-h-0">
                            <div className="bg-dark-bg border border-dark-border rounded-lg p-4 h-full overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-sm font-sans text-light-text">{finalScript}</pre>
                            </div>
                        </div>
                    </>
                );
            case 'characters':
                 return (
                    <div className="h-full overflow-y-auto">
                        <h3 className="text-lg font-bold mb-2">Trung Tâm Nhân Vật (Character Hub)</h3>
                        <p className="text-xs text-medium-text mb-4">AI đã tự động quét các nhân vật. Bạn có thể thêm chiều sâu/động lực cho họ, sau đó đồng bộ hóa để AI cập nhật lại toàn bộ kịch bản.</p>
                        {isLoadingCharacters ? <p>Đang quét nhân vật...</p> : (
                            <div className="space-y-4">
                                {characters.map((char, index) => (
                                    <div key={index} className="bg-dark-bg border border-dark-border p-4 rounded-lg">
                                        <p className="font-bold text-brand-blue">{char.name}</p>
                                        <p className="text-sm italic text-medium-text">"{char.description}"</p>
                                        <textarea
                                            value={char.motivation}
                                            onChange={e => handleCharacterMotivationChange(index, e.target.value)}
                                            placeholder={`Thêm tính cách, động lực, hoặc ghi chú...`}
                                            rows={2}
                                            className="w-full mt-2 bg-dark-card border border-dark-border rounded-lg p-2 text-sm"
                                        />
                                    </div>
                                ))}
                                <button onClick={handleSyncCharacters} disabled={isSyncingCharacters} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                                    <UsersIcon className="w-5 h-5"/> {isSyncingCharacters ? 'Đang đồng bộ...' : 'Đồng Bộ Hóa Vào Kịch Bản'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'analysis':
                return (
                    <div className="h-full overflow-y-auto space-y-6">
                        {/* Script Doctor */}
                        <div className="bg-dark-bg border border-dark-border p-4 rounded-lg">
                            <h3 className="text-lg font-bold mb-2">Cố Vấn Kịch Bản AI</h3>
                             <button onClick={handleAnalyzeScript} disabled={isLoadingAnalysis} className="w-full bg-brand-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm">
                                <BookOpenIcon className="w-4 h-4" /> {isLoadingAnalysis ? 'Đang phân tích...' : 'Phân Tích Kịch Bản'}
                            </button>
                            {scriptAnalysis && (
                                <div className="mt-4 space-y-3 text-sm animate-fade-in">
                                    {Object.entries(scriptAnalysis).map(([key, value]) =>(
                                         <div key={key}>
                                            <p className="font-bold capitalize text-light-text">{key}</p>
                                            <p className="text-medium-text"><strong className="text-gray-400">Phân tích:</strong> {value.analysis}</p>
                                            <p className="text-amber-300"><strong className="text-amber-400">Gợi ý:</strong> {value.suggestion}</p>
                                        </div>
                                    ))}
                                    <div className="pt-3 mt-3 border-t border-dark-border">
                                        <button 
                                            onClick={handleOptimizeByAnalysis} 
                                            disabled={isOptimizing || isLoadingAnalysis} 
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm disabled:bg-dark-border"
                                        >
                                            <SparklesIcon className="w-4 h-4"/>
                                            {isOptimizing ? 'Đang tối ưu hóa...' : 'Tối ưu kịch bản theo gợi ý'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Production Assistant */}
                        <div className="bg-dark-bg border border-dark-border p-4 rounded-lg">
                             <h3 className="text-lg font-bold mb-2">Trợ Lý Sản Xuất AI</h3>
                             <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleGenerateProdAssets('logline')} disabled={!!isLoadingAssets} className="w-full bg-brand-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm">
                                    {isLoadingAssets === 'logline' ? '...' : 'Tạo Logline & Tóm tắt'}
                                </button>
                                 <button onClick={() => handleGenerateProdAssets('shotlist')} disabled={!!isLoadingAssets} className="w-full bg-brand-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm">
                                    {isLoadingAssets === 'shotlist' ? '...' : 'Tạo Danh sách Cảnh quay'}
                                </button>
                             </div>
                             {(productionAssets?.logline || productionAssets?.synopsis) && (
                                <div className="mt-4 space-y-2 animate-fade-in">
                                    {productionAssets.logline && <div><h4 className="font-semibold">Logline:</h4><p className="text-sm p-2 bg-dark-card rounded-md">{productionAssets.logline}</p></div>}
                                    {productionAssets.synopsis && <div><h4 className="font-semibold">Tóm tắt:</h4><p className="text-sm p-2 bg-dark-card rounded-md">{productionAssets.synopsis}</p></div>}
                                </div>
                             )}
                             {productionAssets?.shotlist && (
                                 <div className="mt-4 space-y-2 animate-fade-in">
                                    <h4 className="font-semibold">Danh sách cảnh quay đề xuất:</h4>
                                    <div className="relative bg-dark-card p-2 rounded-md max-h-48 overflow-y-auto">
                                        <button onClick={() => handleCopy('shotlist', productionAssets.shotlist ?? '')} className="absolute top-2 right-2 p-1 bg-dark-border rounded-md">
                                            {copiedStates['shotlist'] ? <ClipboardCheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                                        </button>
                                        <pre className="text-xs whitespace-pre-wrap font-sans">{productionAssets.shotlist}</pre>
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>
                );
        }
    }


    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Control Panel */}
            <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col h-fit sticky top-24">
                <h2 className="text-xl font-bold mb-1">Phòng Điều Khiển Sáng Tạo</h2>
                <p className="text-sm text-medium-text mb-6">Tinh chỉnh các thông số để AI tạo ra kịch bản hoàn hảo cho bạn.</p>
                
                <div className="space-y-5">
                    <div>
                        <label htmlFor="idea" className="block text-sm font-semibold text-medium-text mb-2">Ý tưởng chính</label>
                        <textarea id="idea" rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Một thám tử hoài nghi phải hợp tác với một AI để giải quyết một vụ án mạng trong thế giới ảo..." className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                    </div>
                    <div>
                        <label htmlFor="format" className="block text-sm font-semibold text-medium-text mb-2">Viết cho</label>
                        <select id="format" value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                            {TARGET_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="style" className="block text-sm font-semibold text-medium-text mb-2">Phong cách</label>
                        <select id="style" value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="length" className="block text-sm font-semibold text-medium-text mb-2">Độ dài kịch bản: <span className="font-bold text-brand-blue">{length} phút</span></label>
                        <input id="length" type="range" min="1" max="120" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="language" className="block text-sm font-semibold text-medium-text mb-2">Ngôn ngữ</label>
                            <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="level" className="block text-sm font-semibold text-medium-text mb-2">Trình độ viết</label>
                            <select id="level" value={writingLevel} onChange={e => setWritingLevel(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                                {WRITING_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-dark-border">
                    <button onClick={generateScript} disabled={isLoading || !idea.trim()} className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-dark-border disabled:cursor-not-allowed">
                        <SparklesIcon className="w-5 h-5"/>{isLoading ? 'Đang viết...' : 'Tạo Kịch Bản'}
                    </button>
                    {error && <p className="mt-3 text-xs text-center text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
                </div>
            </div>

            {/* Result Panel */}
            <div className="lg:col-span-3 bg-dark-card border border-dark-border rounded-xl p-6">
                 {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-medium-text">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-brand-blue mb-4"></div>
                        <p className="font-semibold text-light-text">AI đang viết nên kiệt tác của bạn...</p>
                    </div>
                )}
                {!isLoading && !finalScript && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-medium-text">
                        <PencilIcon className="w-16 h-16 mx-auto mb-4 text-dark-border" />
                        <h3 className="text-lg font-bold text-light-text">Sân Khấu Của Bạn Đang Chờ</h3>
                        <p className="max-w-sm">Kịch bản và bộ công cụ nâng cao sẽ xuất hiện ở đây.</p>
                    </div>
                )}
                {!isLoading && finalScript && (
                    <div className="animate-fade-in h-full flex flex-col">
                        {/* --- Tab Navigation --- */}
                        <div className="border-b border-dark-border mb-4">
                            <nav className="flex -mb-px space-x-4" aria-label="Tabs">
                                <button onClick={() => setActiveTab('script')} className={`py-2 px-3 font-semibold text-sm rounded-t-lg ${activeTab === 'script' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-medium-text hover:text-light-text'}`}>Kịch Bản</button>
                                
                                <button onClick={() => hasAdvancedAccess ? setActiveTab('characters') : document.getElementById('pricing')?.scrollIntoView()} disabled={!hasAdvancedAccess} className={`relative group py-2 px-3 font-semibold text-sm rounded-t-lg flex items-center gap-1.5 ${activeTab === 'characters' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-medium-text'} ${!hasAdvancedAccess ? 'cursor-not-allowed opacity-60' : 'hover:text-light-text'}`}>
                                    Nhân Vật {!hasAdvancedAccess && <RocketIcon className="w-4 h-4 text-amber-400" />}
                                </button>
                                
                                <button onClick={() => hasAdvancedAccess ? setActiveTab('analysis') : document.getElementById('pricing')?.scrollIntoView()} disabled={!hasAdvancedAccess} className={`relative group py-2 px-3 font-semibold text-sm rounded-t-lg flex items-center gap-1.5 ${activeTab === 'analysis' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-medium-text'} ${!hasAdvancedAccess ? 'cursor-not-allowed opacity-60' : 'hover:text-light-text'}`}>
                                   Phân Tích & Sản Xuất {!hasAdvancedAccess && <RocketIcon className="w-4 h-4 text-amber-400" />}
                                </button>
                            </nav>
                        </div>

                        {/* --- Tab Content --- */}
                        <div className="flex-grow min-h-0">
                           {renderTabContent()}
                        </div>
                        
                        {/* --- Action Buttons --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-border">
                            <button onClick={() => { setFinalScript(''); resetAdvancedTools(); }} className="w-full bg-dark-border hover:bg-gray-600 text-light-text font-bold py-3 px-4 rounded-lg transition-colors">Viết mới</button>
                            <button onClick={() => handleCopy('script', finalScript)} className="w-full bg-dark-border hover:bg-brand-blue text-light-text font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                               <CopyIcon className="w-5 h-5"/> {copiedStates['script'] ? 'Đã chép!' : 'Sao chép'}
                            </button>
                            <button onClick={handleSaveAsTxt} className="w-full bg-dark-border hover:bg-emerald-600 text-light-text font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                               <DownloadIcon className="w-5 h-5"/> Lưu về (.txt)
                            </button>
                             <button onClick={() => onNavigateToVideo('echovid', { idea: finalScript })} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                               <VideoIcon className="w-5 h-5"/> Tạo Video
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScriptProUI;