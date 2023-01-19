import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";



export function createRenderer(options) {
    const { createElement, patchProps, insert } = options;

    function render(vnode, container) {
        //patch
        patch(vnode, container)
    }

    function patch(vnode, container, parentComponent = null) {
        // TODO 判断vnode 是不是 element
        const { type, shapeFlag } = vnode;

        // Fragment 类型 只处理children
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break;
            case Text:
                processText(vnode, container)

                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理元素
                    processElement(vnode, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 处理组件
                    processCpmponent(vnode, container, parentComponent)
                }
        }

    }

    //================================================================
    function processText(vnode: any, container: any) {

        const { children } = vnode;
        const textNode = vnode.el = document.createTextNode(children)
        container.append(textNode)
    }
    function processFragment(vnode: any, container: any, parentComponent) {
        mountChildren(vnode, container, parentComponent);
    }
    //================================================================
    function processElement(vnode: any, container: any, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement(vnode: any, container: any, parentComponent) {

        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = createElement(vnode.type))
        // 两种可能 string array
        const { children, shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {

            el.textContent = children;
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)

        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            // // 处理绑定事件
            // const isOn = (key: string) => /^on[A-Z]/.test(key)
            // if (isOn(key)) {
            //     const event = key.slice(2).toLowerCase();
            //     el.addEventListener(event, val)
            // } else {
            //     el.setAttribute(key, val);
            // }
 
            patchProps(el,key,val);
        }

        // container.append(el)
        insert(el,container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(v, container, parentComponent)
        })
    }

    // ========================================================================
    function processCpmponent(vnode: any, container: any, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }
    function mountComponent(initialVnode: any, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container);
    }

    function setupRenderEffect(instance, initialVnode, container) {
        const { proxy } = instance;// 代理对象 处处setup 的内容
        const subTree = instance.render.call(proxy);


        patch(subTree, container, instance)

        //
        initialVnode.el = subTree.el;
    }



    return {
        createApp:createAppAPI(render)
    }
}