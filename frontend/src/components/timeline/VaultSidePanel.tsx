import { useDetokenizer } from "../../hooks/useDetokenizer";

export const VaultSidePanel = () => {
    const { loading } = useDetokenizer();

    return (
        <div className="w-[320px] h-full bg-white/50 backdrop-blur-xl border-l border-white/20 p-6 flex flex-col gap-6 font-mono">

            <div className="text-xs tracking-widest text-[#6f6a60] uppercase border-b border-black/10 pb-2 mb-2">
                Vault System Logs
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-[#444]">
                <div className="flex items-center gap-2 opacity-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>System Online</span>
                </div>

                {loading ? (
                    <>
                        <div className="flex items-center gap-2 animate-pulse text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            <span>Resolving secure entries...</span>
                        </div>
                        <div className="pl-4 opacity-70">Decrypting token payloads...</div>
                        <div className="pl-4 opacity-70">Validating integrity...</div>
                    </>
                ) : (
                    <div className="flex items-center gap-2 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>Secure data restored.</span>
                    </div>
                )}
            </div>

            <div className="text-[10px] text-gray-400 mt-auto border-t border-black/5 pt-4">
                VAULT_SECURE_GATEWAY_V2.1
                <br />
                ENCRYPTION: AES-256-GCM
            </div>

        </div>
    );
};
