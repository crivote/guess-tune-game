import { createSignal, createMemo } from 'solid-js';
import { soundManager } from '../utils/SoundManager';

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

const [userName, setUserName] = createSignal(localStorage.getItem('userName') || 'Player');
const initialHistory = JSON.parse(localStorage.getItem('gameHistory')) || { EASY: [], MEDIUM: [], HARD: [], CUSTOM: [] };
// Legacy migration: if history is array, reset it or migrate (resetting for simplicity as structure changed)
const [history, setHistory] = createSignal(Array.isArray(initialHistory) ? { EASY: [], MEDIUM: [], HARD: [], CUSTOM: [] } : initialHistory);
const [highScore, setHighScore] = createSignal(JSON.parse(localStorage.getItem('highScore')) || { score: 0, date: null });

const [audioContext, setAudioContext] = createSignal(null);

export const DIFFICULTIES = {
    EASY: {
        id: 'EASY',
        name: 'Easy',
        numOptions: 3,
        maxTries: 2,
        roundsCount: 10,
        timeLimit: 0, // No limit
        penalty: 0,
        maxSkips: 2,
        poolFilters: { type: 'all', minTunebooks: 0, topN: 200 }
    },
    MEDIUM: {
        id: 'MEDIUM',
        name: 'Medium',
        numOptions: 4,
        maxTries: 1,
        roundsCount: 20,
        timeLimit: 30,
        penalty: -25,
        maxSkips: 1,
        poolFilters: { type: 'all', minTunebooks: 0, topN: 500 }
    },
    HARD: {
        id: 'HARD',
        name: 'Hard',
        numOptions: 6,
        maxTries: 1,
        roundsCount: 40,
        timeLimit: 15,
        penalty: -50,
        maxSkips: 0,
        poolFilters: { type: 'all', minTunebooks: 0 }
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
        poolFilters: { type: 'all', minTunebooks: 0 }
    }
};

const [settings, setSettings] = createSignal(JSON.parse(localStorage.getItem('gameSettings')) || DIFFICULTIES.MEDIUM);

const [triesLeft, setTriesLeft] = createSignal(1);
const [currentPoolSize, setCurrentPoolSize] = createSignal(0);

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
            const response = await fetch('/tunes.json');
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
        }, 1000); // 2 seconds delay for the start sound
    };

    const nextRound = (isFirstRound = false) => {
        if (!isFirstRound) {
            if (round() >= settings().roundsCount) {
                saveGameResult();
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
        setTimer(settings().timeLimit);
        setGameState('playing');
        setIsMusicPlaying(true);
    };

    const submitAnswer = (selectedTuneId) => {
        if (gameState() !== 'playing') return;

        const correct = selectedTuneId === currentTune().id;
        if (correct) {
            // Dynamic Scoring Logic
            const base = 100;
            const optionWeight = settings().numOptions / 4;
            const poolWeight = Math.max(0.2, Math.min(1.5, currentPoolSize() / 1000));
            // Fix NaN: Only apply time weight if there is a limit > 0
            const timeWeight = settings().timeLimit > 0 ? (1 + (timer() / settings().timeLimit)) : 1;
            const tryBonus = settings().maxTries > 1 ? (triesLeft() / settings().maxTries) : 1;


            const roundScore = Math.round(base * optionWeight * poolWeight * timeWeight * tryBonus);

            // Streak Logic
            const newStreak = streak() + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak()) {
                setMaxStreak(newStreak);
            }

            // Streak Bonus: +15 points for every 3 streak
            const streakBonus = Math.floor(newStreak / 3) * 15;

            const totalRoundScore = roundScore + streakBonus;

            setScore(s => s + totalRoundScore);
            setGuessedTuneIds(prev => [...prev, currentTune().id]);
            setLastResult({ correct: true, points: totalRoundScore, bonus: streakBonus, ...currentTune() });
            setGameState('answered');
            setIsMusicPlaying(false);
            soundManager.playCorrect();
        } else {
            setScore(s => s + (settings().penalty || 0));
            setTriesLeft(t => t - 1);
            if (triesLeft() <= 0) {
                setStreak(0);
                setLastResult({ correct: false, points: 0, ...currentTune() });
                setGameState('answered');
                setIsMusicPlaying(false);
                soundManager.playWrongFail();
            } else {
                setFailedOptionIds(prev => [...prev, selectedTuneId]);
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
            (new Date(currentResult.date) - new Date(h.date)) < 10000
        );

        if (isDuplicate) return;

        // Add new result, sort by score (desc), keep top 5
        const newDiffHistory = [currentResult, ...currentDiffHistory]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

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
        setHistory({ EASY: [], MEDIUM: [], HARD: [], CUSTOM: [] });
        setHighScore({ score: 0, date: null });
        setSettings(DIFFICULTIES.MEDIUM);
        window.location.reload(); // Cleanest way to reset everything
    };

    const updateSettings = (newSettings) => {
        const updated = { ...settings(), ...newSettings };
        setSettings(updated);
        saveToLocal('gameSettings', updated);
    };

    const updateUserName = (name) => {
        setUserName(name);
        localStorage.setItem('userName', name);
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
        resetData
    };
}

export const gameStore = useGameStore();
