"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterRedondentValues = exports.getTemplateFile = exports.renderFile = exports.cleanupDir = exports.getTsFilename = exports.readfile = void 0;
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const Mustache = require("mustache");
const path_1 = require("path");
exports.readfile = (filePath) => fs_1.readFileSync(filePath, 'utf-8');
exports.getTsFilename = (className) => `${className}.ts`;
exports.cleanupDir = (dirPath) => {
    console.info(`Cleaning up: ${dirPath}`);
    fs_extra_1.emptyDirSync(dirPath);
};
exports.renderFile = (filePath, mustacheTemplate, data) => {
    console.info(`Generating ${filePath}`);
    fs_1.writeFileSync(filePath, Mustache.render(mustacheTemplate, data), 'utf8');
};
exports.getTemplateFile = (templateName) => {
    return fs_1.readFileSync(path_1.join(__dirname, '..', `templates/${templateName}.mustache`)).toString();
};
exports.filterRedondentValues = (arr) => {
    return arr.filter((el, index) => arr.indexOf(el) === index);
};
