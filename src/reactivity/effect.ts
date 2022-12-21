import { extend } from "../shared";


let acitveEffect;
let shouleTrack = false;
class ReactiveEffect {
    private _fn: any
    deps = []
    active = true;
    onStop?: () => void

    constructor(fn, public scheduler?: Function | undefined) {
        this._fn = fn;
    }
    run() {
        if (!this.active) {  //如果 执行了stop  走下面流程
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
                this.onStop()
            }
            this.active = false;
        }
    }

}
function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    })
}

const targetMap = new Map();
export function track(target, key) {
    if (!isTracking()) return;
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

    trackEffects(dep)
}

export function trackEffects(dep){
     //收集依赖
     if(dep.has(acitveEffect))return;
     dep.add(acitveEffect)
     acitveEffect.deps.push(dep)  //记录当前effect 被收集到哪里
}

/**
 * 判断当前是否有活动的 effect 需要收集
 * @returns 
 */
export function isTracking() {
    return shouleTrack && acitveEffect !== undefined;
}

export function trigger(target, key) {
    let depMap = targetMap.get(target)
    let dep = depMap.get(key);

    triggerEffect(dep)
}

export function triggerEffect(dep){
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)

    // extend alias Object.assign
    extend(_effect, options)
    // _effect.onStop = options.onStop;
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect;
    return runner
}

export function stop(runner) {
    runner.effect.stop()
}