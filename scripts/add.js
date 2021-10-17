#!/usr/bin/env node
'use strict'

const createHafas = require('db-hafas')
const chalk = require('chalk')
const autocompletePrompt = require('cli-autocomplete')
const switchPrompt = require('switch-prompt')
const textPrompt = require('text-prompt')
const rangePrompt = require('range-prompt')
const wifiChannels = require('wifi-channels/channels.json')
const {join: pathJoin} = require('path')
const {createWriteStream} = require('fs')

const ibnrRegex = /\d{7,}/
const hafas = createHafas('german-public-transport-wifis')
const formatSuggestion = s => ({title: s.name + ' – ' + s.id, value: s.id})
const suggestStations = async (query) => {
	if (query === '') return []
	if (ibnrRegex.test(query)) {
		try {
			const stop = await hafas.stop(query)
			return [formatSuggestion(stop)]
		} catch (err) {}
	}
	const stations = await hafas.locations(query, {
		poi: false, addresses: false, results: 5
	})
	return stations.map(formatSuggestion)
}

const query = (prompt, ...vals) => {
	return new Promise((resolve, reject) => {
		prompt(...vals).once('submit', resolve).once('abort', reject)
	})
}
const queryStation = (msg) => {
	return query(autocompletePrompt, chalk.bold(msg), suggestStations)
	.catch(() => null)
}
const queryBoolean = (msg) => {
	return query(switchPrompt, chalk.bold(msg), 'yes', 'no', false)
	.catch(() => false)
}
const queryNumber = (msg) => {
	return query(textPrompt, chalk.bold(msg))
	.then(val => {
		val = parseFloat(val)
		if (Number.isNaN(val)) throw new Error('invalid input')
		return val
	}, val => {
		throw new Error('rejected with ' + val)
	})
}
const queryText = (msg) => {
	return query(textPrompt, chalk.bold(msg))
	.catch(val => {
		throw new Error('rejected with ' + val)
	})
}
const macLikeRegex = /([0-9a-f]{2}\:){5}([0-9a-f]{2})/i
const queryMacLike = (msg) => {
	return queryText(msg)
	.then(val => {
		if (!macLikeRegex.test(val)) throw new Error('invalid address')
		return val.toLowerCase().trim()
	})
}

const channels = [].concat(
	...Object.values(wifiChannels)
	.map(byStd => Object.entries(byStd).map(([name, spec]) => ({...spec, name})))
).sort((a, b) => a.name - b.name)
const queryWifiChannel = (msg) => {
	const suggest = (query) => {
		const res = channels.filter(c => c.name.slice(0, query.length) === query)
		return Promise.resolve(res.map(({name, lower, upper}) => {
			return {value: name, title: `${name} ${lower}-${upper}MHz`}
		}))
	}
	return query(autocompletePrompt, msg, suggest)
}

const queryRange = (msg, min, max, step) => {
	return query(rangePrompt, chalk.bold(msg), {min, max, step, value: min})
	.catch(val => {
		throw new Error('rejected with ' + val)
	})
}

(async () => {
	const station = await queryStation('Which station is the access point at?')
	// todo: query `ap.stop`
	const name = await queryText('Name of the WiFi?')

	let mac = null, bssid = null, channel = null
	if (await queryBoolean('Do you know its MAC address?')) {
		mac = await queryMacLike('MAC address')
	}
	if (await queryBoolean('Do you know its BSSID?')) {
		bssid = await queryMacLike('BSSID')
	}
	if (!mac && !bssid) {
		return console.error(chalk.red('Provide either the MAC address or the BSSID.'))
	}
	if (await queryBoolean('Do you know its channel?')) {
		channel = await queryWifiChannel('channel')
	}

	const platforms = []
	while (true) {
		const nr = platforms.length + 1
		const name = (await queryText(`platform ${nr} – name (optional)`)) || null
		const line = await queryText(`platform ${nr} – line`)
		const direction = await queryStation(`platform ${nr} – direction`)
		let position = null
		if (await queryBoolean('Do you know its position relative to the platform?')) {
			position = await queryRange(`platform ${nr} – position`, 0, 1, .05)
		}

		platforms.push({name, line, direction, position})
		console.info('') // spacing
		if (!await queryBoolean('Add another platform?')) break
	}

	let location = null
	if (await queryBoolean('Do you know its geolocation?')) {
		const latitude = await queryNumber('latitude')
		const longitude = await queryNumber('longitude')
		location = {latitude, longitude}
	}
	const operator = (await queryText('operator (optional)')) || null

	const pathToData = pathJoin(__dirname, '..', 'data.ndjson')
	const data = createWriteStream(pathToData, {flags: 'a'})

	data.end(JSON.stringify({
		station, location, operator,
		name, mac, bssid,
		platforms
	}) + '\n')
})()
.catch((err) => {
	console.error(chalk.red(err + ''))
	process.exit(1)
})
