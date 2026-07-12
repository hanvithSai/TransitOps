const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
                walk(dirPath, callback);
            }
        } else {
            callback(path.join(dir, f));
        }
    });
};

const extensions = ['.js', '.jsx', '.md', '.json'];

walk(__dirname, (filePath) => {
    if (!extensions.includes(path.extname(filePath))) return;
    if (filePath.includes('replace.js')) return;
    if (filePath.includes('package-lock.json')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Replace dispatcher -> driver (case sensitive)
    content = content.replace(/dispatcher/g, 'driver');
    content = content.replace(/Dispatcher/g, 'Driver');

    // For backend routes: add financial_analyst
    if (filePath.includes('expenseRoutes.js') || filePath.includes('fuelRoutes.js')) {
        content = content.replace(/authorize\('admin', 'fleet_manager', 'driver'\)/g, "authorize('admin', 'fleet_manager', 'driver', 'financial_analyst')");
        content = content.replace(/authorize\('admin', 'fleet_manager'\)/g, "authorize('admin', 'fleet_manager', 'financial_analyst')");
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Updated: ' + filePath);
    }
});
