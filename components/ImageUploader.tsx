
import React, { useRef, useContext } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { TranslationsContext } from '../context/TranslationsContext';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  labelKey?: string; // e.g., 'uploadRoomPhoto', 'applyCustomTexture'
  small?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, labelKey = 'uploadRoomPhoto', small = false }) => {
  const { t } = useContext(TranslationsContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const label = t(labelKey);

  if (small) {
    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <button
          onClick={handleClick}
          className="w-full h-12 px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {label}
        </button>
      </>
    );
  }

  return (
    <div
      className="w-full max-w-lg border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-rose-500 hover:bg-slate-800/50 transition-colors"
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div className="flex flex-col items-center justify-center">
        <UploadIcon className="w-12 h-12 text-slate-500 mb-4" />
        <p className="text-xl font-semibold text-slate-200">{label}</p>
        <p className="text-sm text-slate-400 mt-1">{t('fileTypes')}</p>
      </div>
    </div>
  );
};