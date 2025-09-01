import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddTaskFormProps {
  onAddTask: (title: string) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(title);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Plus size={20} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="「タスク」に追加したいタスク名を入力してください、「リターンキー」を押して保存して下さい"
        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </form>
  );
};