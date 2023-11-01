import { createEffect, createRoot, createSignal, type Accessor, type Setter } from "solid-js";

export type QueryOptions<Response = any, Error = any, Key extends string | number = string | number> = {
    queryFn: (key: Key) => Promise<Response>
    key: Accessor<Key>
    enabled?: () => boolean
    onSettled?: (key: Key) => void
    onSuccess?: (key: Key, data: Response) => void
    onError?: (key: Key, error: Error) => void
}

export type QueryState<Response = any, Error = any> = {
    data: Response
    error: undefined
    isLoading: boolean
} | {
    data: undefined
    error: Error
    isLoading: boolean
}

export type Update<T> = T | ((arg: T) => T)
export type CreateQueryReturn<Response = any, Error = any, Key extends string | number = string | number> = {
    data: (key?: Key) => Response | undefined
    error: (key?: Key) =>  Error | undefined
    isError: (key?: Key) => boolean
    isLoading: (key?: Key) => boolean
    setEntry: (update: Update<Partial<QueryState<Response, Error>>>, key?: Key) => void
    refetch: (key?: Key) => Promise<Response | undefined>
    cache: Accessor<Record<Key, QueryState<Response, Error>>>
    setCache: Setter<Record<Key, QueryState<Response, Error>>>
}

export function createQuery<Response = any, Error = any, Key extends string | number = string | number>(
    options: QueryOptions<Response, Error, Key>
): CreateQueryReturn<Response, Error, Key> {
    const [cache, setCache] = createSignal<Record<Key, QueryState<Response, Error>>>({} as any);

    const enabled = () => {
        if(!options.enabled) return true
        return options.enabled()
    }

    const setEntry = (update: Update<Partial<QueryState<Response, Error>>>, key = options.key()) => {
        setCache(current => ({
            ...current,
            [key]: {
                ...current[key],
                ...(update instanceof Function ? update(current[key]) : update)
            }
        }))
    }

    const refetch = async (key = options.key()): Promise<Response | undefined> => {
        if(!enabled()) return;
        try {
            setEntry({ isLoading: true }, key)
            const data = await options.queryFn(key);
            options.onSuccess?.(key, data)
            setEntry({ data, error: undefined }, key)
            return data;
        } catch (e) {
            setEntry({ data: undefined, error: e as Error }, key)
            options.onError?.(key, e as Error)
        } finally {
            setEntry({ isLoading: false }, key)
            options.onSettled?.(key)
        }
    }

    refetch(options.key())

    createRoot(() => {
        createEffect(() => {
            if(!(options.key() in cache())) {
                refetch(options.key())
            }
        })
    })

    return {
        data: (key = options.key()) => cache()[key]?.data ?? undefined,
        setEntry,
        error: (key = options.key()) => cache()[key]?.error ?? undefined,
        isError: (key = options.key()) => !!(cache()[key]?.error),
        refetch,
        isLoading: (key = options.key()) => cache()[key]?.isLoading ?? false,
        cache,
        setCache
    };
};
