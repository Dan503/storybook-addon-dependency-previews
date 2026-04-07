import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { DetailPageTemplateComponent } from './DetailPageTemplate.component';
import { exampleMeal } from 'example-site-shared/data';
import { withSiteProviders } from '../../app/siteProviders';

const meta: Meta<DetailPageTemplateComponent> = {
	title: '04 Templates / Detail Page Template',
	component: DetailPageTemplateComponent,
	tags: ['autodocs', 'template'],
	decorators: [...withSiteProviders],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		meal: {
			mapping: {
				example: exampleMeal,
				none: undefined,
			},
			control: {
				type: 'select',
			},
			options: ['example', 'none'],
		},
	},
};

export default meta;

type Story = StoryObj<DetailPageTemplateComponent>;

export const Primary: Story = {
	args: {
		isLoading: false,
		meal: exampleMeal,
	},
};
