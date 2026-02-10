import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { getHistory, SavedVerdict } from '../utils/history';
import { useState, useEffect } from 'react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const { session, initializeSession, clearSession } = useSession();
  const [history, setHistory] = useState<SavedVerdict[]>([]);

  useEffect(() => {
    const updateHistory = () => setHistory(getHistory());
    updateHistory(); // Load initial

    window.addEventListener('history-updated', updateHistory);
    return () => window.removeEventListener('history-updated', updateHistory);
  }, []);

  return (
    <div className={`bg-black rounded-2xl px-5 py-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col ${className || ''}`}>

      {/* top content */}
      <div>

        <h1 className="text-2xl mb-8 font-heading font-bold uppercase tracking-wider">
          Side Bar
        </h1>

        <p className="text-[10px] tracking-[0.2em] mb-4 text-white/70 font-mono uppercase">
          CHAT HISTORY
        </p>

        <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-2 scrollbar-hide">

          {history.length === 0 && (
            <div className="px-3 py-2 rounded-lg bg-white/5 text-xs text-white/40 italic">
              No saved verdicts yet.
            </div>
          )}

          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate('/trial-room', { state: { viewVerdict: item } })}
              className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm cursor-pointer border border-transparent hover:border-white/10 group"
            >
              <div className="font-heading font-bold text-white/90 group-hover:text-white truncate">
                {item.title}
              </div>
              <div className="text-[10px] text-white/50 font-mono truncate mt-1">
                {new Date(item.timestamp).toLocaleDateString()} • {item.sessionId.slice(0, 6)}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* push CTA to bottom */}
      <div className="mt-auto">

        {/* Session Control Button */}
        <button
          onClick={() => session.isActive ? clearSession() : initializeSession()}
          className="w-full bg-[#f5f0e9] text-black py-3 rounded-lg text-sm font-medium hover:opacity-90 transition uppercase mb-8"
        >
          {session.isActive ? 'CLOSE SESSION' : 'CREATE SESSION'}
        </button>

        <div className="text-center mb-3 text-[10px] tracking-[0.2em] text-white/70 font-mono uppercase">
          SESSION ID
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-[#f5f0e9] text-black py-3 rounded-lg text-sm font-medium hover:opacity-90 transition uppercase"
        >
          {session.id ? session.id.slice(0, 8) + '...' : 'NO ACTIVE SESSION'}
        </button>

      </div>

    </div>
  );
}
