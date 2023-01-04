import { createVNode } from "../vnode";

export function renderSlots(slots){

    // 创建虚拟接点并返回
    return createVNode('div',{},slots)

}