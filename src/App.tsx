import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PokedexShell } from './components/PokedexShell';
import { DexEntry } from './views/DexEntry';
import { Dossier } from './views/Dossier';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<PokedexShell />}>
          <Route index element={<DexEntry />} />
          <Route path="dossier" element={<Dossier />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
