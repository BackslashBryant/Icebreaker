import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Radar from './pages/Radar';
import DevIndex from './pages/DevIndex';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/dev" element={<DevIndex />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/radar" element={<Radar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
