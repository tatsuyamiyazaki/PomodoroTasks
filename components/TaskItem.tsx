import React, { useState, useEffect, useRef } from 'react';
import type { Task } from '../types';
import { Play, MoreHorizontal, Trash2, Edit, Repeat } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  openEditModal: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onUpdate, onDelete, openEditModal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleUpdate = () => {
    onUpdate({ ...task, title });
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleUpdate();
    } else if (e.key === 'Escape') {
        setTitle(task.title);
        setIsEditing(false);
    }
  }

  return (
    <div className={`flex items-center p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 group ${task.completed ? 'opacity-50' : ''}`}>
      <button onClick={() => onToggle(task.id)} className="mr-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
            {task.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
        </div>
      </button>

      {isEditing ? (
        <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            onBlur={handleUpdate}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 rounded px-1 -my-1" 
            autoFocus 
        />
      ) : (
        <span onClick={() => setIsEditing(true)} className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {task.title}
        </span>
      )}
      
      <div className="flex items-center ml-auto pl-4 space-x-2 text-gray-500 dark:text-gray-400">
        {task.recurrence && <Repeat size={14} className="text-gray-400" />}
        {task.tags.map(tag => (
          <span key={tag} className="text-xs text-blue-600 dark:text-blue-400">#{tag}</span>
        ))}
        {task.dueDate && <span className="text-xs">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
        <button className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={16} />
        </button>
        <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-lg z-10">
                    <button onClick={() => { openEditModal(task); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center">
                        <Edit size={14} className="mr-2" />
                        タスクを編集
                    </button>
                    <button onClick={() => { onDelete(task.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                        <Trash2 size={14} className="mr-2" />
                        削除
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};