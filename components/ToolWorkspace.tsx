import React from 'react';
import { AITool } from '../types';
import { ArrowLeftIcon } from './icons/Icons';
import VisionCraftUI from './tools/VisionCraftUI';
import ScriptProUI from './tools/ScriptProUI';
import ContentMasterUI from './tools/ContentMasterUI';
import EchoVidUI from './tools/EchoVidUI';

interface ToolWorkspaceProps {
  tool: AITool;
  initialData?: any;
  onGoBack: () => void;
  onNavigate: (toolId: string, data: any) => void;
}

const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({ tool, initialData, onGoBack, onNavigate }) => {
  const renderToolUI = () => {
    switch (tool.id) {
      case 'visioncraft':
        return <VisionCraftUI />;
      case 'echovid':
        return <EchoVidUI initialData={initialData} />;
      case 'script-pro':
        return <ScriptProUI onNavigateToVideo={onNavigate} />;
      case 'content-master':
        return <ContentMasterUI />;
      default:
        return (
          <div className="text-center p-8 bg-dark-card border border-dark-border rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Công Cụ Đang Được Phát Triển</h3>
            <p className="text-medium-text">Giao diện cho công cụ "{tool.name}" sẽ sớm có mặt. Vui lòng quay lại sau!</p>
          </div>
        );
    }
  };

  return (
    <div className={`animate-fade-in ${tool.fullscreen ? 'flex-grow flex flex-col' : 'container mx-auto px-4 py-8 md:py-12'}`}>
      {!tool.fullscreen && (
        <>
          <button 
            onClick={onGoBack} 
            className="flex items-center gap-2 text-medium-text hover:text-light-text font-semibold mb-8 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Quay Lại Chợ Công Cụ</span>
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-dark-card p-3 rounded-lg border border-dark-border">
                {tool.icon}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{tool.name}</h1>
            </div>
            <p className="text-lg text-medium-text max-w-3xl">{tool.description}</p>
          </div>
        </>
      )}

      <div className={tool.fullscreen ? 'flex-grow' : ''}>
        {renderToolUI()}
      </div>
    </div>
  );
};

export default ToolWorkspace;