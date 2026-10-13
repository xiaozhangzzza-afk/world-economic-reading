import {build} from 'esbuild';
import {mkdir,cp} from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
await cp('public','dist',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,minify:true,format:'esm',target:'es2020',jsx:'automatic',outfile:'dist/assets/main.js',define:{'process.env.NODE_ENV':'"production"'}});
console.log('Static website built.');
