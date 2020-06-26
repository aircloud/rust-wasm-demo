

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
}
