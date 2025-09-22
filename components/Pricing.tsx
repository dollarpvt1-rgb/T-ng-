import React from 'react';

const PricingCard: React.FC<{ title: string; price: string; features: string[]; popular?: boolean }> = ({ title, price, features, popular }) => {
  return (
    <div className={`border rounded-xl p-8 flex flex-col ${popular ? 'border-brand-blue' : 'border-dark-border'}`}>
        {popular && <span className="bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">Phổ Biến Nhất</span>}
        <h3 className="text-2xl font-bold text-light-text mb-2">{title}</h3>
        <p className="text-medium-text mb-6">Dành cho các cá nhân và đội nhóm nhỏ.</p>
        <div className="mb-6">
            <span className="text-4xl font-extrabold text-light-text">{price}</span>
            <span className="text-medium-text">/tháng</span>
        </div>
        <ul className="space-y-4 text-medium-text mb-8 flex-grow">
            {features.map(feature => (
                <li key={feature} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                </li>
            ))}
        </ul>
        <button className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors ${popular ? 'bg-brand-blue hover:bg-blue-600 text-white' : 'bg-dark-card hover:bg-dark-border text-light-text'}`}>
            Bắt Đầu
        </button>
    </div>
  );
}

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-light-text to-medium-text">
                Gói Giá Linh Hoạt
            </h2>
            <p className="text-lg md:text-xl text-medium-text">
                Chọn gói phù hợp với nhu cầu của bạn và bắt đầu xây dựng tương lai với AI ngay hôm nay.
            </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard title="Cá Nhân" price="$19" features={['Truy cập 10 công cụ', '100 tín dụng/tháng', 'Hỗ trợ qua email']} />
          <PricingCard title="Chuyên Nghiệp" price="$49" features={['Truy cập tất cả công cụ', '500 tín dụng/tháng', 'Hỗ trợ ưu tiên', 'Tích hợp API']} popular />
          <PricingCard title="Doanh Nghiệp" price="Liên hệ" features={['Truy cập không giới hạn', 'Tín dụng tùy chỉnh', 'Hỗ trợ chuyên biệt', 'Bảo mật nâng cao']} />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
