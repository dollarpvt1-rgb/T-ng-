import React, { useState, useCallback } from 'react';
import Header from './components/Header.js';
import Hero from './components/Hero.js';
import Footer from './components/Footer.js';
import ToolCard from './components/ToolCard.js';
import CategoryPill from './components/CategoryPill.js';
import Pricing from './components/Pricing.js';
import About from './components/About.js';
import AuthModal from './components/AuthModal.js';
import ToolDetailModal from './components/ToolDetailModal.js';
import ToolWorkspace from './components/ToolWorkspace.js';
import SettingsModal from './components/SettingsModal.js';
import { CATEGORIES, AI_TOOLS } from './constants.js';
import { AITool, AccessLevel, SubscriptionPlan } from './types.js';

const PLAN_HIERARCHY: Record<SubscriptionPlan, number> = {
  free: 0,
  creator: 1,
  professional: 2,
  team: 3,
};

const ACCESS_LEVEL_HIERARCHY: Record<AccessLevel, number> = {
  free: 0,
  creator: 1,
  professional: 2,
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setSignupModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [viewingToolDetails, setViewingToolDetails] = useState<AITool | null>(null);
  const [activeTool, setActiveTool] = useState<AITool | null>(null);
  const [initialToolData, setInitialToolData] = useState<any>(null);

  // --- Mô phỏng trạng thái đăng nhập và gói đăng ký ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('User');
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('free');
  const [credits, setCredits] = useState(20);

  // --- Mô phỏng trạng thái tài khoản liên kết ---
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({
    youtube: false,
    facebook: false,
    tiktok: false,
  });
  
  // Cập nhật hàm chọn gói theo mô hình mới
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSubscriptionPlan(plan);
    switch (plan) {
      case 'creator':
        setCredits(50);
        break;
      case 'professional':
        setCredits(1200);
        break;
      case 'team':
        setCredits(3000);
        break;
      default: // free
        setCredits(20);
        break;
    }
    // Trong thực tế, điều này sẽ điều hướng đến trang thanh toán
    alert(`Bạn đã chọn gói ${plan}. Cảm ơn bạn đã nâng cấp!`);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setSubscriptionPlan('free');
    setCredits(20);
    setLoginModalOpen(false);
    setSignupModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSubscriptionPlan('free');
    setCredits(0);
  };

  const handleConnect = (platformId: string) => {
    setTimeout(() => {
      setConnectedAccounts(prev => ({ ...prev, [platformId]: true }));
    }, 1500);
  };
  
  const handleDisconnect = (platformId: string) => {
    setConnectedAccounts(prev => ({ ...prev, [platformId]: false }));
  };

  const filteredTools = selectedCategory === 'all'
    ? AI_TOOLS
    : AI_TOOLS.filter(tool => {
        const categoryObject = CATEGORIES.find(cat => cat.id === selectedCategory);
        return categoryObject && tool.category === categoryObject.name;
      });

  const handleGoogleSignIn = () => {
    handleLogin();
  };
  
  const userHasAccess = (tool: AITool): boolean => {
      const userPlanLevel = PLAN_HIERARCHY[subscriptionPlan];
      const toolAccessLevel = ACCESS_LEVEL_HIERARCHY[tool.accessLevel];
      return userPlanLevel >= toolAccessLevel;
  };


  const handleAccessTool = (tool: AITool) => {
    if (!userHasAccess(tool)) {
      alert('Công cụ này yêu cầu gói cao hơn. Vui lòng nâng cấp.');
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setViewingToolDetails(null);
    setInitialToolData(null); 
    setActiveTool(tool);
  };
  
  const handleBackToMarketplace = () => {
    setActiveTool(null);
    setInitialToolData(null);
  };

  const handleNavigateWithData = (toolId: string, data: any) => {
    const tool = AI_TOOLS.find(t => t.id === toolId);
    if (tool) {
      setInitialToolData(data);
      setActiveTool(tool);
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
                hasAccess={userHasAccess(tool)}
                onUpgradeClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              />
            ))}
          </div>
        </div>
      </section>
      <Pricing onPlanSelect={handlePlanSelect} />
      <About />
    </>
  );

  return (
      <div className="bg-dark-bg text-light-text min-h-screen font-sans">
        {!activeTool?.fullscreen && (
          <Header 
            isLoggedIn={isLoggedIn}
            username={username}
            credits={credits}
            onLoginClick={() => setLoginModalOpen(true)}
            onSignupClick={() => setSignupModalOpen(true)}
            onSettingsClick={() => setSettingsModalOpen(true)}
            onLogoutClick={handleLogout}
          />
        )}
        <main className={activeTool?.fullscreen ? 'flex flex-col h-screen' : ''}>
          {activeTool ? (
            <ToolWorkspace 
              tool={activeTool} 
              initialData={initialToolData}
              onGoBack={handleBackToMarketplace} 
              onNavigate={handleNavigateWithData}
              subscriptionPlan={subscriptionPlan}
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
          onAuthSuccess={handleLogin}
        />
        <AuthModal 
          mode="signup" 
          isOpen={isSignupModalOpen} 
          onClose={() => setSignupModalOpen(false)} 
          onGoogleAuthClick={handleGoogleSignIn}
          onAuthSuccess={handleLogin}
        />
        <ToolDetailModal 
          tool={viewingToolDetails}
          onClose={() => setViewingToolDetails(null)}
          onAccessTool={handleAccessTool}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          connectedAccounts={connectedAccounts}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </div>
  );
}

export default App;