import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProductTransformController } from './transform.controller';
import { ProductTransformService } from './transform.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/temp', // Temporary upload directory
    }),
  ],
  controllers: [ProductTransformController],
  providers: [ProductTransformService],
  exports: [ProductTransformService],
})
export class ProductTransformModule {}
