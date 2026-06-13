from pathlib import Path
p = Path(r'C:\Projects\DevFeed\node_modules\expo-modules-core\android\build\intermediates\cxx\RelWithDebInfo\1x3x266v\logs\arm64-v8a\prefab_command.bat')
print('exists', p.exists())
text = p.read_bytes()
print('len', len(text))
print('first_bytes', text[:200])
for i, line in enumerate(text.splitlines()):
    print(i, repr(line))
    if i >= 20:
        break
