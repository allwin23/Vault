
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
    onSend: (message: string, file?: File) => void;
    isProcessing?: boolean;
}

export function ChatInput({ onSend, isProcessing }: ChatInputProps) {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Dynamic height adjustment
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = () => {
        if (!input.trim() && !selectedFile) return;
        onSend(input, selectedFile || undefined);
        setInput('');
        setSelectedFile(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDemoCase = () => {
        const prompts = [
            "I, Ramesh Kumar, residing at 12 Lake View Road, Chennai, entered into a rental agreement on 5 June 2023 with Mr. Suresh Menon for a house in Anna Nagar and paid an advance of ₹1,50,000, but he is now refusing to return the deposit after I vacated the property in March 2024, and I want legal help to recover my money.",
            "My name is Priya Sharma, working at Infosys Bangalore, and I purchased a laptop online using my ICICI credit card ending with 4582 on 10 January 2025, but I received a damaged product and the seller has stopped responding to my emails and calls, so I want to know how to proceed legally to get a refund.",
            "I am Arjun Patel from 45 MG Road, Ahmedabad, and I transferred ₹2,00,000 to a contractor named Mahesh Builders on 12 September 2024 for home renovation work, but he has neither started the work nor returned my money despite multiple reminders, and I want to file a complaint.",
            "My father, Mr. Kannan Subramaniam, aged 67, from Coimbatore, was denied insurance coverage by ABC Health Insurance even after paying premiums for 8 years, and the claim for his heart surgery done on 3 March 2025 at Apollo Hospital was rejected unfairly, so we want to challenge this legally.",
            "I am Neha Verma, employed at TCS Hyderabad, and my employer terminated my job on 15 February 2025 without notice even though my contract clearly mentions a 60-day notice period, and I want to understand my rights and whether I can claim compensation.",
            "My name is Mohammed Faiz, living at 22 Park Street, Kolkata, and my neighbor Rajiv Singh has illegally occupied a portion of my land since December 2023 and constructed a wall despite repeated warnings, and I want to take legal action to reclaim my property.",
            "I am Deepak Nair, and I paid ₹50,000 to a coaching institute called Bright Future Academy in Kochi on 1 July 2024 for a six-month course, but the institute shut down within two months and the owner, Mr. Thomas Varghese, is not responding to calls, and I want to recover my fees.",
            "My sister, Anjali Gupta, who works at a private company in Delhi, has been receiving threatening messages from an unknown number 9876543210 demanding money and claiming to have her personal photos, and we want to know what legal steps we can take to stop this harassment.",
            "I, Sandeep Reddy, from Plot No. 18, Jubilee Hills, Hyderabad, booked a flat from Sunrise Constructions in 2022 and paid ₹10,00,000 as an initial amount, but the project has been delayed for over two years and the builder is refusing to give a refund, and I want to file a case.",
            "My name is Kavita Iyer, and I had a surgery at City Care Hospital, Chennai, on 8 August 2024, but due to alleged negligence by Dr. Manoj Sharma, I developed complications that required further treatment costing ₹3,00,000, and I want to know if I can file a medical negligence case."
        ];
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        setInput(randomPrompt);
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 flex flex-col gap-4">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
            >
                {/* Glow Effect */}
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-gray-200/20 to-white/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />

                <div className="relative flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-white focus-within:bg-white">

                    {/* File Badge */}
                    <AnimatePresence>
                        {selectedFile && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg w-fit mx-2 mt-2"
                            >
                                <Paperclip size={14} className="text-primary" />
                                <span className="text-xs font-medium text-primary truncate max-w-[200px]">
                                    {selectedFile.name}
                                </span>
                                <button
                                    onClick={clearFile}
                                    className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                                >
                                    <X size={12} className="text-primary" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-2">
                        {/* Attachment Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-text-muted hover:text-primary transition-colors rounded-xl hover:bg-panel-hover/50"
                            disabled={isProcessing}
                        >
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf"
                        />

                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isProcessing ? "Processing..." : "Type or upload a PDF to sanitise..."}
                            disabled={isProcessing}
                            className="flex-1 max-h-60 min-h-[48px] py-3 px-3 bg-transparent border-none text-text placeholder:text-text-muted/50 focus:ring-0 resize-none font-ui text-base leading-relaxed disabled:opacity-50 overflow-y-auto"
                            rows={1}
                        />


                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !selectedFile) || isProcessing}
                            className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 m-1"
                        >
                            {isProcessing ? (
                                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-center text-[15px] text-text-muted uppercase tracking-widest font-mono opacity-60">
                    Encrypted Session • VaultSim v2.0
                </div>
            </motion.div>

            {/* Demo Cases Button - Moved below input */}
            <div className="flex justify-center mt-2">
                <button
                    onClick={handleDemoCase}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-black backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-mono tracking-widest hover:bg-black/80 transition-all flex items-center gap-3 shadow-xl"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    ADD DEMO CASE
                </button>
            </div>
        </div>
    );
}
