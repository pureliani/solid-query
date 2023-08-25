import { createSignal, type Accessor } from "solid-js";

export type MutationOptions<Argument = void, Response = any, Error = any> = {
    onSuccess?: (data: Response) => void
    onSettled?: () => void
    onError?: (error: Error) => void
    mutationFn: (arg: Argument) => Promise<Response>
}

export type CreateMutationReturn<Argument = void, Response = any> = {
    isLoading: Accessor<boolean>,
    mutate: (arg: Argument) => Promise<Response | undefined>
}

export function createMutation<Argument = void, Response = any, Error = any>(
    options: MutationOptions<Argument, Response, Error>
): CreateMutationReturn<Argument, Response> {
    const [isLoading, setIsLoading] = createSignal<boolean>(false);

    const mutate = async (arg: Argument): Promise<Response | undefined> => {
        try {
            setIsLoading(true);
            const data = await options.mutationFn(arg);
            options.onSuccess?.(data);
            return data;
        } catch (e) {
            options.onError?.(e as Error);
        } finally {
            options.onSettled?.()
            setIsLoading(false);
        }
    };
    
    return {
        isLoading,
        mutate
    };
};
