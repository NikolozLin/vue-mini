import { effect } from "../reactivity/effect";
import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";



export function createRenderer(options) {
    const { createElement, patchProps, insert } = options;

    function render(vnode, container) {
        //patch
        patch(null, vnode, container, null)
    }

    function patch(n1, n2, container, parentComponent = null) {
        // TODO 判断vnode 是不是 element
        const { type, shapeFlag } = n2;

        // Fragment 类型 只处理children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;
            case Text:
                processText(n1, n2, container)

                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理元素
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 处理组件
                    processCpmponent(n1, n2, container, parentComponent)
                }
        }

    }

    //================================================================
    function processText(n1, n2: any, container: any) {

        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children)
        container.append(textNode)
    }
    function processFragment(n1: any, n2: any, container: any, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    //================================================================
    function processElement(n1: any, n2: any, container: any, parentComponent) {

        if(!n1){//新增
            mountElement(n2, container, parentComponent)

        }else{
            patchElement(n1,n2,container)
        }
    }

    function patchElement(n1,n2,container){ 

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

            patchProps(el, key, val);
        }

        // container.append(el)
        insert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(null,v, container, parentComponent)
        })
    }

    // ========================================================================
    function processCpmponent(n1: any, n2: any, container: any, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }
    function mountComponent(initialVnode: any, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container);
    }

    function setupRenderEffect(instance, initialVnode, container) {
        //添加依赖收集，单出发trigger时，回重新渲染节点
        effect(() => {
            if (!instance.isMounted) {
                // init
                console.log("init");
                const { proxy } = instance;// 代理对象 处处setup 的内容 然render函数的this 指向setup的内容
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(null, subTree, container, instance)
                initialVnode.el = subTree.el;

                instance.isMounted = true;
            } else {
                // update
                console.log('update');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance)
                initialVnode.el = subTree.el;

            }
        })

    }

    return {
        createApp: createAppAPI(render)
    }
} 