export interface Option {
  value: string;
  label: string;
}

export interface ShowIf {
  fieldId?: string;
  operator: 'equals' | 'not_equals' | 'or' | 'and';
  value?: any;
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
  | 'lookup';

export interface FormTemplateField {
  id: string;
  label: string;
  inputType: InputType;
  required?: boolean;
  show_if?: ShowIf;
  options?: Option[];
  itemStructure?: ItemStructure;
  lookupSlug?: string;
  isLabelHidden?: boolean;
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
