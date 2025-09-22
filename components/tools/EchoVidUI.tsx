import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { DownloadIcon, VideoIcon, SparklesIcon, MicIcon } from '../icons/Icons';
import { useAPIKey } from '../../contexts/APIKeyContext';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';


const LOADING_MESSAGES = [
  "Đang khởi tạo mô hình AI...",
  "Phân tích prompt của bạn...",
  "Tập hợp các tài sản video...",
  "Bắt đầu quá trình render...",
  "Kết hợp các cảnh quay...",
  "Áp dụng hiệu ứng hình ảnh...",
  "Thêm các chi tiết cuối cùng...",
  "Sắp xong rồi, vui lòng chờ chút nữa...",
];

const VIDEO_STYLES = [
  { value: 'none', label: 'Mặc định', prefix: '' },
  { value: 'cinematic', label: 'Điện ảnh', prefix: 'cinematic film style, dramatic lighting, epic scope, high detail, masterpiece, ' },
  { value: 'anime', label: 'Hoạt hình Anime', prefix: 'anime style, vibrant colors, detailed line art, japanese animation, ' },
  { value: 'documentary', label: 'Phim tài liệu', prefix: 'documentary style, realistic, natural lighting, steady cam, ' },
  { value: 'hyperrealistic', label: 'Siêu thực', prefix: 'hyperrealistic, ultra-detailed, photorealistic, 8k, sharp focus, ' },
  { value: 'vintage', label: 'Phim Cổ điển', prefix: 'vintage film look, 1970s style, grainy, sepia tones, retro, ' },
  { value: 'fantasy', label: 'Tưởng tượng', prefix: 'fantasy art style, mystical, magical, epic, glowing elements, ' },
  { value: '3d_model', label: 'Mô hình 3D', prefix: '3D render, octane render, unreal engine, smooth animation, ' },
];

const VIDEO_MODELS = [
  { id: 'veo-2.0-generate-001', name: 'Veo 2 (Đề xuất)', description: 'Mô hình mạnh mẽ, cân bằng giữa tốc độ và chất lượng.' },
  { id: 'veo-3-preview-001', name: 'Veo 3 (Thử nghiệm & Yêu cầu quyền truy cập)', description: 'Chất lượng điện ảnh thế hệ tiếp theo. Yêu cầu API key của bạn phải được Google đưa vào danh sách cho phép (allowlist).' },
];

const BACKGROUND_MUSIC = [
    { id: 'none', name: 'Không có nhạc nền', url: ''},
    { id: 'epic-cinematic', name: 'Sử thi & Hùng tráng', url: 'https://cdn.pixabay.com/audio/2023/10/11/audio_51790a3b5a.mp3'},
    { id: 'lofi-chill', name: 'Lo-fi & Thư giãn', url: 'https://cdn.pixabay.com/audio/2022/05/23/audio_b793153b4b.mp3'},
    { id: 'upbeat-corporate', name: 'Upbeat & Doanh nghiệp', url: 'https://cdn.pixabay.com/audio/2023/02/23/audio_8027f6bac6.mp3'},
    { id: 'ambient-documentary', name: 'Ambient & Phim tài liệu', url: 'https://cdn.pixabay.com/audio/2024/02/09/audio_d3710207a1.mp3'},
    { id: 'suspenseful-dramatic', name: 'Hồi hộp & Kịch tính', url: 'https://cdn.pixabay.com/audio/2023/11/17/audio_894170c2a8.mp3'},
]

const TTS_VOICES = [
    { id: 'vi-VN-Standard-A', name: 'Nữ - Giọng Miền Nam'},
    { id: 'vi-VN-Standard-D', name: 'Nam - Giọng Miền Nam'},
    { id: 'vi-VN-Wavenet-B', name: 'Nữ - Giọng Miền Bắc (Cao cấp)'},
    { id: 'vi-VN-Wavenet-C', name: 'Nam - Giọng Miền Bắc (Cao cấp)'},
];


interface Scene {
  title: string;
  summary: string;
  videoPrompt: string;
}

interface EchoVidUIProps {
  initialData?: {
    prompt?: string;
    scenes?: Scene[];
  };
}

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error' | 'queued';

interface SceneState {
  status: GenerationStatus;
  videoUrl?: string; // Original silent video
  narrationText: string;
  narrationUrl?: string;
  selectedMusic: string;
  musicVolume: number;
  finalVideoUrl?: string; // Video with audio
  error?: string;
  isPermissionError?: boolean;
  isQuotaError?: boolean;
  isGeneratingVoiceover?: boolean;
  isExporting?: boolean;
}

const EchoVidUI: React.FC<EchoVidUIProps> = ({ initialData }) => {
  const [prompts, setPrompts] = useState<Scene[]>([]);
  const [manualPrompt, setManualPrompt] = useState('');
  const [style, setStyle] = useState(VIDEO_STYLES[0].value);
  const [model, setModel] = useState(VIDEO_MODELS[0].id);
  const [sceneStates, setSceneStates] = useState<SceneState[]>([]);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [musicSuggestion, setMusicSuggestion] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { apiKey, requestApiKey } = useAPIKey();
  
  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  useEffect(() => {
    const loadFFmpeg = async () => {
        const ffmpeg = ffmpegRef.current;
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setFfmpegLoaded(true);
    }
    loadFFmpeg();
  }, []);


  useEffect(() => {
    const scenes = initialData?.scenes ?? (initialData?.prompt ? [{ title: 'Prompt tùy chỉnh', summary: initialData.prompt, videoPrompt: initialData.prompt }] : []);
    setPrompts(scenes);
    setSceneStates(scenes.map(s => ({ 
        status: 'idle', 
        narrationText: s.summary, 
        selectedMusic: BACKGROUND_MUSIC[0].id,
        musicVolume: 0.5,
    })));
    setActivePreviewIndex(null);
    setIsBatchGenerating(false);
  }, [initialData]);

  useEffect(() => {
    let interval: number | undefined;
    const isLoading = sceneStates.some(s => s.status === 'loading');
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessageIndex(prevIndex => (prevIndex + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sceneStates]);

  useEffect(() => {
    if (!isBatchGenerating || !apiKey) return;

    const isCurrentlyLoading = sceneStates.some(s => s.status === 'loading');
    if (isCurrentlyLoading) return;

    const nextQueuedIndex = sceneStates.findIndex(s => s.status === 'queued');

    if (nextQueuedIndex !== -1) {
      const timer = setTimeout(() => {
        handleGenerate(prompts[nextQueuedIndex].videoPrompt, nextQueuedIndex);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsBatchGenerating(false);
    }
  }, [sceneStates, isBatchGenerating, prompts, apiKey]);

  useEffect(() => {
    if (videoRef.current && activePreviewIndex !== null) {
      const activeState = sceneStates[activePreviewIndex];
      const videoSource = activeState?.finalVideoUrl || activeState?.videoUrl;
      if (videoRef.current.src !== videoSource) {
         videoRef.current.src = videoSource || '';
         videoRef.current.load();
      }
    }
  }, [activePreviewIndex, sceneStates]);

  const updateSceneState = (index: number, newState: Partial<SceneState>) => {
    setSceneStates(prev => {
      const newStates = [...prev];
      newStates[index] = { ...newStates[index], ...newState };
      return newStates;
    });
  };

  const handleGenerate = async (promptToGenerate: string, index: number) => {
    if (!apiKey) {
      requestApiKey();
      return;
    }

    updateSceneState(index, { status: 'loading', error: undefined, isPermissionError: false, isQuotaError: false });
    setActivePreviewIndex(index);
    setLoadingMessageIndex(0);

    try {
      const selectedStyle = VIDEO_STYLES.find(s => s.value === style);
      const stylePrefix = selectedStyle ? selectedStyle.prefix : '';
      const fullPrompt = `${stylePrefix}${promptToGenerate}`;

      const ai = new GoogleGenAI({ apiKey: apiKey });
      let operation = await ai.models.generateVideos({
        model: model,
        prompt: fullPrompt,
        config: { numberOfVideos: 1 },
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error('API không trả về link video.');
      
      const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
      if (!videoResponse.ok) {
         const errorBody = await videoResponse.json();
         const errorMessage = errorBody?.error?.message || `Không thể tải video: ${videoResponse.statusText}`;
        throw new Error(errorMessage);
      }
      
      const videoBlob = await videoResponse.blob();
      const videoUrl = URL.createObjectURL(videoBlob);
      updateSceneState(index, { status: 'success', videoUrl });

    } catch (err) {
      console.error(err);
      let errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
      let isPermission = false;
      const isQuota = errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.toLowerCase().includes('quota exceeded');
      
      if (model.includes('preview') && (errorMessage.includes('permission') || errorMessage.includes('not found') || errorMessage.includes('API key not valid'))) {
        const selectedModelInfo = VIDEO_MODELS.find(m => m.id === model);
        errorMessage = `API Key của bạn chưa có quyền truy cập vào mô hình '${selectedModelInfo?.name || model}'. Đây là mô hình thử nghiệm và cần được Google cấp phép riêng.`;
        isPermission = true;
      }
      
      updateSceneState(index, { status: 'error', error: `Không thể tạo video. ${errorMessage}`, isPermissionError: isPermission, isQuotaError: isQuota });
    }
  };
  
  const handleGenerateVoiceover = async (index: number) => {
    if (!apiKey) {
        requestApiKey();
        return;
    }
    const sceneState = sceneStates[index];
    if (!sceneState || !sceneState.narrationText) return;

    updateSceneState(index, { isGeneratingVoiceover: true, error: undefined });
    try {
        // NOTE: Đây là một API giả lập vì Google GenAI không có API TTS công khai.
        // Trong một ứng dụng thực tế, bạn sẽ gọi một API TTS như của Google Cloud Text-to-Speech.
        // Ở đây, chúng tôi sẽ mô phỏng một độ trễ và trả về một file audio mẫu.
        await new Promise(resolve => setTimeout(resolve, 2000));
        const sampleAudioUrl = 'https://cdn.pixabay.com/audio/2022/03/10/audio_291885a363.mp3'; // Một file audio mẫu
        
        updateSceneState(index, { isGeneratingVoiceover: false, narrationUrl: sampleAudioUrl });

    } catch (err) {
        console.error(err);
        updateSceneState(index, { isGeneratingVoiceover: false, error: 'Không thể tạo giọng nói.' });
    }
  };

  const handleSuggestMusic = async (index: number) => {
     if (!apiKey) {
        requestApiKey();
        return;
    }
    const prompt = prompts[index]?.videoPrompt;
    if (!prompt) return;

    setMusicSuggestion('AI đang phân tích...');
     try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const systemInstruction = `Bạn là một chuyên gia giám tuyển âm nhạc. Dựa trên prompt video, hãy đề xuất MỘT trong các thể loại sau: ${BACKGROUND_MUSIC.slice(1).map(m => `"${m.name}"`).join(', ')}. Chỉ trả về tên thể loại, không thêm bất kỳ văn bản nào khác.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Prompt: "${prompt}"`,
            config: { systemInstruction, temperature: 0.5 },
        });

        const suggestedGenreName = response.text.trim().replace(/"/g, '');
        const suggestedMusic = BACKGROUND_MUSIC.find(m => m.name === suggestedGenreName);
        if (suggestedMusic) {
            updateSceneState(index, { selectedMusic: suggestedMusic.id });
            setMusicSuggestion(`AI gợi ý: ${suggestedGenreName}`);
        } else {
            setMusicSuggestion('Không tìm thấy gợi ý phù hợp.');
        }

    } catch(err) {
        console.error(err);
        setMusicSuggestion('Lỗi khi gợi ý nhạc.');
    }
  };
  
  const handleExportFinalVideo = async (index: number) => {
    const sceneState = sceneStates[index];
    if (!sceneState || !sceneState.videoUrl || !ffmpegLoaded) return;
    
    updateSceneState(index, { isExporting: true, error: undefined });
    try {
        const ffmpeg = ffmpegRef.current;
        const videoData = await fetchFile(sceneState.videoUrl);
        await ffmpeg.writeFile('input.mp4', videoData);

        const inputs = ['-i', 'input.mp4'];
        const filters: string[] = [];
        const audioMappings: string[] = [];

        if (sceneState.narrationUrl) {
            const narrationData = await fetchFile(sceneState.narrationUrl);
            await ffmpeg.writeFile('narration.mp3', narrationData);
            inputs.push('-i', 'narration.mp3');
        }

        const music = BACKGROUND_MUSIC.find(m => m.id === sceneState.selectedMusic);
        if (music && music.url) {
            const musicData = await fetchFile(music.url);
            await ffmpeg.writeFile('music.mp3', musicData);
            inputs.push('-i', 'music.mp3');
            filters.push(`[${inputs.indexOf('-i', inputs.lastIndexOf('-i'))/2}:a]volume=${sceneState.musicVolume}[bgm]`);
        }
        
        if (sceneState.narrationUrl && music?.url) {
            filters.push(`[${inputs.indexOf('-i', 2)/2}:a]volume=1.0[narration]`);
            filters.push('[narration][bgm]amix=inputs=2:duration=longest');
            audioMappings.push('-map', '0:v', '-map', '[amix]');

        } else if (sceneState.narrationUrl) {
            audioMappings.push('-map', '0:v', '-map', '1:a');
        } else if (music?.url) {
            audioMappings.push('-map', '0:v', '-map', '[bgm]');
        }
        
        const command = [
            ...inputs,
            ...(filters.length > 0 ? ['-filter_complex', filters.join(';')] : []),
            '-c:v', 'copy',
            ...(audioMappings.length > 0 ? audioMappings : []),
            '-shortest',
            'output.mp4'
        ];
        
        await ffmpeg.exec(command.filter(Boolean) as string[]);
        
        const data = await ffmpeg.readFile('output.mp4');
        const url = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' }));
        updateSceneState(index, { finalVideoUrl: url, isExporting: false });

    } catch (err) {
        console.error(err);
        updateSceneState(index, { isExporting: false, error: 'Không thể ghép video và âm thanh.' });
    }
  };

  const handleGenerateAll = () => {
    if (!apiKey) { requestApiKey(); return; }
    setIsBatchGenerating(true);
    setSceneStates(prev => prev.map(s => (s.status === 'idle' || s.status === 'error') ? { ...s, status: 'queued', error: undefined } : s));
  };

  const handleDownload = () => {
    const activeState = activePreviewIndex !== null ? sceneStates[activePreviewIndex] : null;
    const urlToDownload = activeState?.finalVideoUrl || activeState?.videoUrl;
    if (!urlToDownload) return;
    const link = document.createElement('a');
    link.href = urlToDownload;
    link.download = `echovid-scene-${(activePreviewIndex ?? 0) + 1}${activeState?.finalVideoUrl ? '-final' : ''}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const hasPrompts = prompts.length > 0;
  const isLoadingAny = sceneStates.some(s => s.status === 'loading' || s.isExporting);
  const activeState = activePreviewIndex !== null ? sceneStates[activePreviewIndex] : null;

  const getButtonInfo = (status: GenerationStatus, hasApiKey: boolean) => {
    if (!hasApiKey) return { text: 'Cung Cấp API Key', disabled: false };
    if (isLoadingAny) return { text: 'Đang xử lý...', disabled: true };
    switch (status) {
      case 'loading': return { text: 'Đang tạo...', disabled: true };
      case 'queued': return { text: 'Đang chờ...', disabled: true };
      case 'success': return { text: 'Tạo Lại', disabled: false };
      case 'error': return { text: 'Thử Lại', disabled: false };
      default: return { text: 'Tạo Cảnh', disabled: false };
    }
  };

  const hasIdleOrErrorScenes = sceneStates.some(s => s.status === 'idle' || s.status === 'error');
  const generateAllButtonText = isBatchGenerating ? 'Đang Xử Lý...' : hasIdleOrErrorScenes ? 'Tạo/Thử Lại Toàn Bộ' : 'Tất Cả Đã Hoàn Thành';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Cột điều khiển */}
      <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 h-fit">
        <h2 className="text-xl font-bold mb-4">Storyboard & Dây Chuyền Sản Xuất</h2>
        <div className="mb-4">
          <label htmlFor="videoModel" className="block text-sm font-medium text-medium-text mb-2">Engine AI</label>
          <select id="videoModel" value={model} onChange={e => setModel(e.target.value)} disabled={isLoadingAny || isBatchGenerating} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
            {VIDEO_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <p className="text-xs text-medium-text mt-2">{VIDEO_MODELS.find(m => m.id === model)?.description}</p>
        </div>
        <div className="mb-4">
            <label htmlFor="videoStyle" className="block text-sm font-medium text-medium-text mb-2">Phong cách</label>
            <select id="videoStyle" value={style} onChange={e => setStyle(e.target.value)} disabled={isLoadingAny || isBatchGenerating} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-light-text">
            {VIDEO_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
        </div>
        {hasPrompts && prompts.length > 1 && (
            <div className="mb-4">
                <button onClick={handleGenerateAll} disabled={isBatchGenerating || isLoadingAny || !hasIdleOrErrorScenes || !apiKey} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-dark-border disabled:cursor-not-allowed">
                    <SparklesIcon className="w-5 h-5"/>
                    {!apiKey ? 'Cung Cấp API Key' : generateAllButtonText}
                </button>
            </div>
        )}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {hasPrompts ? (
                prompts.map((scene, index) => {
                  const sceneState = sceneStates[index];
                  const isActive = activePreviewIndex === index;
                  const buttonInfo = getButtonInfo(sceneState?.status || 'idle', !!apiKey);
                  return (
                    <div key={index} className={`bg-dark-bg border rounded-lg p-4 cursor-pointer transition-all ${isActive ? 'border-brand-blue ring-2 ring-brand-blue/50' : sceneState?.status === 'success' ? 'border-emerald-500/50' : sceneState?.status === 'error' ? 'border-red-500/50' : 'border-dark-border'}`} onClick={() => setActivePreviewIndex(index)}>
                      <h3 className="font-semibold text-amber-400">Cảnh {index + 1}: {scene.title}</h3>
                      <p className="text-sm text-cyan-300 italic mt-2 mb-4">"{scene.videoPrompt}"</p>
                      <button onClick={(e) => { e.stopPropagation(); apiKey ? handleGenerate(scene.videoPrompt, index) : requestApiKey(); }} disabled={buttonInfo.disabled} className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:bg-dark-border disabled:cursor-not-allowed">
                        <VideoIcon className="w-4 h-4"/>
                        <span>{buttonInfo.text}</span>
                      </button>
                    </div>
                  )
                })
            ) : (
                <div className="flex flex-col gap-4">
                    <p className="text-medium-text text-sm">Nhập prompt để bắt đầu.</p>
                     <textarea value={manualPrompt} onChange={(e) => setManualPrompt(e.target.value)} rows={5} placeholder="Ví dụ: Cận cảnh một con tàu vũ trụ lướt qua các vành đai của Sao Thổ..." className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5" disabled={isLoadingAny}/>
                    <button onClick={() => apiKey ? handleGenerate(manualPrompt, 0) : requestApiKey()} disabled={isLoadingAny || !manualPrompt.trim()} className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-dark-border">
                       <SparklesIcon className="w-5 h-5"/>
                       {!apiKey ? 'Cung Cấp API Key' : 'Tạo Video'}
                    </button>
                </div>
            )}
        </div>
      </div>
      
      {/* Cột Preview và Audio Suite */}
      <div className="lg:col-span-3 bg-dark-card border border-dark-border rounded-xl p-6 h-fit sticky top-28">
         <h2 className="text-xl font-bold mb-4">Xem Trước & Hậu Kỳ Âm Thanh</h2>
        <div className="aspect-video bg-dark-bg rounded-lg flex items-center justify-center border-2 border-dashed border-dark-border overflow-hidden relative group">
          {activeState?.status === 'loading' || activeState?.isExporting ? (
             <div className="text-center text-medium-text p-4">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-rose-500 mx-auto mb-4"></div>
                <p className="font-semibold text-light-text mb-2">{activeState.isExporting ? "Đang ghép video & âm thanh..." : `AI đang tạo Cảnh ${activePreviewIndex! + 1}...`}</p>
                <p className="text-sm text-cyan-300">{activeState.isExporting ? "Quá trình này diễn ra trên máy bạn." : LOADING_MESSAGES[loadingMessageIndex]}</p>
             </div>
          ) : activeState?.status === 'success' ? (
            <video ref={videoRef} src={activeState.finalVideoUrl || activeState.videoUrl} controls autoPlay muted loop className="w-full h-full object-contain" />
          ) : activeState?.status === 'error' ? (
             <div className="text-center p-4 text-red-400">
                <h3 className="font-bold">Lỗi khi tạo Cảnh {activePreviewIndex! + 1}</h3>
                <p className="text-sm bg-dark-bg border border-red-900 rounded-md p-3 mt-2">{activeState.error}</p>
            </div>
          ) : (
            <div className="text-center text-medium-text p-4">
              <VideoIcon className="w-12 h-12 mx-auto text-dark-border mb-2"/>
              <p className="text-lg font-semibold">Video của bạn sẽ xuất hiện ở đây</p>
            </div>
          )}
        </div>
        {activeState?.status === 'success' && (
             <div className="mt-4 border-t border-dark-border pt-4 space-y-6 animate-fade-in">
                 <h3 className="text-lg font-semibold">Bảng Điều Khiển Âm Thanh</h3>
                 {/* Voiceover Section */}
                 <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                     <label className="text-md font-semibold text-light-text mb-2 block">Lồng tiếng AI</label>
                     <textarea rows={3} value={activeState.narrationText} onChange={e => updateSceneState(activePreviewIndex!, { narrationText: e.target.value })} className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-sm" />
                     <button onClick={() => handleGenerateVoiceover(activePreviewIndex!)} disabled={activeState.isGeneratingVoiceover || !activeState.narrationText} className="w-full mt-2 flex items-center justify-center gap-2 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg disabled:bg-dark-border">
                         <MicIcon className="w-4 h-4"/>
                         {activeState.isGeneratingVoiceover ? 'Đang tạo giọng nói...' : 'Tạo & Nghe thử Giọng nói'}
                     </button>
                     {activeState.narrationUrl && <audio src={activeState.narrationUrl} controls className="w-full mt-3 h-8"/>}
                 </div>
                 {/* Music Section */}
                 <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                     <label htmlFor="music-select" className="text-md font-semibold text-light-text mb-2 block">Nhạc nền</label>
                     <div className="flex gap-2 mb-3">
                        <select id="music-select" value={activeState.selectedMusic} onChange={e => updateSceneState(activePreviewIndex!, { selectedMusic: e.target.value })} className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-sm">
                            {BACKGROUND_MUSIC.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <button onClick={() => handleSuggestMusic(activePreviewIndex!)} className="flex-shrink-0 text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold p-2 rounded-lg"><SparklesIcon className="w-5 h-5"/></button>
                     </div>
                     <p className="text-xs text-cyan-300 h-4 mb-2">{musicSuggestion}</p>
                     <label className="text-sm font-medium">Âm lượng nhạc: {Math.round(activeState.musicVolume*100)}%</label>
                     <input type="range" min="0" max="1" step="0.05" value={activeState.musicVolume} onChange={e => updateSceneState(activePreviewIndex!, { musicVolume: parseFloat(e.target.value)})} className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer"/>
                 </div>
                 {/* Export Section */}
                  <button onClick={() => handleExportFinalVideo(activePreviewIndex!)} disabled={activeState.isExporting || !ffmpegLoaded} className="w-full flex items-center justify-center gap-3 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-dark-border">
                      {activeState.isExporting ? 'Đang xử lý...' : ffmpegLoaded ? 'Ghép & Xuất Video Hoàn Chỉnh' : 'Đang tải Engine xử lý...'}
                  </button>
                  {activeState.finalVideoUrl && 
                     <button onClick={handleDownload} className="w-full mt-2 flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg">
                        <DownloadIcon className="w-5 h-5"/>
                        Tải Video Hoàn Chỉnh
                    </button>
                  }
             </div>
        )}
      </div>
    </div>
  );
};

export default EchoVidUI;