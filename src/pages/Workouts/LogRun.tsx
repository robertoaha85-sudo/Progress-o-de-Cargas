import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Calendar, Clock, Clipboard, Activity } from 'lucide-react';
import { useAppStore } from '../../store/AppContext';
import { generateUUID } from '../../lib/utils';

export function LogRun() {
  const navigate = useNavigate();
  const { addRun } = useAppStore();

  const [distance, setDistance] = useState<string>('5');
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('30');
  const [seconds, setSeconds] = useState<string>('0');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const d = parseFloat(distance);
    if (isNaN(d) || d <= 0) {
      alert('Por favor, insira uma distância válida maior que zero.');
      return;
    }

    const hStr = String(parseInt(hours, 10) || 0).padStart(2, '0');
    const mStr = String(parseInt(minutes, 10) || 0).padStart(2, '0');
    const sStr = String(parseInt(seconds, 10) || 0).padStart(2, '0');
    const formattedDuration = `${hStr}:${mStr}:${sStr}`;

    addRun({
      id: generateUUID(),
      date: new Date(date + 'T12:00:00').toISOString(),
      distance: d,
      duration: formattedDuration,
      notes: notes.trim() || undefined
    });

    navigate('/historico');
  };

  const adjustDistance = (amount: number) => {
    const current = parseFloat(distance) || 0;
    const newVal = Math.max(0, current + amount);
    // Format to 2 decimal places max or keep simple
    setDistance(String(Math.round(newVal * 100) / 100));
  };

  const adjustTimeUnit = (unit: 'h' | 'm' | 's', amount: number) => {
    if (unit === 'h') {
      const current = parseInt(hours, 10) || 0;
      setHours(String(Math.max(0, current + amount)));
    } else if (unit === 'm') {
      const current = parseInt(minutes, 10) || 0;
      let nextVal = current + amount;
      if (nextVal < 0) nextVal = 59;
      if (nextVal > 59) nextVal = 0;
      setMinutes(String(nextVal));
    } else {
      const current = parseInt(seconds, 10) || 0;
      let nextVal = current + amount;
      if (nextVal < 0) nextVal = 59;
      if (nextVal > 59) nextVal = 0;
      setSeconds(String(nextVal));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/treinos')}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-white">Registrar Corrida</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-[#151515] rounded-3xl p-6 border border-gray-800 flex flex-col gap-6">
        {/* Distance Card */}
        <div className="bg-card p-5 rounded-2xl border border-gray-800 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Distância Percorrida</span>
          </div>

          <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden h-16 max-w-xs mx-auto w-full">
            <button 
              type="button"
              onClick={() => adjustDistance(-0.5)} 
              className="w-16 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex items-baseline justify-center gap-1 flex-1">
              <input 
                type="text" 
                inputMode="decimal"
                value={distance} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                    setDistance(val.replace(',', '.'));
                  }
                }} 
                onFocus={(e) => e.target.select()}
                className="w-20 text-center bg-transparent font-black text-white text-2xl focus:outline-none" 
                placeholder="0" 
              />
              <span className="text-gray-500 font-bold text-sm">km</span>
            </div>
            <button 
              type="button"
              onClick={() => adjustDistance(0.5)} 
              className="w-16 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Time / Duration Card */}
        <div className="bg-card p-5 rounded-2xl border border-gray-800 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Tempo / Duração</span>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto w-full">
            {/* Hours */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-black">Horas</span>
              <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl overflow-hidden h-12 w-full">
                <button 
                  type="button"
                  onClick={() => adjustTimeUnit('h', -1)} 
                  className="px-2 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={hours} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]*$/.test(val)) setHours(val);
                  }} 
                  onFocus={(e) => e.target.select()}
                  className="w-8 text-center bg-transparent font-black text-white focus:outline-none text-sm" 
                  placeholder="0" 
                />
                <button 
                  type="button"
                  onClick={() => adjustTimeUnit('h', 1)} 
                  className="px-2 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-black">Minutos</span>
              <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl overflow-hidden h-12 w-full">
                <button 
                  type="button"
                  onClick={() => adjustTimeUnit('m', -1)} 
                  className="px-2 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={minutes} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (/^[0-9]*$/.test(val) && (parseInt(val, 10) < 60 || val === ''))) setMinutes(val);
                  }} 
                  onFocus={(e) => e.target.select()}
                  className="w-8 text-center bg-transparent font-black text-white focus:outline-none text-sm" 
                  placeholder="00" 
                />
                <button 
                  type="button"
                  onClick={() => adjustTimeUnit('m', 1)} 
                  className="px-2 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-black">Segundos</span>
              <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl overflow-hidden h-12 w-full">
                <button 
                  type="button"
                  onClick={() => adjustTimeUnit('s', -1)} 
                  className="px-2 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={seconds} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (/^[0-9]*$/.test(val) && (parseInt(val, 10) < 60 || val === ''))) setSeconds(val);
                  }} 
                  onFocus={(e) => e.target.select()}
                  className="w-8 text-center bg-transparent font-black text-white focus:outline-none text-sm" 
                  placeholder="00" 
                />
                <button 
                  type="button"
                  onClick={() => adjustTimeUnit('s', 1)} 
                  className="px-2 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-card p-5 rounded-2xl border border-gray-800 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Data do Treino</span>
          </div>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Notes Field */}
        <div className="bg-card p-5 rounded-2xl border border-gray-800 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Clipboard className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Observações (Opcional)</span>
          </div>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Corrida matinal na esteira. Ritmo constante."
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-2xl text-sm uppercase tracking-wider transition-colors shadow-lg shadow-primary/20"
        >
          Salvar Corrida
        </button>
      </form>
    </div>
  );
}
