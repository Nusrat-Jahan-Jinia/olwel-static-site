module.exports = {
    /**
     * NOTE: Make sure /usr/local/etc/olwel-form.conf exists in production mode!
     */
    apps: [
        {
            name: 'olwel-form',
            script: 'app.js',
            out_file: '/var/log/olwel/form-out.log',
            error_file: '/var/log/olwel/form-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            env_staging: {
                NODE_ENV: 'staging',
            },
        },
    ],

    deploy: {
        production: {
            user: 'admin',
            host: 'server.olwel.com',
            ref: 'origin/master',
            repo: 'git@github.com:olwel/olwel-website.git',
            path: '/var/www/olwel',
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env production',
        },
        staging: {
            user: 'admin',
            host: 'staging.olwel.com',
            ref: 'origin/master',
            repo: 'git@github.com:olwel/olwel-website.git',
            path: '/var/www/olwel',
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env staging',
        },
    }
}
