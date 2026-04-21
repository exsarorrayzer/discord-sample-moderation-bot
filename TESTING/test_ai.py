import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

class AIChat:
    def __init__(self):
        self.endpoints = self.load_endpoints()
        self.config = self.load_config()
        self.history = []
        self.system_prompt = self.load_prompt()
        
    def load_endpoints(self):
        with open("pattern/endpoints.json", "r", encoding="utf-8") as f:
            return json.load(f)
    
    def load_config(self):
        with open("pattern/aiconfig.json", "r", encoding="utf-8") as f:
            return json.load(f)
    
    def load_prompt(self):
        with open("pattern/prompt.txt", "r", encoding="utf-8") as f:
            content = f.read().strip()
        
        for line in content.split("\n"):
            if line.startswith("lang77="):
                self.current_lang = line.split("=")[1].strip()
                break
        else:
            self.current_lang = "turkish"
        
        return content
    
    def get_api_key(self, provider):
        keys = {
            "openai": os.getenv("OPENAI_API_KEY"),
            "groq": os.getenv("GROQ_API_KEY"),
            "qwen": os.getenv("QWEN_API_KEY"),
            "gemini": os.getenv("GEMINI_API_KEY"),
            "openrouter": os.getenv("OPENROUTER_API_KEY")
        }
        return keys.get(provider)
    
    def call_ai(self, message):
        provider = self.config["default_provider"]
        model = self.config["default_model"]
        api_key = self.get_api_key(provider)
        
        if not api_key:
            return f"API key for {provider} not found"
        
        self.history.append({"role": "user", "content": message})
        
        messages = [{"role": "system", "content": self.system_prompt}] + self.history[-20:]
        
        endpoint = self.endpoints[provider]
        url = endpoint["url"]
        
        headers = {"Content-Type": "application/json"}
        body = {
            "model": model,
            "messages": messages,
            "max_tokens": self.config["max_tokens"],
            "temperature": self.config["temperature"]
        }
        
        if provider == "openai":
            headers["Authorization"] = f"Bearer {api_key}"
        elif provider == "groq":
            headers["Authorization"] = f"Bearer {api_key}"
        elif provider == "qwen":
            headers["Authorization"] = f"Bearer {api_key}"
        elif provider == "gemini":
            url = f"{url}/{model}:generateContent?key={api_key}"
            body = {
                "contents": [{"role": m["role"] if m["role"] == "user" else "model", "parts": [{"text": m["content"]}]} for m in messages]
            }
        elif provider == "openrouter":
            headers["Authorization"] = f"Bearer {api_key}"
            headers["HTTP-Referer"] = "https://localhost"
        
        try:
            response = requests.post(url, headers=headers, json=body)
            data = response.json()
            
            if response.status_code != 200:
                return f"API Error {response.status_code}: {data}"
            
            if provider == "gemini":
                reply = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response")
            else:
                reply = data.get("choices", [{}])[0].get("message", {}).get("content", "No response")
            
            self.history.append({"role": "assistant", "content": reply})
            return reply
        except Exception as e:
            return f"Error: {str(e)}"
    
    def set_model(self, provider, model):
        if provider not in self.endpoints:
            return f"Invalid provider: {provider}"
        
        models = self.endpoints[provider]["models"]
        if isinstance(models, dict):
            all_models = []
            for category in models.values():
                all_models.extend(category)
            if model not in all_models:
                return f"Invalid model for {provider}"
        else:
            if model not in models:
                return f"Invalid model for {provider}"
        
        self.config["default_provider"] = provider
        self.config["default_model"] = model
        
        with open("pattern/aiconfig.json", "w", encoding="utf-8") as f:
            json.dump(self.config, f, indent=2)
        
        return f"Model set to {provider}/{model}"
    
    def list_models(self):
        result = []
        for provider, data in self.endpoints.items():
            models = data["models"]
            if isinstance(models, dict):
                for category, model_list in models.items():
                    result.append(f"{provider} ({category}): {', '.join(model_list)}")
            else:
                result.append(f"{provider}: {', '.join(models)}")
        return "\n".join(result)
    
    def reset_history(self):
        self.history = []
        return "History cleared"
    
    def set_language(self, lang):
        with open("pattern/prompt.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        for i, line in enumerate(lines):
            if line.startswith("lang77="):
                lines[i] = f"lang77={lang}\n"
                break
        
        with open("pattern/prompt.txt", "w", encoding="utf-8") as f:
            f.writelines(lines)
        
        self.current_lang = lang
        self.system_prompt = self.load_prompt()
        return f"Language set to {lang}"

def main():
    chat = AIChat()
    print("AI Chat CLI")
    print("Commands:")
    print("  /model <provider> <model> - Change model")
    print("  /list - List all models")
    print("  /reset - Clear history")
    print("  /lang <language> - Change AI language")
    print("  /exit - Exit")
    print()
    
    while True:
        user_input = input("You: ").strip()
        
        if not user_input:
            continue
        
        if user_input == "/exit":
            break
        
        if user_input == "/list":
            print(chat.list_models())
            continue
        
        if user_input == "/reset":
            print(chat.reset_history())
            continue
        
        if user_input.startswith("/model "):
            parts = user_input.split(maxsplit=2)
            if len(parts) == 3:
                print(chat.set_model(parts[1], parts[2]))
            else:
                print("Usage: /model <provider> <model>")
            continue
        
        if user_input.startswith("/lang "):
            parts = user_input.split(maxsplit=1)
            if len(parts) == 2:
                print(chat.set_language(parts[1]))
            else:
                print("Usage: /lang <language>")
            continue
        
        response = chat.call_ai(user_input)
        print(f"AI: {response}\n")

if __name__ == "__main__":
    main()
