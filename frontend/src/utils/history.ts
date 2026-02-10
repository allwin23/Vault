
export interface SavedVerdict {
    id: string;
    sessionId: string;
    timestamp: string;
    title: string; // e.g., "Legal Document Scan" or "Verdict"
    content: string;
}

const HISTORY_KEY = 'vault_verdict_history';

export const getHistory = (): SavedVerdict[] => {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Failed to parse history", e);
        return [];
    }
};

export const saveVerdict = (verdict: Omit<SavedVerdict, 'id'>) => {
    const history = getHistory();
    const newEntry = { ...verdict, id: crypto.randomUUID() };
    // Prepend to history
    const updated = [newEntry, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    // Dispatch event for sidebar to update immediately
    window.dispatchEvent(new Event('history-updated'));
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('history-updated'));
};
