import { describe, test, expect } from 'vitest';
import { DeferredTask } from './task';

describe('DeferredTask', () => {

    test('Should resolve within the given time', async() => {
        const expected = '+';
        const testee = new DeferredTask<string>();
        setTimeout(() => testee.SetResult(expected), 50);
        const start = Date.now();
        const value = await testee.Promise;
        const end = Date.now();
        expect(end - start).toBeGreaterThan(45);
        expect(end - start).toBeLessThan(55);
        expect(value).toStrictEqual(expected);
    });

    test('Should reject within the given time', async() => {
        const expected = new Error('-');
        const testee = new DeferredTask<number>();
        setTimeout(() => testee.SetError(expected), 50);
        const start = Date.now();
        await expect(testee.Promise).rejects.toStrictEqual(expected);
        const end = Date.now();
        expect(end - start).toBeGreaterThan(45);
        expect(end - start).toBeLessThan(55);
    });
});