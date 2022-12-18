import { RemoteError, TimeoutError } from './errors';

describe('RemoteError', () => {

    it('Should instantiate with paramter', async() => {
        const testee = new RemoteError({ name: '#', message: '-', stack: '*' });
        expect(testee.name).toBe('RemoteError<#>');
        expect(testee.message).toBe('-');
        expect(testee.stack).toBe('*');
    });
});

describe('TimeoutError', () => {

    it('Should instantiate with paramter', async() => {
        const testee = new TimeoutError('-');
        expect(testee.name).toBe('TimeoutError');
        expect(testee.message).toBe('-');
    });

    it('Should instantiate without paramter', async() => {
        const testee = new TimeoutError();
        expect(testee.name).toBe('TimeoutError');
        expect(testee.message).toBe('');
    });
});