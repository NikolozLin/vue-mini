import { createVNode } from "../vnode";

export function renderSlots(slots, name, props) {

    const slot = slots[name]
    if (slot) {
        // 创建虚拟接点并返回
        // 作用域插槽为了传递参数 ，它的slot 为fucntion
        if (typeof slot === 'function') {

            return createVNode('div', {}, slot(props))
        }
    }
}