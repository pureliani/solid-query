import { type NotUndefined, sha1 } from "object-hash";
import { createEffect, createRoot, createSignal, type Accessor } from "solid-js";

export type QueryOptions<Response = any, Error = any, Key extends NotUndefined = any> = {
    key: Accessor<Key>
    enabled?: () => boolean
    queryFn: (key: Key) => Promise<Response>
    onSettled?: (key: Key) => void
    onSuccess?: (key: Key, data: Response) => void
    onError?: (key: Key, error: Error) => void
}

export type QueryState<Response = any, Error = any> = {
    isLoading?: boolean;
    data?: Response;
    error?: Error;
} 

export type Update<T> = T | ((arg: T) => T)
export type CreateQueryReturn<Response = any, Error = any, Key extends NotUndefined = any> = {
    data: (key?: Key) => Response | undefined
    error: (key?: Key) =>  Error | undefined
    isError: (key?: Key) => boolean
    isLoading: (key?: Key) => boolean
    setEntry: (update: Update<QueryState<Response, Error>>, key?: Key) => void
    refetch: (key?: Key) => Promise<Response | undefined>
    emptyCache: () => void
}

export function createQuery<Response = any, Error = any, Key extends NotUndefined = any>(
    options: QueryOptions<Response, Error, Key>
): CreateQueryReturn<Response, Error, Key> {
    const [cache, setCache] = createSignal<Record<string, QueryState<Response, Error>>>({});

    const enabled = () => {
        if(!options.enabled) return true
        return options.enabled()
    }

    const setEntry = (update: Update<Partial<QueryState<Response, Error>>>, key = options.key()) => {
        const id = sha1(key);
        setCache((current) => ({
          ...current,
          [id]: {
            ...current[id],
            ...(update instanceof Function ? update(current[id]) : update),
          },
        }));
      };

    const refetch = async (key = options.key()): Promise<Response | undefined> => {
        if(!enabled()) return;
        try {
            setEntry({ isLoading: true, data: undefined, error: undefined }, key)
            const data = await options.queryFn(key);
            options.onSuccess?.(key, data)
            setEntry({ isLoading: false, data, error: undefined }, key)
            return data;
        } catch (e) {
            setEntry({ isLoading: false, data: undefined, error: e as Error }, key)
            options.onError?.(key, e as Error)
        } finally {
            options.onSettled?.(key)
        }
    }

    refetch(options.key())

    createRoot(() => {
        createEffect(() => {
            const id = sha1(options.key())
            if(!(id in cache())) {
                refetch(options.key())
            }
        })
    })

    return {
        data: (key = options.key()) => cache()[sha1(key)]?.data ?? undefined,
        setEntry,
        error: (key = options.key()) => cache()[sha1(key)]?.error ?? undefined,
        isError: (key = options.key()) => !!(cache()[sha1(key)]?.error),
        refetch,
        isLoading: (key = options.key()) => cache()[sha1(key)]?.isLoading ?? false,
        emptyCache: () => setCache({})
    };
};
