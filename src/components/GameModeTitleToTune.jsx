import { For, createSignal, Show, onMount, onCleanup, createEffect } from 'solid-js';
import { useGameStore } from '../store/gameStore';
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

    let timerInterval;

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
        }, 1000);
    });

    onCleanup(() => clearInterval(timerInterval));

    createEffect(() => {
        const opts = options();
        if (opts.length > 0) {
            setTimeout(() => {
                animate(
                    ".answer-card",
                    { opacity: [0, 1], transform: ["translateX(-20px)", "none"] },
                    {
                        delay: stagger(0.1),
                        duration: 0.4,
                        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)"
                    }
                );
            }, 50);
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

            <div class="grid grid-cols-1 gap-4 mb-8">
                <For each={options()}>
                    {(tune, index) => {
                        const isFailed = () => failedOptionIds().includes(tune.id);
                        return (
                            <div class={`answer-card opacity-0 bg-background-parchment rounded-xl p-4 border-2 transition-all ${gameState() === 'answered'
                                ? tune.id === currentTune()?.id
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-accent-sepia/5 opacity-60'
                                : isFailed()
                                    ? 'border-red-200 bg-red-50 opacity-40 grayscale'
                                    : 'border-accent-sepia/10'
                                }`}>
                                <div class="flex items-center gap-4">
                                    <div class="flex-grow">
                                        <AudioPlayer
                                            abc={tune.abc}
                                            tuneKey={tune.key}
                                            tuneType={tune.type}
                                            showNotation={false}
                                            isPlaying={isMusicPlaying() && currentTune()?.id === tune.id}
                                            onToggle={(playing) => {
                                                if (playing) setIsMusicPlaying(true);
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => submitAnswer(tune.id)}
                                        disabled={gameState() === 'answered' || isFailed()}
                                        class={`h-14 px-6 rounded-lg font-bold transition-all active:scale-95 ${gameState() === 'answered'
                                            ? tune.id === currentTune()?.id
                                                ? 'bg-green-600 text-white'
                                                : 'bg-surface-sepia/50 text-text-charcoal/40'
                                            : isFailed()
                                                ? 'bg-red-400 text-white cursor-not-allowed'
                                                : 'bg-primary text-dark-sepia-ink hover:bg-primary/90'
                                            }`}
                                    >
                                        {gameState() === 'answered'
                                            ? tune.id === currentTune()?.id ? 'Correct' : 'Option ' + (index() + 1)
                                            : isFailed() ? 'Failed' : 'Choose This'}
                                    </button>
                                </div>
                            </div>
                        );
                    }}
                </For>
            </div>

            <Show when={gameState() === 'playing' && skipsLeft() > 0}>
                <div class="flex justify-center">
                    <button
                        onClick={skipRound}
                        class="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-sepia border-2 border-accent-sepia/20 text-accent-sepia hover:text-dark-sepia-ink hover:border-primary transition-all text-sm font-black uppercase tracking-widest shadow-sm group"
                    >
                        <span class="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">skip_next</span>
                        <span>Skip Round ({skipsLeft()} Left)</span>
                    </button>
                </div>
            </Show>

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
