import { WebSocketServer, type ServerOptions } from 'ws';
import type { JSONElement, RemoteContract, RemoteRequest, RemoteResponse } from './types.js';
import { MessageType } from './types.js';

export type { WebSocketServer };

export async function CreateServer<T extends RemoteContract<T>>(contract: T, options?: ServerOptions): Promise<WebSocketServer> {

    const websocket = new WebSocketServer(options);
    const methods: RemoteContract<T> = contract;

    websocket.addListener('connection', client => client.on('message', async data => {
        try {
            const request: RemoteRequest<T> = JSON.parse(data.toString('utf8'));
            const { method, reference, parameters } = request;
            //console.log('Message Received: ', method, reference, parameters);
            let response: RemoteResponse;
            try {
                if(method in methods) {
                    const result: JSONElement = (await methods[method](...parameters)) ?? null;
                    response = { type: MessageType.Callback, reference, result };
                } else {
                    throw new Error(`The method '${method as string}' is not registered!`);
                }
            } catch(err: unknown) {
                const error: Error = err as Error;
                response = { type: MessageType.Callback, reference, error: { name: error.name, message: error.message, stack: error.stack } };
            }
            client.send(JSON.stringify(response));
        } catch(error) {
            //console.warn('Failed to send a response for RPC request!', error);
        }
    }));

    return websocket;
}