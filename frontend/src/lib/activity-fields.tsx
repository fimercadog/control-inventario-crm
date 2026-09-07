import { CrudField } from "@/components/crud/crud-modal";

export const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  call: "Llamada",
  meeting: "Reunion",
  email: "Correo",
  note: "Nota",
  task: "Tarea",
  followup: "Seguimiento",
};

/** Campos del formulario de actividad. `only` limita las opciones de tipo. */
export function activityFields(only?: string[]): CrudField[] {
  const typeOptions = Object.entries(ACTIVITY_TYPE_LABEL)
    .filter(([value]) => !only || only.includes(value))
    .map(([value, label]) => ({ value, label }));

  return [
    { name: "client_id", label: "Cliente", type: "select", optionsResource: "/clients", omitWhenEmpty: true },
    { name: "deal_id", label: "Deal", type: "select", optionsResource: "/deals", omitWhenEmpty: true },
    { name: "type", label: "Tipo", type: "select", required: true, options: typeOptions },
    { name: "subject", label: "Asunto", required: true, colSpan: "full" },
    { name: "due_date", label: "Vencimiento", type: "date", omitWhenEmpty: true },
    {
      name: "completed",
      label: "Completada",
      type: "select",
      required: true,
      options: [
        { label: "No", value: "0" },
        { label: "Si", value: "1" },
      ],
    },
    { name: "notes", label: "Notas", type: "textarea", omitWhenEmpty: true, colSpan: "full" },
  ];
}
