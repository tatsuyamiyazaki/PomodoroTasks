import React, { useState, useMemo } from 'react';
import type { Task, View } from '../types';
import { SortAsc } from 'lucide-react';
import { SummaryCard } from './SummaryCard';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';

interface MainContentProps {
  view: View;
  tasks: Task[];
  allTasks: Task[];
  addTask: (title: string) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  openEditModal: (task: Task) => void;
}

export const MainContent: React.FC<MainContentProps> = ({ view, tasks, allTasks, addTask, updateTask, deleteTask, toggleTaskCompletion, openEditModal }) => {
  const [showCompleted, setShowCompleted] = useState(false);

  const { scheduledMinutes, uncompletedTasks, executedMinutes, completedTasksCount } = useMemo(() => {
    const today = new Date().toDateString();
    const todaysTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today);
    
    const scheduledMinutes = todaysTasks.filter(t => !t.completed).reduce((sum, task) => sum + task.estimatedMinutes, 0);
    const uncompletedTasks = todaysTasks.filter(t => !t.completed).length;
    
    const completedToday = allTasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today);
    const executedMinutes = completedToday.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    const completedTasksCount = completedToday.length;
    
    return { scheduledMinutes, uncompletedTasks, executedMinutes, completedTasksCount };
  }, [allTasks]);
  
  const uncompletedTasksInView = tasks.filter(t => !t.completed);
  const completedTasksInView = tasks.filter(t => t.completed);
  
  const uncompletedMinutesInView = useMemo(() => 
    uncompletedTasksInView.reduce((sum, task) => sum + task.estimatedMinutes, 0)
  , [uncompletedTasksInView]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{view.title}</h2>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <SortAsc size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="予定時間" value={`${scheduledMinutes}`} unit="分" color="text-blue-500" />
        <SummaryCard label="未完了のタスク" value={uncompletedTasks.toString()} color="text-orange-500" />
        <SummaryCard label="実行済みの時間" value={`${executedMinutes}`} unit="分" color="text-green-500" />
        <SummaryCard label="完了済のタスク" value={completedTasksCount.toString()} color="text-red-500" />
      </div>

      <AddTaskForm onAddTask={addTask} />

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">フォーカス・{uncompletedMinutesInView}分</h3>
        {uncompletedTasksInView.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {uncompletedTasksInView.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleTaskCompletion} 
                onUpdate={updateTask} 
                onDelete={deleteTask}
                openEditModal={openEditModal}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">タスクはありません</p>
        )}
      </div>

      {completedTasksInView.length > 0 && (
          <div className="mt-8 text-center">
            <button onClick={() => setShowCompleted(!showCompleted)} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium">
              {showCompleted ? '完了済みのタスクを隠す' : '完了済みのタスクを表示'}▼
            </button>
          </div>
      )}

      {showCompleted && completedTasksInView.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">完了済み - {completedTasksInView.length}</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {completedTasksInView.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleTaskCompletion} 
                onUpdate={updateTask} 
                onDelete={deleteTask}
                openEditModal={openEditModal}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};