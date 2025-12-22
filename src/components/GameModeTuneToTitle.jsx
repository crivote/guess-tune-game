import { For, Show, onMount, onCleanup, createEffect } from 'solid-js';
import { useGameStore } from '../store/gameStore';
import AudioPlayer from './AudioPlayer';
import FeedbackPopup from './FeedbackPopup';
import WrongTryPopup from './WrongTryPopup';
import { animate, stagger, spring } from "motion";

function GameModeTuneToTitle() {
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

    // Animation Effect for Options
    createEffect(() => {
        const opts = options();
        if (opts.length > 0) {
            // Wait a tick for DOM update
            setTimeout(() => {
                animate(
                    ".answer-card",
                    { opacity: [0, 1], transform: ["translateY(20px)", "none"] },
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

            {/* Main Game Interface */}
            <div class="bg-background-parchment rounded-xl p-6 border-2 border-accent-sepia/10 w-full relative">
                <div class="relative z-10">
                    <div class="flex items-center gap-5 mb-5">
                        <div class="relative size-20 shrink-0 rounded-lg overflow-hidden bg-dark-sepia-ink shadow-inner border border-accent-sepia/30">
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="material-symbols-outlined text-primary/40 text-4xl">music_note</span>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="inline-flex items-center rounded-md bg-accent-sepia/10 px-2 py-0.5 text-xs font-medium text-accent-sepia ring-1 ring-inset ring-accent-sepia/20">Now Playing</span>
                            </div>
                            <h2 class="text-2xl font-bold text-dark-sepia-ink truncate uppercase">
                                {gameState() === 'answered' ? currentTune()?.name : 'Mystery Tune'}
                            </h2>
                        </div>
                    </div>

                    <Show when={currentTune()} keyed>
                        <AudioPlayer
                            abc={currentTune()?.abc}
                            tuneKey={currentTune()?.key}
                            tuneType={currentTune()?.type}
                            showNotation={false}
                            isPlaying={isMusicPlaying()}
                            onToggle={(playing) => setIsMusicPlaying(playing)}
                        />
                    </Show>
                </div>
            </div>

            <div class="w-full mt-4 flex flex-col">
                <div class="flex flex-col items-center justify-center mb-6 text-center">
                    <h2 class="text-xl font-bold text-dark-sepia-ink/50 uppercase tracking-widest text-sm">
                        {gameState() === 'playing' ? 'Identify this TUNE' : 'Check Results'}
                    </h2>
                    <Show when={settings().maxTries > 1 && gameState() === 'playing'}>
                        <div class="text-xs font-bold text-accent-sepia mt-1">
                            Tries Left: {triesLeft()}
                        </div>
                    </Show>
                </div>

                <div class="flex flex-col md:flex-row flex-wrap justify-center gap-4 mb-8">
                    <For each={options()}>
                        {(tune) => {
                            const isFailed = () => failedOptionIds().includes(tune.id);
                            return (
                                <button
                                    onClick={() => submitAnswer(tune.id)}
                                    disabled={gameState() === 'answered' || isFailed()}
                                    class={`answer-card opacity-0 relative group w-full md:w-[31%] min-h-[8rem] rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all active:scale-[0.95] hover:scale-[1.02] duration-200 ease-out ${gameState() === 'answered'
                                        ? tune.id === currentTune()?.id
                                            ? 'bg-green-100 border-green-500 text-green-800'
                                            : 'bg-surface-sepia/50 border-accent-sepia/10 opacity-60'
                                        : isFailed()
                                            ? 'bg-red-50 border-red-200 opacity-40 grayscale cursor-not-allowed'
                                            : 'bg-surface-sepia border-accent-sepia/20 hover:border-primary/50 hover:bg-surface-sepia/80 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <span class="text-lg font-bold text-dark-sepia-ink/90 leading-tight mb-1">{tune.name}</span>
                                    <Show when={tune.aliases?.length > 0}>
                                        <span class="text-xs text-text-charcoal/60 italic">aka {tune.aliases[0]}</span>
                                    </Show>
                                    <Show when={isFailed()}>
                                        <span class="absolute top-2 right-2 material-symbols-outlined text-red-500 text-sm">close</span>
                                    </Show>
                                </button>
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

export default GameModeTuneToTitle;
