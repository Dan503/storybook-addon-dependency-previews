import axios from 'axios'
import type { Category } from '../data/example-meal-data'

// Ergonomic response shape (array, same as API)
export interface MealDBTransformedResponse {
	meals: Meal[]
}

// A single meal in a UI-friendly shape
export interface Meal {
	id: string
	name: string
	category: string // e.g., "Chicken"
	area: string // a.k.a cuisine/region, e.g., "Indian"
	instructions: string
	image: string // thumbnail/full image URL
	tags: string[] // split+trimmed from strTags
	youtube?: string // watch URL if present
	ingredients: IngredientMeasurement[] // compacted from strIngredient*/strMeasure*
	source?: string // external recipe link if present
	imageSource?: string | null
	isCreativeCommons?: boolean | null
	dateModified?: string | null
}

// Ingredient+measure pair
export interface IngredientMeasurement {
	ingredient: string // e.g., "Chicken"
	amount: string // e.g., "1.2 kg"
	imageUrl: ImageUrls
}

interface ImageUrls {
	small: string
	medium: string
	large: string
}

export interface MealDBResponse {
	meals: MealRawData[]
}

export interface MealRawData {
	idMeal: string
	strMeal: string
	strMealAlternate: string | null
	strCategory: string
	strArea: string
	strInstructions: string
	strMealThumb: string
	strTags: string | null
	strYoutube: string

	// Ingredients (up to 20)
	strIngredient1: string | null
	strIngredient2: string | null
	strIngredient3: string | null
	strIngredient4: string | null
	strIngredient5: string | null
	strIngredient6: string | null
	strIngredient7: string | null
	strIngredient8: string | null
	strIngredient9: string | null
	strIngredient10: string | null
	strIngredient11: string | null
	strIngredient12: string | null
	strIngredient13: string | null
	strIngredient14: string | null
	strIngredient15: string | null
	strIngredient16: string | null
	strIngredient17: string | null
	strIngredient18: string | null
	strIngredient19: string | null
	strIngredient20: string | null

	// Measures (up to 20)
	strMeasure1: string | null
	strMeasure2: string | null
	strMeasure3: string | null
	strMeasure4: string | null
	strMeasure5: string | null
	strMeasure6: string | null
	strMeasure7: string | null
	strMeasure8: string | null
	strMeasure9: string | null
	strMeasure10: string | null
	strMeasure11: string | null
	strMeasure12: string | null
	strMeasure13: string | null
	strMeasure14: string | null
	strMeasure15: string | null
	strMeasure16: string | null
	strMeasure17: string | null
	strMeasure18: string | null
	strMeasure19: string | null
	strMeasure20: string | null

	strSource: string | null
	strImageSource: string | null
	strCreativeCommonsConfirmed: string | null
	dateModified: string | null
}

export const mealDbApi = axios.create({
	baseURL: 'https://www.themealdb.com/api/json/v1/1/',
	transformResponse: [
		...(axios.defaults.transformResponse as []),
		(data: MealDBResponse): Array<Meal> => {
			// Handle cases where meals is null or undefined
			if (!data || !data.meals) {
				console.error('MealDB API returned no meals', data)
				return []
			}
			return data.meals.map(transformMealData)
		},
	],
})

export async function fetchMealById(mealId: string): Promise<Meal | null> {
	try {
		const { data } = await mealDbApi.get<Array<Meal>>(`lookup.php?i=${mealId}`)
		return data?.[0] || null
	} catch (error) {
		console.error('Error fetching meal:', error)
		throw error
	}
}
export async function fetchCategories(): Promise<Array<Category>> {
	const { data } = await axios.get<Array<Category>>(
		`https://www.themealdb.com/api/json/v1/1/categories.php`,
	)
	return data || []
}

export async function fetchMealsByCategory(
	category: string,
): Promise<Array<Meal>> {
	const { data } = await mealDbApi.get<Array<Meal>>(
		`filter.php?c=${encodeURIComponent(category)}`,
	)
	return data || []
}

export async function fetchMealsByArea(area: string): Promise<Array<Meal>> {
	const { data } = await mealDbApi.get<Array<Meal>>(
		`filter.php?a=${encodeURIComponent(area)}`,
	)
	return data || []
}

async function fetchRandomMeal(): Promise<Meal> {
	const { data } = await mealDbApi.get<Array<Meal>>('random.php')
	return data[0]
}

export async function fetchRandomMealList(count = 10): Promise<Array<Meal>> {
	const promises = Array.from({ length: count }, () => fetchRandomMeal())
	return Promise.all(promises)
}

export function transformMealData(raw: MealRawData): Meal {
	const ingredients: IngredientMeasurement[] = []
	for (let i = 1; i <= 20; i++) {
		const ingredient = (
			raw[`strIngredient${i}` as keyof MealRawData] ?? ''
		).trim()
		if (!ingredient) continue

		const amount = (raw[`strMeasure${i}` as keyof MealRawData] ?? '').trim()
		const ingredientEncoded = encodeURIComponent(ingredient)
		const imageUrl = (size: keyof ImageUrls) =>
			`https://www.themealdb.com/images/ingredients/${ingredientEncoded}-${size}.png`

		ingredients.push({
			ingredient,
			amount,
			imageUrl: {
				small: imageUrl('small'),
				medium: imageUrl('medium'),
				large: imageUrl('large'),
			},
		})
	}

	const tags = (raw.strTags ?? '')
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)

	const ccc = raw.strCreativeCommonsConfirmed
	const creativeCommonsConfirmed =
		ccc == null ? null : /^(yes|true|1)$/i.test(ccc)

	return {
		id: raw.idMeal ?? '',
		name: raw.strMeal ?? '',
		category: raw.strCategory ?? '',
		area: raw.strArea ?? '',
		instructions: raw.strInstructions ?? '',
		image: raw.strMealThumb ?? '',
		tags,
		youtube: raw.strYoutube ?? undefined,
		ingredients,
		source: raw.strSource ?? undefined,
		imageSource: raw.strImageSource ?? null,
		isCreativeCommons: creativeCommonsConfirmed,
		dateModified: raw.dateModified ?? null,
	}
}
