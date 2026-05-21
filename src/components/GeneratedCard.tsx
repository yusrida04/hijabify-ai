import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../I18nContext';
import { Loader2, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface GeneratedCardProps {
  previewImage: string | null;
  status: 'idle' | 'analyzing' | 'results' | 'generating';
  activeStyleName?: string | null;
  onImageClick?: () => void;
}

export function GeneratedCard({ 
  previewImage, 
  status, 
  activeStyleName,
  onImageClick
}: GeneratedCardProps) {
  const { t } = useI18n();

  const isLoading = status === 'generating';

  return (
    <div className="w-full flex justify-center">
      <div 
        className={cn(
          "relative w-full mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-[380px] aspect-[4/5] sm:aspect-[3/4] sm:rounded-[2.5rem] rounded-[2rem] p-2 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[rgb(var(--text-muted))]/10 bg-[rgb(var(--surface-main))]/40"
        )}
      >
        <div className="w-full h-full relative bg-[rgb(var(--surface-main))] rounded-[2rem] overflow-hidden">
          
          <AnimatePresence mode="wait">
          {!previewImage && !isLoading && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-full bg-[rgb(var(--text-muted))]/10 flex items-center justify-center text-[rgb(var(--text-muted))]">
                <Wand2 strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <p className="font-serif text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-[rgb(var(--text-main))]">
                {t('after')}
              </p>
              <p className="font-sans text-[11px] sm:text-sm text-[rgb(var(--text-muted))]/80 leading-relaxed max-w-[90%] sm:max-w-[80%] mx-auto">
                {t('select_to_generate')}
              </p>
            </motion.div>
          )}

          {previewImage && (
            <motion.div
               key="image"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute inset-0 w-full h-full cursor-pointer"
               onClick={onImageClick}
            >
              <img 
                src={previewImage} 
                alt="Generated styling" 
                className={cn(
                  "w-full h-full object-cover object-top transition-all duration-700",
                  isLoading ? "blur-md scale-105 opacity-60" : "blur-0 scale-100 opacity-100"
                )}
                referrerPolicy="no-referrer"
              />
              
              {/* Glassmorphism gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-4 right-4 px-3 py-1.5 bg-[rgb(var(--text-main))]/80 backdrop-blur-md rounded border border-[rgb(var(--surface-main))]/20 text-[10px] text-[rgb(var(--surface-main))] uppercase font-bold tracking-wider z-20">
                {t('after')}
              </div>

              {activeStyleName && (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-[rgb(var(--surface-main))]/80 backdrop-blur-xl border border-[rgb(var(--text-muted))]/10 rounded-full text-[10px] text-[rgb(var(--text-main))] font-medium uppercase tracking-widest shadow-xl z-20 pointer-events-none whitespace-nowrap"
                >
                   {t('active_style')}: {activeStyleName}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
             <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-20"
             >
                <div className="absolute inset-0 bg-[rgb(var(--surface-main))]/40 backdrop-blur-md" />
                <div className="relative z-30 flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}
                  >
                    <Loader2 className="w-10 h-10 text-[rgb(var(--text-main))] drop-shadow-md mb-6 opacity-90" />
                  </motion.div>
                  <motion.p
                    initial={{ y: 5 }}
                    animate={{ y: 0 }}
                    className="font-serif italic text-lg text-[rgb(var(--text-main))] drop-shadow-md tracking-wide text-center px-4"
                  >
                    {t('generating_drape')}
                  </motion.p>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
