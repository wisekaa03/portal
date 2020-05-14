/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ImageModule } from '@app/image';
import { ProfileEntity } from './profile.entity';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
// #endregion

@Module({
  imports: [
    // #region Image module
    ImageModule,
    // #endregion

    // #region TypeORM
    TypeOrmModule.forFeature([ProfileEntity]),
    // #endregion
  ],
  providers: [ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
