import os

folders = [
    r"C:\Users\Nishal\Desktop\PUNJAB_BUS_TRACKING\backend\app\api",
    r"C:\Users\Nishal\Desktop\PUNJAB_BUS_TRACKING\backend\app\crud",
    r"C:\Users\Nishal\Desktop\PUNJAB_BUS_TRACKING\backend\app\models",
    r"C:\Users\Nishal\Desktop\PUNJAB_BUS_TRACKING\backend\app\schemas",
    r"C:\Users\Nishal\Desktop\PUNJAB_BUS_TRACKING\backend\app\utils"
]

for folder in folders:
    print(f"\nFiles in folder: {folder}")
    try:
        files = os.listdir(folder)
        for f in files:
            if os.path.isfile(os.path.join(folder, f)):
                print(f)
    except FileNotFoundError:
        print("Folder not found.")

