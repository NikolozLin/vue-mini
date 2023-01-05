import { createVNode } from "../vnode";

export function renderSlots(slots, name) {

    const slot = slots[name]
    if (slot) {
        // 创建虚拟接点并返回
        return createVNode('div', {}, slot)
    }
}