import { readFileSync, writeFileSync } from 'fs';
import { emptyDirSync } from 'fs-extra';
import * as Mustache from 'mustache';

/**
 * Read a file
 * @param filePath 
 */
export const readfile = (filePath: string) => readFileSync(filePath, 'utf-8');

/**
 * Define typescript file name
 * @param className 
 */
export const getTsFilename = (className: string) => `${className}.ts`;

/**
 * Cleans up a directory
 * @param dirPath 
 */
export const cleanupDir = (dirPath: string) => {
  console.info(`Cleaning up: ${dirPath}`);
  emptyDirSync(dirPath);
}

/**
 * Render a file from a template
 * @param filePath 
 * @param mustacheTemplate 
 * @param data 
 */
export const renderFile = (filePath: string, mustacheTemplate: string, data: any) => {
  console.info(`Generating ${filePath}`);
  writeFileSync(
    filePath, 
    Mustache.render(mustacheTemplate, data),
    'utf8'
  );
};
