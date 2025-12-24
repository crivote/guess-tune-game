export const STORAGE_VERSION = 1;

export const DIFFICULTIES = {
    BEGINNER: {
        id: 'BEGINNER',
        name: 'Beginner',
        numOptions: 3, // Number of choices shown to the user
        maxTries: 2, // Attempts allowed per round
        roundsCount: 10,
        timeLimit: 0, // Seconds per round (0 = no limit)
        penalty: 0, // Points deducted on wrong guess
        maxSkips: 4, // Number of 'Skip' actions available
        poolFilters: {
            type: 'all', // Filter by rhythm type ('jig', 'reel', etc)
            minTunebooks: 0, // Minimum number of collections a tune must be in
            topN: 100 // Limit pool to the top N most popular tunes
        },
        maxPossibleScore: 1500, // Estimated max score for progress tracking
        unlockRequirement: 0 // Sum of scores from previous difficulty needed to unlock
    },
    BASIC: {
        id: 'BASIC',
        name: 'Basic',
        numOptions: 4,
        maxTries: 2,
        roundsCount: 20,
        timeLimit: 60,
        penalty: -30,
        maxSkips: 3,
        poolFilters: {
            type: 'all',
            minTunebooks: 0,
            topN: 250,
            skipN: 50 // Skips the top N most popular tunes for variety
        },
        maxPossibleScore: 3500,
        unlockRequirement: 1800
    },
    MEDIUM: {
        id: 'MEDIUM',
        name: 'Medium',
        numOptions: 5,
        maxTries: 2,
        roundsCount: 30,
        timeLimit: 40,
        penalty: -50,
        maxSkips: 2,
        poolFilters: { type: 'all', minTunebooks: 0, topN: 500, skipN: 100 },
        maxPossibleScore: 12000,
        unlockRequirement: 6300
    },
    HARD: {
        id: 'HARD',
        name: 'Hard',
        numOptions: 6,
        maxTries: 1,
        roundsCount: 40,
        timeLimit: 30,
        penalty: -100,
        maxSkips: 0,
        poolFilters: { type: 'all', minTunebooks: 0, topN: 1000 },
        maxPossibleScore: 40000,
        unlockRequirement: 21600
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
    BASE_POINTS: 350, // Multiplied by difficulty factors
    BEGINNER_SPEED_THRESHOLD: 60, // Reference time for speed bonus in unlimited modes (seconds)
};

export const TIMING = {
    FEEDBACK_AUTO_NEXT: 10, // Unused/Legacy auto-advance delay
    TIMER_INTERVAL: 1000, // Speed of the game clock (ms)
    START_GAME_DELAY: 1000, // Delay before the first tune plays (ms)
    DEDUPLICATION_WINDOW: 10000 // Time window to ignore duplicate match results (ms)
};
