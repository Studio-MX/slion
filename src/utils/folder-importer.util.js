import fs from 'fs/promises';
import path from 'path';
export async function folderImport(folder, folderPath = path.join(import.meta.dirname, '../', folder)) {
    try {
        const files = await fs.readdir(folderPath, {withFileTypes: true});
        const exports = [];
        for (const file of files) {
            if (file.isFile() && file.name.endsWith('.ts')) {
                exports.push(await import(path.join(file.parentPath, file.name)));
            } else if (file.isDirectory()) {
                exports.push(...(await folderImport(file.name, path.join(file.parentPath, file.name))));
            }
        }
        return exports;
    } catch (err) {
        throw err;
    }
}
