export const STORAGE_VERSION = 1;

export const DIFFICULTIES = {
    BEGINNER: {
        id: 'BEGINNER',
        name: 'Beginner',
        numOptions: 3,
        maxTries: 2,
        roundsCount: 10,
        timeLimit: 0, // No limit
        penalty: 0,
        maxSkips: 2,
        poolFilters: { type: 'all', minTunebooks: 0, topN: 100 },
        maxPossibleScore: 1000,
        unlockRequirement: 0 // Always unlocked
    },
    BASIC: {
        id: 'BASIC',
        name: 'Basic',
        numOptions: 4,
        maxTries: 2,
        roundsCount: 20,
        timeLimit: 60,
        penalty: -10,
        maxSkips: 1,
        poolFilters: { type: 'all', minTunebooks: 0, topN: 250 },
        maxPossibleScore: 3500,
        unlockRequirement: 1800 // Requires ~1.8 perfect Beginner games
    },
    MEDIUM: {
        id: 'MEDIUM',
        name: 'Medium',
        numOptions: 5,
        maxTries: 1,
        roundsCount: 30,
        timeLimit: 40,
        penalty: -25,
        maxSkips: 0,
        poolFilters: { type: 'all', minTunebooks: 0, topN: 500 },
        maxPossibleScore: 12000,
        unlockRequirement: 6300 // Requires ~1.8 perfect Basic games
    },
    HARD: {
        id: 'HARD',
        name: 'Hard',
        numOptions: 6,
        maxTries: 1,
        roundsCount: 40,
        timeLimit: 30,
        penalty: -50,
        maxSkips: 0,
        poolFilters: { type: 'all', minTunebooks: 0, topN: 1000 },
        maxPossibleScore: 40000,
        unlockRequirement: 21600 // Requires ~1.8 perfect Medium games
    },
    CUSTOM: {
        id: 'CUSTOM',
        name: 'Custom',
        numOptions: 4,
        maxTries: 1,
        roundsCount: 10,
        timeLimit: 30,
        penalty: -10,
        maxSkips: 3,
        poolFilters: { type: 'all', minTunebooks: 0 },
        maxPossibleScore: 0,
        unlockRequirement: 0
    }
};

export const DIFFICULTY_ORDER = ['BEGINNER', 'BASIC', 'MEDIUM', 'HARD'];

export const SCORING = {
    BASE_POINTS: 350,
    BEGINNER_SPEED_THRESHOLD: 5, // Bonus for answers under 5s
};

export const TIMING = {
    FEEDBACK_AUTO_NEXT: 10,
    TIMER_INTERVAL: 1000,
    START_GAME_DELAY: 1000,
    DEDUPLICATION_WINDOW: 10000
};
