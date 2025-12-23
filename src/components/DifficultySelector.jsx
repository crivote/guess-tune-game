import { For, createSignal, Show } from 'solid-js';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTIES } from '../constants';

export default function DifficultySelector(props) {
    const { settings, applyPreset, isDifficultyUnlocked, getUnlockProgress, isLoggedIn } = useGameStore();
    const [lastClicked, setLastClicked] = createSignal(null);

    const handleDiffClick = (id) => {
        if (!isDifficultyUnlocked(id)) return;
        applyPreset(id);
        setLastClicked(id);
        setTimeout(() => setLastClicked(null), 600);
    };

    // Only show main progression difficulties (exclude CUSTOM)
    const mainDifficulties = [
        DIFFICULTIES.BEGINNER,
        DIFFICULTIES.BASIC,
        DIFFICULTIES.MEDIUM,
        DIFFICULTIES.HARD
    ];

    const getDifficultyIcon = (diffId) => {
        switch (diffId) {
            case 'BEGINNER': return 'school';
            case 'BASIC': return 'thumb_up';
            case 'MEDIUM': return 'bolt';
            case 'HARD': return 'whatshot';
            default: return 'settings';
        }
    };

    console.log(settings());
    return (
        <div class="w-full max-w-2xl mx-auto mb-10 p-6 bg-surface-sepia/30 rounded-2xl border border-accent-sepia/20 backdrop-blur-sm">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <For each={mainDifficulties}>
                    {(diff) => {
                        return (
                            <button
                                onClick={() => handleDiffClick(diff.id)}
                                disabled={!isDifficultyUnlocked(diff.id)}
                                class={`relative group p-4 rounded-xl border-2 transition-all duration-300 ease-out flex flex-col items-center text-center ${!isDifficultyUnlocked(diff.id)
                                    ? 'bg-white/5 border-transparent cursor-not-allowed'
                                    : settings().id === diff.id
                                        ? 'bg-primary/10 border-primary ring-1 ring-primary/20 hover:scale-110 z-20'
                                        : 'bg-white/35 border-transparent hover:bg-white/10 hover:border-accent-sepia/30 hover:scale-110 z-20'
                                    } ${lastClicked() === diff.id ? 'animate-quick-flash' : ''}`}
                            >
                                {/* Tooltip Info */}
                                <Show when={isDifficultyUnlocked(diff.id)}>
                                    <div class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-3 bg-dark-sepia-ink text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-2xl border border-white/10 translate-y-2 group-hover:translate-y-0">
                                        <div class="space-y-1.5">
                                            <div class="flex items-center gap-2">
                                                <span class="material-symbols-outlined text-xs text-primary">psychology</span>
                                                <span>{diff.maxTries} {diff.maxTries === 1 ? 'Try' : 'Tries'} / round</span>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <span class="material-symbols-outlined text-xs text-primary">timer</span>
                                                <span>{diff.timeLimit > 0 ? `${diff.timeLimit}s` : 'No'} limit</span>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <span class="material-symbols-outlined text-xs text-primary">list</span>
                                                <span>{diff.poolFilters?.topN ? `Top ${diff.poolFilters.topN}` : 'All'} tunes</span>
                                            </div>
                                            <div class="flex items-center gap-2 text-red-300">
                                                <span class="material-symbols-outlined text-xs">rule</span>
                                                <span>Penalty: {diff.penalty || 0} pts</span>
                                            </div>
                                        </div>
                                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-dark-sepia-ink rotate-180"></div>
                                    </div>
                                </Show>

                                {/* Lock overlay for locked difficulties */}
                                <Show when={!isDifficultyUnlocked(diff.id)}>
                                    <>
                                        {/* White blur background */}
                                        <div class="absolute inset-0 bg-white/75 rounded-xl z-10 drop-shadow-md" />
                                        {/* Golden lock icon on top */}
                                        <div class="absolute -translate-y-4 inset-0 flex flex-col items-center justify-center z-20 gap-1">
                                            <span class="material-symbols-outlined text-4xl text-yellow-600" style="font-variation-settings: 'FILL' 1, 'wght' 600">
                                                lock
                                            </span>
                                        </div>
                                    </>
                                </Show>

                                <div class={`size-10 rounded-lg flex items-center justify-center mb-3 ${settings().id === diff.id ? 'bg-primary text-dark-sepia-ink' : 'bg-surface-sepia text-accent-sepia'
                                    }`}>
                                    <span class="material-symbols-outlined text-2xl">
                                        {getDifficultyIcon(diff.id)}
                                    </span>
                                </div>
                                <h3 class="font-bold text-dark-sepia-ink mb-1">{diff.name}</h3>
                                <div class="text-[10px] uppercase tracking-wider font-bold text-accent-sepia/60">
                                    {diff.numOptions} Options
                                    <br />
                                    {diff.roundsCount} Rounds
                                </div>

                                {/* Progress bar or Login badge for locked difficulties */}
                                <Show when={!isDifficultyUnlocked(diff.id)}>
                                    <div class="w-full mt-3 relative z-30">
                                        <Show when={isLoggedIn()} fallback={
                                            <div class="flex flex-col items-center">
                                                <span class="text-[9px] font-black text-dark-sepia-ink uppercase tracking-tighter bg-primary px-2 py-1 rounded shadow-sm">
                                                    Login to Unlock
                                                </span>
                                            </div>
                                        }>
                                            <div class="h-1.5 bg-dark-sepia-ink/10 rounded-full overflow-hidden">
                                                <div
                                                    class="h-full bg-gradient-to-r from-accent-sepia to-primary transition-all duration-300"
                                                    style={{ width: `${getUnlockProgress(diff.id)}%` }}
                                                />
                                            </div>
                                            <div class="text-[9px] text-dark-sepia-ink/70 mt-1 font-semibold">
                                                {Math.round(getUnlockProgress(diff.id))}% to unlock
                                            </div>
                                        </Show>
                                    </div>
                                </Show>

                                {/* Unlocked badge */}
                                <Show when={isDifficultyUnlocked(diff.id) && getUnlockProgress(diff.id) >= 100 && diff.id !== 'BEGINNER'}>
                                    <div class="text-[9px] text-primary/70 mt-2 font-semibold">
                                        ✓ Unlocked
                                    </div>
                                </Show>

                                <Show when={settings().id === diff.id}>
                                    <div class="absolute -top-2 -right-2 bg-primary text-dark-sepia-ink size-5 rounded-full flex items-center justify-center animate-in zoom-in-0 duration-200">
                                        <span class="material-symbols-outlined text-xs font-bold">check</span>
                                    </div>
                                </Show>
                            </button>
                        );
                    }}
                </For>
            </div>
        </div>
    );
}
