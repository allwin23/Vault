import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { SecurityProvider } from './contexts/SecurityContext';

// Pages
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/Chat";
import Sanitisation from "./pages/Sanitisation";
import { TrialRoom } from "./pages/TrialRoom";

function App() {
  return (
    <Router>
      <SecurityProvider>
        <SessionProvider>
          <Routes>
            {/* Primary Routes */}
            <Route path="/" element={<ChatPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/sanitisation" element={<Sanitisation />} />
            <Route path="/trial-room" element={<TrialRoom />} />
            <Route path="/debate" element={<TrialRoom />} />

            {/* Helper Routes */}
            <Route path="/session/new" element={<Navigate to={`/session/case_${Math.floor(Date.now() / 1000)}`} replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SessionProvider>
      </SecurityProvider>
    </Router>
  );
}

export default App;
