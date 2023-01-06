import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children];

    const { vnode } = instance;
    //判断当前vnode是否有插槽内容
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {

        normalizeObjectSlots(children, instance.slots)
    }
}

function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        if (Object.prototype.hasOwnProperty.call(children, key)) {
            const value = children[key];//插槽内容
            slots[key] = (props) => normalizeSlotsValue(value(props)) //把插槽内容 存到 $slots 中
            //子组件运行会执行 renderSlot 方法会在 $slots 中取出对应名的插槽 
            // 插槽的方法并传入参数执行，最后 renderSlot返回 vnode 给子组件的render 函数  

        }
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}