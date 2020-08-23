import { DynamicModule, Module } from '@nestjs/common';
import { AZURE_STORAGE_MODULE_OPTIONS } from './azure-storage.constant';
import {
  AzureStorageService,
} from './azure-storage.service';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { AzureStorageOptions } from './azure-nest-storage.interface';

interface AzureStorageModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<AzureStorageOptions> | AzureStorageOptions;
  inject?: any[];
}

const PUBLIC_PROVIDERS = [AzureStorageService];

@Module({
  providers: [...PUBLIC_PROVIDERS],
  exports: [...PUBLIC_PROVIDERS],
})
export class AzureStorageModule {
  static withConfig(options: AzureStorageOptions): DynamicModule {
    return {
      module: AzureStorageModule,
      providers: [
        {
          provide: AZURE_STORAGE_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static withConfigAsync(
    options: AzureStorageModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: AzureStorageModule,
      imports: options.imports || [],
      providers: [
        {
          provide: AZURE_STORAGE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }
}
