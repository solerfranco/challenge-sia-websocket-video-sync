document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const video = document.getElementById('sync-video');
    const tempDisplay = document.getElementById('temperature-display');

    let ignoreNextPlay = false;
    let ignoreNextPause = false;
    let ignoreNextSeek = false;

    socket.on('initSync', (data) => {
        ignoreNextSeek = true;
        video.currentTime = data.currentTime;

        if (data.isPlaying && video.paused) {
            ignoreNextPlay = true;
            let playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    ignoreNextPlay = false;
                    console.warn("Autoplay blocked on initial load:", error);
                });
            }
        } else if (!data.isPlaying && !video.paused) {
            ignoreNextPause = true;
            video.pause();
        }
    });

    video.addEventListener('play', () => {
        if (ignoreNextPlay) {
            ignoreNextPlay = false;
            return;
        }
        socket.emit('play', video.currentTime);
    });

    video.addEventListener('pause', () => {
        if (ignoreNextPause) {
            ignoreNextPause = false;
            return;
        }
        socket.emit('pause', video.currentTime);
    });

    video.addEventListener('seeked', () => {
        if (ignoreNextSeek) {
            ignoreNextSeek = false;
            return;
        }
        socket.emit('seek', video.currentTime);
    });

    
    socket.on('play', (time) => {
        if (typeof time === 'number' && Math.abs(video.currentTime - time) > 0.5) {
            ignoreNextSeek = true;
            video.currentTime = time;
        }
        if (video.paused) {
            ignoreNextPlay = true;
            let playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    ignoreNextPlay = false;
                    console.warn("Autoplay blocked:", error);
                });
            }
        }
    });

    socket.on('pause', (time) => {
        if (typeof time === 'number' && Math.abs(video.currentTime - time) > 0.5) {
            ignoreNextSeek = true;
            video.currentTime = time;
        }
        if (!video.paused) {
            ignoreNextPause = true;
            video.pause();
        }
    });

    socket.on('seek', (time) => {
        if (Math.abs(video.currentTime - time) > 0.5) {
            ignoreNextSeek = true;
            video.currentTime = time;
        }
    });

    async function fetchTemperature() {
        try {
            // Coordinates set to Buenos Aires.
            const url = 'https://api.open-meteo.com/v1/forecast?latitude=-34.61&longitude=-58.38&current_weather=true';
            
            tempDisplay.innerText = "Loading...";
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const temp = data.current_weather.temperature;
            
            tempDisplay.innerText = `${temp}°C in Buenos Aires`;
            
        } catch (error) {
            console.error("Error fetching weather:", error);
            tempDisplay.innerText = "Weather unavailable";
        }
    }

    fetchTemperature();
});