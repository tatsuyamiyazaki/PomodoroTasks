
import React, { useState, useEffect, useRef } from 'react';
import type { Task, Project, Recurrence, Reminder } from '../types';
import { Priority, RecurrenceFrequency } from '../types';
import { X, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Calendar } from './Calendar';

interface TaskEditModalProps {
  isOpen: boolean;
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  allTasks: Task[];
}

const weekDays = [
    { label: '日', value: 0 },
    { label: '月', value: 1 },
    { label: '火', value: 2 },
    { label: '水', value: 3 },
    { label: '木', value: 4 },
    { label: '金', value: 5 },
    { label: '土', value: 6 },
];

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, task, projects, onClose, onSave, allTasks }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [tags, setTags] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<Recurrence | undefined>(undefined);
  const [reminder, setReminder] = useState<Reminder | undefined>(undefined);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setPriority(task.priority);
      setTags(task.tags.join(', '));
      setEstimatedMinutes(task.estimatedMinutes);
      setProjectId(task.projectId);
      setRecurrence(task.recurrence);
      setReminder(task.reminder);
    }
  }, [task]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
            setIsCalendarOpen(false);
        }
    };
    if (isCalendarOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      title,
      dueDate,
      priority,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      estimatedMinutes: Number(estimatedMinutes) || 0,
      projectId,
      recurrence,
      reminder,
    };
    onSave(updatedTask);
  };
  
  const handleDateSelect = (date: Date) => {
    setDueDate(date);
    setIsCalendarOpen(false);
  }

  const handleRecurrenceFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const frequency = e.target.value as RecurrenceFrequency | 'NONE';
    if (frequency === 'NONE') {
        setRecurrence(undefined);
    } else {
        setRecurrence({ 
            frequency, 
            interval: 1,
            daysOfWeek: frequency === RecurrenceFrequency.WEEKLY ? [] : undefined,
            daysOfMonth: frequency === RecurrenceFrequency.MONTHLY ? [] : undefined,
        });
    }
  };
  
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (recurrence) {
        const newInterval = parseInt(e.target.value, 10);
        setRecurrence({ ...recurrence, interval: isNaN(newInterval) || newInterval < 1 ? 1 : newInterval });
    }
  }

  const handleDaysOfMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (recurrence && recurrence.frequency === RecurrenceFrequency.MONTHLY) {
        const days = e.target.value
            .split(',')
            .map(d => parseInt(d.trim(), 10))
            .filter(d => !isNaN(d) && d >= 1 && d <= 31);
        setRecurrence({ ...recurrence, daysOfMonth: days });
    }
  }

  const handleWeeklyDayChange = (dayValue: number) => {
    if (recurrence && recurrence.frequency === RecurrenceFrequency.WEEKLY) {
        const currentDays = recurrence.daysOfWeek || [];
        const newDays = currentDays.includes(dayValue)
            ? currentDays.filter(d => d !== dayValue)
            : [...currentDays, dayValue];
        setRecurrence({ ...recurrence, daysOfWeek: newDays });
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '期限なし';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateRecurrenceSummary = (rec: Recurrence | undefined): string => {
    if (!rec) return '';

    const interval = rec.interval || 1;
    const weekDayLabels = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    
    let summary = '繰り返す: ';

    switch (rec.frequency) {
        case RecurrenceFrequency.DAILY:
            summary += interval === 1 ? '毎日' : `${interval}日ごと`;
            break;
        case RecurrenceFrequency.WEEKLY:
            summary += interval === 1 ? '毎週' : `${interval}週間ごと`;
            if (rec.daysOfWeek && rec.daysOfWeek.length > 0) {
                const selectedDays = rec.daysOfWeek.sort().map(d => weekDayLabels[d]).join('、');
                summary += ` ${selectedDays}`;
            }
            break;
        case RecurrenceFrequency.MONTHLY:
            summary += interval === 1 ? '毎月' : `${interval}ヶ月ごと`;
             if (rec.daysOfMonth && rec.daysOfMonth.length > 0) {
                const selectedDates = rec.daysOfMonth.sort((a,b)=>a-b).map(d => `${d}日`).join('、');
                summary += ` ${selectedDates}`;
            }
            break;
        case RecurrenceFrequency.YEARLY:
             summary += interval === 1 ? '毎年' : `${interval}年ごと`;
            break;
        default:
            return '';
    }
    return summary;
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">タスクを編集</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="閉じる">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">タスク名</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative" ref={calendarRef}>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">期限</label>
                 <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    type="button"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <span>{formatDate(dueDate)}</span>
                    <CalendarIcon size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
                {isCalendarOpen && (
                    <div className="absolute top-full mt-1 z-20">
                        <Calendar 
                            selectedDate={dueDate} 
                            onSelectDate={handleDateSelect}
                            tasks={allTasks}
                        />
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">優先度</label>
                <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                <option value={Priority.High}>高</option>
                <option value={Priority.Medium}>中</option>
                <option value={Priority.Low}>低</option>
                </select>
            </div>
          </div>
           <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">プロジェクト</label>
              <select
                id="project"
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value || null)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">プロジェクトなし</option>
                {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">リマインダー</label>
                {!reminder ? (
                    <button
                        type="button"
                        onClick={() => setReminder({ value: 10, unit: 'minutes' })}
                        className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-primary hover:text-primary"
                    >
                        リマインダーを追加
                    </button>
                ) : (
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            min="1"
                            value={reminder.value}
                            onChange={(e) => setReminder({ ...reminder, value: parseInt(e.target.value, 10) || 1 })}
                            className="w-20 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <select
                            value={reminder.unit}
                            onChange={(e) => setReminder({ ...reminder, unit: e.target.value as 'minutes' | 'hours' | 'days' })}
                            className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="minutes">分前</option>
                            <option value="hours">時間前</option>
                            <option value="days">日前</option>
                        </select>
                        <button type="button" onClick={() => setReminder(undefined)} className="p-2 text-gray-500 hover:text-danger rounded-full" aria-label="リマインダーを削除">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
            <div>
              <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">繰り返し</label>
              <select
                id="recurrence"
                value={recurrence?.frequency || 'NONE'}
                onChange={handleRecurrenceFrequencyChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                  <option value="NONE">なし</option>
                  <option value={RecurrenceFrequency.DAILY}>毎日</option>
                  <option value={RecurrenceFrequency.WEEKLY}>毎週</option>
                  <option value={RecurrenceFrequency.MONTHLY}>毎月</option>
                  <option value={RecurrenceFrequency.YEARLY}>毎年</option>
              </select>
            </div>
            
            {recurrence && recurrence.frequency && (
                <div className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">間隔</label>
                        <div className="flex items-center mt-1">
                            <span className="mr-2">毎</span>
                            <input
                                type="number"
                                min="1"
                                value={recurrence.interval || 1}
                                onChange={handleIntervalChange}
                                className="w-16 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <span className="ml-2">
                                {
                                    {
                                        [RecurrenceFrequency.DAILY]: '日ごと',
                                        [RecurrenceFrequency.WEEKLY]: '週間ごと',
                                        [RecurrenceFrequency.MONTHLY]: 'ヶ月ごと',
                                        [RecurrenceFrequency.YEARLY]: '年ごと',
                                    }[recurrence.frequency]
                                }
                            </span>
                        </div>
                    </div>

                    {recurrence.frequency === RecurrenceFrequency.WEEKLY && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">曜日を選択</label>
                            <div className="flex justify-around">
                                {weekDays.map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => handleWeeklyDayChange(day.value)}
                                        className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors ${
                                            recurrence.daysOfWeek?.includes(day.value) ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {recurrence.frequency === RecurrenceFrequency.MONTHLY && (
                         <div>
                            <label htmlFor="daysOfMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">毎月の特定日 (カンマ区切り)</label>
                            <input
                                type="text"
                                id="daysOfMonth"
                                value={recurrence.daysOfMonth?.join(', ') || ''}
                                onChange={handleDaysOfMonthChange}
                                placeholder="例: 1, 15"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                         </div>
                    )}
                </div>
            )}

            {recurrence && (
                <div className="text-sm text-gray-600 dark:text-gray-400 -mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {generateRecurrenceSummary(recurrence)}
                </div>
            )}

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">タグ (カンマ区切り)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例: 仕事, 緊急"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="estimatedMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">作業時間 (分)</label>
            <input
              type="number"
              id="estimatedMinutes"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 0)}
              min="0"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
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