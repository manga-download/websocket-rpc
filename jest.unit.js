export default {
    preset: 'ts-jest/presets/js-with-ts-esm',
    rootDir: './src',
    testMatch: [ '**/*[_.](test|spec).[jt]s' ],
    reporters: [
        'default',
    ]
};