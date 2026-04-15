declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

/**
 * NOTE: This declaration (and shared-data.ts, shared-data-stub.cjs, axios-stub.cjs,
 * zod-stub.cjs) only exists because this example site uses a cross-workspace
 * TypeScript package (`example-site-shared`) that pulls in zod and axios. In a
 * normal Angular Storybook project you would not need any of this.
 *
 * Ambient declaration for example-site-shared/data. @ngtools/webpack's TypeScript
 * compiler satisfies the import from this declaration instead of trying to resolve
 * to the real shared TypeScript source, which would pull in zod v4 and hang the
 * Angular Ivy compiler. At runtime, NormalModuleReplacementPlugin in main.ts
 * redirects the import to shared-data-stub.cjs which provides the real values.
 */
declare module 'example-site-shared/data' {
  export interface IngredientMeasurement {
    ingredient: string;
    amount: string;
    imageUrl: { small: string; medium: string; large: string };
  }
  export interface Meal {
    id: string;
    name: string;
    category: string;
    area: string;
    instructions: string;
    image: string;
    tags: string[];
    youtube?: string;
    ingredients: IngredientMeasurement[];
    source?: string;
    imageSource?: string | null;
    isCreativeCommons?: boolean | null;
    dateModified?: string | null;
  }
  export interface Category {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
  }
  export type MealRawData = Record<string, string | null>;
  export type MealDBTransformedResponse = { meals: Meal[] };
  export type CategoriesApiResponse = { categories: Category[] };
  export type ContactFormValues = { name: string; email: string; message: string };

  export declare const categoryList: Category[];
  export declare const mealRawExample: MealRawData;
  export declare const exampleMeal: Meal;
  export declare const exampleIngredientList: IngredientMeasurement[];
  export declare const exampleIngredient: IngredientMeasurement;
  export declare const exampleMealList: Meal[];
  export declare const mealCards: Array<{
    title: string; href: string; hrefParams: Record<string, string>;
    description: string; imgSrc: string;
  }>;
  export declare const categoryCardList: Array<{
    id: string; title: string; imgSrc: string; description: string;
    href: string; hrefParams: Record<string, string>;
  }>;
  export declare const mealCardList: Array<{
    id: string; title: string; imgSrc: string; description: string;
    href: string; hrefParams: Record<string, string>;
  }>;
  export declare const ingredientItems: Array<{
    title: string; imageSrc: string; description: string;
  }>;
  export declare const featuredMealsData: Meal[];
  export declare const defaultContactFormValues: ContactFormValues;
  export declare const contactFormValuesSchema: unknown;
}
