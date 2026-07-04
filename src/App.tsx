/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { WorkoutList } from './pages/Workouts/WorkoutList';
import { WorkoutEditor } from './pages/Workouts/WorkoutEditor';
import { ActiveWorkout } from './pages/Workouts/ActiveWorkout';
import { History } from './pages/History';
import { Evolution } from './pages/Evolution';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<WorkoutList />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="treinos" element={<WorkoutList />} />
            <Route path="treinos/:id/editar" element={<WorkoutEditor />} />
            <Route path="treinos/novo" element={<WorkoutEditor />} />
            <Route path="treinos/:id/iniciar" element={<ActiveWorkout />} />
            <Route path="historico" element={<History />} />
            <Route path="evolucao" element={<Evolution />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
