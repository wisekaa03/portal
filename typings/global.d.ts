/** @format */

declare let __DEV__: boolean;
declare let __SERVER__: boolean;

declare module 'cache-manager-redis-store';
declare module '@graphile-contrib/pgdbi';
declare module 'next-i18next/dist/commonjs/utils';
declare module 'css-mediaquery';

declare namespace NodeJS {
  interface Global extends NodeJS.Global {
    fetch: any; // GlobalFetch;
    __SERVER__?: boolean;
    __DEV__?: boolean;
  }
}

declare module '*.svg' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.png' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.webp' {
  const content: any;
  const className: any;
  export = content;
}
declare module '*.jpg' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.jpeg' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.gif' {
  const content: any;
  const className: any;
  export default content;
}
