export function createComponentInstance(vnode) {

    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    }
    return component;
}


export function setupComponent(instance) {

    // TODO
    // initProps()
    // initSlots()

    setupStatefulComponent(instance)

}

function setupStatefulComponent(instance: any) {

    const Component = instance.type;

    //ctx
    instance.proxy = new Proxy({}, {
        get(target, key) {
            //从setupState取值
            const { setupState } = instance;
            if (key in setupState) {
                 return setupState[key];
            }

        }
    })


    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
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

