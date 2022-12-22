import { render } from "./render"
import { createVNode } from "./vnode"

export function createApp(rootComponent){
    return {
        mount(rootContainer){
            // geng先转换成虚拟节点
            // component --> vnode
            //所有的操作逻辑 给予vnode 做处理
            const vnode = createVNode(rootComponent)

            render(vnode,rootContainer)
        }
    }
}

