![Monkey's 4 OSINT](images/monkey-bookmarklet.png)


# bookmarklet scripts for OSINT
This repository contains working Bookmarklets scripts to assist you in your OSINT investigations.


### How to use them
In your browser, create a new bookmark and paste the code in the URL field. 


# Bookmarklets

| Site | Name | Desc |
|------|------|-------------|
| *    | [Images extractor](#Imagesextractor) | Dowload & Zip all images  |
|      |      |             |








### Images extractor
Download & ZIP all images from a website.
```
javascript:(function(){const s='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';const l=src=>new Promise(r=>{const e=document.createElement('script');e.src=src;e.onload=r;document.head.appendChild(e);});(async function(){await l(s);const z=new JSZip(),i=Array.from(document.images).filter(x=>x.naturalWidth>=125&&x.naturalHeight>=125);if(!i.length){alert('No images larger than 125x125 found.');return;}const j=[];const p=i.map((x,k)=>{const u=x.src||x.getAttribute('data-src'),n=`image_${k+1}.jpg`;j.push({name:n,url:u});return fetch(u).then(r=>r.blob()).then(b=>z.file(n,b));});await Promise.all(p);z.file('images.json',JSON.stringify(j,null,2));z.generateAsync({type:'blob'}).then(c=>{const a=document.createElement('a');a.href=URL.createObjectURL(c);a.download='images_with_sources.zip';a.click();});alert(`Downloading ${i.length} images and a JSON file with source URLs as a ZIP...`);})();})();
```