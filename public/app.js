document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const video = document.getElementById('sync-video');
    const tempDisplay = document.getElementById('temperature-display');

    // Flag to prevent infinite broadcast loops when receiving an event from the server
    let isExternalEvent = false;
    
    socket.on('initSync', (data) => {
        isExternalEvent = true;
        video.currentTime = data.currentTime;

        if (data.isPlaying) {
            let playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay blocked on initial load:", error);
                });
            }
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', () => {
        if (!isExternalEvent) socket.emit('play', video.currentTime);
        isExternalEvent = false;
    });

    video.addEventListener('pause', () => {
        if (!isExternalEvent) socket.emit('pause', video.currentTime);
        isExternalEvent = false;
    });

    video.addEventListener('seeked', () => {
        if (!isExternalEvent) socket.emit('seek', video.currentTime);
        isExternalEvent = false;
    });

    socket.on('play', (time) => {
        isExternalEvent = true;
        if (typeof time === 'number') video.currentTime = time;
        let playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay blocked:", error);
            });
        }
    });

    socket.on('pause', (time) => {
        isExternalEvent = true;
        if (typeof time === 'number') video.currentTime = time;
        video.pause();
    });

    socket.on('seek', (time) => {
        isExternalEvent = true;
        video.currentTime = time;
    });

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