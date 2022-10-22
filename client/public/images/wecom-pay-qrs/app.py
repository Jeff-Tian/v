import os
import string
import random

for subdir, dirs, files in os.walk('./'):
    count = 0
    for file in sorted(files):
        count += 1
        new_file_name = '0.0' + str(count) if count < 10 else '0.' + str(count)
        lower = file.lower()
        if lower.endswith('.jpg') or lower.endswith('.png') or lower.endswith('.jpeg') or lower.endswith('gif'):
            ext = os.path.splitext(file)[1]
            print(file, '-->', new_file_name + ext)
            os.rename(file, new_file_name + ext)