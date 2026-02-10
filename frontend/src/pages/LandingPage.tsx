import React from 'react';
import LightPillar from '../components/LightPillar';
import Carousel from '../components/Carousel';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, Scale, FileInput, ShieldCheck, Lock, Gavel,
    User, UploadCloud, AlertTriangle, ShieldAlert, WifiOff, Trash2,
    Twitter, Linkedin, Github
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            {/* Hero Section with LightPillar - Dark Theme */}
            <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <LightPillar
                        topColor="#827e7eff"
                        bottomColor="#827e7eff"
                        intensity={1}
                        rotationSpeed={0.3}
                        glowAmount={0.002}
                        pillarWidth={3}
                        pillarHeight={0.4}
                        noiseIntensity={0.5}
                        pillarRotation={25}
                        interactive={true}
                        mixBlendMode="screen"
                        quality="high"
                    />
                </div>

                {/* Hero Content Overlay - Bottom Left */}
                <div className="relative z-10 w-full h-full flex flex-col justify-end items-start pb-20 pl-6 md:pb-32 md:pl-20 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                        className="text-left max-w-4xl"
                    >
                        <h1 className="text-6xl md:text-8xl font-bold-mono-space tracking-tighter text-white mb-4 drop-shadow-2xl">
                            Vault<span className="text-[#]">Sim</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light-mono-space mb-10 max-w-2xl leading-relaxed">
                            Secure, encrypted legal simulation environment governed by advanced artificial intelligence.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/chat')}
                            className="pointer-events-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium text-lg tracking-wide hover:bg-white/20 hover:border-white/40 transition-all duration-300 shadow-[0_0_20px_rgba(82,39,255,0.3)]"
                        >
                            Enter Simulation
                        </motion.button>
                    </motion.div>
                </div>

                {/* Decorative Overlay Gradients for smooth transition */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            </div>

            {/* Global Background Section */}
            <div className="relative w-full min-h-screen flex flex-col items-center py-24 px-6">
                {/* Content here sits on top of the global body background (grid) */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                >


                </motion.div>



                {/* Carousel Section: The Problem with Legal AI */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="w-full mt-32 flex flex-col items-center"
                >
                    <div className="text-center mb-12 max-w-3xl">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0a0a0a]">
                            The Problem: <span className="text-red-600">Unsecured Legal AI</span>
                        </h2>
                        <p className="text-lg text-gray-700">
                            Current legal AI solutions require exposing sensitive client data to external models, creating unacceptable risks.
                        </p>
                    </div>

                    <div className="w-full flex justify-center h-[500px]">
                        <Carousel
                            items={carouselItems}
                            baseWidth={350}
                            autoplay={true}
                            autoplayDelay={4000}
                            pauseOnHover={true}
                            loop={true}
                            round={false}
                        />
                    </div>
                </motion.div>

                {/* Solution Architecture Section */}
                <div className="w-full mt-32 mb-24 max-w-5xl mx-auto px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#0a0a0a]"
                    >
                        Privacy-First Architecture
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {solutionCards.map((card, index) => (
                            <SolutionCard key={index} {...card} index={index} />
                        ))}
                    </div>
                </div>

                {/* Multi-Agent Orchestration Section */}
                <div className="w-full py-32 border-t border-black/5 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-5xl font-bold text-center mb-24 text-[#0a0a0a]"
                        >
                            Multi-Agent Orchestration
                        </motion.h2>

                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                            {/* Connecting Lines (Desktop Only) */}
                            <div className="hidden md:block absolute top-24 left-0 w-full h-20 pointer-events-none z-0">
                                <svg className="w-full h-full" preserveAspectRatio="none">
                                    <motion.path
                                        d="M 16% 40 H 50% H 84%"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                    />
                                    <motion.path
                                        d="M 16% 40 H 50% H 84%"
                                        fill="none"
                                        stroke="#0a0a0a"
                                        strokeWidth="2"
                                        strokeDasharray="4 4"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{ pathLength: 1, opacity: 0.3 }}
                                        transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                                    />
                                </svg>
                            </div>

                            {/* Agent 1: Supporting Counsel */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative z-10 flex flex-col items-center text-center"
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-24 h-24 bg-white rounded-full border border-black/10 flex items-center justify-center shadow-lg mb-6"
                                >
                                    <Briefcase className="w-10 h-10 text-[#0a0a0a]" />
                                </motion.div>
                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-black/5 shadow-sm w-full">
                                    <h3 className="text-xl font-bold mb-2">Supporting Counsel</h3>
                                    <p className="text-sm text-gray-500 mb-4">Argues on behalf of the user</p>
                                    <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                                        Processes Masked Data
                                    </div>
                                </div>
                            </motion.div>

                            {/* Agent 2: Defense Counsel */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="relative z-10 flex flex-col items-center text-center"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-24 h-24 bg-white rounded-full border-2 border-black/10 flex items-center justify-center shadow-xl mb-6 relative"
                                >
                                    <Gavel className="w-10 h-10 text-[#0a0a0a]" />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border border-black/20"
                                        animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </motion.div>
                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-black/5 shadow-sm w-full">
                                    <h3 className="text-xl font-bold mb-2">Defense Counsel</h3>
                                    <p className="text-sm text-gray-500 mb-4">Presents opposing arguments</p>
                                    <div className="flex flex-col gap-2">
                                        <div className="h-2 w-3/4 bg-gray-200 rounded-full mx-auto animate-pulse" />
                                        <div className="h-2 w-1/2 bg-gray-200 rounded-full mx-auto animate-pulse delay-75" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Agent 3: Judge */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="relative z-10 flex flex-col items-center text-center"
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="w-24 h-24 bg-[#0a0a0a] rounded-full border border-black/10 flex items-center justify-center shadow-lg mb-6"
                                >
                                    <Scale className="w-10 h-10 text-white" />
                                </motion.div>
                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-black/5 shadow-sm w-full">
                                    <h3 className="text-xl font-bold mb-2">Judge Agent</h3>
                                    <p className="text-sm text-gray-500 mb-4">Evaluates & generates verdict</p>
                                    <div className="inline-block px-3 py-1 bg-black text-white rounded-full text-xs font-medium tracking-wide">
                                        Final Verdict
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Data Protection Guarantee Section */}
                <div className="w-full py-32 border-t border-black/5 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        {/* Left Column: Features */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#0a0a0a] mb-6">
                                Your Privacy, Our Priority
                            </h2>
                            <p className="text-lg text-gray-700 leading-relaxed mb-8">
                                We've built VaultSim from the ground up to ensure your sensitive data never leaves your control.
                                Our architecture guarantees zero persistence.
                            </p>

                            <ul className="space-y-6">
                                {[
                                    { text: "Session-only storage (no persistence)", icon: <Lock className="w-5 h-5 text-black" /> },
                                    { text: "AES-256 encryption at rest", icon: <ShieldCheck className="w-5 h-5 text-black" /> },
                                    { text: "Private cloud, no internet connectivity", icon: <WifiOff className="w-5 h-5 text-black" /> },
                                    { text: "Zero data retention after session ends", icon: <Trash2 className="w-5 h-5 text-black" /> }
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                        className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/50 border border-transparent hover:border-black/5 transition-all duration-300"
                                    >
                                        <div className="p-2 bg-black/5 rounded-full">
                                            {item.icon}
                                        </div>
                                        <span className="text-lg font-medium text-gray-800">{item.text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Right Column: Timeline Visualization */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="relative pl-8 md:pl-16 border-l border-black/10 space-y-12"
                        >
                            {/* Timeline Items */}
                            {[
                                { title: "Session Start", desc: "Data encrypted locally with unique session key", icon: <Lock className="w-6 h-6 text-white" /> },
                                { title: "During Processing", desc: "Masked identifiers, processed on secure enclave", icon: <ShieldCheck className="w-6 h-6 text-white" /> },
                                { title: "Session End", desc: "Keys destroyed, data permanently wiped", icon: <Trash2 className="w-6 h-6 text-white" /> }
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    className="relative"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + (i * 0.2) }}
                                >
                                    <div className="absolute -left-[45px] md:-left-[77px] top-0 w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center border-4 border-[#f5f0e9] z-10">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">{step.title}</h3>
                                    <p className="text-gray-600 text-sm md:text-base">{step.desc}</p>
                                </motion.div>
                            ))}

                            {/* Pulsing Timer Indicator */}
                            <motion.div
                                className="absolute -left-[29px] md:-left-[61px] top-1/2 -translate-y-1/2 w-4 h-[80%] bg-gradient-to-b from-transparent via-black/10 to-transparent rounded-full -z-0"
                            />
                        </motion.div>

                    </div>
                </div>
            </div>

            {/* CTA and Footer Section */}
            <div className="w-full py-24 border-t border-black/5 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-white/60 backdrop-blur-md border border-black/10 rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-black/20 to-transparent" />

                        <h2 className="text-4xl md:text-6xl font-bold text-[#0a0a0a] mb-6 tracking-tight">
                            Ready to Protect Your Case?
                        </h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-light">
                            Start your secure legal analysis today with enterprise-grade privacy.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/chat')}
                                className="px-8 py-4 bg-[#0a0a0a] text-white rounded-full font-medium text-lg min-w-[200px] shadow-lg hover:shadow-xl transition-all"
                            >
                                Start Free Trial
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-transparent border-2 border-[#0a0a0a] text-[#0a0a0a] rounded-full font-medium text-lg min-w-[200px] hover:bg-[#0a0a0a]/5 transition-all"
                            >
                                Schedule Demo
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                <footer className="max-w-6xl mx-auto px-6 mt-24">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-black/5 pb-12">
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <h3 className="text-2xl font-bold text-[#0a0a0a]">VaultSim</h3>
                            <p className="text-gray-500 max-w-xs">
                                Secure, encrypted legal simulation environment governed by advanced artificial intelligence.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0a0a0a] mb-4">Platform</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li className="hover:text-[#0a0a0a] cursor-pointer">Security</li>
                                <li className="hover:text-[#0a0a0a] cursor-pointer">Compliance</li>
                                <li className="hover:text-[#0a0a0a] cursor-pointer">Enterprise</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0a0a0a] mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li className="hover:text-[#0a0a0a] cursor-pointer">Privacy Policy</li>
                                <li className="hover:text-[#0a0a0a] cursor-pointer">Terms of Service</li>
                                <li className="hover:text-[#0a0a0a] cursor-pointer">Cookie Settings</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>© 2026 VaultSim Inc. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Twitter className="w-5 h-5 hover:text-[#0a0a0a] cursor-pointer transition-colors" />
                            <Linkedin className="w-5 h-5 hover:text-[#0a0a0a] cursor-pointer transition-colors" />
                            <Github className="w-5 h-5 hover:text-[#0a0a0a] cursor-pointer transition-colors" />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};
// Solution Card Component
const SolutionCard = ({ title, description, icon, features, index }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
            className="flex flex-col p-8 rounded-2xl border border-black/10 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-black/20 transition-all duration-300 group cursor-default h-full"
        >
            <div className="mb-6 p-4 rounded-full bg-black/5 w-fit group-hover:bg-black/10 transition-colors duration-300">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-[#0a0a0a] group-hover:text-black transition-colors">
                {title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
                {description}
            </p>
            {features && (
                <ul className="space-y-3 mt-auto">
                    {features.map((feature: string, i: number) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="flex items-start text-sm text-gray-500"
                        >
                            <span className="mr-2 text-black font-bold">✓</span>
                            {feature}
                        </motion.li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
};



const solutionCards = [
    {
        title: "Input Stage",
        description: "Upload complete case description and supporting documents securely.",
        icon: <FileInput className="w-8 h-8 text-[#0a0a0a]" />,
        features: [
            "Encrypted upload channel",
            "Auto-format detection",
            "Metadata stripping"
        ]
    },
    {
        title: "Processing Stage",
        description: "Fine-tuned LLM detects and masks sensitive information seamlessly.",
        icon: <ShieldCheck className="w-8 h-8 text-[#0a0a0a]" />,
        features: [
            "Processing in private cloud",
            "No internet exposure",
            "Semantic preservation"
        ]
    },
    {
        title: "Encryption Stage",
        description: "AES-256 encrypted token mapping stored strictly on frontend.",
        icon: <Lock className="w-8 h-8 text-[#0a0a0a]" />,
        features: [
            "Original data never transmitted",
            "Session-only keys",
            "Auto-destruction on close"
        ]
    }
];

const carouselItems = [
    {
        title: 'PII Exposure',
        description: 'Users must share sensitive PII (names, addresses, IDs) with third-party providers.',
        id: 1,
        icon: <User className="carousel-icon text-white" />
    },
    {
        title: 'External Transmission',
        description: 'Privileged data is transmitted to external AI models outside of your control.',
        id: 2,
        icon: <UploadCloud className="carousel-icon text-white" />
    },
    {
        title: 'Compliance Risks',
        description: 'High risk of privacy breaches, compliance violations, and critical data leakage.',
        id: 3,
        icon: <AlertTriangle className="carousel-icon text-white" />
    },
    {
        title: 'Zero Protection',
        description: 'No active protection mechanism during the data processing stage.',
        id: 4,
        icon: <ShieldAlert className="carousel-icon text-white" />
    },
    {
        title: 'Lack of Reasoning',
        description: 'Absence of adversarial legal reasoning and realistic courtroom dynamics.',
        id: 5,
        icon: <Gavel className="carousel-icon text-white" />
    }
];

export default LandingPage;
