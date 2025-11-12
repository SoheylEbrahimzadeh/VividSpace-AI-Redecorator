
import React, { useContext } from 'react';
import { TranslationsContext } from '../context/TranslationsContext';

interface DesignSummaryProps {
  history: string[];
}

export const DesignSummary: React.FC<DesignSummaryProps> = ({ history }) => {
  const { t } = useContext(TranslationsContext);
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <h3 className="font-semibold mb-3 text-rose-400">{t('summaryTitle')}</h3>
      <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300 mb-4">
        {history.map((item, index) => (
          <li key={index} className="truncate">{item}</li>
        ))}
      </ol>
      <div className="border-t border-slate-600 pt-3 text-xs text-slate-400">
        <p className="font-bold">{t('summaryCredit')}:</p>
        <p>{t('summaryAttribution')}</p>
      </div>
    </div>
  );
};