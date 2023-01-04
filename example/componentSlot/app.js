import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";


export const App = {
    render() {
        const app = h("div", {}, "App");
        // <Foo><p>123<p/><Foo/>
        // const foo = h(Foo, {}, h('p', {}, '123'))  
        // 当children 是一个数组，Foo需要将数组转化成虚拟节点
        const foo = h(Foo, {},[ h('p', {}, '123'), h('p',{},'456')]) 
        return h("div", {}, [app, foo])

    },

    setup() {
        return {}
    }
}