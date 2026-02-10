import React from "react";

interface Props {
    stage: number;
    setStage: (s: number) => void;
}

const steps = [
    "Upload",
    "Sanitisation",
    "Tokenisation",
    "Debate",
    "Detokenisation",
    "Secure Output"
];

export const VerticalTimeline: React.FC<Props> = ({ stage, setStage }) => {
    return (
        <div className="w-[260px] h-full flex flex-col items-center py-20 relative z-20">

            {/* Background Panel */}
            <div className="absolute inset-0 bg-black/90 border-r border-white/5 backdrop-blur-xl" />

            <div className="relative flex flex-col gap-14 z-10 w-full pl-12">

                {/* Vertical Line Container */}
                <div className="absolute left-6 top-2 bottom-20 w-[2px] bg-white/10 rounded-full overflow-hidden">
                    {/* Animated Progress Line */}
                    <div
                        className="bg-white/80 w-full transition-all duration-1000 ease-in-out"
                        style={{ height: `${(stage / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step, i) => (
                    <div
                        key={i}
                        onClick={() => setStage(i)}
                        className={`flex items-center gap-6 cursor-pointer group transition-all duration-500 ${stage === i ? "opacity-100 scale-105" : stage > i ? "opacity-80" : "opacity-30 hover:opacity-60"
                            }`}
                    >
                        {/* Node */}
                        <div className="relative flex items-center justify-center">
                            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${stage >= i ? "bg-white" : "bg-white/20"}`} />

                            {/* Active Pulse Ring */}
                            {stage === i && (
                                <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping opacity-75" />
                            )}

                            {/* Glow Effect for Active/Completed */}
                            {stage >= i && (
                                <div className="absolute inset-0 w-3 h-3 rounded-full bg-white blur-sm opacity-50" />
                            )}
                        </div>

                        <span className={`tracking-widest text-xs uppercase font-medium transition-colors duration-500 ${stage === i ? "text-white" : "text-gray-400"}`}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
