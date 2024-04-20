import type{ RemoteContract } from '../dist/mjs/_index';
import { type WebSocketServer, CreateServer } from '../dist/mjs/server';
import { type WebSocketClient, CreateClient } from '../dist/mjs/client';

class TestFixture<T extends RemoteContract<T>> {

    public Server!: WebSocketServer;
    public Client!: WebSocketClient<T>;

    async Initialize(contract: T, timeout = 1000) {
        return new Promise<typeof this>(async resolve => {
            this.Server = await CreateServer(contract, { path: '/rpc', port: 8080 });
            this.Client = await CreateClient<T>('ws://localhost:8080/rpc', timeout);
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
        this.Client?.close();
        this.Server?.close();
    }
}

describe('WebSocket RPC', () => {

    it('Should call contract method without parameters and without return value', async () => {

        let invoked = false;
        class TestContract {
            async RemoteCall() {
                invoked = true;
            }
        }

        const fixture = new TestFixture<TestContract>();

        try {
            await fixture.Initialize(new TestContract());
            await fixture.Client.RPC.RemoteCall();
            expect(invoked).toBe(true);
        } finally {
            fixture?.Dispose();
        }
    });

    it('Should call contract method with single parameter and without return value', async () => {

        let parameters: any;
        class TestContract {
            async RemoteCall(a: number) {
                parameters = { a };
            }
        }

        const fixture = new TestFixture<TestContract>();

        try {
            await fixture.Initialize(new TestContract());
            await fixture.Client.RPC.RemoteCall(7);
            expect(parameters).toStrictEqual({ a: 7 });
        } finally {
            fixture?.Dispose();
        }
    });

    it('Should call contract method with multiple parameters and without return value', async () => {

        let parameters: any;
        class TestContract {
            async RemoteCall(a: number, b: string, c: any[], d: {}) {
                parameters = { a, b, c, d };
            }
        }

        const fixture = new TestFixture<TestContract>();

        try {
            await fixture.Initialize(new TestContract());
            await fixture.Client.RPC.RemoteCall(7, '+', [ 11, '-' ], { x: 13, y: 17 });
            expect(parameters).toStrictEqual({ a: 7, b: '+', c: [ 11, '-' ], d: { x: 13, y: 17 } });
        } finally {
            fixture?.Dispose();
        }
    });

    it.each([
        // CASE: return null
        null,
        // CASE: return boolean
        true,
        // CASE: return number
        173,
        // CASE: return string
        '*',
        // CASE: return array
        [ null, false, 7, '-', , [ 11 ], { x: 3.3, y: 9.9 } ],
        // CASE: return object
        { a: null, b: true, c: '#', d: [ 11 ], e: { x: 3.3, y: 9.9 } },
    ])('Should return expected remote value', async () => {

        const extected = null;
        class TestContract {
            RemoteCall = async () => extected;
        }

        const fixture = new TestFixture<TestContract>();

        try {
            await fixture.Initialize(new TestContract());
            const result = await fixture.Client.RPC.RemoteCall();
            expect(result).toStrictEqual(extected);
        } finally {
            fixture?.Dispose();
        }
    });

    it('Should timeout for long response', async() => {

        class TestContract {
            RemoteCall = async (delay: number) => new Promise<void>(resolve => setTimeout(resolve, delay));
        }

        const fixture = new TestFixture<TestContract>();

        try {
            try {
                await fixture.Initialize(new TestContract(), 50);
                await fixture.Client.RPC.RemoteCall(100);
                throw new Error('Expected error was not thrown!');
            } catch(ex) {
                const error = ex as Error;
                expect(error.name).toStrictEqual('TimeoutError');
                expect(error.message).toContain('Failed to perform the RPC roundtrip');
                expect(error.message).toContain('within the given timeout of 50ms!');
            }
        } finally {
            fixture?.Dispose();
        }
    });

    it('Should throw remote error', async() => {

        class TestContract {
            RemoteCall = async () => { throw new Error('😈'); };
        }

        const fixture = new TestFixture<TestContract>();

        try {
            try {
                await fixture.Initialize(new TestContract());
                await fixture.Client.RPC.RemoteCall();
                throw new Error('Expected error was not thrown!');
            } catch(ex) {
                const error = ex as Error;
                expect(error.name).toStrictEqual('RemoteError<Error>');
                expect(error.message).toStrictEqual('😈');
            }
        } finally {
            fixture?.Dispose();
        }
    });

    it('Should throw when calling a non-defined contract method', async() => {

        class TestContract {}

        const fixture = new TestFixture<TestContract>();

        try {
            try {
                await fixture.Initialize(new TestContract());
                await (fixture.Client.RPC as any).NonExistingFunction();
                throw new Error('Expected error was not thrown!');
            } catch(ex) {
                const error = ex as Error;
                expect(error.name).toStrictEqual('RemoteError<Error>');
                expect(error.message).toStrictEqual(`The method 'NonExistingFunction' is not registered!`);
            }
        } finally {
            fixture?.Dispose();
        }
    });
});