"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterRedondentValues = exports.getTemplateFile = exports.renderFile = exports.cleanupDir = exports.getTsFilename = exports.readfile = void 0;
const fs_extra_1 = require("fs-extra");
const Mustache = require("mustache");
const path_1 = require("path");
exports.readfile = (filePath) => fs_extra_1.readFileSync(filePath, 'utf-8');
exports.getTsFilename = (className) => `${className}.ts`;
exports.cleanupDir = (dirPath) => {
    console.info(`Cleaning up: ${dirPath}`);
    fs_extra_1.emptyDirSync(dirPath);
};
exports.renderFile = (filePath, mustacheTemplate, data) => {
    console.info(`Generating ${filePath}`);
    if (!fs_extra_1.existsSync(path_1.dirname(filePath))) {
        fs_extra_1.mkdirSync(path_1.dirname(filePath), { recursive: true });
    }
    fs_extra_1.writeFileSync(filePath, Mustache.render(mustacheTemplate, data), 'utf8');
};
exports.getTemplateFile = (templateName) => {
    return fs_extra_1.readFileSync(path_1.join(__dirname, '..', `templates/${templateName}.mustache`)).toString();
};
exports.filterRedondentValues = (arr) => {
    return arr.filter((el, index) => arr.indexOf(el) === index);
};
