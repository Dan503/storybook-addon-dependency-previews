import { fetchCategories } from 'example-site-shared/utils/mealDbApiUtils';

export async function load() {
	const categories = await fetchCategories();
	return { categories, title: 'Categories' };
}
