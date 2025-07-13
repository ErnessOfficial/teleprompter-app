
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Script, Settings } from '../types';
import { PlayIcon, PauseIcon, SettingsIcon, ArrowBackIcon, FullscreenIcon, FullscreenExitIcon } from './icons';

interface TeleprompterViewProps {
  script: Script;
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  onExit: () => void;
}

const parseContent = (content: string) => {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
};

const SettingsPanel: React.FC<{
    settings: Settings;
    onSettingsChange: (newSettings: Partial<Settings>) => void;
    onClose: () => void;
}> = ({ settings, onSettingsChange, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-6 text-center text-cyan-400">Ajustes de Visualización</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Velocidad (Palabras por minuto)</label>
                        <input type="range" min="20" max="300" value={settings.speed} onChange={e => onSettingsChange({ speed: Number(e.target.value) })} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        <div className="text-center mt-1 text-cyan-400 font-semibold">{settings.speed} PPM</div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Tamaño de Fuente</label>
                        <input type="range" min="1" max="10" step="0.1" value={settings.fontSize} onChange={e => onSettingsChange({ fontSize: Number(e.target.value) })} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                         <div className="text-center mt-1 text-cyan-400 font-semibold">{settings.fontSize.toFixed(1)} rem</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Estilo de Fuente</label>
                        <div className="flex gap-2">
                           <button onClick={() => onSettingsChange({ fontFamily: 'sans' })} className={`w-full py-2 rounded-lg ${settings.fontFamily === 'sans' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Sans-Serif</button>
                           <button onClick={() => onSettingsChange({ fontFamily: 'serif' })} className={`w-full py-2 rounded-lg ${settings.fontFamily === 'serif' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Serif</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Modo de Color</label>
                         <div className="flex gap-2">
                           <button onClick={() => onSettingsChange({ backgroundColor: '#0f172a', textColor: '#e2e8f0' })} className="w-full py-2 rounded-lg bg-gray-700">Oscuro</button>
                           <button onClick={() => onSettingsChange({ backgroundColor: '#ffffff', textColor: '#000000' })} className="w-full py-2 rounded-lg bg-gray-200 text-black">Claro</button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                         <label className="text-sm font-medium text-gray-400">Modo Espejo</label>
                         <button onClick={() => onSettingsChange({ isMirrored: !settings.isMirrored })} className={`px-4 py-2 rounded-lg ${settings.isMirrored ? 'bg-cyan-600' : 'bg-gray-700'}`}>{settings.isMirrored ? 'Activado' : 'Desactivado'}</button>
                    </div>

                </div>
                 <button onClick={onClose} className="mt-8 w-full py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-500 transition-colors">Cerrar</button>
            </div>
        </div>
    );
};

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({ script, settings, onSettingsChange, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<number>();
  const [showControls, setShowControls] = useState(true);

  const wordsPerSecond = settings.speed / 60;
  // This is a rough estimation. A better calculation would involve line height and font size.
  // For now, we'll use a multiplier.
  const scrollSpeed = (settings.fontSize * wordsPerSecond) / 10; 

  const scrollStep = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollTop < scrollHeight - clientHeight) {
            scrollContainerRef.current.scrollTop += scrollSpeed;
            animationFrameId.current = requestAnimationFrame(scrollStep);
        } else {
            setIsPlaying(false);
        }
    }
  }, [scrollSpeed]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(scrollStep);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      lastTimeRef.current = 0;
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, scrollStep]);
  
  const togglePlay = () => setIsPlaying(prev => !prev);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
        if(isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    handleUserActivity();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    return () => {
        window.removeEventListener('mousemove', handleUserActivity);
        window.removeEventListener('click', handleUserActivity);
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
        }
    }
  }, [handleUserActivity]);

  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const progress = scrollContainerRef.current ? (scrollContainerRef.current.scrollTop / (scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight)) * 100 : 0;
  
  const wordCount = script.content.split(/\s+/).filter(Boolean).length;
  const estimatedTime = wordCount > 0 ? Math.round(wordCount / settings.speed * 60) : 0;
  const timeElapsed = (progress / 100) * estimatedTime;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div 
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto"
        onClick={togglePlay}
        style={{ fontFamily: settings.fontFamily === 'serif' ? 'serif' : 'sans-serif' }}
      >
        <div 
            className={`px-8 md:px-16 lg:px-24 py-1/2-screen transition-transform duration-300 ${settings.isMirrored ? 'transform -scale-x-100' : ''}`} 
            style={{ fontSize: `${settings.fontSize}rem`, lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: parseContent(script.content) }}
        >
        </div>
      </div>

      <div className={`fixed inset-x-0 top-0 p-4 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button onClick={onExit} className="flex items-center gap-2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
                <ArrowBackIcon className="w-6 h-6 text-white"/>
                <span className="text-white hidden sm:block">Biblioteca</span>
            </button>
            <div className="text-white text-center text-sm bg-black/30 px-3 py-1 rounded-full">
                {formatTime(timeElapsed)} / {formatTime(estimatedTime)}
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"><SettingsIcon className="w-6 h-6 text-white"/></button>
                 <button onClick={toggleFullscreen} className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
                    {isFullscreen ? <FullscreenExitIcon className="w-6 h-6 text-white" /> : <FullscreenIcon className="w-6 h-6 text-white"/>}
                 </button>
            </div>
        </div>
      </div>


      <div className={`fixed inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full bg-gray-600/50 rounded-full h-1.5 mb-2">
            <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <span className="text-white font-mono text-sm">{settings.speed}</span>
          <input type="range" min="20" max="300" value={settings.speed} onChange={e => onSettingsChange({ speed: Number(e.target.value) })} className="w-full h-2 bg-gray-700/80 rounded-lg appearance-none cursor-pointer thumb:bg-white" />
          <button onClick={togglePlay} className="p-4 rounded-full bg-cyan-500 text-white shadow-lg">
            {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
          </button>
        </div>
      </div>

      {isSettingsOpen && <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};