import { ShapeFlags } from "../shared/ShapeFlags";

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text')

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShpeFlag(type),
        el: null // 渲染完成最终在hteml上的元素
    };

    //children
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
    }

    // 添加插槽的shapeFlag
    // 判断是否有 插槽 1.type是组件 2. children 是object对象 

    if (vnode.shapeFlag && ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}

export function createTextVnode(text: string) {
    return createVNode(Text, {}, text)

}
function getShpeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT

}

