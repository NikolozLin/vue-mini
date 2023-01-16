import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";


export const App = {
    name: 'App',
    render() {
        return h("div", {}, [h('p', {}, "current Instance"), h(Foo)])
    },

    setup() {
        const Instance = getCurrentInstance()
        console.log("App", Instance);
        return {}
    }
}