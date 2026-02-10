import { useState, useEffect } from "react";

export const useTimelineEngine = () => {
    const [stage, setStage] = useState(0);

    // Initial Auto-Play to Stage 2 (Debate Start)
    // Step 0: Upload -> 1.5s
    // Step 1: Sanitisation -> 3s
    // Step 2: Tokenisation -> 4.5s
    // Step 3: Debate (Wait for API)

    useEffect(() => {
        if (stage >= 3) return; // Stop auto-play at debate

        const timer = setTimeout(() => {
            setStage(prev => prev + 1);
        }, 1500);

        return () => clearTimeout(timer);
    }, [stage]);

    return { stage, setStage };
};
