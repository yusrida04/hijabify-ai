export interface AnalysisResult {
  faceShapes: {
    shape: string;
    percentage: number;
  }[];
  faceShapeDescription: {
    en: string;
    id: string;
  };
  skinTone: {
    en: string;
    id: string;
  };
  recommendationsByCategory: {
    category: string;
    styles: {
      name: string;
      description: {
        en: string;
        id: string;
      };
    }[];
  }[];
  recommendedPalettes: {
    name: {
      en: string;
      id: string;
    };
    colors: string[]; // hex codes
  }[];
}

// Frontend function to call the backend analysis API
export async function analyzePortrait(base64Image: string, mimeType: string, lang: 'en' | 'id'): Promise<AnalysisResult> {
  const response = await fetch('/api/recommend-hijab', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64Image, mimeType, lang }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to analyze portrait (HTTP ${response.status})`);
  }

  return response.json() as Promise<AnalysisResult>;
}

// Frontend function to call the backend image preview generation API
export async function generateHijabPreview(
  base64Image: string, 
  mimeType: string, 
  style: string | null, 
  colorHex: string | null,
  paletteName: string | null,
  isColorOnlyUpdate: boolean = false
): Promise<string> {
  const response = await fetch('/api/generate-preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64Image,
      mimeType,
      style,
      colorHex,
      paletteName,
      isColorOnlyUpdate
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate hijab preview (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (!result.image) {
    throw new Error("No image data returned from backend preview API.");
  }

  return result.image;
}
