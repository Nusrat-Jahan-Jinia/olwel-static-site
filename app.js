/**
 * app
 *
 * @author masum
 * @since August 30, 2017
 */
const NODE_ENV = process.env.NODE_ENV || 'development'

if ((NODE_ENV === 'production') || (NODE_ENV === 'staging')) {
    require('dotenv').config({path: '/usr/local/etc/olwel-form.conf'})
} else {
    require('dotenv')
}

const express = require('express')
const morgan = require('morgan')
// const multer = require('multer')
const bodyParser = require('body-parser')
// const sanitizeFilename = require('sanitize-filename')
const nameCase = require('namecase')
// const fs = require('fs')
// const path = require('path')

const knex = require('./knex')
const mailer = require('./mailer')

const PORT = process.env.PORT || 3000
// const TEMP_UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || '/var/tmp/olwel-upload'
// const CV_DIR = process.env.CV_DIR || '/var/olwel/application_cvs'

const MORGAN_FORMAT = NODE_ENV === 'development' ? 'dev' : 'short'

// Some setup
process.on('unhandledRejection', function (error) {
    console.log('Unhandled Rejection', error.stack)
    process.exit(1)
})

process.on('uncaughtException', function (error) {
    console.log('Uncaught Exception', error.stack)
    process.exit(1)
})

// // Check the TEMP_UPLOAD_DIR
// try {
//     fs.statSync(TEMP_UPLOAD_DIR)
// } catch (error) {
//     if (error.code || error.code === 'ENOENT') {
//         console.log(`Creating the TEMP_UPLOAD_DIR: ${TEMP_UPLOAD_DIR}`)
//         fs.mkdirSync(TEMP_UPLOAD_DIR)
//     }
// }
//
// // Check the CV_DIR
// try {
//     fs.statSync(CV_DIR)
// } catch (error) {
//     if (error.code || error.code === 'ENOENT') {
//         console.log(`Creating the CV_DIR: ${CV_DIR}`)
//         fs.mkdirSync(CV_DIR)
//     }
// }

const app = express()
app.use(morgan(MORGAN_FORMAT))

// const upload = multer({
//     dest: TEMP_UPLOAD_DIR,
//     limits: {
//         fileSize: 4 * 1024 * 1024,      // Max file size for upload: 4MB
//         fields: 100,
//     }
// })

// console.log(`Temp upload dir: ${TEMP_UPLOAD_DIR}`)
// console.log(`CV dir: ${CV_DIR}`)

app.get('/form/health', async function (req, res, next) {
    try {
        await knex.count('* as count').from('doctor_applications')
        res.type('text/plain')
        res.send('OK')
    } catch (err) {
        next(err)
    }
})

app.post('/form/apply/:lang', bodyParser.urlencoded({extended: true}), async function (req, res, next) {
    try {
        const data = req.body
        // const fileName = req.file ? sanitizeFilename(req.file.originalname) : null

        const applicantName = nameCase(data.name)
        data.name = applicantName

        console.log(`Received application for ${applicantName}`)

        // db
        const [recId] = await knex('doctor_applications').insert({
            name: data.name,
            phone: data.phone,
            email: data.email,
            present_address: data.present_address,
            permanent_address: data.permanent_address,
            mbbs_year: data.mbbs_year,
            mbbs_institute: data.mbbs_institute,
            current_course_name: data.current_course_name,
            current_course_institute: data.current_course_institute,
            bmdc_reg_number: data.bmdc_reg_number,
            experience_1: data.experience_1,
            experience_2: data.experience_2,
            experience_3: data.experience_3,
            int_cc: data.int_cc ? 1 : 0,
            int_hv: data.int_hv ? 1 : 0,
        })
        data.recordId = recId

        // const dstDir = path.join(CV_DIR, recId.toString())
        // try {
        //     fs.mkdirSync(dstDir)
        // } catch (error) {
        //     if (error.code !== 'EEXIST') {
        //         throw error;
        //     }
        // }
        //
        // let dstPath
        // if (fileName) {
        //     const srcPath = req.file.path
        //     dstPath = path.join(dstDir, fileName)
        //     fs.renameSync(srcPath, dstPath)
        // } else {
        //     dstPath = null
        // }
        const dstPath = null

        await mailer.sendApplicationMail(data, dstPath)

        if (req.params.lang === 'en') {
            res.redirect('/en/apply-ok.html')
        } else {
            res.redirect('/apply-ok.html')
        }
    } catch (err) {
        next(err)
    }
})

app.post('/form/contact', bodyParser.urlencoded({extended: true}), async function (req, res, next) {
    try {
        const data = req.body
        data.name = nameCase(data.name)

        if (typeof data.interest !== 'undefined') {
            data.interest = (typeof data.interest === 'object')
                ? data.interest.join(',')
                : data.interest || 'none'
        }

        console.log(`Received contact request from ${data.name} with phone ${data.phone}`)

        await knex('contact_requests').insert({
            name: data.name,
            phone: data.phone,
            email: data.email,
            interest: data.interest,
            queries: data.queries,
        })

        await mailer.sendContactMail(data)

        res.redirect('/contact-ok.html')
    } catch (err) {
        next(err)
    }
})

//
// Error handling
//

app.use(function (err, req, res, next) {
    console.log(err.stack)

    if (res.headersSent) {
        return next(err)
    }

    res.status(500)
        .send({
            error: err.message || 'Unexpected server error'
        })
})

const listener = app.listen(PORT, function (err) {
    if (err) {
        throw err
    }

    console.log(`Started olwel form server in "${NODE_ENV}" environment on port: ${listener.address().port}`)
    console.log(`Mail enabled: ${mailer.MAIL_ENABLED}`)
})
