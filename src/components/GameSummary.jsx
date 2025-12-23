import { For } from 'solid-js';
import { useGameStore } from '../store/gameStore';

export default function GameSummary() {
    const { score, maxStreak, settings, backToMenu, startNewGame, gameMode, sessionResults } = useGameStore();

    return (
        <div class="max-w-3xl w-full flex flex-col items-center py-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Compact Header with Stats */}
            <div class="w-full bg-dark-sepia-ink border border-white/10 rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between text-background-parchment shadow-xl gap-4">
                <div class="flex items-center gap-4">
                    <div class="bg-primary size-10 rounded-lg flex items-center justify-center text-dark-sepia-ink">
                        <span class="material-symbols-outlined font-black">emoji_events</span>
                    </div>
                    <div>
                        <p class="text-primary/60 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Difficulty</p>
                        <p class="text-lg font-black leading-none">{settings().name}</p>
                    </div>
                </div>

                <div class="h-8 w-px bg-white/10 hidden sm:block"></div>

                <div class="flex-1 min-w-[120px]">
                    <p class="text-primary/60 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Mode</p>
                    <p class="text-base font-bold capitalize leading-none">{gameMode().replace(/-/g, ' ')}</p>
                </div>

                <div class="flex items-center gap-8">
                    <div class="text-center">
                        <p class="text-primary/60 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Final Score</p>
                        <p class="text-2xl font-black text-primary leading-none tabular-nums">{score()}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-primary/60 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Best Streak</p>
                        <p class="text-2xl font-black leading-none tabular-nums">{maxStreak()}</p>
                    </div>
                </div>
            </div>

            <h1 class="text-3xl font-black text-dark-sepia-ink mb-1">Game Complete!</h1>
            <p class="text-text-charcoal/40 text-sm font-bold uppercase tracking-widest mb-8">Performance Summary</p>

            {/* Tune Recap List */}
            <div class="w-full flex flex-col gap-3 mb-10">
                <h2 class="text-xs font-black text-accent-sepia uppercase tracking-widest mb-1 px-2">Round Recap</h2>
                <For each={sessionResults()}>
                    {(res, index) => (
                        <div
                            class={`flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all shadow-sm ${res.correct
                                ? 'bg-green-50/50 border-green-200/50'
                                : 'bg-red-50/50 border-red-200/50'
                                }`}
                        >
                            <div class={`size-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs mt-1 sm:mt-0 ${res.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                {index() + 1}
                            </div>

                            <div class="flex-grow min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                                <div class="flex-grow min-w-0">
                                    <a
                                        href={`https://thesession.org/tunes/${res.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class={`font-bold truncate hover:underline flex items-center gap-2 group/link cursor-pointer w-fit ${res.correct ? 'text-green-900' : 'text-red-900'}`}
                                    >
                                        {res.name}
                                        <span class="material-symbols-outlined text-[10px] opacity-0 group-hover/link:opacity-100 transition-opacity">open_in_new</span>
                                    </a>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="text-[10px] font-bold text-accent-sepia/70 uppercase">{res.type}</span>
                                        <span class="text-[10px] text-accent-sepia/40">•</span>
                                        <span class="text-[10px] font-medium text-text-charcoal/50">Key: {res.key || 'N/A'}</span>
                                    </div>
                                </div>

                                <div class="flex items-center gap-8 sm:gap-6 shrink-0 border-t border-black/5 sm:border-0 pt-2 sm:pt-0">
                                    <div class="flex flex-col sm:items-end">
                                        <div class="text-[9px] font-bold text-accent-sepia/60 uppercase mb-0.5">Popularity</div>
                                        <div class="text-xs font-black text-dark-sepia-ink">#{res.rank}</div>
                                    </div>

                                    <div class="flex flex-col sm:items-end min-w-[60px]">
                                        <div class="text-[9px] font-bold text-accent-sepia/60 uppercase mb-0.5">Points</div>
                                        <div class={`text-sm font-black ${res.correct ? 'text-green-600' : 'text-red-400'}`}>
                                            {res.points > 0 ? `+${res.points}` : '0'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </For>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 w-full">
                <button
                    onClick={() => startNewGame(gameMode())}
                    class="flex-[2] bg-primary hover:bg-primary/90 text-dark-sepia-ink font-black text-xl py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <span class="material-symbols-outlined font-bold">replay</span>
                    Play Again
                </button>
                <button
                    onClick={backToMenu}
                    class="flex-1 bg-surface-sepia border-2 border-accent-sepia/20 text-accent-sepia font-black text-xl py-6 rounded-2xl hover:bg-white/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <span class="material-symbols-outlined font-bold">menu</span>
                    Menu
                </button>
            </div>
        </div >
    );
}
