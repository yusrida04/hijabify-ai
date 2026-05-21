import { useI18n, Language } from '../I18nContext';
import { useTheme, Theme } from '../ThemeContext';
import { Globe, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function Header() {
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  
  useEffect(() => {
    const listener = () => handleTutorial();
    window.addEventListener('show-tutorial', listener);
    return () => window.removeEventListener('show-tutorial', listener);
  }, []);

  const themeOptions: { value: Theme, label: string }[] = [
    { value: 'luxury-editorial', label: t('theme_luxury') },
    { value: 'minimal-clean', label: t('theme_minimal') },
    { value: 'dark-fashion', label: t('theme_dark') },
    { value: 'soft-neutral', label: t('theme_soft') },
  ];

  const handleTutorial = () => {
    const isResults = document.querySelector('#portrait-generated-card') !== null;
    const steps: any[] = [];
    
    // Check what is visible on the screen
    const uploadCard = document.querySelector('#portrait-upload-card');
    
    if (uploadCard && !isResults) {
      steps.push({
        element: '#portrait-upload-card',
        popover: {
          title: t('tour_upload_title'),
          description: t('tour_upload_desc'),
          side: "bottom", align: 'start'
        }
      });
      if (document.querySelector('#upload-btn')) {
        steps.push({
          element: '#upload-btn',
          popover: {
            title: t('tour_upload_btn'),
            description: t('tour_upload_btn_desc'),
            side: "bottom", align: 'center'
          }
        });
      }
      if (document.querySelector('#camera-btn')) {
        steps.push({
          element: '#camera-btn',
          popover: {
            title: t('tour_camera_btn'),
            description: t('tour_camera_btn_desc'),
            side: "bottom", align: 'center'
          }
        });
      }
    }

    if (isResults) {
      steps.push({
        element: '#portrait-generated-card',
        popover: {
          title: t('tour_preview_title'),
          description: t('tour_preview_desc'),
          side: "bottom", align: 'start'
        }
      });
      if (document.querySelector('#tour-category')) {
        steps.push({
          element: '#tour-category',
          popover: {
            title: t('tour_category'),
            description: t('tour_category_desc'),
            side: "left", align: 'start'
          }
        });
      }
      if (document.querySelector('#tour-styles')) {
        steps.push({
          element: '#tour-styles',
          popover: {
            title: t('tour_style'),
            description: t('tour_style_desc'),
            side: "left", align: 'start'
          }
        });
      }
      if (document.querySelector('.tour-action-links')) {
         steps.push({
          element: '.tour-action-links',
          popover: {
            title: t('tour_shop'),
            description: t('tour_shop_desc'),
            side: "left", align: 'start'
          }
        });
      }
      if (document.querySelector('#tour-palettes')) {
        steps.push({
          element: '#tour-palettes',
          popover: {
            title: t('tour_palette'),
            description: t('tour_palette_desc'),
            side: "right", align: 'start'
          }
        });
      }
    }

    if (steps.length > 0) {
      const driverObj = driver({
        showProgress: true,
        steps: steps,
        animate: true,
      });
      driverObj.drive();
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-6 px-8 max-w-7xl mx-auto border-b border-[rgb(var(--text-muted))]/10">
      <div className="flex flex-col items-start justify-center">
        <img 
          src="/logo.svg" 
          alt="Hijabify AI Logo" 
          className="h-14 md:h-16 w-auto object-contain mix-blend-multiply scale-[1.3] md:scale-[1.7] origin-left" 
        />
      </div>

      <div className="flex items-center space-x-6 relative">
        <button
          onClick={handleTutorial}
          className="flex items-center space-x-1 outline-none text-[rgb(var(--text-main))]/70 hover:text-[rgb(var(--text-main))] transition-colors text-sm"
        >
          <HelpCircle className="w-4 h-4 mr-1 opacity-70" />
          <span>{t('help')}</span>
        </button>

        <Dropdown 
          open={themeOpen} 
          setOpen={setThemeOpen} 
          label={themeOptions.find(o => o.value === theme)?.label || t('nav_theme')}
        >
          {themeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setTheme(opt.value); setThemeOpen(false); }}
              className={cn(
                "block w-full text-left px-4 py-2 text-sm hover:bg-[rgb(var(--text-muted))]/10 transition-colors",
                theme === opt.value ? "font-medium" : ""
              )}
            >
              {opt.label}
            </button>
          ))}
        </Dropdown>

        <Dropdown 
          open={langOpen} 
          setOpen={setLangOpen} 
          label={lang.toUpperCase()}
          icon={<Globe className="w-4 h-4 mr-2 opacity-70" />}
        >
          <button
             onClick={() => { setLang('en'); setLangOpen(false); }}
             className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-[rgb(var(--text-muted))]/10 transition-colors", lang === 'en' ? "font-medium" : "")}
          >
            English
          </button>
          <button
             onClick={() => { setLang('id'); setLangOpen(false); }}
             className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-[rgb(var(--text-muted))]/10 transition-colors", lang === 'id' ? "font-medium" : "")}
          >
            Indonesia
          </button>
        </Dropdown>
      </div>
    </header>
  );
}

function Dropdown({ open, setOpen, label, icon, children }: { open: boolean, setOpen: (o: boolean) => void, label: string, icon?: import('react').ReactNode, children: import('react').ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className="relative font-sans text-sm" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1 outline-none text-[rgb(var(--text-main))]/70 hover:text-[rgb(var(--text-main))] transition-colors"
      >
        {icon}
        <span>{label}</span>
      </button>

      <AnimatePresence>
        {open && (
           <motion.div
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 5 }}
             transition={{ duration: 0.2 }}
             className="absolute right-0 top-full mt-2 w-48 bg-[rgb(var(--surface-main))] shadow-xl border border-[rgb(var(--text-muted))]/10 rounded-xl overflow-hidden z-50 text-[rgb(var(--text-main))]"
           >
              <div className="py-1">
                {children}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
