const sharp=require('sharp');const TMP=process.argv[2];
const PURPLE='#6C3FCE', BLACK='#141414';
const cx=210.5, cy=79.3, tip=cx+10.2, lobeX=cx-2.5, r=8.4;
const teardrop=`M ${tip} ${cy} Q ${cx+1} ${cy-8.5} ${lobeX} ${cy-r} A ${r} ${r} 0 1 0 ${lobeX} ${cy+r} Q ${cx+1} ${cy+8.5} ${tip} ${cy} Z`;
const wordmark=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 150">
<text x="0" y="112" font-family="sans-serif" font-weight="900" font-size="130" letter-spacing="-4">
<tspan fill="${PURPLE}">Neo</tspan><tspan fill="${BLACK}">kart</tspan></text>
<path d="${teardrop}" fill="${PURPLE}"/></svg>`;
// favicon: purple rounded square + white N
const icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect x="0" y="0" width="512" height="512" rx="112" fill="${PURPLE}"/>
<text x="256" y="368" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="360" fill="#ffffff">N</text></svg>`;
(async()=>{
  await sharp(Buffer.from(wordmark),{density:300}).resize({width:1200}).png()
    .toFile('public/logo.png');
  await sharp(Buffer.from(icon),{density:300}).resize(512,512).png()
    .toFile('public/icon.png');
  await sharp(Buffer.from(icon),{density:300}).resize(512,512).png()
    .toFile('src/app/icon.png');
  await sharp(Buffer.from(icon),{density:300}).resize(512,512).flatten({background:'#ffffff'}).png()
    .toFile(TMP+'/icon_preview.png');
  console.log('assets written');
})().catch(e=>console.log('ERR',e.message));
