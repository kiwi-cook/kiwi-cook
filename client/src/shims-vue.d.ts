/*
 * Copyright (c) 2023 Josef Müller.
 */

/* eslint-disable */
declare module '*.vue' {
    import type {DefineComponent} from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}