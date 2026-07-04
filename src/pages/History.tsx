import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';

export function History() {
  const { state, deleteLog } = useAppStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
  const [selectedTab, setSelectedTab] = useState<string>(templateNames[0] || '');

  useMemo(() => {
    if (!templateNames.includes(selectedTab) && templateNames.length > 0) {
      setSelectedTab(templateNames[0]);
    }
  }, [templateNames, selectedTab]);

  const handleDelete = () => {
    if (deleteId) {
      deleteLog(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Histórico</h1>
      </div>

      <div className="flex-1 bg-[#151515] rounded-3xl p-6 border border-gray-800 flex flex-col overflow-hidden">
        {templateNames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">Nenhum treino registrado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 shrink-0">
              {templateNames.map(name => (
                <button
                  key={name}
                  onClick={() => setSelectedTab(name)}
                  className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-bold transition-colors uppercase ${
                    selectedTab === name 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-8">
              {logsByTemplate[selectedTab]?.map(log => (
                <div key={log.id} className="bg-card p-5 rounded-2xl border border-gray-800 opacity-90 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{log.name}</h3>
                      <p className="text-xs text-gray-500 uppercase font-bold mt-1">
                        {format(new Date(log.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteId(log.id)}
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
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        title="Excluir Registro"
        message="Tem certeza que deseja excluir este registro de treino? Os dados do gráfico de evolução também serão afetados."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
