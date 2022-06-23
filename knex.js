/**
 * knex
 *
 * @author masum
 * @since Sep 1, 2017
 */
const knexFile = require('./knexfile')
const knex = require('knex')

const env = process.env.NODE_ENV || 'development'
const knexConfig = knexFile[env]

if (!knexConfig) {
    throw new Error(`Could not find settings for environment "${env}" in knexfile.js`)
}

module.exports = knex(knexConfig)
