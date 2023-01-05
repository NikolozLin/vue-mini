import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    name:'Foo',
    setup() {
    
        return {}
    },
    render() {
        const foo = h('p', {}, 'foo');

        const age=8;//作用域插槽
        return h('div', {}, [
            renderSlots(this.$slots, 'header',{
                age
            }),
            foo, 
            renderSlots(this.$slots, 'footer')
        ]); //最终slot 填充位置为Foo组件的children里面
    }
}