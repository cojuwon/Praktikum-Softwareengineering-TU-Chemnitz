'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from './login-form';
import RegisterForm from './register-form';
import ForgotPasswordForm from './forgot-password-form';
import Image from 'next/image';

// Helper component for the Overlay Panel
const OverlayPanel = ({ mode, toggleMode }: { mode: 'login' | 'register'; toggleMode: () => void }) => {
    return (
        <motion.div
            initial={{
                x: mode === 'login' ? '100%' : '0%',
            }}
            animate={{
                x: mode === 'login' ? '100%' : '0%',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 h-full w-1/2 bg-[#294D9D] text-white z-20 hidden md:block overflow-hidden"
        >
            {/* Inner Container - Moves opposite to overlay to create "stationary" effect */}
            <motion.div
                className="flex h-full w-[200%]"
                initial={{
                    x: mode === 'login' ? '-50%' : '0%',
                }}
                animate={{
                    x: mode === 'login' ? '-50%' : '0%',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {/* Left Side Content (Visible when Overlay is Left -> Register Mode) */}
                <div className="w-1/2 flex flex-col items-center justify-center p-12 text-center">
                    <div className="max-w-xs space-y-6 flex flex-col items-center">
                        <h1 className="text-3xl font-bold">Willkommen zurück!</h1>
                        <p className="text-blue-100">Du hast bereits einen Account?</p>
                        <button
                            onClick={toggleMode}
                            className="px-8 py-3 bg-white text-[#294D9D] rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-md"
                        >
                            Anmelden
                        </button>
                    </div>
                </div>

                {/* Right Side Content (Visible when Overlay is Right -> Login Mode) */}
                <div className="w-1/2 flex flex-col items-center justify-center p-12 text-center">
                    <div className="max-w-xs space-y-6 flex flex-col items-center">
                        <h1 className="text-3xl font-bold">Hallo!</h1>
                        <p className="text-blue-100">Du hast noch keinen Account?</p>
                        <button
                            onClick={toggleMode}
                            className="px-8 py-3 bg-white text-[#294D9D] rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-md"
                        >
                            Registrieren
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

interface AuthSliderProps {
    initialMode?: 'login' | 'register';
    initialShowForgotPassword?: boolean;
}

export default function AuthSlider({ initialMode = 'login', initialShowForgotPassword = false }: AuthSliderProps) {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [showForgotPassword, setShowForgotPassword] = useState(initialShowForgotPassword);

    const toggleMode = () => {
        setMode(prev => (prev === 'login' ? 'register' : 'login'));
        // Reset forgot password view when switching modes
        if (showForgotPassword) {
            setShowForgotPassword(false);
        }
    };

    // If showing forgot password, force 'login' mode visually (Left Side visible)
    const effectiveMode = showForgotPassword ? 'login' : mode;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3EEEE] p-4 font-sans">

            {/* Logo Section - Centered above the card */}
            <div className="mb-6 transition-transform hover:scale-105 duration-300">
                <Image
                    src="/bellis-favicon.png"
                    alt="Bellis Logo"
                    width={80}
                    height={80}
                    className="object-contain drop-shadow-md"
                    priority
                />
            </div>

            <div className="relative w-full max-w-[900px] min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Mobile Toggle (Top) */}
                <div className="md:hidden w-full p-6 text-center bg-[#294D9D] text-white">
                    <h1 className="text-2xl font-bold mb-2">Bellis e.V.</h1>
                    <div className="flex justify-center gap-4 text-sm font-medium">
                        <button
                            onClick={() => { setMode('login'); setShowForgotPassword(false); }}
                            className={effectiveMode === 'login' && !showForgotPassword ? 'underline decoration-2 underline-offset-4' : 'opacity-70'}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={effectiveMode === 'register' ? 'underline decoration-2 underline-offset-4' : 'opacity-70'}
                        >
                            Registrieren
                        </button>
                    </div>
                </div>

                {/* Desktop Sliding Overlay */}
                <div className="hidden md:block absolute top-0 left-0 w-full h-full pointer-events-none">
                    {/* The actual colored slider is separate to allow content underneath */}
                </div>
                <OverlayPanel mode={effectiveMode} toggleMode={toggleMode} />

                {/* Left Side: Login Form OR Forgot Password Form */}
                <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-opacity duration-500 ${effectiveMode === 'login' ? 'opacity-100 z-10' : 'opacity-0 md:opacity-100 z-0'}`}>
                    {/* On Desktop, we hide this side when in register mode via z-index/opacity logic relative to the slider */}
                    <div className="h-full flex flex-col justify-center">
                        {showForgotPassword ? (
                            <ForgotPasswordForm />
                        ) : (
                            <LoginForm />
                        )}
                    </div>
                </div>

                {/* Right Side: Register Form */}
                <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-opacity duration-500 ${effectiveMode === 'register' ? 'opacity-100 z-10' : 'opacity-0 md:opacity-100 z-0'} absolute md:static top-0 left-0 h-full md:h-auto`}>
                    {/* Mobile: Absolute positioning helps switch. Desktop: Static side-by-side but hidden by slider */}
                    <div className="h-full flex flex-col justify-center">
                        <RegisterForm />
                    </div>
                </div>

            </div>
        </div>
    );
}
