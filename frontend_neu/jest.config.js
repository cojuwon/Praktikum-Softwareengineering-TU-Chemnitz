const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Pfad zur Next.js App für das Laden von next.config.js und .env
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  // Test-Umgebung für React-Komponenten
  testEnvironment: 'jsdom',
  
  // Setup-Datei die vor jedem Test läuft
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Module Path Aliases (wie in tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test-Dateien Pattern
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Coverage-Einstellungen
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types/**',
  ],
  
  // Transform-Ignorierung für node_modules (außer bestimmte Packages)
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

module.exports = createJestConfig(config);
