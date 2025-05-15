const fs = require('fs');
const path = require('path');

// Directories to search for files
const directories = [
  path.join(__dirname, 'src', 'routes'),
  path.join(__dirname, 'src', '_utilities')
];

// Pattern to match and replace
const fromPattern = /import prisma from ['"]\.\.\/database\/client['"];/g;
const toReplacement = 'import prisma from \'../database\';';

// Function to update a file
function updateFile(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file needs updating
    if (fromPattern.test(content)) {
      // Replace the import statement
      const updatedContent = content.replace(fromPattern, toReplacement);
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      console.log(`Updated imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Function to recursively process files in a directory
function processDirectory(directory) {
  let updatedCount = 0;
  
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Recursively process subdirectories
      updatedCount += processDirectory(filePath);
    } else if (filePath.endsWith('.ts')) {
      // Process TypeScript files
      if (updateFile(filePath)) {
        updatedCount++;
      }
    }
  }
  
  return updatedCount;
}

// Process all directories and count updated files
let totalUpdated = 0;
for (const directory of directories) {
  console.log(`Processing directory: ${directory}`);
  totalUpdated += processDirectory(directory);
}

console.log(`Total files updated: ${totalUpdated}`); 