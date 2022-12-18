import { JSONElement } from './types.js';

export class DeferredTask<T extends JSONElement> {

    private readonly promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });

    private resolve?: (value: T | PromiseLike<T>) => void;
    public SetResult(value: T) {
        return this.resolve?.call(undefined, value);
    }

    private reject?: (error: Error) => void;
    public SetError(error: Error) {
        return this.reject?.call(undefined, error);
    }

    public get Promise(): Promise<T> {
        return this.promise;
    }
}