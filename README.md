## A simple library for api integrations with solid.js

Install
```bash
npm install @gapu/solid-query
```

Exported functions
- [createQuery](#createquery)
- [createMutation](#createmutation)

## Usage

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
} = createQuery<QueryResponse>({
    key: () => postId(),
    queryFn: async (key) => {
        // This would be invalid, note how we are reading "postId()" instead of "key"
        // const { data: post } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${postId()}`);

        const { data: post } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${key}`);
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

## Type definitions

### createQuery

```ts
import type { Accessor, Setter } from "solid-js";

export type Key = string | number

export type QueryOptions<Response, Error> = {
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

export type CreateQueryReturn<Response, Error> = {
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

export function createQuery<Response = unknown, Error = unknown>(
    options: QueryOptions<Response, Error>
): CreateQueryReturn<Response, Error>
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
