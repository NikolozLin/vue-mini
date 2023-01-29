import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    private _rawValue: any
    private _value: any
    public dep
    public __v_isRef = true

    constructor(value) {
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }

    get value() {
        trackRefValue(this)
        return this._value;
    }
    set value(newValue) {

        // 如果是值是对象类型 需要对比原始值
        if (hasChanged(newValue, this._rawValue)) return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffect(this.dep)
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}

export function ref(value) {
    return new RefImpl(value)

}


export function isRef(ref) {
    return !!ref.__v_isRef
}

export function unRef(ref) {

    if (isRef(ref)) return ref.value
    return ref

}

export function proxyRefs(objectWithRefs) {

    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key))
        },

        set(target, key, newValue) {
            if (isRef(target[key]) && !isRef(newValue)) {
                return target[key].value = newValue;
            } else {
                return Reflect.set(target, key, newValue)
            }

        },
    })

}