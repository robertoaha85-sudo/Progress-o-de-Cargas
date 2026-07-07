import { Link, useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dumbbell, Activity, Calendar, Flame, TrendingUp, ChevronRight, Check } from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export function Dashboard() {
  const { state, setActiveWorkout } = useAppStore();
  const navigate = useNavigate();

  const activeWorkoutTemplate = state.activeWorkout 
    ? state.templates.find(t => t.id === state.activeWorkout?.templateId) 
    : null;

  const totalTreinos = state.logs.length;
  
  // Número de exercícios que evoluíram a carga
  const exerciciosEvoluidos = (() => {
    const stats: Record<string, { firstWeight: number, maxWeight: number }> = {};
    const sortedLogs = [...state.logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedLogs.forEach(log => {
      log.exercises.forEach(ex => {
        const currentMaxWeight = ex.sets?.reduce((max, set) => Math.max(max, set.weight || 0), 0) || (ex as any).weight || 0;
        if (currentMaxWeight > 0) {
          if (!stats[ex.name]) {
            stats[ex.name] = { firstWeight: currentMaxWeight, maxWeight: currentMaxWeight };
          } else {
            if (currentMaxWeight > stats[ex.name].maxWeight) {
              stats[ex.name].maxWeight = currentMaxWeight;
            }
          }
        }
      });
    });
    
    return Object.values(stats).filter(s => s.maxWeight > s.firstWeight).length;
  })();

  // Dias de treino na semana atual
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // Domingo
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  const trainedDays = daysOfWeek.map(day => {
    return state.logs.some(log => isSameDay(new Date(log.date), day));
  });

  const ultimosTreinos = [...state.logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pb-8">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white">Resumo</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Acompanhe seu progresso</p>
        </div>
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
          <Flame className="w-6 h-6 text-primary" />
        </div>
      </div>

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

      {/* Semana */}
      <div className="bg-card rounded-3xl p-5 border border-gray-800 shrink-0">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Esta Semana</h2>
        <div className="flex justify-between items-center">
          {daysOfWeek.map((day, i) => {
            const isTrained = trainedDays[i];
            const isToday = isSameDay(day, today);
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-white' : 'text-gray-500'}`}>
                  {format(day, 'EE', { locale: ptBR })}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isTrained 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                    : isToday 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-transparent border-gray-800'
                }`}>
                  {isTrained && <Check className="w-4 h-4" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid de Stats (Bento) */}
      <div className="grid grid-cols-2 gap-4 shrink-0">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0D0D0D] p-5 rounded-3xl border border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-white">{totalTreinos}</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Treinos</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0D0D0D] p-5 rounded-3xl border border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-white">{exerciciosEvoluidos}</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Cargas Aumentadas</p>
        </div>

        <div 
          className="col-span-2 bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-3xl border border-primary/20 flex items-center justify-between relative overflow-hidden group cursor-pointer" 
          onClick={() => navigate('/evolucao')}
        >
          <div className="relative z-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Ver Evolução
            </p>
            <p className="text-2xl font-black text-white mt-1">
              Gráficos de Progressão
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-primary relative z-10 group-hover:translate-x-1 transition-transform" />
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors"></div>
        </div>
      </div>

      {/* Últimos Treinos */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-white">Últimos Treinos</h2>
          {ultimosTreinos.length > 0 && (
            <Link to="/historico" className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors">
              Ver Todos
            </Link>
          )}
        </div>

        {ultimosTreinos.length === 0 ? (
          <div className="bg-card p-6 rounded-3xl border border-gray-800 text-center">
            <Dumbbell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">Você ainda não treinou.</p>
            <Link to="/treinos" className="mt-4 inline-block bg-primary text-white font-bold px-6 py-3 rounded-full text-sm">
              Começar Treino
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ultimosTreinos.map(log => (
              <div key={log.id} className="bg-card p-5 rounded-3xl border border-gray-800 flex items-center justify-between opacity-90 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 border border-gray-800">
                    <Dumbbell className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{log.name}</h3>
                    <p className="text-[11px] text-gray-500 font-bold mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(log.date), "dd MMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">{log.exercises.length}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Exercícios</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

