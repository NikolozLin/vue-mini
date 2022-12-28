import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
    render() {
        return h(
            "div",
            {
                id: "root",
                class: ["red", "hard"]
            },
            // string 类型的children
            'hi,' + this.msg 
            
            // //Object类型的children
            // [
            //     h('p', { class: 'red' }, 'hi'),
            //     h('p', { class: 'blue' }, 'mini-vue'),
            // ]


        )

    },

    setup() {
        return {
            msg: 'mini-vue'
        }
    }
}