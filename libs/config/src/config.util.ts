/** @format */

import { ConfigService } from './config.service';

export function getConfigToken(): string {
  return ConfigService.name;
}
