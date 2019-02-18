'use strict'

const a = require('assert')
const pump = require('pump')
const {parse} = require('ndjson')
const {createReadStream} = require('fs')

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)
const isArr = a => Array.isArray(a)
const isNonEmptyStr = s => 'string' === typeof s && s.length > 0

const checkDataPoint = (ap) => {
	a.ok(isObj(ap), 'ap')

	// todo: validate stop/station IDs
	if (ap.station !== null) a.ok(isNonEmptyStr(ap.station), 'ap.station')
	if (ap.stop !== null) a.ok(isNonEmptyStr(ap.stop), 'ap.stop')

	a.ok(isArr(ap.platforms), 'ap.platforms')
	for (let i = 0; i < ap.platforms.length; i++) {
		const pl = ap.platforms[i]
		const n = `ap.platforms[${i}]`

		if (pl.name !== null) a.ok(isNonEmptyStr(pl.name), n + '.name')
		a.ok(Array.isArray(pl.connections), n + '.connections')
		for (let j = 0; j < pl.connections.length; j++) {
			const c = pl.connections[j]
			const _n = `${n}.connections[${i}]`
			if (c.line !== null) a.ok(isNonEmptyStr(c.line), _n + '.line')
			// todo: validate stop/station ID
			if (c.direction !== null) a.ok(isNonEmptyStr(c.direction), n + '.direction')
		}
		a.equal(typeof pl.position, 'number', n + '.position')
	}

	if (ap.location !== null) {
		a.ok(isObj(ap.location), 'ap.location')
		a.equal(typeof ap.location.latitude, 'number', 'ap.location.latitude')
		a.equal(typeof ap.location.longitude, 'number', 'ap.location.longitude')
	}

	if (ap.bssid !== null) a.ok(isNonEmptyStr(ap.bssid), 'ap.bssid')
	if (ap.mac !== null) a.ok(isNonEmptyStr(ap.mac), 'ap.mac')
	if (ap.bssid === null && ap.mac === null) a.fail('ap.bssid or ap.mac must be given')

	if (ap.operator !== null) a.ok(isNonEmptyStr(ap.operator), 'ap.operator')
}

const onError = (err) => {
	if (!err) return;
	console.error(err)
	process.exitCode = 1
}

const parser = parse()
let row = 0
parser.on('data', ap => {
	row++
	try {
		checkDataPoint(ap)
	} catch (err) {
		err.row = row
		onError(err)
	}
})
parser.once('end', () => {
	console.info(`Checked ${row} rows.`)
})

pump(
	createReadStream(require.resolve('./data.ndjson'), {encoding: 'utf8'}),
	parser,
	onError
)
