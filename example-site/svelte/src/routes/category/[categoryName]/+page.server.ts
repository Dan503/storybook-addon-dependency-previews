import { fetchMealsByCategory } from 'example-site-shared/utils/mealDbApiUtils';

export async function load({ params }) {
	const mealList = await fetchMealsByCategory(params.categoryName);
	return { mealList, title: `${params.categoryName} Meals` };
}
