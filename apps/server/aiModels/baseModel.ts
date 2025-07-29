export abstract class BaseModel {
  constructor() {}

  abstract generateImage(prompt: string, paths: string): Promise<any>
  abstract trainModel(zipUrl: string, triggeredWord: string) :Promise<any>
}
