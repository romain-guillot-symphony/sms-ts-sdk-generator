#! /usr/bin/env node

import { CodeGen } from 'swagger-typescript-codegen'; 
import { Command } from 'commander';
import { cleanupDir, filterRedondentValues, getTemplateFile, getTsFilename, readfile, renderFile } from './helpers';

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
const apiMustache = getTemplateFile('api');

// Generate models
const modelsBasePath = `${program.outDir}/models`;
cleanupDir(modelsBasePath);
renderFile(`${modelsBasePath}/${getTsFilename('index')}`, exportsMustache, {exports: swaggerObject.data.definitions.map((def) => def.name)});
for (const def of swaggerObject.data.definitions) {
  // get imports and remove duplicates
  const propNames = (def.tsType.properties || []).map((prop) => prop.target || prop.isArray && (prop as any).elementType.target);
  const tsImports = filterRedondentValues(propNames);
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
  renderFile(filePath, apiMustache, {...api, tsImports});
}
