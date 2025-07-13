
import React, { useState } from 'react';
import type { Script } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons';

interface LibraryViewProps {
  scripts: Script[];
  onSelectScript: (id: string) => void;
  onEditScript: (id: string) => void;
  onDeleteScript: (id: string) => void;
  onCreateNew: () => void;
}

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

export const LibraryView: React.FC<LibraryViewProps> = ({ scripts, onSelectScript, onEditScript, onDeleteScript, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScripts = scripts
    .filter(script => script.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cyan-400">Entre Palabras Urgentes</h1>
        <p className="text-lg text-gray-400 mt-2">Tu biblioteca de guiones</p>
      </header>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar guiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
          />
        </div>

        <div className="space-y-4">
          {filteredScripts.length > 0 ? (
            filteredScripts.map(script => (
              <div key={script.id} className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300">
                <div className="flex-grow text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-white">{script.title}</h2>
                  <p className="text-sm text-gray-400">Creado: {formatDate(script.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => onEditScript(script.id)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Editar"><EditIcon className="w-5 h-5" /></button>
                  <button onClick={() => onDeleteScript(script.id)} className="p-2 rounded-full text-red-400 hover:bg-red-900/50 transition-colors" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                  <button onClick={() => onSelectScript(script.id)} className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-500 transition-colors shadow-md">
                    Iniciar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
                <h3 className="text-2xl font-semibold">No hay guiones</h3>
                <p className="text-gray-400 mt-2">Crea tu primer guion para empezar.</p>
                <button onClick={onCreateNew} className="mt-6 bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-500 transition-colors shadow-md flex items-center gap-2 mx-auto">
                    <PlusIcon className="w-6 h-6"/>
                    Crear Nuevo Guion
                </button>
            </div>
          )}
        </div>
      </div>

      <button onClick={onCreateNew} className="fixed bottom-8 right-8 bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform hover:scale-110 transition-transform" title="Crear Nuevo Guion">
        <PlusIcon className="w-8 h-8"/>
      </button>
    </div>
  );
};