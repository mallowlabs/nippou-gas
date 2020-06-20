# nippou-gas

'Nippou' generator form me!
It works on Google Apps Script.

Support source:

* Google Calendar
* esa.io
* GitHub

## Requirements

* clasp 2.1.0+

## Setup

```
$ npm install
$ clasp push
```

Access to the web editor.

Set script properties.

* CALENDAR_IDS (comma separated values)
* CALENDAR_IGNORED_WORDS (comma separated values)
* ESA_TOKEN
* ESA_USER
* ESA_TEAMS (comma separated values)
* GITHUB_USERNAME
* GITHUB_TOKEN
* SLACK_WEBHOOK_URL

## Usage

Run main functions:

* `mainGcal` in `gcal.gs`
* `mainEsa` in `esa.gs`
* `mainGithub` in `github.gs`

## License

The MIT License @mallowlabs 2019
