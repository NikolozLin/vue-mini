import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    name:'Foo',
    setup() {
    
        return {}
    },
    render() {
        const foo = h('p', {}, 'foo');
        return h('div', {}, [
            renderSlots(this.$slots, 'header'),
            foo, 
            renderSlots(this.$slots, 'footer')
        ]); //最终slot 填充位置为Foo组件的children里面
    }
}