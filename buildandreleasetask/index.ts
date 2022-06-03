import tl = require('azure-pipelines-task-lib/task')
import fs from 'fs'

//const templatesDir : string = '~/.local/share/godot/templates';
const templatesDir : string = './run/templates';

async function run(){
    try {
        const projectPath: string | undefined = tl.getPathInput('project', true, true);
        const preset: string | undefined = tl.getInput('preset', true);
        const version: string | undefined = tl.getInput('version', true);

        let fetchGodotResult = 0;

        if(shouldDownloadGodot(version)){
           fetchGodotResult = await downloadFile(`https://downloads.tuxfamily.org/godotengine/${version}/Godot_v${version}-stable_linux_server.64.zip`,
                                                 `${tl.getVariable("Agent.TempDirectory")}/godot.zip`);
        }else{
            tl.logDetail("Godot Download", "Godot found will not re-download it"); 
        }
 
        if(fetchGodotResult == 0){
            await unzipArchive(`${tl.getVariable("Agent.TempDirectory")}/godot.zip`,
                               `${tl.getVariable("Agent.ToolsDirectory")}`);
        }else{
            tl.setResult(tl.TaskResult.Failed, "Unable fetch godot executable");
            return;
        }

        let fetchTemplatesResult = 0;

        if(shouldDownloadTemplates(version)){ 
            fetchTemplatesResult = await downloadFile(`https://downloads.tuxfamily.org/godotengine/${version}/Godot_v${version}-stable_export_templates.tpz`,
                                                      `${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`);
        }else{
            tl.logDetail("Template Download", "Templates found will not re-download them"); 
        }

        if(fetchTemplatesResult == 0){
            await unzipArchive(`${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`,
                               `${templatesDir}/${version}`);
        }else{
            tl.setResult(tl.TaskResult.Failed, "Unable fetch godot templates");
            return;
        }
    }
    catch (err) {
       tl.setResult(tl.TaskResult.Failed, (err as Error).message); 
    }

}

function getTool(toolName : string){
    let tool = tl.which(toolName, true);
    return tl.tool(tool);
}

async function downloadFile(url: string, targetPath: string): Promise<number>
{

    let wget = getTool('wget');
    wget.arg(url);
    wget.arg("-O");
    wget.arg(targetPath);
    
    return wget.exec();
}

async function unzipArchive(filePath: string, targetPath: string): Promise<number>
{
    tl.mkdirP(targetPath);
    let unzip = getTool('unzip');
    unzip.arg('-o');
    unzip.arg(filePath);
    unzip.arg('-d');
    unzip.arg(targetPath);
    
    return unzip.exec();
}

function shouldDownloadGodot(version: string | undefined){
    return !fs.existsSync(`${tl.getVariable("Agent.ToolsDirectory")}/Godot_v${version}-stable_linux_server.64`);    
}

function shouldDownloadTemplates(version: string | undefined){
    return !fs.existsSync(`${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`); 
}

run();
