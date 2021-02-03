#! /usr/bin/env node

import { CodeGen } from 'swagger-typescript-codegen'; 
import { Command } from 'commander';
import { cleanupDir, filterRedondentValues, getTemplateFile, getTsFilename, readfile, renderFile } from './helpers';
import { existsSync } from 'fs-extra';

const program = new Command();
program
  .usage("[options")
  .requiredOption("-s, --swagger <filePath>", "Path to swagger file")
  .option("-o, --outDir <dirPath>", "Output directory in which the sdk should be generated", "sdk")
  .parse(process.argv);

const swagger = JSON.parse(readfile(program.swagger));
const swaggerObject = CodeGen.getDataAndOptionsForGeneration({swagger});

// Templates
const exportsMustache = getTemplateFile('exports');
const interfaceMustache = getTemplateFile('interface');
const apiRestClientMustache = getTemplateFile('api-restclient');

// Defitions/Properties to ignore due to Canon model
const definitionsToIgnore = ['Iterator«string»'];
const propertiesNamesToIgnore = ['canonMajorVersion', 'canonMinorVersion', 'canonType', 'canonUnknownKeys', 'jsonDomNode', 'jsonObject', 'nameIterator', 'sortedNameIterator'];

// Generate models
const modelsPath = `${program.outDir}/models`;
const modelsBaseFolderName = 'base';
const modelsBasePath = `${modelsPath}/${modelsBaseFolderName}`;
const definitions = swaggerObject.data.definitions.filter((def) => definitionsToIgnore.indexOf(def.name) === -1)
cleanupDir(modelsBasePath);
if (!existsSync(`${modelsPath}/${getTsFilename('index')}`)) {
  renderFile(`${modelsPath}/${getTsFilename('index')}`, exportsMustache, {
    exports: definitions.map((def) => `${modelsBaseFolderName}/${def.name}`), 
    comment: 'Import your custom models here'
  });
} else {
  console.warn(`${modelsPath}/${getTsFilename('index')} has not been overriden as it contains manual customization, make sure to export the new base models here`);
}
for (const def of definitions) {
  // get imports and remove duplicates
  const propTypes = (def.tsType.isArray ? [def.tsType] : def.tsType.properties || [])
    .filter((prop) => propertiesNamesToIgnore.indexOf(prop.name) === -1)
    .map((prop) => prop.target || prop.isArray && (prop as any).elementType.target);
  const tsImports = filterRedondentValues(propTypes).filter((importName) => definitionsToIgnore.indexOf(importName) === -1);;
  (def.tsType as any).properties = (def.tsType.properties || []).filter((prop) => propertiesNamesToIgnore.indexOf(prop.name) === -1);
  const filePath = `${modelsBasePath}/${getTsFilename(def.name)}`;
  renderFile(filePath, interfaceMustache, {...def, tsImports});
}

// Generate APIs
const apisBasePath = `${program.outDir}/apis`;
cleanupDir(apisBasePath);
renderFile(`${apisBasePath}/${getTsFilename('index')}`, exportsMustache, {exports: swaggerObject.data.methods.map((m) => m.summary)});
for (const api of swaggerObject.data.methods) {
  const filePath = `${apisBasePath}/${getTsFilename(api.summary)}`;
  const imports = api.successfulResponseTypeIsRef ? [api.successfulResponseType] : [];
  for (const param of api.parameters) {
    if (param.tsType.isRef) {
      imports.push(param.tsType.target);
    }
  }
  const tsImports = filterRedondentValues(imports);
  (api as any).method = api.method.toLowerCase();
  renderFile(filePath, apiRestClientMustache, {...api, tsImports});
}
