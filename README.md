## Primitives for managing rest api integrations in solid.js
[![npm (scoped)](https://img.shields.io/npm/v/%40gapu/solid-query)](https://www.npmjs.com/package/@gapu/solid-query)
[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/%40gapu/solid-query)](https://bundlephobia.com/package/@gapu/solid-query)
[![NPM](https://img.shields.io/npm/l/%40gapu%2Fsolid-query)](https://www.npmjs.com/package/@gapu/solid-query)

Install
```bash
npm install @gapu/solid-query
```

Exported functions
- [createQuery](#createquery)
- [createMutation](#createmutation)
- [broadcastQuery](#broadcastquery)


## Usage
#### [Checkout the demo](https://stackblitz.com/edit/gapu-solid-query?file=src%2FApp.tsx)

> **Warning**  
> Do not consume a signal of a key directly in the queryFn, instead take the key as an argument as shown in the example

### createQuery
```ts
type QueryResponse = {
    id: number
    title: string
    body: string
    userId: number
}
const [postId, setPostId] = createSignal(1)

export const { 
    data,
    error,
    isError,
    isLoading,
    setData,
    refetch,
    cache,
    setCache,
    setError
} = createQuery({
    key: () => postId(),
    queryFn: async (key) => {
        // Do not read key signals directly, the following usage is invalid:
        // const { data: post } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${postId()}`);

        const { data: post } = await axios.get<QueryResponse>(`https://jsonplaceholder.typicode.com/posts/${key}`);
        return post;
    }
});
```

### createMutation
```ts
import axios from "axios";
import { createMutation } from "@gapu/solid-query"
import { refetch } from "examples/createQuery"

type RequestBody = {
    title: string
    body: string
    userId: number
}

type ResponseBody = {
    id: number
    title: string
    body: string
    userId: number
}

export const { isLoading, mutate } = createMutation<RequestBody, ResponseBody>({
    mutationFn: async (body) => {
        const { data } = await axios.post("https://jsonplaceholder.typicode.com/posts", body);
        return data;
    },
    onSuccess(data) {
        refetch();
    }
});

// Mutation example
mutate({
    userId: 1,
    title: "Hello",
    body: "World",
});
```

### broadcastQuery
Used to share query cache to other browser instances via [BroadcastChannel - Web API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) to avoid refetching data if the other tabs / windows already have that query cache entry
```ts
import { createQuery, broadcastQuery } from "@gapu/solid-query"
import axios from "axios"
import { createSignal } from "solid-js"

type QueryResponse = {
    id: number
    title: string
    body: string
    userId: number
}
const [postId, setPostId] = createSignal(1)

export const { cache, setCache } = createQuery({
    key: () => postId(),
    queryFn: async (key) => {
        const { data: post } = await axios.get<QueryResponse>(`https://jsonplaceholder.typicode.com/posts/${key}`);
        return post;
    }
});

broadcastQuery({
    cache,
    setCache,
    channel: 'posts-query-channel',
})
```

## Type definitions

### createQuery
```ts
import { type Accessor, type Setter } from "solid-js";

export type QueryOptions<Response = any, Error = any, Key extends string | number = string | number> = {
    queryFn: (key: Key) => Promise<Response>
    key: Accessor<Key>
    enabled?: () => boolean
    onSettled?: (key: Key) => void
    onSuccess?: (key: Key, data: Response) => void
    onError?: (key: Key, error: Error) => void
}

export type QueryState<Response = any, Error = any> = {
    data: null
    error: Error
    isLoading: boolean
} | {
    data: Response
    error: null
    isLoading: boolean
}

export type CreateQueryReturn<Response = any, Error = any, Key extends string | number = string | number> = {
    data: (key?: Key) => Response | undefined
    error: (key?: Key) =>  Error | undefined
    isError: (key?: Key) => boolean
    setEntry: <Merge extends boolean, Entry extends Merge extends true ? Partial<QueryState<Response, Error>> : QueryState<Response, Error>>(key: Key, entry: Entry, merge?: Merge) => void
    isLoading: (key?: Key) => boolean
    setError: (error: Error, key?: Key) => void
    setData: (data: Response, key?: Key) => void
    refetch: (key?: Key) => Promise<Response | undefined>
    cache: Accessor<Record<Key, QueryState<Response | undefined, Error>>>
    setCache: Setter<Record<Key, QueryState<Response | undefined, Error>>>
}

export function createQuery<Response = any, Error = any, Key extends string | number = string | number>(
    options: QueryOptions<Response, Error, Key>
): CreateQueryReturn<Response, Error, Key>
```

### createMutation
```ts
import { type Accessor } from "solid-js";

export type MutationOptions<Argument = void, Response = any, Error = any> = {
    onSuccess?: (data: Response) => void
    onSettled?: () => void
    onError?: (error: Error) => void
    mutationFn: (arg: Argument) => Promise<Response>
}

export type CreateMutationReturn<Argument = void, Response = any> = {
    isLoading: Accessor<boolean>,
    mutate: (arg: Argument) => Promise<Response | undefined>
}

export function createMutation<Argument = void, Response = any, Error = any>(
    options: MutationOptions<Argument, Response, Error>
): CreateMutationReturn<Argument, Response>
```

### broadcastQuery
```ts
import type { Accessor, Setter } from "solid-js"
import type { QueryState } from "./query"

export type BroadcastQueryProps<Response = any, Error = any, Key extends string | number = string | number> = {
    channel: string
    initialize?: boolean
    cache: Accessor<Record<Key, QueryState<Response | undefined, Error>>>
    setCache: Setter<Record<Key, QueryState<Response | undefined, Error>>>
}

export type BroadcastQueryMessage<Response = any, Error = any, Key extends string | number = string | number> = {
    type: "SET"
    value: Record<Key, QueryState<Response | undefined, Error>>
} | {
    type: "GET"
}

export function broadcastQuery<Response = any, Error = any, Key extends string | number = string | number>(
    props: BroadcastQueryProps<Response, Error, Key>
): void 
```
