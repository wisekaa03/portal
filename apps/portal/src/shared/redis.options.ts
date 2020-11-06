/** @format */

import type { UrlWithStringQuery } from 'url';
import type { RedisModuleOptions } from 'nest-redis';

export const redisOptions = ({
  clientName,
  url,
  ttl,
  prefix,
}: {
  clientName: string;
  url: UrlWithStringQuery;
  ttl?: number;
  prefix?: string;
}): RedisModuleOptions => {
  if (typeof url === 'object' && url && (url.protocol === 'redis:' || url.protocol === 'rediss:')) {
    let username: string | undefined;
    let password: string | undefined;
    const db = parseInt(url.pathname?.slice(1) || '0', 10);
    if (url.auth) {
      [username, password] = url.auth.split(':');
    }

    return {
      clientName,
      host: url.hostname || 'localhost',
      port: parseInt(url.port || '6379', 10),
      username,
      password,
      db,
      keyPrefix: prefix,
      // ttl: TTL,
    };
  }

  throw new Error(`Redis must be redis: or rediss: ${JSON.stringify(url)}`);
};
