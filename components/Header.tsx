import React, { useContext } from 'react';
import { TranslationsContext, Language } from '../context/TranslationsContext';

interface HeaderProps {
    onReset: () => void;
    showReset: boolean;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onSave: () => void;
    canSave: boolean;
}

const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'fa', name: 'فارسی' },
];

export const Header: React.FC<HeaderProps> = ({ onReset, showReset, onUndo, onRedo, canUndo, canRedo, onSave, canSave }) => {
  const { language, setLanguage, t } = useContext(TranslationsContext);

  return (
    <header className="flex justify-between items-center pb-4 border-b border-slate-700/50">
        <div className="flex items-center">
            <span className="text-2xl font-bold tracking-tight text-slate-100">VividSpace</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="relative">
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="appearance-none bg-slate-700 text-slate-300 rounded-md py-2 pl-9 pr-4 cursor-pointer hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    aria-label={t('languageSelectorLabel')}
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.944A5.962 5.962 0 0110 6c1.506 0 2.842.55 3.832 1.444.195.174.43.294.688.353A4.468 4.468 0 0115.5 8c.827 0 1.573.34 2.121.879.548.538.879 1.284.879 2.121s-.331 1.583-.879 2.121A2.982 2.982 0 0115.5 14a2.982 2.982 0 01-2.121-.879A2.982 2.982 0 0112.5 11c0-.495.12-1.022.353-1.472a3.49 3.49 0 00-.688.353A5.962 5.962 0 0110 14c-1.506 0-2.842-.55-3.832-1.444a3.49 3.49 0 00-.688-.353A4.468 4.468 0 014.5 12c-.827 0-1.573-.34-2.121-.879A2.982 2.982 0 011.5 9c0-.837.331-1.583.879-2.121A2.982 2.982 0 014.5 6a2.982 2.982 0 012.121.879 2.982 2.982 0 01.879 2.121z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <button 
                onClick={onSave}
                disabled={!canSave}
                title={t('saveAsPdfTooltip')}
                className="p-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </button>
            <button 
                onClick={onUndo}
                disabled={!canUndo}
                title={t('undoTooltip')}
                className="p-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8A5 5 0 0 0 21 8a5.002 5.002 0 0 0-4.291-4.935" />
                </svg>
            </button>
            <button 
                onClick={onRedo}
                disabled={!canRedo}
                title={t('redoTooltip')}
                className="p-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H5a5 5 0 0 0-5 5v2" />
                </svg>
            </button>
            {showReset && (
                <button 
                    onClick={onReset}
                    className="px-4 py-2 bg-slate-700 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                    {t('startOverButton')}
                </button>
            )}
        </div>
    </header>
  )
};