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
      
      // Calculate bands
      let bass = 0;
      let treble = 0;
      if (freqData.length > 0) {
        // Bass: First 10% of spectrum
        const bassEnd = Math.floor(freqData.length * 0.1);
        bass = freqData.slice(0, bassEnd).reduce((a, b) => a + b, 0) / bassEnd;
        
        // Treble: Last 30% of spectrum
        const trebleStart = Math.floor(freqData.length * 0.7);
        treble = freqData.slice(trebleStart).reduce((a, b) => a + b, 0) / (freqData.length - trebleStart);
      }

      const bassScale = 1 + (bass / 255) * 0.6;
      const trebleScale = 1 + (treble / 255) * 0.4;
      const globalPulse = isPlaying ? 1 + Math.sin(Date.now() / 1000) * 0.05 : 1;

      const isDark = document.body.classList.contains('dark');
      const opacityBase = isDark ? 0.2 : 0.15;
      const opacityEdge = isDark ? 0.15 : 0.08;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient 1 (Bass Pulse)
      const grad1 = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.7 * bassScale * globalPulse
      );
      grad1.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacityBase})`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Gradient 2 (Treble Flicker)
      const grad2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.7, 0,
        canvas.width * 0.7, canvas.height * 0.7, canvas.width * 0.5 * trebleScale
      );
      grad2.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacityEdge})`);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

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
