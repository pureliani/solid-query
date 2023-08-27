import { createQuery } from "@gapu/solid-query"
import axios from "axios"
import { Show, createSignal } from "solid-js"
import { LoadingDots, LoadingScreen } from "~/components/LoadingScreen"
import { SomethingWentWrongScreen } from "~/components/SomethingWentWrongScreen"

const [postId, setPostId] = createSignal(1)

type QueryResponse = {
    id: number
    title: string
    body: string
    userId: number
}

export const { 
    data, 
    error, 
    isError, 
    isLoading, 
    isLoadingInitial, 
    refetch, 
    clear,
    setData,
    setError
} = createQuery<QueryResponse>({
    key: () => postId(),
    queryFn: async () => {
        const { data: post } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${postId()}`);
        return post;
    }
});

export default function Home() {
    const onNext = () => setPostId(current => current + 1)
    const onPrev = () => setPostId(current => current - 1)

    return (
    <div class='max-w-md mx-auto'>
        <Show when={isLoadingInitial()}>
            <LoadingScreen />
        </Show>
        <Show when={isError()}>
            <SomethingWentWrongScreen />
        </Show>
        <Show when={!isLoadingInitial() && !isError()}>
            <div class="flex items-center gap-2">
                <h2 class="text-xl text-gray-500">Post #{postId()}</h2>
                <button class="px-6 py-2 border rounded hover:bg-gray-200" onClick={onPrev}>Prev</button>
                <button class="px-6 py-2 border rounded hover:bg-gray-200" onClick={onNext}>Next</button>
                <button class="px-6 py-2 border rounded hover:bg-gray-200" onClick={refetch}>Refresh</button>
            </div>

            <div class="flex flex-col items-start gap-4">
                <li>
                    <span>ID: </span>
                    <span>{data()?.id}</span>
                </li>

                <li>
                    <span>User ID: </span>
                    <span>{data()?.userId}</span>
                </li>

                <li>
                    <span>Title: </span>
                    <span>{data()?.title}</span>
                </li>
                
                <li>
                    <span>Body: </span>
                    <span>{data()?.body}</span>
                </li>

                <Show when={isLoading()}>
                    <LoadingDots />
                </Show>
            </div>
        </Show>
    </div>
    )
}
