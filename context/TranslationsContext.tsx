
import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'fa';

// Define the shape of the context
interface TranslationsContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create the context with a default value
export const TranslationsContext = createContext<TranslationsContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

const RTL_LANGUAGES: Language[] = ['fa'];

// Create a provider component
export const TranslationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load translations for the current language
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`Could not load ${language}.json`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Failed to fetch translations:", error);
        // Fallback to English if the selected language file fails
        if (language !== 'en') {
          setLanguageState('en');
        }
      }
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    // Handle RTL text direction
    if (RTL_LANGUAGES.includes(language)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);


  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <TranslationsContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationsContext.Provider>
  );
};