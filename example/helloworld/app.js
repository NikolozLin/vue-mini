import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";


export const App = {
    render() {
        return h(
            "div",{},
            [
                h('div', {}, 'App'),
                h(Foo,{
                    onAdd(){
                        console.log("onAdd")
                    }
                }),
            ]


        )

    },

    setup() {
        return {
            msg: 'mini-vue'
        }
    }
}