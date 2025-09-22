import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import ToolCard from './components/ToolCard';
import CategoryPill from './components/CategoryPill';
import Pricing from './components/Pricing';
import About from './components/About';
import AuthModal from './components/AuthModal';
import ToolDetailModal from './components/ToolDetailModal';
import ToolWorkspace from './components/ToolWorkspace';
import { CATEGORIES, AI_TOOLS } from './constants';
import { AITool } from './types';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setSignupModalOpen] = useState(false);
  const [viewingToolDetails, setViewingToolDetails] = useState<AITool | null>(null);
  const [activeTool, setActiveTool] = useState<AITool | null>(null);
  const [initialToolData, setInitialToolData] = useState<any>(null);


  const filteredTools = selectedCategory === 'all'
    ? AI_TOOLS
    : AI_TOOLS.filter(tool => {
        const categoryObject = CATEGORIES.find(cat => cat.id === selectedCategory);
        return categoryObject && tool.category === categoryObject.name;
      });

  const handleGoogleSignIn = () => {
    // QUAN TRỌNG: Bạn cần thay thế giá trị này bằng Client ID thực tế từ Google Cloud Console.
    const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
    
    // URL này nên khớp với một trong các "Authorized redirect URIs" bạn đã cấu hình trong Google Console.
    const REDIRECT_URI = window.location.origin;

    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    const params = {
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'consent',
    };

    const url = `${oauth2Endpoint}?${Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`;
    
    // Chuyển hướng người dùng đến trang đăng nhập của Google.
    window.location.href = url;
  };

  const handleAccessTool = (tool: AITool) => {
    setViewingToolDetails(null);
    setInitialToolData(null); // Xóa dữ liệu cũ khi truy cập công cụ mới
    setActiveTool(tool);
  };
  
  const handleBackToMarketplace = () => {
    setActiveTool(null);
    setInitialToolData(null); // Dọn dẹp khi quay về chợ
  };

  const handleNavigateWithData = (toolId: string, data: any) => {
    const tool = AI_TOOLS.find(t => t.id === toolId);
    if (tool) {
      setInitialToolData(data);
      setActiveTool(tool);
      // Cuộn lên đầu trang để người dùng thấy công cụ mới
      window.scrollTo(0, 0);
    }
  };


  const renderMarketplace = () => (
    <>
      <Hero onSignupClick={() => setSignupModalOpen(true)} onGoogleSignupClick={handleGoogleSignIn} />
      <section id="tools" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Khám Phá Bộ Sưu Tập Công Cụ AI
            </h2>
            <p className="text-lg text-medium-text max-w-2xl mx-auto">
              Duyệt qua danh sách được tuyển chọn của chúng tôi về các công cụ AI hàng đầu trong ngành.
            </p>
          </div>
          
          <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12">
            {CATEGORIES.map(category => (
              <CategoryPill
                key={category.id}
                label={category.name}
                isActive={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool: AITool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                onDetailsClick={() => setViewingToolDetails(tool)}
              />
            ))}
          </div>
        </div>
      </section>
      <Pricing />
      <About />
    </>
  );

  return (
    <div className="bg-dark-bg text-light-text min-h-screen font-sans">
      {!activeTool?.fullscreen && (
        <Header 
          onLoginClick={() => setLoginModalOpen(true)}
          onSignupClick={() => setSignupModalOpen(true)}
        />
      )}
      <main className={activeTool?.fullscreen ? 'flex flex-col h-screen' : ''}>
        {activeTool ? (
          <ToolWorkspace 
            tool={activeTool} 
            initialData={initialToolData}
            onGoBack={handleBackToMarketplace} 
            onNavigate={handleNavigateWithData}
          />
        ) : (
          renderMarketplace()
        )}
      </main>
      {!activeTool?.fullscreen && (
        <Footer />
      )}
      <AuthModal 
        mode="login" 
        isOpen={isLoginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onGoogleAuthClick={handleGoogleSignIn}
      />
      <AuthModal 
        mode="signup" 
        isOpen={isSignupModalOpen} 
        onClose={() => setSignupModalOpen(false)} 
        onGoogleAuthClick={handleGoogleSignIn}
      />
      <ToolDetailModal 
        tool={viewingToolDetails}
        onClose={() => setViewingToolDetails(null)}
        onAccessTool={handleAccessTool}
      />
    </div>
  );
}

export default App;
