// BananaSlice - Tauri Commands Module
// Handles all IPC calls from the frontend

mod file;

pub use file::{get_app_info, open_image, save_image};
