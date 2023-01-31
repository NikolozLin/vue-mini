import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
    name: "app",
    setup() {
        const props= ref({
            foo:"foo",
            bar:"bar",
        });

        const count = ref(0);
        
        const onClick = () => {
            count.value+=1;
        };

        const onChangePropsDemo1=()=>{
            props.value.foo="newFoo"
        };
        const onChangePropsDemo2=()=>{
            props.value.foo=undefined;

        };
        const onChangePropsDemo3=()=>{
            props.value={
                foo:"foo"
            }
        };

        return {
            props,
            count,
            onClick,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3,
        }
    },
    render() { 
        return h(
            "div", 
            { id: "root",...this.props },
            [
                h('div', {}, 'count:' + this.count ),//依赖收集
                h("button", { onClick: this.onClick, }, 'click'),
                h("button", { onClick: this.onChangePropsDemo1, }, 'changeProps-更新'),
                h("button", { onClick: this.onChangePropsDemo2, }, 'changeProps-清空'),
                h("button", { onClick: this.onChangePropsDemo3, }, 'changeProps-替换'),
            ]
        )

    }

}