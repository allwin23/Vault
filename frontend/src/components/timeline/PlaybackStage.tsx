import { TrialRoom as Debate } from "../../pages/TrialRoom";
import { GlassConversation } from "./GlassConversation";
import { useState } from "react";

interface Props {
    stage: number;
    setStage: (s: number) => void;
}

export const PlaybackStage: React.FC<Props> = ({ stage, setStage }) => {
    // We store masked content here to pass to GlassConversation
    const [maskedContent, setMaskedContent] = useState<string | null>(null);

    return (
        <div className="w-full h-full relative">

            {/* Main Conversational Flow (Scrollable) */}
            <div className="absolute inset-0 overflow-y-auto px-12 py-12 scroll-smooth">
                <div className="min-h-full flex flex-col justify-start items-center">
                    <GlassConversation stage={stage} maskText={maskedContent || "Name: [TOKEN_01], ID: [TOKEN_02]"} />
                </div>
            </div>

            {/* Stage 3: Debate Overlay */}
            {stage === 3 && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
                    <Debate
                        minimal={true}
                        autoStart={true}
                        onDebateStateChange={(event: any) => {
                            console.log("Debate State:", event);
                            if (event.type === 'masked') {
                                setMaskedContent(event.payload);
                            }
                            if (event.type === 'completed') {
                                // Auto-advance to Detokenisation after short delay
                                setTimeout(() => setStage(4), 2000);
                            }
                        }}
                    />
                    <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm animate-pulse tracking-widest pointer-events-none">
                        ADVERSARIAL NETWORK ACTIVE...
                    </div>
                </div>
            )}

        </div>
    );
};
