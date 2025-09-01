
import React from 'react';
import type { Task, Project, View, SidebarViewSettings } from '../types';
import { ViewType } from '../types';
import { Sun, Calendar as CalendarIcon, CalendarClock, CalendarDays, Flag, CheckCircle, List, ChevronDown, PlusCircle, Edit, Trash2 } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  projects: Project[];
  tasks: Task[];
  isCollapsed: boolean;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  viewSettings: SidebarViewSettings;
}

const getTaskCount = (tasks: Task[], viewType: ViewType, projectId?: string): number => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(new Date(today).setDate(today.getDate() + 1));
    const endOfTomorrow = new Date(new Date(tomorrow).setDate(tomorrow.getDate() + 1));
    
    switch (viewType) {
        case ViewType.TODAY:
            return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString()).length;
        case ViewType.OVERDUE:
            return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < today).length;
        case ViewType.TOMORROW:
            return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) >= tomorrow && new Date(t.dueDate) < endOfTomorrow).length;
        case ViewType.PROJECT:
            return tasks.filter(t => !t.completed && t.projectId === projectId).length;
        case ViewType.ALL:
            return tasks.filter(t => !t.completed).length;
        default:
            return 0;
    }
}


const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}> = ({ icon, label, count, isActive, onClick, children }) => (
  <li
    className={`flex items-center justify-between px-4 py-2 text-sm rounded-md cursor-pointer transition-colors group ${
      isActive ? 'bg-gray-100 dark:bg-gray-700 font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center overflow-hidden">
      {icon}
      <span className="ml-3 truncate">{label}</span>
    </div>
    <div className="flex items-center">
        {count > 0 && <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-2">{count}</span>}
        {children}
    </div>
  </li>
);

// Fix: Define a type for non-project view items to ensure correct type inference.
type NonProjectViewItem = {
    type: Exclude<ViewType, ViewType.PROJECT>;
    title: string;
    icon: React.ReactNode;
    count?: number;
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, projects, tasks, isCollapsed, onAddProject, onEditProject, onDeleteProject, viewSettings }) => {
    // Fix: Use the NonProjectViewItem type for mainViews array to prevent type widening.
    const mainViews: NonProjectViewItem[] = [
        { type: ViewType.TODAY, title: '今日', icon: <Sun size={20} className="text-yellow-500" />, count: getTaskCount(tasks, ViewType.TODAY)},
        { type: ViewType.OVERDUE, title: '期限切れ', icon: <CalendarIcon size={20} className="text-red-500" />, count: getTaskCount(tasks, ViewType.OVERDUE) },
        { type: ViewType.TOMORROW, title: '明日', icon: <CalendarClock size={20} className="text-orange-500" />, count: getTaskCount(tasks, ViewType.TOMORROW) },
        { type: ViewType.THIS_WEEK, title: '今週', icon: <CalendarDays size={20} className="text-purple-500" /> },
        { type: ViewType.NEXT_7_DAYS, title: '次の7日間', icon: <CalendarDays size={20} className="text-green-500" /> },
        { type: ViewType.CALENDAR, title: 'カレンダー', icon: <CalendarIcon size={20} className="text-blue-500" /> },
        { type: ViewType.HIGH_PRIORITY, title: '優先順位: 高い', icon: <Flag size={20} className="text-red-600" /> },
    ];
    
    // Fix: Use the NonProjectViewItem type for secondaryViews array to prevent type widening.
    const secondaryViews: NonProjectViewItem[] = [
        { type: ViewType.COMPLETED, title: '完了済み', icon: <CheckCircle size={20} className="text-gray-400" /> },
        { type: ViewType.ALL, title: 'フォーカス', icon: <List size={20} className="text-gray-400" />, count: getTaskCount(tasks, ViewType.ALL) },
    ];
    
    const checkActive = (view: View) => {
        if (view.type !== currentView.type) return false;
        if (view.type === ViewType.PROJECT && currentView.type === ViewType.PROJECT) {
            return view.id === currentView.id;
        }
        return true;
    }

    const visibleMainViews = mainViews.filter(view => viewSettings[view.type] !== false);
    const visibleSecondaryViews = secondaryViews.filter(view => viewSettings[view.type] !== false);

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`} style={{width: '260px'}}>
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <span className="ml-3 font-semibold text-gray-800 dark:text-gray-200">tatsuya.miyazaki</span>
          <ChevronDown size={16} className="ml-1 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul>
            {visibleMainViews.map((view) => (
                <SidebarItem
                    key={view.title}
                    icon={view.icon}
                    label={view.title}
                    count={view.count || 0}
                    isActive={checkActive({ type: view.type, title: view.title })}
                    onClick={() => setCurrentView({ type: view.type, title: view.title })}
                />
            ))}
        </ul>
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        <ul>
            {visibleSecondaryViews.map((view) => (
                 <SidebarItem
                    key={view.title}
                    icon={view.icon}
                    label={view.title}
                    count={view.count || 0}
                    isActive={checkActive({ type: view.type, title: view.title })}
                    onClick={() => setCurrentView({ type: view.type, title: view.title })}
                />
            ))}
        </ul>
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        <div className="flex justify-between items-center px-4">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">プロジェクト</h3>
          <button onClick={onAddProject} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <PlusCircle size={16} />
          </button>
        </div>
        <ul className="mt-2">
          {projects.map(project => (
            <SidebarItem
              key={project.id}
              icon={<span className={`w-3 h-3 rounded-full ${project.color}`}></span>}
              label={project.name}
              count={getTaskCount(tasks, ViewType.PROJECT, project.id)}
              isActive={currentView.type === ViewType.PROJECT && currentView.id === project.id}
              onClick={() => setCurrentView({ type: ViewType.PROJECT, id: project.id, title: project.name })}
            >
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEditProject(project); }} className="p-1 hover:text-gray-800 dark:hover:text-gray-200"><Edit size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-1 hover:text-red-600 dark:hover:text-red-500"><Trash2 size={14} /></button>
                </div>
            </SidebarItem>
          ))}
        </ul>
      </nav>
    </aside>
  );
};