import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { ContactTemplateComponent } from './ContactTemplate.component';
import { withSiteProviders } from '../../app/siteProviders';

const meta: Meta<ContactTemplateComponent> = {
	title: '04 Templates / Contact Template',
	component: ContactTemplateComponent,
	decorators: [...withSiteProviders],
	tags: ['autodocs', 'template'],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
};

export default meta;

type Story = StoryObj<ContactTemplateComponent>;

export const Primary: Story = {
	args: {},
};
