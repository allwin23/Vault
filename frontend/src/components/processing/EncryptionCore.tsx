
import React from "react";

const EncryptionCore: React.FC = () => {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">

            {/* outer energy ring */}
            <div className="absolute inset-0 flex items-center justify-center -m-16">
                <div className="w-[120px] h-[120px] rounded-full border border-[#e5dfd4] animate-spin-slow opacity-60" />
            </div>

            {/* mid glow pulse */}
            <div className="absolute inset-0 flex items-center justify-center -m-16">
                <div className="w-[90px] h-[90px] rounded-full bg-[#f4f1ea] animate-pulse blur-md opacity-70" />
            </div>

            {/* main encryption node */}
            <div className="relative w-[70px] h-[70px] rounded-full bg-white border border-[#d8d2c6] shadow-md flex items-center justify-center">

                {/* svg lock */}
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3c3a35"
                    strokeWidth="1.6"
                >
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

            </div>
        </div>
    );
};

export default EncryptionCore;
