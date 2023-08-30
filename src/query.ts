import { batch, createEffect, createRoot, createSignal } from "solid-js";
import type { Accessor, Setter } from "solid-js";

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
export function createQuery<Response, Error, Key extends string | number>(
    options: QueryOptions<Response, Error, Key>
): CreateQueryReturn<Response, Error, Key> {
    const [cache, setCache] = createSignal<Record<Key, QueryState<Response | undefined, Error>>>({} as any);

    const enabled = () => {
        if(!options.enabled) return true
        return options.enabled()
    }

    const setField = <
    QS extends QueryState<Response, Error>, 
    F extends keyof QS>(key: Key, field: F, val: QS[F]) => {
        setCache((current) => ({
            ...current,
            [key]: {
                ...current[key],
                [field]: val
            }
        }))
    }

    const setData = (data: Response, key = options.key()) => {
        batch(() => {
            setField(key, "data", data)
            setField(key, "error", undefined)
        })
    }

    const setError = (error: Error, key = options.key()) => {
        batch(() => {
            setField(key, "data", undefined)
            setField(key, "error", error)
        })
    }

    const refetch = async (key = options.key()): Promise<Response | undefined> => {
        if(!enabled()) return;

        try {
            setField(key, "isLoading", true)
            const data = await options.queryFn(key);
            setData(data, key);
            return data;
        } catch (e) {
            setError(e as Error, key);
        } finally {
            batch(() => {
                setField(key, "isLoading", false)
                setField(key, "isLoadingInitial", false)
            })
        }
    }

    if(enabled()) {
        setField(options.key(), "isLoadingInitial", true)
        refetch(options.key())
    }

    createRoot(() => {
        createEffect(() => {
            if(!(options.key() in cache())) {
                refetch(options.key())
            }
        })
    })

    return {
        data: () => cache()[options.key()]?.data ?? undefined,
        setData,
        error: () => cache()[options.key()]?.error ?? undefined,
        isError: () => cache()[options.key()]?.error !== undefined,
        setError,
        refetch,
        isLoading: () => cache()[options.key()]?.isLoading ?? false,
        isLoadingInitial: () => cache()[options.key()]?.isLoadingInitial ?? false,
        cache,
        setCache
    };
};
