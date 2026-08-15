const fs = require('fs');
const files = ['applications.tsx', 'guidance.tsx', 'jobs.tsx', 'profile.tsx', 'register.tsx'];
files.forEach(f => {
  const p = 'src/routes/' + f;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/import \{ Layout \} from "@\/components\/Layout";\r?\n/, '');
  c = c.replace(/<Layout>/g, '<>');
  c = c.replace(/<\/Layout>/g, '</>');
  fs.writeFileSync(p, c);
});
console.log('Done');
