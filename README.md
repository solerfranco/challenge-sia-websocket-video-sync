# Real-Time WebSocket Video Player

A full-stack JavaScript application that allows connected clients to synchronize video playback (play, pause) in real-time.

## Prerequisites
- Node.js
- NPM or Yarn

## Local Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/solerfranco/challenge-sia-websocket-video-sync.git
    cd websocket-video-sync

2. Install dependencies:
    ```bash
    npm install

3. Start the server:
    ```bash
    npm run start

4. Open your browser and navigate to http://localhost:3000.

## Technical Note: Autoplay Policies & Muted Video
To ensure a seamless synchronization experience where newly connected clients instantly join the ongoing video stream, the `<video>` element is configured with the `muted` attribute by default. 

Modern web browsers (Chrome, Firefox, Safari) enforce strict **Autoplay Policies** that block programmatic video playback (`video.play()`) if the video contains unmuted audio and the user has not yet interacted with the document (e.g., via a click). 

By defaulting to muted playback, this application guarantees that incoming WebSocket `play` events and initial state synchronizations execute reliably across all active clients without triggering `NotAllowedError` DOM exceptions. Users can manually unmute the video via the built-in controls once they have engaged with the page.