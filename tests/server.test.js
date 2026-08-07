const { server, io } = require('../src/server');
const Client = require('socket.io-client');

describe('WebSocket Server Logic', () => {
    let port;
    let activeClients = [];

    beforeAll((done) => {
        server.listen(0, () => {
            port = server.address().port;
            done();
        });
    });

    afterAll((done) => {
        io.close();
        server.close(done);
    });

    afterEach(() => {
        activeClients.forEach(client => {
            if (client.connected) client.disconnect();
        });
        activeClients = [];
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
});