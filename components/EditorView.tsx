
import React, { useState, useEffect, useRef } from 'react';
import type { Script } from '../types';
import { ArrowBackIcon } from './icons';

interface EditorViewProps {
  script: Script | null;
  onSave: (script: Script) => void;
  onCancel: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ script, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (script) {
      setTitle(script.title);
      setContent(script.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [script]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('El título es obligatorio.');
      return;
    }
    onSave({
      id: script?.id || new Date().toISOString(),
      title: title.trim(),
      content: content,
      createdAt: script?.createdAt || Date.now()
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const text = await file.text();
      setContent(prev => prev ? `${prev}\n\n${text}` : text);
    } else if (file) {
        alert("Por favor, selecciona un archivo .txt");
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        setContent(prev => prev ? `${prev}\n\n${text}`: text);
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert("No se pudo pegar el texto del portapapeles.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="flex items-center justify-between mb-6 flex-shrink-0">
        <button onClick={onCancel} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
          <ArrowBackIcon className="w-6 h-6" />
          <span className="text-lg">Volver a la Biblioteca</span>
        </button>
        <h1 className="text-2xl font-bold">{script ? 'Editar Guion' : 'Nuevo Guion'}</h1>
      </header>

      <div className="flex-grow flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <input
          type="text"
          placeholder="Título del guion..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold px-4 py-3 bg-gray-800 border-b-2 border-gray-700 focus:border-cyan-500 rounded-t-lg focus:outline-none transition-colors"
        />
        <div className="flex-grow flex flex-col">
          <textarea
            placeholder="Escribe o pega tu guion aquí... Puedes usar **negrita** y *cursiva*."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full flex-grow p-4 bg-gray-800 border border-gray-700 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none leading-relaxed"
            style={{ minHeight: '40vh' }}
          />
        </div>
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Importar .txt</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt" className="hidden" />
            <button onClick={handlePaste} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Pegar</button>
          </div>
          <button onClick={handleSave} className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-500 transition-colors shadow-lg">
            Guardar Guion
          </button>
        </footer>
      </div>
    </div>
  );
};