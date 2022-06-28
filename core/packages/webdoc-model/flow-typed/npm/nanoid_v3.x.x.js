// flow-typed signature: 2063ee52975af3730b8170e0c9c08f2f
// flow-typed version: 755b292c88/nanoid_v3.x.x/flow_>=v0.104.x

declare module "nanoid" {
  declare export function nanoid(size?: number): string;
  declare export function customAlphabet(alphabet: string, size: number): () => string;
  declare export function customRandom(
    alphabet: string,
    size: number,
    random: (bytes: number) => Uint8Array
  ): () => string;
  declare export var urlAlphabet: string;
  declare export function random(bytes: number): Uint8Array;
}

declare module "nanoid/async" {
  declare export function nanoid(size?: number): Promise<string>;
  declare export function customAlphabet(
    alphabet: string,
    size: number
  ): () => Promise<string>;
  declare export function random(bytes: number): Promise<Uint8Array>;
}

declare module "nanoid/non-secure" {
  declare export function nanoid(size?: number): string;
  declare export function customAlphabet(alphabet: string, size: number): () => string;
}
