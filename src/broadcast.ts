import { createEffect, createRoot } from "solid-js"
import type { Accessor, Setter } from "solid-js"
import type { QueryState } from "./query"

export type BroadcastQueryProps<Response = any, Error = any, Key extends string | number = string | number> = {
    channel: string
    initialize?: boolean
    cache: Accessor<Record<Key, QueryState<Response | undefined, Error>>>
    setCache: Setter<Record<Key, QueryState<Response | undefined, Error>>>
}

export type BroadcastQueryMessage<Response = any, Error = any, Key extends string | number = string | number> = {
    type: "SET"
    value: Record<Key, QueryState<Response | undefined, Error>>
} | {
    type: "GET"
}

export function broadcastQuery<Response = any, Error = any, Key extends string | number = string | number>(
    props: BroadcastQueryProps<Response, Error, Key>
): void {
    props.initialize ??= true
    let isInternalUpdate = false;
    const channel = new BroadcastChannel(props.channel)
    type M = BroadcastQueryMessage<Response, Error, Key>

    channel.onmessage = (m: MessageEvent<M>) => {
        if (m.data.type === "GET") {
            channel.postMessage({ type: "SET", value: props.cache() } as M)
        }
        if (m.data.type === "SET") {
            const newCache = m.data.value
            isInternalUpdate = true
            props.setCache((current) => ({ ...current, ...newCache }))
        }
    }

    createRoot(() => {
        createEffect(() => {
            const value = props.cache()
            if (isInternalUpdate) {
                isInternalUpdate = false;
                return
            }
            channel.postMessage({ type: "SET", value } as M)
        })
    })

    if(props.initialize) {
        channel.postMessage({ type: "GET" } as M)
    }
}
