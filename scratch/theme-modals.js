const fs = require('fs');
const path = require('path');

const files = [
  'src/components/clients/ClientFormModal.tsx',
  'src/components/clients/AddDocumentModal.tsx',
  'src/components/staff/StaffFormModal.tsx',
  'src/components/clients/DeleteClientModal.tsx',
  'src/components/staff/DeleteStaffModal.tsx'
];

function processFile(filePath) {
  const absolutePath = path.join('c:/Journey/fintecc-fronted', filePath);
  let content = fs.readFileSync(absolutePath, 'utf8');

  // We are going to carefully replace specific className values with style attributes 
  // or wrap them. Let's target the exact blocks.
  
  // For text-slate-800 labels
  content = content.replace(/text-slate-800/g, 'dark:text-slate-200 text-slate-800');
  content = content.replace(/text-slate-700/g, 'dark:text-slate-300 text-slate-700');
  content = content.replace(/text-slate-600/g, 'dark:text-slate-400 text-slate-600');
  content = content.replace(/text-slate-500/g, 'dark:text-slate-400 text-slate-500');
  content = content.replace(/text-slate-400/g, 'dark:text-slate-500 text-slate-400');
  
  // Borders
  content = content.replace(/border-slate-200/g, 'dark:border-slate-700 border-slate-200');
  content = content.replace(/border-slate-100/g, 'dark:border-slate-800 border-slate-100');
  
  // Backgrounds
  content = content.replace(/bg-white/g, 'dark:bg-slate-900 bg-white');
  content = content.replace(/bg-slate-50/g, 'dark:bg-slate-800/50 bg-slate-50');
  content = content.replace(/bg-slate-100/g, 'dark:bg-slate-800 bg-slate-100');

  // Input fields specific focus states
  // focus:ring-teal-100 -> dark:focus:ring-teal-900/30
  content = content.replace(/focus:ring-teal-100/g, 'dark:focus:ring-teal-900/30 focus:ring-teal-100');

  fs.writeFileSync(absolutePath, content);
  console.log('Updated', filePath);
}

files.forEach(processFile);
