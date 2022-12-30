import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self=null;
export const App = {
    render() {
        window.self=this; // 测试 this.$el
        return h(
            "div",
            {
                id: "root",
                class: ["red", "hard"],
                onClick(){
                    console.log("click");
                },
                onMousedown(){
                    console.log('mousedown');
                }
            },
            // string 类型的children
            // 'hi,' + this.msg 
            
            // //Object类型的children
            // [
            //     h('p', { class: 'red' }, 'hi'),
            //     h('p', { class: 'blue' }, 'mini-vue'),
            // ]
            
            [
                h('div', { class: 'red' }, 'hi'+this.msg),
                h(Foo,{count:1}),
            ]


        )

    },

    setup() {
        return {
            msg: 'mini-vue'
        }
    }
}