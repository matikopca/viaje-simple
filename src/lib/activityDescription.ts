/** Contenido enriquecido (# título, - lista, párrafos); compatible con texto plano. */
export type RichDescription = string | string[] | undefined | null;

/** Partes guardadas como array en sitios legacy; en días suele ser un solo string. */
export function normalizeDescriptionParts(desc: RichDescription): string[] {
  if (!desc) return [];
  if (Array.isArray(desc)) return desc;
  if (typeof desc === "string") return desc ? [desc] : [];
  return [];
}

/** Texto plano para editar en textarea. */
export function activityDescriptionPlainText(desc: RichDescription): string {
  return normalizeDescriptionParts(desc).join("\n");
}
