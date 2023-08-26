import { createComputed, createEffect, createSignal, onMount } from "solid-js";
import type { Accessor } from "solid-js";

export type QueryOptions<Response, Error> = {
    queryFn: () => Promise<Response>
    key?: Accessor<string | number>
    enabled?: () => boolean
    onSuccess?: (data: Response) => void
    onError?: (error: Error) => void
}

export type CreateQueryReturn<Response, Error> = {
    data: Accessor<Response | undefined>
    error: Accessor<Error | undefined>
    clear: () => void
    refetch: () => Promise<Response | undefined>
    isError: Accessor<boolean>
    isLoading: Accessor<boolean>
    isLoadingInitial: Accessor<boolean>
}

export function createQuery<Response = unknown, Error = unknown>(options: QueryOptions<Response, Error>): CreateQueryReturn<Response, Error>
export function createQuery<Response, Error>(options: QueryOptions<Response, Error>): CreateQueryReturn<Response, Error> {
    const cache: Record<string, Response> = {}

    const [data, setData] = createSignal<Response | undefined>(undefined);
    const [error, setError] = createSignal<Error | undefined>(undefined);
    const [isError, setIsError] = createSignal<boolean>(false);
    const [isLoadingInitial, setIsLoadingInitial] = createSignal<boolean>(false);
    const [isLoading, setIsLoading] = createSignal<boolean>(false);

    const clear = () => {
        setError(undefined);
        setData(undefined);
        setIsError(false);
        setIsLoadingInitial(false);
        setIsLoading(false);
    };

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
            const _data = await options.queryFn();
            setData(() => _data);
            options.onSuccess?.(_data);
            setIsError(false);

            // update cache
            if(options?.key) {
                cache[options.key()] = _data;
            }

            return _data;
        } catch (e) {
            setError(() => e as Error);
            options.onError?.(e as Error);
            setIsError(true);
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

    let firstRun = true
    createEffect(() => {
        const key = options.key?.();
        if (!key) return;

        if (firstRun) {
            firstRun = false;
        } else {
            if (key in cache) {
                clear();
                setData(() => cache[key]);
            } else {
                refetch();
            }
        }
    })

    return {
        data,
        error,
        clear,
        refetch,
        isError,
        isLoading,
        isLoadingInitial,
    };
};
