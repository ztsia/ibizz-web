import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FormTemplate } from '../types';
import { useShowIfEngine } from './useShowIfEngine';

export function useVisibleFields(
  template: Ref<FormTemplate | null>,
  formData: Ref<Record<string, any>>,
) {
  const visibleFieldIds = computed(() => {
    const ids = new Set<string>();
    if (!template.value) {
      return ids;
    }
    template.value.pages.forEach((page) => {
      const pageVisible = useShowIfEngine(page.show_if, formData).isVisible
        .value;
      if (!pageVisible) return;

      page.sections.forEach((section) => {
        const sectionVisible = useShowIfEngine(section.show_if, formData)
          .isVisible.value;
        if (!sectionVisible) return;

        section.fields.forEach((field) => {
          const fieldVisible = useShowIfEngine(field.show_if, formData)
            .isVisible.value;
          if (fieldVisible) {
            ids.add(field.id);
          }
        });
      });
    });
    return ids;
  });

  return { visibleFieldIds };
}
