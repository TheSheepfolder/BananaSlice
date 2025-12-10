// BananaSlice - Nano Banana API Module
// Handles communication with Google's Gemini Image API

use reqwest::Client;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("HTTP request failed: {0}")]
    RequestFailed(#[from] reqwest::Error),
    
    #[allow(dead_code)]
    #[error("API key not configured")]
    ApiKeyMissing,
    
    #[error("API returned error: {0}")]
    ApiError(String),
    
    #[error("Failed to parse response: {0}")]
    ParseError(String),
    
    #[error("No image generated")]
    NoImageGenerated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Model {
    #[serde(rename = "nano-banana")]
    NanoBanana,
    #[serde(rename = "nano-banana-pro")]
    NanoBananaPro,
}

impl Model {
    pub fn to_gemini_model(&self) -> &'static str {
        match self {
            // Fast model for image generation 
            Model::NanoBanana => "gemini-2.5-flash-image",
            // Pro model
            Model::NanoBananaPro => "gemini-3-pro-image-preview",
        }
    }
}

#[derive(Debug, Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
    #[serde(rename = "generationConfig")]
    generation_config: GenerationConfig,
}

#[derive(Debug, Serialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Debug, Serialize)]
#[serde(untagged)]
enum Part {
    Text { text: String },
    InlineData { inline_data: InlineData },
}

#[derive(Debug, Serialize)]
struct InlineData {
    mime_type: String,
    data: String,
}

#[derive(Debug, Serialize)]
struct GenerationConfig {
    #[serde(rename = "responseModalities")]
    response_modalities: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct GeminiResponse {
    candidates: Option<Vec<Candidate>>,
    error: Option<GeminiError>,
}

#[derive(Debug, Deserialize)]
struct Candidate {
    content: CandidateContent,
}

#[derive(Debug, Deserialize)]
struct CandidateContent {
    parts: Vec<ResponsePart>,
}

#[derive(Debug, Deserialize)]
struct ResponsePart {
    #[serde(rename = "inlineData")]
    inline_data: Option<ResponseInlineData>,
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ResponseInlineData {
    #[serde(rename = "mimeType")]
    mime_type: String,
    data: String,
}

#[derive(Debug, Deserialize)]
struct GeminiError {
    message: String,
}

pub struct NanoBananaClient {
    client: Client,
    api_key: String,
}

impl NanoBananaClient {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    /// Generate fill for a masked region
    /// 
    /// # Arguments
    /// * `model` - Which model to use (NanoBanana or NanoBananaPro)
    /// * `prompt` - Text description of what to generate
    /// * `image_base64` - The cropped source image as base64
    /// * `mask_base64` - The mask image as base64 (white = generate, black = keep)
    pub async fn generate_fill(
        &self,
        model: Model,
        prompt: &str,
        image_base64: &str,
        mask_base64: &str,
    ) -> Result<String, ApiError> {
        let model_name = model.to_gemini_model();
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            model_name, self.api_key
        );

        // Build the request with image, mask, and prompt
        let request = GeminiRequest {
            contents: vec![Content {
                parts: vec![
                    // Source image
                    Part::InlineData {
                        inline_data: InlineData {
                            mime_type: "image/png".to_string(),
                            data: image_base64.to_string(),
                        },
                    },
                    // Mask image
                    Part::InlineData {
                        inline_data: InlineData {
                            mime_type: "image/png".to_string(),
                            data: mask_base64.to_string(),
                        },
                    },
                    // Prompt with instructions
                    Part::Text {
                        text: format!(
                            "Edit this image. The second image is a mask where white areas should be replaced. \
                            In the white masked areas, generate: {}. \
                            Keep the black areas unchanged. Match the style and lighting of the original image.",
                            prompt
                        ),
                    },
                ],
            }],
            generation_config: GenerationConfig {
                response_modalities: vec!["IMAGE".to_string()],
            },
        };

        // Send request
        log::info!("Sending request to Gemini API: {}", model_name);
        
        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await?;

        let status = response.status();
        let response_text = response.text().await?;
        
        log::info!("API response status: {}", status);
        
        // Parse response
        let gemini_response: GeminiResponse = serde_json::from_str(&response_text)
            .map_err(|e| ApiError::ParseError(format!("{}: {}", e, &response_text[..response_text.len().min(200)])))?;

        // Check for API error
        if let Some(error) = gemini_response.error {
            log::error!("Gemini API error: {}", error.message);
            return Err(ApiError::ApiError(error.message));
        }

        // Extract generated image
        let candidates = gemini_response.candidates.ok_or_else(|| {
            log::error!("No candidates in response. Full response: {}", &response_text[..response_text.len().min(500)]);
            ApiError::NoImageGenerated
        })?;
        
        log::info!("Got {} candidates", candidates.len());
        
        for candidate in candidates {
            log::info!("Candidate has {} parts", candidate.content.parts.len());
            for (i, part) in candidate.content.parts.into_iter().enumerate() {
                log::info!("Part {}: text={}, inline_data={}", i, part.text.is_some(), part.inline_data.is_some());
                if let Some(ref text) = part.text {
                    log::info!("Found text part: {}", &text[..text.len().min(200)]);
                }
                if let Some(inline_data) = part.inline_data {
                    log::info!("Found inline_data with mime_type: {}", inline_data.mime_type);
                    if inline_data.mime_type.starts_with("image/") {
                        log::info!("Returning image data ({} bytes)", inline_data.data.len());
                        return Ok(inline_data.data);
                    }
                }
            }
        }

        log::error!("No image found in response parts");
        Err(ApiError::NoImageGenerated)
    }
}
