import { DeferredTask } from './task.js';
import { MessageType } from './types.js';
import { RemoteError, TimeoutError } from './errors.js';
import type { RemoteContract, RemoteRequest, RemoteResponse, JSONElement, JSONArray } from './types.js';

export type WebSocketClient<T extends RemoteContract<T>> = WebSocket & { readonly RPC: T };

export async function CreateClient<T extends RemoteContract<T>>(url: string | URL, timeout: number = 5000): Promise<WebSocketClient<T>> {

    // Detect WebSocket existing at runtime and dynamically load polyfill (e.g. when running in NodeJS instead of Browser)
    globalThis.WebSocket = globalThis.WebSocket ?? (await import('ws')).WebSocket;

    return new class extends WebSocket {

        private readonly callbacks = new Map<string, DeferredTask<JSONElement>>();
        private readonly rpc: T = {} as T;

        constructor() {
            super(url);
            this.rpc = new Proxy(this.rpc, {
                get: (_instance: T, property: string, _proxy: unknown) => {
                    const method = property as keyof T;
                    return (...parameters: JSONArray): Promise<JSONElement> => {
                        //const reference = `${property}#${crypto.randomUUID()}`;
                        const reference = `${property}#${Date.now()}${Math.random()}`;
                        const message: RemoteRequest<T> = { method, reference, parameters };
                        try {
                            const task = new DeferredTask<JSONElement>();
                            this.callbacks.set(message.reference, task);
                            setTimeout(() => task.SetError(new TimeoutError(`Failed to perform the RPC roundtrip for '${message.reference}' within the given timeout of ${timeout}ms!`)), timeout);
                            this.send(JSON.stringify(message));
                            return task.Promise;
                        } catch(error) {
                            this.callbacks.delete(message.reference);
                            throw error;
                        }
                    }
                }
            });

            this.onmessage = async (event: MessageEvent<string>) => {
                try {
                    const message: RemoteResponse = JSON.parse(event.data);
                    const { type, reference, result, error } = message;
                    //console.log('Message Received: ', message, '=>', type, reference, result, error);
        
                    if(type === MessageType.Callback && this.callbacks.has(reference)) {
                        const callback = this.callbacks.get(reference);
                        try {
                            if(callback && error !== undefined) {
                                return callback.SetError(new RemoteError(error));
                            }
                            if(callback && result !== undefined) {
                                return callback.SetResult(result);
                            }
                        } finally {
                            this.callbacks.delete(reference);
                        }
                    }
        
                    throw new Error(`Failed to handle the received RPC message: '${JSON.stringify(message)}'`);
                } catch(error) {
                    console.warn(error);
                }
            }
        }

        public get RPC(): T {
            return this.rpc;
        }
    }();
}