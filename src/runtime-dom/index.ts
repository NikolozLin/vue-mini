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
            //  类型disabled 这些boolean的属性要特殊处理 才能和实际效果一样
            // 设置 元素的class 也需要特殊处理，因为支持字符串、数组、对象 都要进行序列化再进行添加
            el.setAttribute(key, nextVal);
        }
    }
}

function insert(el, parent) {

    parent.append(el);
}
function setText(el, text) {
    el.textContent = text;
}
function setElementText(el,text){
    el.textContent=text
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }

}

const renderer: any = createRenderer({
    createElement,
    patchProps,
    insert,
    setText,
    setElementText,
    remove
})


export function createApp(...args) {

    return renderer.createApp(...args);// 这里参数传递到runtime-core 的createApp（）中 
}

export * from "../runtime-core";
