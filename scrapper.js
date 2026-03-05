const puppeteer = require('puppeteer');
const fs = require('fs');

async function extraerPalabraRae() {
  console.log('Arrancando el bot y contactando con RAE.es...');

  try {
    //navegador invisible Puppeteer
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Puppeteer lanza un servidor 
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    console.log('Esperando a entrar en la web sin que me bloqueen...');
    // wait hasta que se descargue todo 
    await page.goto('https://dle.rae.es/', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('¡Dentro! Buscando la palabra del día...');
    
    // Me meto en el HTML de la página a buscar los datos
    const palabreja = await page.evaluate(() => {
      let fechaDetectada = 'Fecha no encontrada';
      let palabraDetectada = 'Palabra no encontrada';
      
      // Pillo todos los bloques de la web para buscar el de la palabra del día por fuerza bruta
      const todosLosDivs = Array.from(document.querySelectorAll('div, section'));
      const contenedorPalabreja = todosLosDivs.find(el => el.innerText && el.innerText.includes('Palabra del día'));
      
      if (contenedorPalabreja) {
         const lineas = contenedorPalabreja.innerText.split('\n').map(l => l.trim()).filter(l => l !== '');
         if (lineas.length >= 3) {
             fechaDetectada = lineas[1]; 
             palabraDetectada = lineas[2]; 
         }
      }
      
      // Devuelvo el objeto limpio
      return {
        fecha: fechaDetectada,
        palabra: palabraDetectada,
        url_origen: 'https://dle.rae.es/'
      };
    });

    console.log('Hecho!', palabreja);

    fs.writeFileSync('palabra.json', JSON.stringify(palabreja, null, 2), 'utf-8');
    console.log('--> Archivo palabra.json generado');


    await browser.close();

  } catch (error) {
    console.error('Error seleccionando la palabra:', error.message);
  }
}


extraerPalabraRae();