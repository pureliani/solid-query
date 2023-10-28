import { createQuery, broadcastQuery } from '@gapu/solid-query';
import axios from 'axios';
import { Show, createSignal } from 'solid-js';
import { LoadingScreen } from './components/LoadingScreen';
import { LoadingDots } from './components/LoadingDots';
import { ErrorScreen } from './components/ErrorScreen';

type QueryResponse = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

const [postId, setPostId] = createSignal(1);
const [isEnabled, setIsEnabled] = createSignal(true)

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
  setError,
} = createQuery({
  key: () => postId(),
  enabled: ()=> isEnabled(),
  queryFn: async (key) => {
    const { data: post } = await axios.get<QueryResponse>(
      `https://jsonplaceholder.typicode.com/posts/${key}`
    );
    return post;
  },
});

broadcastQuery({
  cache,
  setCache,
  channel: 'posts-query-channel',
});

const onNext = () => setPostId((current) => current + 1);
const onPrev = () => setPostId((current) => current - 1);
const onToggle = () => setIsEnabled((current) => !current)
const onRefetchSecond = () => refetch(2);
const onClearCache = () => setCache({});
const onUpdateThird = () =>
  setData(
    {
      id: 44,
      body: 'hello',
      title: '2',
      userId: 9,
    },
    3
  );

const ActionButtons = () => {
  return (
    <div class="flex items-center gap-2 my-2 flex-wrap">
      <button
        class="px-6 py-2 border rounded hover:bg-gray-200"
        onClick={onPrev}
      >
        Prev
      </button>
      <button
        class="px-6 py-2 border rounded hover:bg-gray-200"
        onClick={onNext}
      >
        Next
      </button>
      <button
        class="px-6 py-2 border rounded hover:bg-gray-200"
        onClick={() => refetch()}
      >
        Refresh
      </button>
      <button
        class="px-6 py-2 border rounded hover:bg-gray-200"
        onClick={onRefetchSecond}
      >
        Refetch 2nd
      </button>
      <button
        class="px-6 py-2 border rounded hover:bg-gray-200"
        onClick={onUpdateThird}
      >
        Update 3rd
      </button>
      <button
        class="px-6 py-2 border rounded hover:bg-gray-200"
        onClick={onToggle}
      >
        Toggle
      </button>
      <button
        class="px-6 py-2 border rounded hover:bg-gray-200"
        onClick={onClearCache}
      >
        Clear Cache
      </button>
    </div>
  );
};

export default function Home() {
  return (
    <div class="max-w-md mx-auto mt-8">
      <Show when={isLoadingInitial()}>
        <LoadingScreen />
      </Show>
      <Show when={isError()}>
        <ErrorScreen />
      </Show>
      <ActionButtons />
      <Show when={!isLoadingInitial() && !isError()}>
        <div class="flex flex-col items-start gap-4">
          <li>
            <span>Post ID: </span>
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
  );
}
