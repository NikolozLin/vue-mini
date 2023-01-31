import { createRenderer } from '../runtime-core/render'

function createElement(type) {
    return document.createElement(type)
}

function patchProps(el, key, prevVal, nextVal) {
    // 处理绑定事件
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {

        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal)

    } else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);

        } else {

            el.setAttribute(key, nextVal);
        }
    }
}

function insert(el, parent) {

    parent.append(el);
}


const renderer: any = createRenderer({
    createElement,
    patchProps,
    insert
})


export function createApp(...args) {

    return renderer.createApp(...args);// 这里参数传递到runtime-core 的createApp（）中 
}

export * from "../runtime-core";
