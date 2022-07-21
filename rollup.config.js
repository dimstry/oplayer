import path from 'path'
import fs from 'fs'
import babel from '@rollup/plugin-babel'
import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { globals } from './config'
import commonjs from '@rollup/plugin-commonjs'
import { DEFAULT_EXTENSIONS } from '@babel/core'
import InlineSvg from 'rollup-plugin-inline-svg'
import { terser } from 'rollup-plugin-terser'

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return (id) => pattern.test(id)
}

const resolveConfig = (packageDirName) => {
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `packages/${packageDirName}/package.json`), {
      encoding: 'utf-8'
    })
  )
  return {
    input: path.resolve(
      __dirname,
      `packages/${packageDirName}/src/index${packageDirName === 'core' ? '.umd' : ''}.ts`
    ),
    output: [
      {
        file: path.resolve(__dirname, `packages/${packageDirName}/dist/index.min.js`),
        format: 'umd',
        strict: false,
        name: globals[`@oplayer/${packageDirName}`],
        globals
      }
    ],
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({ extensions: [...DEFAULT_EXTENSIONS, '.ts'] }),
      typescript({
        tsconfig: path.resolve(__dirname, `packages/${packageDirName}/tsconfig.json`)
      }),
      commonjs(),
      InlineSvg(),
      babel({
        babelHelpers: 'runtime',
        configFile: path.resolve(__dirname, `babel.config.js`)
      }),
      terser()
    ]
  }
}

export default [
  resolveConfig('core'),
  resolveConfig('ui'),
  resolveConfig('hls'),
  resolveConfig('torrent')
]
