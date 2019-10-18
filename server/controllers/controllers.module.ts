/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { NextModule } from '../next/next.module';
import { LoggerModule } from '../logger/logger.module';
import { AuthController } from './auth/auth.controller';
import { HomeController } from './home/home.controller';
import { PhonebookController } from './phonebook/phonebook.controller';
import { MailController } from './mail/mail.controller';
import { NewsController } from './news/news.controller';
// #endregion

@Module({
  imports: [NextModule, LoggerModule],
  controllers: [HomeController, AuthController, PhonebookController, MailController, NewsController],
})
export class HomeModule {}
