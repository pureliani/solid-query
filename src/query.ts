import { createComputed, createEffect, createSignal, onMount } from "solid-js";
import type { Accessor, Setter } from "solid-js";

export type QueryOptions<Response, Error> = {
    queryFn: () => Promise<Response>
    key?: Accessor<string | number>
    enabled?: () => boolean
    onSuccess?: (data: Response) => void
    onError?: (error: Error) => void
}

export type CreateQueryReturn<Response, Error> = {
    data: Accessor<Response | undefined>
    setData: Setter<Response | undefined>
    error: Accessor<Error | undefined>
    setError: Setter<Error | undefined>
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
    const [isLoadingInitial, setIsLoadingInitial] = createSignal<boolean>(false);
    const [isLoading, setIsLoading] = createSignal<boolean>(false);

    const clear = () => {
        setError(undefined);
        setData(undefined);
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
            const __data = await options.queryFn();
            setData(() => __data);
            options.onSuccess?.(__data);

            // update cache
            if(options?.key) {
                cache[options.key()] = __data;
            }

            return __data;
        } catch (e) {
            setError(() => e as Error);
            options.onError?.(e as Error);
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
        isError: () => error() !== undefined,
        isLoading,
        isLoadingInitial,
        setData,
        setError
    };
};
