
// import{createApp} from'../../lib/guide-mini-vue.esm.js'
import{createRenderer} from'../../lib/guide-mini-vue.esm.js'
import {App} from './app.js'


const renderer= createRenderer({
    createElement(type){},
    patchProps(el,key,val){},
    insert(el,container){}
})
const createApp=renderer.createApp;

// Vue 3
const rootContainer= document.querySelector('#app')
createApp(App).mount(rootContainer)