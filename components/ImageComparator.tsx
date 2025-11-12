
import React, { useState, useRef, useEffect, useContext } from 'react';
import { TranslationsContext } from '../context/TranslationsContext';

interface ImageComparatorProps {
  originalImage: string;
  redesignedImage: string;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, redesignedImage }) => {
  const { t } = useContext(TranslationsContext);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };
  
  // Use key to force re-mount when images change, resetting the slider
  const componentKey = `${originalImage.substring(0,30)}-${redesignedImage.substring(0,30)}`;

  useEffect(() => {
    setSliderPosition(50);
  }, [redesignedImage]);


  return (
    <div key={componentKey} className="w-full aspect-video relative rounded-lg overflow-hidden select-none border border-slate-700" ref={containerRef}>
      <img
        src={originalImage}
        alt={t('originalImageAlt')}
        className="absolute inset-0 w-full h-full object-cover"
        draggable="false"
      />
      <div
        className="absolute inset-0 w-full h-full"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={redesignedImage}
          alt={t('redesignedImageAlt')}
          className="absolute inset-0 w-full h-full object-cover"
          draggable="false"
        />
      </div>

      <div
        className="absolute top-0 bottom-0 bg-white w-1 cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 bg-white rounded-full h-9 w-9 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute inset-0 w-full h-full cursor-ew-resize opacity-0"
        aria-label={t('imageSliderAria')}
      />
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded" style={{ opacity: sliderPosition > 20 ? 0 : 1, transition: 'opacity 0.2s' }}>{t('originalLabel')}</div>
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded" style={{ opacity: sliderPosition > 80 ? 1 : 0, transition: 'opacity 0.2s' }}>{t('redesignedLabel')}</div>
    </div>
  );
};