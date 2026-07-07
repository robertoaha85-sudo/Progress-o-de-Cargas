import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Play, Trash2, Copy, Download, X, Activity } from 'lucide-react';
import { useAppStore } from '../../store/AppContext';
import { WorkoutTemplate } from '../../types';
import { ConfirmModal } from '../../components/ConfirmModal';
import { usePWA } from '../../hooks/usePWA';

export function WorkoutList() {
  const { state, deleteTemplate, addTemplate, setActiveWorkout } = useAppStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { isInstallable, install, isIOS, isStandalone } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  const activeWorkoutTemplate = state.activeWorkout 
    ? state.templates.find(t => t.id === state.activeWorkout?.templateId) 
    : null;

  const handleDelete = () => {
    if (deleteId) {
      deleteTemplate(deleteId);
      setDeleteId(null);
    }
  };

  const handleDuplicate = (template: WorkoutTemplate) => {
    const newTemplate: WorkoutTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Cópia)`,
      exercises: template.exercises.map(ex => ({ ...ex, id: crypto.randomUUID() }))
    };
    addTemplate(newTemplate);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Treinos</h1>
      </div>

      {!isStandalone && showInstallBanner && (isInstallable || isIOS) && (
        <div className="bg-primary/20 border border-primary/30 rounded-2xl p-4 flex items-start gap-3 relative shrink-0">
          <button 
            onClick={() => setShowInstallBanner(false)}
            className="absolute top-2 right-2 p-1 text-primary hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="bg-primary/30 p-2 rounded-xl shrink-0 mt-1">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <div className="pr-6">
            <h3 className="text-base font-bold text-white mb-1">Instalar Aplicativo</h3>
            {isInstallable ? (
              <>
                <p className="text-xs text-blue-200 mb-3 font-medium">Instale no seu celular para uma experiência mais rápida e acesso offline.</p>
                <button 
                  onClick={install}
                  className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider"
                >
                  Instalar Agora
                </button>
              </>
            ) : isIOS ? (
              <p className="text-xs text-blue-200 font-medium leading-relaxed">
                Para instalar no iPhone, toque no botão <b className="text-white">Compartilhar</b> e depois em <b className="text-white">Adicionar à Tela de Início</b>.
              </p>
            ) : null}
          </div>
        </div>
      )}

      {activeWorkoutTemplate && (
        <div className="bg-primary/20 border border-primary/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0"></div>
            <div>
              <h3 className="text-sm font-bold text-white">Treino em Andamento</h3>
              <p className="text-xs text-gray-400 mt-0.5">Você tem uma sessão ativa de <b className="text-white">{activeWorkoutTemplate.name}</b></p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                if (confirm('Deseja realmente descartar este treino em andamento? Todo o progresso será perdido.')) {
                  setActiveWorkout(undefined);
                }
              }}
              className="px-4 py-2 bg-transparent text-red-400 hover:text-red-300 font-bold text-xs uppercase transition-colors"
            >
              Descartar
            </button>
            <Link
              to={`/treinos/${activeWorkoutTemplate.id}/iniciar`}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Continuar
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1 bg-[#151515] rounded-3xl p-6 border border-gray-800 flex flex-col">
        {state.templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm mb-4">Você ainda não tem treinos cadastrados.</p>
            <Link 
              to="/treinos/novo"
              className="inline-flex border-2 border-dashed border-gray-800 p-4 rounded-2xl text-gray-600 font-bold hover:border-primary hover:text-primary transition-all text-xs"
            >
              + CRIAR PRIMEIRO TREINO
            </Link>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
            {state.templates.map((template, idx) => {
              const isActive = state.activeWorkout && state.activeWorkout.templateId === template.id;
              return (
                <div 
                  key={template.id} 
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isActive 
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5 opacity-100' 
                      : 'border-gray-800 bg-card opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-colors ${
                      isActive ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{template.name}</h3>
                        {isActive && (
                          <span className="text-[9px] px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full font-bold uppercase tracking-wider animate-pulse">
                            Em andamento
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 uppercase font-bold mt-1">{template.exercises.length} exercícios</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      title="Duplicar treino"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/treinos/${template.id}/editar`}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      title="Editar treino"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(template.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir treino"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/treinos/${template.id}/iniciar`}
                      className={`ml-2 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                        isActive 
                          ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20' 
                          : 'bg-white hover:bg-gray-200 text-black'
                      }`}
                    >
                      <Play className={`w-4 h-4 ${isActive ? 'fill-white text-white' : 'fill-black text-black'}`} />
                      {isActive ? 'CONTINUAR' : 'INICIAR'}
                    </Link>
                  </div>
                </div>
              );
            })}
            
            <Link 
              to="/treinos/novo"
              className="mt-4 border-2 border-dashed border-gray-800 p-4 rounded-2xl text-gray-600 font-bold text-center hover:border-primary hover:text-primary transition-all text-xs block"
            >
              + ADICIONAR NOVO TREINO
            </Link>
          </div>
        )}
      </div>

      {/* Seção de Treinos de Corrida */}
      <div className="bg-[#151515] rounded-3xl p-6 border border-gray-800 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Treino de Corrida</h2>
            <p className="text-xs text-gray-500 mt-0.5">Acompanhe seu progresso de corrida ao ar livre ou na esteira.</p>
          </div>
        </div>
        
        <div className="p-4 bg-card rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">
              🏃
            </div>
            <div>
              <h3 className="font-bold text-white">Nova Corrida</h3>
              <p className="text-xs text-gray-500 uppercase font-bold mt-1">Grave tempo e distância</p>
            </div>
          </div>
          
          <Link
            to="/corrida/novo"
            className="px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-full text-sm font-bold flex items-center gap-2 transition-all self-end sm:self-auto"
          >
            <Play className="w-4 h-4 fill-black text-black" />
            REGISTRAR
          </Link>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        title="Excluir Treino"
        message="Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
