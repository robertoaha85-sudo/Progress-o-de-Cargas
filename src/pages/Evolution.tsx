import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/AppContext';

export function Evolution() {
  const { state } = useAppStore();
  const [selectedExName, setSelectedExName] = useState<string>('');

  // Extract unique exercise names across all logs
  const allExerciseNames = useMemo(() => {
    const names = new Set<string>();
    state.logs.forEach(log => {
      log.exercises.forEach(ex => names.add(ex.name));
    });
    return Array.from(names).sort();
  }, [state.logs]);

  // Set initial selected exercise
  useMemo(() => {
    if (!selectedExName && allExerciseNames.length > 0) {
      setSelectedExName(allExerciseNames[0]);
    }
  }, [allExerciseNames, selectedExName]);

  // Prepare data for chart
  const chartData = useMemo(() => {
    if (!selectedExName) return [];

    const data: { date: string, weight: number, reps: number, fullDate: string }[] = [];
    
    const sortedLogs = [...state.logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedLogs.forEach(log => {
      const ex = log.exercises.find(e => e.name === selectedExName);
      if (ex) {
        data.push({
          date: format(new Date(log.date), 'dd/MM'),
          fullDate: format(new Date(log.date), "dd/MM/yyyy", { locale: ptBR }),
          weight: ex.weight,
          reps: ex.reps
        });
      }
    });

    return data;
  }, [state.logs, selectedExName]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Evolução</h1>
      </div>

      <div className="flex-1 bg-[#151515] rounded-3xl p-6 border border-gray-800 flex flex-col overflow-hidden">
        {allExerciseNames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">Faça pelo menos um treino para ver os gráficos de evolução.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
            <div className="bg-card p-5 rounded-2xl border border-gray-800">
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Selecione o Exercício</label>
              <select
                value={selectedExName}
                onChange={(e) => setSelectedExName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors text-white"
              >
                {allExerciseNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {chartData.length > 0 && (
              <div className="bg-card p-5 rounded-2xl border border-gray-800">
                <h3 className="text-sm text-gray-500 uppercase font-bold mb-6">Progressão de Carga</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        fontWeight="bold"
                      />
                      <YAxis 
                        stroke="#6B7280" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        fontWeight="bold"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #1f2937', borderRadius: '12px' }}
                        itemStyle={{ color: '#2563EB', fontWeight: 'bold' }}
                        labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                        formatter={(value: number) => [`${value} kg`, 'Carga']}
                        labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#2563EB" 
                        strokeWidth={3}
                        activeDot={{ r: 6, fill: '#2563EB', stroke: '#0D0D0D', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="bg-card p-5 rounded-2xl border border-gray-800 space-y-4">
                <h3 className="text-sm text-gray-500 uppercase font-bold mb-4">Histórico Detalhado</h3>
                <div className="space-y-3">
                  {[...chartData].reverse().map((data, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
                      <span className="font-bold text-xs text-gray-400">{data.fullDate}</span>
                      <div className="flex gap-4">
                        <span className="font-black text-primary">{data.weight} kg</span>
                        <span className="font-bold text-gray-400">{data.reps} reps</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
