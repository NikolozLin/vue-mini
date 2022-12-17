import { reactive } from "../reactive";
import { effect ,stop } from "../effect";

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        })

        let nextAge;
        effect(() => {
            nextAge = user.age + 1;

        })
        expect(nextAge).toBe(11)

        //update
        user.age++;
        expect(nextAge).toBe(12)
    });


    it('should return runner function', () => {
        // 实际effect(fn) 得到过一个runner函数 ， runner 可以执行fn 并取得返回值
        // effect(fn) -> function(runner) -> fn -> return res
        let foo = 10;
        const runner = effect(() => {
            foo++;
            return "foo"
        })

        expect(foo).toBe(11);
        const r = runner();
        expect(foo).toBe(12);
        expect(r).toBe("foo");
    });

    it('scheduler', () => {
        // 1. 通过effect 参数二 给定scheduler的fn
        // 2. effect第一次执行的时候 还会执行fn
        // 3. 当响应式对象 set update 不会很执行fn 而是执行schedule
        // 4. 如果是执行 runner 的时候，会再次执行fn 
        let dummy;
        let run;
        const scheduler = jest.fn(() => {
            run = runner;
        })

        const obj = reactive({ foo: 1 });
        const runner = effect(() => {
            dummy = obj.foo;
        },
            {
                scheduler
            }
        );

        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on frist trigger
        obj.foo++;
        expect(scheduler).toHaveBeenCalled();
        // // should not run yet
        expect(dummy).toBe(1)
        // //  manualy run 
        run();
        expect(dummy).toBe(2)

    });
 

    it('stop', () => {
        let dummy
        const obj = reactive({ prop: 1 })
        const runner = effect(() => {
          dummy = obj.prop
        })
        obj.prop = 2
        expect(dummy).toBe(2)
        stop(runner)         // 停止响应式更新
        obj.prop = 3
        expect(dummy).toBe(2)
    
        // stopped effect should still be manually callable
        runner()
        expect(dummy).toBe(3)
      })
    

      it('onStop', () => {
        const obj = reactive({
            foo:1
        })
        const onStop=jest.fn()

        let dummy;
        const runner =effect(()=>{
            dummy=obj.foo
        },{
            onStop
        })
        
        stop(runner);
        expect(onStop).toBeCalledTimes(1)
      });
});