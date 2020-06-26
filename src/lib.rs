mod utils;

use wasm_bindgen::prelude::*;
use std::sync::Mutex;
use utils::set_panic_hook;
use std::collections::HashMap;
use rand::Rng;

#[macro_use]
extern crate lazy_static;

#[macro_use]
extern crate serde_derive;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen(js_namespace = console)]
  pub fn log(s: &str);
  #[wasm_bindgen(js_namespace = window)]
  pub fn __random() -> u8;
}

pub struct BufferStorage {
  pub buffer_map: HashMap<String, Vec<u8>>
}

impl BufferStorage {
    fn new() -> Self {
      BufferStorage {
        buffer_map: HashMap::new()
      }
    }
}

macro_rules! log {
  ($($t:tt)*) => (crate::log(&("[C]".to_string() + &format_args!($($t)*).to_string())))
}

lazy_static! {
  pub static ref GlobalBufferStorage: Mutex<BufferStorage> = {
    let buffer_storage = BufferStorage::new();
    Mutex::new(buffer_storage)
  };
}

#[wasm_bindgen]
pub fn set_wasm_panic_hook() {
  // can be continued
  set_panic_hook();
}

#[wasm_bindgen]
pub fn new_buffer(key: String, len: usize) -> *const u8 {
  log!("new_buffer, key: {:?}, len: {:?}", key, len);
  let mut global_buffer_storage = GlobalBufferStorage.lock().unwrap();
  let mut buffer = vec![255; len];
  // 这里我们增加一个随机数逻辑：
  for val in buffer.iter_mut() {
    *val = __random();
  }
  let ptr = buffer.as_ptr();
  global_buffer_storage.buffer_map.insert(key, buffer);
  ptr
}

#[wasm_bindgen]
pub fn get_buffer(key: String) -> *const u8 {
  let mut global_buffer_storage = GlobalBufferStorage.lock().unwrap();
  if let Some(buffer) = global_buffer_storage.buffer_map.get(&key) {
    return buffer.as_ptr();
  } else {
    return Vec::new().as_ptr();
  }
}

#[wasm_bindgen]
pub fn print_buffer(key: String) {
  let mut global_buffer_storage = GlobalBufferStorage.lock().unwrap();
  if let Some(buffer) = global_buffer_storage.buffer_map.get(&key) {
    log!("[render-wasm]print buffer: {:?}", buffer);
  }
}

#[wasm_bindgen]
pub fn remove_buffer(key: String) {
  let mut global_buffer_storage = GlobalBufferStorage.lock().unwrap();
  if let Some(buffer) = global_buffer_storage.buffer_map.remove(&key) {
    log!("remove buffer success");
  } else {
    log!("remove buffer error");
  }
}

#[wasm_bindgen]
pub fn convolution(key: String, width: usize, height: usize, kernel: Vec<i32>) {
  let mut global_buffer_storage = GlobalBufferStorage.lock().unwrap();
  let kernel_length = kernel.iter().sum::<i32>() as i32;
  if let Some(buffer) = global_buffer_storage.buffer_map.get_mut(&key) {
    for i in 1..width-1 {
      for j in 1..height-1 {
        let mut newR: i32 = 0;
        let mut newG: i32 = 0;
        let mut newB: i32 = 0;
        for x in 0..3 { // 取前后左右共9个格子
          for y in 0..3 {
            newR += buffer[width * (j + y - 1) * 4 + (i + x - 1) * 4 + 0] as i32 * kernel[y * 3 + x] / kernel_length;
            newG += buffer[width * (j + y - 1) * 4 + (i + x - 1) * 4 + 1] as i32 * kernel[y * 3 + x] / kernel_length;
            newB += buffer[width * (j + y - 1) * 4 + (i + x - 1) * 4 + 2] as i32 * kernel[y * 3 + x] / kernel_length;
          }
        }
        buffer[width * j * 4 + i * 4 + 0] = newR as u8;
        buffer[width * j * 4 + i * 4 + 1] = newG as u8;
        buffer[width * j * 4 + i * 4 + 2] = newB as u8;
      }
    }
  } else {
    return ();
  }
}
