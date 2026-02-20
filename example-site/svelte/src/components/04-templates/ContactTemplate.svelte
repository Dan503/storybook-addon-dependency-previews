<script lang="ts">
	import { defaultContactFormValues } from 'example-site-shared/data';
	import { H, Level } from 'svelte-headings';
	import ContactFormOrganism from '../forms/ContactFormOrganism/ContactFormOrganism.svelte';
	import SiteFrameOrganism from '../03-organisms/SiteFrameOrganism.svelte';
	import ContentRestraintAtom from '../01-atoms/ContentRestraintAtom.svelte';
	import IconTextMolecule from '../02-molecules/IconTextMolecule.svelte';
	import PhoneIcon from '../01-atoms/icons/PhoneIcon.svelte';
	import MapPinIcon from '../01-atoms/icons/MapPinIcon.svelte';
	import FormDataPreviewAtom from '../zz-meta-components/FormDataPreview/FormDataPreviewAtom.svelte';
	import ButtonAtom from '../01-atoms/ButtonAtom.svelte';

	let contactFormValues = $state(defaultContactFormValues);
	let isSubmitted = $state(false);
</script>

<SiteFrameOrganism>
	<div class="grid h-full place-items-center">
		<ContentRestraintAtom padVertical>
			<Level class="ContactTemplate grid gap-4">
				<H class="text-3xl font-bold">Contact Us</H>
				<IconTextMolecule Icon={PhoneIcon}>0412 345 678</IconTextMolecule>
				<IconTextMolecule Icon={MapPinIcon}>123 Main St, Anytown, Australia</IconTextMolecule>
				{#if isSubmitted}
					<div class="grid gap-4">
						<p>Thank you for your message!</p>
						<p>This website is just a demo so your message was not sent anywhere.</p>
						<p>Here is what you submitted:</p>
						<FormDataPreviewAtom formValues={contactFormValues} />
						<div class="flex justify-start">
							<ButtonAtom onClick={() => (isSubmitted = false)}>
								Back to the contact form
							</ButtonAtom>
						</div>
					</div>
				{:else}
					<ContactFormOrganism
						bind:formValues={contactFormValues}
						onSubmit={() => (isSubmitted = true)}
					/>
				{/if}
			</Level>
		</ContentRestraintAtom>
	</div>
</SiteFrameOrganism>
