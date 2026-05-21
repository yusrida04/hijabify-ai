import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'id';

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  en: {
    title: "Hijabify AI",
    subtitle: "Your luxury virtual fashion stylist.",
    upload_prompt: "Drop your portrait here or click to browse.",
    upload_hint: "High-resolution front-facing photo recommended for the most elegant draping.",
    analyzing_geometry: "Analyzing facial geometry...",
    matching_skin: "Matching skin spectrum...",
    generating_drape: "Generating personalized draping...",
    rendering_final: "Rendering final visualization...",
    top_styles: "Recommended Styles",
    color_palette: "Curated Palettes",
    metrics: "Analysis Metrics",
    face_shape: "Face Shape",
    skin_tone: "Skin Spectrum",
    try_this: "Try this style",
    theme_luxury: "Luxury Editorial",
    theme_minimal: "Minimal Clean",
    theme_dark: "Dark Fashion",
    theme_soft: "Soft Neutral",
    nav_theme: "Theme",
    nav_lang: "Language",
    re_upload: "New Portrait",
    selected_preview_info: "Current Visualization:",
    original_photo: "Original Portrait",
    color_label: "Color",
    use_camera: "Use Camera",
    capture_photo: "Capture Photo",
    close_camera: "Close Camera",
    hero_title: "Discover Your Signature Style",
    hero_subtitle: "Upload a portrait or take a photo to receive personalized hijab recommendations based on your unique facial geometry and skin tone.",
    camera_requesting: "Requesting camera access...",
    camera_denied: "Camera permission denied.",
    camera_denied_help: "Please allow camera access in your browser settings. If you are viewing this in an embedded preview, you may need to open the app in a new tab.",
    open_new_tab: "Open in New Tab",
    before: "Before",
    after: "After",
    select_to_generate: "Select a recommended style or color to generate preview",
    category: "Category",
    shop_style: "Shop Style",
    tutorial: "Tutorial",
    active_style: "Active",
    tour_upload_title: "Start Here",
    tour_upload_desc: "Upload a portrait or use your camera to get started.",
    tour_upload_btn: "Upload Photo",
    tour_upload_btn_desc: "Upload a portrait from your device.",
    tour_camera_btn: "Take a Photo",
    tour_camera_btn_desc: "Or take a photo directly using your camera.",
    tour_preview_title: "Generated Preview",
    tour_preview_desc: "Your virtual hijab fitting will appear here. The AI maintains your original facial features.",
    tour_category: "Select Category",
    tour_category_desc: "Filter hijab styles by occasion or activity.",
    tour_style: "Recommended Styles",
    tour_style_desc: "Click a style to apply it to your portrait. These are recommended based on your face shape.",
    tour_shop: "Shop & Tutorials",
    tour_shop_desc: "Find where to buy this style or watch a tutorial on how to wear it.",
    tour_palette: "Color Palettes",
    tour_palette_desc: "We provide 3 different palettes (Earth Tones, Soft Pastels, Rich Jewels) containing 3 colors each, specifically calculated by AI to perfectly complement your skin spectrum.",
    help: "Help",
    guide_title: "Photo Guidelines",
    guide_lighting: "Good Lighting",
    guide_lighting_desc: "Natural daylight. Avoid strong backlights.",
    guide_position: "Face Position",
    guide_position_desc: "Center your face. Keep it fully visible.",
    guide_angle: "Camera Angle",
    guide_angle_desc: "Front-facing, at eye level.",
    guide_visibility: "Clear Features",
    guide_visibility_desc: "Remove objects covering your face.",
    camera_hint_center: "Center your face in the frame",
    camera_hint_scan: "Scanning facial geometry...",
    camera_hint_dim: "Ensure good lighting",
  },
  id: {
    title: "Hijabify AI",
    subtitle: "Stylist fashion virtual mewah Anda.",
    upload_prompt: "Letakkan potret Anda di sini atau klik untuk mencari.",
    upload_hint: "Disarankan foto menghadap depan beresolusi tinggi untuk hasil draping yang paling elegan.",
    analyzing_geometry: "Menganalisis geometri wajah...",
    matching_skin: "Mencocokkan spektrum kulit...",
    generating_drape: "Menghasilkan draping yang dipersonalisasi...",
    rendering_final: "Merender visualisasi akhir...",
    top_styles: "Gaya yang Direkomendasikan",
    color_palette: "Palet Pilihan",
    metrics: "Metrik Analisis",
    face_shape: "Bentuk Wajah",
    skin_tone: "Spektrum Kulit",
    try_this: "Coba gaya ini",
    theme_luxury: "Luxury Editorial",
    theme_minimal: "Minimal Clean",
    theme_dark: "Dark Fashion",
    theme_soft: "Soft Neutral",
    nav_theme: "Tema",
    nav_lang: "Bahasa",
    re_upload: "Potret Baru",
    selected_preview_info: "Visualisasi Saat Ini:",
    original_photo: "Potret Asli",
    color_label: "Warna",
    use_camera: "Gunakan Kamera",
    capture_photo: "Ambil Foto",
    close_camera: "Tutup Kamera",
    hero_title: "Temukan Gaya Khas Anda",
    hero_subtitle: "Unggah potret atau ambil foto untuk mendapatkan rekomendasi gaya hijab yang dipersonalisasi berdasarkan geometri wajah dan warna kulit unik Anda.",
    camera_requesting: "Meminta akses kamera...",
    camera_denied: "Izin kamera ditolak.",
    camera_denied_help: "Harap izinkan akses kamera di pengaturan browser Anda. Jika Anda melihat ini dalam pratinjau yang disematkan, Anda mungkin perlu membuka aplikasi di tab baru.",
    open_new_tab: "Buka di Tab Baru",
    before: "Sebelum",
    after: "Sesudah",
    select_to_generate: "Pilih gaya atau warna yang direkomendasikan untuk melihat fitur pratinjau",
    category: "Kategori",
    shop_style: "Beli Gaya",
    tutorial: "Tutorial",
    active_style: "Aktif",
    tour_upload_title: "Mulai Di Sini",
    tour_upload_desc: "Unggah pas foto atau gunakan kamera Anda untuk memulai.",
    tour_upload_btn: "Unggah Foto",
    tour_upload_btn_desc: "Unggah foto wajah dari perangkat Anda.",
    tour_camera_btn: "Ambil Foto",
    tour_camera_btn_desc: "Atau ambil foto langsung menggunakan kamera Anda.",
    tour_preview_title: "Pratinjau Hasil",
    tour_preview_desc: "Hasil fitting hijab virtual Anda akan muncul di sini. AI mempertahankan fitur wajah asli Anda.",
    tour_category: "Pilih Kategori",
    tour_category_desc: "Filter gaya hijab berdasarkan acara atau aktivitas.",
    tour_style: "Gaya yang Disarankan",
    tour_style_desc: "Klik gaya untuk menerapkannya. Gaya ini direkomendasikan berdasarkan bentuk wajah Anda.",
    tour_shop: "Beli & Tutorial",
    tour_shop_desc: "Temukan tempat membeli referensi gaya ini atau tonton tutorial cara memakainya.",
    tour_palette: "Palet Warna",
    tour_palette_desc: "Terdapat 3 tingkat palet (Earth Tones, Soft Pastels, Rich Jewels) dengan masing-masing 3 warna, yang dipilih dan dihitung khusus oleh AI untuk menyesuaikan dan mencerahkan tone kulit Anda.",
    help: "Bantuan",
    guide_title: "Panduan Foto",
    guide_lighting: "Pencahayaan Baik",
    guide_lighting_desc: "Cahaya alami. Hindari cahaya belakang kuat.",
    guide_position: "Posisi Wajah",
    guide_position_desc: "Posisikan wajah di tengah dan terlihat jelas.",
    guide_angle: "Sudut Kamera",
    guide_angle_desc: "Menghadap depan, sejajar dengan mata.",
    guide_visibility: "Fitur Jelas",
    guide_visibility_desc: "Lepaskan penutup wajah seperti kacamata.",
    camera_hint_center: "Posisikan wajah Anda di tengah bingkai",
    camera_hint_scan: "Memindai geometri wajah...",
    camera_hint_dim: "Pastikan pencahayaan cukup",
  }
}

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
