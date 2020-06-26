

// 封装出一些 WasmBufferManager 
// const wasm = require("../pkg/render_wasm");
// const wasm = require("./render_wasm");

export default class WasmRenderManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wasm: any | null;

  async init() {
    return new Promise((rs, rj) => {
      // @ts-ignore
      const js = import("./render_wasm.js");
      js.then(wasm => {
        this.wasm = wasm;
        rs();
      }).catch(e => {
        rj()
      })
    })
  }
  allocImageData(key: string, len: number, width: number, height?: number) {
    console.log('allocImageData: len:', len, 'key:', key);
    let begin = window.performance.now();
    const ptr = this.wasm!.new_buffer(key, len);
    const u8Arr = new Uint8ClampedArray(this.wasm!.get_wasm_buffer(), ptr, len);
    const imageData = new ImageData(u8Arr, width, height);
    console.log('allocImageData cost!!:', window.performance.now() - begin);
    return imageData;
  }
  convolution(key: string, width: number, height: number, kernel: number[]) {
    this.wasm.convolution(key, width, height, kernel);
  }

  // 之前的：


  allocBuffer(key: string, len: number) {
    const ptr = this.wasm!.new_buffer(key, len);
    return Buffer.from(this.wasm!.get_wasm_buffer(), ptr, len);
  }
  // allocImageData(key: string, len: number, width: number, height?: number) {
  //   console.log('allocImageData: len:', len, 'key:', key);
  //   let begin = window.performance.now();
  //   const ptr = this.wasm!.new_buffer(key, len);
  //   const u8Arr = new Uint8ClampedArray(this.wasm!.get_wasm_buffer(), ptr, len);
  //   const imageData = new ImageData(u8Arr, width, height);
  //   console.log('allocImageData cost!!:', window.performance.now() - begin);
  //   return imageData;
  // }
  getU8Arr(key: string, len: number) {
    const ptr = this.wasm!.get_buffer(key);
    console.log('getU8Arr, key', key, 'len:', len, 'ptr:', ptr);
    return new Uint8ClampedArray(this.wasm!.get_wasm_buffer(), ptr, len);
  }
  freeBuffer(key: string) {
    this.wasm!.remove_buffer(key);
  }
  freeImageData(key: string) {
    this.wasm!.remove_buffer(key);
  }
  getSubUint8Array(key: string, offset: number, size: number) {
    const ptr = this.wasm!.get_buffer(key);
    console.log('getSubUint8Array: key:', key, 'ptr:', ptr, 'offset:', offset, 'size:', size);
    return new Uint8Array(this.wasm!.get_wasm_buffer(), ptr + offset, size);
  }
  convertForHD(frameDatakey: String, imageDataKey: String) {
    // TODO: 这里基本上是直接调用 wasm 的方法
    this.wasm!.convert_for_HD([1,2,3,4,5,6]);
  }
}
