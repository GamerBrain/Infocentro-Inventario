export type UserRole = "admin" | "user";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  item_type: string;
  serial: string;
  description: string | null;
  condition: string;
  location: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const CATEGORIES = [
  "Electrónica",
  "Mobiliario",
  "Material de Oficina",
  "Herramientas",
  "Periféricos",
  "Telecomunicaciones",
  "Otro",
] as const;

export const ITEM_TYPES: Record<string, string[]> = {
  Electrónica: [
    "Computadora de escritorio",
    "Laptop / Portátil",
    "Impresora",
    "Escáner",
    "Proyector",
    "Televisor / Monitor",
    "Tablet",
    "Cámara",
    "UPS / Estabilizador",
    "Switch / Router",
  ],
  Mobiliario: [
    "Escritorio",
    "Silla",
    "Estante / Archivador",
    "Mesa",
    "Cubículo",
    "Vitrina",
  ],
  "Material de Oficina": [
    "Resma de papel",
    "Carpeta",
    "Sello",
    "Grapadora",
    "Perforadora",
    "Material didáctico",
  ],
  Herramientas: [
    "Kit de herramientas",
    "Destornillador",
    "Multímetro",
    "Soldador",
  ],
  Periféricos: [
    "Teclado",
    "Mouse",
    "Audífonos",
    "Micrófono",
    "Webcam",
    "Memoria USB",
    "Disco duro externo",
  ],
  Telecomunicaciones: [
    "Teléfono fijo",
    "Teléfono IP",
    "Antena",
    "Módem",
    "Patch panel",
  ],
  Otro: ["Otro (especificar en descripción)"],
};

export const CONDITIONS = [
  "Excelente",
  "Bueno",
  "Regular",
  "Malo",
  "Fuera de servicio",
] as const;
