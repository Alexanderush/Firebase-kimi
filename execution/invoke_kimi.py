"""
Script: invoke_kimi.py
Purpose: Invokes the Kimi K2.5 model via NVIDIA NIM using the provided API key.
Inputs: Expects NVIDIA_API_KEY, KIMI_MODEL, and NVIDIA_BASE_URL in ../.env.
Outputs: Prints the model response (streaming support included).
"""

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def main():
    invoke_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1") + "/chat/completions"
    api_key = os.getenv("NVIDIA_API_KEY")
    model = os.getenv("KIMI_MODEL", "moonshotai/kimi-k2.5")
    
    if not api_key:
        print("Error: NVIDIA_API_KEY not found in .env")
        return

    stream = True

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "text/event-stream" if stream else "application/json"
    }

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Explain why Antigravity is a great AI assistant framework."}],
        "max_tokens": 1024,
        "temperature": 1.00,
        "top_p": 1.00,
        "stream": stream,
        "chat_template_kwargs": {"thinking": True},
    }

    print(f"Invoking {model} at {invoke_url}...")
    
    try:
        response = requests.post(invoke_url, headers=headers, json=payload, stream=stream)
        response.raise_for_status()

        if stream:
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode("utf-8")
                    if decoded_line.startswith("data: "):
                        data_str = decoded_line[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            content = data['choices'][0]['delta'].get('content', '')
                            if content:
                                print(content, end="", flush=True)
                        except json.JSONDecodeError:
                            pass
            print() # Newline at the end
        else:
            print(json.dumps(response.json(), indent=2))
            
    except requests.exceptions.RequestException as e:
        print(f"Error during API request: {e}")

if __name__ == "__main__":
    main()
