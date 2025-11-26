export interface Option {
  value: string;
  label: string;
  disabledFields?: string[];
}

export interface ShowIf {
  fieldId?: string;
  operator:
  | 'equals'
  | 'not_equals'
  | 'or'
  | 'and'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';
  value?: any;
  valueFromField?: string;
  conditions?: ShowIf[];
}



export type InputType =
  | 'text'
  | 'number'
  | 'date'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'email'
  | 'readonly_note'
  | 'countries'
  | 'states'
  | 'lookup'
  | 'fixed_table'
  | 'placeholder'
  | 'boolean'
  | 'currency';

export interface FormTemplateField {
  id: string;
  label?: string;
  inputType: string;
  required?: boolean;
  show_if?: any;
  options?: Record<string, any>;
  lookupSlug?: string;
  isLabelHidden?: boolean;
  multiline?: boolean;
  addForm?: string;
  readonly?: boolean;
  itemFilter?: ShowIf;
  displayFormat?: string;
  fetchFromGenericService?: boolean;
  valueKey?: string;
  formula?: string;
  selectable?: boolean;
  allowRepeating?: boolean;
  unique?: boolean;
  defaultValue?: any;
}

export interface FormTemplateSection {
  part: string;
  title: string;
  show_if?: ShowIf;
  fields: FormTemplateField[];
}

export interface FormTemplatePage {
  id: string;
  title: string;
  show_if?: ShowIf;
  sections: FormTemplateSection[];
}

export interface FormTemplate {
  _id: string;
  formName: string;
  yearOfAssessment: number;
  pages: FormTemplatePage[];
}

export interface FormSubmission {
  submissionId: string;
  templateId: string;
  year: number;
  data: Record<string, any>;
  updated_at: string; // ISO timestamp
}

// ItemList Models
export interface KeyedRow {
  key: string | null;
  values: Record<string, any>;
}

export type UnkeyedRow = Record<string, any>;
