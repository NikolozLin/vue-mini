// import pkg from './package.json' assert { type: "json" };
import typescript from '@rollup/plugin-typescript';

export default {
    input: './src/index.ts',
    output: [

        {
            format: 'cjs',
            // file: pkg.main
            file: 'lib/guide-mini-vue.cjs.js'
        },
        {
            format: 'es',
            // file: pkg.module
            file: 'lib/guide-mini-vue.esm.js'
        }

    ],

    plugins: [typescript()]
}