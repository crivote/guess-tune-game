import { createSignal, createMemo, createEffect } from 'solid-js';
import { soundManager } from '../utils/SoundManager';
import { STORAGE_VERSION, DIFFICULTIES, DIFFICULTY_ORDER, SCORING, TIMING } from '../constants';

// Storage Versioning and Migration
const checkStorageVersion = () => {
    const savedVersion = localStorage.getItem('storageVersion');
    if (!savedVersion || parseInt(savedVersion) < STORAGE_VERSION) {
        // Discard all old data on version mismatch or missing version
        localStorage.clear();
        localStorage.setItem('storageVersion', STORAGE_VERSION.toString());
        console.log(`Storage migrated to version ${STORAGE_VERSION}. Old data cleared.`);
    }
};

checkStorageVersion();

const [tunes, setTunes] = createSignal([]);
const [currentTune, setCurrentTune] = createSignal(null);
const [options, setOptions] = createSignal([]);
const [score, setScore] = createSignal(0);
const [round, setRound] = createSignal(1);
const [streak, setStreak] = createSignal(0);
const [maxStreak, setMaxStreak] = createSignal(0);
const [timer, setTimer] = createSignal(0);
const [gameMode, setGameMode] = createSignal('tune-to-title'); // 'tune-to-title' or 'title-to-tune'
const [gameState, setGameState] = createSignal('menu'); // 'menu', 'playing', 'answered', 'summary'
const [lastResult, setLastResult] = createSignal(null); // { correct: boolean, points: number, ...tune }
const [guessedTuneIds, setGuessedTuneIds] = createSignal([]);
const [skipsLeft, setSkipsLeft] = createSignal(0);
const [failedOptionIds, setFailedOptionIds] = createSignal([]);
const [showWrongTryPopup, setShowWrongTryPopup] = createSignal(false);
const [isMusicPlaying, setIsMusicPlaying] = createSignal(false);
const [isStarting, setIsStarting] = createSignal(false);
const [gamePool, setGamePool] = createSignal([]); // Pre-filtered pool for the current game
const [sessionResults, setSessionResults] = createSignal([]); // All rounds results for the current session

// Login state management
const [persistentLogin, setPersistentLogin] = createSignal(localStorage.getItem('persistentLogin')); // 'true', 'false', or null
const [hasConsent, setHasConsent] = createSignal(localStorage.getItem('persistentLogin') === 'true' && localStorage.getItem('hasConsent') === 'true');
const [userName, setUserName] = createSignal(localStorage.getItem('persistentLogin') === 'true' ? (localStorage.getItem('userName') || '') : '');
const isLoggedIn = () => userName() !== '' && hasConsent();

const hasSavedData = () => {
    return localStorage.getItem('userName') !== null && localStorage.getItem('hasConsent') === 'true';
};

const initialHistory = JSON.parse(localStorage.getItem('gameHistory')) || { BEGINNER: [], BASIC: [], MEDIUM: [], HARD: [], CUSTOM: [] };
// Legacy migration: migrate EASY to BEGINNER if exists
if (initialHistory.EASY && !initialHistory.BEGINNER) {
    initialHistory.BEGINNER = initialHistory.EASY;
    delete initialHistory.EASY;
}
const [history, setHistory] = createSignal(Array.isArray(initialHistory) ? { BEGINNER: [], BASIC: [], MEDIUM: [], HARD: [], CUSTOM: [] } : initialHistory);
const [highScore, setHighScore] = createSignal(JSON.parse(localStorage.getItem('highScore')) || { score: 0, date: null });

const [audioContext, setAudioContext] = createSignal(null);


const [settings, setSettings] = createSignal(JSON.parse(localStorage.getItem('gameSettings')) || DIFFICULTIES.BEGINNER);

const [triesLeft, setTriesLeft] = createSignal(1);
const [currentPoolSize, setCurrentPoolSize] = createSignal(0);

// Difficulty unlock helpers

function getPreviousDifficulty(difficultyId) {
    const index = DIFFICULTY_ORDER.indexOf(difficultyId);
    return index > 0 ? DIFFICULTY_ORDER[index - 1] : null;
}

function getBestScoreForDifficulty(difficultyId, historyData) {
    const diffHistory = historyData[difficultyId] || [];
    if (diffHistory.length === 0) return 0;
    // Sum the scores of the top performances to reward cumulative effort
    return diffHistory.reduce((sum, run) => sum + run.score, 0);
}

function isDifficultyUnlocked(difficultyId, historyData) {
    const difficulty = DIFFICULTIES[difficultyId];
    if (!difficulty || difficulty.unlockRequirement === 0) return true;

    // Gate by login: only Beginner (always unlocked) is available for anonymous users
    if (!isLoggedIn()) return false;

    const prevDiffId = getPreviousDifficulty(difficultyId);
    if (!prevDiffId) return true;

    // Sequential check: Previous difficulty must be unlocked first
    if (!isDifficultyUnlocked(prevDiffId, historyData)) return false;

    const bestScore = getBestScoreForDifficulty(prevDiffId, historyData);
    return bestScore >= difficulty.unlockRequirement;
}

function getUnlockProgress(difficultyId, historyData) {
    const difficulty = DIFFICULTIES[difficultyId];
    if (!difficulty || difficulty.unlockRequirement === 0) return 100;

    const prevDiffId = getPreviousDifficulty(difficultyId);
    if (!prevDiffId) return 100;

    // If previous level is not unlocked, progress for this level is 0
    if (!isDifficultyUnlocked(prevDiffId, historyData)) return 0;

    const bestScore = getBestScoreForDifficulty(prevDiffId, historyData);
    const progress = (bestScore / difficulty.unlockRequirement) * 100;
    return Math.min(progress, 100);
}


export function useGameStore() {
    const saveToLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));

    const applyPreset = (presetId) => {
        const p = DIFFICULTIES[presetId];
        if (p) {
            setSettings(p);
            saveToLocal('gameSettings', p);
        }
    };

    const loadTunes = async () => {
        try {
            // Use BASE_URL to support GitHub Pages deployment
            const response = await fetch(`${import.meta.env.BASE_URL}tunes.json`);
            const data = await response.json();
            // Calculate rank based on popularity (tunebooks)
            const sortedData = [...data].sort((a, b) => (b.tunebooks || 0) - (a.tunebooks || 0));
            const rankedData = sortedData.map((tune, index) => ({
                ...tune,
                rank: index + 1
            }));
            setTunes(rankedData);
        } catch (e) {
            console.error('Failed to load tunes', e);
        }
    };

    const startNewGame = (mode = 'tune-to-title') => {
        setGameMode(mode);
        setScore(0);
        setRound(1);
        setStreak(0);
        setMaxStreak(0);
        setGuessedTuneIds([]);
        setTriesLeft(settings().maxTries);
        setSkipsLeft(settings().maxSkips || 0);
        setSessionResults([]);
        setGameState('ready'); // Go to ready screen first to init audio
        setFailedOptionIds([]);
        setShowWrongTryPopup(false);
        setIsMusicPlaying(false);

        // Generate the game pool once at the start
        const allTunes = tunes();
        let pool = [...allTunes];

        // Apply type filter if not 'all'
        if (settings().poolFilters.type !== 'all') {
            pool = pool.filter(t => t.type === settings().poolFilters.type);
        }

        // Apply minTunebooks filter
        pool = pool.filter(t => t.tunebooks >= settings().poolFilters.minTunebooks);

        // Apply topN filter (Easy: top 200, Medium: top 500, Hard: all)
        if (settings().poolFilters.topN) {
            pool = pool.slice(0, settings().poolFilters.topN);
        }

        // Apply onlyTop100 filter (legacy support)
        if (settings().poolFilters.onlyTop100) {
            pool = pool.slice(0, 100);
        }

        // Fallback if pool is too small
        if (pool.length < settings().numOptions) {
            pool = [...allTunes];
        }

        setGamePool(pool);
        setCurrentPoolSize(pool.length);
        // Don't call nextRound yet, wait for user to click Ready
    };

    const initializeAudio = async () => {
        // Close existing context if open to prevent overlaps
        const oldCtx = audioContext();
        if (oldCtx && oldCtx.state !== 'closed') {
            try {
                await oldCtx.close();
                console.log("Old AudioContext closed.");
            } catch (e) {
                console.warn("Error closing AudioContext:", e);
            }
        }

        // Ensure state is cleared briefly to trigger reactivity in effects dependent on it changing
        setAudioContext(null);

        // Create and resume AudioContext on user gesture
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        await ctx.resume();
        setAudioContext(ctx);
        soundManager.setContext(ctx);
        return ctx;
    };

    const startGame = async () => {
        await initializeAudio();

        setIsStarting(true);
        soundManager.playStart();

        // Wait for sound to finish before starting music
        setTimeout(() => {
            setIsStarting(false);
            setGameState('playing');
            nextRound(true);
        }, TIMING.START_GAME_DELAY);
    };

    const getRoundTimeLimit = () => {
        const baseLimit = settings().timeLimit;
        if (baseLimit > 0 && gameMode() === 'title-to-tune') {
            return baseLimit * 2;
        }
        return baseLimit;
    };

    const nextRound = (isFirstRound = false) => {
        if (!isFirstRound) {
            if (round() >= settings().roundsCount) {
                saveGameResult();
                setIsMusicPlaying(false);
                setCurrentTune(null); // Force cleanup of AudioPlayer
                setGameState('summary');
                soundManager.playGameOver();
                return;
            }
            setRound(r => r + 1);
        }

        setFailedOptionIds([]);
        setShowWrongTryPopup(false);
        setIsMusicPlaying(false);

        // Use the pre-generated pool and only filter out guessed tunes
        let pool = gamePool().filter(t => !guessedTuneIds().includes(t.id));

        if (pool.length < settings().numOptions) {
            // Fallback: reset to full game pool if we've run out
            pool = [...gamePool()];
            setGuessedTuneIds([]);
        }

        setCurrentPoolSize(pool.length);
        const randomIndex = Math.floor(Math.random() * pool.length);
        const tune = pool[randomIndex];
        setCurrentTune(tune);

        // Pick distractors
        let distractors = [];
        while (distractors.length < settings().numOptions - 1) {
            const dIndex = Math.floor(Math.random() * pool.length);
            const d = pool[dIndex];
            if (d.id !== tune.id && !distractors.find(x => x.id === d.id)) {
                distractors.push(d);
            }
        }

        const gameOptions = [tune, ...distractors].sort(() => Math.random() - 0.5);
        setOptions(gameOptions);
        setTriesLeft(settings().maxTries);
        setTimer(getRoundTimeLimit()); // Use dynamic limit
        setGameState('playing');
        setIsMusicPlaying(true);
    };

    const submitAnswer = (selectedTuneId) => {
        if (gameState() !== 'playing') return;

        const correct = selectedTuneId === currentTune().id;
        const currentLimit = getRoundTimeLimit();

        if (correct) {
            // Dynamic Scoring Logic
            const base = SCORING.BASE_POINTS;
            const optionWeight = settings().numOptions / 4;
            const poolWeight = Math.max(0.2, Math.min(1.5, currentPoolSize() / 1000));

            // Timing Factor: variable bonus for quick answers
            let timeWeight = 1;
            if (currentLimit > 0) {
                // With limit: linear from 2x (instant) to 1x (timeout)
                // Use currentLimit instead of settings().timeLimit to account for the multiplier
                timeWeight = 1 + (timer() / currentLimit);
            } else {
                // Without limit (Beginner): bonus for answering under threshold
                // Linear from 2x (instant) to 1x (threshold or more)
                const speedBonus = Math.max(0, 1 - (timer() / SCORING.BEGINNER_SPEED_THRESHOLD));
                timeWeight = 1 + speedBonus;
            }

            const tryBonus = settings().maxTries > 1 ? (triesLeft() / settings().maxTries) : 1;

            const roundScore = Math.round(base * optionWeight * poolWeight * timeWeight * tryBonus);

            // Streak Logic
            const newStreak = streak() + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak()) {
                setMaxStreak(newStreak);
            }

            // Streak Bonus: starts at 5% of round score, each new guess adds 10% of current bonus
            // Formula: Multiplier = 0.5 * (1.1^newStreak - 1)
            const streakMultiplier = 0.5 * (Math.pow(1.1, newStreak) - 1);
            const streakBonus = Math.round(roundScore * streakMultiplier);

            const totalRoundScore = roundScore + streakBonus;

            setScore(s => s + totalRoundScore);
            setGuessedTuneIds(prev => [...prev, currentTune().id]);
            const result = {
                correct: true,
                points: totalRoundScore,
                bonus: streakBonus,
                timeTaken: currentLimit > 0 ? (currentLimit - timer()) : timer(),
                speedBonus: Math.round((timeWeight - 1) * 100),
                ...currentTune()
            };
            setLastResult(result);
            setSessionResults(prev => [...prev, result]);
            setGameState('answered');
            setIsMusicPlaying(false);
            soundManager.playCorrect();
        } else {
            setScore(s => s + (settings().penalty || 0));
            setTriesLeft(t => t - 1);
            if (triesLeft() <= 0) {
                setStreak(0);
                const result = {
                    correct: false,
                    points: 0,
                    timeTaken: currentLimit > 0 ? (currentLimit - timer()) : timer(),
                    ...currentTune()
                };
                setLastResult(result);
                setSessionResults(prev => [...prev, result]);
                setGameState('answered');
                setIsMusicPlaying(false);
                soundManager.playWrongFail();
            } else {
                setFailedOptionIds(prev => [...prev, selectedTuneId]);
                setStreak(0); // Lose streak on ANY miss
                setShowWrongTryPopup(true);
                soundManager.playWrongRetry();
            }
        }

        if (gameState() === 'answered' && round() === settings().roundsCount) {
            saveGameResult();
        }
    };

    const skipRound = () => {
        if (skipsLeft() > 0 && gameState() === 'playing') {
            setSkipsLeft(s => s - 1);
            setIsMusicPlaying(false);
            nextRound(true); // true to skip round counter increment
        }
    };

    const backToMenu = () => {
        setGameState('menu');
    };

    const saveGameResult = () => {
        // Gate by login: don't save results if not logged in
        if (!isLoggedIn()) return;

        const currentResult = {
            id: Date.now(), // Unique ID for deduplication
            score: score(),
            maxStreak: maxStreak(),
            date: new Date().toISOString(),
            params: settings(),
            mode: gameMode()
        };

        const diffId = settings().id;
        const currentDiffHistory = history()[diffId] || [];

        // Check for duplicates (same score, mode, within last 10 seconds)
        const isDuplicate = currentDiffHistory.some(h =>
            h.score === currentResult.score &&
            h.mode === currentResult.mode &&
            (new Date(currentResult.date) - new Date(h.date)) < TIMING.DEDUPLICATION_WINDOW
        );

        if (isDuplicate) return;

        // Add new result, sort by score (desc), keep top scores PER MODE
        const sameModeHistory = currentDiffHistory.filter(h => h.mode === currentResult.mode);
        const otherModeHistory = currentDiffHistory.filter(h => h.mode !== currentResult.mode);

        const newSameModeHistory = [currentResult, ...sameModeHistory]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        const newDiffHistory = [...newSameModeHistory, ...otherModeHistory]
            .sort((a, b) => b.score - a.score);

        const newHistory = { ...history(), [diffId]: newDiffHistory };
        setHistory(newHistory);
        saveToLocal('gameHistory', newHistory);

        // High Score (Global check, though not strictly used in new view)
        if (score() > highScore().score) {
            const newHighScore = { score: score(), date: currentResult.date };
            setHighScore(newHighScore);
            saveToLocal('highScore', newHighScore);
        }
    };

    const resetData = () => {
        localStorage.removeItem('gameHistory');
        localStorage.removeItem('highScore');
        localStorage.removeItem('gameSettings');
        setHistory({ BEGINNER: [], BASIC: [], MEDIUM: [], HARD: [], CUSTOM: [] });
        setHighScore({ score: 0, date: null });
        setSettings(DIFFICULTIES.BEGINNER);
        window.location.reload(); // Cleanest way to reset everything
    };

    const updateSettings = (newSettings) => {
        const updated = { ...settings(), ...newSettings };
        setSettings(updated);
        saveToLocal('gameSettings', updated);
    };

    // Enforce valid settings: Beginner for unlogged, or if locked for logged
    createEffect(() => {
        const currentId = settings().id;
        const loggedIn = isLoggedIn();
        const unlocked = isDifficultyUnlocked(currentId, history());

        if (!loggedIn) {
            if (currentId !== 'BEGINNER') {
                applyPreset('BEGINNER');
            }
        } else if (!unlocked) {
            applyPreset('BEGINNER');
        }
    });

    const updateUserName = (name, consentGiven = false) => {
        setUserName(name);
        setHasConsent(consentGiven);
        localStorage.setItem('userName', name);
        localStorage.setItem('hasConsent', consentGiven ? 'true' : 'false');
        // By default, manual login doesn't force persistentLogin unless we add it to the UI later
        // But for now, let's assume they might want to persist if they explicitly login
        localStorage.setItem('persistentLogin', 'true');
        setPersistentLogin('true');
    };

    const loginWithSavedData = (persist) => {
        const savedName = localStorage.getItem('userName');
        const savedConsent = localStorage.getItem('hasConsent') === 'true';
        if (savedName && savedConsent) {
            setUserName(savedName);
            setHasConsent(savedConsent);
            if (persist) {
                localStorage.setItem('persistentLogin', 'true');
                setPersistentLogin('true');
            }
        }
    };

    const skipDataRecovery = (persist) => {
        if (persist) {
            localStorage.setItem('persistentLogin', 'false');
            setPersistentLogin('false');
        }
    };

    const logout = () => {
        if (confirm('Are you sure you want to logout? All progress is stored locally and will be kept on this device, but you will return to anonymous mode.')) {
            setUserName('');
            setHasConsent(false);
            setPersistentLogin('false');
            localStorage.removeItem('userName');
            localStorage.removeItem('hasConsent');
            localStorage.removeItem('persistentLogin');
        }
    };

    return {
        tunes,
        currentTune,
        options,
        score,
        round,
        streak,
        maxStreak,
        timer,
        setTimer,
        gameMode,
        gameState,
        lastResult,
        sessionResults,
        settings,
        history,
        highScore,
        userName,
        triesLeft,
        skipsLeft,
        failedOptionIds,
        showWrongTryPopup,
        setShowWrongTryPopup,
        isMusicPlaying,
        setIsMusicPlaying,
        loadTunes,
        startNewGame,
        nextRound,
        submitAnswer,
        skipRound,
        submitAnswer,
        skipRound,
        backToMenu,
        setGameState,
        updateSettings,
        updateUserName,
        applyPreset,
        startGame,
        audioContext,
        isStarting,
        resetData,
        isLoggedIn,
        logout,
        persistentLogin,
        hasSavedData,
        loginWithSavedData,
        skipDataRecovery,
        isDifficultyUnlocked: (diffId) => isDifficultyUnlocked(diffId, history()),
        getUnlockProgress: (diffId) => getUnlockProgress(diffId, history())
    };
}

export const gameStore = useGameStore();
