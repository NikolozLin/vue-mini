import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    //patch
    patch(vnode, container)
}

function patch(vnode, container) {
    // TODO 判断vnode 是不是 element
    if (typeof vnode.type === 'string') {
        processElement(vnode, container) 
    } else if (isObject(vnode.type)) {
        // 处理组件
        processCpmponent(vnode, container)
    }

}
function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {

    const el = (vnode.el=document.createElement(vnode.type))
    // 两种可能 string array
    const { children } = vnode;
    if(typeof children ==='string'){

        el.textContent = children;
    }else if(Array.isArray(children)){
        mountChildren(vnode,el)
       
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el)
}
function mountChildren(vnode,container){
    vnode.children.forEach((v)=>{
        patch(v,container)
    })
}

// ========================================================================
function processCpmponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}
function mountComponent(initialVnode: any, container) {
    const instance = createComponentInstance(initialVnode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVnode,container);
}

function setupRenderEffect(instance,initialVnode, container) {
    const {proxy}=instance ;// 代理对象 处处setup 的内容
    const subTree = instance.render.call(proxy);


    patch(subTree, container)

    //
    initialVnode.el=subTree.el;
}


