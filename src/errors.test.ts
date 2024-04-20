import { describe, test, expect } from 'vitest';
import { RemoteError, TimeoutError } from './errors';

describe('RemoteError', () => {

    test('Should instantiate with paramter', async() => {
        const testee = new RemoteError({ name: '#', message: '-', stack: '*' });
        expect(testee.name).toBe('RemoteError<#>');
        expect(testee.message).toBe('-');
        expect(testee.stack).toBe('*');
    });
});

describe('TimeoutError', () => {

    test('Should instantiate with paramter', async() => {
        const testee = new TimeoutError('-');
        expect(testee.name).toBe('TimeoutError');
        expect(testee.message).toBe('-');
    });

    test('Should instantiate without paramter', async() => {
        const testee = new TimeoutError();
        expect(testee.name).toBe('TimeoutError');
        expect(testee.message).toBe('');
    });
});