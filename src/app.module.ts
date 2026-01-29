import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParseModule } from './parse/parse.module';
import { ProductTransformModule } from './transform/transform.module';

@Module({
  imports: [ParseModule, ProductTransformModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
