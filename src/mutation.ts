import { createSignal, type Accessor } from "solid-js";

export type MutationOptions<Arguments = any, Response = any, Error = any> = {
    onSuccess?: (data: Response) => void
    onError?: (error: Error) => void
    mutationFn: (args: Arguments) => Promise<Response>
}

export type CreateMutationReturn<Arguments = any, Response = any> = {
    isLoading: Accessor<boolean>,
    mutate: (args: Arguments) => Promise<Response | undefined>
}

export function createMutation<Arguments = any, Response = any, Error = any>(
    options: MutationOptions<Arguments, Response, Error>
): CreateMutationReturn<Arguments, Response>
export function createMutation<Arguments = any, Response = any, Error = any>(
    options: MutationOptions<Arguments, Response, Error>
): CreateMutationReturn<Arguments, Response> {
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
