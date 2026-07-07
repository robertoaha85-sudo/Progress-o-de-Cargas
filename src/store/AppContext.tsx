import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, WorkoutTemplate, WorkoutLog, ActiveWorkoutState } from '../types';

interface AppContextType {
  state: AppState;
  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  addLog: (log: WorkoutLog) => void;
  deleteLog: (id: string) => void;
  updateProfile: (profile: AppState['profile']) => void;
  setActiveWorkout: (activeWorkout?: ActiveWorkoutState) => void;
}

const defaultState: AppState = {
  templates: [],
  logs: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('progressao-carga-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppState;
        
        // Migration for legacy logs
        if (parsed.logs) {
          parsed.logs = parsed.logs.map(log => ({
            ...log,
            exercises: log.exercises.map(ex => {
              // If already migrated, return as is
              if (ex.sets && Array.isArray(ex.sets)) {
                return ex;
              }
              // Convert old single weight/reps to array of sets
              const setsCount = (ex as any).sets || 1;
              const newSets: any[] = [];
              for (let i = 0; i < (typeof setsCount === 'number' ? setsCount : 1); i++) {
                newSets.push({
                  id: crypto.randomUUID(),
                  weight: ex.weight || 0,
                  reps: ex.reps || 0,
                  completed: true
                });
              }
              return {
                ...ex,
                sets: newSets
              };
            })
          }));
        }

        return parsed;
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('progressao-carga-state', JSON.stringify(state));
  }, [state]);

  const addTemplate = (template: WorkoutTemplate) => {
    setState(prev => ({ ...prev, templates: [...prev.templates, template] }));
  };

  const updateTemplate = (template: WorkoutTemplate) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === template.id ? template : t)
    }));
  };

  const deleteTemplate = (id: string) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== id)
    }));
  };

  const addLog = (log: WorkoutLog) => {
    setState(prev => ({ ...prev, logs: [...prev.logs, log] }));
  };

  const deleteLog = (id: string) => {
    setState(prev => ({
      ...prev,
      logs: prev.logs.filter(l => l.id !== id)
    }));
  };

  const updateProfile = (profile: AppState['profile']) => {
    setState(prev => ({ ...prev, profile }));
  };

  const setActiveWorkout = (activeWorkout?: ActiveWorkoutState) => {
    setState(prev => ({ ...prev, activeWorkout }));
  };

  return (
    <AppContext.Provider value={{ state, addTemplate, updateTemplate, deleteTemplate, addLog, deleteLog, updateProfile, setActiveWorkout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
