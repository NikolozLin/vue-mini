import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
    console.log("createComponentInstance", parent);

    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent? parent.provides:{},
        parent,
        emit: () => { }
    }
    component.emit = emit.bind(null, component) as any;
    return component;
}


export function setupComponent(instance) {

    initProps(instance, instance.vnode.props);
    // TODO
    initSlots(instance, instance.vnode.children)

    setupStatefulComponent(instance)

}

function setupStatefulComponent(instance: any) {

    const Component = instance.type;

    //ctx
    instance.proxy = new Proxy(
        { _: instance },
        PublicInstanceProxyHandlers
    )


    const { setup } = Component;
    if (setup) {
        // 不同组件的current不同 就需要在这进行不同的赋值，才能在setup正常使用
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null)//用完清空
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult: any) {
    // function  Object
    // TODO function

    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;
    // if (Component.render) { // 当前只有runtim-core 假设他必定有值
    instance.render = Component.render;
    // }
}


let currentInstance = null;

export function getCurrentInstance() {
    return currentInstance
}

function setCurrentInstance(instance) {
    currentInstance = instance;
}