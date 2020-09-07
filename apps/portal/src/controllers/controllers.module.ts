/** @format */

//#region Imports NPM
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
//#endregion
//#region Imports Local
import { DeprecatedController } from './deprecated/deprecated.controller';
import { AdminController } from './admin/admin.controller';
import { AuthController } from './auth/auth.controller';
import { CalendarController } from './calendar/calendar.controller';
import { FaqController } from './faq/faq.controller';
import { HomeController } from './home/home.controller';
import { TaskController } from './task/task.controller';
import { TasksController } from './tasks/tasks.controller';
import { MailController } from './mail/mail.controller';
import { MeetingsController } from './meetings/meetings.controller';
import { NewsController } from './news/news.controller';
import { PhonebookController } from './phonebook/phonebook.controller';
import { ProfileController } from './profile/profile.controller';
import { FilesController } from './files/files.controller';
import { HealthController } from './health/health.controller';
//#endregion

@Module({
  imports: [
    //#region Health module
    TerminusModule,
    //#endregion
  ],
  controllers: [
    DeprecatedController,
    AdminController,
    AuthController,
    CalendarController,
    FaqController,
    HomeController,
    TaskController,
    TasksController,
    MailController,
    MeetingsController,
    NewsController,
    PhonebookController,
    ProfileController,
    FilesController,
    HealthController,
  ],
})
export class ControllersModule {}
