import { id } from './id';
import { en } from './en';
import { SupportedLanguage, TranslationSchema } from '../types';

export const LOCALES: Record<SupportedLanguage, TranslationSchema> = {
  id,
  en,
};
