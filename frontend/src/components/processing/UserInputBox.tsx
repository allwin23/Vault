
import { useTypewriter } from "../../hooks/useTypewriter";
import React from 'react';

type Props = {
    text: string;
    start: boolean;
};

const UserInputBox: React.FC<Props> = ({ text, start }) => {
    const typed = useTypewriter(text, start, 12);

    return (
        <div className="w-full h-[420px] rounded-2xl bg-[#f5f0e9] border border-[#e6e3dc] p-6 shadow-inner">
            <div className="text-[13px] text-[#2a2a2a] leading-relaxed whitespace-pre-wrap font-mono">
                {typed}
                {start && typed.length < text.length && <span className="animate-pulse">|</span>}
            </div>
        </div>
    );
};

export default UserInputBox;
