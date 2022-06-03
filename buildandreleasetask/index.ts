import tl = require('azure-pipelines-task-lib/task')
import fs from 'fs'

//const templatesDir : string = '~/.local/share/godot/templates';
const templatesDir : string = './run/templates';

async function run(){
    try {
        const projectPath: string | undefined = tl.getPathInput('project', true, true);
        const preset: string | undefined = tl.getInput('preset', true);
        const version: string | undefined = tl.getInput('version', true);

        let wget = getTool('wget');
        if(shouldDownloadGodot(version)){

             wget.arg(`https://downloads.tuxfamily.org/godotengine/${version}/Godot_v${version}-stable_linux_server.64.zip`);
             wget.arg("-O");
             wget.arg(`${tl.getVariable("Agent.TempDirectory")}/godot.zip`);
             
             let fetchGodotResult = await wget.exec();

             if(fetchGodotResult == 0){
             
                 let unzip = getTool('unzip');
                 unzip.arg('-j');
                 unzip.arg(`${tl.getVariable("Agent.TempDirectory")}/godot.zip`);
                 unzip.arg('-d');
                 unzip.arg(`${tl.getVariable("Agent.ToolsDirectory")}`);

                 unzip.exec();

             }else{
                 tl.setResult(tl.TaskResult.Failed, "Unable fetch godot executable");
                 return;
             }

        }else{
            tl.logDetail("Godot Download", "Godot found will not re-download it"); 
        }
 

        if(shouldDownloadTemplates(version)){ 

            wget.arg(`https://downloads.tuxfamily.org/godotengine/${version}/Godot_v${version}-stable_export_templates.tpz`);
            wget.arg("-O");
            wget.arg(`${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`);
            
            let fetchTemplatesResult = await wget.exec();

            if(fetchTemplatesResult == 0){
            
                let unzip = getTool('unzip');
                unzip.arg('-j');
                unzip.arg(`${tl.getVariable("Agent.TempDirectory")}/templates.zip`);
                unzip.arg('-d');
                unzip.arg(`${templatesDir}/${version}`);

                unzip.exec();

            }else{
                tl.setResult(tl.TaskResult.Failed, "Unable fetch godot executable");
                return;
            }

        }else{
            tl.logDetail("Template Download", "Templates found will not re-download them"); 
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

function shouldDownloadGodot(version: string | undefined){
    return !fs.existsSync(`${tl.getVariable("Agent.ToolsDirectory")}/Godot_v${version}-stable_linux_server.64`);    
}

function shouldDownloadTemplates(version: string | undefined){
    return !fs.existsSync(`${tl.getVariable("Agent.TempDirectory")}/${version}-templates.zip`); 
}

run();
