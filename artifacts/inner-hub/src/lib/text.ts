const TR: Record<string, string> = {
  ı: "i",
  İ: "i",
  ğ: "g",
  Ğ: "g",
  ş: "s",
  Ş: "s",
  ö: "o",
  Ö: "o",
  ü: "u",
  Ü: "u",
  ç: "c",
  Ç: "c",
  â: "a",
  Â: "a",
  î: "i",
  Î: "i",
  û: "u",
  Û: "u",
};

/** Türkçe karakter ve aksan duyarsız arama anahtarı üretir. */
export const norm = (s = "") =>
  s
    .replace(/[ıİğĞşŞöÖüÜçÇâÂîÎûÛ]/g, (c) => TR[c] ?? c)
    .toLocaleLowerCase("en-US")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
