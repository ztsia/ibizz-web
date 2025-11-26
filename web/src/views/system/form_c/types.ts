export interface Option {
  value: string;
  label: string;
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

export interface ItemStructure {
  key: null | { id: string; label: string; options: Option[] };
  values: Array<{
    id: string;
    label: string;
    inputType: string;
    options?: Option[];
  }>;
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
  | 'itemList'
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
  options?: any[];
  itemStructure?: ItemStructure;
  lookupSlug?: string;
  isLabelHidden?: boolean;
  multiline?: boolean;
  addForm?: string;
  readonly?: boolean;
  itemFilter?: ShowIf;
  displayFormat?: string;
  fetchFromGenericService?: boolean;
  valueKey?: string;
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
  key: string;
  values: Record<string, any>;
}

export type UnkeyedRow = Record<string, any>;
