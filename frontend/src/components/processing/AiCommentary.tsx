import React from "react";
import { useTypewriter } from "../../hooks/useTypewriter";

type Props = {
    text: string;
};

const AiCommentary: React.FC<Props> = ({ text }) => {
    const typed = useTypewriter(text, true, 30);

    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-auto pointer-events-none text-center z-50">
            <div
                className="inline-block rounded-full px-6 py-2"
                style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #e7e2d9",
                    fontFamily: "monospace",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
                }}
            >
                <div className="text-xs text-[#5f5a52] tracking-widest font-medium uppercase flex items-center gap-3">
                    <span className="text-[#333] font-bold opacity-50">{">"}</span>
                    <span className="whitespace-nowrap">{typed}</span>
                    <span className="w-1.5 h-4 bg-[#333] animate-pulse opacity-50 block" />
                </div>
            </div>
        </div>
    );
};

export default AiCommentary;
