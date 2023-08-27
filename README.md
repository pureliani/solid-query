## A simple library for api integrations with solid.js

Install
```bash
npm install @gapu/solid-query
```

Exported functions
- [createQuery](#createquery)
- [createMutation](#createmutation)

## Usage

### createQuery
```ts
import { createQuery } from "@gapu/solid-query"
import { createSignal } from "solid-js"
import axios from "axios"

const [postId, setPostId] = createSignal(1)

type QueryResponse = {
    id: number
    title: string
    body: string
    userId: number
}

export const { 
    data, 
    error, 
    isError, 
    isLoading, 
    isLoadingInitial, 
    refetch, 
    cache,
    setCache,
    setError
} = createQuery<QueryResponse>({
    key: () => postId(),
    queryFn: async () => {
        const { data: post } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${postId()}`);
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

export type QueryOptions<Response, Error> = {
    queryFn: () => Promise<Response>
    key: Accessor<string | number>
    enabled?: () => boolean
    onSuccess?: (data: Response) => void
    onError?: (error: Error) => void
}

export type CreateQueryReturn<Response, Error> = {
    data: Accessor<Response | undefined>
    error: Accessor<Error | undefined>
    setError: Setter<Error | undefined>
    refetch: () => Promise<Response | undefined>
    isError: Accessor<boolean>
    isLoading: Accessor<boolean>
    isLoadingInitial: Accessor<boolean>
    cache: Accessor<Record<string | number, Response | undefined>>
    setCache: Setter<Record<string | number, Response | undefined>>
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
