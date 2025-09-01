
import React, { useState, useMemo } from 'react';
import type { Task, PomodoroSession } from '../types';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface ReportsViewProps {
    tasks: Task[];
    pomodoroHistory: PomodoroSession[];
}

// --- Date Helper Functions ---
const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return getStartOfDay(new Date(d.setDate(diff)));
};
const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

// Fix: Specified that the icon prop is a ReactElement whose props can include a className.
// This allows React.cloneElement to correctly type-check the new props being added.
const ReportCard: React.FC<{ title: string; value: string | number; subValue?: string; colorClass?: string; icon: React.ReactElement<{ className?: string }> }> = ({ title, value, subValue, colorClass = 'text-blue-500', icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start">
        <div className={`mr-4 p-2 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
            {React.cloneElement(icon, { className: `${icon.props.className || ''} ${colorClass}`.trim() })}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            {subValue && <p className="text-xs text-gray-400 dark:text-gray-500">{subValue}</p>}
        </div>
    </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode; controls?: React.ReactNode }> = ({ title, children, controls }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
            {controls}
        </div>
        <div className="h-64 flex items-center justify-center">
            {children}
        </div>
    </div>
);

const EmptyState: React.FC = () => (
    <div className="text-center text-gray-400 dark:text-gray-500">
        <Inbox size={48} className="mx-auto" />
        <p className="mt-2 text-sm">データ無し</p>
    </div>
);

export const ReportsView: React.FC<ReportsViewProps> = ({ tasks, pomodoroHistory }) => {
    const [taskChartRange, setTaskChartRange] = useState<'day' | 'week' | 'month'>('week');
    
    const stats = useMemo(() => {
        const now = new Date();
        const todayStart = getStartOfDay(now);
        const thisWeekStart = getStartOfWeek(now);
        
        const completedPomodoros = pomodoroHistory.length;
        const pomodorosToday = pomodoroHistory.filter(p => new Date(p.completedAt) >= todayStart);
        const pomodorosThisWeek = pomodoroHistory.filter(p => new Date(p.completedAt) >= thisWeekStart);

        const totalTimeToday = pomodorosToday.reduce((sum, p) => sum + p.durationMinutes, 0);
        const totalTimeThisWeek = pomodorosThisWeek.reduce((sum, p) => sum + p.durationMinutes, 0);
        
        const completedTasks = tasks.filter(t => t.completed);
        const tasksCompletedToday = completedTasks.filter(t => t.completedAt && getStartOfDay(new Date(t.completedAt)).getTime() === todayStart.getTime()).length;
        const tasksCompletedThisWeek = completedTasks.filter(t => t.completedAt && new Date(t.completedAt) >= thisWeekStart).length;

        return {
            completedPomodoros,
            totalTimeToday,
            totalTimeThisWeek,
            totalCompletedTasks: completedTasks.length,
            tasksCompletedToday,
            tasksCompletedThisWeek
        };
    }, [tasks, pomodoroHistory]);
    
    // Mock Bar Chart
    const TaskBarChart = () => {
        const data = [
            { label: '8月18日', value: 3 },
            { label: '', value: 0 },
            { label: '8月25日', value: 18 },
            { label: '', value: 0 },
            { label: '', value: 1 },
            { label: '', value: 0 },
            { label: '今日', value: 12 },
        ];
        const maxValue = Math.max(...data.map(d => d.value), 1);
        return (
             <div className="w-full h-full flex items-end justify-around text-xs text-gray-500 dark:text-gray-400">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center h-full justify-end w-10">
                        <div 
                            className="w-4 bg-blue-500 rounded-t-sm"
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                        ></div>
                        <span className="mt-1">{item.label}</span>
                    </div>
                ))}
            </div>
        )
    };
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <ReportCard title="完了したポモドーロ" value={stats.completedPomodoros} colorClass="text-red-500" icon={<div className="w-6 h-6 rounded-sm bg-current" />} />
                <ReportCard title="今週のポモドーロ時間" value={`${Math.floor(stats.totalTimeThisWeek / 60)}h ${stats.totalTimeThisWeek % 60}m`} colorClass="text-red-500" icon={<div className="w-6 h-6 rounded-sm bg-current" />} />
                <ReportCard title="本日のポモドーロ時間" value={`${Math.floor(stats.totalTimeToday / 60)}h ${stats.totalTimeToday % 60}m`} colorClass="text-red-500" icon={<div className="w-6 h-6 rounded-sm bg-current" />} />
                <ReportCard title="総完了タスク" value={stats.totalCompletedTasks} colorClass="text-blue-500" icon={<div className="w-6 h-6 rounded-sm bg-current" />} />
                <ReportCard title="今週完了したタスク" value={stats.tasksCompletedThisWeek} colorClass="text-blue-500" icon={<div className="w-6 h-6 rounded-sm bg-current" />} />
                <ReportCard title="本日完了したタスク" value={stats.tasksCompletedToday} colorClass="text-blue-500" icon={<div className="w-6 h-6 rounded-sm bg-current" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="ポモドーロの記録">
                    <EmptyState />
                </ChartContainer>
                <ChartContainer title="作業時間">
                     <EmptyState />
                </ChartContainer>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ChartContainer title="プロジェクトの時間分布">
                    <EmptyState />
                </ChartContainer>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="font-semibold text-gray-700 dark:text-gray-300">フォーカス時間の目標</h3>
                       <div className="text-xs">目標: 3時間</div>
                    </div>
                    {/* Simplified calendar */}
                    <div className="flex justify-between items-center mb-2">
                        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft size={16}/></button>
                        <div className="text-sm font-medium">2025年9月</div>
                        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={16}/></button>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs text-gray-500">
                        {['月', '火', '水', '木', '金', '土', '日'].map(d => <div key={d}>{d}</div>)}
                    </div>
                     <div className="grid grid-cols-7 text-center text-sm mt-2">
                        {[...Array(30).keys()].map(i => <div key={i} className={`p-1 ${i === 0 ? 'text-red-500 font-bold' : ''}`}>{i + 1}</div>)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="ポモドーロ時間記録">
                    <EmptyState />
                </ChartContainer>
                <ChartContainer title="タスク記録">
                    <TaskBarChart />
                </ChartContainer>
            </div>
        </div>
    );
};
