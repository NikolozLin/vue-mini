
import { createVNode } from "./vnode"

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 根开始 递归先转换成虚拟节点
                // component --> vnode
                //所有的操作逻辑 基于vnode 做处理
                const vnode = createVNode(rootComponent)

                render(vnode, rootContainer)
            }
        }
    }
}
