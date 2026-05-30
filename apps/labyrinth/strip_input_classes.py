import re
import glob

files = glob.glob("app/routes/challenges.*.tsx")

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    def remove_class(match):
        inner = match.group(1)
        new_inner = re.sub(r'\s*className=([\'"][^\'"]+[\'"]|\{[^}]+\})\s*', ' ', inner)
        return match.group(0).replace(inner, new_inner)
        
    new_content = re.sub(r'<Input([^>]*?)(/?>)', remove_class, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)

