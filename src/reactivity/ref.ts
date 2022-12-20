class RefImpl{
    private _value:any
    constructor(value){
        this._value=value;
    }

    get value(){
        return this._value;

    }
    set value(val){

        return

    }
}

export function ref(value) {
    return new RefImpl(value)
    
}