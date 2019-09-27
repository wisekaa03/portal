/** @format */

// #region Imports NPM
import { ModuleRef } from '@nestjs/core';
import { Inject, forwardRef, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// #endregion
// #region Imports Local
import { JwtPayload } from './models/jwt-payload.interface';
import { UserResponseDTO } from '../user/models/user.dto';
// eslint-disable-next-line import/no-cycle
import { UserService } from '../user/user.service';
import { LoggerService } from '../logger/logger.service';
// #endregion

@Injectable()
export class AuthService implements OnModuleInit {
  private userService2: UserService;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit(): void {
    this.userService2 = this.moduleRef.get(UserService);
    this.loggerService.debug(`authService onModuleInit: ${JSON.stringify(this.userService2)}`);
  }

  public token = (payload: JwtPayload): string => this.jwtService.sign(payload);

  public validate = async (payload: JwtPayload): Promise<UserResponseDTO | null> => this.userService.read(payload.id);
}
