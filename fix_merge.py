with open('src/pages/Contacto.tsx', 'r') as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if line.startswith('<<<<<<< Updated upstream'):
        skip = True
        continue
    if line.startswith('======='):
        if skip:
            skip = False
            continue
    if line.startswith('>>>>>>> Stashed changes'):
        continue

    if not skip:
        out.append(line)

with open('src/pages/Contacto.tsx', 'w') as f:
    f.writelines(out)
