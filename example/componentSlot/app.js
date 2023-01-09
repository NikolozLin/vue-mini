import { h  ,createTextVnode } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";


export const App = {
    name: 'App',
    render() {
        const app = h("div", {}, "App");
        // <Foo><p>123<p/><Foo/>
        // const foo = h(Foo, {}, h('p', {}, '123'))  
        // 当children 是一个数组，Foo需要将数组转化成虚拟节点
        // 具名插槽 children 参数传递Object ，后续可以通过key指定渲染位置
        const foo = h(Foo, {}, {
            header: ({ age }) => [
                h('p', {}, 'header' + age),
                createTextVnode('hi ')
            ],
            footer: () => h('p', {}, 'footer')
        })
        return h("div", {}, [app, foo])

    },

    setup() {
        return {}
    }
}