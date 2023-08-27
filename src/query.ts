import { createSignal } from "solid-js";
import type { Accessor } from "solid-js";

export type QueryOptions<Response, Error> = {
    queryFn: () => Promise<Response>
    key: Accessor<string | number>
    enabled?: () => boolean
    onSuccess?: (key: string | number, data: Response) => void
    onError?: (key: string | number, error: Error) => void
}

export type CreateStateReturn<Response, Error> = {
    data: Accessor<Response | undefined>
    setData: (data: Response | undefined) => void
    error: Accessor<Error | undefined>
    setError: (error: Error | undefined) => void
    refetch: () => Promise<Response | undefined>
    isError: Accessor<boolean>
    isLoading: Accessor<boolean>
    isLoadingInitial: Accessor<boolean>
}

export type CreateQueryReturn<Response, Error> = CreateStateReturn<Response, Error> & {
    cache: Record<string | number, CreateStateReturn<Response, Error>>
}

export function createQueryState<Response, Error>(options: QueryOptions<Response, Error>): CreateStateReturn<Response, Error>
export function createQueryState<Response, Error>(options: QueryOptions<Response, Error>): CreateStateReturn<Response, Error> {
    const [data, setData] = createSignal<Response | undefined>()
    const [error, setError] = createSignal<Error | undefined>(undefined);
    const [isLoadingInitial, setIsLoadingInitial] = createSignal<boolean>(false);
    const [isLoading, setIsLoading] = createSignal<boolean>(false);
    const isError = () => error() !== undefined

    const onSuccess = (data: Response) => {
        setData(() => data)
        setError(undefined)
        options.onSuccess?.(options.key(), data);
    }

    const onError = (error: Error) => {
        setError(() => error)
        setData(undefined)
        options.onError?.(options.key(), error)
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

    return {
        data,
        setData,
        error,
        isError,
        setError,
        refetch,
        isLoading,
        isLoadingInitial,
    };
}

export function createQuery<Response = unknown, Error = unknown>(options: QueryOptions<Response, Error>): CreateQueryReturn<Response, Error>
export function createQuery<Response, Error>(options: QueryOptions<Response, Error>): CreateQueryReturn<Response, Error> {
    const cache: Record<string | number, CreateStateReturn<Response, Error>> = {}

    const getOrCreateState = (): CreateStateReturn<Response, Error> => {
        const key = options.key();
        if (!(key in cache)) {
            cache[key] = createQueryState({ ...options, key: () => key});
        }
        return cache[key];
    }

    return {
        data: () => getOrCreateState().data(),
        setData: (d) => getOrCreateState().setData(d),
        error: () => getOrCreateState().error(),
        isError: () => getOrCreateState().isError(),
        setError: (e) => getOrCreateState().setError(e),
        refetch: () => getOrCreateState().refetch(),
        isLoading: () => getOrCreateState().isLoading(),
        isLoadingInitial: () => getOrCreateState().isLoadingInitial(),
        cache
    };
};
