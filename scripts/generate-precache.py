import os, json

dist_dir = 'dist'
manifest = []

for root, dirs, files in os.walk(dist_dir):
    for f in sorted(files):
        filepath = os.path.join(root, f)
        rel_path = './' + os.path.relpath(filepath, dist_dir).replace('\\', '/')
        manifest.append({
            'url': rel_path,
            'revision': str(os.path.getmtime(filepath))
        })

with open(os.path.join(dist_dir, 'precache-manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Generated precache manifest: {len(manifest)} assets")
