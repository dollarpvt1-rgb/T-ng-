import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { CopyIcon, DownloadIcon, SendIcon, SparklesIcon, VideoIcon } from '../icons/Icons';

interface ScriptProUIProps {
  onNavigateToVideo: (toolId: string, data: any) => void;
}

interface Scene {
  title: string;
  summary: string;
  videoPrompt: string;
}

const SCRIPT_TYPES = [
  { id: 'youtube', name: 'Video YouTube' },
  { id: 'short_film', name: 'Phim Ngắn' },
  { id: 'tv_ad', name: 'Quảng cáo TV' },
  { id: 'podcast', name: 'Podcast Script' },
  { id: 'email_marketing', name: 'Email Marketing' },
  { id: 'blog_post', name: 'Bài Viết Blog' },
];

const TONES = [
  { id: 'humorous', name: 'Hài hước' },
  { id: 'dramatic', name: 'Kịch tính' },
  { id: 'formal', name: 'Trang trọng' },
  { id: 'friendly', name: 'Thân thiện & Gần gũi' },
  { id: 'inspirational', name: 'Truyền cảm hứng' },
  { id: 'suspenseful', name: 'Hồi hộp' },
];

const LANGUAGES = [
  { id: 'vietnamese', name: 'Tiếng Việt' },
  { id: 'english', name: 'English' },
];

const CREATIVITY_LEVELS = [
  { id: 'factual', name: 'Ít sáng tạo hơn (tập trung vào sự thật)', temperature: 0.3 },
  { id: 'balanced', name: 'Cân bằng (đề xuất)', temperature: 0.8 },
  { id: 'creative', name: 'Sáng tạo hơn (nhiều ý tưởng bất ngờ)', temperature: 1.0 },
];

const PROMPT_EXAMPLES: { [key: string]: string[] } = {
  youtube: [
    'Một video unboxing và đánh giá chi tiết chiếc điện thoại "Pixel 10 Pro", tập trung vào tính năng camera AI mới.',
    'Hướng dẫn nấu món Phở Bò chuẩn vị Hà Nội trong 15 phút, dành cho người mới bắt đầu.',
    'Top 5 địa điểm du lịch bí mật tại Đà Lạt ít người biết đến, với những cảnh quay drone hùng vĩ.',
  ],
  short_film: [
    'Một lập trình viên trẻ vô tình tạo ra một AI có khả năng cảm nhận và yêu thương, dẫn đến những lựa chọn đạo đức khó khăn.',
    'Câu chuyện về một người đưa thư già ở một khu phố cổ, người nắm giữ bí mật của tất cả các cư dân qua những lá thư ông trao.',
    'Hai người bạn thân bị lạc trong một khu rừng kỳ lạ, nơi các quy luật vật lý không còn tồn tại.',
  ],
  tv_ad: [
    'Quảng cáo 30 giây cho một thương hiệu cà phê hữu cơ, tập trung vào cảm giác tỉnh táo, sảng khoái và gần gũi với thiên nhiên vào mỗi buổi sáng.',
    'Một quảng cáo cho ứng dụng học ngôn ngữ, cho thấy một người du lịch có thể tự tin giao tiếp và kết bạn ở một đất nước xa lạ nhờ ứng dụng.',
    'Quảng cáo xe điện mới, nhấn mạnh sự êm ái, thân thiện với môi trường và thiết kế tương lai.',
  ],
  podcast: [
    'Tập podcast phỏng vấn một startup công nghệ thành công, thảo luận về hành trình khởi nghiệp và những bài học kinh nghiệm.',
    'Một tập kể chuyện kinh dị về một truyền thuyết đô thị chưa từng được kể, với hiệu ứng âm thanh sống động.',
    'Phân tích về xu hướng làm việc từ xa (remote work), bao gồm các ưu điểm, nhược điểm và tương lai của mô hình này.',
  ],
  email_marketing: [
    'Email giới thiệu sản phẩm mới: một chiếc tai nghe chống ồn thông minh, tập trung vào lợi ích cho người làm việc từ xa.',
    'Email thông báo chương trình giảm giá 50% cho tất cả các khóa học online nhân dịp cuối năm.',
    'Email nuôi dưỡng khách hàng tiềm năng, chia sẻ 3 mẹo hữu ích để cải thiện năng suất làm việc.',
  ],
  blog_post: [
    'Bài viết blog hướng dẫn "Cách xây dựng một kênh YouTube thành công từ con số 0".',
    'So sánh chi tiết giữa hai framework frontend phổ biến: React và Vue.',
    'Bài viết phân tích tầm quan trọng của trí tuệ nhân tạo (AI) trong tương lai của ngành marketing.',
  ],
};

const ScriptProUI: React.FC<ScriptProUIProps> = ({ onNavigateToVideo }) => {
  const [mode, setMode] = useState<'generate' | 'analyze'>('generate');
  
  // State cho chế độ Generate
  const [scriptType, setScriptType] = useState(SCRIPT_TYPES[0].id);
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState(TONES[0].id);
  const [creativity, setCreativity] = useState(CREATIVITY_LEVELS[1].id);
  const [lengthInMinutes, setLengthInMinutes] = useState('5');
  const [outputLanguage, setOutputLanguage] = useState(LANGUAGES[0].id);
  const [targetAudience, setTargetAudience] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [logline, setLogline] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // State cho chế độ Analyze
  const [scriptToAnalyze, setScriptToAnalyze] = useState('');
  
  // State chung
  const [outputContent, setOutputContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // State cho tính năng chat
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  
  const parsedScenes = useMemo((): Scene[] => {
    if (mode !== 'analyze' || !outputContent) return [];
    
    const scenes: Scene[] = [];
    const sceneRegex = /### Phân Cảnh \d+:\s*(.*?)\n\n\*\*Tóm tắt:\*\*\s*(.*?)\n\n\*\*Gợi ý Prompt Video:\*\*\s*(.*?)(?=\n### Phân Cảnh|$)/gs;
    
    let match;
    while ((match = sceneRegex.exec(outputContent)) !== null) {
      scenes.push({
        title: match[1].trim(),
        summary: match[2].trim(),
        videoPrompt: match[3].trim(),
      });
    }
    return scenes;
  }, [mode, outputContent]);


  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  const resetState = () => {
    setError(null);
    setOutputContent('');
    setChatSession(null);
    setChatHistory([]);
  };

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('Vui lòng nhập ý tưởng chính cho kịch bản.');
      return;
    }

    setIsLoading(true);
    resetState();

    try {
        const selectedScriptType = SCRIPT_TYPES.find(t => t.id === scriptType)?.name || '';
        const selectedTone = TONES.find(t => t.id === tone)?.name || '';
        const selectedLanguage = LANGUAGES.find(l => l.id === outputLanguage)?.name || 'Tiếng Việt';
        const selectedCreativity = CREATIVITY_LEVELS.find(c => c.id === creativity)?.temperature || 0.8;

        const systemInstruction = `Bạn là một nhà biên kịch và chuyên gia sáng tạo nội dung chuyên nghiệp. Hãy tạo ra nội dung hấp dẫn, sáng tạo và đúng cấu trúc. Đối với kịch bản, hãy tuân thủ định dạng tiêu chuẩn. Đối với bài viết, hãy sử dụng văn phong lôi cuốn. Nội dung cuối cùng phải được viết bằng ngôn ngữ ${selectedLanguage}.`;
        
        let contextualPromptPart = '';
        if (scriptType === 'youtube' && targetAudience) contextualPromptPart = `Đối tượng khán giả mục tiêu là: "${targetAudience}".`;
        if (scriptType === 'tv_ad' && keyMessage) contextualPromptPart = `Thông điệp chính cần truyền tải là: "${keyMessage}".`;
        if (scriptType === 'short_film' && logline) contextualPromptPart = `Logline của phim là: "${logline}".`;
        if (scriptType === 'podcast' && keyTakeaways) contextualPromptPart = `Những điểm chính cần thảo luận là: "${keyTakeaways}".`;
        if (scriptType === 'email_marketing' && callToAction) contextualPromptPart = `Lời kêu gọi hành động (CTA) là: "${callToAction}".`;
        if (scriptType === 'blog_post' && seoKeywords) contextualPromptPart = `Tối ưu hóa cho các từ khóa SEO: "${seoKeywords}".`;

        const userPrompt = `Hãy viết một nội dung cho định dạng "${selectedScriptType}" với độ dài ước tính tương đương ${lengthInMinutes} phút đọc/xem.
        Tông giọng: ${selectedTone}.
        Ngôn ngữ đầu ra: ${selectedLanguage}.
        ${contextualPromptPart}
        Ý tưởng chính: "${idea}".
        Hãy đảm bảo nội dung có cấu trúc rõ ràng, văn phong tự nhiên và phù hợp.`;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: selectedCreativity,
            },
        });
        
        const initialScript = response.text;
        setOutputContent(initialScript);
        
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          history: [
            { role: 'user', parts: [{ text: userPrompt }] },
            { role: 'model', parts: [{ text: initialScript }] }
          ],
          config: {
            systemInstruction: 'Bạn là một trợ lý chỉnh sửa kịch bản hữu ích. Dựa trên nội dung đã có, hãy thực hiện các yêu cầu chỉnh sửa và chỉ trả về phiên bản nội dung ĐẦY ĐỦ đã được cập nhật. Không thêm lời thoại thừa.',
          }
        });
        setChatSession(chat);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
      setError(`Không thể tạo nội dung. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptToAnalyze.trim()) {
      setError('Vui lòng dán kịch bản của bạn vào để phân tích.');
      return;
    }

    setIsLoading(true);
    resetState();

    try {
      const systemInstruction = `Bạn là một trợ lý đạo diễn AI và biên tập viên kịch bản chuyên nghiệp. Nhiệm vụ của bạn là phân tích kịch bản được cung cấp và biến nó thành một kế hoạch sản xuất video trực quan.`;
      const userPrompt = `Tôi cần bạn phân tích kịch bản sau đây. Vui lòng thực hiện theo các bước sau và định dạng đầu ra một cách chính xác bằng Markdown:

      **Bước 1: Chia Kịch Bản thành các Phân Cảnh (Scenes)**
      Đọc toàn bộ kịch bản và xác định các phân cảnh riêng biệt. Một phân cảnh mới thường được đánh dấu bằng sự thay đổi về địa điểm hoặc thời gian (ví dụ: "NỘI. QUÁN CAFE - NGÀY").

      **Bước 2: Tạo Tóm Tắt và Gợi Ý Prompt Video cho Mỗi Cảnh**
      Với mỗi phân cảnh bạn xác định được:
      1.  Viết một **Tóm tắt** ngắn gọn (1-2 câu) về những gì xảy ra trong cảnh đó.
      2.  Viết một **Gợi ý Prompt Video** giàu hình ảnh. Đây là một mô tả súc tích, trực quan, phù hợp để cung cấp cho một AI tạo video (text-to-video). Nó nên tập trung vào HÌNH ẢNH, HÀNH ĐỘNG, và BẦU KHÔNG KHÍ của cảnh.

      **Bước 3: Trình Bày Kết Quả**
      Định dạng đầu ra của bạn một cách chính xác theo cấu trúc sau. TUYỆT ĐỐI không thêm bất kỳ văn bản nào khác ngoài cấu trúc này.

      # Phân Tích Kịch Bản & Gợi Ý Video

      ### Phân Cảnh 1: [Tiêu đề cảnh, ví dụ: Quán Cà Phê]

      **Tóm tắt:** [Tóm tắt nội dung cảnh ở đây]

      **Gợi ý Prompt Video:** [Gợi ý prompt video giàu hình ảnh ở đây]

      ### Phân Cảnh 2: [Tiêu đề cảnh tiếp theo]

      **Tóm tắt:** [Tóm tắt nội dung cảnh ở đây]

      **Gợi ý Prompt Video:** [Gợi ý prompt video giàu hình ảnh ở đây]

      (Lặp lại cho tất cả các cảnh)

      ---
      **KỊCH BẢN CẦN PHÂN TÍCH:**
      \`\`\`
      ${scriptToAnalyze}
      \`\`\`
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.6,
        },
      });

      setOutputContent(response.text);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
      setError(`Không thể phân tích kịch bản. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !chatSession || isChatLoading) return;

    const userMessage = chatMessage.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatMessage('');
    setIsChatLoading(true);
    setError(null);

    try {
        const response: GenerateContentResponse = await chatSession.sendMessage({ message: userMessage });
        const updatedScript = response.text;
        setOutputContent(updatedScript);
    } catch(err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
        setError(`Không thể chỉnh sửa. ${errorMessage}`);
        setChatHistory(prev => prev.slice(0, -1));
        setChatMessage(userMessage);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleCopy = (textToCopy: string) => {
    if (isCopied) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const handleDownload = () => {
      if (!outputContent) return;
      const blob = new Blob([outputContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `script-pro-${mode}.txt`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };
  
  const handleNavigateAllScenes = () => {
    if (parsedScenes.length > 0) {
      onNavigateToVideo('echovid', { scenes: parsedScenes });
    }
  };

  const renderGenerateForm = () => (
     <form onSubmit={handleGenerateScript} className="space-y-6 animate-fade-in">
        <div>
            <label htmlFor="scriptType" className="block text-sm font-medium text-medium-text mb-2">Loại Nội Dung</label>
            <select id="scriptType" value={scriptType} onChange={e => setScriptType(e.target.value)} disabled={isLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-blue">
            {SCRIPT_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>
        
        {scriptType === 'youtube' && (
            <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-medium-text mb-2">Đối tượng khán giả</label>
                <input type="text" id="targetAudience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Ví dụ: Game thủ, người yêu công nghệ..." className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5" disabled={isLoading}/>
            </div>
        )}

         <div>
            <label className="block text-sm font-medium text-medium-text mb-2">Gợi ý ý tưởng</label>
            <div className="flex flex-col gap-2">
            {(PROMPT_EXAMPLES[scriptType] || []).map((example, index) => (
                <button key={index} type="button" onClick={() => setIdea(example)} disabled={isLoading} className="text-left text-sm w-full bg-dark-bg border border-dark-border text-medium-text p-3 rounded-lg hover:bg-dark-border hover:text-light-text transition-colors disabled:opacity-50">
                    💡 {example}
                </button>
            ))}
            </div>
        </div>

        <div>
            <label htmlFor="idea" className="block text-sm font-medium text-medium-text mb-2">Ý Tưởng Chính</label>
            <textarea id="idea" rows={5} value={idea} onChange={e => setIdea(e.target.value)} placeholder="Mô tả ý tưởng của bạn ở đây..." className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5" disabled={isLoading}/>
        </div>
        <div>
            <label htmlFor="tone" className="block text-sm font-medium text-medium-text mb-2">Tông Giọng</label>
            <select id="tone" value={tone} onChange={e => setTone(e.target.value)} disabled={isLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5">
            {TONES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="creativity" className="block text-sm font-medium text-medium-text mb-2">Giọng Điệu Của AI</label>
            <select id="creativity" value={creativity} onChange={e => setCreativity(e.target.value)} disabled={isLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5">
                {CREATIVITY_LEVELS.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="length" className="block text-sm font-medium text-medium-text mb-2">Độ Dài Ước Tính (phút)</label>
            <input type="number" id="length" value={lengthInMinutes} onChange={e => setLengthInMinutes(e.target.value)} min="1" max="120" className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5" disabled={isLoading}/>
        </div>
        <div>
            <label htmlFor="outputLanguage" className="block text-sm font-medium text-medium-text mb-2">Ngôn Ngữ Đầu Ra</label>
            <select id="outputLanguage" value={outputLanguage} onChange={e => setOutputLanguage(e.target.value)} disabled={isLoading} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5">
            {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
            </select>
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:bg-dark-border disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? 'Đang Sáng Tạo...' : 'Tạo Nội Dung'}
        </button>
    </form>
  );

  const renderAnalyzeForm = () => (
    <form onSubmit={handleAnalyzeScript} className="space-y-6 animate-fade-in">
        <div>
            <label htmlFor="scriptToAnalyze" className="block text-sm font-medium text-medium-text mb-2">Dán kịch bản của bạn</label>
            <textarea
                id="scriptToAnalyze"
                rows={20}
                value={scriptToAnalyze}
                onChange={e => setScriptToAnalyze(e.target.value)}
                placeholder="Dán toàn bộ kịch bản của bạn vào đây để AI phân tích..."
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isLoading}
            />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:bg-dark-border disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  <span>Đang Phân Tích...</span>
                </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5"/>
                <span>Phân Tích & Gợi Ý Video</span>
              </>
            )}
        </button>
    </form>
  );

 const renderAnalysisResult = () => (
    <div className="space-y-6">
      {parsedScenes.length > 0 && (
        <div className="animate-fade-in bg-dark-bg border border-dark-border rounded-lg p-4">
           <button 
                onClick={handleNavigateAllScenes}
                className="w-full flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-rose-500/20"
              >
                <VideoIcon className="w-5 h-5" />
                Tạo Toàn Bộ Video Storyboard
            </button>
        </div>
      )}
      {parsedScenes.length > 0 ? (
        parsedScenes.map((scene, index) => (
          <div key={index} className="bg-dark-bg border border-dark-border rounded-lg p-6 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
            <h3 className="text-lg font-bold text-amber-400 mb-2">Phân Cảnh {index + 1}: {scene.title}</h3>
            <p className="text-medium-text mb-4"><strong className="text-light-text">Tóm tắt:</strong> {scene.summary}</p>
            <div className="bg-dark-card border border-dark-border/50 rounded-md p-4">
              <p className="text-sm font-semibold text-light-text mb-2">Gợi ý Prompt Video:</p>
              <p className="text-cyan-300 italic text-sm mb-4">"{scene.videoPrompt}"</p>
              <button 
                onClick={() => onNavigateToVideo('echovid', { prompt: scene.videoPrompt })}
                className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                <VideoIcon className="w-4 h-4" />
                Tạo Video cho Cảnh này
              </button>
            </div>
          </div>
        ))
      ) : (
        <pre className="text-light-text whitespace-pre-wrap font-sans text-base leading-relaxed">
            {outputContent || <span className="text-medium-text">Kết quả sẽ xuất hiện ở đây.</span>}
        </pre>
      )}
    </div>
  );


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cột điều khiển */}
      <div className="lg:col-span-1 bg-dark-card border border-dark-border rounded-xl p-6 h-fit sticky top-28">
        <div className="mb-6">
            <div className="flex bg-dark-bg border border-dark-border rounded-lg p-1">
                <button onClick={() => setMode('generate')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'generate' ? 'bg-amber-500 text-white' : 'text-medium-text hover:bg-dark-border'}`}>
                    Tạo Mới
                </button>
                <button onClick={() => setMode('analyze')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'analyze' ? 'bg-sky-500 text-white' : 'text-medium-text hover:bg-dark-border'}`}>
                    Phân Tích & Tinh Chỉnh
                </button>
            </div>
        </div>
        {mode === 'generate' ? renderGenerateForm() : renderAnalyzeForm()}
      </div>

      {/* Cột kết quả */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 md:p-8 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-light-text">{mode === 'generate' ? 'Nội Dung Được Tạo' : 'Kết Quả Phân Tích'}</h2>
                {outputContent && !isLoading && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleCopy(outputContent)} disabled={isCopied} className="flex items-center gap-2 bg-dark-border hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-70">
                            <CopyIcon className="w-4 h-4" />
                            <span>{isCopied ? 'Đã sao chép!' : 'Sao chép'}</span>
                        </button>
                        <button onClick={handleDownload} className="flex items-center gap-2 bg-dark-border hover:bg-gray-600 text-light-text font-semibold py-2 px-4 rounded-lg text-sm">
                            <DownloadIcon className="w-4 h-4" />
                            <span>Tải xuống</span>
                        </button>
                    </div>
                )}
            </div>
             {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert">
                    <p>{error}</p>
                </div>
             )}
             <div className="bg-dark-bg rounded-lg p-6 flex-grow border border-dark-border overflow-y-auto max-h-[100vh]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-medium-text">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-amber-500 mb-4"></div>
                        <p className="font-semibold">{mode === 'generate' ? 'AI đang chắp bút...' : 'AI đang đọc kịch bản của bạn...'}</p>
                        <p className="text-sm">Vui lòng chờ trong giây lát.</p>
                    </div>
                ) : (
                    mode === 'analyze' ? renderAnalysisResult() : 
                    <pre className="text-light-text whitespace-pre-wrap font-sans text-base leading-relaxed">
                        {outputContent || <span className="text-medium-text">Kết quả sẽ xuất hiện ở đây.</span>}
                    </pre>
                )}
             </div>

             {/* Khung chat chỉ khả dụng ở chế độ generate */}
             {mode === 'generate' && outputContent && !isLoading && chatSession && (
                <div className="mt-6 pt-6 border-t border-dark-border">
                  <h3 className="text-lg font-semibold text-light-text mb-4">Chỉnh sửa nhanh</h3>
                  <div ref={chatHistoryRef} className="max-h-40 overflow-y-auto mb-4 space-y-3 pr-2">
                      {chatHistory.map((msg, index) => (
                          <div key={index} className="flex">
                              {msg.role === 'user' && (
                                  <div className="ml-auto bg-brand-blue text-white rounded-lg py-2 px-4 max-w-sm">
                                      {msg.text}
                                  </div>
                              )}
                          </div>
                      ))}
                      {isChatLoading && (
                          <div className="flex justify-start">
                             <div className="bg-dark-border rounded-lg py-2 px-4 inline-flex items-center gap-2">
                                <span className="w-2 h-2 bg-medium-text rounded-full animate-pulse"></span>
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
                      placeholder="Yêu cầu AI chỉnh sửa... (ví dụ: làm đoạn kết hoành tráng hơn)"
                      className="flex-grow bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-light-text placeholder-medium-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      disabled={isChatLoading}
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !chatMessage.trim()}
                      className="bg-brand-blue hover:bg-blue-600 text-white font-bold p-3 rounded-lg transition-all transform hover:scale-105 disabled:bg-dark-border disabled:cursor-not-allowed"
                      aria-label="Gửi yêu cầu chỉnh sửa"
                    >
                      {isChatLoading ? (
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <SendIcon className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default ScriptProUI;