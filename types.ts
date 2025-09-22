import React from 'react';

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
  price: string;
  tags: string[];
  icon: React.ReactNode;
  status?: 'active' | 'coming_soon';
  features?: string[];
  gallery?: string[];
  websiteUrl?: string;
  fullscreen?: boolean;
}
