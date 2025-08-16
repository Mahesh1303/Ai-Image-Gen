export abstract class BaseModel {
  constructor() {}

  abstract generateImage(prompt: string, tensorPath: string): Promise<any>
  abstract trainModel(zipUrl: string, triggeredWord: string) :Promise<any>
  abstract generateImagesSyncPack(prompt: string, tensorPath: string): Promise<any>
}
