export const extend = Object.assign;

export const isObject = (val) => {
    return val !== null && typeof val === 'object'
}

export const hasChanged = (value, newValue) => {
    return Object.is(value, newValue)
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)



   // 切换换成驼峰命名
export  const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: String) => {
        return c ? c.toUpperCase() : '';
    })

}
const captialize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
//获取 props 传递的方法名
export const toHandlerKey = (str: string) => {
    return str ? 'on' + captialize(str) : ''
}