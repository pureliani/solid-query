## Primitives for managing Rest Api integrations in Solid.js
![npm (scoped)](https://img.shields.io/npm/v/%40gapu/solid-query)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/%40gapu/solid-query)
![NPM](https://img.shields.io/npm/l/%40gapu%2Fsolid-query)

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
    isLoadingInitial,
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
import { refetchPosts } from "examples/createQuery"

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
    onSuccess(_data) {
        refetchPosts();
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
export type QueryOptions<Response, Error, Key extends string | number> = {
    queryFn: (key: Key) => Promise<Response>
    key: Accessor<Key>
    enabled?: () => boolean
    onSuccess?: (key: Key, data: Response) => void
    onError?: (key: Key, error: Error) => void
}

export type QueryState<Response, Error> = {
    data: Response | undefined
    error: Error | undefined
    isLoading: boolean
    isLoadingInitial: boolean
}

export type CreateQueryReturn<Response, Error, Key extends string | number> = {
    data: Accessor<Response | undefined>
    error: Accessor<Error | undefined>
    isError: Accessor<boolean>
    isLoading: Accessor<boolean>
    isLoadingInitial: Accessor<boolean>
    setError: (error: Error, key?: Key) => void
    setData: (data: Response, key?: Key) => void
    refetch: (key?: Key) => Promise<Response | undefined>
    cache: Accessor<Record<Key, QueryState<Response | undefined, Error>>>
    setCache: Setter<Record<Key, QueryState<Response | undefined, Error>>>
}

export function createQuery<Response, Error, Key extends string | number>(
    options: QueryOptions<Response, Error, Key>
): CreateQueryReturn<Response, Error, Key>
```

### createMutation
```ts
import type { Accessor } from "solid-js";

export type MutationOptions<Arguments, Response, Error> = {
    onSuccess?: (data: Response) => void
    onError?: (error: Error) => void
    mutationFn: (args: Arguments) => Promise<Response>
}

export type CreateMutationReturn<Arguments, Response> = {
    isLoading: Accessor<boolean>,
    mutate: (args: Arguments) => Promise<Response | undefined>
}

export function createMutation<Arguments = unknown, Response = unknown, Error = unknown>(
    options: MutationOptions<Arguments, Response, Error>
): CreateMutationReturn<Arguments, Response>
```

### broadcastQuery
```ts
import type { Accessor, Setter } from "solid-js";
import { QueryState } from "./query";

export type BroadcastQueryProps<Response, Error, Key extends string | number> = {
    channel: string;
    initialize?: boolean;
    cache: Accessor<Record<Key, QueryState<Response | undefined, Error>>>;
    setCache: Setter<Record<Key, QueryState<Response | undefined, Error>>>;
};

export type BroadcastQueryMessage<Response, Error, Key extends string | number> = {
    type: "SET";
    value: Record<Key, QueryState<Response | undefined, Error>>;
} | {
    type: "GET";
};

export declare function broadcastQuery<Response, Error, Key extends string | number>(props: BroadcastQueryProps<Response, Error, Key>): void;
```
