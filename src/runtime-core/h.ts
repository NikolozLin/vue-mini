import { createVNode } from "./vnode";

export function h(type, pros?, children?) {
    
    return createVNode(type, pros, children);
}