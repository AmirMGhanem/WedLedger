'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '@/lib/i18n';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('he');

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('wedledger_language') || 'he';
    setLanguageState(savedLang);
    i18n.changeLanguage(savedLang);
    
    // Set HTML direction
    document.documentElement.dir = savedLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('wedledger_language', lang);
    
    // Set HTML direction
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

