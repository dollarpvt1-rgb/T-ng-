import React from 'react';
import { SubscriptionPlan } from '../types.js';
import { CheckCircleIcon, RocketIcon, UsersIcon, InfinityIcon } from './icons/Icons.js';

interface PricingCardProps {
  plan: SubscriptionPlan;
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  credits: string;
  features: string[];
  excludedFeatures?: string[];
  popular?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

const FeatureItem: React.FC<{ children: React.ReactNode, included?: boolean }> = ({ children, included = true }) => (
    <li className={`flex items-start gap-3 ${included ? 'text-medium-text' : 'text-gray-500 line-through'}`}>
        <CheckCircleIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${included ? 'text-emerald-400' : 'text-gray-600'}`} />
        <span>{children}</span>
    </li>
);

const PricingCard: React.FC<PricingCardProps> = ({ plan, title, price, priceNote, description, credits, features, excludedFeatures, popular, onSelect }) => {
  return (
    <div className={`border rounded-2xl p-8 flex flex-col relative overflow-hidden ${popular ? 'border-brand-purple shadow-2xl shadow-brand-purple/10' : 'border-dark-border'}`}>
        {popular && (
            <div className="absolute top-0 right-0">
                <div className="w-32 h-32" style={{ transform: 'translate(50%, -50%) rotate(45deg)', backgroundColor: 'var(--brand-purple)' }}></div>
                <span className="absolute top-5 right-1 text-white text-xs font-bold transform -rotate-45" style={{ transform: 'rotate(45deg)', top: '18px', right: '18px' }}>Phổ Biến</span>
            </div>
        )}
        <h3 className="text-2xl font-bold text-light-text mb-2">{title}</h3>
        <p className="text-medium-text mb-6 h-12">{description}</p>
        
        <div className="mb-6">
            <span className="text-5xl font-extrabold text-light-text">{price}</span>
            <span className="text-medium-text ml-1">/tháng</span>
            {priceNote && <p className="text-xs text-medium-text mt-1">{priceNote}</p>}
        </div>

        <div className="mb-6 bg-dark-bg border border-dark-border rounded-lg p-4 text-center">
            <p className="font-bold text-2xl text-amber-400">{credits}</p>
            <p className="text-sm text-medium-text">Tín dụng mỗi tháng</p>
        </div>

        <ul className="space-y-3 text-medium-text mb-8 flex-grow">
            {features.map(feature => <FeatureItem key={feature}>{feature}</FeatureItem>)}
            {excludedFeatures?.map(feature => <FeatureItem key={feature} included={false}>{feature}</FeatureItem>)}
        </ul>
        <button onClick={() => onSelect(plan)} className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${popular ? 'bg-brand-purple hover:bg-purple-700 text-white' : 'bg-dark-card hover:bg-dark-border text-light-text'}`}>
            Chọn Gói
        </button>
    </div>
  );
}

interface PricingProps {
  onPlanSelect: (plan: SubscriptionPlan) => void;
}

const Pricing: React.FC<PricingProps> = ({ onPlanSelect }) => {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-light-text to-medium-text">
                Gói Giá Dành Cho Mọi Nhu Cầu
            </h2>
            <p className="text-lg md:text-xl text-medium-text">
                Từ những bước đầu tiên đến việc thống trị thị trường, chúng tôi có gói phù hợp cho bạn.
            </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          <PricingCard 
            plan="free"
            title="Miễn Phí" 
            price="0đ" 
            description="Tuyệt vời để trải nghiệm và khám phá các công cụ cơ bản."
            credits="20"
            features={[
                'Sử dụng không giới hạn các công cụ cơ bản',
                'Liên kết 1 tài khoản MXH',
            ]}
            excludedFeatures={[
                'Công cụ tạo giọng nói AI',
                'Các tính năng đặc thù (Phân tích, SEO)',
                'Công cụ tạo Video AI'
            ]}
            onSelect={onPlanSelect}
          />
          <PricingCard 
            plan="creator"
            title="Người Sáng Tạo" 
            price="299k" 
            description="Dành cho các nhà sáng tạo nội dung cá nhân muốn tăng tốc."
            credits="50"
            features={[
                'Mọi thứ trong gói Miễn Phí',
                'Sử dụng công cụ tạo giọng nói AI',
                'Liên kết 3 tài khoản MXH',
            ]}
             excludedFeatures={[
                'Các tính năng đặc thù (Phân tích, SEO)',
                'Công cụ tạo Video AI'
            ]}
            onSelect={onPlanSelect}
          />
          <PricingCard 
            plan="professional"
            title="Chuyên Nghiệp" 
            price="499k" 
            description="Giải pháp toàn diện để thống trị ngách của bạn với bộ công cụ mạnh mẽ nhất."
            credits="1.200"
            features={[
                'Mọi thứ trong gói Người Sáng Tạo',
                'Mở khóa TOÀN BỘ tính năng đặc thù',
                'Sử dụng công cụ tạo Video AI',
                'Truy cập sớm các công cụ mới',
                'Liên kết 10 tài khoản MXH',
                'Hỗ trợ ưu tiên',
            ]} 
            popular 
            onSelect={onPlanSelect}
          />
           <PricingCard 
            plan="team"
            title="Đội Nhóm" 
            price="1.190k" 
            priceNote="cho 3 thành viên"
            description="Dành cho các agency và đội nhóm cần sự hợp tác và hiệu suất tối đa."
            credits="3.000"
            features={[
                'Tất cả tính năng của gói Chuyên Nghiệp',
                '3 suất thành viên (seats)',
                'Tín dụng dùng chung cho cả đội',
                'Quản lý thành viên (sắp có)',
            ]} 
            onSelect={onPlanSelect}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;