"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Briefcase,
    BarChart,
    Settings,
    User as UserIcon,
    LayoutDashboard,
    ShieldCheck,
    Menu,
    ChevronRight,
    BookOpen,
    Search,
    Filter,
    Plus,
    Save,
    Trash2,
    Download,
    ArrowUp,
    HelpCircle,
    Lightbulb,
    Info
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

export default function ManualPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const container = document.getElementById('main-scroll-container');
            if (container && container.scrollTop > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        const container = document.getElementById('main-scroll-container');
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const scrollToSection = (id: string) => {
        setActiveTab(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const scrollToTop = () => {
        const container = document.getElementById('main-scroll-container');
        if (container) {
            container.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const sections = [
        { id: 'dashboard', title: 'Startseite (Dashboard)', icon: LayoutDashboard },
        { id: 'navigation', title: 'Orientierung & Menü', icon: Menu },
        { id: 'anfragen', title: 'Anfragen erfassen', icon: FileText },
        { id: 'faelle', title: 'Fälle bearbeiten', icon: Briefcase },
        { id: 'personen', title: 'Personenverwaltung', icon: UserIcon },
        { id: 'statistik', title: 'Statistiken', icon: BarChart },
        { id: 'settings', title: 'Mein Profil & Admin', icon: Settings },
    ];

    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 relative">
            <PageHeader
                title="Benutzerhandbuch"
                subtitle="Schritt-für-Schritt Anleitungen und Hilfestellungen für Bellis e.V."
            />

            <div className="flex flex-col lg:flex-row gap-8 mt-8">
                {/* Navigation Sidebar for Manual */}
                <div className="hidden lg:block w-64 flex-none">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-4 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Inhaltsverzeichnis
                        </div>
                        <nav className="p-2 space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${activeTab === section.id
                                        ? 'bg-blue-50 text-blue-700 shadow-sm translate-x-1'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                        }`}
                                >
                                    <section.icon className={`w-4 h-4 ${activeTab === section.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                    {section.title}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-16 pb-20">

                    {/* Intro Text */}
                    <div className="prose max-w-none text-gray-600">
                        <p className="text-lg">
                            Willkommen im digitalen Handbuch. Hier finden Sie Erklärungen zu allen Funktionen der Software.
                            Nutzen Sie das Menü links (oder oben auf kleinen Bildschirmen), um direkt zu einem Thema zu springen.
                        </p>
                    </div>

                    {/* Dashboard Section */}
                    <section id="dashboard" className="scroll-mt-8 border-b border-gray-100 pb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Das Dashboard</h2>
                                <p className="text-gray-500">Ihr Startpunkt und Überblick</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                            <p className="text-gray-700 leading-relaxed">
                                Sobald Sie sich einloggen, landen Sie auf dem Dashboard. Es ist so gestaltet, dass Sie sofort loslegen können.
                                Hier sehen Sie Begrüßungstexte und vor allem die <strong>Schnellzugriff-Buttons</strong>.
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                        <Plus className="w-5 h-5" />
                                        Neue Vorgänge starten
                                    </h3>
                                    <p className="text-sm text-blue-800">
                                        Mit einem Klick auf <strong>"Neue Anfrage"</strong> oder <strong>"Neuer Fall"</strong> öffnen Sie direkt
                                        das entsprechende Formular. Das spart Zeit im Alltag.
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        <div className="bg-white text-blue-600 px-3 py-1.5 rounded text-xs font-bold shadow-sm inline-block">Button: Neue Anfrage</div>
                                        <div className="bg-white text-blue-600 px-3 py-1.5 rounded text-xs font-bold shadow-sm inline-block">Button: Neuer Fall</div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Info className="w-5 h-5 text-gray-400" />
                                        Wofür ist das gut?
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Wenn Sie z.B. gerade ein Telefonat annehmen, müssen Sie nicht erst im Menü suchen.
                                        Starten Sie die Dokumentation direkt von hier.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Navigation Section */}
                    <section id="navigation" className="scroll-mt-8 border-b border-gray-100 pb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                <Menu className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Navigation & Sidebar</h2>
                                <p className="text-gray-500">So finden Sie sich zurecht</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 sm:p-8 space-y-6">
                                <p className="text-gray-700">
                                    Am linken Bildschirmrand finden Sie die Hauptnavigation (Sidebar). Diese Leiste bleibt immer sichtbar,
                                    damit Sie jederzeit zwischen den Arbeitsbereichen wechseln können.
                                </p>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2">Die Menüpunkte im Detail:</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { icon: LayoutDashboard, title: "Dashboard", desc: "Zurück zur Startseite." },
                                            { icon: FileText, title: "Anfrage", desc: "Liste aller offenen und erledigten Anfragen." },
                                            { icon: Briefcase, title: "Fall", desc: "Ihre Hauptarbeitsliste für laufende Beratungen." },
                                            { icon: UserIcon, title: "Personen", desc: "Adressbuch aller Klient:innen." },
                                            { icon: BarChart, title: "Statistik", desc: "Auswertungen für Berichte." },
                                            { icon: Settings, title: "Einstellungen", desc: "Profil bearbeiten & Passwort ändern." },
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="mt-1 h-8 w-8 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-500 shadow-sm">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.title}</div>
                                                    <div className="text-sm text-gray-500">{item.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
                                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                                    <div className="text-sm text-amber-800">
                                        <strong>Tipp:</strong> Auf mobilen Geräten oder kleinen Bildschirmen klappt sich das Menü ggf. ein
                                        oder wandert nach unten/oben. Halten Sie Ausschau nach dem Menü-Symbol (drei Striche).
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Anfragen Section */}
                    <section id="anfragen" className="scroll-mt-8 border-b border-gray-100 pb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Anfragen verwalten</h2>
                                <p className="text-gray-500">Erstkontakte und kurzzeitige Kontakte</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Was ist eine Anfrage?</h3>
                                <p className="text-gray-700 mb-4">
                                    Eine Anfrage ist oft der erste Kontakt. Hier notieren Sie z.B., wer angerufen hat und worum es grob ging.
                                    Nicht aus jeder Anfrage muss ein umfangreicher Fall werden.
                                </p>

                                <h4 className="font-medium text-gray-900 mt-6 mb-3">Schritt-für-Schritt: Neue Anfrage anlegen</h4>
                                <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                                    <li className="mb-2 ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-4 ring-white">
                                            <span className="text-green-600 text-xs font-bold">1</span>
                                        </span>
                                        <h5 className="font-medium text-gray-900">Starten</h5>
                                        <p className="text-sm text-gray-500">Klicken Sie im Dashboard auf „Neue Anfrage“ oder im Menü auf „Anfrage“ und dann „Neu“.</p>
                                    </li>
                                    <li className="mb-2 ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-4 ring-white">
                                            <span className="text-green-600 text-xs font-bold">2</span>
                                        </span>
                                        <h5 className="font-medium text-gray-900">Ausfüllen</h5>
                                        <p className="text-sm text-gray-500">
                                            Tragen Sie das Datum und die Art des Kontakts ein (z.B. Telefon, E-Mail).
                                            Das Feld „Anliegen“ ist ein Freitextfeld für Ihre Notizen.
                                        </p>
                                    </li>
                                    <li className="ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-4 ring-white">
                                            <span className="text-green-600 text-xs font-bold">3</span>
                                        </span>
                                        <h5 className="font-medium text-gray-900">Speichern</h5>
                                        <p className="text-sm text-gray-500">
                                            Vergessen Sie nicht, unten rechts auf „Speichern“ zu klicken.
                                        </p>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* Fälle Section */}
                    <section id="faelle" className="scroll-mt-8 border-b border-gray-100 pb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Fallmanagement</h2>
                                <p className="text-gray-500">Kernstück für die Beratungsarbeit</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
                            <div>
                                <p className="text-gray-700 mb-4">
                                    Ein „Fall“ bündelt alles, was zu einer Klientin gehört: Stammdaten, Beratungstermine,
                                    Begleitungen zu Behörden, Dokumente und mehr.
                                </p>
                                <div className="border-t border-b border-gray-100 py-4 my-4 flex gap-8 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-indigo-100 border border-indigo-300"></span>
                                        <span className="text-sm text-gray-600"><strong>Offen:</strong> Fall ist neu angelegt</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></span>
                                        <span className="text-sm text-gray-600"><strong>Laufend:</strong> Wird aktuell bearbeitet</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></span>
                                        <span className="text-sm text-gray-600"><strong>Abgeschlossen:</strong> Beratung beendet</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Aufbau einer Fallakte</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    In der Fallansicht sehen Sie oben Reiter (Tabs). Damit schalten Sie zwischen den Bereichen um:
                                </p>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                        <strong className="block text-gray-900 mb-1">Übersicht</strong>
                                        <span className="text-xs text-gray-500">Wichtige Infos auf einen Blick (Status, Täterdaten, letzte Notiz).</span>
                                    </div>
                                    <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                        <strong className="block text-gray-900 mb-1">Beratungstermine</strong>
                                        <span className="text-xs text-gray-500">Liste aller Gespräche mit Datum und Dauer.</span>
                                    </div>
                                    <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                        <strong className="block text-gray-900 mb-1">Begleitung</strong>
                                        <span className="text-xs text-gray-500">Termine außer Haus (Amtsgänge, Polizei etc.).</span>
                                    </div>
                                    <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                        <strong className="block text-gray-900 mb-1">Dokumente</strong>
                                        <span className="text-xs text-gray-500">Dateiablage für Scans, Briefe oder Notizen.</span>
                                    </div>
                                    <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                        <strong className="block text-gray-900 mb-1">Täter / Kinder</strong>
                                        <span className="text-xs text-gray-500">Erfassung des sozialen Umfelds und der Gefährder.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Personen Section - Keep Simple */}
                    <section id="personen" className="scroll-mt-8 border-b border-gray-100 pb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Personenverwaltung</h2>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <p className="text-gray-700">
                                Hier finden Sie eine alphabetische Liste aller gespeicherten Klient:innen.
                                Dies ist besonders nützlich, wenn Sie nach einer Person suchen, aber nicht wissen, in welchem Fall sie gerade betreut wird.
                            </p>
                        </div>
                    </section>

                    {/* Statistik Section - Updated Text */}
                    <section id="statistik" className="scroll-mt-8 border-b border-gray-100 pb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-sm">
                                <BarChart className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Statistiken</h2>
                                <p className="text-gray-500">Zahlen & Fakten</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                            <p className="text-gray-700">
                                Das Statistik-Modul wertet Ihre eingegebenen Daten automatisch aus. Sie müssen keine Strichlisten mehr führen.
                                Wählen Sie einfach einen Zeitraum (z.B. „01.01.2024“ bis „31.12.2024“), und das System zeigt Ihnen die Summen an.
                            </p>

                            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                                <Download className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-blue-900">Daten-Export</h4>
                                    <p className="text-blue-800 text-sm mt-1 leading-relaxed">
                                        Nutzen Sie den Export-Button, um die Ergebnisse herunterzuladen.
                                        So können Sie die Zahlen einfach weiterverarbeiten, z.B. für <strong>Statistikbögen</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Settings Section */}
                    <section id="settings" className="scroll-mt-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shadow-sm">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 block">Ihr Profil</h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        Oben rechts im Benutzermenu oder unter „Einstellungen“ können Sie Ihre eigenen Daten pflegen.
                                    </p>
                                    <ul className="text-sm space-y-2 text-gray-500">
                                        <li className="flex gap-2 items-center"><ChevronRight className="w-3 h-3" /> Passwort ändern</li>
                                        <li className="flex gap-2 items-center"><ChevronRight className="w-3 h-3" /> E-Mail-Adresse einsehen</li>
                                    </ul>
                                </div>

                                <div className="opacity-75">
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-red-500" />
                                        Administration
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        Dieser Bereich ist nur für Nutzer mit Admin-Rechten sichtbar.
                                    </p>
                                    <div className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded inline-block">
                                        Achtung: Hier werden systemweite Änderungen vorgenommen.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Nach oben scrollen"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
            )}

            {/* Mobile Table of Contents Floating Button (Optional, can be added for better mobile exp) */}
        </div>
    );
}
