'use strict'
/**
 * NOTE: This file (and shared-data.ts, axios-stub.cjs, zod-stub.cjs) only exist
 * because this example site uses a cross-workspace TypeScript package
 * (`example-site-shared`) that pulls in zod and axios. In a normal Angular
 * Storybook project you would not need any of this.
 *
 * Runtime CJS implementation of example-site-shared/data for Angular Storybook.
 *
 * webpack aliases 'example-site-shared/data' to this file, completely bypassing
 * the TypeScript source and its zod/axios dependencies. This file:
 *   - Is plain CommonJS JavaScript (no TypeScript compilation needed)
 *   - Implements transformMealData in vanilla JS (same logic as mealDbApiUtils.ts)
 *   - Imports the JSON data files directly (webpack handles JSON natively)
 *   - Exports all values from example-site/shared/data/index.ts
 */

// ---------------------------------------------------------------------------
// transformMealData — plain-JS re-implementation (no axios, no TypeScript)
// ---------------------------------------------------------------------------

function transformMealData(raw) {
	const ingredients = []
	for (let i = 1; i <= 20; i++) {
		const ingredient = (raw[`strIngredient${i}`] ?? '').trim()
		if (!ingredient) continue
		const amount = (raw[`strMeasure${i}`] ?? '').trim()
		const encoded = encodeURIComponent(ingredient)
		const imgBase = `https://www.themealdb.com/images/ingredients/${encoded}`
		ingredients.push({
			ingredient,
			amount,
			imageUrl: {
				small: `${imgBase}-Small.png`,
				medium: `${imgBase}-Medium.png`,
				large: `${imgBase}.png`,
			},
		})
	}

	const tags = (raw.strTags ?? '')
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)

	const ccc = raw.strCreativeCommonsConfirmed
	const isCreativeCommons = ccc == null ? null : /^(yes|true|1)$/i.test(ccc)

	return {
		id: raw.idMeal ?? '',
		name: raw.strMeal ?? '',
		category: raw.strCategory ?? '',
		area: raw.strArea ?? '',
		instructions: raw.strInstructions ?? '',
		image: raw.strMealThumb ?? '',
		tags,
		youtube: raw.strYoutube || undefined,
		ingredients,
		source: raw.strSource || undefined,
		imageSource: raw.strImageSource ?? null,
		isCreativeCommons,
		dateModified: raw.dateModified ?? null,
	}
}

// ---------------------------------------------------------------------------
// Raw data (JSON files loaded by webpack; mealRawExample hardcoded from source)
// ---------------------------------------------------------------------------

const rawExampleMealList = require('../../shared/data/example-meal-list.json')
const categoriesApi = require('../../shared/data/categories.json')

const categoryList = categoriesApi.categories

/** Hardcoded from example-site/shared/data/example-meal-data.ts */
const mealRawExample = {
	idMeal: '52795',
	strMeal: 'Chicken Handi',
	strMealAlternate: null,
	strCategory: 'Chicken',
	strArea: 'Indian',
	strInstructions:
		'Take a large pot or wok, big enough to cook all the chicken, and heat the oil in it. Once the oil is hot, add sliced onion and fry them until deep golden brown. Then take them out on a plate and set aside.\r\nTo the same pot, add the chopped garlic and sauté for a minute. Then add the chopped tomatoes and cook until tomatoes turn soft. This would take about 5 minutes.\r\nThen return the fried onion to the pot and stir. Add ginger paste and sauté well.\r\nNow add the cumin seeds, half of the coriander seeds and chopped green chillies. Give them a quick stir.\r\nNext goes in the spices – turmeric powder and red chilli powder. Sauté the spices well for couple of minutes.\r\nAdd the chicken pieces to the wok, season it with salt to taste and cook the chicken covered on medium-low heat until the chicken is almost cooked through. This would take about 15 minutes. Slowly sautéing the chicken will enhance the flavor, so do not expedite this step by putting it on high heat.\r\nWhen the oil separates from the spices, add the beaten yogurt keeping the heat on lowest so that the yogurt doesn\'t split. Sprinkle the remaining coriander seeds and add half of the dried fenugreek leaves. Mix well.\r\nFinally add the cream and give a final mix to combine everything well.\r\nSprinkle the remaining kasuri methi and garam masala and serve the chicken handi hot with naan or rotis. Enjoy!',
	strMealThumb: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
	strTags: null,
	strYoutube: 'https://www.youtube.com/watch?v=IO0issT0Rmc',
	strIngredient1: 'Chicken',
	strIngredient2: 'Onion',
	strIngredient3: 'Tomatoes',
	strIngredient4: 'Garlic',
	strIngredient5: 'Ginger paste',
	strIngredient6: 'Vegetable oil',
	strIngredient7: 'Cumin seeds',
	strIngredient8: 'Coriander seeds',
	strIngredient9: 'Turmeric powder',
	strIngredient10: 'Chilli powder',
	strIngredient11: 'Green chilli',
	strIngredient12: 'Yogurt',
	strIngredient13: 'Cream',
	strIngredient14: 'fenugreek',
	strIngredient15: 'Garam masala',
	strIngredient16: 'Salt',
	strIngredient17: '',
	strIngredient18: '',
	strIngredient19: '',
	strIngredient20: '',
	strMeasure1: '1.2 kg',
	strMeasure2: '5 thinly sliced',
	strMeasure3: '2 finely chopped',
	strMeasure4: '8 cloves chopped',
	strMeasure5: '1 tbsp',
	strMeasure6: '\u00bc cup',
	strMeasure7: '2 tsp',
	strMeasure8: '3 tsp',
	strMeasure9: '1 tsp',
	strMeasure10: '1 tsp',
	strMeasure11: '2',
	strMeasure12: '1 cup',
	strMeasure13: '\u00be cup',
	strMeasure14: '3 tsp Dried',
	strMeasure15: '1 tsp',
	strMeasure16: 'To taste',
	strMeasure17: '',
	strMeasure18: '',
	strMeasure19: '',
	strMeasure20: '',
	strSource: '',
	strImageSource: null,
	strCreativeCommonsConfirmed: null,
	dateModified: null,
}

// ---------------------------------------------------------------------------
// Derived data (mirrors example-site/shared/data/example-meal-data.ts)
// ---------------------------------------------------------------------------

const exampleMeal = transformMealData(mealRawExample)
const exampleIngredientList = exampleMeal.ingredients
const exampleIngredient = exampleIngredientList[0]

const exampleMealList = rawExampleMealList.meals.map(transformMealData)

const mealCards = exampleMealList.map((meal) => ({
	title: meal.name,
	href: '/meal/$mealId',
	hrefParams: { mealId: meal.id },
	description: `${meal.area} ${meal.category} dish`,
	imgSrc: meal.image,
}))

const categoryCardList = categoryList.map((category) => ({
	id: category.idCategory,
	title: category.strCategory,
	imgSrc: category.strCategoryThumb,
	description: category.strCategoryDescription,
	href: '/categories/$category',
	hrefParams: { category: category.strCategory },
}))

const mealCardList = exampleMealList.map((meal) => ({
	id: meal.id,
	title: meal.name,
	imgSrc: meal.image,
	description: meal.area,
	href: '/meal/$mealId',
	hrefParams: { mealId: meal.id },
}))

const ingredientItems = exampleIngredientList.map((ingredient) => ({
	title: ingredient.ingredient,
	imageSrc: ingredient.imageUrl.small,
	description: ingredient.amount,
}))

const featuredMealsData = exampleMealList.slice(0, 7)

// ---------------------------------------------------------------------------
// Form values (no zod — Angular stories don't use contactFormValuesSchema)
// ---------------------------------------------------------------------------

const defaultContactFormValues = { name: '', email: '', message: '' }
const contactFormValuesSchema = {
	parse: (v) => v,
	safeParse: (v) => ({ success: true, data: v }),
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
	categoryList,
	mealRawExample,
	exampleMeal,
	exampleIngredientList,
	exampleIngredient,
	exampleMealList,
	mealCards,
	categoryCardList,
	mealCardList,
	ingredientItems,
	featuredMealsData,
	defaultContactFormValues,
	contactFormValuesSchema,
}
