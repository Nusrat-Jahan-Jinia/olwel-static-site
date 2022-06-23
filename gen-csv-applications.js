/**
 * gen-csv-applications
 *
 * @author masum
 * @since September 07, 2017
 */
const knex = require('./knex')
const transform = require('stream-transform')
const stringify = require('csv-stringify')
const dateFormat = require('date-fns/format')

let query = knex.select('*').from('doctor_applications')

const args = process.argv.slice(2)
if (args.length > 0) {
    const dateArg = args[0]
    if (!dateArg.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.error('Usage: SCRIPT [yyyy-mm-dd')
        process.exit(1)
    }

    const startDate = new Date(dateArg)
    query = query.where('created_at', '>=', startDate)
}

const stream = query.orderBy('created_at').stream()

const transformer = transform(function (row) {
    const data = Object.assign({}, row)

    data.name = fixName(row.name)
    data.phone = prependQuote(fixPhone(row.phone))
    data.created_at = dateFormat(row.created_at, 'MMM Do, YYYY hh:mm a')
    data.present_address_postcode = fixPostcode(row.present_address_postcode)
    data.permanent_address_postcode = fixPostcode(row.permanent_address_postcode)

    return data
})

const stringifier = stringify({header: true})

stream
    .pipe(transformer)
    .pipe(stringifier)
    .pipe(process.stdout)

stream.on('end', function () {
    process.exit(0)
})

function fixName(val) {
    if (!val) {
        return ''
    }

    let name = val.replace(/^Dr([^.])/, 'Dr. $1')
    name = name.replace(/\.([^\s])/g, '. $1')

    return name
}

function fixPhone(val) {
    if (!val) {
        return val
    }

    let phone = val.replace(/^01/, '+8801')
    if (phone.startsWith('+')) {
        return phone
    }

    phone = val.replace(/^09/, '+8809')
    if (phone.startsWith('+')) {
        return phone
    }

    phone = val.replace(/^00/, '+')
    if (phone.startsWith('+')) {
        return phone
    }
}

function prependQuote(val) {
    if (!val) {
        return val
    }

    return `'${val}`
}

function fixPostcode(val) {
    if (!val) {
        return val
    }

    return val.replace(/^0/, "'0")
}
