import os

# Define the project structure
project_structure = {
    "app": {
        "models": ["__init__.py", "user.py", "vehicle.py", "device.py", "route.py", "session.py", "telemetry.py", "audit.py"],
        "schemas": ["__init__.py", "user.py", "vehicle.py", "device.py", "route.py", "session.py", "telemetry.py"],
        "crud": ["__init__.py", "user.py", "vehicle.py", "device.py", "route.py", "session.py", "telemetry.py"],
        "api": ["__init__.py", "admin.py", "driver.py", "conductor.py", "passenger.py", "telemetry.py"],
        "utils": ["__init__.py", "security.py", "blockchain.py", "gps.py"],
        "main.py": None,
        "config.py": None
    },
    "requirements.txt": None,
    "README.md": None
}

# Function to create folders and files recursively
def create_structure(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        elif isinstance(content, list):
            os.makedirs(path, exist_ok=True)
            for file_name in content:
                open(os.path.join(path, file_name), 'a').close()
        else:  # single file
            open(path, 'a').close()

# Run the function from current directory
create_structure(os.getcwd(), project_structure)

print("✅ Backend project structure created successfully!")
