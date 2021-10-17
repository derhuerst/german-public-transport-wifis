# german-public-transport-wifis

Crowd-sourced database of **fringerprints of [wireless access points](https://en.wikipedia.org/wiki/Wireless_access_point) at German public transport stations.**

[![npm version](https://img.shields.io/npm/v/german-public-transport-wifis.svg)](https://www.npmjs.com/package/german-public-transport-wifis)
[![build status](https://api.travis-ci.org/derhuerst/german-public-transport-wifis.svg?branch=master)](https://travis-ci.org/derhuerst/german-public-transport-wifis)
![public-domain-licensed](https://img.shields.io/github/license/derhuerst/german-public-transport-wifis.svg)


## Installation

If you're using JavaScript, install [from npm](https://npmjs.com/package/german-public-transport-wifis):

```shell
npm install german-public-transport-wifis
```

Otherwise, download from the [GitHub releases](https://github.com/derhuerst/german-public-transport-wifis/releases).


## Usage

`data.ndjson` is a [newline-delimited JSON](http://ndjson.org/) file, in which **each line describes a single [wireless access point](https://en.wikipedia.org/wiki/Wireless_access_point) (AP).** The markup looks like this:

```js
{
	"station": "731380", // U Berliner Str., Berlin
	"stop": null,
	"platforms": [{
		"name": null,
		"line": "U9",
		"direction": "731371", // U Güntzelstr., Berlin
		"position": 0.25
	}],
	"location": null,
	"bssid": "00:81:c4:e6:6c:df",
	"mac": null,
	"operator": "bvg"
}
```

- `station`: The ID of the *station* where the AP is located. Use [`db-dep --show-ids`](https://www.npmjs.com/package/db-cli) to find them.
- `stop`: The ID of the *stop* (part of the *station*) where the AP is located. Optional.
- `platforms`: An array of platforms the AP covers.
	- `name`: The name of the platform. Example: `3a`.
	- `line`: The name of a line that uniquely identifies the platform (because it usually runs there).
	- `direction`: The ID of the next *station* that the line will stop at.
	- `position`: Position of the AP relative to the platform. `0` means "in the back" and `1` "in the front", according to `direction`.
- `location`: The geolocation of the AP as an object with `latitude` and `longitude`. Optional.
- `bssid`: The [BSSID](https://en.wikipedia.org/wiki/Service_set_(802.11_network)#Basic_service_sets_(BSSs)) of the AP.
- `mac`: The [MAC address](https://en.wikipedia.org/wiki/MAC_address#Usage_in_hosts) of the AP. Optional.
- `operator`: A string that uniquely identifies the transit operator running the WiFi (not the provider of WiFi infrastructure). Optional.


## Contributing

If you want to add information to the dataset, **[fork this repository](https://help.github.com/articles/fork-a-repo/), add information and [submit a pull request](https://help.github.com/articles/about-pull-requests/)**. If you don't know how any of this works, you can also just [open an issue](https://github.com/juliuste/vbb-change-positions/issues) with the information you want to add in text form and we'll add it to the dataset for you.

Please note that by contributing to this project, you waive any copyright claims on the information you add.

## License

This dataset is licensed under the [*ODC Public Domain Dedication and Licence* 1.0](https://opendatacommons.org/licenses/pddl/1.0/index.html). From [its plain language summary](https://opendatacommons.org/licenses/pddl/summary/index.html):

> **You are free:**
> - To Share: To copy, distribute and use the database.
> - To Create: To produce works from the database.
> - To Adapt: To modify, transform and build upon the database.
>
> **As long as you:**
> Blank: This section is intentionally left blank. The PDDL imposes no restrictions on your use of the PDDL licensed database.
