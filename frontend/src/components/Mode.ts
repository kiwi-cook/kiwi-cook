import {defineComponent, h} from 'vue'

const mode = process.env.NODE_ENV
console.log('mode', mode)

export default defineComponent({
    props: {
        mode: {
            type: String,
            default: 'development'
        }
    },
    setup(props: { mode: string }, options: { slots: any }) {
        if (props.mode === mode) {
            console.log('rendering', props.mode)
            return () => h('div', {class: 'mode'}, options.slots.default())
        }
    }
})
