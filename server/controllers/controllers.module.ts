/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { AdminController } from './admin/admin.controller';
import { AuthController } from './auth/auth.controller';
import { CalendarController } from './calendar/calendar.controller';
import { FaqController } from './faq/faq.controller';
import { HomeController } from './home/home.controller';
import { ItapplicationController } from './itapplication/itapplication.controller';
import { MailController } from './mail/mail.controller';
import { MeetingsController } from './meetings/meetings.controller';
import { NewsController } from './news/news.controller';
import { PhonebookController } from './phonebook/phonebook.controller';
import { ProfileController } from './profile/profile.controller';
import { SettingsController } from './settings/settings.controller';
import { HealthController } from './health/health.controller';
// #endregion

@Module({
  imports: [],
  controllers: [
    AdminController,
    AuthController,
    CalendarController,
    FaqController,
    HomeController,
    ItapplicationController,
    MailController,
    MeetingsController,
    NewsController,
    PhonebookController,
    ProfileController,
    SettingsController,
    HealthController,
  ],
})
export class HomeModule {}
