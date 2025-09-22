import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

interface APIKeyContextType {
  apiKey: string | null;
  saveApiKey: (key: string) => void;
  clearApiKey: () => void;
  requestApiKey: () => void;
}

const APIKeyContext = createContext<APIKeyContextType | undefined>(undefined);

interface APIKeyProviderProps {
  children: ReactNode;
  onRequestApiKey: () => void;
}

export const APIKeyProvider: React.FC<APIKeyProviderProps> = ({ children, onRequestApiKey }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('google-ai-api-key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    } catch (error) {
      console.error("Không thể truy cập localStorage:", error);
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    try {
        if (key.trim()) {
            localStorage.setItem('google-ai-api-key', key.trim());
            setApiKey(key.trim());
        } else {
            clearApiKey();
        }
    } catch (error) {
        console.error("Không thể lưu vào localStorage:", error);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    try {
        localStorage.removeItem('google-ai-api-key');
        setApiKey(null);
    } catch (error) {
        console.error("Không thể xóa khỏi localStorage:", error);
    }
  }, []);
  
  const requestApiKey = useCallback(() => {
    onRequestApiKey();
  }, [onRequestApiKey]);

  return (
    <APIKeyContext.Provider value={{ apiKey, saveApiKey, clearApiKey, requestApiKey }}>
      {children}
    </APIKeyContext.Provider>
  );
};

export const useAPIKey = (): APIKeyContextType => {
  const context = useContext(APIKeyContext);
  if (context === undefined) {
    throw new Error('useAPIKey phải được sử dụng trong một APIKeyProvider');
  }
  return context;
};