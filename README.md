# Lucid TypeScript SDK
[![npm](https://img.shields.io/npm/v/lucid-ts-sdk?label=npm)](https://www.npmjs.com/package/lucid-ts-sdk)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](https://github.com/lucid-kv/ts-sdk/blob/master/LICENSE)

Lucid KV TypeScript wrapper 🍬 High performance and distributed KV store accessible through an HTTP API.

This packages uses [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) to make sure it works on both the browser and Node.js.

## Install
```sh
yarn add lucid-ts-sdk
```

## Usage
```ts
import { LucidAPI } from 'lucid-ts-sdk'

const setup = async () => {
  // Create a Lucid API wrapper instance
  const Lucid = new LucidAPI('http://127.0.0.1:7020', 'your-Lucid-authentication-JSON-Web-Token')

  // Initialize the wrapper instance (validate endpoint and JWT)
  const version = await Lucid.init()
  console.log(version) // 0.1.2

  const content = await Lucid.getKey('check-token').then(res => res.json())
  console.log(content) // { code: 0, message: 'Lucid Version 0.1.2', details: null }
}

setup()
```

## SDK API documentation
https://lucid-kv.github.io/ts-sdk/

## License
[The MIT License](./LICENSE)
