
import React, { useState, useMemo } from 'react';
import type { Task, Project, Recurrence } from '../types';
import { RecurrenceFrequency } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  openEditModal: (task: Task) => void;
}

const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

// This helper function calculates the next due date for a recurring task.
// It is copied from App.tsx to ensure consistent logic across the application.
const calculateNextDueDate = (currentDueDate: Date, recurrence: Recurrence): Date => {
  const nextDate = new Date(currentDueDate);
  nextDate.setHours(0, 0, 0, 0);
  const interval = recurrence.interval || 1;

  switch (recurrence.frequency) {
    case RecurrenceFrequency.DAILY:
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    
    case RecurrenceFrequency.WEEKLY:
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const sortedDays = [...recurrence.daysOfWeek].sort((a, b) => a - b);
        let currentDay = nextDate.getDay();
        let nextDayOfWeek = sortedDays.find(d => d > currentDay);
        
        if (nextDayOfWeek !== undefined) {
          nextDate.setDate(nextDate.getDate() + (nextDayOfWeek - currentDay));
        } else {
          const daysToAdd = (7 - currentDay) + sortedDays[0] + (interval - 1) * 7;
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        }
      } else {
        nextDate.setDate(nextDate.getDate() + 7 * interval);
      }
      break;

    case RecurrenceFrequency.MONTHLY:
      if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
          const sortedDays = [...recurrence.daysOfMonth].sort((a,b) => a - b);
          const currentDayOfMonth = nextDate.getDate();
          
          let nextDayOfMonth = sortedDays.find(d => d > currentDayOfMonth);

          if (nextDayOfMonth !== undefined) {
              const tempDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDayOfMonth);
              if (tempDate.getMonth() === nextDate.getMonth()) {
                  nextDate.setDate(nextDayOfMonth);
                  return nextDate;
              }
          }

          let monthOffset = 0;
          while(true) {
              monthOffset += interval;
              const nextMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + monthOffset, 1);
              
              for (const day of sortedDays) {
                  const candidateDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
                  if (candidateDate.getMonth() === nextMonth.getMonth()) {
                      return candidateDate;
                  }
              }
          }
      } else {
        nextDate.setMonth(nextDate.getMonth() + interval);
      }
      break;

    case RecurrenceFrequency.YEARLY:
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }
  return nextDate;
};


export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, projects, openEditModal }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = useMemo(() => {
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [year, month, firstDayOfMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    const monthStartDate = new Date(year, month, 1);
    monthStartDate.setHours(0,0,0,0);
    const monthEndDate = new Date(year, month + 1, 0);
    monthEndDate.setHours(23, 59, 59, 999);

    tasks.forEach(task => {
      // Handle recurring tasks
      if (task.recurrence && task.dueDate) {
        let occurrenceDate = new Date(task.dueDate);

        // Fast-forward to the start of the current month view to avoid excessive iteration
        let i = 0;
        while (occurrenceDate < monthStartDate && i < 2000) { // Safety limit for the loop
            const nextDate = calculateNextDueDate(occurrenceDate, task.recurrence);
            if (nextDate.getTime() <= occurrenceDate.getTime()) break;
            occurrenceDate = nextDate;
            i++;
        }

        i = 0; // Reset for rendering loop
        // Add occurrences that fall within the current month
        while (occurrenceDate <= monthEndDate && i < 100) { // Safety limit for occurrences per month
            if (occurrenceDate >= monthStartDate) {
                const dateString = occurrenceDate.toDateString();
                if (!map.has(dateString)) {
                    map.set(dateString, []);
                }
                // Push a virtual task with the correct due date for this occurrence
                map.get(dateString)!.push({ ...task, dueDate: new Date(occurrenceDate) });
            }
            
            const nextDate = calculateNextDueDate(occurrenceDate, task.recurrence);
            if (nextDate.getTime() <= occurrenceDate.getTime()) break;
            occurrenceDate = nextDate;
            i++;
        }
      } 
      // Handle non-recurring tasks
      else if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        if (taskDate >= monthStartDate && taskDate <= monthEndDate) {
            const dateString = taskDate.toDateString();
            if (!map.has(dateString)) {
                map.set(dateString, []);
            }
            map.get(dateString)!.push(task);
        }
      }
    });
    return map;
  }, [tasks, year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return 'bg-gray-400';
    return projects.find(p => p.id === projectId)?.color || 'bg-gray-400';
  };
  
  const isToday = (d: Date) => {
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="前の月">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="次の月">
              <ChevronRight size={20} />
            </button>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {year}年 {month + 1}月
        </h2>
        <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
            今日
        </button>
      </header>
      <div className="grid grid-cols-7 flex-shrink-0">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-300 py-3 border-b border-r border-gray-200 dark:border-gray-700 last:border-r-0">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-5 flex-1 overflow-hidden">
        {daysInMonth.map((day, index) => (
          <div key={index} className="border-b border-r border-gray-200 dark:border-gray-700 p-2 flex flex-col overflow-y-auto relative last:border-r-0">
            {day && (
                <>
                    <span className={`font-semibold text-sm ${isToday(day) ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700 dark:text-gray-300'}`}>
                        {day.getDate()}
                    </span>
                    <div className="mt-2 space-y-1">
                        {tasksByDate.get(day.toDateString())?.map(task => (
                            <button 
                                key={task.id + (task.dueDate ? task.dueDate.getTime() : '')} 
                                onClick={() => openEditModal(task)} 
                                className={`w-full text-left text-xs p-1.5 rounded-md flex items-center group ${task.completed ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 line-through' : 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200'}`}
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 ${getProjectColor(task.projectId)}`}></span>
                                <span className="truncate">{task.title}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};