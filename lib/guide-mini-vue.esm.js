const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasChanged = (value, newValue) => {
    return Object.is(value, newValue);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// 切换换成驼峰命名
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const captialize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
//获取 props 传递的方法名
const toHandlerKey = (str) => {
    return str ? 'on' + captialize(str) : '';
};

let acitveEffect;
let shouleTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        if (!this.active) { //如果 执行了stop  走下面流程
            return this._fn();
        }
        acitveEffect = this;
        shouleTrack = true;
        const result = this._fn();
        shouleTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // 需要容器暂存依赖
    // target -> key -> key
    let depMap = targetMap.get(target);
    if (!depMap) {
        depMap = new Map();
        targetMap.set(target, depMap);
    }
    let dep = depMap.get(key);
    if (!dep) {
        dep = new Set();
        depMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    //收集依赖
    if (dep.has(acitveEffect))
        return;
    dep.add(acitveEffect);
    acitveEffect.deps.push(dep); //记录当前effect 被收集到哪里
}
/**
 * 判断当前是否有活动的 effect 需要收集
 * @returns
 */
function isTracking() {
    return shouleTrack && acitveEffect !== undefined;
}
function trigger(target, key) {
    let depMap = targetMap.get(target);
    let dep = depMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // extend alias Object.assign
    extend(_effect, options);
    // _effect.onStop = options.onStop;
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        // 方法为shallow Readonly
        if (shallow)
            return res;
        // 允许嵌套 reactive对象，所以需要 如果取的值 res 是对象需要调用reactive()方法
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            //依赖收集 
            track(target, key);
        }
        return res;
    };
}
function createSetter(isReadonly = false) {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖 
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set failed, because is readonly`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.log(`target ${target} 必须是一个对象`);
        return;
    }
    return new Proxy(target, baseHandlers);
}
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 如果是值是对象类型 需要对比原始值
        if (hasChanged(newValue, this._rawValue))
            return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffect(this.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    if (isRef(ref))
        return ref.value;
    return ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newValue) {
            if (isRef(target[key]) && !isRef(newValue)) {
                return target[key].value = newValue;
            }
            else {
                return Reflect.set(target, key, newValue);
            }
        },
    });
}

function emit(instance, event, ...args) {
    console.log('emit' + event);
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // TODO
    // atts属性
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        //从setupState取值
        const { setupState, props } = instance;
        // if (key in setupState) {
        //     return setupState[key];
        // }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children];
    const { vnode } = instance;
    //判断当前vnode是否有插槽内容
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        if (Object.prototype.hasOwnProperty.call(children, key)) {
            const value = children[key]; //插槽内容
            slots[key] = (props) => normalizeSlotsValue(value(props)); //把插槽内容 存到 $slots 中
            //子组件运行会执行 renderSlot 方法会在 $slots 中取出对应名的插槽 
            // 插槽的方法并传入参数执行，最后 renderSlot返回 vnode 给子组件的render 函数  
        }
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    console.log("createComponentInstance", parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    // TODO
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    //ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // 不同组件的current不同 就需要在这进行不同的赋值，才能在setup正常使用
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null); //用完清空
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function  Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if (Component.render) { // 当前只有runtim-core 假设他必定有值
    instance.render = Component.render;
    // }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShpeFlag(type),
        el: null
    };
    //children
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 添加插槽的shapeFlag
    // 判断是否有 插槽 1.type是组件 2. children 是object对象 
    if (vnode.shapeFlag && 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVNode(Text, {}, text);
}
function getShpeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 根开始 递归先转换成虚拟节点
                // component --> vnode
                //所有的操作逻辑 基于vnode 做处理
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement, patchProps, insert } = options;
    function render(vnode, container) {
        //patch
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parentComponent = null) {
        // TODO 判断vnode 是不是 element
        const { type, shapeFlag } = n2;
        // Fragment 类型 只处理children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // 处理元素
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 处理组件
                    processCpmponent(n1, n2, container, parentComponent);
                }
        }
    }
    //================================================================
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children);
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    //================================================================
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) { //新增
            mountElement(n2, container, parentComponent);
        }
    }
    function mountElement(vnode, container, parentComponent) {
        // const el = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = createElement(vnode.type));
        // 两种可能 string array
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
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
            patch(null, v, container, parentComponent);
        });
    }
    // ========================================================================
    function processCpmponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVnode, container);
    }
    function setupRenderEffect(instance, initialVnode, container) {
        //添加依赖收集，单出发trigger时，回重新渲染节点
        effect(() => {
            if (!instance.isMounted) {
                // init
                console.log("init");
                const { proxy } = instance; // 代理对象 处处setup 的内容 然render函数的this 指向setup的内容
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(null, subTree, container, instance);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // update
                console.log('update');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
                initialVnode.el = subTree.el;
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}

function h(type, pros, children) {
    return createVNode(type, pros, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        // 创建虚拟接点并返回
        // 作用域插槽为了传递参数 ，它的slot 为fucntion
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

// 由于使用了 getCurrentInstance ，所以两个方法必须在setup 函数内使用
function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides == parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue == 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, val) {
    // 处理绑定事件
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProps,
    insert
});
function createApp(...args) {
    return renderer.createApp(...args); // 这里参数传递到runtime-core 的createApp（）中 
}

export { createApp, createRenderer, createTextVnode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
