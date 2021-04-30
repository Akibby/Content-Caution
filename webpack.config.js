const { resolve } = require('path')
const webpack = require('webpack')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: ['./ext.js'],
  output: {
    filename: 'ext.js',
    path: resolve('build')
  },
  devtool: !isProd && 'eval'
}