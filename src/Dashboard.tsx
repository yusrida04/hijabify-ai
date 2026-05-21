import { useState } from 'react';
import { PortraitCard } from './components/PortraitCard';
import { GeneratedCard } from './components/GeneratedCard';
import { RecommendationPanel } from './components/RecommendationPanel';
import { Header } from './components/Header';
import { analyzePortrait, generateHijabPreview, AnalysisResult } from './lib/gemini';
import { useI18n } from './I18nContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { X } from 'lucide-react';

type Status = 'idle' | 'analyzing' | 'results' | 'generating';

export function Dashboard() {
  const { lang, t } = useI18n();

  const [status, setStatus] = useState<Status>('idle');
  const [originalImage, setOriginalImage] = useState<{base64: string, mime: string} | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<{hex: string, name: string} | null>(null);

  const handleFileAccepted = async (base64: string, mimeType: string) => {
    setOriginalImage({ base64, mime: mimeType });
    setPreviewImage(null);
    setStatus('analyzing');
    
    try {
      const result = await analyzePortrait(base64, mimeType, lang);
      setAnalysis(result);
      
      // Auto-select the first category available
      if (result.recommendationsByCategory && result.recommendationsByCategory.length > 0) {
        setSelectedCategory(result.recommendationsByCategory[0].category);
      }
      
      setSelectedStyle(null);
      setSelectedColor(null);
      setStatus('results');

      setTimeout(() => {
        const hasSeen = localStorage.getItem('hasSeenResultTour');
        if (!hasSeen) {
          localStorage.setItem('hasSeenResultTour', 'true');
          window.dispatchEvent(new Event('show-tutorial'));
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert("Failed to analyze portrait.");
    }
  };

  const handleSelectStyle = async (styleName: string) => {
    if (!originalImage) return;
    setSelectedStyle(styleName);
    
    setStatus('generating');
    try {
      const newPreview = await generateHijabPreview(
        originalImage.base64, 
        originalImage.mime, 
        styleName, 
        selectedColor?.hex || null,
        selectedColor?.name || null,
        false
      );
      setPreviewImage(newPreview);
    } catch (e) {
      console.error("Failed to generate style update", e);
    } finally {
      setStatus('results');
    }
  };

  const handleSelectColor = async (colorHex: string, paletteName: string) => {
    if (!originalImage) return;
    setSelectedColor({ hex: colorHex, name: paletteName });
    
    setStatus('generating');
    try {
      const isColorOnlyUpdate = !!(selectedStyle && previewImage);
      const baseToUse = isColorOnlyUpdate && previewImage ? previewImage.split(',')[1] : originalImage.base64;
      const mimeToUse = isColorOnlyUpdate && previewImage ? previewImage.split(';')[0].split(':')[1] : originalImage.mime;

      const newPreview = await generateHijabPreview(
        baseToUse, 
        mimeToUse, 
        selectedStyle || null, 
        colorHex,
        paletteName,
        isColorOnlyUpdate
      );
      setPreviewImage(newPreview);
    } catch (e) {
      console.error("Failed to generate color update", e);
    } finally {
      setStatus('results');
    }
  };

  const handleClear = () => {
    setStatus('idle');
    setOriginalImage(null);
    setPreviewImage(null);
    setAnalysis(null);
    setSelectedStyle(null);
    setSelectedColor(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden">
      <Header />
      
      <main className="flex-1 w-full p-6 flex flex-col overflow-hidden max-w-none">
        
        {/* Main Workspace Layout */}
        <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
          
          {/* Left panel (fixed width on desktop) */}
          {status !== 'idle' && analysis && (
            <div id="recommendation-panel-left" className="w-full lg:w-[280px] shrink-0 overflow-y-auto">
              <RecommendationPanel 
                analysis={analysis} 
                selectedCategory={selectedCategory}
                selectedStyle={selectedStyle}
                selectedColor={selectedColor?.hex || null}
                onSelectCategory={setSelectedCategory}
                onSelectStyle={handleSelectStyle}
                onSelectColor={handleSelectColor}
                disabled={status === 'analyzing' || status === 'generating'}
                column="left"
              />
            </div>
          )}

          {/* Center Column: Portrait Cards */}
          <div className={cn(
            "flex-1 flex flex-row items-center h-full min-w-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            status === 'idle' ? "justify-center" : "justify-center gap-4 lg:gap-8"
          )}>
            <div id="portrait-upload-card" className={cn("w-full transition-all duration-700", status === 'idle' ? "flex justify-center" : "flex justify-end flex-1 min-w-0")}>
              <PortraitCard 
                originalImage={originalImage ? "data:" + originalImage.mime + ";base64," + originalImage.base64 : null}
                previewImage={previewImage}
                status={status}
                activeStyleName={status === 'results' ? selectedStyle : null}
                onFileAccepted={handleFileAccepted}
                onClear={handleClear}
                onImageClick={() => {
                  if (originalImage) {
                    setFullScreenImage("data:" + originalImage.mime + ";base64," + originalImage.base64);
                  }
                }}
              />
            </div>
            {status !== 'idle' && (
              <div id="portrait-generated-card" className="w-full flex justify-start flex-1 min-w-0">
                <GeneratedCard 
                  previewImage={previewImage}
                  status={status}
                  activeStyleName={status === 'results' ? selectedStyle : null}
                  onImageClick={() => {
                    if (previewImage) {
                      setFullScreenImage(previewImage);
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Right panel (fixed width on desktop) */}
          {status !== 'idle' && analysis && (
            <div id="recommendation-panel-right" className="w-full lg:w-[280px] shrink-0 overflow-y-auto">
              <RecommendationPanel 
                analysis={analysis} 
                selectedCategory={selectedCategory}
                selectedStyle={selectedStyle}
                selectedColor={selectedColor?.hex || null}
                onSelectCategory={setSelectedCategory}
                onSelectStyle={handleSelectStyle}
                onSelectColor={handleSelectColor}
                disabled={status === 'analyzing' || status === 'generating'}
                column="right"
              />
            </div>
          )}

        </div>
      </main>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setFullScreenImage(null)}
          >
            <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={fullScreenImage} 
              alt="Fullscreen Preview"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
