'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Helper component for the Overlay Panel
const OverlayPanel = ({ mode, toggleMode }: { mode: 'left' | 'right'; toggleMode: () => void }) => {
    return (
        <motion.div
            initial={{
                x: mode === 'left' ? '100%' : '0%',
            }}
            animate={{
                x: mode === 'left' ? '100%' : '0%',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 h-full w-1/2 bg-[#294D9D] text-white z-20 hidden md:block overflow-hidden"
        >
            <motion.div
                className="flex h-full w-[200%]"
                initial={{
                    x: mode === 'left' ? '-50%' : '0%',
                }}
                animate={{
                    x: mode === 'left' ? '-50%' : '0%',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {/* Left Side Content (Visible when Overlay is Left -> Right Mode) */}
                <div className="w-1/2 flex flex-col items-center justify-center p-12 text-center">
                    <div className="max-w-xs space-y-6 flex flex-col items-center">
                        <h1 className="text-3xl font-bold">Nanu?</h1>
                        <p className="text-blue-100">Du hast die andere Seite des Easter Eggs gefunden!</p>
                        <button
                            onClick={toggleMode}
                            className="px-8 py-3 bg-white text-[#294D9D] rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-md"
                        >
                            Umblättern
                        </button>
                    </div>
                </div>

                {/* Right Side Content (Visible when Overlay is Right -> Left Mode) */}
                <div className="w-1/2 flex flex-col items-center justify-center p-12 text-center">
                    <div className="max-w-xs space-y-6 flex flex-col items-center">
                        <h1 className="text-3xl font-bold">Hallo Entdecker!</h1>
                        <p className="text-blue-100">Gute Arbeit, diese Seite aufzuspüren!</p>
                        <button
                            onClick={toggleMode}
                            className="px-8 py-3 bg-white text-[#294D9D] rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-md"
                        >
                            Was gibt&apos;s noch?
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function EasterEggSlider() {
    const [mode, setMode] = useState<'left' | 'right'>('left');

    const toggleMode = () => {
        setMode(prev => (prev === 'left' ? 'right' : 'left'));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3EEEE] p-4 font-sans">
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
                <div className="md:hidden w-full p-6 text-center bg-[#294D9D] text-white">
                    <h1 className="text-2xl font-bold mb-2">Bellis e.V. - Easter Egg</h1>
                    <div className="flex justify-center gap-4 text-sm font-medium">
                        <button
                            onClick={() => setMode('left')}
                            className={mode === 'left' ? 'underline decoration-2 underline-offset-4' : 'opacity-70'}
                        >
                            Ei 1
                        </button>
                        <button
                            onClick={() => setMode('right')}
                            className={mode === 'right' ? 'underline decoration-2 underline-offset-4' : 'opacity-70'}
                        >
                            Ei 2
                        </button>
                    </div>
                </div>

                <div className="hidden md:block absolute top-0 left-0 w-full h-full pointer-events-none"></div>
                <OverlayPanel mode={mode} toggleMode={toggleMode} />

                {/* Left Side */}
                <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center transition-opacity duration-500 ${mode === 'left' ? 'opacity-100 z-10' : 'opacity-0 md:opacity-100 z-0'}`}>
                    <div className="h-full flex flex-col justify-center items-center space-y-6">
                        <div className="w-32 h-32 relative animate-bounce">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-[#294D9D] fill-current">
                                <path d="M50 5C35 5 20 25 20 55C20 80 30 95 50 95C70 95 80 80 80 55C80 25 65 5 50 5Z" />
                                <circle cx="35" cy="40" r="5" fill="#FFF" />
                                <circle cx="65" cy="30" r="7" fill="#FFF" />
                                <circle cx="50" cy="70" r="10" fill="#FFF" />
                                <circle cx="28" cy="65" r="4" fill="#FFF" />
                                <circle cx="72" cy="55" r="6" fill="#FFF" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#294D9D]">Herzlichen Glückwunsch!</h2>
                        <p className="text-gray-600">
                            Die Funktion "Passwort vergessen" ist aktuell deaktiviert. Aber du hast erfolgreich unser Easter Egg gefunden! 🥳
                        </p>
                        <Link href="/login" className="mt-4 px-6 py-2 bg-[#294D9D] text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-md">
                            Zurück zum Login
                        </Link>
                    </div>
                </div>

                {/* Right Side */}
                <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center transition-opacity duration-500 ${mode === 'right' ? 'opacity-100 z-10' : 'opacity-0 md:opacity-100 z-0'} absolute md:static top-0 left-0 h-full md:h-auto`}>
                    <div className="h-full flex flex-col justify-center items-center space-y-6">
                        <div className="w-32 h-32 relative animate-pulse">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-[#F5A623] fill-current">
                                <path d="M50 5C35 5 20 25 20 55C20 80 30 95 50 95C70 95 80 80 80 55C80 25 65 5 50 5Z" />
                                <path d="M20 55 L35 45 L50 60 L65 40 L80 55" stroke="#FFF" strokeWidth="4" fill="none" />
                                <path d="M25 70 L40 60 L50 75 L65 55 L75 70" stroke="#FFF" strokeWidth="4" fill="none" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#294D9D]">Ein weiteres Osterei!</h2>
                        <p className="text-gray-600">
                            Wahnsinn, du hast dir sogar beide Seiten angesehen! Wir hoffen, das kleine Geheimnis hat dir ein Lächeln ins Gesicht gezaubert.
                        </p>
                        <Link href="/login" className="mt-4 px-6 py-2 bg-[#F5A623] text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-md">
                            Zurück zum Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
