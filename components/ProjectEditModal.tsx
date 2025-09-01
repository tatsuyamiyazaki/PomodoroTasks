import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
import { X } from 'lucide-react';

interface ProjectEditModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (projectData: {id?: string; name: string; color: string}) => void;
}

const availableColors = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 
  'bg-green-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500'
];

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ isOpen, project, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(availableColors[0]);

  useEffect(() => {
    if (isOpen) {
        if (project) {
            setName(project.name);
            setColor(project.color);
        } else {
            setName('');
            setColor(availableColors[0]);
        }
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim() === '') return;
    onSave({ id: project?.id, name, color });
  };
  
  const title = project ? 'プロジェクトを編集' : '新規プロジェクト';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="閉じる">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">プロジェクト名</label>
            <input
              type="text"
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">カラー</label>
            <div className="flex flex-wrap gap-2">
                {availableColors.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c} transition-transform ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''}`}></button>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};