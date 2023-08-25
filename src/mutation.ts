import { Accessor, createSignal } from "solid-js";

export type MutationOptions<Arguments, Response, Error> = {
    onSuccess?: (data: Response) => void
    onError?: (error: Error) => void
    mutationFn: (args: Arguments) => Promise<Response>
}

export type CreateMutationReturn<Arguments, Response> = {
    isLoading: Accessor<boolean>,
    mutate: (args: Arguments) => Promise<Response | undefined>
}
export function createMutation<Arguments = unknown, Response = unknown, Error = unknown>(options: MutationOptions<Arguments, Response, Error>): CreateMutationReturn<Arguments, Response>
export function createMutation<Arguments, Response, Error>(options: MutationOptions<Arguments, Response, Error>): CreateMutationReturn<Arguments, Response> {
    const [isLoading, setIsLoading] = createSignal<boolean>(false);

    const mutate = async (args: Arguments): Promise<Response | undefined> => {
        setIsLoading(true);
        try {
            const data = await options.mutationFn(args);
            options.onSuccess?.(data);
            return data;
        } catch (e) {
            options.onError?.(e as Error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return {
        isLoading,
        mutate
    };
};
