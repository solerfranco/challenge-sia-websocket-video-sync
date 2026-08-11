document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const video = document.getElementById('sync-video');
    const tempDisplay = document.getElementById('temperature-display');
    const weatherIcon = document.getElementById('weather-icon');

    const weatherContent = document.querySelector('.weather-widget__content');
    const weatherLoading = document.querySelector('.weather-widget__loading');
    const weatherError = document.querySelector('.weather-widget__error');

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
            
            weatherLoading.style.display = 'block';
            weatherContent.style.display = 'none';
            weatherError.style.display = 'none';
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const temp = data.current_weather.temperature;

            setWeatherIcon(data.current_weather.weathercode);
            tempDisplay.innerText = `${temp}`;

            weatherLoading.style.display = 'none';
            weatherContent.style.display = 'flex';
            
        } catch (error) {
            console.error("Error fetching weather:", error);
            tempDisplay.innerText = "Weather unavailable";

            weatherLoading.style.display = 'none';
            weatherError.style.display = 'block';
            
        }
    }

    function setWeatherIcon(weatherCode) {
        weatherIcon.innerHTML = `<i class="${getWeatherIcon(weatherCode)}"></i>`;
    }

    fetchTemperature();

    //To avoid having an outdated temperature value, i refresh it every 30 minutes

    //In case having multiple clients doing this API call causes an issue with rate limiting or unnesesary costs
    //then this could be replaced with something like SSE subscribing on page load and getting the temperature sent from the server
    setInterval(() => {
        fetchTemperature();
    }, 1800000);
});


function getWeatherIcon(weatherCode) {
    if (weatherCode === 0) {
        return "fa-solid fa-sun";
    }

    if ([1, 2].includes(weatherCode)) {
        return "fa-solid fa-cloud-sun";
    }

    if (weatherCode === 3) {
        return "fa-solid fa-cloud";
    }

    if ([45, 48].includes(weatherCode)) {
        return "fa-solid fa-smog";
    }

    if ([51, 53, 55, 56, 57].includes(weatherCode)) {
        return "fa-solid fa-cloud-rain";
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
        return "fa-solid fa-cloud-showers-heavy";
    }

    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
        return "fa-solid fa-snowflake";
    }

    if ([95, 96, 99].includes(weatherCode)) {
        return "fa-solid fa-cloud-bolt";
    }

    return "fa-solid fa-cloud";
}