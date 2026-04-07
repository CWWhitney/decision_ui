# Changelog

## v0.3.0 - 2026-04-07

New Features

- Replaced BaklavaJS with VueFlow and a new computational model
- Replaced the FastAPI Python backend with a Node Express server to use the same code both in the frontend and backend
- Updated various dependencies (Vuetify, etc.)

## v0.2.1 - 2025-07-10

New Features

- Change NPV node discount rate input type from deterministic to probabilistic (see #103)
- Show actual R warning messages instead of generic "There were 50 or more warnings" (see #108)

Fixes

- Fix ChanceEvent node not calculating correct output in frontend (see #101)

## v0.2.0 - 2025-03-27

New Features

- Update to R 4.4.3
- Install operating system updates (like R 4.4.3) in base Docker image of staging deployment
- Update INRES logo and URL on welcome page
- Add NIFAM link to welcome page

Fixes

- Fix ToSeries R translation bug
- Fix invalid escape sequence warning for regexp sanitizing unsafe characters

## v0.1.0

Initial version
