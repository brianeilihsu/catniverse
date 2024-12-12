declare module 'piexifjs' {
    export function load(data: string): any;
    export function dump(data: any): string;
    export function insert(exif: string, data: string): string;
    export function remove(data: string): string;
    export const TAGS: any;
    export const GPS_TAGS: any;
    export const ExifIFD: any;
    export const GPSIFD: any;
    export const InteropIFD: any;
    export const ZerothIFD: any;
  }