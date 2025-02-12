import os
import subprocess

class DevOpsAgent:
    def build_container(self, dockerfile_path="Dockerfile", image_name="vite_app"):
        """
        Builds the Docker image.
        Checks if the Dockerfile exists; if not, returns an error message.
        """
        if not os.path.exists(dockerfile_path):
            error_message = f"Unable to prepare context: Dockerfile not found at path: {dockerfile_path}"
            print("[DevOpsAgent] " + error_message)
            return "", error_message
        cmd = ["docker", "build", "-t", image_name, "-f", dockerfile_path, "."]
        print("[DevOpsAgent] Building Docker image...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout, result.stderr

    def run_container(self, image_name="vite_app", container_name="vite_app_container"):
        """
        Removes any existing container with the same name, then runs the Docker container with port mapping.
        """
        subprocess.run(["docker", "rm", "-f", container_name], capture_output=True, text=True)
        cmd = ["docker", "run", "-d", "--name", container_name, "-p", "5173:5173", image_name]
        print("[DevOpsAgent] Running Docker container...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout, result.stderr

    def get_container_logs(self, container_name="vite_app_container"):
        """
        Fetch logs from the Docker container.
        """
        cmd = ["docker", "logs", container_name]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout, result.stderr

    def stop_and_remove_container(self, container_name="vite_app_container"):
        """
        Stops and removes the Docker container.
        """
        print(f"[DevOpsAgent] Stopping and removing container {container_name}...")
        subprocess.run(["docker", "stop", container_name], capture_output=True, text=True)
        subprocess.run(["docker", "rm", container_name], capture_output=True, text=True)
