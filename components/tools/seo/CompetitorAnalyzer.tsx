import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, ExternalLinkIcon, CheckCircleIcon, XCircleIcon, LightbulbIcon, TargetIcon, RocketIcon, SitemapIcon, EyeIcon } from '../../icons/Icons';

// --- Interfaces for data structure ---
interface Score {
    score: number;
    feedback: string;
}

interface ContentAnalysis {
    successful_topics: { topic: string; reason: string }[];
    common_formats: string[];
    content_score: Score;
}

interface SeoAnalysis {
    title_patterns: string[];
    main_keywords: string[];
    optimization_score: Score;
}

interface ThumbnailDeconstruction {
  emotion: string;
  layout: string;
  visual_cues: string;
}

interface BrandingAnalysis {
  thumbnail_deconstruction: ThumbnailDeconstruction;
  superior_thumbnail_formula: string;
  channel_branding_feedback: string;
  branding_score: Score;
}

interface VulnerabilityAndAttackPlan {
  vulnerability: string;
  attack_plan: string;
}

interface NicheMap {
  niche_dna: string[];
  uncharted_territory: {
    gap: string;
    opportunity: string;

  }[];
}

interface CompetitorAnalysis {
    channel_name: string;
    estimated_subscribers: string;
    estimated_videos: string;
    analysis_summary: string;
    strengths: { point: string; explanation: string }[];
    weaknesses: { point: string; explanation: string }[];
    strategic_vulnerabilities_and_attack_plan: VulnerabilityAndAttackPlan[];
    niche_map_and_uncharted_territory: NicheMap;
    content_analysis: ContentAnalysis;
    seo_analysis: SeoAnalysis;
    branding_analysis: BrandingAnalysis;
}


interface ReferenceSource {
  uri: string;
  title: string;
}

type AnalysisTab = 'overview' | 'strategy' | 'content' | 'seo' | 'branding';

// Helper component for displaying scores
const ScoreDisplay: React.FC<{ scoreData: Score; color: string }> = ({ scoreData, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold">Điểm đánh giá</span>
            <span className={`text-lg font-bold ${color}`}>{scoreData.score}/10</span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2.5">
            <div className={`bg-gradient-to-r ${color === 'text-emerald-400' ? 'from-emerald-500 to-green-400' : color === 'text-sky-400' ? 'from-sky-500 to-blue-400' : 'from-rose-500 to-red-400'} h-2.5 rounded-full`} style={{ width: `${scoreData.score * 10}%` }}></div>
        </div>
        <p className="text-xs text-medium-text mt-2">{scoreData.feedback}</p>
    </div>
);

const AnalysisSection: React.FC<{ title: string; children: React.ReactNode, icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
        <h4 className="flex items-center gap-2 text-md font-bold text-light-text mb-3">
            {icon}
            {title}
        </h4>
        <div className="space-y-3">{children}</div>
    </div>
);


const CompetitorAnalyzer: React.FC = () => {
    const [channelUrl, setChannelUrl] = useState('');
    const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
    const [references, setReferences] = useState<ReferenceSource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');


    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!channelUrl.trim()) {
            setError('Vui lòng nhập URL của kênh đối thủ.');
            return;
        }
        if (!process.env.API_KEY) { 
            setError("API Key phải được cấu hình trong môi trường.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setReferences([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Là một chiến lược gia YouTube đẳng cấp thế giới, hãy thực hiện một bản phân tích tác chiến sâu sắc về kênh đối thủ tại URL sau: "${channelUrl}".

            **Nhiệm vụ:**
            1.  **Thu thập Dữ liệu Cơ bản:** Sử dụng Google Search để tìm và ước tính các thông tin sau về kênh: Tên kênh, số người đăng ký, tổng số video.
            2.  **Phân tích Chuyên sâu:** Dựa trên các video và thông tin công khai tìm được, xây dựng một bản phân tích toàn diện, tập trung vào việc tìm ra các lỗ hổng có thể khai thác.
            3.  Định dạng **TOÀN BỘ** phản hồi của bạn dưới dạng một đối tượng JSON hợp lệ duy nhất. **KHÔNG** bao gồm bất kỳ văn bản nào khác.

            **Cấu trúc JSON bắt buộc:**
            {
              "channel_name": "Tên kênh tìm được.",
              "estimated_subscribers": "Số người đăng ký ước tính (ví dụ: '~1.2M subs').",
              "estimated_videos": "Số video ước tính (ví dụ: '~150 videos').",
              "analysis_summary": "Tóm tắt chiến lược cấp cao về vị thế và chiến lược của kênh.",
              "strengths": [{"point": "Tiêu đề điểm mạnh.", "explanation": "Giải thích ngắn gọn."}],
              "weaknesses": [{"point": "Tiêu đề điểm yếu.", "explanation": "Giải thích ngắn gọn."}],
              "strategic_vulnerabilities_and_attack_plan": [
                {"vulnerability": "Xác định một lỗ hổng cụ thể có thể khai thác.", "attack_plan": "Đề xuất một kế hoạch tấn công trực diện để khai thác lỗ hổng đó."}
              ],
              "niche_map_and_uncharted_territory": {
                "niche_dna": ["Liệt kê các 'luật chơi ngầm' hoặc các yếu tố chung của các kênh thành công trong ngách này."],
                "uncharted_territory": [
                  {"gap": "Xác định một khoảng trống nội dung hoặc định dạng mà chưa ai làm.", "opportunity": "Giải thích cách khai thác khoảng trống này để trở thành người dẫn đầu."}
                ]
              },
              "content_analysis": {
                "successful_topics": [{"topic": "Chủ đề video thành công nhất.", "reason": "Tại sao chủ đề này lại thu hút."}],
                "common_formats": ["Liệt kê các định dạng video phổ biến."],
                "content_score": { "score": <number 1-10>, "feedback": "Lý giải điểm số nội dung." }
              },
              "seo_analysis": {
                "title_patterns": ["Phân tích và liệt kê các MẪU TIÊU ĐỀ thành công nhất."],
                "main_keywords": ["Các từ khóa chính mà kênh nhắm đến."],
                "optimization_score": { "score": <number 1-10>, "feedback": "Lý giải điểm số SEO." }
              },
              "branding_analysis": {
                "thumbnail_deconstruction": {
                  "emotion": "Phân tích tâm lý học: Yếu tố cảm xúc mà thumbnail của họ gợi lên (tò mò, sốc, tin cậy...).",
                  "layout": "Phân tích bố cục và cấu trúc (quy tắc 1/3, cận cảnh, văn bản).",
                  "visual_cues": "Các tín hiệu thị giác được sử dụng (màu sắc, mũi tên, vòng tròn)."
                },
                "superior_thumbnail_formula": "Đề xuất một CÔNG THỨC thumbnail vượt trội hơn để cạnh tranh.",
                "channel_branding_feedback": "Nhận xét về branding tổng thể của kênh (logo, banner, sự nhất quán).",
                "branding_score": { "score": <number 1-10>, "feedback": "Lý giải điểm số branding." }
              }
            }`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                }
            });
            
            const text = response.text;
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

            if (groundingChunks) {
                 setReferences(groundingChunks.map((chunk: any) => ({
                    uri: chunk.web?.uri || '#',
                    title: chunk.web?.title || 'Nguồn không xác định'
                })));
            }

            const cleanedText = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
            setAnalysis(JSON.parse(cleanedText));
            setActiveTab('overview');

        } catch (err)
 {
            console.error(err);
            setError('Không thể phân tích. Lỗi có thể do URL không hợp lệ, kênh riêng tư, hoặc AI không tìm thấy đủ thông tin. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderTabs = () => (
      <div className="mb-6 border-b border-dark-border">
          <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
              {(['overview', 'strategy', 'content', 'seo', 'branding'] as AnalysisTab[]).map(tab => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-4 border-b-2 font-semibold text-sm transition-colors ${activeTab === tab ? 'border-sky-400 text-sky-400' : 'border-transparent text-medium-text hover:text-light-text'}`}
                  >
                      { {overview: 'Tổng Quan', strategy: 'Chiến Lược Ngách', content: 'Nội Dung', seo: 'SEO', branding: 'Branding'}[tab] }
                  </button>
              ))}
          </nav>
      </div>
    );
    
    const renderContent = () => {
        if (!analysis) return null;
        switch(activeTab) {
            case 'overview':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <AnalysisSection title="Điểm Mạnh" icon={<CheckCircleIcon className="w-5 h-5 text-emerald-400"/>}>
                             {analysis.strengths.map((item, i) => <div key={i}><p className="font-semibold text-light-text">{item.point}</p><p className="text-sm text-medium-text">{item.explanation}</p></div>)}
                        </AnalysisSection>
                        <AnalysisSection title="Điểm Yếu" icon={<XCircleIcon className="w-5 h-5 text-amber-400"/>}>
                             {analysis.weaknesses.map((item, i) => <div key={i}><p className="font-semibold text-light-text">{item.point}</p><p className="text-sm text-medium-text">{item.explanation}</p></div>)}
                        </AnalysisSection>
                    </div>
                );
            case 'strategy':
                 return (
                    <div className="space-y-4 animate-fade-in">
                        <AnalysisSection title="Bản Đồ Ngách & DNA" icon={<SitemapIcon className="w-5 h-5 text-cyan-400" />}>
                           <div>
                                <h5 className="font-semibold text-light-text mb-2">"Luật chơi ngầm" của ngách này:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm text-medium-text">
                                  {analysis.niche_map_and_uncharted_territory.niche_dna.map((dna, i) => <li key={i}>{dna}</li>)}
                                </ul>
                           </div>
                        </AnalysisSection>
                        <AnalysisSection title="Lãnh Thổ Chưa Khai Phá (Mỏ Vàng)" icon={<RocketIcon className="w-5 h-5 text-rose-400" />}>
                            {analysis.niche_map_and_uncharted_territory.uncharted_territory.map((item, i) => (
                                <div key={i} className="border-l-2 border-rose-400 pl-3">
                                    <p className="font-semibold text-light-text">{item.gap}</p>
                                    <p className="text-sm text-medium-text">{item.opportunity}</p>
                                </div>
                            ))}
                        </AnalysisSection>
                    </div>
                );
            case 'content':
                return (
                     <div className="space-y-4 animate-fade-in">
                        <AnalysisSection title="Đánh giá nội dung">
                            <ScoreDisplay scoreData={analysis.content_analysis.content_score} color="text-emerald-400" />
                        </AnalysisSection>
                        <AnalysisSection title="Chủ đề thành công">
                             {analysis.content_analysis.successful_topics.map((item, i) => <div key={i}><p className="font-semibold text-light-text">{item.topic}</p><p className="text-sm text-medium-text">{item.reason}</p></div>)}
                        </AnalysisSection>
                         <AnalysisSection title="Định dạng phổ biến">
                            <div className="flex flex-wrap gap-2">
                                {analysis.content_analysis.common_formats.map(f => <span key={f} className="text-xs bg-dark-card text-cyan-300 px-2 py-1 rounded-full border border-dark-border">{f}</span>)}
                            </div>
                        </AnalysisSection>
                    </div>
                );
            case 'seo':
                return (
                    <div className="space-y-4 animate-fade-in">
                        <AnalysisSection title="Đánh giá SEO">
                           <ScoreDisplay scoreData={analysis.seo_analysis.optimization_score} color="text-sky-400" />
                        </AnalysisSection>
                        <AnalysisSection title="Mẫu tiêu đề">
                             {analysis.seo_analysis.title_patterns.map((item, i) => <p key={i} className="text-sm text-medium-text italic">"{item}"</p>)}
                        </AnalysisSection>
                         <AnalysisSection title="Từ khóa chính">
                            <div className="flex flex-wrap gap-2">
                                {analysis.seo_analysis.main_keywords.map(f => <span key={f} className="text-xs bg-dark-card text-cyan-300 px-2 py-1 rounded-full border border-dark-border">{f}</span>)}
                            </div>
                        </AnalysisSection>
                    </div>
                );
            case 'branding':
                 return (
                    <div className="space-y-4 animate-fade-in">
                        <AnalysisSection title="Đánh giá Branding">
                           <ScoreDisplay scoreData={analysis.branding_analysis.branding_score} color="text-rose-400" />
                        </AnalysisSection>
                        <AnalysisSection title="Giải mã Thumbnail" icon={<EyeIcon className="w-5 h-5 text-amber-400"/>}>
                            <p className="text-sm"><strong className="font-semibold text-light-text">Cảm xúc:</strong> {analysis.branding_analysis.thumbnail_deconstruction.emotion}</p>
                            <p className="text-sm"><strong className="font-semibold text-light-text">Bố cục:</strong> {analysis.branding_analysis.thumbnail_deconstruction.layout}</p>
                            <p className="text-sm"><strong className="font-semibold text-light-text">Tín hiệu thị giác:</strong> {analysis.branding_analysis.thumbnail_deconstruction.visual_cues}</p>
                        </AnalysisSection>
                        <AnalysisSection title="Công thức Thumbnail Vượt Trội" icon={<LightbulbIcon className="w-5 h-5 text-emerald-400"/>}>
                           <p className="text-sm text-medium-text">{analysis.branding_analysis.superior_thumbnail_formula}</p>
                        </AnalysisSection>
                        <AnalysisSection title="Nhận xét Branding Kênh">
                            <p className="text-sm text-medium-text">{analysis.branding_analysis.channel_branding_feedback}</p>
                        </AnalysisSection>
                    </div>
                );
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <form onSubmit={handleAnalyze} className="space-y-4 bg-dark-card border border-dark-border p-6 rounded-xl sticky top-24">
                    <h2 className="text-lg font-semibold text-light-text">
                        Phân Tích Đối Thủ
                    </h2>
                     <p className="text-sm text-medium-text">
                        Dán URL của một kênh hoặc video đối thủ, AI sẽ thực hiện một cuộc do thám toàn diện và vạch ra kế hoạch tác chiến cho bạn.
                    </p>
                    <div>
                        <label htmlFor="url" className="text-sm font-medium text-medium-text">URL Kênh/Video Đối Thủ *</label>
                        <input 
                            id="url" 
                            name="url" 
                            type="url" 
                            value={channelUrl} 
                            onChange={(e) => setChannelUrl(e.target.value)} 
                            placeholder="https://www.youtube.com/@tên-kênh" 
                            className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 mt-1" 
                            disabled={isLoading} 
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !channelUrl.trim()}
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold p-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-dark-border transition-colors"
                    >
                        {isLoading ? 'Đang phân tích...' : <><SparklesIcon className="w-5 h-5" /> Phân tích đối thủ</>}
                    </button>
                </form>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                 <h2 className="text-lg font-semibold mb-4 px-2">Báo Cáo Tác Chiến</h2>
                 <div className="h-[75vh] overflow-y-auto pr-2">
                    {isLoading && <div className="text-center p-8">
                        <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-sky-400 mx-auto mb-4"></div>
                        <p className="font-semibold">AI đang do thám đối thủ...</p>
                        <p className="text-sm text-medium-text">(Quá trình này có thể mất một chút thời gian)</p>
                    </div>}
                    {error && <p className="p-4 text-red-400 bg-red-900/30 rounded-lg">{error}</p>}
                    {analysis && !isLoading ? (
                        <div className="space-y-6 animate-fade-in p-2">
                             <div className="bg-dark-bg p-3 rounded-lg border border-dark-border text-center">
                                <h3 className="font-bold text-lg text-sky-400">{analysis.channel_name}</h3>
                                <div className="flex justify-center gap-6 mt-1 text-sm text-medium-text">
                                    <span>Subscribers: <span className="font-semibold text-light-text">{analysis.estimated_subscribers}</span></span>
                                    <span>Videos: <span className="font-semibold text-light-text">{analysis.estimated_videos}</span></span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-sky-400 mb-2">Tóm Tắt Chiến Lược</h3>
                                <p className="text-sm text-medium-text bg-dark-bg p-3 rounded-lg border border-dark-border">{analysis.analysis_summary}</p>
                            </div>
                            
                            <AnalysisSection title="Lỗ Hổng Chiến Lược & Kế Hoạch Tấn Công">
                                 {analysis.strategic_vulnerabilities_and_attack_plan.map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <TargetIcon className="w-6 h-6 flex-shrink-0 text-amber-400 mt-0.5"/>
                                            <div>
                                                <h5 className="font-semibold text-light-text">Lỗ hổng:</h5>
                                                <p className="text-sm text-medium-text">{item.vulnerability}</p>
                                            </div>
                                        </div>
                                         <div className="flex items-start gap-2">
                                            <RocketIcon className="w-6 h-6 flex-shrink-0 text-emerald-400 mt-0.5"/>
                                            <div>
                                                <h5 className="font-semibold text-light-text">Kế hoạch tấn công:</h5>
                                                <p className="text-sm text-medium-text">{item.attack_plan}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </AnalysisSection>

                            {renderTabs()}
                            {renderContent()}

                             {references.length > 0 && (
                                <AnalysisSection title="Nguồn Tham Khảo">
                                     {references.map((ref, i) => (
                                        <a key={i} href={ref.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-cyan-400 hover:underline break-all">
                                            <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
                                            <span>{ref.title || ref.uri}</span>
                                        </a>
                                    ))}
                                </AnalysisSection>
                            )}

                        </div>
                    ) : (
                        !isLoading && <p className="text-medium-text p-4 text-center">Kết quả phân tích sẽ xuất hiện ở đây.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default CompetitorAnalyzer;