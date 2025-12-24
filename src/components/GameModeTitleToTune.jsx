import { For, createSignal, Show, onMount, onCleanup, createEffect } from 'solid-js';
import { useGameStore } from '../store/gameStore';
import { TIMING } from '../constants';
import AudioPlayer from './AudioPlayer';
import FeedbackPopup from './FeedbackPopup';
import WrongTryPopup from './WrongTryPopup';
import { animate, stagger, spring } from "motion";

function GameModeTitleToTune() {
    const {
        currentTune, options, submitAnswer, score, round, streak,
        gameState, lastResult, nextRound, settings, timer, setTimer,
        triesLeft, skipRound, skipsLeft, failedOptionIds, showWrongTryPopup,
        setShowWrongTryPopup, isMusicPlaying, setIsMusicPlaying
    } = useGameStore();

    const [activeAudioId, setActiveAudioId] = createSignal(null);
    let timerInterval;

    const handleAnswer = (tuneId) => {
        setActiveAudioId(null);
        submitAnswer(tuneId);
    };

    onMount(() => {
        timerInterval = setInterval(() => {
            if (gameState() === 'playing') {
                if (settings().timeLimit > 0) {
                    if (timer() > 0) {
                        setTimer(t => Math.max(0, t - 1));
                    } else {
                        submitAnswer(null); // Time out only if limit > 0
                    }
                } else {
                    // Count up for difficulties with no limit (to measure speed)
                    setTimer(t => t + 1);
                }
            }
        }, TIMING.TIMER_INTERVAL);
    });

    onCleanup(() => clearInterval(timerInterval));

    createEffect(() => {
        const opts = options();
        if (opts.length > 0) {
            // New round started, reset audio
            setActiveAudioId(null);

            setTimeout(() => {
                animate(
                    ".answer-card",
                    { opacity: [0, 1] },
                    {
                        delay: stagger(0.1),
                        duration: 0.4
                    }
                );
            }, 50);
        }
    });

    // Sync local active audio with global playing state
    createEffect(() => {
        setIsMusicPlaying(!!activeAudioId());
    });

    // Stop audio when answered
    createEffect(() => {
        if (gameState() === 'answered') {
            setActiveAudioId(null);
        }
    });

    return (
        <div class="max-w-3xl w-full flex flex-col gap-6">
            {/* Scoreboard Area */}
            <div class="w-full bg-accent-sepia/90 border-b border-dark-sepia-ink/10 shadow-md rounded-xl overflow-hidden mb-4">
                <div class="flex items-center justify-around h-20 text-background-parchment px-4">
                    <div class="flex flex-col items-center">
                        <span class="material-symbols-outlined text-[24px] mb-1">trophy</span>
                        <span class="text-[10px] uppercase font-bold opacity-90">Score</span>
                        <span class="font-mono text-xl font-black">{score()}</span>
                    </div>
                    <div class="w-px h-10 bg-background-parchment/30"></div>
                    <div class="flex flex-col items-center">
                        <span class="material-symbols-outlined text-[24px] mb-1">flag</span>
                        <span class="text-[10px] uppercase font-bold opacity-90">Round</span>
                        <span class="font-mono text-xl font-black">{round()}/{settings().roundsCount}</span>
                    </div>
                    <div class="w-px h-10 bg-background-parchment/30"></div>
                    <div class="flex flex-col items-center">
                        <span class="material-symbols-outlined text-[24px] mb-1">timer</span>
                        <span class="text-[10px] uppercase font-bold opacity-90">{settings().timeLimit > 0 ? 'Time Left' : 'Time'}</span>
                        <span class="font-mono text-xl font-black">
                            {Math.floor(timer() / 60)}:{(timer() % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div class="w-px h-10 bg-background-parchment/30"></div>
                    <div class="flex flex-col items-center">
                        <span class="material-symbols-outlined text-orange-200 text-[24px] mb-1">local_fire_department</span>
                        <span class="text-[10px] uppercase font-bold opacity-90">Streak</span>
                        <span class="font-mono text-xl font-black">{streak()}</span>
                    </div>
                </div>
            </div>

            <div class="flex flex-col items-center justify-center mb-6 text-center">
                <p class="text-sm text-accent-sepia font-bold uppercase tracking-widest mb-2">Find the melody for:</p>
                <h2 class="text-4xl font-black text-dark-sepia-ink mb-1 uppercase">{currentTune()?.name}</h2>
                <div class="flex items-center gap-4">
                    <Show when={settings().maxTries > 1 && gameState() === 'playing'}>
                        <div class="text-xs font-bold text-accent-sepia">
                            Tries Left: {triesLeft()}
                        </div>
                    </Show>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 animate__animated animate__fadeIn">
                <For each={options()}>
                    {(tune, index) => {
                        const isFailed = () => failedOptionIds().includes(tune.id);
                        const isAnswered = () => gameState() === 'answered';
                        const isCorrect = () => tune.id === currentTune()?.id;
                        const isPlaying = () => activeAudioId() === tune.id;

                        return (
                            <div
                                onClick={() => !isAnswered() && !isFailed() && setActiveAudioId(isPlaying() ? null : tune.id)}
                                style={{ "animation-delay": `${index() * 100}ms` }}
                                classList={{
                                    'answer-card bg-background-parchment rounded-xl p-4 border-2 transition-all cursor-pointer': true,
                                    'border-green-500 bg-green-50 shadow-md scale-[1.02] z-10': isAnswered() && isCorrect(),
                                    'border-accent-sepia/5 opacity-60': isAnswered() && !isCorrect(),
                                    'border-red-200 bg-red-50 opacity-40 grayscale animate__animated animate__shakeX cursor-not-allowed': isFailed(),
                                    'bg-white shadow-xl animate-playing-breathe z-10 scale-[1.02]': isPlaying() && !isAnswered(),
                                    'border-accent-sepia/10 hover:border-primary/50 hover:bg-white hover:shadow-lg opacity-0 animate__animated animate__flipInX': !isPlaying() && !isFailed() && !isAnswered()
                                }}>
                                <div class="flex items-center justify-between gap-4">
                                    <div class="flex flex-col">
                                        <span class={`text-[11px] uppercase font-black transition-colors ${isPlaying() ? 'text-primary' : 'text-accent-sepia/40'}`}>
                                            {isPlaying() ? 'Now Playing' : isFailed() ? 'Failed' : isAnswered() ? (isCorrect() ? 'Winner' : 'Incorrect') : 'Click to Hear'}
                                        </span>
                                        <div class="flex items-center gap-2 mt-1">
                                            <div class={`size-2 rounded-full ${isPlaying() ? 'bg-primary animate-pulse' : 'bg-accent-sepia/20'}`}></div>
                                            <span class="text-sm font-bold text-dark-sepia-ink/80">Melody {index() + 1}</span>
                                        </div>
                                    </div>
                                    <div class="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <AudioPlayer
                                            abc={tune.abc}
                                            tuneKey={tune.key}
                                            tuneType={tune.type}
                                            showNotation={false}
                                            minimal={true}
                                            isPlaying={activeAudioId() === tune.id}
                                            onToggle={(playing) => {
                                                setActiveAudioId(playing ? tune.id : null);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                </For>
            </div>

            <div class="flex flex-col items-center gap-4 mb-10">
                <button
                    onClick={() => handleAnswer(activeAudioId())}
                    disabled={gameState() !== 'playing' || !activeAudioId()}
                    class={`group relative w-full max-w-sm h-16 rounded-2xl font-black text-xl uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${!activeAudioId() || gameState() !== 'playing'
                        ? 'bg-accent-sepia/10 text-accent-sepia/30 border-2 border-accent-sepia/5 cursor-not-allowed grayscale'
                        : 'bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] border-b-4 border-dark-sepia-ink/20'
                        }`}
                >
                    <span class={`material-symbols-outlined text-3xl transition-transform ${activeAudioId() ? 'group-hover:translate-x-1' : ''}`}>
                        {activeAudioId() ? 'task_alt' : 'lock'}
                    </span>
                    <span>Confirm Selection</span>
                    <Show when={activeAudioId()}>
                        <div class="absolute -top-1 -right-1 flex">
                            <span class="relative flex h-3 w-3">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                        </div>
                    </Show>
                </button>

                <Show when={gameState() === 'playing' && skipsLeft() > 0}>
                    <button
                        onClick={skipRound}
                        class="flex items-center gap-2 px-6 py-2 rounded-xl text-accent-sepia/60 hover:text-accent-sepia hover:bg-accent-sepia/5 transition-all text-xs font-bold uppercase tracking-widest group"
                    >
                        <span class="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">skip_next</span>
                        <span>Skip ({skipsLeft()})</span>
                    </button>
                </Show>
            </div>

            <Show when={gameState() === 'answered'}>
                <FeedbackPopup result={lastResult()} onNext={nextRound} />
            </Show>

            <Show when={showWrongTryPopup()}>
                <WrongTryPopup
                    triesLeft={triesLeft()}
                    onClose={() => setShowWrongTryPopup(false)}
                />
            </Show>
        </div>
    );
}

export default GameModeTitleToTune;
