/** @format */
import type { RedisModuleOptions } from 'nest-redis';
import { URL } from 'url';

export const redisOptions = ({
  clientName,
  url,
  ttl,
  prefix,
}: {
  clientName: string;
  url: URL;
  ttl?: number;
  prefix?: string;
}): RedisModuleOptions => {
  if (typeof url === 'object' && url && (url.protocol === 'redis:' || url.protocol === 'rediss:')) {
    const { username, password } = url;
    const db = parseInt(url.pathname || '0', 10);

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
