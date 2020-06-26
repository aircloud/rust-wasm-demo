const path = require('path');
const fs = require('fs');

function convert(name) {
  let jsContent = `${fs.readFileSync(path.resolve(__dirname, `../pkg/${name}.js`))}`;
  let tsContent = `${fs.readFileSync(path.resolve(__dirname, `../pkg/${name}.d.ts`))}`;

  const jsTemplate = `${fs.readFileSync(path.resolve(__dirname, `./template/${name}.js.template`))}`;
  const tsTemplate = `${fs.readFileSync(path.resolve(__dirname, `./template/${name}.ts.template`))}`;

  jsContent += jsTemplate;
  tsContent += tsTemplate;

  fs.writeFileSync(path.resolve(__dirname, `../pkg/${name}.js`), jsContent);
  fs.writeFileSync(path.resolve(__dirname, `../pkg/${name}.d.ts`), tsContent);

  let jsManagerContent = `${fs.readFileSync(path.resolve(__dirname, `../pkg/index.js`))}`;
  const dynamicImport = /Promise\.resolve\(\)\.then\(\(\)\s\=\>\srequire\((.*?)\)\)/;

  jsManagerContent = jsManagerContent.replace(dynamicImport, 'import($1)');

  fs.writeFileSync(path.resolve(__dirname, `../pkg/index.js`), jsManagerContent);
}

convert('render_wasm');
