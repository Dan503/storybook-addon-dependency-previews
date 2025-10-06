You will need the following scripts in your `package.json` file:

```json
// package.json
{
	...
	"scripts": {
		...
		"sb": "sb-deps --watch --run-storybook",
		"sb:build": "sb-deps && storybook build",
		"sb:deps": "sb-deps",
		"sb:7020": "sb-deps --watch --run-storybook --sb-port 7020"
	}
	...
}
```

`npm run sb` will run storybook in watch mode. It will update the dependency-previews.json file whenever a story file changes.

`npm run sb:build` will do a one off compile of your storybook website

`npm run sb:deps` will generate a fresh dependency-previews.json on demand

`npm run sb:7020` (optional) will run storybook in watch mode and run it using a specific port number.
