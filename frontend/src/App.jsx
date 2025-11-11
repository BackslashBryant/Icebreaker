import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Radar from './pages/Radar';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import DevIndex from './pages/DevIndex';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/dev" element={<DevIndex />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/radar" element={<Radar />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
