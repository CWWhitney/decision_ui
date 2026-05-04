# Changelog

## v0.4.0 - tbd

New Features

- Autosaving models to your account every 5 minutes

Fixes

- Help buttons of login dialog, open model dialog and save dialog did navigate to incorrect help page

## v0.3.0 - 2026-04-07

New Features

- Simplified graph visualization based on VueFlow
- Custom node shapes and colors
- GPU-accelerated model calculations with TensorflowJS
- Arbitrary formula expression parsing using OhmJS
- Box plot visualization of probabilistic series data
- Copy-Paste support via the operating system clipboard
- Interactive estimate sliders to analyze the impact of parameter changes
- Unsaved graph model survives browser refresh (saved in SessionStorage)
- Undo and redo of all model related changes
- Subgraphs can be extracted
- Nodes can be moved around with snap-to-grid feature

Breaking Changes

- Model files are not compatible with previous versions
- Database is not compatible with previous versions
- Subgraph semantics no longer match an R function and have no impact on R code generation
- Replaced BaklavaJS with VueFlow
- Replaced BaklavaJS frontend calculations with TensorflowJS
- Replaced FastAPI Python backend with a Node Express server to use the same code both in the frontend and backend
- Updated environment variables (e.g. `BACKEND_AUTH_HEADER` to `DSUI_BEARER_HEADER`)

Other Changes

- Updated various dependencies (e.g. Vuetify)
- Updated funding logos on start page

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
