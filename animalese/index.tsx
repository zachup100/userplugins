import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { Logger as VencordLogger } from "@utils/Logger";
import { audioMap } from "./sounds";
import { mapping } from "./mapping"

const VERSION = "1.0"
const Logger = new VencordLogger("Animalese")
let keyListener: (event: KeyboardEvent) => void;

const settings = definePluginSettings({
    volume: {
        type: OptionType.SLIDER,
        markers: [0, 100],
        default: 70,
        stickToMarkers: false,
        description: "How loud the sound will be when typing"
    },
    narrateAlphabet: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "If the animal should narrate the English Alphabet (A-Z)"
    },
    narrateNumbers: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "If the animal should narrate the numbers (0-9)"
    },
    narrateOthers: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "If the animal should narrate Symbols (!, @, #, ...)"
    },
    speakingType: {
        type: OptionType.SELECT,
        options: [
            { label: "Masculine 1", value: "male_voice_1" },
            { label: "Masculine 2", value: "male_voice_2" },
            { label: "Masculine 3", value: "male_voice_3" },
            { label: "Masculine 4", value: "male_voice_4" },
            { label: "Feminine 1", value: "female_voice_1", default: true },
            { label: "Feminine 2", value: "female_voice_2" },
            { label: "Feminine 3", value: "female_voice_3" },
            { label: "Feminine 4", value: "female_voice_4" },
        ],
        description: "Which voice tone will play when typing"
    },
});

function keyPressed(input: string) {
    let key: string = "";
    const normalizedChar = input.toLowerCase();
    if (/^[a-z]$/.test(normalizedChar)) {
        if (settings.store.narrateAlphabet) {
            key = `${settings.store.speakingType}_${normalizedChar}`;
        }
    } else if (/^[0-9]$/.test(normalizedChar)) {
        if (settings.store.narrateNumbers) {
            key = `${settings.store.speakingType}_${normalizedChar}`;
        }
    } else {
        if (settings.store.narrateOthers) {
            key = parseKeyMap(input);
        }
    }

    const base64Audio = audioMap[key];
    if (!base64Audio) return;
    let audio = new Audio(base64Audio);
    audio.volume = settings.store.volume / 100;
    audio.play();
}

function parseKeyMap(input: string) {
    let result = "sfx_default"
    var arrayLength = mapping.length;

    for (var i = 0; i < arrayLength; i++) {
        if (mapping[i].key == input) {
            result = mapping[i].value
            break
        }
    }

    return result
}

export default definePlugin({
    name: "Animalese Typing",
    description: "Animal Crossing typing!",
    authors: [{ name: "zach", id: 180885949926998026n }],
    settings,

    start() {

        keyListener = (event: KeyboardEvent) => {
            const active = document.activeElement;
            const isTextInput = active && (active.tagName === "TEXTAREA" || active.getAttribute("role") === "textbox");

            if (!isTextInput) return;
            if (event.key.length === 1) { keyPressed(event.key); }
        };

        document.addEventListener("keydown", keyListener);
        Logger.log(`Ready to start speaking Animalese! [Version ${VERSION}]`)
    },

    stop() {
        document.removeEventListener("keydown", keyListener);
        Logger.log("See you next time! (Plugin stopped)")
    }
});