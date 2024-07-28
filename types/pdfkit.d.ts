declare module "pdfkit" {
  export default class PDFDocument {
    constructor(options?: any);
    on(event: string, callback: Function): this;
    fontSize(size: number): this;
    text(text: string, options?: any): this;
    moveDown(): this;
    end(): void;
  }
}
