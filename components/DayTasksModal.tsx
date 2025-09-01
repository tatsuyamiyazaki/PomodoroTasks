import React from 'react';
import type { Task, Project } from '../types';
import { X } from 'lucide-react';

interface DayTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  tasks: Task[];
  projects: Project[];
  openEditModal: (task: Task) => void;
}

export const DayTasksModal: React.FC<DayTasksModalProps> = ({ isOpen, onClose, date, tasks, projects, openEditModal }) => {
    if (!isOpen || !date) return null;
    
    const getProjectColor = (projectId: string | null) => {
        if (!projectId) return 'bg-gray-400';
        return projects.find(p => p.id === projectId)?.color || 'bg-gray-400';
    };
    
    const handleTaskClick = (task: Task) => {
        openEditModal(task);
        onClose(); // Close this modal when opening the edit modal
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="閉じる">
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                {tasks.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {tasks.map(task => (
                            <li key={task.id + (task.dueDate ? task.dueDate.getTime() : '')}>
                                <button 
                                    onClick={() => handleTaskClick(task)}
                                    className="w-full text-left p-3 rounded-md flex items-center transition-colors group bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <span className={`w-3 h-3 rounded-full mr-3 shrink-0 ${getProjectColor(task.projectId)}`}></span>
                                    <div className="flex-grow">
                                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {task.title}
                                        </p>
                                    </div>
                                    {task.completed && <span className="text-xs text-green-600 dark:text-green-400">完了</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">この日のタスクはありません。</p>
                )}
            </div>
        </div>
    );
};
