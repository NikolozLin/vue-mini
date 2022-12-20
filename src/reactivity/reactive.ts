import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"
import { track, trigger } from "./effect"

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'

}
export function isReactive(value) { //通过readonly 来判断
    return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(value) { //通过readonly 来判断
    return !!value[ReactiveFlags.IS_READONLY]
}
function createActiveObject(raw: any, baseHandlers) {
    return new Proxy(raw, baseHandlers)

}

export function isProxy (value)  {
    //只有是proxy 对象 才能再handler代理对象中取得两个标签值
    return isReadonly(value) || isReactive(value);

}


export function reactive(raw) {
    return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers)

}

