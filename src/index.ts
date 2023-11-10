import {IPluginConfig, PicGo} from 'picgo'
import crypto from 'crypto'

const mime_types = require("mime")

const generateSignature = (options: any, fileName: string, extname: string): string => {
  const date = new Date().toUTCString()
  const mimeType = mime_types.getType(fileName)
  if (!mimeType) {
    throw Error(`No mime type found for file ${fileName}`)
  }
  const path = options.path
  const strToSign = `PUT\n\n${mimeType}\n${date}\n/${options.bucketName}${path ? '/' + encodeURI(options.path) : ''}/${encodeURI(fileName)}`
  const signature = crypto.createHmac('sha256', options.accessKeySecret).update(strToSign).digest('base64')
  return `QS ${options.accessKeyId}:${signature}`
}

const postOptions = (options: any, fileName: string, signature: string, image: Buffer): any => {
  const path = options.path
  const mimeType = mime_types.getType(fileName)
  return {
    method: 'PUT',
    url: `https://${options.bucketName}.${options.endpoint}${path ? '/' + encodeURI(options.path) : ''}/${encodeURI(fileName)}`,
    headers: {
      Authorization: signature,
      Date: new Date().toUTCString(),
      'content-type': mimeType
    },
    body: image,
    resolveWithFullResponse: true
  }
}

const handle = async (ctx: PicGo) => {
  const qingyunOptions = ctx.getConfig<config>('picBed.qingyun-uploader')
  if (!qingyunOptions) {
    throw new Error('找不到青云存储图床配置文件')
  }

  try {
    const images = ctx.output
    for (const img of images) {
      if (img.fileName && img.buffer) {
        const signature = generateSignature(qingyunOptions, img.fileName, img.extname)
        let image = img.buffer
        if (!image && img.base64Image) {
          image = Buffer.from(img.base64Image, 'base64')
        }

        const options = postOptions(qingyunOptions, img.fileName, signature, image)

        await ctx.request(options)


        delete img.base64Image
        delete img.buffer
        const path = qingyunOptions.path
        const domain = qingyunOptions.customDomain ? qingyunOptions.customDomain : `https://${qingyunOptions.bucketName}.${qingyunOptions.endpoint}`
        img.imgUrl = `${domain}${path ? '/' + path : ''}/${img.fileName}`

      }
    }
    return ctx

  } catch (e) {
    ctx.log.error(e)
    let message = e.message
    ctx.emit('notification', {
      title: '上传失败！',
      body: message
    })
  }
}

const config = (ctx: PicGo): IPluginConfig[] => {
  const userConfig = ctx.getConfig<config>('picBed.qingyun-uploader') ||
    {
      accessKeyId: '',
      accessKeySecret: '',
      bucketName: '',
      endpoint: '',
      path: '',
      imageProcess: '',
      customDomain: ''
    }
  return [
    {
      name: 'accessKeyId',
      type: 'input',
      alias: 'AccessKeyId',
      default: userConfig.accessKeyId || '',
      message: '例如XLHAFIDTRNX8SD6GYF1K',
      required: true
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      alias: 'AccessKeySecret',
      default: userConfig.accessKeySecret || '',
      message: '例如JuVs00Hua1YEDtJpEGaoOetYun3CFengXvjVbts4',
      required: true
    },
    {
      name: 'bucketName',
      type: 'input',
      alias: '存储桶名称',
      default: userConfig.bucketName || '',
      message: '例如bucket01',
      required: true
    },
    {
      name: 'endpoint',
      type: 'input',
      alias: '区域',
      default: userConfig.endpoint || '',
      message: '例如obs.cn-south-1.myhuaweicloud.com',
      required: true
    },
    {
      name: 'path',
      type: 'input',
      alias: '存储路径',
      message: '在桶中存储的路径，例如img或img/github',
      default: userConfig.path || '',
      required: false
    },
    {
      name: 'imageProcess',
      type: 'input',
      alias: '网址后缀',
      message: '例如?x-image-process=image/resize,p_100',
      default: userConfig.imageProcess || '',
      required: false
    },
    {
      name: 'customDomain',
      type: 'input',
      alias: '自定义域名',
      message: '例如https://mydomain.com',
      default: userConfig.customDomain || '',
      required: false
    }
  ]
}

export = (ctx: PicGo) => {
  const register = () => {
    ctx.helper.uploader.register('qingyun-uploader', {
      handle,
      name: '青云存储',
      config
    })
  }
  return {
    uploader: 'qingyun-uploader',
    register,
  }
}
