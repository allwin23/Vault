import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = [
    "VaultSim",
    "0 data leak",
    "Sanitise PDF",
    "Trial",
    "Simulation",
    "Verdict"
];

const AestheticBranding = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 2000); // Changes every 2 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            fontFamily: "'Crimson Text', serif",
            fontSize: '24px',
            fontWeight: '600',
            color: '#000', // Changed to black as requested
            height: '40px',
            display: 'flex',
            alignItems: 'center'
        }}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={words[index]}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

export default AestheticBranding;
