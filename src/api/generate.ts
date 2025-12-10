// API bindings for Tauri commands
import { invoke } from '@tauri-apps/api/core';
import type { AIModel } from '../types';

export interface GenerateRequest {
    model: string;
    prompt: string;
    image_base64: string;
    mask_base64: string;
}

export interface GenerateResponse {
    success: boolean;
    image_base64: string | null;
    error: string | null;
}

/**
 * Generate fill for a selected region using Nano Banana API
 */
export async function generateFill(
    model: AIModel,
    prompt: string,
    imageBase64: string,
    maskBase64: string
): Promise<GenerateResponse> {
    const request: GenerateRequest = {
        model,
        prompt,
        image_base64: imageBase64,
        mask_base64: maskBase64,
    };

    return invoke<GenerateResponse>('generate_fill', { request });
}

/**
 * Store the API key securely
 */
export async function setApiKey(apiKey: string): Promise<void> {
    return invoke('set_api_key', { apiKey });
}

/**
 * Check if API key is configured
 */
export async function hasApiKey(): Promise<boolean> {
    return invoke<boolean>('has_api_key');
}

/**
 * Delete the stored API key
 */
export async function deleteApiKey(): Promise<void> {
    return invoke('delete_api_key');
}
