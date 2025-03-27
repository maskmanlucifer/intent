/* eslint-disable no-undef */

let audio = new Audio();
audio.loop = true;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "play") {
        audio.pause(); // Pause any ongoing playback
        audio.src = request.url; // Set new audio source
        
        // Wait for audio to be ready before playing
        audio.oncanplay = () => {
            audio.play().catch(error => console.error("Playback failed:", error));
        };
        
        sendResponse({ success: true });
    }

    if (request.action === "pause") {
        audio.pause();
        sendResponse({ success: true });
    }
});
