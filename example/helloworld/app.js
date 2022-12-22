export const App = {
    runder(){
        return  h("div",'hi,'+this.msg)

    }

    setup(){
        return {
            msg:'mini-vue'
        }
    }
}