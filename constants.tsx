import React from 'react';
import { Category, AITool } from './types.js';
import { ImageIcon, PencilIcon, VideoIcon, CodeIcon, BrainIcon, ChartIcon, MicIcon, RocketIcon } from './components/icons/Icons.js';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'image', name: 'Tạo Hình Ảnh' },
  { id: 'text', name: 'Văn Bản & Viết Lách' },
  { id: 'video', name: 'Tạo Video' },
  { id: 'audio', name: 'Âm Thanh' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'dev', name: 'Phát Triển (Sắp có)' },
];

export const AI_TOOLS: AITool[] = [
  {
    id: 'visioncraft',
    name: 'VisionCraft AI',
    category: 'Tạo Hình Ảnh',
    description: 'Tạo ra những hình ảnh tuyệt đẹp, độ phân giải cao từ các mô tả văn bản đơn giản. Hoàn hảo cho nghệ sĩ và nhà tiếp thị.',
    longDescription: 'VisionCraft AI là một công cụ tạo hình ảnh hàng đầu, cho phép bạn biến những ý tưởng phức tạp nhất thành hiện thực chỉ bằng vài từ. Sử dụng các mô hình khuếch tán tiên tiến, nó cung cấp khả năng kiểm soát chi tiết về phong cách, ánh sáng và bố cục, giúp bạn tạo ra các tác phẩm nghệ thuật độc đáo, hình ảnh sản phẩm chân thực hoặc các concept marketing đột phá.',
    tags: ['Thiết kế', 'Nghệ thuật', 'Sáng tạo'],
    icon: <ImageIcon className="w-8 h-8 text-cyan-400" />,
    status: 'active',
    accessLevel: 'free',
    usageType: 'unlimited', // Không giới hạn cho các gói trả phí
    features: [
      'Tạo ảnh từ văn bản với độ chính xác cao',
      'Nhiều mô hình nghệ thuật: tả thực, anime, 3D...',
      'Tùy chỉnh độ phân giải lên đến 4K',
      'Tính năng "Outpainting" để mở rộng hình ảnh',
      'Giao diện kéo-thả trực quan',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1679083216318-3c18084a9507?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1690161439243-7f6516081515?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1677759223599-0a8ca8c19b0a?q=80&w=800&auto=format&fit=crop',
    ],
    websiteUrl: '#',
  },
  {
    id: 'script-pro',
    name: 'Kịch Bản Pro',
    category: 'Văn Bản & Viết Lách',
    description: 'Trợ lý AI giúp bạn sáng tạo kịch bản. Các tính năng phân tích nâng cao dành cho gói Chuyên Nghiệp.',
    tags: ['Viết kịch bản', 'Sáng tạo', 'YouTube'],
    icon: <PencilIcon className="w-8 h-8 text-amber-400" />,
    status: 'active',
    accessLevel: 'free',
    usageType: 'unlimited', // Công cụ cơ bản không tốn tín dụng
  },
  {
    id: 'content-master',
    name: 'ContentMaster AI',
    category: 'Văn Bản & Viết Lách',
    description: 'Viết lại và tối ưu hóa nội dung của bạn để trở nên độc đáo, hấp dẫn và chuẩn SEO hơn mà không làm thay đổi ý chính.',
    tags: ['Viết lại', 'Nội dung', 'SEO'],
    icon: <PencilIcon className="w-8 h-8 text-amber-400" />,
    status: 'active',
    accessLevel: 'free',
    usageType: 'unlimited',
  },
  {
    id: 'voice-studio',
    name: 'Giọng Nói Studio',
    category: 'Âm Thanh',
    description: 'Chuyển đổi văn bản thành giọng nói AI tự nhiên, truyền cảm. Tiêu thụ tín dụng từ gói của bạn.',
    tags: ['Lồng tiếng', 'Podcast', 'Audiobook'],
    icon: <MicIcon className="w-8 h-8 text-teal-400" />,
    status: 'active',
    accessLevel: 'creator', // Yêu cầu gói Người Sáng Tạo trở lên
    usageType: 'credits',
    creditCost: 1, // /1000 ký tự
  },
   {
    id: 'tuberank',
    name: 'TubeRank AI',
    category: 'Marketing',
    description: 'Phân tích và tối ưu hóa tiêu đề, mô tả, và từ khóa để video YouTube của bạn đạt thứ hạng cao nhất trên kết quả tìm kiếm.',
    tags: ['YouTube', 'SEO', 'Phân tích'],
    icon: <ChartIcon className="w-8 h-8 text-sky-400" />,
    status: 'active',
    accessLevel: 'professional', // Tính năng đặc thù
    usageType: 'unlimited',
    specialFeature: true,
  },
  {
    id: 'echovid',
    name: 'EchoVid AI',
    category: 'Tạo Video',
    description: 'Tạo video chất lượng chuyên nghiệp từ văn bản hoặc kịch bản. Yêu cầu gói Chuyên nghiệp và tiêu tốn tín dụng.',
    tags: ['Video', 'Mạng xã hội', 'Quảng cáo'],
    icon: <VideoIcon className="w-8 h-8 text-rose-400" />,
    status: 'active',
    fullscreen: false,
    accessLevel: 'professional', // Tính năng đặc thù
    usageType: 'credits',
    creditCost: 20,
    specialFeature: true,
  },
   {
    id: 'ai-studio-pro',
    name: 'AI Studio Pro',
    category: 'Tạo Video',
    description: 'Biến ý tưởng thành video ngắn (Shorts, Reels) hoàn chỉnh với kịch bản, hình ảnh, lồng tiếng và phụ đề chỉ trong 5 bước.',
    tags: ['Video ngắn', 'Tự động hóa', 'Sáng tạo nội dung'],
    icon: <RocketIcon className="w-8 h-8 text-rose-400" />,
    status: 'coming_soon',
    fullscreen: true,
    accessLevel: 'professional',
    usageType: 'unlimited',
    specialFeature: true,
     features: [
      'Tự động tạo kịch bản và phân cảnh từ ý tưởng',
      'Tạo hình ảnh (Imagen) và video (Veo) cho mỗi cảnh',
      'Lựa chọn lồng tiếng AI hoặc tự thu âm trực tiếp',
      'Tự động dựng phim và thêm phụ đề động',
      'Xuất video định dạng 9:16 (Shorts, Reels, TikTok)',
      'Giao diện 5 bước trực quan, dễ sử dụng',
    ],
  },
  {
    id: 'codemate',
    name: 'CodeMate AI',
    category: 'Phát Triển (Sắp có)',
    description: 'Một lập trình viên cặp AI giúp bạn viết mã sạch hơn, nhanh hơn, sửa lỗi và học ngôn ngữ mới.',
    tags: ['Phát triển', 'Gỡ lỗi', 'Năng suất'],
    icon: <CodeIcon className="w-8 h-8 text-emerald-400" />,
    status: 'coming_soon',
    accessLevel: 'professional',
    usageType: 'unlimited',
    specialFeature: true,
  },
];