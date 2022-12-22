import { computed } from "../computed";
import { reactive } from "../reactive";

describe('computed', () => {

    it('base test', () => {
        const user = reactive({
            age: 1
        });

        const age = computed(() => {
            return user.age
        })

        expect(age.value).toBe(1)
    });


    it('should compute lazily', () => {
        const value = reactive({
            foo: 1
        })
        const getter = jest.fn(() => {
            return value.foo
        })
        const cValue = computed(getter)

        // lazy
        // 没有执行cValue.value的话，不会执行getter函数
        expect(getter).not.toHaveBeenCalled()

        expect(cValue.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(1)

        // should not computed again
        cValue.value
        expect(getter).toHaveBeenCalledTimes(1)

        // should not computed until needed
        value.foo = 2
        expect(getter).toHaveBeenCalledTimes(1)

        // it should compute
        expect(cValue.value).toBe(2)
        expect(getter).toHaveBeenCalledTimes(2)

        // should not computed again
        cValue.value
        expect(getter).toHaveBeenCalledTimes(2)


    });

}); 