import React from "react";

interface Props {
    transcript: any[];
    maskedContent?: string | null;
}

export const DebateResult: React.FC<Props> = ({ transcript, maskedContent }) => {
    return (
        <div className="space-y-6">

            {/* Transcript Log */}
            <div className="bg-gray-50 rounded-lg p-6 max-h-[400px] overflow-y-auto border border-gray-200 shadow-inner">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 sticky top-0 bg-gray-50 pb-2 border-b">
                    Adversarial Transcript
                </h3>

                <div className="space-y-4">
                    {transcript.map((msg: any, i: number) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'attacker' ? 'items-end' : 'items-start'}`}>
                            <div className={`text-xs mb-1 font-mono uppercase ${msg.role === 'attacker' ? 'text-red-500' : 'text-blue-500'}`}>
                                {msg.role === 'attacker' ? '>> ADVERSARY' : '>> DEFENDER'}
                            </div>
                            <div
                                className={`p-3 rounded-lg text-sm max-w-[80%] ${msg.role === 'attacker'
                                        ? 'bg-red-50 text-red-900 border border-red-100 rounded-tr-none'
                                        : 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tl-none'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Masked Output Section */}
            {maskedContent && (
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-sm font-bold text-green-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Sanitised Output
                    </h3>
                    <div className="font-mono text-sm break-all text-green-900 bg-white/50 p-4 rounded border border-green-100/50">
                        {maskedContent}
                    </div>
                </div>
            )}

        </div>
    );
};
