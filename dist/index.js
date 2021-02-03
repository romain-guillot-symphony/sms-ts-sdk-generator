#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_typescript_codegen_1 = require("swagger-typescript-codegen");
const commander_1 = require("commander");
const helpers_1 = require("./helpers");
const fs_extra_1 = require("fs-extra");
const program = new commander_1.Command();
program
    .usage("[options")
    .requiredOption("-s, --swagger <filePath>", "Path to swagger file")
    .option("-o, --outDir <dirPath>", "Output directory in which the sdk should be generated", "sdk")
    .parse(process.argv);
const swagger = JSON.parse(helpers_1.readfile(program.swagger));
const swaggerObject = swagger_typescript_codegen_1.CodeGen.getDataAndOptionsForGeneration({ swagger });
const exportsMustache = helpers_1.getTemplateFile('exports');
const interfaceMustache = helpers_1.getTemplateFile('interface');
const apiRestClientMustache = helpers_1.getTemplateFile('api-restclient');
const definitionsToIgnore = ['Iterator«string»'];
const propertiesNamesToIgnore = ['canonMajorVersion', 'canonMinorVersion', 'canonType', 'canonUnknownKeys', 'jsonDomNode', 'jsonObject', 'nameIterator', 'sortedNameIterator'];
const modelsPath = `${program.outDir}/models`;
const modelsBaseFolderName = 'base';
const modelsBasePath = `${modelsPath}/${modelsBaseFolderName}`;
const definitions = swaggerObject.data.definitions.filter((def) => definitionsToIgnore.indexOf(def.name) === -1);
helpers_1.cleanupDir(modelsBasePath);
if (!fs_extra_1.existsSync(`${modelsPath}/${helpers_1.getTsFilename('index')}`)) {
    helpers_1.renderFile(`${modelsPath}/${helpers_1.getTsFilename('index')}`, exportsMustache, {
        exports: definitions.map((def) => `${modelsBaseFolderName}/${def.name}`),
        comment: 'Import your custom models here'
    });
}
else {
    console.warn(`${modelsPath}/${helpers_1.getTsFilename('index')} has not been overriden as it contains manual customization, make sure to export the new base models here`);
}
for (const def of definitions) {
    const propTypes = (def.tsType.isArray ? [def.tsType] : def.tsType.properties || [])
        .filter((prop) => propertiesNamesToIgnore.indexOf(prop.name) === -1)
        .map((prop) => prop.target || prop.isArray && prop.elementType.target);
    const tsImports = helpers_1.filterRedondentValues(propTypes).filter((importName) => definitionsToIgnore.indexOf(importName) === -1);
    ;
    def.tsType.properties = (def.tsType.properties || []).filter((prop) => propertiesNamesToIgnore.indexOf(prop.name) === -1);
    const filePath = `${modelsBasePath}/${helpers_1.getTsFilename(def.name)}`;
    helpers_1.renderFile(filePath, interfaceMustache, Object.assign(Object.assign({}, def), { tsImports }));
}
const apisBasePath = `${program.outDir}/apis`;
helpers_1.cleanupDir(apisBasePath);
helpers_1.renderFile(`${apisBasePath}/${helpers_1.getTsFilename('index')}`, exportsMustache, { exports: swaggerObject.data.methods.map((m) => m.summary) });
for (const api of swaggerObject.data.methods) {
    const filePath = `${apisBasePath}/${helpers_1.getTsFilename(api.summary)}`;
    const imports = api.successfulResponseTypeIsRef ? [api.successfulResponseType] : [];
    for (const param of api.parameters) {
        if (param.tsType.isRef) {
            imports.push(param.tsType.target);
        }
    }
    const tsImports = helpers_1.filterRedondentValues(imports);
    api.method = api.method.toLowerCase();
    helpers_1.renderFile(filePath, apiRestClientMustache, Object.assign(Object.assign({}, api), { tsImports }));
}
