import { BlobServiceClient } from '@azure/storage-blob';
import { Inject, Injectable } from '@nestjs/common';
import { AZURE_STORAGE_MODULE_OPTIONS } from './azure-storage.constant';
import {
  AzureStorageOptions,
  UploadedFileMetadata,
} from './azure-nest-storage.interface';

@Injectable()
export class AzureStorageService {
  constructor(
    @Inject(AZURE_STORAGE_MODULE_OPTIONS)
    private readonly options: AzureStorageOptions,
  ) {}

  async upload(
    file: UploadedFileMetadata,
    perRequestOptions: Partial<AzureStorageOptions> = null,
  ): Promise<string | null> {
    // override global options with the provided ones for this request
    perRequestOptions = {
      ...this.options,
      ...perRequestOptions,
    };

    if (!perRequestOptions.accountName) {
      throw new Error(
        `Error encountered: "AZURE_STORAGE_ACCOUNT" was not provided.`,
      );
    }

    if (!perRequestOptions.sasKey) {
      throw new Error(
        `Error encountered: "AZURE_STORAGE_SAS_KEY" was not provided.`,
      );
    }

    const { buffer, mimetype } = file;

    if (!buffer) {
      throw new Error(
        `Error encountered: File is not a valid Buffer (missing buffer property)`,
      );
    }

    const blobServiceClient = new BlobServiceClient(
      this._getServiceUrl(perRequestOptions),
    );

    const containerClient = blobServiceClient.getContainerClient(
      perRequestOptions.containerName,
    );
    if (!containerClient) {
      throw new Error(`Container not found ${perRequestOptions.containerName}`);
    }

    try {
      const blobName = file.originalname;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(buffer, buffer.byteLength, {
        blobHTTPHeaders: {
          blobContentType: mimetype || 'application/octet-stream',
        },
      });

      return `${blobServiceClient.url}/${blobName}`;
    } catch (error) {
      throw new Error(error);
    }
  }

  async uploadMultiple(
    files: UploadedFileMetadata[],
    perRequestOptions: Partial<AzureStorageOptions> = null,
  ): Promise<string[] | null> {
    try {
      const res = [];
      for (const file of files) {
        res.push(await this.upload(file, perRequestOptions));
      }
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }

  async delete(
    fileName: string,
    perRequestOptions: Partial<AzureStorageOptions> = null,
  ): Promise<string> {
    perRequestOptions = {
      ...this.options,
      ...perRequestOptions,
    };

    if (!perRequestOptions.accountName) {
      throw new Error(
        `Error encountered: "AZURE_STORAGE_ACCOUNT" was not provided.`,
      );
    }

    if (!perRequestOptions.sasKey) {
      throw new Error(
        `Error encountered: "AZURE_STORAGE_SAS_KEY" was not provided.`,
      );
    }

    const blobServiceClient = new BlobServiceClient(
      this._getServiceUrl(perRequestOptions),
    );

    try {
      const containerClient = blobServiceClient.getContainerClient(
        perRequestOptions.containerName,
      );
      await containerClient.deleteBlob(fileName);

      return `${blobServiceClient.url}/${fileName} deleted successfully`;
    } catch (error) {
      throw new Error(error);
    }
  }

  private _getServiceUrl(perRequestOptions: Partial<AzureStorageOptions>) {
    // remove the first ? symbol if present
    perRequestOptions.sasKey = perRequestOptions.sasKey.replace('?', '');
    return `https://${perRequestOptions.accountName}.blob.core.windows.net/?${perRequestOptions.sasKey}`;
  }
}
