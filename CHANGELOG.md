# Changelog

## v0.4.0 - 2026-05-18

New Features

- Autosaving models to your account every 5 minutes
- Add warning to nodes with duplicate variable names
- Allow to save simple unit labels for each node
- Show warning if formula combines variables with different units
- Add hint to UI that "edges" refer to the arrows between nodes
- Show warning if model is not yet saved before losing model
- Improve save dialog labels and descriptions
- Compile all help pages into one document for easy quick search
- Add help section on how to use the AI experiment
- Add warning in case of cyclic variable dependencies
- Add warning if variable name matches a reserved name
- Update autosave menu label and show hint why autosave is not available
- Show notification whenenver the model is saved as snackbar

Fixes

- Fix app shortcuts for new file on MacOS
- Fix meta click can be used to select multiple nodes on MacOS
- Fix pi button did not insert the correct formula expression
- Fix variable name filter did not correctly filter out special non-letter characters
- Help buttons of login dialog, open model dialog and save dialog did navigate to incorrect help page

Other changes

- Updated AI support prompt template with most recent ohm-js grammar

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
