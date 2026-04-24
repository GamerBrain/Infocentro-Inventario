const BAD_WORDS = [
  "puta", "puto", "putos", "putas", "putear", "puteada", "puteado",
  "mierda", "mierdas", "cagada", "cagado", "cagar", "caga",
  "coño", "cono", "conyo", "coñazo",
  "joder", "jodido", "jodida", "jodete",
  "pendejo", "pendeja", "pendejos", "pendejas", "pendejada",
  "cabron", "cabrón", "cabrones", "cabrona", "cabronas",
  "marico", "maricon", "maricón", "maricones", "marica", "maricos",
  "imbecil", "imbécil", "imbeciles",
  "idiota", "idiotas",
  "estupido", "estúpido", "estupida", "estúpida", "estupidos", "estupidas",
  "tarado", "tarada", "tarados",
  "verga", "vergas", "vergazo",
  "polla", "pollas",
  "pene", "penes",
  "culo", "culos", "culero", "culera",
  "perra", "perras",
  "zorra", "zorras",
  "carajo", "carajos",
  "chingar", "chingada", "chingado", "chinga", "chingón",
  "pinga", "pingas",
  "gilipollas", "gilipolla",
  "follar", "follada", "follado",
  "mamada", "mamadas", "mamaguevo", "mamahuevo", "mamagüevo",
  "huevon", "huevón", "huevones", "huevona", "weon", "weones",
  "hijueputa", "hijoeputa", "hijo de puta", "hijos de puta",
  "malparido", "malparida", "malparidos",
  "gonorrea",
  "fuck", "fucking", "fucker", "shit", "bitch", "asshole", "bastard",
  "dick", "pussy", "cunt", "motherfucker", "damn",
];

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const PATTERN = new RegExp(
  "\\b(" + BAD_WORDS.map((w) => escapeRegex(normalize(w))).join("|") + ")\\b",
  "gi"
);

export function censorProfanity(text: string): string {
  if (!text) return text;
  return text.replace(/\S+/g, (word) => {
    const normalized = normalize(word);
    const cleaned = normalized.replace(/[^a-z0-9]/g, "");
    PATTERN.lastIndex = 0;
    if (PATTERN.test(cleaned) || PATTERN.test(normalized)) {
      return "*".repeat(word.length);
    }
    return word;
  });
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  PATTERN.lastIndex = 0;
  return PATTERN.test(normalize(text));
}
