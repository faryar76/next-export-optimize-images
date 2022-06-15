import path from 'path'

import fs from 'fs-extra'
import got from 'got'

import type { Manifest } from '../types'
type ExternalImagesDownloaderArgs = {
  terse?: boolean
  manifest: Manifest
  destDir: string
}
const externalImagesDownloader = async ({ terse = false, manifest, destDir }: ExternalImagesDownloaderArgs) => {
  if (!terse) {
    // eslint-disable-next-line no-console
    console.log('\n- Download external images -')
  }

  // const promises: Promise<void>[] = []
  const downloadedImages: string[] = []
  let promises = [];
  for (const _V of manifest) {

    let src = _V.src 
    let externalUrl = _V.externalUrl 
    if (externalUrl === undefined) continue

    if (downloadedImages.some((image) => image === externalUrl))
    {
      // console.log("-",externalUrl,'skipped')
      continue
    }else{
      console.log("+",externalUrl,'added')

    }

    // promises.push(
    //   (async () => {
        downloadedImages.push(externalUrl)

        const outputPath = path.join(destDir, src)
        await fs.ensureFile(outputPath)

        const pr = (async()=>{
          return new Promise((resolve, reject) => {
            try {
              console.log('started to download ',externalUrl as string)
              const readStream = got.stream(externalUrl as string,{
                retry:{
                  limit:999
                }
              })
              const writeStream = fs.createWriteStream(outputPath)
  
              readStream.pipe(writeStream)
  
              writeStream.on('finish', () => {
                if (!terse) {
                  // eslint-disable-next-line no-console
                  console.log(`\`${externalUrl}\` has been downloaded.`)
                }
                resolve(undefined)
              })
            } catch (e) {
              console.log('error!')
              reject(e)
            }
          })
        })()
        promises.push(pr)
        if(promises.length==50){
          console.log('new check',promises[0]==promises[1])
          // process.exit()
          console.log('loop started')
          await Promise.all(promises)
          console.log('loop ended')
          promises = []
        }
     
  }
  await Promise.all(promises)
 
}


export default externalImagesDownloader
