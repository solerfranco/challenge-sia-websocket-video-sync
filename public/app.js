document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const video = document.getElementById('sync-video');
    const tempDisplay = document.getElementById('temperature-display');

    // Flag to prevent infinite broadcast loops when receiving an event from the server
    let isExternalEvent = false;

    video.addEventListener('play', () => {
        if (!isExternalEvent) socket.emit('play');
        isExternalEvent = false;
    });

    video.addEventListener('pause', () => {
        if (!isExternalEvent) socket.emit('pause');
        isExternalEvent = false;
    });

    video.addEventListener('seeked', () => {
        if (!isExternalEvent) socket.emit('seek', video.currentTime);
        isExternalEvent = false;
    });


    socket.on('play', () => {
        isExternalEvent = true;
        video.play();
    });

    socket.on('pause', () => {
        isExternalEvent = true;
        video.pause();
    });

    socket.on('seek', (time) => {
        isExternalEvent = true;
        video.currentTime = time;
    });

    // Placeholder function for Channel 2
    async function fetchTemperature() {
        try {
            // TODO: Replace placeholder with weather API
            tempDisplay.innerText = "24°C";
        } catch (error) {
            console.error("Error fetching weather:", error);
            tempDisplay.innerText = "Weather unavailable";
        }
    }

    fetchTemperature();
});