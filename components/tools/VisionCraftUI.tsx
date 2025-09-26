// Fix: Replaced placeholder content with a functional React component for image generation.
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, DownloadIcon, ImageIcon } from '../icons/Icons';

// Define the styles for the dropdown
const STYLES = [
    { value: 'none', label: 'Không có (Mặc định)' },
    { value: 'Photorealistic', label: 'Tả thực' },
    { value: 'Cinematic', label: 'Điện ảnh' },
    { value: 'Digital Art', label: 'Nghệ thuật số' },
    { value: 'Anime', label: 'Hoạt hình (Anime)' },
    { value: '3D Model', label: 'Mô hình 3D' },
    { value: 'Pixel Art', label: 'Nghệ thuật Pixel' },
    { value: 'Watercolor', label: 'Màu nước' },
    { value: 'Oil Painting', label: 'Tranh sơn dầu' },
    { value: 'Minimalist', label: 'Tối giản' },
    { value: 'Line Art', label: 'Nghệ thuật đường nét' },
    { value: 'Cyberpunk', label: 'Cyberpunk' },
    { value: 'Fantasy Art', label: 'Nghệ thuật Tưởng tượng' },
    { value: 'Architectural', label: 'Kiến trúc' },
    { value: 'Isometric', label: 'Isometric' },
    { value: 'Vaporwave', label: 'Vaporwave' },
    { value: 'Steampunk', label: 'Steampunk' },
    { value: 'Abstract', label: 'Trừu tượng' },
    { value: 'Sticker Illustration', label: 'Minh hoạ Sticker' },
    { value: 'Vintage Photograph', label: 'Ảnh cổ điển' },
];


const VisionCraftUI: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('none'); // State for selected style
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Vui lòng nhập mô tả hình ảnh.');
            return;
        }
        if (!process.env.API_KEY) {
            setError("API Key không được cấu hình. Vui lòng thiết lập biến môi trường API_KEY.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        // Combine prompt with style
        const finalPrompt = style === 'none' ? prompt : `${prompt}, in the style of ${style}`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: finalPrompt, // Use the combined prompt
                config: {
                    numberOfImages,
                    aspectRatio,
                    outputMimeType: 'image/jpeg',
                },
            });

            const images = response.generatedImages.map(img => img.image.imageBytes);
            setGeneratedImages(images);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể tạo hình ảnh. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const downloadImage = (base64Image: string, index: number) => {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${base64Image}`;
        link.download = `visioncraft-${prompt.slice(0, 20).replace(/\s/g, '_')}-${index + 1}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Control Panel */}
            <div className="lg:col-span-1 bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Bảng Điều Khiển</h2>
                
                <div className="flex-grow space-y-6">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-semibold text-medium-text mb-2">
                            Mô tả (Prompt)
                        </label>
                        <textarea
                            id="prompt"
                            rows={5}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ví dụ: Một chú mèo phi hành gia dễ thương, đội mũ bảo hiểm thủy tinh, ngồi trên mặt trăng, nhìn ra các vì sao, nghệ thuật kỹ thuật số"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-medium-text mb-2">Cài đặt</h3>
                        <div className="space-y-4 bg-dark-bg border border-dark-border p-4 rounded-lg">
                             <div>
                                <label htmlFor="style-select" className="block text-xs font-medium text-light-text mb-2">Phong cách</label>
                                <select
                                    id="style-select"
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                >
                                    {STYLES.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                             </div>
                             <div>
                                <label htmlFor="num-images" className="block text-xs font-medium text-light-text mb-2">Số lượng ảnh: {numberOfImages}</label>
                                <input
                                    id="num-images"
                                    type="range"
                                    min="1"
                                    max="4"
                                    value={numberOfImages}
                                    onChange={(e) => setNumberOfImages(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-light-text mb-2">Tỷ lệ khung hình</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {aspectRatios.map(ratio => (
                                        <button
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio)}
                                            disabled={isLoading}
                                            className={`py-2 text-xs font-semibold rounded-md transition-colors ${aspectRatio === ratio ? 'bg-brand-blue text-white' : 'bg-dark-card hover:bg-dark-border'}`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:bg-dark-border disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {isLoading ? 'Đang tạo...' : 'Tạo Hình Ảnh'}
                    </button>
                    {error && <p className="mt-3 text-xs text-center text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
                </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[500px] lg:min-h-0">
                {isLoading && (
                    <div className="text-center text-medium-text">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-brand-blue mb-4"></div>
                        <p className="font-semibold text-light-text">AI đang vẽ nên kiệt tác của bạn...</p>
                        <p className="text-sm">Quá trình này có thể mất một chút thời gian.</p>
                    </div>
                )}

                {!isLoading && generatedImages.length === 0 && (
                     <div className="text-center text-medium-text">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-dark-border" />
                        <h3 className="text-lg font-bold text-light-text">Không Gian Sáng Tạo Của Bạn</h3>
                        <p className="max-w-sm">Hình ảnh được tạo ra sẽ xuất hiện ở đây. Hãy bắt đầu bằng cách nhập mô tả và nhấn nút "Tạo Hình Ảnh".</p>
                    </div>
                )}
                
                {!isLoading && generatedImages.length > 0 && (
                    <div className={`w-full h-full grid gap-4 ${
                        numberOfImages === 1 ? 'grid-cols-1' :
                        numberOfImages === 2 ? 'grid-cols-1 md:grid-cols-2' :
                        numberOfImages === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2'
                    }`}>
                        {generatedImages.map((img, index) => (
                             <div key={index} className="relative group rounded-lg overflow-hidden border border-dark-border">
                                <img
                                    src={`data:image/jpeg;base64,${img}`}
                                    alt={`Generated image ${index + 1} for prompt: ${prompt}`}
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => downloadImage(img, index)}
                                        className="flex items-center gap-2 bg-light-text text-dark-bg font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        Tải xuống
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisionCraftUI;