import pinataSDK from "@pinata/sdk"
import fs from "fs"
import path from "path"

const pinataApiKey = process.env.PINATA_API_KEY || ""
const pinataApiSecret = process.env.PINATA_API_SECRET || ""
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

export async function storeImage(imageFilePath: string) {
    const fullImagePath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fullImagePath)
    let responses: any[] = []
    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagePath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error: any) {
            console.log(error)
        }
    }

    return { responses, files }
}

export async function storeTokenUriMetadata(metadata: Object) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error: any) {
        console.log(error)
    }
    return null
}
