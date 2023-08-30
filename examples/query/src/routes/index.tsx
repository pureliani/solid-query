import { createQuery, broadcastQuery } from "@gapu/solid-query"
import axios from "axios"
import { Show, createSignal } from "solid-js"
import { LoadingDots, LoadingScreen } from "~/components/LoadingScreen"
import { SomethingWentWrongScreen } from "~/components/SomethingWentWrongScreen"

type QueryResponse = {
    id: number
    title: string
    body: string
    userId: number
}
const [postId, setPostId] = createSignal(1)

export const { 
    data,
    error,
    isError,
    isLoading,
    setData,
    isLoadingInitial,
    refetch,
    cache,
    setCache,
    setError
} = createQuery({
    key: () => postId(),
    queryFn: async (key) => {
        const { data: post } = await axios.get<QueryResponse>(`https://jsonplaceholder.typicode.com/posts/${key}`);
        return post;
    }
});

broadcastQuery({
    cache,
    setCache,
    channel: 'posts-query-channel',
})

export default function Home() {
    const onNext = () => setPostId(current => current + 1)
    const onPrev = () => setPostId(current => current - 1)
    const refetch2nd = () => refetch(2)
    const update3rd = () => setData({ id: 44, body: 'hello', title: '2', userId: 9 }, 3)

    return (
    <div class='max-w-md mx-auto mt-8'>
        <Show when={isLoadingInitial()}>
            <LoadingScreen />
        </Show>
        <Show when={isError()}>
            <SomethingWentWrongScreen />
        </Show>
        <Show when={!isLoadingInitial() && !isError()}>
            <div class="flex items-center gap-2 border shadow p-3 mb-4 flex-wrap">
                <h2 class="text-xl text-gray-500">Post #{postId()}</h2>
                <button class="px-6 py-2 border rounded hover:bg-gray-200" onClick={onPrev}>Prev</button>
                <button class="px-6 py-2 border rounded hover:bg-gray-200" onClick={onNext}>Next</button>
                <button class="px-6 py-2 border rounded hover:bg-gray-200" onClick={() => refetch()}>Refresh</button>
                <button class="px-6 py-2 border rounded hover:bg-gray-200" onClick={refetch2nd}>Refetch 2nd</button>
                <button class="px-6 py-2 border rounded hover:bg-gray-200" onClick={update3rd}>Update 3rd</button>
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
