import { createQuery } from '@gapu/solid-query';
import axios from 'axios';
import { Show, createSignal } from 'solid-js';
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
  setEntry,
  refetch,
  emptyCache,
} = createQuery({
  key: () => postId(),
  enabled: () => isEnabled(),
  queryFn: async (key) => {
    const { data: post } = await axios.get<QueryResponse>(
      `https://jsonplaceholder.typicode.com/posts/${key}`
    );
    return post;
  },
});

const onNext = () => setPostId((current) => current + 1);
const onPrev = () => setPostId((current) => current - 1);
const onToggle = () => setIsEnabled((current) => !current)
const onRefetchSecond = () => refetch(2);
const onUpdateThird = () =>
  setEntry({
    data: {
      id: 1000,
      body: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ratione quas voluptate similique ducimus tempora, vel odit! Debitis sequi enim numquam?',
      title: 'Lorem ipsum dolor',
      userId: 1
    }
  }, 3);

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
        onClick={emptyCache}
      >
        Empty Cache
      </button>
    </div>
  );
};

export default function Home() {
  return (
    <div class="max-w-md mx-auto mt-8">
      <Show when={isError()}>
        <ErrorScreen />
      </Show>
      <ActionButtons />
      <Show when={!isLoading() && !isError()}>
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
        </div>
      </Show>
      <Show when={isLoading()}>
        <LoadingDots />
      </Show>
    </div>
  );
}
