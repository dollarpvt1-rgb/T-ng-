import React, { useState, useEffect, useRef } from 'react';
// FIX: Import GenerateVideosOperation for correct typing and VideoIcon to replace FilmIcon.
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { SparklesIcon, DownloadIcon, PencilIcon, VideoIcon, LightbulbIcon, CheckCircleIcon } from '../icons/Icons';

interface Scene {
  scene_number: number;
  visual_prompt: string;
  voiceover: string;
}

type Step = 'idea' | 'script' | 'generating' | 'result';

const LOADING_MESSAGES = [
    "Phân tích kịch bản và các cảnh quay...",
    "Phân bổ tài nguyên GPU trên đám mây...",
    "Bắt đầu kết xuất các khung hình đầu tiên...",
    "AI đang lựa chọn góc quay điện ảnh...",
    "Thêm hiệu ứng và chuyển động...",
    "Đồng bộ hóa âm thanh và hình ảnh...",
    "Thực hiện các bước hoàn thiện cuối cùng...",
    "Gần xong rồi, video của bạn sắp ra mắt...",
];

// FIX: Add props interface to accept initial data from other tools.
interface EchoVidUIProps {
    initialData?: { idea?: string };
}


const EchoVidUI: React.FC<EchoVidUIProps> = ({ initialData }) => {
    const [step, setStep] = useState<Step>('idea');
    const [prompt, setPrompt] = useState('');
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const loadingIntervalRef = useRef<number | null>(null);
    const pollingTimeoutRef = useRef<number | null>(null);

    // FIX: Use initialData if provided.
    useEffect(() => {
        if (initialData?.idea) {
            setPrompt(initialData.idea);
        }
    }, [initialData]);

    // Cleanup timeouts and intervals on component unmount
    useEffect(() => {
        return () => {
            if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
            if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
        };
    }, []);

    const handleGenerateScript = async () => {
        if (!prompt.trim()) {
            setError('Vui lòng nhập ý tưởng video của bạn.');
            return;
        }
        if (!process.env.API_KEY) {
            setError("API Key không được cấu hình. Vui lòng thiết lập biến môi trường API_KEY.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const generationPrompt = `Với vai trò là một đạo diễn và nhà biên kịch AI, hãy biến ý tưởng video sau đây thành một kịch bản phân cảnh chi tiết: "${prompt}".

            **Yêu cầu:**
            1.  Tạo ra một kịch bản gồm 3 đến 5 cảnh (scenes).
            2.  Mỗi cảnh phải bao gồm:
                *   \`scene_number\`: Số thứ tự của cảnh.
                *   \`visual_prompt\`: Một mô tả hình ảnh cực kỳ chi tiết, sống động để AI tạo video có thể hiểu được (ví dụ: "Cận cảnh một giọt sương long lanh trên chiếc lá xanh mướt vào buổi sáng, ánh nắng mặt trời xuyên qua tán lá, tạo hiệu ứng bokeh lung linh").
                *   \`voiceover\`: Một câu lời thuyết minh ngắn gọn, súc tích cho cảnh đó.
            
            **QUAN TRỌNG:** Định dạng TOÀN BỘ phản hồi của bạn dưới dạng một đối tượng JSON hợp lệ duy nhất. KHÔNG bao gồm bất kỳ văn bản, giải thích, hay dấu markdown nào (như \`\`\`json) trước hoặc sau đối tượng JSON. Cấu trúc phải như sau:
            {
              "scenes": [
                {
                  "scene_number": 1,
                  "visual_prompt": "Mô tả hình ảnh chi tiết cho cảnh 1.",
                  "voiceover": "Lời thuyết minh cho cảnh 1."
                }
              ]
            }`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: generationPrompt,
                config: { responseMimeType: "application/json" }
            });
            
            const result = JSON.parse(response.text) as { scenes: Scene[] };
            setScenes(result.scenes);
            setStep('script');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể tạo kịch bản. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSceneChange = (index: number, field: 'visual_prompt' | 'voiceover', value: string) => {
        const updatedScenes = [...scenes];
        updatedScenes[index] = { ...updatedScenes[index], [field]: value };
        setScenes(updatedScenes);
    };

    // FIX: Correctly type the operation object and pass the full object for polling.
    const pollOperation = async (operationToPoll: GenerateVideosOperation, ai: GoogleGenAI) => {
        try {
            const operation = await ai.operations.getVideosOperation({ operation: operationToPoll });
            if (operation.done) {
                if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink) {
                    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    const blob = await videoResponse.blob();
                    setGeneratedVideoUrl(URL.createObjectURL(blob));
                    setStep('result');
                } else {
                    setError("Tạo video thành công nhưng không tìm thấy link tải. Vui lòng thử lại.");
                    setStep('script'); // Go back to script to try again
                }
                setIsLoading(false);
            } else {
                // Poll again after 10 seconds with the updated operation object
                pollingTimeoutRef.current = window.setTimeout(() => pollOperation(operation, ai), 10000);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Lỗi trong quá trình kiểm tra tiến độ. ${errorMessage}`);
            setIsLoading(false);
            setStep('script');
             if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        }
    };

    const handleGenerateVideo = async () => {
        if (!process.env.API_KEY) {
            setError("API Key không được cấu hình.");
            return;
        }
        
        const videoPrompt = scenes.map(s => s.visual_prompt).join('. ');
        if (!videoPrompt.trim()) {
            setError("Kịch bản hình ảnh trống. Vui lòng đảm bảo các cảnh có mô tả.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setStep('generating');
        
        let messageIndex = 0;
        loadingIntervalRef.current = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
            setLoadingMessage(LOADING_MESSAGES[messageIndex]);
        }, 3000);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let initialOperation = await ai.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt: videoPrompt,
                config: { numberOfVideos: 1 }
            });
            
            // FIX: Start polling with the full operation object, not just its name.
            pollOperation(initialOperation, ai);

        } catch (err) {
             const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể bắt đầu tạo video. ${errorMessage}`);
            setIsLoading(false);
            setStep('script');
             if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        }
    };

    const handleReset = () => {
        setStep('idea');
        setPrompt('');
        setScenes([]);
        setGeneratedVideoUrl(null);
        setError(null);
        setIsLoading(false);
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };

    const renderStepper = () => (
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-8">
            {(['Ý tưởng', 'Kịch bản', 'Hoàn thiện'] as const).map((label, index) => {
                const currentStepIndex = step === 'idea' ? 0 : step === 'script' ? 1 : 2;
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;

                return (
                    <React.Fragment key={label}>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                isCompleted ? 'bg-emerald-500' : isActive ? 'bg-brand-blue' : 'bg-dark-border'
                            }`}>
                                {isCompleted ? <CheckCircleIcon className="w-5 h-5 text-white"/> : <span className="font-bold text-white">{index + 1}</span>}
                            </div>
                            <span className={`font-semibold hidden sm:inline ${isActive || isCompleted ? 'text-light-text' : 'text-medium-text'}`}>{label}</span>
                        </div>
                        {index < 2 && <div className={`flex-1 h-1 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-dark-border'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
    
    return (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
            {renderStepper()}

            {error && (
                <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>
            )}
            
            {step === 'idea' && (
                 <div className="text-center">
                    <LightbulbIcon className="w-12 h-12 mx-auto text-dark-border mb-4"/>
                    <h2 className="text-xl font-bold mb-2">Bắt đầu với một ý tưởng</h2>
                    <p className="text-medium-text mb-6">Mô tả video bạn muốn tạo, AI sẽ lo phần còn lại.</p>
                    <textarea
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ví dụ: một video ngắn giới thiệu vẻ đẹp của Hà Nội về đêm, với những cảnh quay đường phố lung linh và âm thanh nhộn nhịp"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        disabled={isLoading}
                    />
                    <button onClick={handleGenerateScript} disabled={isLoading || !prompt.trim()} className="w-full mt-4 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-dark-border disabled:cursor-not-allowed">
                        <SparklesIcon className="w-5 h-5"/>{isLoading ? 'Đang suy nghĩ...' : 'Tạo Kịch Bản'}
                    </button>
                </div>
            )}

            {step === 'script' && (
                <div>
                    <h2 className="text-xl font-bold mb-2">Tinh chỉnh Kịch bản & Phân cảnh</h2>
                    <p className="text-medium-text mb-6">Bạn có thể chỉnh sửa mô tả hình ảnh hoặc lời thoại để video đúng ý bạn nhất.</p>
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {scenes.map((scene, index) => (
                            <div key={scene.scene_number} className="bg-dark-bg border border-dark-border p-4 rounded-lg">
                                <h3 className="font-bold text-brand-blue mb-2">Cảnh {scene.scene_number}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold text-medium-text">Mô tả hình ảnh (cho AI)</label>
                                        <textarea value={scene.visual_prompt} onChange={e => handleSceneChange(index, 'visual_prompt', e.target.value)} rows={3} className="w-full mt-1 bg-dark-card border border-dark-border rounded-md p-2 text-sm"/>
                                    </div>
                                     <div>
                                        <label className="text-xs font-semibold text-medium-text">Lời thuyết minh (Voice-over)</label>
                                        <textarea value={scene.voiceover} onChange={e => handleSceneChange(index, 'voiceover', e.target.value)} rows={2} className="w-full mt-1 bg-dark-card border border-dark-border rounded-md p-2 text-sm"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                     <button onClick={handleGenerateVideo} disabled={isLoading} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-dark-border">
                        {/* FIX: Use VideoIcon instead of non-existent FilmIcon */}
                        <VideoIcon className="w-5 h-5"/>{isLoading ? 'Đang xử lý...' : 'Tạo Video'}
                    </button>
                </div>
            )}
            
            {step === 'generating' && (
                <div className="text-center p-8 min-h-[300px] flex flex-col justify-center items-center">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-brand-blue mb-6"></div>
                    <h2 className="text-xl font-bold text-light-text mb-2">AI đang dựng phim...</h2>
                    <p className="text-medium-text max-w-sm">{loadingMessage}</p>
                    <p className="text-xs text-medium-text mt-4">(Quá trình này có thể mất vài phút, vui lòng không đóng cửa sổ này)</p>
                </div>
            )}

            {step === 'result' && generatedVideoUrl && (
                 <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">Video của bạn đã sẵn sàng!</h2>
                    <video src={generatedVideoUrl} controls className="w-full rounded-lg border border-dark-border mb-4 aspect-video"></video>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href={generatedVideoUrl} download={`echovid-${Date.now()}.mp4`} className="w-full flex-1 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <DownloadIcon className="w-5 h-5"/>Tải Video
                        </a>
                        <button onClick={handleReset} className="w-full flex-1 bg-dark-border hover:bg-gray-600 text-light-text font-bold py-3 px-6 rounded-lg transition-colors">
                            Tạo video khác
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EchoVidUI;