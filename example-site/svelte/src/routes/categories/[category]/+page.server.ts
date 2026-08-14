import { fetchMealsByCategory } from 'example-site-shared/utils/mealDbApiUtils';

export async function load({ params }) {
	const mealList = await fetchMealsByCategory(params.category);
	return { mealList, title: `${params.category} Meals` };
}
