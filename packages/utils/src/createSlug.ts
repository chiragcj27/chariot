/**
 * Converts a string to a URL-friendly slug
 * @param str - The string to convert to a slug
 * @returns A URL-friendly slug
 * @example
 * createSlug("Hello World!") // "hello-world"
 * createSlug("React & TypeScript") // "react-typescript"
 */
export function createSlug(str: string): string {
  return str
    .toLowerCase()
    // Replace special characters with spaces
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ')
    // Replace multiple spaces with a single hyphen
    .replace(/\s+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove any non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '');
} 