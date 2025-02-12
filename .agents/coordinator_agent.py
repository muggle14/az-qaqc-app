import os
import time
import requests  # pip install requests

class CoordinatorAgent:
    def __init__(self, devops_agent, reviewer_agent):
        self.devops_agent = devops_agent
        self.reviewer_agent = reviewer_agent

    def check_application(self, url="http://localhost:5173/"):
        try:
            response = requests.get(url)
            return response.status_code, response.text
        except Exception as e:
            return None, str(e)

    def get_file_contents(self, filepath):
        try:
            with open(filepath, "r") as f:
                return f.read()
        except Exception as e:
            return f"Unable to read {filepath}: {e}"

    def list_project_files(self, directory="."):
        try:
            items = os.listdir(directory)
            return "\n".join(items)
        except Exception as e:
            return f"Error listing directory {directory}: {e}"

    def gather_additional_context(self):
        """
        Gathers additional context to help diagnose issues.
        This includes:
          - Vite configuration (vite.config.js)
          - Project structure overview
          - Docker commands, reproduction steps, and additional context
          - A listing of the project directory (to see if the Dockerfile exists)
        """
        context_parts = []
        vite_config = self.get_file_contents("app/vite.config.js")
        context_parts.append("Vite Configuration (app/vite.config.js):\n" + vite_config)
        project_structure = (
            "Project Structure:\n"
            "my-swarm-agent/\n"
            "├─ .env\n"
            "├─ Dockerfile\n"
            "├─ run.py\n"
            "├─ docker_commands.txt         # Contains your Docker run/build commands\n"
            "├─ reproduction_steps.txt      # Steps to reproduce the error\n"
            "├─ additional_context.txt      # Extra context (frameworks used, recent changes, etc.)\n"
            "├─ app/\n"
            "│   ├─ package.json\n"
            "│   ├─ vite.config.js\n"
            "│   └─ src/\n"
            "│       └─ main.js\n"
            "└─ agents/\n"
            "    ├─ devops_agent.py\n"
            "    ├─ reviewer_agent.py\n"
            "    └─ coordinator_agent.py\n"
        )
        context_parts.append(project_structure)
        docker_commands = self.get_file_contents("docker_commands.txt")
        context_parts.append("Docker Commands:\n" + docker_commands)
        reproduction_steps = self.get_file_contents("reproduction_steps.txt")
        context_parts.append("Reproduction Steps:\n" + reproduction_steps)
        additional_context = self.get_file_contents("additional_context.txt")
        context_parts.append("Additional Context:\n" + additional_context)
        project_files = self.list_project_files(".")
        context_parts.append("Project Directory Listing:\n" + project_files)
        full_context = "\n\n".join(context_parts)
        return full_context

    def apply_fix(self, file_path, new_content):
        """
        Asks the developer for permission to update the file.
        If approved, writes the new content to the file.
        """
        print(f"\nProposed changes for {file_path}:\n{new_content}\n")
        answer = input(f"Do you want to apply these changes to {file_path}? (y/n): ")
        if answer.lower() == "y":
            try:
                with open(file_path, "w") as f:
                    f.write(new_content)
                print(f"{file_path} has been updated.")
            except Exception as e:
                print(f"Failed to update {file_path}: {e}")
        else:
            print(f"No changes applied to {file_path}.")

    def parse_diagnosis(self, diagnosis):
        """
        Parses the structured diagnosis from the reviewer agent.
        Expects sections formatted as:
        
        FILE: <file-path>
        <new content for the file>
        
        Returns a dictionary mapping file paths to new content.
        """
        changes = {}
        parts = diagnosis.split("FILE:")
        for part in parts[1:]:
            lines = part.strip().split("\n", 1)
            if len(lines) < 2:
                continue
            file_path = lines[0].strip()
            new_content = lines[1].strip()
            changes[file_path] = new_content
        return changes

    def run_and_fix_loop(self, max_iterations=5):
        iteration = 0
        while iteration < max_iterations:
            iteration += 1
            print(f"\n[CoordinatorAgent] Iteration {iteration}...")

            # Build the Docker image
            build_out, build_err = self.devops_agent.build_container()
            if build_err:
                print(f"[CoordinatorAgent] Build error:\n{build_err}")
                # If build error indicates missing Dockerfile, add extra context.
                if "unable to evaluate symlinks" in build_err or "No such file or directory" in build_err:
                    extra_context = "The build error indicates that the Dockerfile is missing or mislocated.\n"
                    extra_context += "Here is a listing of the current directory:\n" + self.list_project_files(".")
                    build_err = build_err + "\n\n" + extra_context

            # Run the container
            run_out, run_err = self.devops_agent.run_container()
            if run_err:
                print(f"[CoordinatorAgent] Run error:\n{run_err}")

            time.sleep(5)  # Give the container time to start

            # Check if the app is accessible
            status_code, content = self.check_application()
            if status_code != 200:
                error_message = f"HTTP ERROR {status_code}: {content}"
                print(f"[CoordinatorAgent] Detected error: {error_message}")
                additional_context = self.gather_additional_context()
                combined_info = f"{error_message}\n\nBuild/Run Error Details:\n{build_err}\n\nAdditional Context:\n{additional_context}"
                diagnosis = self.reviewer_agent.analyze_logs_and_suggest_fixes(combined_info)
                print(f"[CoordinatorAgent] ReviewerAgent Diagnosis:\n{diagnosis}")
                proposed_changes = self.parse_diagnosis(diagnosis)
                print(f"[CoordinatorAgent] Parsed Proposed Changes:\n{proposed_changes}")
                for file_path, new_content in proposed_changes.items():
                    self.apply_fix(file_path, new_content)
                print("\nRebuilding and rerunning the container with applied fixes...\n")
                self.devops_agent.stop_and_remove_container()
                continue  # Restart loop to rebuild and test changes
            else:
                print("[CoordinatorAgent] Application is running successfully!")
                break
        else:
            print(f"[CoordinatorAgent] Reached max iterations ({max_iterations}). Exiting.")
