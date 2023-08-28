import { batch, createEffect, createSignal } from "solid-js";
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
export function createQuery<Response, Error>(
    options: QueryOptions<Response, Error>
): CreateQueryReturn<Response, Error> {
    const [cache, setCache] = createSignal<Record<Key, QueryState<Response | undefined, Error>>>({});

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

    const setData = (data: Response, key?: Key) => {
        const _key = key ?? options.key()
        batch(() => {
            setField(_key, "data", data)
            setField(_key, "error", undefined)
        })
    }

    const setError = (error: Error, key?: Key) => {
        const _key = key ?? options.key()
        batch(() => {
            setField(_key, "data", undefined)
            setField(_key, "error", error)
        })
    }

    const refetch = async (key?: Key): Promise<Response | undefined> => {
        const _key = key || options.key()
        if(!enabled()) return;

        try {
            setField(_key, "isLoading", true)
            const data = await options.queryFn(_key);
            setData(data, key);
            return data;
        } catch (e) {
            setError(e as Error, key);
        } finally {
            batch(() => {
                setField(_key, "isLoading", false)
                setField(_key, "isLoadingInitial", false)
            })
        }
    }

    if(enabled()) {
        setField(options.key(), "isLoadingInitial", true)
        refetch(options.key())
    }

    createEffect(() => {
        if(!(options.key() in cache())) {
            refetch(options.key())
        }
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
