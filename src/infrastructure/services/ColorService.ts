export class ColorService {
  /**
   * Extracts the dominant color from an image URL by drawing it to a small canvas.
   */
  static async extractDominantColor(imageUrl: string): Promise<{ r: number, g: number, b: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ r: 16, g: 185, b: 129 }); // Default emerald

        // Draw smaller for speed and automatic averaging
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);

        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        const count = data.length / 4;
        resolve({
          r: Math.floor(r / count),
          g: Math.floor(g / count),
          b: Math.floor(b / count)
        });
      };

      img.onerror = () => {
        resolve({ r: 16, g: 185, b: 129 }); // Fallback emerald
      };
    });
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}
