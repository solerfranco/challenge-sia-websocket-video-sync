const { server, io, resetPlayerState } = require('../src/server');
const Client = require('socket.io-client');

describe('WebSocket Server Logic', () => {
    let port;
    let activeClients = [];
    let originalDateNow;

    beforeAll((done) => {
        server.listen(0, () => {
            port = server.address().port;
            done();
        });

        originalDateNow = Date.now;
    });

    afterAll((done) => {
        io.close();
        server.close(done);
        global.Date.now = originalDateNow;
    });

    afterEach(() => {
        activeClients.forEach(client => {
            if (client.connected) client.disconnect();
        });
        activeClients = [];

        //Clear the state so previous tests don't affect the next one
        resetPlayerState(); 
        global.Date.now = originalDateNow;
    });

    test('should send initial sync state upon connection', (done) => {
        
        const clientSocket = new Client(`http://localhost:${port}`);
        activeClients.push(clientSocket);

        
        clientSocket.on('initSync', (data) => {
            expect(data).toHaveProperty('isPlaying');
            expect(data).toHaveProperty('currentTime');
            expect(typeof data.currentTime).toBe('number');
            done();
        });
    });

    test('should update server state and broadcast when a play event is received', (done) => {
        const senderClient = new Client(`http://localhost:${port}`);
        const receiverClient = new Client(`http://localhost:${port}`);
        activeClients.push(senderClient, receiverClient);

        receiverClient.on('play', (time) => {
            expect(time).toBe(10.5);
            done();
        });

        senderClient.on('connect', () => {
            senderClient.emit('play', 10.5);
        });
    });

    test('should calculate correct elapsed time for late joiners', (done) => {
        // 1. Setup a controlled starting time
        let mockTime = 1000000;
        global.Date.now = jest.fn(() => mockTime);

        const firstClient = new Client(`http://localhost:${port}`);
        activeClients.push(firstClient);

        firstClient.on('connect', () => {
            firstClient.emit('play', 10);

            // Wait briefly to ensure the server processed the play event
            setTimeout(() => {
                
                //Fast-forward time by 5 seconds
                mockTime += 5000; 

                // 3. Connect a late-joining client
                const lateJoiner = new Client(`http://localhost:${port}`);
                activeClients.push(lateJoiner);

                lateJoiner.on('initSync', (data) => {
                    try {
                        // The server should take the initial 10s and add the 5s elapsed time
                        expect(data.isPlaying).toBe(true);
                        expect(data.currentTime).toBe(15); 
                        done();
                    } catch (error) {
                        done(error);
                    }
                });
            }, 50); // Small real-time delay so socket events clear the event loop
        });
    });
});