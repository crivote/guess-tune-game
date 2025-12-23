import { onMount, onCleanup, Show, createSignal } from 'solid-js';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTIES } from '../constants';

export default function SettingsPopup(props) {
    const { settings, updateSettings } = useGameStore();
    const [localSettings, setLocalSettings] = createSignal({ ...settings() });

    const handleSave = () => {
        updateSettings(localSettings());
        props.onClose();
    };

    return (
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                class="absolute inset-0 bg-dark-sepia-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={props.onClose}
            ></div>

            <div class="relative w-full max-w-lg bg-background-parchment border-2 border-accent-sepia/30 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div class="flex items-center justify-between p-6 border-b border-accent-sepia/10 bg-surface-sepia/50">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-accent-sepia">settings</span>
                        <h2 class="text-xl font-bold text-dark-sepia-ink uppercase tracking-tight">Custom Challenge</h2>
                    </div>
                    <button onClick={props.onClose} class="text-accent-sepia hover:text-dark-sepia-ink transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* General Settings */}
                    <div class="grid grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-xs uppercase font-black text-accent-sepia/60">Options Per Round</label>
                            <input
                                type="number"
                                value={localSettings().numOptions}
                                onInput={(e) => setLocalSettings(s => ({ ...s, numOptions: parseInt(e.target.value) }))}
                                min="2" max="10"
                                class="w-full bg-surface-sepia/50 border-2 border-accent-sepia/10 rounded-lg p-3 font-mono font-bold focus:border-primary outline-none"
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs uppercase font-black text-accent-sepia/60">Tries Per Round</label>
                            <input
                                type="number"
                                value={localSettings().maxTries}
                                onInput={(e) => setLocalSettings(s => ({ ...s, maxTries: parseInt(e.target.value) }))}
                                min="1" max="5"
                                class="w-full bg-surface-sepia/50 border-2 border-accent-sepia/10 rounded-lg p-3 font-mono font-bold focus:border-primary outline-none"
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs uppercase font-black text-accent-sepia/60">Rounds to Win</label>
                            <input
                                type="number"
                                value={localSettings().roundsCount}
                                onInput={(e) => setLocalSettings(s => ({ ...s, roundsCount: parseInt(e.target.value) }))}
                                min="1" max="100"
                                class="w-full bg-surface-sepia/50 border-2 border-accent-sepia/10 rounded-lg p-3 font-mono font-bold focus:border-primary outline-none"
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs uppercase font-black text-accent-sepia/60">Time Limit (sec)</label>
                            <input
                                type="number"
                                value={localSettings().timeLimit}
                                onInput={(e) => setLocalSettings(s => ({ ...s, timeLimit: parseInt(e.target.value) }))}
                                min="0" max="300"
                                class="w-full bg-surface-sepia/50 border-2 border-accent-sepia/10 rounded-lg p-3 font-mono font-bold focus:border-primary outline-none"
                            />
                            <p class="text-[10px] text-accent-sepia/50 italic">Set to 0 for no limit</p>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs uppercase font-black text-accent-sepia/60">Max Skips</label>
                            <input
                                type="number"
                                value={localSettings().maxSkips}
                                onInput={(e) => setLocalSettings(s => ({ ...s, maxSkips: parseInt(e.target.value) }))}
                                min="0" max="10"
                                class="w-full bg-surface-sepia/50 border-2 border-accent-sepia/10 rounded-lg p-3 font-mono font-bold focus:border-primary outline-none"
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs uppercase font-black text-accent-sepia/60">Mistake Penalty</label>
                            <input
                                type="number"
                                value={localSettings().penalty}
                                onInput={(e) => setLocalSettings(s => ({ ...s, penalty: parseInt(e.target.value) }))}
                                max="0"
                                class="w-full bg-surface-sepia/50 border-2 border-accent-sepia/10 rounded-lg p-3 font-mono font-bold focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Tune Filters Section */}
                    <div class="space-y-3 pt-4 border-t border-accent-sepia/10">
                        <label class="text-xs uppercase font-black text-accent-sepia/60">Tune Types</label>
                        <div class="bg-surface-sepia/50 p-4 rounded-xl border-2 border-accent-sepia/5">
                            <p class="text-xs text-text-charcoal/60 mb-3">Select allowed types (Empty = All allowed)</p>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {['reel', 'jig', 'slip jig', 'hornpipe', 'polka', 'slide', 'waltz', 'barndance', 'strathspey', 'mazurka'].map(type => (
                                    <label class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/40 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={localSettings().filters?.includedTypes?.includes(type)}
                                            onChange={(e) => {
                                                const current = localSettings().filters?.includedTypes || [];
                                                let newTypes;
                                                if (e.target.checked) {
                                                    newTypes = [...current, type];
                                                } else {
                                                    newTypes = current.filter(t => t !== type);
                                                }
                                                // Ensure nested structure exists
                                                const prevFilters = localSettings().filters || {};
                                                setLocalSettings(s => ({
                                                    ...s,
                                                    filters: { ...prevFilters, includedTypes: newTypes }
                                                }));
                                            }}
                                            class="size-4 accent-primary rounded"
                                        />
                                        <span class="text-sm capitalize text-dark-sepia-ink font-medium">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-surface-sepia/80 border-t border-accent-sepia/10 flex flex-wrap gap-4 justify-between items-center">
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to wipe all progress and history? This cannot be undone.')) {
                                useGameStore().resetData();
                            }
                        }}
                        class="text-xs font-bold text-red-400 hover:text-red-500 hover:underline uppercase tracking-wide mr-auto"
                    >
                        Reset Data
                    </button>

                    <div class="flex gap-4">
                        <button
                            onClick={props.onClose}
                            class="py-4 px-6 rounded-xl border-2 border-accent-sepia/20 text-accent-sepia font-bold hover:bg-white/50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            class="py-4 px-6 rounded-xl bg-primary text-dark-sepia-ink font-black hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
