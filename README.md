## Primitives for managing queries and cache in solid.js
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

### [See the usage example](https://stackblitz.com/edit/gapu-solid-query?file=src%2FApp.tsx)

### createQuery
A key is a function which returns: an object, a set, a map or a primitive type like string, number, null, etc.. 
The ordering of parameters does not matter if the key is an object, a set or a map, but it does for arrays, e.g:

|Structure A                     |Structure B                    |Are equal|
|--------------------------------|-------------------------------|---------|
|`{ a: 1, b: 2 }`                |`{ b: 1, a: 2 }`               |true     |
|`[1, 2, 3]`                     |`[1, 3, 2]`                    |false    |
|`new Set([1, 2])`               |`new Set([2, 1])`              |true     |
|`new Set([1, 2])`               |`new Set([2, 1, 3])`           |false    |
|`new Map([[1, 2], [3, 4]]))`    |`new Map([[1, 2], [3, 4]])`    |true     |
|`new Map([[1, 2], [3, 4]]))`    |`new Map([[1, 2], [3, 4, 5]])` |false    |
|`"A"`                           |`"A"`                          |true     |
|`"A"`                           |`"a"`                          |false    |
|`1`                             |`1`                            |true     |
|`1`                             |`1.2`                          |false    |
|`new Date('2024-01-01')`        |`new Date('2024-01-01')`       |true     |
|`new Date('2024-01-01')`        |`new Date('2024-01-02')`       |false    |

> **Warning**  
> Do not consume a signal of a key directly in the queryFn, instead take the key as an argument as shown in the example

```tsx
import axios from 'axios';
import { createQuery } from '@gapu/solid-query';
import { createSignal } from 'solid-js';

type QueryResponse = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

const [postId, setPostId] = createSignal(1);
const [isEnabled, setIsEnabled] = createSignal(true)

export const {
  data,
  error,
  isError,
  isLoading,
  setEntry,
  refetch,
  emptyCache,
} = createQuery({
  key: () => postId(),
  enabled: () => isEnabled(),
  queryFn: async (key) => {
    const { data: post } = await axios.get<QueryResponse>(
      `https://jsonplaceholder.typicode.com/posts/${key}`
    );
    return post;
  },
});

const onNext = () => setPostId((currentId) => currentId + 1);
const onPrev = () => setPostId((currentId) => currentId - 1);
const onToggle = () => setIsEnabled((enabled) => !enabled)
const onRefetchSecond = () => refetch(2);
const onUpdateThird = () => {
  setEntry({
    data: {
      id: 1000,
      body: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ratione quas voluptate similique ducimus tempora, vel odit! Debitis sequi enim numquam?',
      title: 'Lorem ipsum dolor',
      userId: 1
    }
  }, 3);
}
```

### createMutation
```ts
import axios from "axios";
import { createMutation } from "@gapu/solid-query"
import { refetch } from "./examples/query"

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

export const { isLoading, mutate: createPost } = createMutation<RequestBody, ResponseBody>({
    mutationFn: async (body) => {
        const { data } = await axios.post("https://jsonplaceholder.typicode.com/posts", body);
        return data;
    },
    onSuccess(data) {
        refetch();
    }
});

// Mutation example
createPost({
    userId: 1,
    title: "Hello",
    body: "World",
});
```

## Type definitions
```ts
import { Accessor } from 'solid-js';
import { NotUndefined } from 'object-hash';

type MutationOptions<Argument = void, Response = any, Error = any> = {
    onSuccess?: (data: Response) => void;
    onSettled?: () => void;
    onError?: (error: Error) => void;
    mutationFn: (arg: Argument) => Promise<Response>;
};
type CreateMutationReturn<Argument = void, Response = any> = {
    isLoading: Accessor<boolean>;
    mutate: (arg: Argument) => Promise<Response | undefined>;
};
declare function createMutation<
  Argument = void, 
  Response = any, 
  Error = any
>(options: MutationOptions<Argument, Response, Error>): CreateMutationReturn<Argument, Response>;

type QueryOptions<Response = any, Error = any, Key extends NotUndefined = any> = {
    key: Accessor<Key>;
    enabled?: () => boolean;
    queryFn: (key: Key) => Promise<Response>;
    onSettled?: (key: Key) => void;
    onSuccess?: (key: Key, data: Response) => void;
    onError?: (key: Key, error: Error) => void;
};
type QueryState<Response = any, Error = any> = {
    isLoading?: boolean;
    data?: Response;
    error?: Error;
};
type Update<T> = T | ((arg: T) => T);
type CreateQueryReturn<Response = any, Error = any, Key extends NotUndefined = any> = {
    data: (key?: Key) => Response | undefined;
    error: (key?: Key) => Error | undefined;
    isError: (key?: Key) => boolean;
    isLoading: (key?: Key) => boolean;
    setEntry: (update: Update<QueryState<Response, Error>>, key?: Key) => void;
    refetch: (key?: Key) => Promise<Response | undefined>;
    emptyCache: () => void;
};
declare function createQuery<
  Response = any, 
  Error = any, 
  Key extends NotUndefined = any
>(options: QueryOptions<Response, Error, Key>): CreateQueryReturn<Response, Error, Key>;

export { 
  CreateMutationReturn, 
  CreateQueryReturn, 
  MutationOptions, 
  QueryOptions, 
  QueryState, 
  Update, 
  createMutation, 
  createQuery 
};
```
