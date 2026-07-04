import { Link, Outlet, useLocation } from 'react-router-dom';
import { Dumbbell, Home, History, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Início', path: '/', icon: Dumbbell },
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Histórico', path: '/historico', icon: History },
    { name: 'Perfil', path: '/configuracoes', icon: User },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg font-sans">
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-800 bg-bg sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight uppercase text-white hidden md:block">Progressão</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "transition-colors",
                  isActive 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "hover:text-white pb-1 border-b-2 border-transparent"
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/treinos/novo"
            className="px-4 py-2 md:px-6 bg-primary hover:bg-blue-600 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 text-white transition-colors"
          >
            <span>+</span> <span className="hidden md:inline">NOVO TREINO</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-bg px-2 pb-safe z-10">
        <ul className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path} className="flex-1">
                <Link
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 gap-1 rounded-xl transition-all duration-200",
                    isActive 
                      ? "text-primary" 
                      : "text-gray-500 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                  <span className="text-[10px] font-bold uppercase">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
