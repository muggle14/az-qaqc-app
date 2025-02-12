# agents/reviewer_agent.py

import os
import openai
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

class ReviewerAgent:
    def __init__(self):
        # Retrieve the API key from environment variables
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.")
        
        # Set the API key for OpenAI
        openai.api_key = openai_api_key

    def analyze_logs_and_suggest_fixes(self, logs: str):
        """
        Uses the ChatCompletion API with the o1-preview model to analyze combined error logs
        and configuration files (Dockerfile, vite.config.js) and suggest fixes.
        """
        context = logs  # Assuming logs contain the necessary context information
        prompt = f"""
The following context provides detailed information about a Docker/Vite/JS setup issue, including error logs,
configuration files, and project structure:

{context}

Please analyze the issues and provide a structured diagnosis along with proposed fixes.
Format your response as follows:

FILE: <file-path>
<new content for this file>

For example:
FILE: Dockerfile
<new Dockerfile content>

If no changes are needed for a particular file, you may omit it.
If further clarification is needed, include a note asking for it.
"""
        # For this model, only a 'user' message is supported.
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        response = openai.ChatCompletion.create(
            model="o1-preview",  # Using the o1-preview model as requested
            messages=messages,
            max_completion_tokens=3500
        )

        return response["choices"][0]["message"]["content"].strip()

    def propose_code_changes(self, error_diagnosis: str):
        """
        Returns a string with suggested code changes based on the diagnosis.
        """
        return f"Suggested changes:\n{error_diagnosis}"
