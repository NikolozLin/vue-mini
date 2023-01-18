import { h, provide, inject } from "../../../lib/guide-mini-vue.esm.js";

const Provider = {
    name: "Provider",
    setup() {
        provide("foo", "fooVal");
        provide("bar", "barVal");
    },
    render() {
        return h('div', {}, [
            h('p', {}, 'Provider'),
            h(ProviderTwo),
        ])
    }
}

const ProviderTwo = {
    name: "Provider2",
    setup() {
        provide('foo',"fooVal2")

        const foo = inject('foo');
        return {
            foo
        }
    },
    render() {
        return h('div', {}, [
            h('p', {}, `Provider2:--${this.foo}`),
            h(Consumer),
        ])
    }
}
const Consumer = {
    name: "Consumer",
    setup() {
        const foo = inject("foo");
        const bar = inject("bar");
        // const baz = inject("baz",'defauetVal');
        const baz = inject("baz",()=>'defauetVal');    

        return {
            foo,
            bar,
            baz
        }
    },
    render() {
        return h('div', {}, `Consumer:- ${this.foo} - ${this.bar}-${this.baz }`);
    }
}

export const App = {
    name: 'App',
    setup() { },
    render() {
        return h("div", {}, [h('p', {}, "provide/inject"), h(Provider)])
    }
}