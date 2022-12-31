import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self=null;
export const App = {
    render() {
        window.self=this; // 测试 this.$el
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