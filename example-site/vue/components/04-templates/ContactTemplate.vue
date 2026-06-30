<script setup lang="ts">
import { ref } from 'vue'
import SiteFrameOrganism from '../03-organisms/SiteFrameOrganism.vue'
import ContentRestraintAtom from '../01-atoms/ContentRestraintAtom.vue'
import IconTextMolecule from '../02-molecules/IconTextMolecule.vue'
import PhoneIcon from '../01-atoms/icons/PhoneIcon.vue'
import MapPinIcon from '../01-atoms/icons/MapPinIcon.vue'
import ButtonAtom from '../01-atoms/ButtonAtom.vue'
import ContactFormOrganism from '../forms/ContactFormOrganism/ContactFormOrganism.vue'
import { useContactForm } from '../forms/ContactFormOrganism/useContactForm'
import FormDataPreviewAtom from '../zz-meta-components/FormDataPreview/FormDataPreviewAtom.vue'

const form = useContactForm()
const isSubmitted = ref(false)
</script>

<template>
	<SiteFrameOrganism>
		<div class="grid h-full place-items-center">
			<ContentRestraintAtom padVertical>
				<div class="ContactTemplate grid gap-4">
					<h1 class="text-3xl font-bold">Contact Us</h1>
					<IconTextMolecule :Icon="PhoneIcon">0412 345 678</IconTextMolecule>
					<IconTextMolecule :Icon="MapPinIcon">
						123 Main St, Anytown, Australia
					</IconTextMolecule>
					<div v-if="isSubmitted" class="grid gap-4">
						<p>Thank you for your message!</p>
						<p>
							This website is just a demo so your message was not sent anywhere.
						</p>
						<p>Here is what you submitted:</p>
						<FormDataPreviewAtom :form="form" />
						<div class="flex justify-start">
							<ButtonAtom :onClick="() => (isSubmitted = false)">
								Back to the contact form
							</ButtonAtom>
						</div>
					</div>
					<ContactFormOrganism
						v-else
						:form="form"
						:onSubmit="() => (isSubmitted = true)"
					/>
				</div>
			</ContentRestraintAtom>
		</div>
	</SiteFrameOrganism>
</template>
