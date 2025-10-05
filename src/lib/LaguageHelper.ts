// src/lib/LanguageHelper.ts
import { tmdbService } from "./api/TMDbServices";


const LANGUAGE_KEY = "appLanguage";

export const getLanguage = (): "en-US" | "id-ID" => {
  const lang = localStorage.getItem(LANGUAGE_KEY);
  return lang === "id-ID" ? "id-ID" : "en-US";
};

export const setLanguage = (lang: "en-US" | "id-ID"): void => {
  localStorage.setItem(LANGUAGE_KEY, lang);
  try {
    tmdbService.setLanguage(lang);
  } catch (error) {
    console.error("Failed to update TMDb language:", error);
  }
};
