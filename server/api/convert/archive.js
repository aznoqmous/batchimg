import archiver from "archiver"
import fs from "fs"
import path from "path"
import process from "process"

export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const publicPath = "/archive.zip"
    const sourceDirectory = process.cwd() + `/public/tmp/${body.uuid}/convert`
    const targetFile = `${process.cwd()}/public${publicPath}`
    await new Promise(resolve => {
        const output = fs.createWriteStream(targetFile)
        const archive = archiver('zip')
        archive.pipe(output)
        archive.directory(sourceDirectory, false)
        archive.finalize()
        output.on('close', ()=> resolve("/archive.zip"))
    })
    return {
        targetPath: "/archive.zip"
    }
})
