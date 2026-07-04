import { ArrowLeft, User, Bell, Database, Download, Smartphone, Activity, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useAppStore } from '../store/AppContext';
import { UserProfile } from '../types';

export function Settings() {
  const navigate = useNavigate();
  const { isInstallable, install, isIOS, isStandalone } = usePWA();
  const { state, updateProfile } = useAppStore();

  const [profile, setProfile] = useState<UserProfile>(state.profile || {
    name: 'Atleta',
    weight: 70,
    height: 170,
    age: 25,
    gender: 'M',
    activityLevel: 1.55
  });

  const [tmb, setTmb] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);

  useEffect(() => {
    // Calculo da Taxa Metabólica Basal (Mifflin-St Jeor)
    let basal = 0;
    if (profile.gender === 'M') {
      basal = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5;
    } else {
      basal = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
    }
    setTmb(Math.round(basal));
    setTdee(Math.round(basal * profile.activityLevel));
  }, [profile]);

  const handleSave = () => {
    updateProfile(profile);
    alert('Perfil salvo com sucesso!');
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center gap-4 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors lg:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Perfil</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Suas informações e saúde</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-8">
        
        {/* Profile Info */}
        <div className="bg-card rounded-3xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Informações Pessoais</h2>
            <button onClick={handleSave} className="bg-primary text-white p-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors">
              <Save className="w-4 h-4" /> Salvar
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Nome</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Sexo</label>
                <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value as 'M' | 'F'})} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary text-white">
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Idade (anos)</label>
                <input type="number" value={profile.age || ''} onChange={e => setProfile({...profile, age: parseInt(e.target.value) || 0})} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Peso (kg)</label>
                <input type="number" step="0.1" value={profile.weight || ''} onChange={e => setProfile({...profile, weight: parseFloat(e.target.value) || 0})} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary text-white" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Altura (cm)</label>
                <input type="number" value={profile.height || ''} onChange={e => setProfile({...profile, height: parseInt(e.target.value) || 0})} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary text-white" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Nível de Atividade</label>
              <select value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: parseFloat(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary text-white">
                <option value={1.2}>Sedentário (pouco/nenhum exercício)</option>
                <option value={1.375}>Leve (1-3 dias/semana)</option>
                <option value={1.55}>Moderado (3-5 dias/semana)</option>
                <option value={1.725}>Ativo (6-7 dias/semana)</option>
                <option value={1.9}>Muito Ativo (Atleta/Físico)</option>
              </select>
            </div>
          </div>
        </div>

        {/* TMB Calculator Result */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-5 border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Gasto Calórico</h2>
              <p className="text-xs text-primary font-bold">Baseado nas suas informações</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">TMB (Basal)</p>
              <p className="text-2xl font-black text-white">{tmb} <span className="text-xs text-gray-500">kcal</span></p>
            </div>
            <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Gasto Total</p>
              <p className="text-2xl font-black text-white">{tdee} <span className="text-xs text-gray-500">kcal</span></p>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Aplicativo</h3>
          
          <div className="bg-card rounded-2xl border border-gray-800 overflow-hidden">
            {!isStandalone && (isInstallable || isIOS) && (
              <button 
                onClick={isInstallable ? install : undefined}
                className="w-full p-4 flex flex-col justify-center border-b border-gray-800 hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 text-white font-bold">
                    <Download className="w-5 h-5 text-primary" />
                    Instalar Aplicativo
                  </div>
                  <Smartphone className="w-5 h-5 text-gray-500" />
                </div>
                {isIOS && !isInstallable && (
                  <p className="text-xs text-gray-400 mt-2 ml-8">
                    No iPhone/iPad: Toque no ícone de Compartilhar do Safari e selecione "Adicionar à Tela de Início".
                  </p>
                )}
              </button>
            )}
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3 text-white font-bold">
                <Bell className="w-5 h-5 text-gray-400" />
                Notificações
              </div>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3 text-white font-bold">
                <Database className="w-5 h-5 text-gray-400" />
                Exportar Dados
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
