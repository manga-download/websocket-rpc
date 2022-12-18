import { MessageError } from './types.js';

export class RemoteError extends Error {
    constructor(error: MessageError) {
        super(error.message);
        this.name = `${RemoteError.name}<${error.name}>`;
        this.stack = error.stack;
    }
}

export class TimeoutError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = TimeoutError.name;
    }
}