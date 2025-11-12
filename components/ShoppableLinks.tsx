
import React, { useContext } from 'react';
import { TranslationsContext } from '../context/TranslationsContext';

export const ShoppableLinks: React.FC = () => {
  const { t } = useContext(TranslationsContext);

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <h3 className="font-semibold mb-3 text-rose-400">{t('shoppableTitle')}</h3>
      <div className="space-y-2 text-sm">
        <a href="https://google.com/search?q=shop+modern+sofa" target="_blank" rel="noopener noreferrer" className="block text-slate-300 hover:text-white transition-colors">
          › {t('shoppableLink1')}
        </a>
        <a href="https://google.com/search?q=shop+minimalist+rug" target="_blank" rel="noopener noreferrer" className="block text-slate-300 hover:text-white transition-colors">
          › {t('shoppableLink2')}
        </a>
        <a href="https://google.com/search?q=shop+pendant+lighting" target="_blank" rel="noopener noreferrer" className="block text-slate-300 hover:text-white transition-colors">
          › {t('shoppableLink3')}
        </a>
      </div>
    </div>
  );
};