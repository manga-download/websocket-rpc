# WebSocket RPC

A typesafe RPC implementation for WebSockets based on the popular [ws](https://www.npmjs.com/package/ws) package.

## Pre-Conditions

- The WebSocket server must be run in a NodeJS environment
- The WebSocket client should be run in a Browser environment

## Install

### [ℹ️](https://www.pluralsight.com/resources/blog/guides/install-npm-packages-from-gitgithub) From GitHub
- [Latest](https://github.com/manga-download/websocket-rpc): `npm install github:manga-download/websocket-rpc`
- [Specific version](https://github.com/manga-download/websocket-rpc/tags): `npm install github:manga-download/websocket-rpc#v1.2.4`

### From NPM
- [Latest](https://www.npmjs.com/package/websocket-rpc): `npm install websocket-rpc`
- [Specific version](https://www.npmjs.com/package/websocket-rpc?activeTab=versions): `npm install websocket-rpc@1.2.4`

## Quick Start

### Contract

The contract is a class providing all methods on the RPC server that can be invoked remotely with the RPC client.
All methods must fulfill the following criterias:
- Must be async
- Must be void or return a JSON serializable result
- Must have zero or more parameters, each must be JSON serializable

_MyContract.ts_
```typescript
import type { RemoteContract } from 'websocket-rpc';

export class MyContract implements RemoteContract<MyContract> {

    async Divide(a: number, b: number): Promise<number> {
        if(b === 0) {
            throw new Error('Division by zero!');
        } else {
            return a / b;
        }
    }
}
```

### Server

Start a WebSocket server which exposes the RPC methods from `MyContract`.

_MyServer.ts_
```typescript
import { CreateServer } from 'websocket-rpc/server';
import { MyContract } from './MyContract';

const contract = new MyContract();
const wsConnectionInfo = { path: '/rpc', port: 8080 };

// The server is the same as from the 'ws' package, but extended with RPC capabilities
const server = await CreateServer(contract, wsConnectionInfo);
```

### Client

Connect to a WebSocket server and invoke the RPC methods from `MyContract`.

_MyClient.ts_
```typescript
import { CreateClient } from 'websocket-rpc/client';
import type { MyContract } from './MyContract';

const client = await CreateClient<MyContract>('http://localhost:8080/rpc');

// TODO: Ensure the client is properly connected before invoking calls...
setTimeout(async () => {
    // All defined methods from the contract can now be invoked via the RPC property
    const result = await client.RPC.Divide(19, 7);
}, 1000);
```