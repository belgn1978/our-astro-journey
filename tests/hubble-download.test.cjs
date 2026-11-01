const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
require('../assets/js/fits-science.js');
function card(k,v) { return (k.padEnd(8)+'= '+String(v).padStart(20)).padEnd(80); }
function hdu(values, bytes=Buffer.alloc(0)) {
 const cards=Object.entries(values).map(([k,v])=>card(k,v));cards.push('END'.padEnd(80));
 const h=Buffer.from(cards.join('').padEnd(Math.ceil(cards.length*80/2880)*2880));
 return Buffer.concat([h,bytes,Buffer.alloc((2880-bytes.length%2880)%2880)]);
}
const primary=hdu({SIMPLE:'T',BITPIX:8,NAXIS:0,EXTEND:'T',FILTER:"'F502N'",OBJECT:"'M16'"});
const pixels=Buffer.from([0x3f,0x80,0,0,0x40,0,0,0,0x40,0x40,0,0,0x7f,0xc0,0,0]);
const sci=hdu({XTENSION:"'IMAGE'",BITPIX:-32,NAXIS:2,NAXIS1:2,NAXIS2:2,PCOUNT:0,GCOUNT:1,EXTNAME:"'SCI'",CRVAL1:274.7,BSCALE:1,BZERO:0,CHECKSUM:"'old'"},pixels);
function extract(b) {return OajFits.extractScience(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
const result=extract(Buffer.concat([primary,sci]));const output=Buffer.concat(result.parts.map(p=>Buffer.from(p)));
assert.equal(result.width,2);assert.equal(result.filter,'');assert.equal(output.length%2880,0);
assert.deepEqual(output.subarray(2880,2896),pixels);assert(output.includes(Buffer.from('CRVAL1')));assert(output.includes(Buffer.from('F502N')));assert(!output.includes(Buffer.from('CHECKSUM')));
assert.throws(()=>extract(Buffer.from('<html>Error</html>')),/FITS/);
assert.throws(()=>extract(Buffer.concat([primary,sci,sci])),/several SCI/);
assert.throws(()=>extract(Buffer.concat([primary,sci]).subarray(0,5800)),/Incomplete/);
const filePrimary=hdu({SIMPLE:'T',BITPIX:16,NAXIS:2,NAXIS1:2,NAXIS2:2},Buffer.alloc(8));assert.equal(extract(filePrimary).width,2);
assert.throws(()=>extract(Buffer.concat([primary,hdu({XTENSION:"'BINTABLE'",BITPIX:8,NAXIS:2,NAXIS1:1,NAXIS2:1,PCOUNT:0,GCOUNT:1,EXTNAME:"'SCI'",ZIMAGE:'T'},Buffer.alloc(1))])),/No uncompressed/);
// Run the real browser code with inert DOM elements, exposing functions only in this test VM.
const storage=new Map(), elements=new Map();function el(){return {hidden:true,value:'recommended',dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},querySelector(){return null;}};}
const document={getElementById(id){if(!elements.has(id))elements.set(id,el());return elements.get(id);},querySelectorAll(){return []},addEventListener(){},querySelector(){return null}};
const window={location:{search:'',hostname:'example.org'},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
const ctx={document,window,URLSearchParams,URL,Blob,setTimeout,clearTimeout,TextEncoder,TextDecoder,console};
let code=fs.readFileSync(require.resolve('../assets/js/data-finder-v6.js'),'utf8');code=code.replace('  renderBasket();\n\n  var params', '  window.test = { normaliseProductResults, selectColourObsids, productPreferenceScore, readyFitsFilename, shellQuote };\n  renderBasket();\n\n  var params');vm.runInNewContext(code,ctx);const t=window.test;
const filters=['F502N','F657N','F673N'];const group={telescope:'HST',instrument:'WFC3/UVIS',observations:filters.map((f,i)=>({obsid:String(i+1),filters:[f],ra:274.7,dec:-13.8,exposureSeconds:500}))};
function products(names=filters.map((f,i)=>`obs${i}_drc.fits`)) {return {results:filters.map((f,i)=>({obsid:String(i+1),products:[{filename:names[i],category:'combined',subGroup:'DRC',filters:[f],sizeBytes:100}]}))};}
let selected=t.normaliseProductResults(products(),'1,2,3',group);assert.equal(selected.recommendedCount,3);assert.equal(new Set(selected.recommended.map(p=>p.filters[0])).size,3);
assert.equal(t.normaliseProductResults({results:products().results.slice(0,2)},'1,2,3',group).recommendedCount,0);
assert.equal(t.normaliseProductResults(products(['hst_skycell-a_f502n_drc.fits','hst_skycell-b_f657n_drc.fits','hst_skycell-a_f673n_drc.fits']),'1,2,3',group).recommendedCount,0);
assert.equal(t.productPreferenceScore({filename:'obs_flt_hlet.fits',category:'combined',subGroup:'DRC'}),0);
assert.equal(t.productPreferenceScore({filename:'preview.jpg',category:'preview',subGroup:'DRC'}),0);
assert.notEqual(t.readyFitsFilename({filename:'one_drc.fits',filters:['F502N']},0),t.readyFitsFilename({filename:'two_drc.fits',filters:['F502N']},0));
assert.equal(t.shellQuote("a'$(touch nope)"),"'a'\\''$(touch nope)'");
// Real search response can be supplied without committing a large archive fixture.
if(process.argv[2]){const real=JSON.parse(fs.readFileSync(process.argv[2]));const g=real.groups.find(g=>g.proposalId==='13926'&&g.instrumentFull==='WFC3/UVIS');const ids=t.selectColourObsids(g);assert.equal(ids.length,3);console.log('Pillars observation candidates:',ids.join(','));}
if(process.argv[3]) {const b=fs.readFileSync(process.argv[3]);const r=extract(b);if(process.argv[4])fs.writeFileSync(process.argv[4],Buffer.concat(r.parts.map(p=>Buffer.from(p))));console.log('Real SCI extraction:',r.width,r.height);}
console.log('Hubble regression checks passed');
