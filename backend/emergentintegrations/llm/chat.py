import asyncio
import base64

class LlmChat:
    def __init__(self, api_key=None, session_id=None, system_message=None):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message

    def with_model(self, provider, model_name):
        return self

    def with_params(self, **kwargs):
        return self

    async def send_message_multimodal_response(self, message):
        # Mock response
        return "Generated thumbnail", [{"data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="}]

class UserMessage:
    def __init__(self, text, file_contents=None):
        self.text = text
        self.file_contents = file_contents

class ImageContent:
    def __init__(self, data):
        self.data = data
