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
            let fetchGodotResult = 0;
            if (shouldDownloadGodot(version)) {
                fetchGodotResult = yield downloadFile(`https://downloads.tuxfamily.org/godotengine/${version}/Godot_v${version}-stable_linux_server.64.zip`, `${tl.getVariable("Agent.TempDirectory")}/godot.zip`);
            }
            else {
                tl.logDetail("Godot Download", "Godot found will not re-download it");
            }
            if (fetchGodotResult == 0) {
                yield unzipArchive(`${tl.getVariable("Agent.TempDirectory")}/godot.zip`, `${tl.getVariable("Agent.ToolsDirectory")}`);
            }
            else {
                tl.setResult(tl.TaskResult.Failed, "Unable fetch godot executable");
                return;
            }
            let fetchTemplatesResult = 0;
            if (shouldDownloadTemplates(version)) {
                fetchTemplatesResult = yield downloadFile(`https://downloads.tuxfamily.org/godotengine/${version}/Godot_v${version}-stable_export_templates.tpz`, `${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`);
            }
            else {
                tl.logDetail("Template Download", "Templates found will not re-download them");
            }
            if (fetchTemplatesResult == 0) {
                yield unzipArchive(`${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`, `${templatesDir}/${version}`);
            }
            else {
                tl.setResult(tl.TaskResult.Failed, "Unable fetch godot templates");
                return;
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
function downloadFile(url, targetPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let wget = getTool('wget');
        wget.arg(url);
        wget.arg("-O");
        wget.arg(targetPath);
        return wget.exec();
    });
}
function unzipArchive(filePath, targetPath) {
    return __awaiter(this, void 0, void 0, function* () {
        tl.mkdirP(targetPath);
        let unzip = getTool('unzip');
        unzip.arg('-o');
        unzip.arg(filePath);
        unzip.arg('-d');
        unzip.arg(targetPath);
        return unzip.exec();
    });
}
function shouldDownloadGodot(version) {
    return !fs_1.default.existsSync(`${tl.getVariable("Agent.ToolsDirectory")}/Godot_v${version}-stable_linux_server.64`);
}
function shouldDownloadTemplates(version) {
    return !fs_1.default.existsSync(`${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`);
}
run();
