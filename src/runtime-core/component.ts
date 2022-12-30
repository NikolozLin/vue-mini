import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {

    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    }
    return component;
}


export function setupComponent(instance) {

    initProps(instance, instance.vnode.props);
    // TODO
    // initSlots()

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
        const setupResult = setup(shallowReadonly(instance.props));
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

