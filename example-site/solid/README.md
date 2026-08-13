# SolidStart

Everything you need to build a Solid project, powered by [`solid-start`](https://start.solidjs.com);

## Creating a project

```bash
# create a new project in the current directory
npm init solid@latest

# create a new project in my-app
npm init solid@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Solid apps are built for a particular host, and this one is built for Netlify: `vite.config.ts` passes `preset: 'netlify'` to the Nitro plugin, so `npm run build` writes the site into `dist` and its server into `.netlify/functions-internal`.

There is no plain Node build to run, so `npm start` and `npm run preview` will not serve the built site — use `npm run dev` for local work. To build for somewhere other than Netlify, change that preset in `vite.config.ts`.

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)
