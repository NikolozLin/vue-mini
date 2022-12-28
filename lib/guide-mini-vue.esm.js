function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function  Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if (Component.render) { // 当前只有runtim-core 假设他必定有值
    instance.render = Component.render;
    // }
}

function render(vnode, container) {
    //patch
    patch(vnode);
}
function patch(vnode, container) {
    // 处理组件
    processCpmponent(vnode);
}
function processCpmponent(vnode, container) {
    moundtComponent(vnode);
}
function moundtComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 根开始 递归先转换成虚拟节点
            // component --> vnode
            //所有的操作逻辑 基于vnode 做处理
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, pros, children) {
    return createVNode(type, pros, children);
}

export { createApp, h };
