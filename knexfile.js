module.exports = {

    development: {
        client: 'mysql',
        connection: {
            database: 'olwel',
            user: 'root',
        },
        pool: {
            min: 1,
            max: 2
        },
    },

    staging: {
        client: 'mysql',
        connection: {
            database: 'olwel_staging',
            user: 'web_app',
            password: 'loss-primacy-fair',
        },
        pool: {
            min: 1,
            max: 2
        },
    },

    production: {
        client: 'mysql',
        connection: {
            database: 'olwel',
            user: 'web_app',
            password: 'loss-primacy-bairn',
        },
        pool: {
            min: 2,
            max: 4
        },
    },

}
