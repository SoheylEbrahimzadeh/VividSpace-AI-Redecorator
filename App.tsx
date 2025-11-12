
import React, { useState, useCallback, useContext } from 'react';
import jsPDF from 'jspdf';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageComparator } from './components/ImageComparator';
import { ChatInterface } from './components/ChatInterface';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ShoppableLinks } from './components/ShoppableLinks';
import { DesignSummary } from './components/DesignSummary';
import { redecorateImage, applyTextureToImage, addItemToImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { TranslationsContext } from './context/TranslationsContext';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // FIX: Made aistudio optional to resolve declaration conflict.
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const { t } = useContext(TranslationsContext);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [textureImage, setTextureImage] = useState<string | null>(null);
  const [itemImageToAdd, setItemImageToAdd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  // History state for undo/redo
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const redesignedImage = imageHistory[historyIndex] ?? null;

  const handleApiCall = useCallback(async (apiCall: () => Promise<string | null>, loadingMsg: string) => {
    setIsLoading(true);
    setLoadingMessage(loadingMsg);
    setError(null);
    try {
      const result = await apiCall();
      if (result) {
        const newImage = `data:image/png;base64,${result}`;
        // Create a new history branch from the current point
        const newHistory = imageHistory.slice(0, historyIndex + 1);
        newHistory.push(newImage);
        setImageHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    } catch (err) {
      console.error(err);
      const errorString = JSON.stringify(err);
      if (errorString.includes("NOT_FOUND") || errorString.includes("404") || (err instanceof Error && err.message.includes("API Key not found"))) {
        setError(t('errorApiKey'));
      } else {
         const message = err instanceof Error ? err.message : t('errorUnknown');
         setError(message);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [historyIndex, imageHistory, t]);

  const handleRoomUpload = useCallback(async (file: File) => {
    const base64Image = await fileToBase64(file);
    resetState(); // Reset everything for a new image
    setOriginalImage(base64Image);
    const defaultPrompt = t('initialStylePrompt');
    setChatHistory([defaultPrompt]);
    handleApiCall(() => redecorateImage(base64Image, t('initialRedecorationPrompt')), t('loadingInitial'));
  }, [handleApiCall, t]);

  const handleChatSubmit = useCallback(async (prompt: string) => {
    // The base image for the edit is the latest redesigned image, or the original if we've undone all changes.
    const baseImage = redesignedImage || originalImage;
    if (!baseImage) return;

    setChatHistory(prev => [...prev, prompt]);
    handleApiCall(() => redecorateImage(baseImage, prompt), t('loadingChanges'));
  }, [redesignedImage, originalImage, handleApiCall, t]);
  
  const handleTextureUpload = useCallback(async (file: File) => {
    const base64Texture = await fileToBase64(file);
    setTextureImage(base64Texture);
  }, []);

  const handleApplyTexture = useCallback(() => {
    if (!originalImage || !textureImage) return;
    setChatHistory(prev => [...prev, t('historyApplyTexture')]);
    handleApiCall(() => applyTextureToImage(originalImage, textureImage), t('loadingTexture'));
  }, [originalImage, textureImage, handleApiCall, t]);

  const handleItemImageUpload = useCallback(async (file: File) => {
    const base64Item = await fileToBase64(file);
    setItemImageToAdd(base64Item);
  }, []);

  const handleApplyItem = useCallback(() => {
    const baseImage = redesignedImage || originalImage;
    if (!baseImage || !itemImageToAdd) return;
    setChatHistory(prev => [...prev, t('historyAddItem')]);
    handleApiCall(() => addItemToImage(baseImage, itemImageToAdd), t('loadingItem'));
  }, [redesignedImage, originalImage, itemImageToAdd, handleApiCall, t]);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < imageHistory.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const resetState = () => {
    setOriginalImage(null);
    setTextureImage(null);
    setItemImageToAdd(null);
    setIsLoading(false);
    setError(null);
    setChatHistory([]);
    setImageHistory([]);
    setHistoryIndex(-1);
  };
  
  const handleSavePdf = async () => {
    if (!originalImage || !redesignedImage) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const imageWidth = (pageWidth - margin * 2 - 10) / 2;
    let maxImageBlockHeight = 0;

    const addImageToPdf = (imgSrc: string, x: number, y: number, label: string): Promise<number> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const imageHeight = imageWidth / aspectRatio;
          doc.addImage(imgSrc, 'PNG', x, y, imageWidth, imageHeight);
          
          doc.setFontSize(10);
          doc.text(label, x + imageWidth / 2, y + imageHeight + 5, { align: 'center' });
          resolve(imageHeight + 8); // Total height for image + label
        };
        img.onerror = () => resolve(0); // Resolve with 0 height on error
      });
    };

    doc.setFontSize(18);
    doc.text(t('pdfTitle'), pageWidth / 2, margin, { align: 'center' });
    
    const imageBlockHeights = await Promise.all([
      addImageToPdf(originalImage, margin, 25, t('pdfOriginal')),
      addImageToPdf(redesignedImage, margin + imageWidth + 10, 25, t('pdfRedesigned'))
    ]);
    maxImageBlockHeight = Math.max(...imageBlockHeights);

    let currentY = 25 + maxImageBlockHeight + 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);

    // Design Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('summaryTitle'), margin, currentY);
    currentY += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    chatHistory.forEach((item, index) => {
      if (currentY > pageHeight - 20) { // Margin for footer
          doc.addPage();
          currentY = margin;
      }
      const text = `${index + 1}. ${item}`;
      const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(splitText, margin, currentY);
      currentY += (splitText.length * 4) + 2;
    });

    // Attribution Section
    currentY = pageHeight - 20; // Position at bottom
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(t('summaryCredit'), margin, currentY);
    currentY += 4;
    
    doc.setFont('helvetica', 'normal');
    const attributionText = doc.splitTextToSize(t('summaryAttribution'), pageWidth - margin * 2);
    doc.text(attributionText, margin, currentY);

    doc.save('vividspace-design.pdf');
  };


  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header 
          onReset={resetState} 
          showReset={!!originalImage} 
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onSave={handleSavePdf}
          canSave={!!redesignedImage}
        />
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative my-4" role="alert">
            <strong className="font-bold">{t('errorLabel')}: </strong>
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
              <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
          </div>
        )}

        {!originalImage && !isLoading && (
          <div className="mt-16 flex flex-col items-center justify-center">
            <ImageUploader onImageUpload={handleRoomUpload} />
          </div>
        )}
        
        {isLoading && !redesignedImage && (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-slate-300">{loadingMessage}</p>
            </div>
        )}

        {originalImage && (
          <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 rounded-lg">
                  <LoadingSpinner />
                  <p className="mt-4 text-xl font-medium text-slate-200">{loadingMessage}</p>
                </div>
              )}
              {redesignedImage ? (
                <ImageComparator originalImage={originalImage} redesignedImage={redesignedImage} />
              ) : !isLoading && (
                 <div className="aspect-video w-full bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                   <img src={originalImage} alt="Original Room" className="w-full h-full object-cover" />
                 </div>
              )}
            </div>
            
            <aside className="flex flex-col space-y-6">
              <ChatInterface onMessageSubmit={handleChatSubmit} disabled={isLoading || !originalImage} />
              
              {originalImage && chatHistory.length > 0 && (
                <DesignSummary history={chatHistory} />
              )}

              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h3 className="font-semibold mb-3 text-rose-400">{t('advancedOptions')}</h3>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                  <ImageUploader onImageUpload={handleTextureUpload} labelKey={textureImage ? "textureSelected" : "applyCustomTexture"} small />
                  <button
                    onClick={handleApplyTexture}
                    disabled={!textureImage || isLoading || !originalImage}
                    className="w-full h-12 px-4 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    {t('applyTextureButton')}
                  </button>
                </div>
                <div className="border-t border-slate-600 my-4"></div>
                <div>
                    <h3 className="font-semibold mb-2 text-slate-300">{t('addItem')}</h3>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                        <ImageUploader 
                            onImageUpload={handleItemImageUpload} 
                            labelKey={itemImageToAdd ? "itemSelected" : "uploadItemPhoto"} 
                            small 
                        />
                        <button
                            onClick={handleApplyItem}
                            disabled={!itemImageToAdd || isLoading || !originalImage}
                            className="w-full h-12 px-4 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            {t('applyItemButton')}
                        </button>
                    </div>
                </div>
              </div>
              <ShoppableLinks />
            </aside>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
