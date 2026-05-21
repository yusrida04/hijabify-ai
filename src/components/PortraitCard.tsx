import { useCallback, useRef, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../I18nContext';
import { Upload, X, Loader2, Camera, CameraOff, Sun, UserCheck, Aperture, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

interface PortraitCardProps {
  originalImage: string | null;
  previewImage: string | null;
  status: 'idle' | 'analyzing' | 'results' | 'generating';
  activeStyleName?: string | null;
  onFileAccepted: (base64: string, mimeType: string) => void;
  onClear: () => void;
  onImageClick?: () => void;
}

export function PortraitCard({ 
  originalImage, 
  previewImage, 
  status, 
  activeStyleName,
  onFileAccepted,
  onClear,
  onImageClick
}: PortraitCardProps) {
  const { t } = useI18n();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    setIsRequestingCamera(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices API not available. This usually happens in an iframe or non-HTTPS environment.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsRequestingCamera(false);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Failed to access camera", err);
      setIsRequestingCamera(false);
      setCameraError('denied');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const result = canvas.toDataURL('image/jpeg', 0.9);
      const parts = result.split(',');
      if (parts.length === 2) {
        const match = parts[0].match(/:(.*?);/);
        if (match) {
          stopCamera();
          onFileAccepted(parts[1], match[1]);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // e.g. "data:image/jpeg;base64,....."
        const result = reader.result as string; 
        const parts = result.split(',');
        if (parts.length === 2) {
          const match = parts[0].match(/:(.*?);/);
          if (match) {
            onFileAccepted(parts[1], match[1]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    disabled: status !== 'idle',
    noClick: true
  } as any);

  const isLoading = status === 'analyzing';
  const showImage = originalImage || previewImage;
  const currentImg = previewImage || originalImage;
  const isCardMode = showImage || isCameraOpen || status !== 'idle';

  return (
    <div className="w-full flex justify-center">
      <div 
        {...getRootProps()}
        className={cn(
          "relative w-full mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isCardMode 
            ? "max-w-[380px] aspect-[4/5] sm:aspect-[3/4] sm:rounded-[2.5rem] rounded-[2rem] p-2 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[rgb(var(--text-muted))]/10 bg-[rgb(var(--surface-main))]/40"
            : "max-w-2xl py-12 p-0 shadow-none border-none bg-transparent",
          isDragActive && isCardMode && "scale-105 shadow-xl border-[rgb(var(--text-main))]"
        )}
      >
        <div className={cn(
          "w-full h-full relative transition-[border-radius] duration-700",
          isCardMode && "bg-[rgb(var(--surface-main))] rounded-[2rem] overflow-hidden"
        )}>
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
          {!showImage && status === 'idle' && !isCameraOpen && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6 text-[rgb(var(--text-main))] leading-tight">
                {t('hero_title')}
              </h1>
              <p className="font-sans text-sm md:text-base text-[rgb(var(--text-muted))]/80 leading-relaxed max-w-lg mx-auto mb-10">
                {t('hero_subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  id="upload-btn"
                  onClick={open}
                  className="w-full sm:w-auto flex justify-center items-center gap-3 px-8 py-4 rounded-full border border-[rgb(var(--text-muted))]/20 hover:border-[rgb(var(--text-main))] text-xs font-bold uppercase tracking-widest transition-all bg-[rgb(var(--surface-main))] text-[rgb(var(--text-main))] shadow-sm cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  {t('upload_prompt')}
                </button>

                <button
                  id="camera-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCameraError(null);
                    startCamera();
                  }}
                  disabled={isRequestingCamera}
                  className={cn(
                    "w-full sm:w-auto flex justify-center items-center gap-3 px-8 py-4 rounded-full border border-[rgb(var(--text-main))] hover:bg-[rgb(var(--text-main))]/90 text-xs font-bold uppercase tracking-widest transition-all bg-[rgb(var(--text-main))] text-[rgb(var(--surface-main))] shadow-md",
                    isRequestingCamera ? "opacity-70 cursor-wait" : "cursor-pointer"
                  )}
                >
                  {isRequestingCamera ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('camera_requesting')}
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      {t('use_camera')}
                    </>
                  )}
                </button>
              </div>
              
              <AnimatePresence>
                {cameraError === 'denied' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-5 bg-[rgb(var(--surface-main))] border border-[rgb(var(--text-muted))]/20 rounded-2xl max-w-md mx-auto shadow-sm"
                  >
                    <p className="text-xs font-bold text-[rgb(var(--text-main))] mb-2 uppercase tracking-widest">
                      {t('camera_denied')}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-muted))]/80 font-sans leading-relaxed mb-4">
                      {t('camera_denied_help')}
                    </p>
                    <a 
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[rgb(var(--text-muted))]/30 hover:border-[rgb(var(--text-main))] text-[10px] font-bold uppercase tracking-widest transition-colors text-[rgb(var(--text-main))]"
                    >
                      {t('open_new_tab')}
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-16 max-w-2xl mx-auto text-left border border-[rgb(var(--text-muted))]/10 bg-[rgb(var(--surface-main))]/30 backdrop-blur-sm rounded-3xl p-6 sm:p-8">
                <h3 className="font-serif text-lg font-medium text-[rgb(var(--text-main))] mb-6 flex items-center gap-2">
                  <Aperture className="w-5 h-5 opacity-70" />
                  {t('guide_title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex gap-4">
                    <Sun className="w-5 h-5 shrink-0 opacity-60 text-[rgb(var(--text-main))]" />
                    <div>
                      <h4 className="font-sans text-[11px] uppercase tracking-widest font-bold mb-1.5 text-[rgb(var(--text-main))]">{t('guide_lighting')}</h4>
                      <p className="text-[11px] text-[rgb(var(--text-muted))]/80 leading-relaxed font-medium">{t('guide_lighting_desc')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <UserCheck className="w-5 h-5 shrink-0 opacity-60 text-[rgb(var(--text-main))]" />
                    <div>
                      <h4 className="font-sans text-[11px] uppercase tracking-widest font-bold mb-1.5 text-[rgb(var(--text-main))]">{t('guide_position')}</h4>
                      <p className="text-[11px] text-[rgb(var(--text-muted))]/80 leading-relaxed font-medium">{t('guide_position_desc')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Camera className="w-5 h-5 shrink-0 opacity-60 text-[rgb(var(--text-main))]" />
                    <div>
                      <h4 className="font-sans text-[11px] uppercase tracking-widest font-bold mb-1.5 text-[rgb(var(--text-main))]">{t('guide_angle')}</h4>
                      <p className="text-[11px] text-[rgb(var(--text-muted))]/80 leading-relaxed font-medium">{t('guide_angle_desc')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Eye className="w-5 h-5 shrink-0 opacity-60 text-[rgb(var(--text-main))]" />
                    <div>
                      <h4 className="font-sans text-[11px] uppercase tracking-widest font-bold mb-1.5 text-[rgb(var(--text-main))]">{t('guide_visibility')}</h4>
                      <p className="text-[11px] text-[rgb(var(--text-muted))]/80 leading-relaxed font-medium">{t('guide_visibility_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!showImage && status === 'idle' && isCameraOpen && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-auto z-10"
            >
              <video 
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(e => console.log("Stream play error:", e));
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-12">
                 <div className="w-[65%] max-w-[260px] aspect-[3/4] border-[1.5px] border-white/40 border-dashed rounded-[100%] animate-pulse relative overflow-hidden">
                    <motion.div 
                      className="absolute left-0 w-full h-[2px] shadow-[0_0_15px_theme(colors.white)] bg-white/80 pointer-events-none"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    />
                 </div>
              </div>
              <div className="absolute top-10 inset-x-0 mx-auto text-center pointer-events-none flex justify-center px-4">
                 <div className="px-5 py-2.5 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] uppercase tracking-widest font-bold shadow-lg border border-white/10">
                   <motion.div
                     animate={{ opacity: [1, 0.5, 1] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="flex items-center gap-2"
                   >
                     <Aperture className="w-3.5 h-3.5 opacity-80" />
                     {t('camera_hint_center')}
                   </motion.div>
                 </div>
              </div>
              <div className="absolute bottom-8 inset-x-0 mx-auto flex items-center justify-center gap-6 z-20">
                <button
                   onClick={stopCamera}
                   className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                   aria-label={t('close_camera')}
                >
                  <CameraOff className="w-4 h-4" />
                </button>
                <button
                   onClick={capturePhoto}
                   className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center group cursor-pointer"
                   aria-label={t('capture_photo')}
                >
                  <div className="w-12 h-12 rounded-full bg-white group-hover:scale-95 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {showImage && (
            <motion.div
               key="image"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute inset-0 w-full h-full cursor-pointer"
               onClick={onImageClick}
            >
              {originalImage ? (
                <img 
                  src={originalImage} 
                  alt="Original Portrait" 
                  className={cn(
                    "w-full h-full object-cover object-top transition-all duration-700 blur-0 scale-100 opacity-100"
                  )}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <img 
                  src={currentImg!} 
                  alt="Portrait" 
                  className={cn(
                    "w-full h-full object-cover object-top transition-all duration-700",
                    isLoading ? "blur-md scale-105 opacity-60" : "blur-0 scale-100 opacity-100"
                  )}
                  referrerPolicy="no-referrer"
                />
              )}
              {/* Glassmorphism gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {originalImage && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded border border-white/10 text-[10px] text-white/90 uppercase font-bold tracking-wider z-20">
                  {t('before')}
                </div>
              )}
              
              {status === 'results' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all cursor-pointer z-10"
                  aria-label={t('re_upload')}
                >
                  <X className="w-5 h-5" />
                </button>
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
                <div className="absolute inset-0 bg-[rgb(var(--surface-main))]/20 backdrop-blur-md" />
                <div className="relative z-30 flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}
                  >
                    <Loader2 className="w-10 h-10 text-white drop-shadow-md mb-6 opacity-90" />
                  </motion.div>
                  <motion.p
                    initial={{ y: 5 }}
                    animate={{ y: 0 }}
                    className="font-serif italic text-lg text-white drop-shadow-md tracking-wide text-center px-4"
                  >
                    {status === 'analyzing' ? t('analyzing_geometry') : t('generating_drape')}
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
