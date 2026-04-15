/**
 * NOTE: This file (and shared-data-stub.cjs, axios-stub.cjs, zod-stub.cjs) only exist
 * because this example site uses a cross-workspace TypeScript package
 * (`example-site-shared`) that pulls in zod and axios. In a normal Angular
 * Storybook project you would not need any of this.
 *
 * Lightweight TypeScript type stub for `example-site-shared/data`.
 *
 * PURPOSE: Used exclusively by @ngtools/webpack (Angular's Ivy compiler) for type-checking
 * stories that import from `example-site-shared/data`. It has NO imports of zod or axios,
 * preventing those packages' complex type declarations from being loaded by the compiler
 * (zod v4 recursive types cause the Angular Ivy compiler to hang indefinitely).
 *
 * The exported values here are empty stubs — they NEVER reach the browser.
 * webpack's resolve.alias redirects `example-site-shared/data` → `shared-data-stub.cjs`
 * at bundle time, which provides the actual runtime data.
 */

// ---------------------------------------------------------------------------
// Inline type definitions (no imports to avoid zod/axios compilation overhead)
// ---------------------------------------------------------------------------

interface IngredientMeasurement {
	ingredient: string
	amount: string
	imageUrl: { small: string; medium: string; large: string }
}

interface Meal {
	id: string
	name: string
	category: string
	area: string
	instructions: string
	image: string
	tags: string[]
	youtube?: string
	ingredients: IngredientMeasurement[]
	source?: string
	imageSource?: string | null
	isCreativeCommons?: boolean | null
	dateModified?: string | null
}

interface Category {
	idCategory: string
	strCategory: string
	strCategoryThumb: string
	strCategoryDescription: string
}

type MealRawData = Record<string, string | null>

type CardItem = {
	title: string
	href: string
	hrefParams: Record<string, string>
	description: string
	imgSrc: string
}

type CategoryCardItem = {
	id: string
	title: string
	imgSrc: string
	description: string
	href: string
	hrefParams: Record<string, string>
}

type MealCardItem = {
	id: string
	title: string
	imgSrc: string
	description: string
	href: string
	hrefParams: Record<string, string>
}

type IngredientItem = { title: string; imageSrc: string; description: string }

// ---------------------------------------------------------------------------
// Empty stubs — webpack alias replaces this module with shared-data-stub.cjs
// ---------------------------------------------------------------------------

const _emptyIngredient: IngredientMeasurement = {
	ingredient: '',
	amount: '',
	imageUrl: { small: '', medium: '', large: '' },
}

const _emptyMeal: Meal = {
	id: '',
	name: '',
	category: '',
	area: '',
	instructions: '',
	image: '',
	tags: [],
	ingredients: [],
}

export const categoryList: Category[] = []
export const mealRawExample: MealRawData = {}
export const exampleMeal: Meal = _emptyMeal
export const exampleIngredientList: IngredientMeasurement[] = []
export const exampleIngredient: IngredientMeasurement = _emptyIngredient
export const exampleMealList: Meal[] = []
export const mealCards: CardItem[] = []
export const categoryCardList: CategoryCardItem[] = []
export const mealCardList: MealCardItem[] = []
export const ingredientItems: IngredientItem[] = []
export const featuredMealsData: Meal[] = []
export const defaultContactFormValues = { name: '', email: '', message: '' }
export const contactFormValuesSchema: unknown = {}

// Type-only re-exports for stories that import types from example-site-shared/data
export type { Meal, Category, IngredientMeasurement, MealRawData }
export type ContactFormValues = { name: string; email: string; message: string }
export type MealDBTransformedResponse = { meals: Meal[] }
export type CategoriesApiResponse = { categories: Category[] }
