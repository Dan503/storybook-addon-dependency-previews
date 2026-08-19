export {
	mealDbApi,
	fetchMealById,
	fetchCategories,
	fetchMealsByCategory,
	fetchMealsByArea,
	fetchRandomMealList,
	transformMealData,
	type CategoriesApiResponse,
	type Category,
	type MealDBTransformedResponse,
	type Meal,
	type IngredientMeasurement,
	type MealDBResponse,
	type MealRawData,
} from './mealDbApiUtils'

export {
	createAddressFiller,
	getFullAddress,
	type HrefParamName,
	type HrefParams,
	type LinkAddress,
	type RouteAddress,
	type RouteFileName,
	type RouteMarks,
	type RoutePattern,
} from './routeAddressUtils'
