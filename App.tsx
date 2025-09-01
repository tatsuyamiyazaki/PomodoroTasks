
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Header } from './components/Header';
import { TaskEditModal } from './components/TaskEditModal';
import { ProjectEditModal } from './components/ProjectEditModal';
import { CalendarView } from './components/CalendarView';
import { SettingsModal } from './components/SettingsModal';
import type { Task, Project, View, Recurrence, SidebarViewSettings } from './types';
import { Priority, ViewType, RecurrenceFrequency } from './types';
import { initialTasks, initialProjects } from './constants';

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


const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentView, setCurrentView] = useState<View>({ type: ViewType.TODAY, title: '今日' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [sidebarViewSettings, setSidebarViewSettings] = useState<SidebarViewSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('sidebarViewSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error("Could not parse sidebar settings from localStorage", error);
    }
    // Default: all visible
    return {
      [ViewType.TODAY]: true,
      [ViewType.OVERDUE]: true,
      [ViewType.TOMORROW]: true,
      [ViewType.THIS_WEEK]: true,
      [ViewType.NEXT_7_DAYS]: true,
      [ViewType.HIGH_PRIORITY]: true,
      [ViewType.COMPLETED]: true,
      [ViewType.ALL]: true,
      [ViewType.CALENDAR]: true,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebarViewSettings', JSON.stringify(sidebarViewSettings));
    } catch (error) {
      console.error("Could not save sidebar settings to localStorage", error);
    }
  }, [sidebarViewSettings]);

  const handleUpdateSidebarSettings = (newSettings: SidebarViewSettings) => {
    setSidebarViewSettings(newSettings);
  };

  // Task CRUD
  const addTask = (title: string) => {
    if (title.trim() === '') return;

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority: Priority.Medium,
      dueDate: currentView.type === ViewType.TOMORROW ? new Date(Date.now() + 86400000) : new Date(),
      projectId: currentView.type === ViewType.PROJECT ? currentView.id : null,
      tags: [],
      estimatedMinutes: 25,
      completedAt: null,
      createdAt: new Date(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const toggleTaskCompletion = (taskId: string) => {
    const taskToToggle = tasks.find(task => task.id === taskId);
    if (!taskToToggle) return;

    // If it's a recurring task and it's being marked as complete
    if (taskToToggle.recurrence && !taskToToggle.completed && taskToToggle.dueDate) {
      const nextDueDate = calculateNextDueDate(taskToToggle.dueDate, taskToToggle.recurrence);
      const nextTask: Task = {
        ...taskToToggle,
        id: Date.now().toString(),
        completed: false,
        completedAt: null,
        dueDate: nextDueDate,
        createdAt: new Date(),
      };
      
      const completedTask = { ...taskToToggle, completed: true, completedAt: new Date() };
      
      setTasks(prevTasks => [...prevTasks.map(t => t.id === taskId ? completedTask : t), nextTask]);

    } else {
      // Standard completion toggle
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : null } : task
      ));
    }
  };

  // Task Modal
  const openEditModal = (task: Task) => {
    setEditingTask(task);
  };

  const closeEditModal = () => {
    setEditingTask(null);
  };

  const handleSaveTask = (updatedTask: Task) => {
    updateTask(updatedTask);
    closeEditModal();
  };

  // Project CRUD
  const addProject = (projectData: { name: string; color: string }) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...projectData
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };
  
  const deleteProject = (projectId: string) => {
    if(window.confirm('このプロジェクトを削除してもよろしいですか？関連するタスクはプロジェクトから割り当て解除されます。')){
      setProjects(projects.filter(p => p.id !== projectId));
      // Unassign tasks from the deleted project
      setTasks(tasks.map(t => t.projectId === projectId ? {...t, projectId: null} : t));
    }
  };

  // Project Modal
  const openAddProjectModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleSaveProject = (projectData: {id?: string; name: string; color: string}) => {
    if (projectData.id) {
      updateProject(projectData as Project);
    } else {
      addProject(projectData);
    }
    closeProjectModal();
  }


  const getFilteredTasks = useCallback(() => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(new Date(today).setDate(today.getDate() + 1));
    const endOfTomorrow = new Date(new Date(tomorrow).setDate(tomorrow.getDate() + 1));
    const endOfWeek = new Date(new Date(today).setDate(today.getDate() + (7 - today.getDay())));
    const next7Days = new Date(new Date(today).setDate(today.getDate() + 7));
    
    switch (currentView.type) {
      case ViewType.TODAY:
        return tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString());
      case ViewType.OVERDUE:
        return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < today);
      case ViewType.TOMORROW:
        return tasks.filter(t => t.dueDate && new Date(t.dueDate) >= tomorrow && new Date(t.dueDate) < endOfTomorrow);
      case ViewType.THIS_WEEK:
        return tasks.filter(t => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= endOfWeek);
      case ViewType.NEXT_7_DAYS:
        return tasks.filter(t => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= next7Days);
      case ViewType.HIGH_PRIORITY:
        return tasks.filter(t => t.priority === Priority.High);
      case ViewType.COMPLETED:
        return tasks.filter(t => t.completed);
      case ViewType.ALL:
      case ViewType.CALENDAR: // Return all tasks for calendar view, filtering is done in component
        return tasks;
      case ViewType.PROJECT:
        return tasks.filter(t => t.projectId === currentView.id);
      default:
        return tasks;
    }
  }, [tasks, currentView]);

  const filteredTasks = useMemo(() => getFilteredTasks(), [getFilteredTasks]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        projects={projects}
        tasks={tasks}
        isCollapsed={isSidebarCollapsed}
        onAddProject={openAddProjectModal}
        onEditProject={openEditProjectModal}
        onDeleteProject={deleteProject}
        viewSettings={sidebarViewSettings}
      />
      <div className="flex flex-1 flex-col transition-all duration-300" style={{ marginLeft: isSidebarCollapsed ? '0' : '260px' }}>
        <Header 
            isSidebarCollapsed={isSidebarCollapsed} 
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-8">
          {currentView.type === ViewType.CALENDAR ? (
            <CalendarView 
              tasks={tasks}
              projects={projects}
              openEditModal={openEditModal}
            />
          ) : (
            <MainContent
              view={currentView}
              tasks={filteredTasks}
              allTasks={tasks}
              addTask={addTask}
              updateTask={updateTask}
              deleteTask={deleteTask}
              toggleTaskCompletion={toggleTaskCompletion}
              openEditModal={openEditModal}
            />
          )}
        </main>
      </div>
      <TaskEditModal
        isOpen={!!editingTask}
        task={editingTask}
        projects={projects}
        onClose={closeEditModal}
        onSave={handleSaveTask}
        allTasks={tasks}
      />
      <ProjectEditModal
        isOpen={isProjectModalOpen}
        project={editingProject}
        onClose={closeProjectModal}
        onSave={handleSaveProject}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={sidebarViewSettings}
        onUpdateSettings={handleUpdateSidebarSettings}
      />
    </div>
  );
};

export default App;
