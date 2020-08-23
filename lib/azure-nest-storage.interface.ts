export interface AzureStorageOptions {
  accountName: string;
  containerName: string;
  sasKey?: string;
}

export interface UploadedFileMetadata {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: string;
  storageUrl?: string;
}
