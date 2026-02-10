
import { useTypewriter } from "../../hooks/useTypewriter";
import React from 'react';

type Props = {
    text: string;
    start: boolean;
};

const ApiOutputBox: React.FC<Props> = ({ text, start }) => {
    const typed = useTypewriter(text, start, 18);

    return (
        <div className="w-full h-[420px] rounded-2xl bg-[#f5f0e9] border border-[#dcd7cd] p-6 shadow-sm">
            <div className="text-[13px] text-[#111] leading-relaxed whitespace-pre-wrap font-mono">
                {typed}
                {start && typed.length < text.length && <span className="animate-pulse text-green-500">|</span>}
            </div>
        </div>
    );
};

export default ApiOutputBox;
