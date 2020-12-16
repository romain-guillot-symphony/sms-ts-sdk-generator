#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_typescript_codegen_1 = require("swagger-typescript-codegen");
const fs_1 = require("fs");
const path_1 = require("path");
const commander_1 = require("commander");
const helpers_1 = require("./helpers");
const program = new commander_1.Command();
program
    .usage("[options")
    .requiredOption("-s, --swagger <filePath>", "Path to swagger file")
    .option("-o, --outDir <dirPath>", "Output directory in which the sdk should be generated", "sdk")
    .parse(process.argv);
const swagger = JSON.parse(helpers_1.readfile(program.swagger));
const swaggerObject = swagger_typescript_codegen_1.CodeGen.getDataAndOptionsForGeneration({ swagger });
const exportsMustache = fs_1.readFileSync(path_1.join(__dirname, '..', 'templates/exports.mustache')).toString();
const interfaceMustache = fs_1.readFileSync(path_1.join(__dirname, '..', 'templates/interface.mustache')).toString();
const modelsBasePath = `${program.outDir}/models`;
helpers_1.cleanupDir(modelsBasePath);
helpers_1.renderFile(`${modelsBasePath}/${helpers_1.getTsFilename('index')}`, exportsMustache, { exports: swaggerObject.data.definitions });
for (const def of swaggerObject.data.definitions) {
    const propNames = (def.tsType.properties || []).map((prop) => prop.target || prop.isArray && prop.elementType.target);
    if (def.name === 'IQuoteRequest') {
        console.log(def.tsType);
    }
    const tsImports = propNames.filter((el, index) => propNames.indexOf(el) === index);
    const filePath = `${modelsBasePath}/${helpers_1.getTsFilename(def.name)}`;
    helpers_1.renderFile(filePath, interfaceMustache, Object.assign({}, def, { tsImports }));
}
