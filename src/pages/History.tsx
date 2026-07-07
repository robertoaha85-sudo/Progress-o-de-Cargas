import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Activity, Clock, Calendar, Compass, Link } from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';

function calculatePace(distance: number, duration: string): string {
  if (!distance || !duration) return '--:--';
  try {
    const parts = duration.split(':').map(Number);
    let h = 0, m = 0, s = 0;
    if (parts.length === 3) {
      [h, m, s] = parts;
    } else if (parts.length === 2) {
      [m, s] = parts;
    } else {
      return '--:--';
    }
    const totalMinutes = h * 60 + m + s / 60;
    if (totalMinutes <= 0) return '--:--';
    const paceDecimal = totalMinutes / distance;
    const paceMin = Math.floor(paceDecimal);
    const paceSec = Math.round((paceDecimal - paceMin) * 60);
    
    const finalMin = paceSec === 60 ? paceMin + 1 : paceMin;
    const finalSec = paceSec === 60 ? 0 : paceSec;
    return `${finalMin}:${String(finalSec).padStart(2, '0')} min/km`;
  } catch (e) {
    return '--:--';
  }
}

function formatDurationText(duration: string): string {
  try {
    const parts = duration.split(':').map(Number);
    if (parts.length !== 3) return duration;
    const [h, m, s] = parts;
    const segments: string[] = [];
    if (h > 0) segments.push(`${h}h`);
    if (m > 0) segments.push(`${m}min`);
    if (s > 0 || segments.length === 0) segments.push(`${s}s`);
    return segments.join(' ');
  } catch {
    return duration;
  }
}

export function History() {
  const { state, deleteLog, deleteRun } = useAppStore();
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: 'workout' | 'run' } | null>(null);

  const logsByTemplate = useMemo(() => {
    const groups: Record<string, typeof state.logs> = {};
    const sorted = [...state.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sorted.forEach(log => {
      if (!groups[log.name]) groups[log.name] = [];
      groups[log.name].push(log);
    });
    return groups;
  }, [state.logs]);

  const templateNames = Object.keys(logsByTemplate);
  
  // Combine muscle-building templates and the "(Corridas)" tab
  const allTabs = useMemo(() => {
    const tabs = [...templateNames];
    tabs.push("(Corridas)");
    return tabs;
  }, [templateNames]);

  const [selectedTab, setSelectedTab] = useState<string>('');

  // Set default tab when tabs load
  useEffect(() => {
    if (!selectedTab || !allTabs.includes(selectedTab)) {
      setSelectedTab(templateNames[0] || "(Corridas)");
    }
  }, [allTabs, selectedTab, templateNames]);

  const sortedRuns = useMemo(() => {
    const runsList = state.runs || [];
    return [...runsList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.runs]);

  const handleDelete = () => {
    if (deleteItem) {
      if (deleteItem.type === 'workout') {
        deleteLog(deleteItem.id);
      } else {
        deleteRun(deleteItem.id);
      }
      setDeleteItem(null);
    }
  };

  const hasAnyData = templateNames.length > 0 || sortedRuns.length > 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Histórico</h1>
      </div>

      <div className="flex-1 bg-[#151515] rounded-3xl p-6 border border-gray-800 flex flex-col overflow-hidden">
        {!hasAnyData ? (
          <div className="text-center py-12 flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 text-sm mb-4">Nenhum treino ou corrida registrado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 shrink-0">
              {allTabs.map(name => {
                const isRunTab = name === "(Corridas)";
                const count = isRunTab ? sortedRuns.length : (logsByTemplate[name]?.length || 0);
                
                // Only show tab if it's the run tab or has logs
                if (!isRunTab && count === 0) return null;

                return (
                  <button
                    key={name}
                    onClick={() => setSelectedTab(name)}
                    className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-bold transition-colors uppercase flex items-center gap-2 ${
                      selectedTab === name 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span>{name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      selectedTab === name ? 'bg-white/20 text-white' : 'bg-gray-900 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-8">
              {selectedTab === "(Corridas)" ? (
                sortedRuns.length === 0 ? (
                  <div className="text-center py-12 flex-1 flex flex-col items-center justify-center text-gray-500">
                    <Activity className="w-10 h-10 text-gray-700 mb-3 animate-pulse" />
                    <p className="text-sm">Nenhuma corrida registrada ainda.</p>
                  </div>
                ) : (
                  sortedRuns.map(run => (
                    <div key={run.id} className="bg-card p-5 rounded-2xl border border-gray-800 opacity-90 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary text-xl shrink-0">
                            🏃
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Treino de Corrida</h3>
                            <p className="text-xs text-gray-500 uppercase font-bold mt-1 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-600" />
                              {format(new Date(run.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteItem({ id: run.id, type: 'run' })}
                          className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Excluir corrida"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Run Metrics Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-900/50 border border-gray-800/50 p-3 rounded-xl text-center flex flex-col justify-center">
                          <span className="text-[10px] text-gray-500 uppercase font-black mb-1">Distância</span>
                          <span className="text-lg font-black text-white">{run.distance} <span className="text-xs text-gray-500 font-bold">km</span></span>
                        </div>
                        <div className="bg-gray-900/50 border border-gray-800/50 p-3 rounded-xl text-center flex flex-col justify-center">
                          <span className="text-[10px] text-gray-500 uppercase font-black mb-1">Duração</span>
                          <span className="text-lg font-black text-primary">{formatDurationText(run.duration)}</span>
                        </div>
                        <div className="bg-gray-900/50 border border-gray-800/50 p-3 rounded-xl text-center flex flex-col justify-center">
                          <span className="text-[10px] text-gray-500 uppercase font-black mb-1">Pace Médio</span>
                          <span className="text-sm font-black text-green-400 flex items-center justify-center gap-1 mt-0.5">
                            <Compass className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            {calculatePace(Number(run.distance) || 0, run.duration)}
                          </span>
                        </div>
                      </div>

                      {run.notes && (
                        <div className="bg-gray-900/30 p-3 rounded-xl border border-gray-800/30 text-xs text-gray-400 italic">
                          {run.notes}
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                logsByTemplate[selectedTab]?.map(log => (
                  <div key={log.id} className="bg-card p-5 rounded-2xl border border-gray-800 opacity-90 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{log.name}</h3>
                        <p className="text-xs text-gray-500 uppercase font-bold mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-600" />
                          {format(new Date(log.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteItem({ id: log.id, type: 'workout' })}
                        className="p-2 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Excluir registro"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {log.exercises.map(ex => (
                        <div key={ex.id} className="bg-gray-900/50 p-3 rounded-xl border border-gray-800/50">
                          <div className="font-bold text-sm text-gray-300 mb-2">{ex.name}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {ex.sets.map((set, idx) => set.completed && (
                              <div key={set.id} className="bg-gray-800 rounded-lg p-2 text-center text-xs font-bold flex flex-col">
                                <span className="text-gray-500 mb-1">#{idx + 1}</span>
                                <span className="text-primary">{set.weight}kg <span className="text-white">x {set.reps}</span></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteItem}
        title={deleteItem?.type === 'run' ? "Excluir Corrida" : "Excluir Registro"}
        message={
          deleteItem?.type === 'run' 
            ? "Tem certeza que deseja excluir este registro de corrida? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja excluir este registro de treino? Os dados do gráfico de evolução também serão afetados."
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}
