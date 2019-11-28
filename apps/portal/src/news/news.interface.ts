/** @format */
interface Rendered {
  rendered: string;
  protected?: boolean;
}

export class News {
  id: string;

  title: Rendered;

  content: Rendered;

  excerpt: Rendered;
}
