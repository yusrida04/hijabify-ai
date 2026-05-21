import { useI18n } from '../I18nContext';
import { AnalysisResult } from '../lib/gemini';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Check, ShoppingBag, Youtube } from 'lucide-react';

interface RecommendationPanelProps {
  analysis: AnalysisResult;
  selectedCategory: string | null;
  selectedStyle: string | null;
  selectedColor: string | null;
  onSelectCategory: (category: string) => void;
  onSelectStyle: (styleName: string) => void;
  onSelectColor: (colorHex: string, colorName: string) => void;
  disabled?: boolean;
  column: 'left' | 'right';
}

export function RecommendationPanel({
  analysis,
  selectedCategory,
  selectedStyle,
  selectedColor,
  onSelectCategory,
  onSelectStyle,
  onSelectColor,
  disabled,
  column
}: RecommendationPanelProps) {
  const { t, lang } = useI18n();

  const opacityClass = disabled ? "opacity-50 pointer-events-none" : "opacity-100";

  if (column === 'left') {
    return (
      <div className={cn("flex flex-col gap-6 h-full pb-6 transition-opacity duration-500", opacityClass)}>
        {/* Metrics */}
        <motion.div 
          className="bg-[rgb(var(--surface-main))]/80 backdrop-blur-md border border-[rgb(var(--text-muted))]/10 rounded-2xl p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-sans text-[10px] tracking-[0.15em] uppercase text-[rgb(var(--text-muted))]/50 mb-4 font-semibold">
            {t('metrics')}
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs mb-2">
                <span className="text-[rgb(var(--text-muted))]">{t('face_shape')}</span>
              </div>
              <div className="flex flex-col gap-2 mb-3">
                {analysis.faceShapes?.map((fs, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono text-[rgb(var(--text-main))]">{fs.shape}</span>
                      <span className="font-mono text-[rgb(var(--text-muted))]">{fs.percentage}%</span>
                    </div>
                    <div className="h-1 bg-[rgb(var(--bg-main))] rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${fs.percentage}%` }}
                         transition={{ delay: 0.2 + (idx * 0.1), duration: 0.8, ease: "easeOut" }}
                         className="h-full bg-[rgb(var(--text-main))]"
                       ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[rgb(var(--text-muted))]/80 leading-relaxed">
                {analysis.faceShapeDescription?.[lang] || analysis.faceShapeDescription?.en || ''}
              </p>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{t('skin_tone')}</span>
                <span className="font-serif italic text-[rgb(var(--text-main))]">{analysis.skinTone?.[lang] || analysis.skinTone?.en || ''}</span>
              </div>
              <div className="h-1 bg-[rgb(var(--bg-main))] rounded-full overflow-hidden">
                 <div className="h-full bg-[rgb(var(--accent))] w-full"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Color Palettes */}
        <motion.div
          id="tour-palettes"
          className="bg-[rgb(var(--surface-main))]/80 backdrop-blur-md border border-[rgb(var(--text-muted))]/10 rounded-2xl p-5 shadow-sm flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-sans text-[10px] tracking-[0.15em] uppercase text-[rgb(var(--text-muted))]/50 mb-4 font-semibold">
            {t('color_palette')}
          </h3>
          <div className="space-y-6">
            {analysis.recommendedPalettes.map((palette, idx) => {
              const palName = palette.name?.[lang] || palette.name?.en || 'Palette';
              return (
              <div key={`palette-${idx}`}>
                <p className="font-serif text-sm italic mb-3 opacity-80">{palName}</p>
                <div className="flex flex-wrap gap-3">
                  {palette.colors.map(colorHex => {
                     const isSelectedColor = selectedColor === colorHex;
                     return (
                       <button
                         key={colorHex}
                         onClick={() => onSelectColor(colorHex, palette.name)}
                         className={cn(
                           "group cursor-pointer flex flex-col items-center justify-center transition-transform",
                           isSelectedColor ? "scale-110" : "hover:scale-105"
                         )}
                         aria-label={"Select color " + colorHex}
                       >
                         <div 
                           className={cn(
                             "w-10 h-10 rounded-full shadow-sm mb-1",
                             isSelectedColor ? "border-2 border-[rgb(var(--bg-main))] ring-1 ring-[rgb(var(--text-main))]/30" : "border-2 border-white"
                           )}
                           style={{ backgroundColor: colorHex }}
                         >
                           {isSelectedColor && (
                                <Check className="w-4 h-4 m-auto mt-2.5 opacity-80 mix-blend-difference invert" />
                           )}
                         </div>
                       </button>
                     );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // Right column
  const currentlySelectedCategoryDict = analysis.recommendationsByCategory?.find(c => c.category === selectedCategory);
  
  return (
    <div className={cn("flex flex-col gap-6 h-full pb-6 transition-opacity duration-500", opacityClass)}>
      <motion.div
        className="flex-1 bg-[rgb(var(--surface-main))]/80 backdrop-blur-md border border-[rgb(var(--text-muted))]/10 rounded-2xl p-6 shadow-sm flex flex-col"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div id="tour-category" className="mb-6 flex flex-col gap-3">
          <h3 className="font-sans text-[10px] tracking-[0.15em] uppercase text-[rgb(var(--text-muted))]/50 font-semibold">
            {t('category')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.recommendationsByCategory?.map(cat => (
              <button
                key={cat.category}
                onClick={() => onSelectCategory(cat.category)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  selectedCategory === cat.category
                    ? "bg-[rgb(var(--text-main))] border-[rgb(var(--text-main))] text-[rgb(var(--surface-main))]"
                    : "bg-transparent border-[rgb(var(--text-muted))]/20 text-[rgb(var(--text-muted))] hover:border-[rgb(var(--text-muted))]/50"
                )}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </div>

        <h3 className="font-sans text-[10px] tracking-[0.15em] uppercase text-[rgb(var(--text-muted))]/50 mb-4 font-semibold">
          {t('top_styles')}
        </h3>
        
        <div id="tour-styles" className="space-y-4 flex-1">
          {currentlySelectedCategoryDict?.styles.map((style) => {
            const isSelected = selectedStyle === style.name;
            return (
              <button
                key={style.name}
                onClick={() => onSelectStyle(style.name)}
                className={cn(
                  "w-full text-left p-4 rounded-xl transition-all cursor-pointer flex flex-col gap-2 border relative overflow-hidden",
                  isSelected 
                    ? "border border-[rgb(var(--text-main))]/20 bg-white ring-1 ring-[rgb(var(--text-main))]/10"
                    : "border-transparent hover:border-[rgb(var(--text-main))]/20 hover:bg-white"
                )}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[rgb(var(--text-main))]" />
                )}
                <div className="flex flex-col items-start w-full pr-2">
                  <span className="text-sm font-serif font-medium text-[rgb(var(--text-main))] mb-1">{style.name}</span>
                  <span className="text-[11px] text-[rgb(var(--text-muted))]/80 leading-relaxed mb-3 line-clamp-2">{style.description?.[lang] || style.description?.en || ''}</span>
                  <div className="flex flex-row items-center gap-2 w-full mt-1 tour-action-links">
                    <a 
                      href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent('hijab ' + style.name.replace(/hijab/ig, '').replace(/\s+/g, ' ').trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 justify-center inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[rgb(var(--text-main))]/70 hover:text-[rgb(var(--text-main))] transition-colors border border-[rgb(var(--text-muted))]/20 hover:border-[rgb(var(--text-main))]/50 px-2 py-1.5 rounded-full whitespace-nowrap"
                    >
                      <ShoppingBag className="w-3 h-3 shrink-0" />
                      <span className="truncate">{t('shop_style')}</span>
                    </a>
                    <a 
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent('tutorial hijab ' + style.name.replace(/hijab/ig, '').replace(/\s+/g, ' ').trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 justify-center inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[rgb(var(--text-main))]/70 hover:text-[rgb(var(--text-main))] transition-colors border border-[rgb(var(--text-muted))]/20 hover:border-[rgb(var(--text-main))]/50 px-2 py-1.5 rounded-full whitespace-nowrap"
                    >
                      <Youtube className="w-3 h-3 shrink-0" />
                      <span className="truncate">{t('tutorial')}</span>
                    </a>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  );
}
