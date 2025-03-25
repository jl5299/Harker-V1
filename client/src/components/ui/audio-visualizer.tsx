import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export function AudioVisualizer({ isRecording }: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || !containerRef.current) return;

    const container = containerRef.current;
    const bars = Array.from(container.querySelectorAll('.visualizer-bar'));
    
    // If no bars exist yet, create them
    if (bars.length === 0) {
      for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar bg-primary';
        bar.style.width = '10px';
        bar.style.height = '30%';
        bar.style.marginRight = '2px';
        container.appendChild(bar);
      }
    }

    const animate = () => {
      const bars = container.querySelectorAll('.visualizer-bar');
      bars.forEach(bar => {
        const height = 30 + Math.random() * 70;
        (bar as HTMLElement).style.height = `${height}%`;
      });
      
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRecording]);

  return (
    <div 
      ref={containerRef} 
      className="flex items-end space-x-1 h-full w-full justify-center"
    >
      {/* Bars will be created dynamically in useEffect */}
    </div>
  );
}
