import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ArrowUpCircle, Minus, Plus } from 'lucide-react';
import { useAppStore } from '../../store/AppContext';
import { LoggedExercise, WorkoutLog } from '../../types';

export function ActiveWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addLog } = useAppStore();
  
  const template = state.templates.find(t => t.id === id);
  
  const [exercises, setExercises] = useState<LoggedExercise[]>([]);
  
  // Previous logs mapped by exercise template ID for progression logic
  const [previousLogs, setPreviousLogs] = useState<Record<string, { weight: number, reps: number }>>({});

  useEffect(() => {
    if (!template) {
      navigate('/treinos');
      return;
    }

    // Find previous logs to suggest progression and populate initials
    const prevMap: Record<string, { weight: number, reps: number }> = {};
    for (let i = state.logs.length - 1; i >= 0; i--) {
      const log = state.logs[i];
      for (const ex of log.exercises) {
        if (!prevMap[ex.exerciseId] && ex.sets.length > 0) {
          // Use the best set or first set for suggestion
          const bestSet = [...ex.sets].sort((a, b) => b.weight - a.weight)[0];
          if (bestSet) {
            prevMap[ex.exerciseId] = { weight: bestSet.weight, reps: bestSet.reps };
          }
        }
      }
    }
    
    // Initialize with full sets array
    const initialEx = template.exercises.map(ex => {
      const prev = prevMap[ex.id];
      const initialWeight = prev ? prev.weight : 0;
      const initialReps = prev ? prev.reps : 0;
      
      const setsArray = Array.from({ length: ex.sets }).map(() => ({
        id: crypto.randomUUID(),
        weight: initialWeight,
        reps: initialReps,
        completed: false
      }));

      return {
        id: crypto.randomUUID(),
        exerciseId: ex.id,
        name: ex.name,
        sets: setsArray
      };
    });
    
    setPreviousLogs(prevMap);
    setExercises(initialEx);
  }, [id, template, state.logs, navigate]);

  if (!template) return null;

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const toggleSetCompleted = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
      };
    }));
  };

  const handleSave = () => {
    // Validate: only include exercises that have at least one completed set
    const finalExercises = exercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(s => s.completed)
    })).filter(ex => ex.sets.length > 0);

    if (finalExercises.length === 0) {
      alert('Você precisa completar pelo menos uma série para finalizar o treino.');
      return;
    }

    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      templateId: template.id,
      name: template.name,
      date: new Date().toISOString(),
      exercises: finalExercises
    };

    addLog(log);
    navigate('/historico');
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-1 bg-[#151515] rounded-3xl p-6 border border-gray-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">{template.name}</h1>
            <p className="text-xs text-gray-500 uppercase font-bold mt-1">{template.exercises.length} exercícios</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/treinos')}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-full text-sm font-bold transition-colors"
            >
              FINALIZAR TREINO
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-24">
          {exercises.map((exercise, idx) => {
            const prev = previousLogs[exercise.exerciseId];
            // Get max weight from current sets
            const currentMaxWeight = exercise.sets.reduce((max, s) => Math.max(max, s.weight), 0);
            const suggestIncrease = prev && prev.reps >= 12 && currentMaxWeight <= prev.weight;

            return (
              <div key={exercise.id} className={`p-4 rounded-3xl border flex flex-col gap-4 transition-colors ${suggestIncrease ? "bg-card border-blue-500/30" : "bg-card border-gray-800"}`}>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center font-bold text-gray-400 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white flex flex-col gap-2">
                      <span className="text-lg">{exercise.name}</span>
                      {suggestIncrease && (
                        <span className="text-[10px] px-3 py-1 bg-primary text-white rounded-full flex items-center gap-1 font-bold w-fit">
                          <ArrowUpCircle className="w-4 h-4" />
                          HORA DE AUMENTAR A CARGA
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 md:gap-4 text-[10px] text-gray-500 font-bold uppercase px-2">
                    <div className="text-center">Série</div>
                    <div className="text-center">Carga (kg)</div>
                    <div className="text-center">Reps</div>
                    <div className="text-center"></div>
                  </div>
                  
                  {exercise.sets.map((set, setIdx) => (
                    <div key={set.id} className={`grid grid-cols-[30px_1fr_1fr_40px] gap-2 md:gap-4 items-center p-2 rounded-2xl transition-colors ${set.completed ? 'bg-primary/20 border border-primary/30' : 'bg-gray-900/50 border border-transparent'}`}>
                      <div className="text-center font-black text-gray-400">{setIdx + 1}</div>
                      
                      <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl overflow-hidden h-12">
                        <button onClick={() => updateSet(exercise.id, set.id, 'weight', Math.max(0, set.weight - 1))} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"><Minus className="w-4 h-4" /></button>
                        <input type="number" value={set.weight || ''} onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)} className="w-full text-center bg-transparent font-black text-white focus:outline-none" placeholder="0" />
                        <button onClick={() => updateSet(exercise.id, set.id, 'weight', set.weight + 1)} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>

                      <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl overflow-hidden h-12">
                        <button onClick={() => updateSet(exercise.id, set.id, 'reps', Math.max(0, set.reps - 1))} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"><Minus className="w-4 h-4" /></button>
                        <input type="number" value={set.reps || ''} onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)} className="w-full text-center bg-transparent font-black text-white focus:outline-none" placeholder="0" />
                        <button onClick={() => updateSet(exercise.id, set.id, 'reps', set.reps + 1)} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>

                      <button onClick={() => toggleSetCompleted(exercise.id, set.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
                        <Check className="w-5 h-5" strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
