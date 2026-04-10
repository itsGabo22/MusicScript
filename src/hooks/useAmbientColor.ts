import { useState, useEffect } from 'react';
import { ColorService } from '../infrastructure/services/ColorService';

export const useAmbientColor = (imageUrl?: string) => {
  const [colors, setColors] = useState({ r: 16, g: 185, b: 129 }); // Default emerald

  useEffect(() => {
    if (imageUrl) {
      ColorService.extractDominantColor(imageUrl).then(setColors);
    }
  }, [imageUrl]);

  return {
    ...colors,
    hex: ColorService.rgbToHex(colors.r, colors.g, colors.b),
    rgba: (alpha: number) => `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${alpha})`
  };
};
