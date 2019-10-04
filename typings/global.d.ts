/** @format */

declare let __DEV__: boolean;
declare let __SERVER__: boolean;

declare module 'cache-manager-redis';
declare module '@graphile-contrib/pgdbi';

declare namespace NodeJS {
  interface Global {
    fetch: any; // GlobalFetch;
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
