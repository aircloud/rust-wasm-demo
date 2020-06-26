cd byteview-render-wasm
rm -rf pkg
wasm-pack build --dev
# wasm-pack build --target nodejs --dev --scope byteview
tsc -p tsconfig.json
node ./scripts/convert.js
# cp -r ts/images pkg/images
cd site && webpack
cp index.html dist/index.html