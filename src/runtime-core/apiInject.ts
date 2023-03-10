import { getCurrentInstance } from "./component";


// 由于使用了 getCurrentInstance ，所以两个方法必须在setup 函数内使用
export function provide(key, value) {

    const currentInstance: any = getCurrentInstance();

    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides == parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value;
    }
}

export function inject(key,defaultValue) {

    const currentInstance: any = getCurrentInstance();

    if (currentInstance) {
        const { parent } = currentInstance;

        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {

            return parentProvides[key];
        } else if (defaultValue) {

            if(typeof defaultValue=='function'){
                return  defaultValue();
            }
            return defaultValue;
        }
    }

}