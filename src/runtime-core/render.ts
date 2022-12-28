import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    //patch
    patch(vnode, container)
}

function patch(vnode, container) {
    // TODO 判断vnode 是不是 element
    // processElement()
   
    // 处理组件
    processCpmponent(vnode, container)

}

function processCpmponent(vnode: any, container: any) {
    moundtComponent(vnode, container)
}
function moundtComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)
    setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
    const subTree = instance.render();


    patch(subTree,container)

}

