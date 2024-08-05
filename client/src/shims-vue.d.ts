/*
 * Copyright (c) 2023-2024 Josef Müller.
 */

/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
