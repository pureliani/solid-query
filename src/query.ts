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
): CreateQueryReturn<Response, Error, Key> {
    const [cache, setCache] = createSignal<Record<Key, QueryState<Response | undefined, Error>>>({} as any);

    const enabled = () => {
        if(!options.enabled) return true
        return options.enabled()
    }

    function setEntry<
        Merge extends boolean,
        Entry extends Merge extends true ? Partial<QueryState<Response, Error>> : QueryState<Response, Error>
    >( key: Key, entry: Entry, merge: Merge = true as Merge): void {
        setCache((current) => ({
            ...current,
            [key]: merge ? { ...current[key], ...entry } : entry
        }));
    }

    const setData = (data: Response, key = options.key()) => {
        setEntry(key, {
            data,
            error: null,
            isLoading: false
        })
    }

    const setError = (error: Error, key = options.key()) => {
        setEntry(key, {
            data: null,
            error: error,
            isLoading: false
        })
    }

    const refetch = async (key = options.key()): Promise<Response | undefined> => {
        if(!enabled()) return;
        try {
            setEntry(key, { isLoading: true }, true)
            const data = await options.queryFn(key);
            options.onSuccess?.(key, data)
            setData(data, key);
            return data;
        } catch (e) {
            setError(e as Error, key);
            options.onError?.(key, e as Error)
        } finally {
            setEntry(key, { isLoading: false }, true)
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
        setData,
        setEntry,
        error: (key = options.key()) => cache()[key]?.error ?? undefined,
        isError: (key = options.key()) => cache()[key]?.error !== null,
        setError,
        refetch,
        isLoading: (key = options.key()) => cache()[key]?.isLoading ?? false,
        cache,
        setCache
    };
};
