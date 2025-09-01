
import React, { useState, useMemo } from 'react';
import type { Task, Recurrence } from '../types';
import { RecurrenceFrequency } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
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

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, tasks }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const taskDates = useMemo(() => {
    const dates = new Set<string>();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStartDate = new Date(year, month, 1);
    monthStartDate.setHours(0,0,0,0);
    const monthEndDate = new Date(year, month + 1, 0);
    monthEndDate.setHours(23, 59, 59, 999);

    tasks.forEach(task => {
      // Handle recurring tasks
      if (task.recurrence && task.dueDate) {
        let occurrenceDate = new Date(task.dueDate);

        // Fast-forward to the start of the current month view
        let i = 0;
        while (occurrenceDate < monthStartDate && i < 2000) {
            const nextDate = calculateNextDueDate(occurrenceDate, task.recurrence);
            if (nextDate.getTime() <= occurrenceDate.getTime()) break;
            occurrenceDate = nextDate;
            i++;
        }

        i = 0;
        // Add occurrences within the current month
        while (occurrenceDate <= monthEndDate && i < 100) {
            if (occurrenceDate >= monthStartDate) {
                dates.add(occurrenceDate.toDateString());
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
            dates.add(taskDate.toDateString());
        }
      }
    });
    return dates;
  }, [tasks, currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth: (Date | null)[] = [];
  // Add blank days for the start of the month
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    daysInMonth.push(null);
  }
  // Add days of the month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(year, month, i));
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: Date) => {
    onSelectDate(day);
  };
  
  const isSameDay = (d1: Date, d2: Date | null) => {
    if (!d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };
  
  const isToday = (d: Date) => isSameDay(d, new Date());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-4 w-72">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="前の月">
          <ChevronLeft size={20} />
        </button>
        <div className="font-semibold text-gray-800 dark:text-gray-200">
          {year}年 {month + 1}月
        </div>
        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="次の月">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="font-medium">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 place-items-center">
        {daysInMonth.map((day, index) =>
          day ? (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-colors font-medium
                ${isToday(day) && !isSameDay(day, selectedDate) ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}
                ${isSameDay(day, selectedDate) ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
            >
              <span>{day.getDate()}</span>
              {taskDates.has(day.toDateString()) && (
                  <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSameDay(day, selectedDate) ? 'bg-white' : 'bg-primary'}`}></span>
              )}
            </button>
          ) : (
            <div key={index} />
          )
        )}
      </div>
    </div>
  );
};