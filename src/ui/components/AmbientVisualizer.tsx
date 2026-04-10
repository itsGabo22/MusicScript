import React, { useRef, useEffect } from 'react';
import { audioAnalyzer } from '../../infrastructure/services/AudioAnalyzerService';

interface VisualizerProps {
  color: { r: number, g: number, b: number };
  isPlaying: boolean;
}

const AmbientVisualizer: React.FC<VisualizerProps> = ({ color, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const freqData = audioAnalyzer.getFrequencyData();
      const avgFreq = freqData.length > 0 
        ? freqData.reduce((a, b) => a + b) / freqData.length 
        : 0;

      const scale = 1 + (avgFreq / 255) * 0.5;

      const isDark = document.body.classList.contains('dark');
      const opacityBase = isDark ? 0.2 : 0.1;
      const opacityEdge = isDark ? 0.15 : 0.05;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient 1
      const grad1 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.2, 0,
        canvas.width * 0.2, canvas.height * 0.2, canvas.width * 0.6 * scale
      );
      grad1.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacityBase})`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Gradient 2
      const grad2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.8, 0,
        canvas.width * 0.8, canvas.height * 0.8, canvas.width * 0.6 * scale
      );
      grad2.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacityEdge})`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, isPlaying]);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
      style={{ opacity: isPlaying ? 1 : 0.4 }}
    />
  );
};

export default AmbientVisualizer;
