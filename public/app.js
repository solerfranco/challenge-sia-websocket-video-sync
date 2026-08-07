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