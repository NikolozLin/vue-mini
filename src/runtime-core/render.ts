import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    //patch
    patch(vnode, container)
}

function patch(vnode, container) {
    // TODO 判断vnode 是不是 element
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理元素
        processElement(vnode, container)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件
        processCpmponent(vnode, container)
    }

}
function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {

    const el = (vnode.el = document.createElement(vnode.type))
    // 两种可能 string array
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {

        el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el)

    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        // 处理绑定事件
        const isOn = (key: string) => /^on[A-Z]/.test(key)
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val);
        }
    }

    container.append(el)
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container)
    })
}

// ========================================================================
function processCpmponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}
function mountComponent(initialVnode: any, container) {
    const instance = createComponentInstance(initialVnode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance;// 代理对象 处处setup 的内容
    const subTree = instance.render.call(proxy);


    patch(subTree, container)

    //
    initialVnode.el = subTree.el;
}


