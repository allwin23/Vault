import React from "react";

interface Props {
    stage: number;
}

export const EnergyFlow: React.FC<Props> = ({ stage }) => {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {/* Timeline -> Center (Active > 0) */}
            {stage >= 1 && (
                <>
                    {/* Base Path (faint) */}
                    <path
                        d="M 260 200 C 350 200, 350 400, 440 400"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                        fill="none"
                    />
                    {/* Animated Packet */}
                    <circle r="3" fill="#fff" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                        <animateMotion dur="2s" repeatCount="indefinite" path="M 260 200 C 350 200, 350 400, 440 400" />
                    </circle>
                </>
            )}

            {/* Center -> Vault (Active >= 4 Detokenisation) */}
            {stage >= 4 && (
                <>
                    {/* Base Path (faint) */}
                    <path
                        d="M 900 400 C 1000 400, 1000 200, 1100 200"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                        fill="none"
                    />
                    {/* Animated Packet */}
                    <circle r="3" fill="#fff" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                        <animateMotion dur="1.5s" repeatCount="indefinite" path="M 900 400 C 1000 400, 1000 200, 1100 200" />
                    </circle>
                </>
            )}
        </svg>
    );
};
