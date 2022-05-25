"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const fs_1 = __importDefault(require("fs"));
//const templatesDir : string = '~/.local/share/godot/templates';
const templatesDir = './run/templates';
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectPath = tl.getPathInput('project', true, true);
            const preset = tl.getInput('preset', true);
            const version = tl.getInput('version', true);
            let wget = getTool('wget');
            if (shouldDownloadGodot(version)) {
                wget.arg(`https://downloads.tuxfamily.org/godotengine/${version}/Godot_v${version}-stable_linux_server.64.zip`);
                wget.arg("-O");
                wget.arg(`${tl.getVariable("Agent.TempDirectory")}/godot.zip`);
                let fetchGodotResult = yield wget.exec();
                if (fetchGodotResult == 0) {
                    let unzip = getTool('unzip');
                    unzip.arg('-j');
                    unzip.arg(`${tl.getVariable("Agent.TempDirectory")}/godot.zip`);
                    unzip.arg('-d');
                    unzip.arg(`${tl.getVariable("Agent.ToolsDirectory")}`);
                    unzip.exec();
                }
                else {
                    tl.setResult(tl.TaskResult.Failed, "Unable fetch godot executable");
                    return;
                }
            }
            else {
                tl.logDetail("Godot Download", "Godot found will not re-download it");
            }
            if (shouldDownloadTemplates(version)) {
                wget.arg(`https://downloads.tuxfamily.org/godotengine/${version}/Godot_v${version}-stable_export_templates.tpz`);
                wget.arg("-O");
                wget.arg(`${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`);
                let fetchTemplatesResult = yield wget.exec();
                if (fetchTemplatesResult == 0) {
                    let unzip = getTool('unzip');
                    unzip.arg('-j');
                    unzip.arg(`${tl.getVariable("Agent.TempDirectory")}/templates.zip`);
                    unzip.arg('-d');
                    unzip.arg(`${templatesDir}/${version}`);
                    unzip.exec();
                }
                else {
                    tl.setResult(tl.TaskResult.Failed, "Unable fetch godot executable");
                    return;
                }
            }
            else {
                tl.logDetail("Template Download", "Templates found will not re-download them");
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
function getTool(toolName) {
    let tool = tl.which(toolName, true);
    return tl.tool(tool);
}
function shouldDownloadGodot(version) {
    return !fs_1.default.existsSync(`${tl.getVariable("Agent.ToolsDirectory")}/Godot_v${version}-stable_linux_server.64`);
}
function shouldDownloadTemplates(version) {
    return !fs_1.default.existsSync(`${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`);
}
run();
