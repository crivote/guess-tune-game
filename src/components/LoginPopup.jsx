import { createSignal } from 'solid-js';
import { useGameStore } from '../store/gameStore';

export default function LoginPopup(props) {
    const { updateUserName } = useGameStore();
    const [username, setUsername] = createSignal('');
    const [hasConsent, setHasConsent] = createSignal(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username().trim() && hasConsent()) {
            updateUserName(username().trim(), true);
            props.onClose();
        }
    };

    return (
        <div class="fixed inset-0 bg-dark-sepia-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-surface-sepia rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-accent-sepia/20 animate-in zoom-in-95 duration-200">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold text-dark-sepia-ink">Login</h2>
                    <button
                        onClick={props.onClose}
                        class="text-accent-sepia hover:text-dark-sepia-ink transition-colors"
                    >
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} class="space-y-4">
                    <div>
                        <label for="username" class="block text-sm font-semibold text-dark-sepia-ink mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username()}
                            onInput={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            class="w-full px-4 py-2 rounded-lg border-2 border-accent-sepia/20 bg-white/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            required
                        />
                    </div>

                    <div class="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h3 class="text-sm font-bold text-dark-sepia-ink mb-2 flex items-center gap-2">
                            <span class="material-symbols-outlined text-lg">info</span>
                            Privacy Notice
                        </h3>
                        <ul class="text-xs text-text-charcoal/70 space-y-1 mb-3">
                            <li>• No data travels outside your device</li>
                            <li>• All progress stored in browser's localStorage</li>
                            <li>• Progress will be lost if you clear browser data</li>
                            <li>• You can logout anytime to clear your data</li>
                        </ul>

                        <label class="flex items-start gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={hasConsent()}
                                onChange={(e) => setHasConsent(e.target.checked)}
                                class="mt-0.5 size-4 rounded border-2 border-accent-sepia/40 text-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <span class="text-xs text-dark-sepia-ink font-medium group-hover:text-primary transition-colors">
                                I understand and consent to storing my data in localStorage
                            </span>
                        </label>
                    </div>

                    <div class="flex gap-3">
                        <button
                            type="button"
                            onClick={props.onClose}
                            class="flex-1 px-4 py-2 rounded-lg border-2 border-accent-sepia/20 text-accent-sepia hover:bg-accent-sepia/10 transition-all font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!username().trim() || !hasConsent()}
                            class="flex-1 px-4 py-2 rounded-lg bg-primary text-dark-sepia-ink font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
