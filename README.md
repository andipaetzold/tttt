# Team Time Trial Timer

Simple web app to organize rotations during team time trial events.

https://andipaetzold.github.io/tttt/

## Development

Use the Node.js version in .nvmrc and install dependencies with npm:

```sh
nvm install
npm ci
npm start
```

`npm run dev` also starts the Vite development server.

## Validation and deployment

- `npm run format` formats the project using Oxfmt defaults.
- `npm run format:check` checks formatting without changing files.
- `npm run lint` runs Oxlint; warnings fail the check.
- `npm run typecheck` checks TypeScript without emitting files.
- `npm run build` checks TypeScript and creates the production site in `dist`.
- `npm run preview` serves the production build locally.

CI checks formatting and lint before building. Pushes to main deploy `dist` to
GitHub Pages; other branches retain the deployment dry run. Relative asset URLs
allow the site to run beneath `/tttt/`.
