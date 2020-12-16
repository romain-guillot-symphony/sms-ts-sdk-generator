"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFile = exports.cleanupDir = exports.getTsFilename = exports.readfile = void 0;
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const Mustache = require("mustache");
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
