import { createFormHook } from '@tanstack/react-form'

import {
  Select,
  SubscribeButton,
  TextArea,
} from '../components/demo.FormComponents'
import { fieldContext, formContext } from './demo.form-context'
import { TextFieldMolecule } from '../components/forms/TextFieldMolecule/TextFieldMolecule'

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField: TextFieldMolecule,
    Select,
    TextArea,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
