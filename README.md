## Description

[Azure Storage](http://bit.ly/nest_azure-storage-blob) module for [Nest](https://github.com/nestjs/nest) framework (node.js)

## Tutorial

Learn how to get started with [Azure table storage for NestJS](https://trilon.io/blog/nestjs-nosql-azure-table-storage)

## Before Installation

1. Create a Storage account and resource ([read more](http://bit.ly/nest_new-azure-storage-account))
1. In the [Azure Portal](https://portal.azure.com), go to **Dashboard > Storage > _your-storage-account_**.
2. Note down the "AccountName", "AccountKey" obtained at **Access keys** and "AccountSAS" from **Shared access signature** under **Settings** tab.

## Configuration

1. Install the package using NPM:

```bash
$ npm i -S nest-azure-storage
```

2. Create or update your existing `.env` file with the following content:

```bash
# See: http://bit.ly/azure-storage-sas-key
AZURE_STORAGE_SAS_KEY=
# See: http://bit.ly/azure-storage-account
AZURE_STORAGE_ACCOUNT=
```

> The SAS has the following format: `?sv=2018-03-28&ss=bfqt&srt=sco&sp=rwdlacup&se=2019-12-31T22:54:03Z&st=2019-07-11T13:54:03Z&spr=https,http&sig=WmAl%236251oj11biPK2xcpLs254152H9s0%3D`

3. **IMPORTANT: Make sure to add your `.env` file to your `.gitignore`! The `.env` file MUST NOT be versionned on Git.**

4. Make sure to include the following call to your main file:

```typescript
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
```

> This line must be added before any other imports!

5. Import the `AzureStorageModule` with the following configuration:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AzureStorageModule } from '@nestjs/azure-storage';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AzureStorageModule.withConfig({
      sasKey: process.env['AZURE_STORAGE_SAS_KEY'],
      accountName: process.env['AZURE_STORAGE_ACCOUNT'],
      containerName: 'nest-demo-container',
    }),
  ],
})
export class AppModule {}
```

> You may provide a default `containerName` name for the whole module, this will apply to all controllers withing this module. You can also provide (override) the `containerName` in the controller, for each route.

## Story examples

### Store a file using the default container name

```typescript
import {
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AzureStorageFileInterceptor,
  UploadedFileMetadata,
} from 'nest-azure-storage';

@Controller()
export class AppController {
  
  @Post('azure/upload')
  @UseInterceptors(
    AzureStorageFileInterceptor('file'),
  )
  UploadedFilesUsingInterceptor(
    @UploadedFile()
    file: UploadedFileMetadata,
  ) {
    Logger.log(`Storage URL: ${file.storageUrl}`, 'AppController');
  }
}
```

### Store a file using a specific container name

```typescript
import {
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AzureStorageFileInterceptor,
  UploadedFileMetadata,
} from 'nest-azure-storage';

@Controller()
export class AppController {
  
  @Post('azure/upload')
  @UseInterceptors(
    AzureStorageFileInterceptor('file', null, {
      containerName: 'nest-demo-container-interceptor',
    }),
  )
  UploadedFilesUsingInterceptor(
    @UploadedFile()
    file: UploadedFileMetadata,
  ) {
    Logger.log(`Storage URL: ${file.storageUrl}`, 'AppController');
  }
}
```

### Store a file using a custom file name

```typescript
import {
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AzureStorageFileInterceptor,
  AzureStorageService,
  UploadedFileMetadata,
} from 'nest-azure-storage';

@Controller()
export class AppController {
  constructor(private readonly azureStorage: AzureStorageService) {}
  
  @Post('azure/upload')
  @UseInterceptors(FileInterceptor('file'))
  async UploadedFilesUsingService(
    @UploadedFile()
    file: UploadedFileMetadata,
  ) {
    file = {
      ...file,
      originalname: 'foo-bar.txt',
    };
    const storageUrl = await this.azureStorage.upload(file);
    Logger.log(`Storage URL: ${storageUrl}`, 'AppController');
  }
}
```

## Stay in touch

* Author - [Vishal Isharani](https://vishalisharani.in/)
* LinkedIn - [Vishal Isharani](https://www.linkedin.com/in/vishal-isharani-a29832100/)
