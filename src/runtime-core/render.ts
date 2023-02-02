import { effect } from "../reactivity/effect";
import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";



export function createRenderer(options) {
    const { createElement,
        patchProps: hotPatchProp,
        insert,
        setText: hotSetText,
        setElementText: hotSetElementText,
        remove: hotRemove
    } = options;

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
        if (n1 == null) {//init
            const { children } = n2;
            const textNode = n2.el = document.createTextNode(children)
            container.append(textNode)

        } else {//update
            const el = n2.el = n1.el;
            if (n2.children !== n1.children) {
                console.log("update Text 类型节点");
                hotSetText(el, n2.children)

            }

        }


    }
    function processFragment(n1: any, n2: any, container: any, parentComponent) {
        mountChildren(n2.children, container, parentComponent);
    }
    //================================================================
    function processElement(n1: any, n2: any, container: any, parentComponent) {

        if (!n1) {//新增
            mountElement(n2, container, parentComponent)

        } else {
            patchElement(n1, n2, container, parentComponent)
        }
    }

    // 更新元素
    function patchElement(n1, n2, container, parentComponent) {
        console.log('patchElement');

        const oldProps = n1.props || {}
        const newProps = n2.props || {}


        const el = n2.el = n1.el;
        // 更新 Props
        patchProps(el, oldProps, newProps)

        // 更新子节点
        patchChildren(n1, n2, el, parentComponent)
    }
    function patchProps(el, oldProps, newProps) {
        //检查新增
        for (const key in newProps) {
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if (prevProp !== nextProp) {
                hotPatchProp(el, key, prevProp, nextProp)
            }
        }
        // 检查原有的key
        for (const key in oldProps) {

            if (key! in newProps) {
                hotPatchProp(el, key, oldProps[key], null)
            }

        }


    }
    // //判断 props 是否有更新
    // function hasPropsChange(prevProps,nextProps){
    //     const nextKeys= Object.keys(nextProps);
    //     if(nextKeys.length !== Object.keys(prevProps).length){
    //         return true
    //     }
    //     for(let i =0 ;i<nextKeys.length;i++){
    //         const key =nextKeys[i];
    //         if(nextProps[key]!== prevProps[key]){
    //             return true
    //         }
    //     }
    //     return false
    // }
    function patchChildren(n1, n2, container, parentComponent) {
        const prevShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const { shapeFlag } = n2;
        const c2 = n2.children;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 除移旧子节点
                unmountChildren(n1.children)
            }
            //设置新的string节点
            if (c1 !== c2) {
                hotSetElementText(container, c2)
            }

        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hotSetElementText(container, "");
                mountChildren(n2.children, container, parentComponent)
            } else {
                // Array 更新成 Array
                // 需要用到 Diff 算法提高性能
            }

        }
    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hotRemove(el)
        }

    }
    function mountElement(vnode: any, container: any, parentComponent) {

        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = createElement(vnode.type))
        // 两种可能 string array
        const { children, shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {

            el.textContent = children;
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent)

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

            hotPatchProp(el, key, null, val);
        }

        // container.append(el)
        insert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent)
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