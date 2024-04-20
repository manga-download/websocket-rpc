// Stubs for browser functionality
class MessageEvent { data }

export default {
    preset: 'ts-jest/presets/js-with-ts-esm',
    rootDir: './test',
    testMatch: [ '**/*[_.]e2e.[jt]s' ],
    reporters: [
        'default',
    ],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest', {
                tsconfig: {
                    allowJs: true,
                    esModuleInterop: true,
                }
            }
        ]
    },
    globals: {
        'MessageEvent': MessageEvent
    }
};