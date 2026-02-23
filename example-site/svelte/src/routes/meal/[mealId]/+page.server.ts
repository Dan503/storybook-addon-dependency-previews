import { fetchMealById } from 'example-site-shared/utils/mealDbApiUtils';

export async function load({ params }) {
	const mealDetails = await fetchMealById(params.mealId);
	return { mealDetails, title: mealDetails?.name };
}
