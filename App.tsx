
import React, { useState, useMemo } from 'react';
import type { Script, Settings, View } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LibraryView } from './components/LibraryView';
import { EditorView } from './components/EditorView';
import { TeleprompterView } from './components/TeleprompterView';

const defaultSettings: Settings = {
  speed: 120,
  fontSize: 4,
  fontFamily: 'sans',
  textColor: '#e2e8f0', // slate-200
  backgroundColor: '#0f172a', // slate-900
  isMirrored: false,
};

const App: React.FC = () => {
  const [scripts, setScripts] = useLocalStorage<Script[]>('teleprompter-scripts', []);
  const [settings, setSettings] = useLocalStorage<Settings>('teleprompter-settings', defaultSettings);
  const [currentView, setCurrentView] = useState<View>('library');
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  
  const handleCreateNew = () => {
    setActiveScriptId(null);
    setCurrentView('editor');
  };

  const handleEditScript = (id: string) => {
    setActiveScriptId(id);
    setCurrentView('editor');
  };

  const handleSaveScript = (script: Script) => {
    const exists = scripts.some(s => s.id === script.id);
    if (exists) {
      setScripts(scripts.map(s => s.id === script.id ? script : s));
    } else {
      setScripts([...scripts, script]);
    }
    setCurrentView('library');
  };

  const handleDeleteScript = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este guion?')) {
        setScripts(scripts.filter(s => s.id !== id));
    }
  };
  
  const handleSelectScript = (id: string) => {
    setActiveScriptId(id);
    setCurrentView('prompter');
  };
  
  const handleExitPrompter = () => {
    setCurrentView('library');
    setActiveScriptId(null);
  };
  
  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const activeScript = useMemo(() => {
    if (currentView === 'editor' || currentView === 'prompter') {
      return scripts.find(s => s.id === activeScriptId) || null;
    }
    return null;
  }, [scripts, activeScriptId, currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'editor':
        return <EditorView script={activeScript} onSave={handleSaveScript} onCancel={() => setCurrentView('library')} />;
      case 'prompter':
        if (activeScript) {
          return <TeleprompterView script={activeScript} settings={settings} onSettingsChange={handleSettingsChange} onExit={handleExitPrompter} />;
        }
        // Fallback to library if no active script
        setCurrentView('library');
        return null;
      case 'library':
      default:
        return <LibraryView scripts={scripts} onSelectScript={handleSelectScript} onEditScript={handleEditScript} onDeleteScript={handleDeleteScript} onCreateNew={handleCreateNew} />;
    }
  };

  return <div className="App">{renderView()}</div>;
};

export default App;