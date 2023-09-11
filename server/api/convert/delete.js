import fs from "fs"
export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const tmpFolder = "./public/tmp"
    const path = `${tmpFolder}/${body.uuid}`
    const deleteFolderRecursive = function(path) {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file) {
              var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
          }
      };
    deleteFolderRecursive(path)
    return {
        body
    }
})