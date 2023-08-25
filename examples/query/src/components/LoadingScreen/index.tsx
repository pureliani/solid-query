import { LoadingDots } from '../LoadingDots';

export const LoadingScreen = () => {
  return (
    <div class="bg-white fixed top-0 left-0 flex gap-3 items-center justify-center w-screen h-screen">
      <LoadingDots />
    </div>
  );
};
