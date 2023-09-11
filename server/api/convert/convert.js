import sharp from "sharp"
import path from "path"
import fs from "fs"

export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const tmpFolder = `public/tmp/${body.uuid}`
    const srcPath = path.join(tmpFolder, "upload", body.name)
    const stripedName = body.name.replace(/\..*?$/, "")
    const newName = `${stripedName}.${body.format}`
    const dstPath = path.join(tmpFolder, "convert", newName)
    if(!fs.existsSync(path.join(tmpFolder, "convert"))) fs.mkdirSync(path.join(tmpFolder, "convert"), {recursive: true}, ()=>{})
    if(fs.existsSync(dstPath)) fs.unlinkSync(dstPath)

    const factory = await sharp(path.resolve(srcPath))

    /* Resize */
    const resizeOptions = {
        withoutEnlargement: true
    }
    if(body.width) resizeOptions.width = body.width
    if(body.height) resizeOptions.height = body.height
    resizeOptions.fit = body.fit
    await factory.resize(resizeOptions)

    /* Format */
    await factory.toFormat(body.format, { quality: body.quality })
    
    /* Trim */
    const trimOptions = {}
    if(body.trimThreshold) trimOptions.threshold = body.trimThreshold
    if(body.trimColor) trimOptions.background = body.trimColor
    if(Object.values(trimOptions).length) await factory.trim(trimOptions)

    /* Create file */
    await factory.toFile(path.resolve(dstPath))

    return {
        name: newName,
        src: dstPath.replace("public", "").replace(/\\/g, "/"),
        size: fs.statSync(dstPath).size
    }
})