## A simple library for api integrations with solid.js

Install
```bash
npm install @gapu/solid-query
```

Exported functions
- [createQuery](#createquery)
- [createMutation](#createmutation)
- createInfiniteQuery

## Usage

### createQuery
```ts

import axios from "axios";
import { createQuery } from "@gapu/solid-query"

type ResponseBody = {
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
    refetch: refetch_todos, 
    clear 
} = createQuery<ResponseBody>({
    queryFn: async () => {
        const { data: todo } = await axios.get("https://jsonplaceholder.typicode.com/todos/1");
        return todo;
    }
});

```

### createMutation
```ts

import axios from "axios";
import { createMutation } from "@gapu/solid-query"
import { refetch_todos } from "examples/createQuery"

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
        refetch_todos();
    }
});

// Mutation example
mutate({
    title: "Hello",
    body: "World",
    userId: 1,
});

```

## Type definitions

### createQuery

```ts

export type QueryOptions<Response, Error> = {
    
    // A function which is responsible for fetching data
    // it must throw on error
    queryFn: () => Promise<Response>
    
    // A boolean indicating if the query is refetchable / initially enabled
    enabled?: () => boolean

    onSuccess?: (data: Response) => void
    onError?: (error: Error) => void
}

export type CreateQueryReturn<Response, Error> = {
    // Latest data from an API
    // undefined if query fails
    data: Accessor<Response | undefined>
    
    // Error from Latest API call
    // undefined if APi call succeeds
    error: Accessor<Error | undefined>

    // A boolean indicating if the latest query failed
    isError: Accessor<boolean>

    // Reset the query state
    // setError(undefined)
    // setData(undefined)
    // setIsError(false)
    // setIsLoadingInitial(false)
    // setIsLoading(false)
    clear: () => void

    // Try to refetch the data
    refetch: () => Promise<Response | undefined>

    // Check if a query is in progress
    isLoading: Accessor<boolean>

    // Check if initial query is in progress (only true if "enabled" is initially true)
    isLoadingInitial: Accessor<boolean>
}

// function signature
export function createQuery<Response = unknown, Error = unknown>(
    options: QueryOptions<Response, Error>
): CreateQueryReturn<Response, Error>

```

### createMutation
```ts
export type MutationOptions<Arguments, Response, Error> = {
    onSuccess?: (data: Response) => void
    onError?: (error: Error) => void

    // A function taking predefined arguments
    // If a promise fails this function should throw an error  
    mutationFn: (args: Arguments) => Promise<Response>
}

export type CreateMutationReturn<Arguments, Response> = {
    isLoading: Accessor<boolean>,
    mutate: (args: Arguments) => Promise<Response | undefined>
}

// function signature
export function createMutation<Arguments = unknown, Response = unknown, Error = unknown>(
    options: MutationOptions<Arguments, Response, Error>
): CreateMutationReturn<Arguments, Response>

```
