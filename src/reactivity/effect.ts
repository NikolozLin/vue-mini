
class ReactiveEffect {
    private _fn: any

    constructor(fn, public scheduler?) {
        this._fn = fn;
    }
    run() {
        acitveEffect = this;
        return this._fn();

    }
}

const targetMap = new Map();
export function track(target, key) {
    // 需要容器暂存依赖
    // target -> key -> key
    let depMap = targetMap.get(target)
    if (!depMap) {
        depMap = new Map();
        targetMap.set(target, depMap)
    }
    let dep = depMap.get(key)
    if (!dep) {
        dep = new Set();
        depMap.set(key, dep)
    }
    //收集依赖
    dep.add(acitveEffect)
}

export function trigger(target, key) {
    let depMap = targetMap.get(target)
    let dep = depMap.get(key);

    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

let acitveEffect;
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    _effect.run()
    return _effect.run.bind(_effect)
}