import { type WebSocketServer, CreateServer } from '../dist/mjs/server';
import { type WebSocketClient, CreateClient } from '../dist/mjs/client';

class TestFixture {

    public Server!: WebSocketServer;
    public Client!: WebSocketClient<{}>;

    async Initialize() {
        return new Promise<typeof this>(async resolve => {
            this.Server = await CreateServer({}, { path: '/rpc', port: 8080 });
            this.Client = await CreateClient<{}>('ws://localhost:8080/rpc', 1000);
            this.Client.addEventListener('open', () => resolve(this));
            // TODO: resolve if already connected ...
            /*
            if(this.Client.OPEN) {
                resolve(this);
            }
            */
        });
    }

    Dispose() {
        this.Client.close();
        this.Server.close();
    }
}

describe('WebSocket Communication', () => {

    it('Should send message from client => server', async() => {

        const fixture = new TestFixture();

        try {
            await fixture.Initialize();
            const connections = [...fixture.Server.clients.values()];
            expect(connections.length).toBe(1);
            const result = await new Promise<string>(resolve => {
                connections[0].once('message', data => resolve(data.toString('utf8')));
                fixture.Client?.send('✓');
            });
            expect(result).toBe('✓');
        } finally {
            fixture.Dispose();
        }
    });

    it('Should send message from server => client', async() => {

        const fixture = new TestFixture();

        try {
            await fixture.Initialize();
            const connections = [...fixture.Server.clients.values()];
            expect(connections.length).toBe(1);
            const result = await new Promise<string>(resolve => {
                fixture.Client.onmessage = event => resolve(event.data);
                connections[0].send('✓');
            });
            expect(result).toBe('✓');
        } finally {
            fixture.Dispose();
        }
    });
});