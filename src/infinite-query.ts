import { createSignal } from "solid-js";

export type Page<Response> = {
    number: number
    data: Response
}

export type InfiniteQueryOptions<Response, Error> = {
    initialPage?: number
    onFetchPageSuccess?: (e: Response) => void
    onFetchPageError?: (e: Error) => void
    onFetchPage: (page: number) => Promise<Response>
    lazy?: () => boolean
}

export const createInfiniteQuery = <Response, Error>(options: InfiniteQueryOptions<Response, Error>) => {
    const lazy = () => {
        if (options.lazy) { return options.lazy(); }
        return false;
    };

    const initialPage = options.initialPage ?? lazy() ? 0 : 1

    const [pages, setPages] = createSignal<Page<Response>[]>([]);
    const [currentPage, setCurrentPage] = createSignal(initialPage);
    const [isLoadingInitial, setIsLoadingInitial] = createSignal<boolean>(false);
    const [isLoading, setIsLoading] = createSignal<boolean>(false);

    const nth = async (n: number): Promise<Page<Response> | undefined> => {
        const existing_page = pages().find(p => p.number === n);

        if (existing_page) {
            return existing_page;
        } 

        try {
            setIsLoading(true);
            const new_page = await options.onFetchPage(n);
            options.onFetchPageSuccess?.(new_page);

            const as_object: Page<Response> = { data: new_page, number: n }; 
            setPages(current => [...current, as_object]);

            return as_object;
        } catch(e) {
            options.onFetchPageError?.(e as Error);
            return;
        } finally {
            setIsLoading(false);
        }
    };

    const refetch = async (n: number): Promise<Page<Response> | undefined> => {
        const exists = pages().find(p => p.number === n);
        if (!exists) return;
        try {
            setIsLoading(true);
            const _data = await options.onFetchPage(n);
            options.onFetchPageSuccess?.(_data);

            const data_object = { data: _data, number: n };
            setPages(prev => {
                const updated = prev.filter(p => p.number = n);
                updated.push(data_object);
                return updated;
            });
            return data_object;
        } catch (e) {
            options.onFetchPageError?.(e as Error);
        } finally {
            setIsLoading(false);
        }
    }; 

    if (!lazy()) {
        setIsLoadingInitial(true);
        // eslint-disable-next-line solid/reactivity
        nth(initialPage).finally(() => {
            setIsLoadingInitial(false);
        });
    }

    const next = async (): Promise<Page<Response> | undefined> => {
        const p = await nth(currentPage() + 1);
        if(p) { setCurrentPage(currentPage() + 1); }
        return p;
    };

    const prev = async (): Promise<Page<Response> | undefined> => {
        return await nth(currentPage() - 1);
    };

    return {
        prev,
        next,
        pages,
        refetch,
        isLoading,
        isLoadingInitial
    };
};
