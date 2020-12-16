#! /usr/bin/env node

import { CodeGen } from 'swagger-typescript-codegen'; 
import { readFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import { cleanupDir, getTsFilename, readfile, renderFile } from './helpers';

const program = new Command();
program
  .usage("[options")
  .requiredOption("-s, --swagger <filePath>", "Path to swagger file")
  .option("-o, --outDir <dirPath>", "Output directory in which the sdk should be generated", "sdk")
  .parse(process.argv);

const swagger = JSON.parse(readfile(program.swagger));
const swaggerObject = CodeGen.getDataAndOptionsForGeneration({swagger});

// Templates
const exportsMustache = readFileSync(join(__dirname, '..', 'templates/exports.mustache')).toString();
const interfaceMustache = readFileSync(join(__dirname, '..', 'templates/interface.mustache')).toString();

// Generate models
const modelsBasePath = `${program.outDir}/models`;
cleanupDir(modelsBasePath);
renderFile(`${modelsBasePath}/index.ts`, exportsMustache, {exports: swaggerObject.data.definitions});
for (const def of swaggerObject.data.definitions) {
  // get imports and remove duplicates
  const propNames = (def.tsType.properties || []).map((prop) => prop.target);
  const dependencies = propNames.filter((el, index) => propNames.indexOf(el) === index);
  const filePath = `${modelsBasePath}/${getTsFilename(def.name)}`;
  renderFile(filePath, interfaceMustache, Object.assign({}, def, {dependencies}));
}

