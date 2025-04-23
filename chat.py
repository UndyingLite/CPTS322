# To run this code you need to install the following dependencies:
# pip install google-genai

import base64
import os
from google import genai
from google.genai import types


def generate(user_input):
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.0-flash"
    contents = [
types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""You are TravelBuddy, a friendly AI travel assistant. Your purpose is to help users discover destinations, craft itineraries, and offer budget tips. Respond simply and directly. Avoid using asterisks or multiplication symbols. Use bullet points or numbered lists sparingly. Be very concise."""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""Hello! I'm TravelBuddy. Ready to plan your trip? Just tell me what you're looking for!"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=user_input),
            ],
        ),
    ]
    print(f"Contents being passed to Gemini: {contents}")
    generate_content_config = types.GenerateContentConfig(
        thinking_config = types.ThinkingConfig(
            thinking_budget=0,
        ),
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_ONLY_HIGH",  # Block few
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_ONLY_HIGH",  # Block few
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_ONLY_HIGH",  # Block few
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_ONLY_HIGH",  # Block few
            ),
        ],
        response_mime_type="text/plain",
    )

    try:
        reply = ""
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            reply += chunk.text
        return reply
    except Exception as e:
        print(f"Error in generate: {e}")
        return "Sorry, I encountered an error. Please try again."
