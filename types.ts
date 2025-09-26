import React from 'react';

// Cập nhật các gói đăng ký để phản ánh mô hình kinh doanh mới
export type SubscriptionPlan = 'free' | 'creator' | 'professional' | 'team';

// Xác định các cấp độ truy cập cho công cụ
export type AccessLevel = 'free' | 'creator' | 'professional';

export interface Category {
  id: string;
  name: string;
}

export interface AITool {
  id: string;
  name: string;
  category: string;
  description: string;
  longDescription?: string;
  tags: string[];
  icon: React.ReactNode;
  status?: 'active' | 'coming_soon';
  features?: string[];
  gallery?: string[];
  websiteUrl?: string;
  fullscreen?: boolean;
  
  // --- Thay đổi mô hình kinh doanh ---
  accessLevel: AccessLevel; // Cấp độ tối thiểu để truy cập công cụ
  usageType: 'unlimited' | 'credits'; // Cách tính phí sử dụng
  creditCost?: number; // Chi phí tín dụng nếu usageType là 'credits'
  specialFeature?: boolean; // Đánh dấu là tính năng đặc thù của gói cao cấp
}

export const __dummy = true;