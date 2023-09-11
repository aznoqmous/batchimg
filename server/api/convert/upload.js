import fs from "fs"
export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const tmpFolder = `./public/tmp/${body.uuid}/upload`
    const path = `${tmpFolder}/${body.name}`
    const base64Data = body.content.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    if(!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder, {recursive: true}, ()=>{})
    await fs.appendFileSync(path, base64Data, {encoding: 'base64'}, (err)=>{
        console.log(err)
    })
    return path
})