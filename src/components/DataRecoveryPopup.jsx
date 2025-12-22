import { createSignal } from 'solid-js';
import { useGameStore } from '../store/gameStore';

export default function DataRecoveryPopup(props) {
    const { loginWithSavedData, skipDataRecovery } = useGameStore();
    const [persist, setPersist] = createSignal(false);

    const handleRetrieve = () => {
        loginWithSavedData(persist());
        props.onClose();
    };

    const handleSkip = () => {
        skipDataRecovery(persist());
        props.onClose();
    };

    return (
        <div class="fixed inset-0 bg-dark-sepia-ink/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 text-display">
            <div class="bg-surface-sepia rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-accent-sepia/20 animate-in zoom-in-95 duration-200 text-center">
                <div class="size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6">
                    <span class="material-symbols-outlined text-4xl">account_circle</span>
                </div>
                <h2 class="text-2xl font-bold text-dark-sepia-ink mb-2">Welcome Back!</h2>
                <p class="text-text-charcoal/70 mb-8">
                    We found saved progress from your previous session. Would you like to retrieve it and continue where you left off?
                </p>

                <div class="flex flex-col gap-4">
                    <button
                        onClick={handleRetrieve}
                        class="w-full bg-primary text-dark-sepia-ink font-bold py-3 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span class="material-symbols-outlined">restore</span>
                        Retrieve My Data
                    </button>

                    <button
                        onClick={handleSkip}
                        class="w-full bg-white/50 text-accent-sepia font-semibold py-3 px-6 rounded-xl border-2 border-accent-sepia/10 hover:bg-white/80 transition-all font-display"
                    >
                        Stay Anonymous
                    </button>
                </div>

                <div class="mt-6 pt-6 border-t border-accent-sepia/10">
                    <label class="flex items-center justify-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={persist()}
                            onChange={(e) => setPersist(e.target.checked)}
                            class="size-5 rounded border-2 border-accent-sepia/40 text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <span class="text-sm text-dark-sepia-ink font-semibold group-hover:text-primary transition-colors">
                            Stay logged in for this app
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}
