import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  AzureStorageService,
} from './azure-storage.service';
import { AzureStorageOptions } from './azure-nest-storage.interface';

export function AzureStorageFileInterceptor(
  fieldName: string,
  localOptions?: MulterOptions,
  azureStorageOptions?: Partial<AzureStorageOptions>,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    interceptor: NestInterceptor;

    constructor(private readonly azureStorage: AzureStorageService) {
      this.interceptor = new (FileInterceptor(fieldName, localOptions))();
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<any> {
      (await this.interceptor.intercept(context, next)) as any;

      const request = context.switchToHttp().getRequest();
      const file = request[fieldName];

      if (!file) {
        Logger.warn(
          'AzureStorageFileInterceptor',
          `Can not intercept field "${fieldName}". Did you specify the correct field name in @AzureStorageFileInterceptor('${fieldName}')?`,
        );
        return next.handle();
      }

      file.storageUrl = await this.azureStorage.upload(
        file,
        azureStorageOptions,
      );
      return next.handle();
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}
