import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { DownloadIcon, SettingsIcon } from '../icons/Icons';

// QUAN TRỌNG: Hãy đảm bảo biến môi trường API_KEY đã được thiết lập.
// Trong môi trường thực tế, bạn sẽ không để lộ key này ở phía client.
// Đây chỉ là mục đích demo.
const API_KEY = process.env.API_KEY;

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 (Vuông)' },
  { value: '16:9', label: '16:9 (Màn ảnh rộng)' },
  { value: '9:16', label: '9:16 (Dọc)' },
  { value: '4:3', label: '4:3 (Phong cảnh)' },
  { value: '3:4', label: '3:4 (Chân dung)' },
];

const STYLES = [
  { value: 'photorealistic', label: 'Chân thực', prefix: 'photorealistic image, cinematic lighting, ultra-detailed,' },
  { value: 'anime', label: 'Anime', prefix: 'anime style, vibrant colors, detailed line art, by Makoto Shinkai,' },
  { value: 'digital-art', label: 'Nghệ thuật số', prefix: 'digital art, intricate details, vibrant, concept art,' },
  { value: 'fantasy', label: 'Tưởng tượng', prefix: 'fantasy art, epic, detailed, matte painting, mystical,' },
  { value: '3d', label: 'Mô hình 3D', prefix: '3D render, octane render, high detail, physically-based rendering,' },
  { value: 'cinematic', label: 'Điện ảnh', prefix: 'cinematic film still, dramatic lighting, shallow depth of field,' },
  { value: 'watercolor', label: 'Tranh màu nước', prefix: 'watercolor painting, soft brush strokes, blended colors,' },
  { value: 'vintage', label: 'Ảnh Cổ điển', prefix: 'vintage photograph, grainy film, sepia tones, 1970s style,' },
  { value: 'cyberpunk', label: 'Cyberpunk', prefix: 'cyberpunk style, neon lights, futuristic city, dystopian,' },
  { value: 'low-poly', label: 'Low Poly', prefix: 'low poly art, isometric view, vibrant color palette,' },
  { value: 'pixel-art', label: 'Pixel Art', prefix: 'pixel art, 16-bit, retro gaming style, detailed sprites,' },
  { value: 'none', label: 'Không có', prefix: '' },
];

const QUALITIES = [
  { value: 'standard', label: 'Tiêu chuẩn (1024px)', suffix: ', standard quality' },
  { value: 'hd', label: 'HD (2048px)', suffix: ', high detail, sharp focus' },
  { value: '4k', label: '4K', suffix: ', 4k resolution, ultra high detail, professional photography' },
];


const VisionCraftUI: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('photorealistic');
  const [quality, setQuality] = useState('hd');

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Vui lòng nhập mô tả cho hình ảnh.');
      return;
    }
    if (!API_KEY) {
      setError('Lỗi cấu hình: API Key chưa được cung cấp.');
      console.error("API_KEY is not set in environment variables.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const stylePrefix = STYLES.find(s => s.value === style)?.prefix || '';
      const qualitySuffix = QUALITIES.find(q => q.value === quality)?.suffix || '';
      const fullPrompt = `${stylePrefix} ${prompt}${qualitySuffix}`;

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        setGeneratedImage(imageUrl);
      } else {
        throw new Error('API không trả về hình ảnh nào.');
      }
    } catch (err) {
      console.error('Lỗi khi gọi Gemini API:', err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
      setError(`Không thể tạo ảnh. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    const filename = `${prompt.slice(0, 30).replace(/\s+/g, '_') || 'visioncraft-ai'}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 md:p-8">
      <form onSubmit={handleGenerateImage}>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ví dụ: Một chú mèo phi hành gia đang cưỡi ván trượt trên sao Hỏa..."
            className="flex-grow bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-brand-purple hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-dark-border disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              'Tạo Ảnh'
            )}
          </button>
        </div>

        <div className="border-t border-dark-border pt-4 mb-6">
          <div className="flex items-center gap-2 text-medium-text mb-4">
              <SettingsIcon className="w-5 h-5" />
              <h3 className="font-semibold text-light-text">Cài đặt nâng cao</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-medium-text mb-2">Tỷ lệ khung hình</label>
              <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} disabled={isLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                {ASPECT_RATIOS.map(ar => <option key={ar.value} value={ar.value}>{ar.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-medium-text mb-2">Phong cách</label>
              <select id="style" value={style} onChange={e => setStyle(e.target.value)} disabled={isLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-medium-text mb-2">Chất lượng</label>
              <select id="quality" value={quality} onChange={e => setQuality(e.target.value)} disabled={isLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
                {QUALITIES.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <div className="w-full max-w-2xl aspect-square bg-dark-bg rounded-lg flex items-center justify-center border-2 border-dashed border-dark-border overflow-hidden relative group">
          {isLoading && (
            <div className="text-center text-medium-text">
               <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-brand-blue mx-auto mb-4"></div>
              <p className="font-semibold">AI đang vẽ tác phẩm của bạn...</p>
              <p className="text-sm">Quá trình này có thể mất một vài phút.</p>
            </div>
          )}
          {!isLoading && generatedImage && (
            <>
              <img src={generatedImage} alt="Hình ảnh do AI tạo ra" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={handleDownloadImage}
                    className="flex items-center gap-2 bg-light-text text-dark-bg font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105"
                  >
                    <DownloadIcon className="w-5 h-5"/>
                    Tải Về
                  </button>
              </div>
            </>
          )}
          {!isLoading && !generatedImage && (
            <div className="text-center text-medium-text p-4">
              <p className="text-lg font-semibold">Kết quả của bạn sẽ xuất hiện ở đây</p>
              <p>Hãy mô tả ý tưởng của bạn và để AI biến nó thành hiện thực!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisionCraftUI;