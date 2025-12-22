import { For } from 'solid-js';
import { useGameStore, DIFFICULTIES } from '../store/gameStore';

export default function DifficultySelector(props) {
    const { settings, applyPreset } = useGameStore();

    return (
        <div class="w-full max-w-2xl mx-auto mb-10 p-6 bg-surface-sepia/30 rounded-2xl border border-accent-sepia/20 backdrop-blur-sm">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <For each={Object.values(DIFFICULTIES)}>
                    {(diff) => (
                        <button
                            onClick={() => applyPreset(diff.id)}
                            class={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center group ${settings().id === diff.id
                                ? 'bg-primary/10 border-primary ring-1 ring-primary/20'
                                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-accent-sepia/30'
                                }`}
                        >
                            <div class={`size-10 rounded-lg flex items-center justify-center mb-3 ${settings().id === diff.id ? 'bg-primary text-dark-sepia-ink' : 'bg-surface-sepia text-accent-sepia'
                                }`}>
                                <span class="material-symbols-outlined text-2xl">
                                    {diff.id === 'EASY' ? 'thumb_up' : diff.id === 'MEDIUM' ? 'bolt' : diff.id === 'HARD' ? 'whatshot' : 'settings'}
                                </span>
                            </div>
                            <h3 class="font-bold text-dark-sepia-ink mb-1">{diff.name} {diff.id === 'CUSTOM' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); props.onOpenSettings(); }}
                                    class="material-symbols-outlined text-sm inline-block align-middle ml-1 text-accent-sepia hover:text-dark-sepia-ink"
                                >
                                    settings
                                </button>
                            )}</h3>
                            <div class="text-[10px] uppercase tracking-wider font-bold text-accent-sepia/60">
                                {diff.numOptions} Options • {diff.roundsCount} Rounds
                            </div>
                            <div class="text-[10px] font-medium text-accent-sepia/40 mt-1">
                                {diff.poolFilters.topN === 200 ? 'Top 200 Popular Tunes' :
                                    diff.poolFilters.topN === 500 ? 'Top 500 Popular Tunes' :
                                        diff.poolFilters.topN === 100 ? 'Top 100 Popular Tunes' :
                                            'All Tunes (~1500)'}
                            </div>

                            {settings().id === diff.id && (
                                <div class="absolute -top-2 -right-2 bg-primary text-dark-sepia-ink size-5 rounded-full flex items-center justify-center animate-in zoom-in-0 duration-200">
                                    <span class="material-symbols-outlined text-xs font-bold">check</span>
                                </div>
                            )}
                        </button>
                    )}
                </For>
            </div>

            <div class="mt-6 p-4 bg-dark-sepia-ink/5 rounded-lg border border-dark-sepia-ink/5">
                <div class="flex flex-wrap justify-between gap-4 text-xs font-medium text-text-charcoal/60">
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">psychology</span>
                        <span>{settings().maxTries} {settings().maxTries === 1 ? 'Try' : 'Tries'} per round</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">timer</span>
                        <span>{settings().timeLimit > 0 ? `${settings().timeLimit}s` : 'No'} limit</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">rule</span>
                        <span>Penalty: {settings().penalty || 0} pts</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
