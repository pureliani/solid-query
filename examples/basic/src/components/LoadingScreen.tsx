export const LoadingDots = () => {
    return (
        <div class="flex items-center gap-3">
            <span class="bg-rose-500 animate-ping w-4 h-4 rounded-full" style={{"animation-delay": '50ms'}} />
            <span class="bg-rose-500 animate-ping w-3.5 h-3.5 rounded-full" style={{"animation-delay": '150ms'}} />
            <span class="bg-rose-500 animate-ping w-3 h-3 rounded-full" style={{"animation-delay": '200ms'}} />
            <span class="bg-rose-500 animate-ping w-2.5 h-2.5 rounded-full" style={{"animation-delay": '250ms'}} />
            <span class="bg-rose-500 animate-ping w-2.5 h-2.5 rounded-full" style={{"animation-delay": '300ms'}} />
        </div>
    )
}

export const LoadingScreen = () => {
    return (
        <div class="bg-white fixed top-0 left-0 flex gap-3 items-center justify-center w-screen h-screen">
            <LoadingDots />
        </div>
    )
}
