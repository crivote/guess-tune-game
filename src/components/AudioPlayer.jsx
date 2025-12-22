import { createSignal, onMount, onCleanup, createEffect } from 'solid-js';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';
import { useGameStore } from '../store/gameStore';

// Utility function to preprocess ABC notation for abcjs
function preprocessABC(abc, key, type) {
    if (!abc) return '';

    // Replace ! symbols with proper line breaks
    let processedAbc = abc.replace(/!/g, '\n');

    const headers = [];
    if (type && !processedAbc.includes('R:')) headers.push(`R:${type}`);
    if (key && !processedAbc.includes('K:')) headers.push(`K:${key}`);

    if (headers.length > 0) {
        processedAbc = headers.join('\n') + '\n' + processedAbc;
    }

    console.log("--- Preprocess ABC ---");
    console.log("Processed ABC:", processedAbc);

    return processedAbc;
}

function AudioPlayer(props) {
    const { audioContext } = useGameStore();
    let synthControl;
    let visualObj;

    onCleanup(() => {
        if (synthControl) {
            synthControl.pause();
            synthControl.destroy();
        }
    });

    onMount(() => {
        // Initialize controller on mount
        synthControl = new abcjs.synth.SynthController();
        // Load into the DOM element normally
        // We render controls here intentionally now
        synthControl.load('#audio-player', null, {
            displayLoop: false,
            displayRestart: false,
            displayPlay: true,
            displayProgress: true,
            displayWarp: false
        });
    });

    createEffect(() => {
        const rawAbc = props.abc;
        if (!rawAbc || !synthControl) return;

        console.log("AudioPlayer effect triggered. New ABC received.");

        // Clear previous visual content explicitly
        const container = document.getElementById('abc-music-container');
        if (container) container.innerHTML = '';

        // Stop any current playback immediately
        synthControl.pause();

        const processedAbc = preprocessABC(rawAbc, props.tuneKey, props.tuneType);

        if (!container) return;

        // Render visually to the DOM 
        visualObj = abcjs.renderAbc(container, processedAbc, {
            add_classes: true,
            responsive: 'resize'
        })[0];

        if (!visualObj) {
            console.error("Failed to generate VisualObj");
            return;
        }

        console.log("VisualObj rendered. Lines:", visualObj.lines?.length);
        console.log("Initial Duration check:", visualObj.getTotalTime());

        // Initialize audio generation
        const setupAudio = async () => {
            const ac = audioContext();

            // Critical check: Don't try to use a closed or missing context
            if (!ac || ac.state === 'closed') {
                console.warn("AudioContext invalid or closed. Skipping setup.");
                return;
            }

            console.log("Setting up audio. Context present:", !!ac, "State:", ac.state);

            const midiBuffer = new abcjs.synth.CreateSynth();

            try {
                await midiBuffer.init({
                    visualObj: visualObj,
                    audioContext: ac,
                    options: {
                        chordsOff: true
                    }
                });

                await midiBuffer.prime();
                console.log("Buffer primed. Duration:", visualObj.getTotalTime());

                await synthControl.setTune(visualObj, false, {
                    audioContext: ac
                });

                if (props.isPlaying) {
                    synthControl.play();
                }

            } catch (err) {
                console.error("Audio setup error:", err);
            }
        };

        setupAudio();
    });

    // Watch playing state
    createEffect(() => {
        if (synthControl) {
            if (props.isPlaying) {
                synthControl.play();
            } else {
                synthControl.pause();
            }
        }
    });

    return (
        <div class="w-full flex flex-col items-center gap-4">
            {/* Controls area - Visible */}
            <div
                id="audio-player"
                class="w-full max-w-md bg-white/10 rounded-lg p-2"
                style={{ "min-height": "40px" }}
            ></div>

            {/* Sheet music - Hidden but rendered in DOM for internal calculations */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
                <div id="abc-music-container"></div>
            </div>
        </div>
    );
}

export default AudioPlayer;
