import { createEffect, createSignal, untrack } from "solid-js";
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

export function createQuery<Response = unknown, Error = unknown>(options: QueryOptions<Response, Error>): CreateQueryReturn<Response, Error>
export function createQuery<Response, Error>(options: QueryOptions<Response, Error>): CreateQueryReturn<Response, Error> {
    const [cache, setCache] = createSignal<Record<string | number, Response | undefined>>({})
    const [error, setError] = createSignal<Error | undefined>(undefined);
    const [isLoadingInitial, setIsLoadingInitial] = createSignal<boolean>(false);
    const [isLoading, setIsLoading] = createSignal<boolean>(false);
    const isError = () => error() !== undefined
    const data = () => cache()[options.key()]
    let onSuccessFromCache = false

    const onSuccess = (data: Response) => {
        setError(undefined)
        options.onSuccess?.(data);
        if(onSuccessFromCache) return
        setCache(current => ({
            ...current,
            [options.key()]: data
        }))
        onSuccessFromCache = false
    }

    const onError = (error: Error) => {
        setError(() => error)
        options.onError?.(error)
        setCache(current => ({
            ...current,
            [options.key()]: undefined
        }))
    }

    const enabled = () => {
        if (options.enabled) {
            return options.enabled();
        }
        return true;
    };

    const refetch = async (): Promise<Response | undefined> => {
        if(!enabled()) return;

        try {
            setIsLoading(true)
            const data = await options.queryFn();
            onSuccessFromCache = false
            onSuccess(data);
            return data;
        } catch (e) {
            onError(e as Error);
        } finally {
            setIsLoading(false);
        }
    };

    if (enabled()) {
        setIsLoadingInitial(true);
        refetch().finally(() => {
            setIsLoadingInitial(false);
        });
    }

    let isFirstRun = true;
    createEffect(() => {
        const key = options.key();

        if (isFirstRun) {
            isFirstRun = false;
            return;
        }

        const cached = untrack(cache)[key]
        if (cached) {
            onSuccessFromCache = true
            onSuccess(cached);
        } else {
            refetch();
        }
    });

    return {
        data,
        error,
        isError,
        setError,
        cache,
        setCache,
        refetch,
        isLoading,
        isLoadingInitial,
    };
};
