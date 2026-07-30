const { spawnSync } = require('child_process');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'downloads', 'solar-eclipse-safety-guide.pdf');
const pythonScript = path.join(__dirname, 'generate-eclipse-safety-pdf.py');

const result = spawnSync('python3', [pythonScript], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

if (result.status !== 0) {
  throw new Error(`PDF generation failed with exit code ${result.status}`);
}

console.log(`Generated ${outputPath}`);
