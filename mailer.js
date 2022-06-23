/**
 * mailer
 *
 * @author masum
 * @since Sep 1, 2017
 */
const MAIL_API_KEY = process.env.MAIL_API_KEY
const MAIL_FROM = 'Olwel <olwel@mg.InnovatorsLab.net>'
const MAIL_APPLICATION_CC = 'apply@olwel.com'
const MAIL_CONTACT_CC = 'contact@olwel.com'

const MAIL_ENABLED = !!MAIL_API_KEY

const nameCase = require('namecase')
const mailgun = MAIL_ENABLED
    ? require('mailgun-js')({
        apiKey: MAIL_API_KEY,
        domain: 'mg.innovatorslab.net'
    })
    : {
        messages: function () {
            return {
                send: function () {
                    console.log('Skipping mail')
                    return Promise.resolve()
                }
            }
        }
    }

function sendApplicationMail(data, cvPath) {
    if (!MAIL_API_KEY) {
        return Promise.resolve()
    }

    const applicantName = nameCase(data.name)

    const options = {
        from: MAIL_FROM,
        to: MAIL_APPLICATION_CC,
        subject: `Application for ${applicantName}`,
        text: JSON.stringify(data, null, 4),
    }
    if (cvPath) {
        options.attachment = cvPath
    }

    return mailgun.messages().send(options)
        .then(function () {
            console.log(`Sent application mail for ${applicantName}`)
        })
}

function sendContactMail(data) {
    if (!MAIL_API_KEY) {
        return Promise.resolve()
    }

    const options = {
        from: MAIL_FROM,
        to: MAIL_CONTACT_CC,
        subject: `Contact Request for ${data.phone}`,
        text: JSON.stringify(data, null, 4)
    }

    return mailgun.messages().send(options)
        .then(function () {
            console.log(`Sent contact mail for ${data.phone}`)
        })
}

module.exports = {
    sendApplicationMail,
    sendContactMail,
    MAIL_ENABLED,
}
