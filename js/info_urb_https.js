var mapCatalog = new MapCatalog ();
var mapJS1 = null;
var mapJS2 = [];
var cercaTaula = {};
cercaTaula.nombreResultats = 0;
cercaTaula.numCerca = 0; 
mapJS2.map = null;
 

$ (document).ready (function () {

  options1 = {
    capaInicial : L.tileLayer.wms("https://serveiswebdes.mataro.cat/cartografia/serveisMP/service?", {
      layers: 'ly_cache_src_quali_cedi_refos_qgis_etrs89_wmts',
      format: 'image/png',
      transparent: true,
      continuousWorld: true,
      attribution: 'Ajuntament de Mataró',
      }), 
    draw: {
      active: false,
    },
  };


/*
  options1 = {
    capaInicial : L.tileLayer("http://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/matmap/layer/cache_src_quali_cedi_refos_qgis_EPSG25831/{z}/{x}/{-y}.png"),  
    draw: {
      active: false,
    },
  }; 
  */  

  options2 = {
    capaInicial : L.tileLayer.wms("https://serveiswebdes.mataro.cat/cartografia/serveisMP/service?", {
      layers: 'ly_cache_src_quali_cedi_refos_qgis_etrs89_wmts',
      format: 'image/png',
      crs: this.CRS,
      transparent: true,
      continuousWorld: true,
      attribution: 'Ajuntament de Mataró',
      }), 
    draw: {
      active: false,
    },
  };

  mapJS1 = new MapJS (mapCatalog, 'map', options1);

function fitxaMapa(e){
  
}


mapJS1.map.on('click', function(e) { // Pendent: es pot fer en un pas
  var urlJSON = 'https://aplicacions.mataro.org:444/apex/rest/dobertes/parcela2?wkt=' + toWKT(L.marker(e.latlng));
  $.getJSON (
    urlJSON,
    function (data) { 
      try{
        $('#panellInfo').hide();
        if (typeof(data.equipaments[0]) !== 'undefined') { 
          var parcela = data.equipaments[0];
          if (typeof( parcela.WKT ) !== 'undefined') {                
            mapJS1.searchWKT(parcela.WKT);
          }
          if ( typeof( parcela.CODI_PK ) !== 'undefined') {            
            parseInfoUrbIU (parcela.CODI_PK, 'curta');
          }  
          else{
            alert ("No es pot accedir a les dades de la parcel·la " + parcela.REFCAD_COMPLERTA_IU );
          }
        }
        else{
          alert ('Seleccionada via pública o parcel·la sense dades');
        }
      }
      catch(e){
        alert("S'ha produït un error en recuperar les dades");
      }
    })
    .fail(function(){alert("S'ha produït un error ")});

}); 

//creaEncap();
/*
function creaEncap(){
  var txt = ' <div class="infowrp no-print"> '
          +'     <div class="titlewrp">'
          +'       <div class="title__logo"></div>'
          +'       <div class="title__txt">'
          +'         <div class="title__txt--titol">Portal Informació Urbanística</div>'
          +'         <div class="title__txt--subtitol" onclick=" recuperaWKT( \'DS_ACCES01\' ,\'ACCES_CODI\',\'12186\'); "> Ajuntament de Mataró</div>'
          +'       </div>'
          +'     </div>'
          +'   <div class="cercawrp">'
          +'     <div class="cerca__title"></div>'
          +'     <div class="cerca-inpwrap" >'
          +'        <form id="frm-cerca" onsubmit="activaTema ($(\'.cerca__result\'), \'acces\', $(\'#cerca-inp\').val(), 10); activaTema ($(\'.cerca__result\'), \'parcel\', $(\'#cerca-inp\').val(), 10); return false;">'
          +'          <input id="cerca-inp" placeholder="Adreça o Referència Cadastral">  <!-- button onclick="activaTema ($(\'.cerca__result\'), \'acces\', $(\'#cerca-inp\').val(), 10);activaTema ($(\'.cerca__result\'), \'parcel\', $(\'#cerca-inp\').val(), 10)">Cercar</button--> '
          +'        </form>'
          +'     </div>'
          +'     <div class="cerca__data">'
          +'       <div class="cerca__result"> </div> '
          +'     </div> '
          +'  </div>'
          +' </div>'
  $('.encapPanel').html(txt);
}
*/
  mapJS1.map.on ('moveend', function () {
    // setTimeout (function () {
   // mapJS2.drawWKT (toWKT (L.rectangle (mapJS1.map.getBounds ())));
  });

  //mapJS1.drawPlugin();
});


function parseInfoUrbIU (codi_iu, tipusFitxa) {
  var referencia = (codi_iu == null)?'0':codi_iu;  
  var ruta = 'codi=' + referencia;
  var tipus = (tipusFitxa == null)?'llarga':tipusFitxa; 
  
  if (referencia == 0){
    infourbBlanc();
  }
  else{
    $.getJSON (
      'https://aplicacions.mataro.org:444/apex/rest/dobertes/parcela3?' + ruta,
      function (data) { 
        infourbCard(data, tipus);      
      })
      .fail(function(XHR, status, error){alert("S'ha produÏt un error en accedir a la parcel·la amb el codi intern " + codi_iu  )});
  }
}

function cercaRef(value){
  cercaTaula.nombreResultats = 0;
  cercaTaula.numCerca = 0; 
  activaTema ($('.cerca__result'), 'acces', $('#cerca-inp').val(), 10); 
  activaTema ($('.cerca__result'), 'parcel', $('#cerca-inp').val(), 10); 
  return false;
}

function activaTema (listview, nomTema, value, elements) {
  $ ('#cerca-input').blur ();
  $ ('#dades-input').blur ();
 // $ ('.cerca__result').html('Cercant resultats..');

  switch (nomTema) {

    case 'parcel':
      cercaGenericJSON (
        'https://aplicacions.mataro.org:444/apex/rest/dobertes/elements_detall?dataset=DS_PARCELARI200&par1=REFCAD&val1=' +
        value,
        listview,
        nomTema,
        'fa fa-map fa-2X',
        value,
        'DS_PARCELARI200',
        'REFCAD',
        'REFCAD',
        'NOM_ACCES',
        'REFCAD',
        'REFCAD',        
        'WKT',
        100
      );
      break;

    case 'acces':
      var value1 = value.replace (/[0-9]/g, ''); // Només pot buscar sobre el carrer. Filtra per número després
      cercaGenericJSON (
        'https://aplicacions.mataro.org:444/apex/rest/dobertes/elements_detall?dataset=DS_PARCELARI200&par1=NOM_ACCES&val1=' +
        value1,
        listview,
        nomTema,
        'fa fa-map-marker fa-2x',
        value,
        'DS_PARCELARI200',
        'REFCAD',
        'NOM_ACCES',
        'NOM_ACCES',
        'REFCAD',
        'REFCAD', // Nota: potser no cal repetir-ho
        'WKT',
        100
      );
      break;
  }
}

function infourbBlanc(){  

  var enviaCorreu = "var finestra = window.open('mailto:informaciourbanistica@ajmataro.cat?subject=Sense informació associada&nbsp;"  +  "&body=Codi intern ( no esborreu ): https://pium.mataro.cat/index.html?codi=" + "','_blank');"; 

  var htmlTanca1   
                  // = "<div class='cerca__line cerca__line__boto' >" 
                  = " <div class='no_print cerca__line cerca__line__boto ' style='float:right;margin-right:0em;color:#579' onclick=\"$('#panellInfo').hide()\" >"
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "       Tancar"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-close'></i>"                           
                  + "   </div>"
                  + " </div>" ;  
  
  var htmlTanca4   = "<div class='no_print cerca__line cerca__line__boto' style='color:#579' onclick = \"" +   enviaCorreu + "\">" 
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "      Incidència"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-envelope-o'></i>"                           
                  + "   </div>"
                  + "</div>";  

                      

  $ ('.datawrp').html( htmlTanca4 + htmlTanca1);

 
  $ ('#panellInfo').show();
/*
  var mostrar = { 'Accés principal' : data.equipaments[0].ACCES[0].NOM_ACCES,
                  'Referència Cadastral' : data.equipaments[0].REFCAD_COMPLERTA_IU,
                  'Codi GIS': data.equipaments[0].CODIGIS_IU
  };   

*/

  $ ('<div/>', {
    class: 'datawrp__title treuEspai',
    text: 'Parcel·la sense informació urbanística'    
  })
  .appendTo ($ ('.datawrp'));  
    
  

var mapita =  $ ('<div/>', { 
                    class: 'mapwrp'   
                  })   
                  .append(' <div id="print-map"> </div> ')
                  .appendTo ($ ('.datawrp')); 
                  
  
  
  
 
  var today = new Date();
  var dd = String(today.getDate());
  var mm = String(today.getMonth() + 1); //January is 0!
  var yyyy = today.getFullYear();

  var currentTime = new Date();
  today = dd + '/' + mm + '/' + yyyy;
 
 /* if (tipusFitxa == 'curta'){
    $ ('<div/>', {
      class: 'datawrp__title',
      text: 'Fitxa simplificada' 
    })
    .appendTo ($ ('.datawrp')); 
  }
 */ 
  
  $ ('<div/>', {
    class: 'datawrp__title',
    text: 'Sense informació urbanística ( ' + today + ' )', 
  })
  .appendTo ($ ('.datawrp'));  

  // ---- Crea el mapa ---- //

  if (mapJS2.map !== null){
    mapJS2.map.remove();
  };


  mapJS2 = new MapJS (mapCatalog, 'print-map', options2);

  if($('#print-map').length > 0) {
    mapJS2.map.whenReady(ready1);
  }
  else{
    setTimeout(function(){
      if( $('#print-map').length > 0) {
        mapJS2.map.whenReady(ready1);
      }
      else{ 
        setTimeout(function(){mapJS2.map.whenReady(ready1); } ,2000);
      }
    },2000);
  };    
  
  mapJS2.map.whenReady(ready1);

  function ready1(){
  /*  mapJS2.flyToWKT(data.equipaments[0].WKT);
    mapJS2.searchWKT(data.equipaments[0].WKT);
  */  
  }

}

function infourbCard(data,tipusFitxa){  

  if ( data.equipaments[0].ACCES == null)    {  
    data.equipaments[0].ACCES = [{NOM_ACCES:"Sense adreces associades"}];  
  }  

  var parcelaTot = data.equipaments[0]; 
  var enviaCorreu = "var finestra = window.open('mailto:informaciourbanistica@ajmataro.cat?subject=Incidència adreça&nbsp;"  + data.equipaments[0].ACCES[0].NOM_ACCES.replace(/'/g,'-') + "&body=Codi intern ( no esborreu ): https://pium.mataro.cat/index.html?codi=" + parcelaTot.CODI_PK + "','_blank');"; 
  var citaPrevia = "var finestra = window.open('https://citaprevia.gestorn.com/llicencies/#nbb')"; 


  var fitxaParceBreu = "var finestra2 = window.open('https://pium.mataro.cat/index.html?codi=" 
  + parcelaTot.CODI_PK  +"&tipusFitxa=curta', '_blank');";   

  var htmlTanca1   
                  // = "<div class='cerca__line cerca__line__boto' >" 
                  = " <div class='no_print cerca__line cerca__line__boto ' style='float:right;margin-right:0em;color:#579' onclick=\"$('#panellInfo').hide()\" >"
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "       Tancar"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-close'></i>"                           
                  + "   </div>"
                  + " </div>" ;  

/*  var htmlTanca2   = "<div class='no_print cerca__line cerca__line__boto' style='color:#579' onclick = \"" +  fitxaParceBreu    + "\">" 
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "       Imprimir"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-print'></i>"                           
                  + "   </div>"
                  + "</div>";
 */


  var htmlTanca2   = "<div class='no_print cerca__line cerca__line__boto' style='color:#579' onclick = \" window.print() \">" 
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "       Imprimir"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-print'></i>"                           
                  + "   </div>"
                  + "</div>";

  var htmlTancaLlarga   = "<div class='no_print cerca__line cerca__line__boto' style='color:#579' onclick = \" parseInfoUrbIU (" + data.equipaments[0].CODI_PK + ", 'llarga');    \">" 
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "       Fitxa Complerta"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-book'></i>"                           
                  + "   </div>"
                  + "</div>";
                  
  var htmlTancaCurta   = "<div class='no_print cerca__line cerca__line__boto' style='color:#579' onclick = \" parseInfoUrbIU (" + data.equipaments[0].CODI_PK + ", 'curta');    \">" 
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "       Fitxa Simplificada"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-book'></i>"                           
                  + "   </div>"
                  + "</div>";
  
  var htmlTanca4   = "<div class='no_print cerca__line cerca__line__boto' style='color:#579' onclick = \"" +   enviaCorreu + "\">" 
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "      Incidència"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-envelope-o'></i>"                           
                  + "   </div>"
                  + "</div>";  

    var htmlTanca5   = "<div class='no_print cerca__line cerca__line__boto' style='color:#579' onclick = \"" +   citaPrevia + "\">" 
                  + "   <div class='cerca__line__boto--txt no-print'>"
                  + "      Cita"
                  + "   </div>" 
                  + "   <div class='cerca__line__boto--icon no-print'>"
                  + "     <i class='fa fa-calendar-check-o'></i>"                           
                  + "   </div>"
                  + "</div>"; 
                  
                      
  if ( tipusFitxa == 'llarga'){
    $ ('.datawrp').html(htmlTanca2 + htmlTanca4 + htmlTanca5 + htmlTancaCurta + htmlTanca1);
  }
  else{
    $ ('.datawrp').html(htmlTanca2 + htmlTanca4 + htmlTanca5 + htmlTancaLlarga + htmlTanca1);
  }
 
  $ ('#panellInfo').show();



  var mostrar = { 'Accés principal' : data.equipaments[0].ACCES[0].NOM_ACCES,
                  'Referència Cadastral' : data.equipaments[0].REFCAD_COMPLERTA_IU,
                  'Codi GIS': data.equipaments[0].CODIGIS_IU
  };   

  $ ('<div/>', {
    class: 'datawrp__logo no-display',
    text: ''     
  })
  .append('<img src="images/logo_amb_text.png" width="25%" height="25%">')
  .appendTo ($ ('.datawrp'));  

       
  $ ('<div/>', {
    class: 'datawrp__title treuEspai',
    text: 'INFORMACIÓ URBANÍSTICA DE LA PARCEL·LA'     
  })
  .appendTo ($ ('.datawrp'));  
    
  

  var liniaAcces =  $ ('<div/>', {
                         class: 'datawrp__line'   
                      })     
                    .append('<div class="datawrp__line__elem--33" style="font-weight:bold;height:auto;">' + 'Adreça' + '</div>')
                    .append('<div class="datawrp__line__elem--50" style="height:auto;">' +  data.equipaments[0].ACCES[0].NOM_ACCES + '</div>')
                    .appendTo ($ ('.datawrp')); 

  var liniaRC =  $ ('<div/>', {
                  class: 'datawrp__line'   
                })     
                .append('<div class="datawrp__line__elem--33" style="font-weight:bold;height:auto;">' + 'Referència Cadastral' + '</div>')
                .append('<div class="datawrp__line__elem--50" style="height:auto;">' +  data.equipaments[0].REFCAD_COMPLERTA_IU + '</div>')
                .appendTo ($ ('.datawrp')); 

  var mapita =  $ ('<div/>', { 
                    class: 'mapwrp'   
                  })   
                  .append(' <div id="print-map"> </div> ')
                  .appendTo ($ ('.datawrp'));     
                 
  var titolAcces = $ ('<div/>', {
    class: 'datawrp__title'                                 
  })
    .append("   <div class='no-print' >")
    .append("   <div style='width:98%;'>ADRECES ASSOCIADES A LA PARCEL·LA</div>" )
    .appendTo ($ ('.datawrp'));  
  
  $.each(data.equipaments[0].ACCES, function(num, dataParam){ 
  
    var liniaParam =  $ ('<div/>', {
      class: 'datawrp__line'     
    });

    liniaParam      
             .append('<div class="datawrp__line__elem--100" style="width:85%;height:auto;">' +  dataParam.NOM_ACCES + '</div>')
             .appendTo ('.datawrp');

  });
  
  if (data.equipaments[0].hasOwnProperty('PARAM')){  // Hi ha paràmetres associats
    
    var titolParamStr = '';
    // var titolParam = null;

    $.each(data.equipaments[0].PARAM, function(num, dataParam){      
  
  
      var liniaParam =  $ ('<div/>', {
        class: 'datawrp__line'     
      });
      //.appendTo('.datawrp');

      switch(dataParam.CODI_GRUP_TIPUS_PARAM){
        case 43:  // Règim urbanístic del sòl
          switch(dataParam.CODI_TIPUS_PARAM){
            case 26: // UAs i Annexos Normatius
              var fitxaURLPDF = dataParam.ENLLAC_WEB_PARAMETRE ;
              liniaParam
                .append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
                .append('<div class="datawrp__line__elem--50" style="height:auto">' +  dataParam.NOM_PARAMETRE + '</div>')
                .append("<div class='datawrp__line__elem--15' style='height:auto;font-style:italic;cursor:pointer;text-decoration: underline;' onclick=\"window.open(' " + fitxaURLPDF + "','_blank')\">" + dataParam.CODISERVEI_PARAMETRE  + "</div>");
              break;             
            case 23: // Qualificacions del sòl
              var fitxaURLPDF= 'https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/PORTAL_IU/01_DOCUMENTS/02_QUALIS/Pdf/' + dataParam.CODISERVEI_PARAMETRE + '.pdf' ;
              liniaParam
                .append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
                .append('<div class="datawrp__line__elem--50" style="height:auto">' +  dataParam.NOM_PARAMETRE + '</div>')
                .append("<div class='datawrp__line__elem--15' style='height:auto;font-style:italic;cursor:pointer;text-decoration: underline;' onclick=\"window.open(' " + fitxaURLPDF + "','_blank')\">" + dataParam.CODISERVEI_PARAMETRE  + "</div>");
              break;        
            default:
              liniaParam      
                .append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
                .append('<div class="datawrp__line__elem--50" style="height:auto">' +  dataParam.NOM_PARAMETRE + '</div>')
                .append('<div class="datawrp__line__elem--15" style="height:auto">' +  dataParam.CODISERVEI_PARAMETRE + '</div>');
              break;
            }
          break; 
          
        case 70: // Pla Masies
          var pdf = dataParam.CODISERVEI_PARAMETRE.split(' ')[1];
          var fitxaURLPDF= 'https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/SSIT/urbanisme/masies/' + pdf + '.PDF';
          liniaParam  //.append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
            .append('<div class="datawrp__line__elem--50" style="font-weight:bold;height:auto">' +  dataParam.NOM_PARAMETRE + '</div>')
            .append('<div class="datawrp__line__elem--25" style="height:auto">' +  dataParam.CODISERVEI_PARAMETRE + '</div>')
            .append("<div class='datawrp__line__elem--15 no-print' style='height:auto;font-style:italic;cursor:pointer;text-decoration: underline;' onclick=\"window.open(' " + fitxaURLPDF + "','_blank')\">" +  "Veure PDF" + "</div>");
          break;  

        case 10: // Paràmetres prinicipals
          var condParticular = (dataParam.hasOwnProperty('CONDICIO_PART')) ? dataParam.CONDICIO_PART:'--';
          var condEspecific = (dataParam.hasOwnProperty('CONDICIO_ESP')) ? dataParam.CONDICIO_ESP:'--';
          var parametreBasic = (dataParam.hasOwnProperty('PARAMETRE_BASIC')) ? dataParam.PARAMETRE_BASIC:0;
          if ( tipusFitxa == 'llarga'  || ( tipusFitxa == 'curta' && parametreBasic ==  1)){
            liniaParam      
              .append('<div class="datawrp__line__elem--25" style="height:auto;font-weight:bold;">' +  dataParam.NOM_PARAMETRE  + ' </div>');
            if  (dataParam.hasOwnProperty('ENLLAC_WEB_PARAMETRE')) {  
              liniaParam 
                .append("<div class='datawrp__line__elem--25' style='text-decoration:underline;cursor:pointer;height:auto;width:5em' onclick=\"window.open(' " + dataParam.ENLLAC_WEB_PARAMETRE + "','_blank')\">" +  dataParam.CODISERVEI_PARAMETRE   + " </div>");
            }  
            else {
              liniaParam 
              .append("<div class='datawrp__line__elem--25' style='height:auto;width:5em'>" +  dataParam.CODISERVEI_PARAMETRE   + " </div>");
            }  
            liniaParam 
            .append('<div class="datawrp__line__elem--50 " style="height:auto"><div class="datawrp__bloc__detall" style="font-style:italic;margin-left:2em;height:auto;width:100%">' +  condEspecific + '</div><div class="datawrp__bloc__detall" style="font-style:italic;margin-left:2em;height:auto;width:100%">&nbsp  ' +  condParticular + '&nbsp</div></div>');
          }              
          break; 

        case 60: // Patrimoni arquitectònic
          var pdf = ("000" + dataParam.ENLLAC_WEB_PARAMETRE ).slice(-3);
          var fitxaURLPDF= 'https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/SSIT/urbanisme/patrimoni/FITXA' + pdf + '.PDF';
          fitxaURLPDF = dataParam.ENLLAC_WEB_PARAMETRE;
          liniaParam  //.append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
            .append('<div class="datawrp__line__elem--50" style="font-weight:bold;height:auto">' +  dataParam.NOM_PARAMETRE + '</div>')
            .append('<div class="datawrp__line__elem--25" style="height:auto">' +  dataParam.CODISERVEI_PARAMETRE + '</div>')
            .append("<div class='datawrp__line__elem--15 no-print' style='height:auto;font-style:italic;cursor:pointer;text-decoration: underline;' onclick=\"window.open(' " + fitxaURLPDF + "','_blank')\">" +  "Veure PDF" + "</div>");
          break;

        case 40:  //Limitacions
          liniaParam      
  //          .append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
  //          .append('<div class="datawrp__line__elem--50" style="width:65%;height:auto;">' +  dataParam.NOM_PARAMETRE + ' ('+  dataParam.CODISERVEI_PARAMETRE + ' ) ' + '</div>')
            .append('<div class="datawrp__line__elem--100" style="width:85%;height:auto;">' +  dataParam.NOM_PARAMETRE  + '</div>');            
          break;

        case 44: // Planejament vigent - S'oculta, ja que es mostra a tramitació
          if (tipusFitxa != 'curta' && 1 == 2){
            liniaParam      
            .append("<div class='datawrp__line__elem--100' style='width:90%;height:auto;' >" +  dataParam.NOM_PARAMETRE + " ("+  dataParam.CODISERVEI_PARAMETRE + " ) " + "</div>")}; 
          //  .append('<div class="datawrp__line__elem--25" style="height:auto;">' +  dataParam.CODISERVEI_PARAMETRE + '</div>');
          break;       

        default:
          liniaParam      
          .append('<div class="datawrp__line__elem--50" style="font-weight:bold;height:auto;">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
          .append('<div class="datawrp__line__elem--50" style="height:auto;">' +  dataParam.CODISERVEI_PARAMETRE + '</div>');
          break;

      }

      if (liniaParam.html().length > 20 ) { // Evita blancs en els no bàsics i no fa títols sense paràmetres
        if ( titolParamStr != dataParam.NOM_GRUP_TIPUS_PARAM  ) {
          var titolParam =  $ ('<div/>', {
            class: 'datawrp__title' ,
            text: dataParam.NOM_GRUP_TIPUS_PARAM     
          })
          .appendTo('.datawrp'); 
        }          

        liniaParam
          .appendTo ('.datawrp');
      }  
      titolParamStr = dataParam.NOM_GRUP_TIPUS_PARAM;
    });
  }


  // ---------- Usos possibles 
  
  
  if (  typeof(data.equipaments[0].USOS) !== 'undefined'){
    var liniaUs=  $ ('<div/>', {
      class: 'datawrp__line'     
    });
    var mostra = 0
    $.each(data.equipaments[0].USOS, function(num, dataParam){
    
      if (tipusFitxa != 'curta'){  
        mostra = 1;
        liniaUs     
        .append('<div class="datawrp__line__elem--90  noTallar" style="font-weight:normal;height:auto;"><b>' +  dataParam.COMPATIBILITAT +  '</b>&nbsp</br><div style="margin-left:1em"> '+ dataParam.US + ' </div></div>');
        //.append('<div class="datawrp__line__elem--50" style="height:auto;">' +  dataParam.US_DESCRIPCIO + '</div>');    
      }
      else{
        if ( dataParam.COMPATIBILITAT == 'Dominant' || dataParam.COMPATIBILITAT =='Compatible' ){
          mostra = 1;
          liniaUs     
          .append('<div class="datawrp__line__elem--90  noTallar" style="font-weight:normal;height:auto;"><b>' +  dataParam.COMPATIBILITAT +  '</b>&nbsp</br><div style="margin-left:1em"> '+ dataParam.US + ' </div></div>');  
        }
      }

    });
    
    if (mostra == 1 ){
      var titolUsos = $ ('<div/>', {
        class: 'datawrp__title'                                 
      })
        .append("   <div class='no-print' style='cursor:pointer;font-weight:normal;margin-top:0.2em;width:8em;font-size:0.8em;float:right;margin-right:1em' onclick=\"window.open('https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/PORTAL_IU/01_DOCUMENTS/04 NORMATIVA GENERAL/PDF/2 Paràmetres usos art 128 a 139.pdf','_blank')\" ><i class='fa fa-file-pdf-o'></i>&nbsp&nbspNormativa</div>")
        .append("   <div style='width:98%;'>USOS</div>" )
        .appendTo ($ ('.datawrp'));
      liniaUs
        .appendTo ($ ('.datawrp'));
    }

  }  


  // ------------  Planejament vigent amb tramitació  ---------------

  if (tipusFitxa != 'curta' && typeof(data.equipaments[0].TRAMITS) !== 'undefined' ){
  
    var titolTram =  $ ('<div/>', {
      class: 'datawrp__title' ,
      text: 'PLANEJAMENT'     
    })
    .appendTo('.datawrp');
    
    var blocTram =  $ ('<div/>', {
      class: 'dummy'     
    })
    .appendTo('.datawrp'); 

    var liniaTram =  $ ('<div/>', {
      class: 'datawrp__line'     
    })
    .appendTo('.datawrp');
     
    $.each(data.equipaments[0].TRAMITS, function(num, dataParam){  

      var mostraTramit = 1; 
      
      if (dataParam.TRAMITACIO[dataParam.TRAMITACIO.length - 1].hasOwnProperty('VIGENCIA')){
        if (dataParam.TRAMITACIO[dataParam.TRAMITACIO.length - 1].VIGENCIA != 421000  && dataParam.TRAMITACIO[dataParam.TRAMITACIO.length - 1].VIGENCIA != 421001 ){
          var mostraTramit = 0;
        } 
      }
    
      if (mostraTramit == 1){  
        if( dataParam.hasOwnProperty('VINCLE')  ){
          blocTram  
            .append("<div class='datawrp__line datawrp__line__elem--90 datawrp__bloc__detall' onclick=\"window.open(' " + dataParam.VINCLE + "','_blank')\" style='cursor:pointer;text-decoration: underline;font-weight:bold;height:auto;clear:both;margin-top:0.9em;margin-bottom:0.2em'>" +  dataParam.FIGURA_CODI + " - " + dataParam.FIGURA_NOM +  " </div>");
            }
        else{
          blocTram
            .append("<div class='datawrp__line datawrp__line__elem--90 datawrp__bloc__detall'style='font-weight:bold;height:auto;clear:both;margin-top:0.9em;margin-bottom:0.2em'>" +  dataParam.FIGURA_CODI + " - " + dataParam.FIGURA_NOM +  " </div>");
          }  
        
        if( dataParam.TRAMITACIO !== null  ){  
          dataTramit = dataParam.TRAMITACIO[dataParam.TRAMITACIO.length - 1];
          blocTram     
          .append('<div class="datawrp__line datawrp__line__elem--90" style="clear:both;padding-left:1em;height:1.2em;font-weight:200;margin-bottom:0.1em"><div style="clear:both;float:left; width:7em;height:1.2em">' +  dataTramit.DATA +  '</div><div style="float:left; width:30em;">'+ dataTramit.DESCRIPCIO + '</div> </div>')
        }
      }
    });  
  }

  var today = new Date();
  var dd = String(today.getDate());
  var mm = String(today.getMonth() + 1); //January is 0!
  var yyyy = today.getFullYear();

  var currentTime = new Date();
  today = dd + '/' + mm + '/' + yyyy;
 
 /* if (tipusFitxa == 'curta'){
    $ ('<div/>', {
      class: 'datawrp__title',
      text: 'Fitxa simplificada' 
    })
    .appendTo ($ ('.datawrp')); 
  }
 */ 
  
  $ ('<div/>', {
    class: 'datawrp__title',
    text: 'FITXA INFORMATIVA NO VINCULANT ( ' + today + ' )', 
  })
  .appendTo ($ ('.datawrp'));  

  // ---- Crea el mapa ---- //

  if (mapJS2.map !== null){
    mapJS2.map.remove();
  };


  mapJS2 = new MapJS (mapCatalog, 'print-map', options2);

  if($('#print-map').length > 0) {
    mapJS2.map.whenReady(ready1);
  }
  else{
    setTimeout(function(){
      if( $('#print-map').length > 0) {
        mapJS2.map.whenReady(ready1);
      }
      else{ 
        setTimeout(function(){mapJS2.map.whenReady(ready1); } ,2000);
      }
    },2000);
  };    
  
  mapJS2.map.whenReady(ready1);

  function ready1(){
    mapJS2.flyToWKT(data.equipaments[0].WKT);
    mapJS2.searchWKT(data.equipaments[0].WKT);
  }

}


/*
  $ ('<div/>', {
    class: 'indicador'     
  })
  .append('<div class="indicador__text">' +  Codi + '</div>')
  .append('<div class="indicador__value">' +  data.equipaments[0].CODI_PK + '</div>')
  .appendTo ($ ('.geomdata'));

  $ ('<div/>', {
    id: 'Referència cadastral',
    class: 'text_param',
    title: 'Codi GIS ',
    text: 'Referència Cadastral '
  })
  .append('<div class="value-param">' +   data.equipaments[0].REFCAD_COMPLERTA_IU + '</div>')
  .appendTo ($ ('.geomdata'));

  $ ('<div/>', {
    id: 'Codi GIS',
    class: 'text_param',
    title: 'Codi GIS ',
    text: 'Codi GIS '
  })
  .append('<div class="value-param">' +   data.equipaments[0].CODIGIS_IU + '</div>')
  .appendTo ($ ('.geomdata')); 
*/
 /*
function viewParcel(parametre, codi){
  var codi_iu = 0;
  switch (parametre){
    case 'refCadastral':
        $.getJSON( 'https://aplicacions.mataro.org:444/apex/rest/dobertes/parcela2?refCadastral=' + codi, 
          function ( response ) { 
            $.each(accesJSON.equipaments, function(i, equip) { 
              codi_iu = equip.codi_pk;
            }
accs 
      break;
    case 'codi_iu':
      break;
    default:
  }
  case
}*/


function cercaGenericJSON( JSON, listview, temaCerca, faIcon, strCerca, dataset, colCodi, colCerca, colEtiq1, colEtiq2, valCodi,  colWKT, nombre){
  var accesJSON;
  cercaTaula.numCerca += 1; 
  $.getJSON( JSON, 
    function ( response ) { 
      accesJSON = response;   
      var numResposta = 0;
      var html = '';
      var html1 = '';

      $.each(accesJSON.equipaments, function(i, equip) { // sobre equipament
        if ( equip.hasOwnProperty(colEtiq2) ) {
          var cerca = strCerca.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().split(' ').filter(Boolean);  // paraules de cerca treient els blanks
          if ( contains(equip[colCerca].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(), cerca) ) { // si compleix amb totes les paraules de cerca
          //  var cerca = strCerca.split(' ').filter(Boolean);  // paraules de cerca treient els blanks
          //  if ( contains(equip[colCerca].toUpperCase(), cerca) ) { // si compleix amb totes les paraules de cerca
              if (numResposta == 0) {
                html += "<div class ='cerca__title'>" + temaCerca + "</div>";
              } 

              cercaTaula.nombreResultats += 1;
              
              html += 
                     "      <div class='cerca__bl' style='margin-left:0.4em;'>" 
                  +  "        <div class='cerca__line__elem--text'  > "                                        
                  +  "          <div class='cerca__line cerca__line__elem--titol' onclick=\"recuperaWKT( '" + 'DS_PARCELARI200'+ "' ,'" + colCodi + "','" + equip[valCodi] + "'  ); \"  > "
                  +                 equip[colEtiq1]
                  +  "          </div>" 
                  +  "          <div class='cerca__line cerca__line__elem--subtitol' > "
                  +  "             &nbsp Ref. Cadastral &nbsp" +  equip[colEtiq2] 
                  +  "          </div>" ; //   El div principal es tanca després       

            //  if ( dataset == 'DS_PARCELARI200' && equip.hasOwnProperty('NOM_ACCES') ) { //En les cerwues del parcel·lari afegeix el nom del carrer
            //    html +=   "<div class='cerca__line cerca__line__elem--subtitol' style='cursor:pointer' >"
            //            + "  <span> " +   equip['NOM_ACCES'] + "&nbsp &nbsp </span> "
            //            + "</div>";  
            //  } 

              html  += "<div class='cercaca____line cerca__line__boto'  style=\"margin:0.3em 0em 0.5em 0em;border:0; border-right: 1px dotted #aaa;font-size:0.75em;float:right;\" onclick=\"recuperaWKT( '" + 'DS_PARCELARI200'+ "' ,'" + colCodi + "','" + equip[valCodi] + "'  ); \">" 
                    + "   <div class='cerca__line__boto--txt'>"
                    + "       Mapa"
                    + "   </div>" 
                    + "   <div class='cerca__line__boto--icon'>"
                    + "     <i class='fa fa-map-marker'></i>"                           
                    + "   </div>"
                    + "</div>";   
              
              html  += "<div class='cerca__line cerca__line__boto' style=\"margin:0.3em 0em 0.5em 0em;border:0; border-right: 1px dotted #aaa;font-size:0.75em;float:right;\" onclick=\"parseInfoUrbIU ( " + equip['CODI_IU']  + " , 'curta');\">" 
                    + "   <div class='cerca__line__boto--txt'>"
                    + "       Fitxa"
                    + "   </div>" 
                    + "   <div class='cerca__line__boto--icon'>"
                    + "     <i class='fa fa-file-o'></i>"                           
                    + "   </div>"
                    + "</div>";

              html += "</div> </div>"; 

              listview.html( html );          
            } 
          }
          if ( cercaTaula.nombreResultats > nombre ){  // En el cas que es superi el màxin d'elements 
                    html += 
                    +  "     <div class='cerca__title'> "
                    +  "       Resultats parcials"
                    +  "     </div>" ;        
            return false;
          }                   
      });


      if (cercaTaula.nombreResultats == 0 && cercaTaula.numCerca == 2) {

        html  = 
                 "          <div class='cerca__line cerca__line__elem--titol' style='margin-left:2em'  > "
              +  "             No s'han obtingut resultats "
              +  "          </div>" ;
              +  "          <div class='cerca__line cerca__line__elem--subtitol' > "
//                   +  "            Codi: " +   equip[colEtiq2] 
              +  "          </div>" ; //   El div principal es tanca després         
        
        listview.html( html ); 

      }  
     
               
   });
   
   // sort function callback
    function sort_li(a, b){
        return (     $(b).data('dist')) < ($(a).data('dist')) ? 1 : -1;    
    }
 }

function mostraParcel (refCad) {
  var html = '';
  if ( refCad !== null){
    html =  "<div class='datawrp__line__elem--100' onclick=\"mapJS2.flyToWKT('" +  equip.WKT + "' );mapJS2.searchWKT('" + equip.WKT + "'\' );> Seleccioneu parcel·la associada</div>";
  }
  return html;
}

function contains(target, pattern){
  var value = 0;
  pattern.forEach(function(word){
    value = value + target.includes(word);
  });
  return (value === pattern.length)
}

function recuperaWKT (dataset, par1, val1) {
  var urlJSON =
    'https://aplicacions.mataro.org:444/apex/rest/dobertes/elements_detall_unic?dataset=' +
    dataset +
    '&par1=' +
    par1 +
    '&val1=' +
    val1;

  var WKT = null;

  $.getJSON (urlJSON, function (response) {
    WKT = response.equipaments[0].WKT;
    mapJS1.flyToWKT(WKT);
    mapJS1.searchWKT(WKT);
  });
}

function recuperaDades (dataset, par1, val1, par2) {
  var urlJSON =
    'https://aplicacions.mataro.org:444/apex/rest/dobertes/elements_detall_unic?dataset=' +
    dataset +
    '&par1=' +
    par1 +
    '&val1=' +
    val1;

  var WKT = null;

  $.getJSON (urlJSON, function (response) {
    WKT = response.equipaments[0].WKT;
    mapJS1.flyToWKT(WKT);
    mapJS1.searchWKT(WKT);
  });
}
