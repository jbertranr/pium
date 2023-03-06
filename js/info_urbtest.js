var mapCatalog = new MapCatalog ();
var mapJS1 = null;
var mapJS2 = null;

$ (document).ready (function () {

  options1 = {
    capaInicial : L.tileLayer.wms("http://serveisweb.mataro.cat/cartografia/serveisMP/service?", {
      layers: 'ly_cache_src_guia_urbana_municipal_qgis_etrs89_wmts',
      format: 'image/png',
      crs: this.crs25831,
      transparent: true,
      continuousWorld: true,
      attribution: 'Ajuntament de Mataró',
      }),  
    draw: {
      active: false,
    },
  };

  options2 = {
    capaInicial : L.tileLayer.wms("http://serveisweb.mataro.cat/cartografia/serveisMP/service?", {
      layers: 'ly_cache_src_guia_urbana_municipal_qgis_etrs89_wmts',
      format: 'image/png',
      crs: this.crs25831,
      transparent: true,
      continuousWorld: true,
      attribution: 'Ajuntament de Mataró',
      }),  


    draw: {
      active: false,
    },
  };

  mapJS1 = new MapJS (mapCatalog, 'map', options1);

  setTimeout(function(){mapJS2 = new MapJS (mapCatalog, 'print-map', options2) }, 500 );

// mapJS2.map.options.maxZoom = 0;
// mapJS2.map.options.minZoom = 0;
//var map3 = new MapJS (mapCatalog, 'mapDiv3');
  
mapJS1.map.on ('draw:created',  function (ev) {
    //alert (toWKT (ev.layer));
    mapCatalog
      .getMapJS(ev.sourceTarget._container.id)
      .drawFeatureGroup.clearLayers()
      .addLayer(ev.layer);

    mapCatalog.getMapJS(
      ev.sourceTarget._container.id
    ).options.draw.geomDrawnWKT = toWKT(ev.layer);
    
    alert(toWKT(ev.layer));


    /*
    apex
      .item(
        mapCatalog.getMapJS(ev.sourceTarget._container.id).options.draw
        .apex_item
      )
      .setValue(toWKT(ev.layer)); */
    //this.drawFeatures.clearLayers (); // Esborra les capes (important l''ordre
    // this.options.draw.geomDrawnWKT (toWKT(ev.layer)) ; //toWKT (e.layer); // Afegeix la capa dibuixada
  },
  false
);



mapJS1.map.on('click', function(e) { // Pendent: es pot fer en un pas
  var urlJSON = 'https://aplicacions.mataro.org:444/apex/rest/dobertes/parcela?wkt=' + toWKT(L.marker(e.latlng));
  $.getJSON (
    urlJSON,
    function (data) { 
      var parcela = data.equipaments[0];
      var fitxaParceTot = "window.open('https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/print/info_urb.html?codi=" 
                                    + parcela.CODI_PK 
                                    +"', '_fines');";
      var fitxaParceBreu = "window.open('https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/print/info_urb.html?codi=" 
                                    + parcela.CODI_PK 
                                    +"&tipusFitxa=curta', '_fines');";                              
      mapJS1.searchWKT(parcela.WKT); 
      var urlJSONParce = 'https://aplicacions.mataro.org:444/apex/rest/dobertes/parcela2?codi=' + parcela.CODI_PK ;
      $.getJSON (
          urlJSONParce,
          function (dataParce) {            
            var parcelaTot = dataParce.equipaments[0]; 
            var layerTmp = mapJS1.searchFeatureGroup._layers[Object.keys(mapJS1.searchFeatureGroup._layers)[0]];
            var enviaCorreu = "var finestra = window.open('mailto:jbertran@ajmataro.cat?subject=Incidència adreça&nbsp;" + parcelaTot.ACCES_PRINCIPAL + "&body=https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/print/info_urb.html?codi=" + parcelaTot.CODI_PK + "','_blank'); finestra.close();"; 
            var enviaCorreuWeb = "var finestra = window.open('mailto:jbertran@ajmataro.cat?subject=Incidència adreça&nbsp;" + parcelaTot.ACCES_PRINCIPAL + "&body=https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/print/info_urb.html?codi=" + parcelaTot.CODI_PK + "','_blank');"; 
            var txt =   '<div class="popUp">'
                      + '  <div class="popUp__titol">'
                      + '        Informació de la parcel·la '
                      + '  </div>'       
                      + '  <div class="popUp__linia">'
                      + '    <div class="popUp__linia__parametre">' 
                      + '      Accés Principal'
                      + '    </div>'
                      + '    <div class="popUp__linia__valor">' 
                      +         parcelaTot.ACCES_PRINCIPAL
                      + '    </div>'
                      + '  </div>' 
                      + '  <div class="popUp__linia">'
                      + '    <div class="popUp__linia__parametre">' 
                      + '      Referència Cadastral'
                      + '    </div>'
                      + '    <div class="popUp__linia__valor">' 
                      +         parcela.REFCAD_COMPLERTA_IU
                      + '    </div>'                
                      + '  </div>'                        
                      + '  <div class="popUp__linia vincle" '
                      + '         onclick = " ' 
                      +            fitxaParceBreu + '">'  
                      + '    <div class="popUp__linia__faicon"> '        
                      +         '<i class="fa fa-table"></i>'
                      + '    </div>'   
                      + '    <div class="popUp__linia__unica"> '
                      +         'Mostra Fitxa Resum Informació Urb.' 
                      + '    </div>'                
                      + '  </div>'
                      + '  <div class="popUp__linia vincle" '
                      + '         onclick = " ' 
                      +            fitxaParceTot + '">'  
                      + '    <div class="popUp__linia__faicon"> '        
                      +         '<i class="fa fa-table"></i>'
                      + '    </div>'   
                      + '    <div class="popUp__linia__unica"> '
                      +         'Mostra Fitxa Complerta Informació Urb.' 
                      + '    </div>'                
                      + '  </div>'
                      + '  <div class="popUp__linia vincle" '
                      + '         onclick = " ' 
                      +            enviaCorreu + '">'  
                      + '    <div class="popUp__linia__faicon"> '        
                      +         '<i class="fa fa-envelope"></i>'
                      + '    </div>'   
                      + '    <div class="popUp__linia__unica"> '
                      +         'Comunicar incidència' 
                      + '    </div>'                
                      + '  </div>'   
                      + '  <div class="popUp__linia vincle" '
                      + '         onclick = " ' 
                      +            enviaCorreuWeb + '">'  
                      + '    <div class="popUp__linia__faicon"> '        
                      +         '<i class="fa fa-envelope"></i>'
                      + '    </div>'   
                      + '    <div class="popUp__linia__unica"> '
                      +         'Comunicar incidència correu web' 
                      + '    </div>'                
                      + '  </div>'    
                      + '</div>';                     
                    layerTmp.bindPopup( txt );
                    layerTmp.on('mouseover', function (e) {
                      this.openPopup();
                    });
                    layerTmp.openPopup();
                    // $('#userinfo').html(txt);

      });
    });
}); 

/*mapJS1.map.on ('draw:created', function () {
    
    $ ('.geomdata').html (
      ' <div class="boxparam">' +
        '<div class="boxparam__header">' +
          '<div class="boxparam__header__faicon">' +          
            '<i class ="fa fa-map-marker"></i>' +
          '</div>' +  
          '<div class="boxparam__header__txt">' +          
            'Geometria' +
          '</div>' + 
        '</div>' +    
        '<div class="boxparam__value">' +
          mapCatalog.getMapJS ('map').draw.geomDrawnWKT +
        '</div>' +
      '</div>'+
      ' <div class="boxparam">' +
      '<div class="boxparam__header">' +
        '<div class="boxparam__header__faicon">' +          
          '<i class ="fa fa-map-marker"></i>' +
        '</div>' +  
        '<div class="boxparam__header__txt">' +          
          'Geometria' +
        '</div>' + 
      '</div>' +    
      '<div class="boxparam__value">' +
        mapCatalog.getMapJS ('map').draw.geomDrawnWKT +
      '</div>' +
    '</div>'  +
    '</div>'+
    ' <div class="boxparam">' +
    '<div class="boxparam__header">' +
      '<div class="boxparam__header__faicon">' +          
        '<i class ="fa fa-map-marker"></i>' +
      '</div>' +  
      '<div class="boxparam__header__txt">' +          
        'Geometria' +
      '</div>' + 
    '</div>' +    
    '<div class="boxparam__value">' +
      mapCatalog.getMapJS ('map').options.draw.geomDrawnWKT +
    '</div>' +
  '</div>'          
    );
  });*/

  mapJS1.map.on ('moveend', function () {
    // setTimeout (function () {
   // mapJS2.drawWKT (toWKT (L.rectangle (mapJS1.map.getBounds ())));
  });

  //mapJS1.drawPlugin();
});



function parseInfoUrbIU (codi_iu, tipusFitxa) {
  var referencia = (codi_iu == null)?'8691':codi_iu;  
  var ruta = 'codi=' + referencia;
  var tipus = (tipusFitxa == null)?'llarga':tipusFitxa; 

  $.getJSON (
    'https://aplicacions.mataro.org:444/apex/rest/dobertes/parcela2?' + ruta,
    function (data) { 
      infourbCard(data, tipus);      
    }
  );
}





function parseInfoUrbRC (refCadastral) {
  var referencia = (refCadastral == null)?'8691':refCadastral;

  $.getJSON (
    'https://aplicacions.mataro.org:444/apex/rest/dobertes/parcela2?refcad=' + referencia,
    function (data) { 
      infourbCard(data);      
    }
  );
}


function activaTema (listview, nomTema, value, elements) {
  $ ('#cerca-input').blur ();
  $ ('#dades-input').blur ();
 // $ ('.cerca__result').html('Cercant resultats..');

  switch (nomTema) {

    case 'parcel':
      cercaGenericJSON (
        'https://aplicacions.mataro.org:444/apex/rest/dobertes/elements_detall?dataset=DS_PARCELARI100&par1=REF_CADASTRAL&val1=' +
        value,
        listview,
        nomTema,
        'fa fa-map fa-2X',
        value,
        'DS_PARCELARI100',
        'CODI_IU',
        'REF_CADASTRAL',
        'REF_CADASTRAL',
        'REF_CADASTRAL',
        'CODI_IU',        
        'WKT',
        100
      );
      break;

    case 'acces':
      var value1 = value.replace (/[0-9]/g, ''); // Només pot buscar sobre el carrer. Filtra per número després
      cercaGenericJSON (
        'https://aplicacions.mataro.org:444/apex/rest/dobertes/elements_detall?dataset=DS_ACCES100&par1=ACCES_NOM&val1=' +
        value1,
        listview,
        nomTema,
        'fa fa-map-marker fa-2x',
        value,
        'DS_ACCES01',
        'CODI_IU',
        'ACCES_NOM',
        'ACCES_NOM',
        'PARCELA_IU',
        'PARCELA_IU', // Nota: potser no cal repetir-ho
        'WKT',
        100
      );
      break;
  }
}


function infourbCard(data,tipusFitxa){ 
  
  $ ('.datawrp').html('');


  var mostrar = { 'Accés principal' : data.equipaments[0].ACCES_PRINCIPAL,
                  'Referència Cadastral' : data.equipaments[0].REFCAD_COMPLERTA_IU,
                  'Codi GIS': data.equipaments[0].CODIGIS_IU
  };   

  $ ('<div/>', {
    class: 'datawrp__title',
    text: 'INFORMACIÓ URBANÍSTICA PER PARCEL·LA'     
  })
  .appendTo ($ ('.datawrp'));  
  
  /*$.each( mostrar, function(key,value){
    $ ('<div/>', {
      class: 'indicator'     
    })
    .append('<div class="indicator__text">' +  key + '</div>')
    .append('<div class="indicator__value">' +  value + '</div>')
    .appendTo ($ ('.datawrp'))
  });*/
  
  var lastGroup = '';

  var liniaAcces =  $ ('<div/>', {
                         class: 'datawrp__line'   
                      })     
                    .append('<div class="datawrp__line__elem--50" style="font-weight:bold;height:auto;">' + 'Adreça' + '</div>')
                    .append('<div class="datawrp__line__elem--50" style="height:auto;">' +  data.equipaments[0].ACCES_PRINCIPAL + '</div>')
                    .appendTo ($ ('.datawrp')); 

 var liniaRC =  $ ('<div/>', {
                  class: 'datawrp__line'   
                })     
                .append('<div class="datawrp__line__elem--50" style="font-weight:bold;height:auto;">' + 'Referència Cadastral' + '</div>')
                .append('<div class="datawrp__line__elem--50" style="height:auto;">' +  data.equipaments[0].REFCAD_COMPLERTA_IU + '</div>')
                .appendTo ($ ('.datawrp')); 

  var mapita =  $ ('<div/>', {
                    class: 'mapwrp'   
                  })   
                  .append(' <div id="print-map"> </div> ')
                  .appendTo ($ ('.datawrp')); 
                  

  $.each(data.equipaments[0].PARAM, function(num, dataParam){
    if ( lastGroup != dataParam.NOM_GRUP_TIPUS_PARAM ){
      $ ('<div/>', {
        class: 'datawrp__title',
        text: dataParam.NOM_GRUP_TIPUS_PARAM     
      })
      .appendTo ($ ('.datawrp'));
    }    
    
    var linia =  $ ('<div/>', {
      class: 'datawrp__line'     
    });

    switch(dataParam.CODI_GRUP_TIPUS_PARAM){
      case 43:
        switch(dataParam.CODI_TIPUS_PARAM){
          case 23:
            var fitxaURLPDF= 'https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/PORTAL_IU/01_DOCUMENTS/02_QUALIS/Pdf/' + dataParam.CODISERVEI_PARAMETRE + '.pdf' ;
            linia
              .append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
              .append('<div class="datawrp__line__elem--50" style="height:auto">' +  dataParam.NOM_PARAMETRE + '</div>')
              .append("<div class='datawrp__line__elem--25' style='height:auto;font-style:italic;cursor:pointer;text-decoration: underline;' onclick=\"window.open(' " + fitxaURLPDF + "','_blank')\">" + dataParam.CODISERVEI_PARAMETRE  + "</div>");
            break;        
          default:
            linia      
              .append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
              .append('<div class="datawrp__line__elem--50" style="height:auto">' +  dataParam.NOM_PARAMETRE + '</div>')
              .append('<div class="datawrp__line__elem--25" style="height:auto">' +  dataParam.CODISERVEI_PARAMETRE + '</div>');
            break;
          }
        break;      
      case 10:
        var condParticular = (dataParam.hasOwnProperty('CONDICIO_PART')) ? dataParam.CONDICIO_PART:'--';
        var condEspecific = (dataParam.hasOwnProperty('CONDICIO_ESP')) ? dataParam.CONDICIO_ESP:'--';
        var parametreBasic = (dataParam.hasOwnProperty('PARAMETRE_BASIC')) ? dataParam.PARAMETRE_BASIC:0;
        if ( tipusFitxa == 'llarga'  || ( tipusFitxa == 'curta' && parametreBasic ==  1)){
          linia      
            .append('<div class="datawrp__line__elem--25" style="height:auto;font-weight:bold;">' +  dataParam.NOM_PARAMETRE  + ' </div>')
            .append('<div class="datawrp__line__elem--25" style="height:auto;width:5em">' +  dataParam.CODISERVEI_PARAMETRE   + ' </div>')
            .append('<div class="datawrp__line__elem--66" style="height:auto"><div style="float:left;font-style:italic;margin-left:2em;height:auto;">' +  condParticular + '</div><div style="float:left;font-style:italic;margin-left:2em;height:auto;">' +  condEspecific + '</div></div>');
        } 
             
        break; 
      case 60:
        var pdf = ("000" + dataParam.ENLLAC_WEB_PARAMETRE ).slice(-3);
        var fitxaURLPDF= 'https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/SSIT/urbanisme/patrimoni/FITXA' + pdf + '.PDF';
        linia  //.append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
          .append('<div class="datawrp__line__elem--50" style="font-weight:bold;height:auto">' +  dataParam.NOM_PARAMETRE + '</div>')
          .append('<div class="datawrp__line__elem--25" style="height:auto">' +  dataParam.CODISERVEI_PARAMETRE + '</div>')
          .append("<div class='datawrp__line__elem--25' style='height:auto;font-style:italic;cursor:pointer;text-decoration: underline;' onclick=\"window.open(' " + fitxaURLPDF + "','_blank')\">" +  "Veure PDF" + "</div>");
        break;
      case 40:  
        linia      
          .append('<div class="datawrp__line__elem--25" style="font-weight:bold;height:auto">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
          .append('<div class="datawrp__line__elem--50" style="width:65%;height:auto;">' +  dataParam.NOM_PARAMETRE + ' ('+  dataParam.CODISERVEI_PARAMETRE + ' ) ' + '</div>')
          break;
      case 44:
        if (tipusFitxa != 'curta'){
          linia      
           .append('<div class="datawrp__line__elem--100" style="width:90%;height:auto;">' +  dataParam.NOM_PARAMETRE + ' ('+  dataParam.CODISERVEI_PARAMETRE + ' ) ' + '</div>')
        }  
        //  .append('<div class="datawrp__line__elem--25" style="height:auto;">' +  dataParam.CODISERVEI_PARAMETRE + '</div>');
        break;       
      default:
        linia      
        .append('<div class="datawrp__line__elem--50" style="font-weight:bold;height:auto;">' +  dataParam.NOM_TIPUS_PARAM + '</div>')
        .append('<div class="datawrp__line__elem--50" style="height:auto;">' +  dataParam.CODISERVEI_PARAMETRE + '</div>');
        break;
    }
    linia
      .appendTo ($ ('.datawrp'));
      lastGroup = dataParam.NOM_GRUP_TIPUS_PARAM;
  });

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + '/' + mm + '/' + yyyy;
 
  if (tipusFitxa == 'curta'){
    $ ('<div/>', {
      class: 'datawrp__title',
      text: 'Fitxa simplificada' 
    })
    .appendTo ($ ('.datawrp')); 
  }
  
  $ ('<div/>', {
    class: 'datawrp__title',
    text: 'FITXA INFORMATIVA NO VINCULANT ( ' + today + ' )', 
  })
  .appendTo ($ ('.datawrp'));  

  setTimeout( function(){
    mapJS2.flyToWKT(data.equipaments[0].WKT);
    mapJS2.searchWKT(data.equipaments[0].WKT);
  },  
  2000);  
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

                numResposta += 1;
                                      
              
                html += 
                          "      <div class='cerca__bl'>" 
                      +  "        <div class='cerca__line cerca__line__elem--icon' onclick=\"recuperaWKT( '" + 'DS_PARCELARI01'+ "' ,'" + colCodi + "','" + equip[valCodi] + "'  ); \">" 
                      +  "           <i class='" + faIcon + "'></i>"
                      +  "        </div>" 
                      +  "        <div class='cerca__line__elem--text'  > "                                        
                      +  "          <div class='cerca__line cerca__line__elem--titol'  > "
                      +                 equip[colEtiq1]
                      +  "          </div>" ;
                      +  "          <div class='cerca__line cerca__line__elem--subtitol' > "
                      +  "            Codi: " +   equip[colEtiq2] 
                      +  "          </div>" ; //   El div principal es tanca després 
                      //  alert(colEtiq2);

                /*if ( dataset == 'DS_ACCES01' && equip.hasOwnProperty(colEtiq2) ) {

                             html +=  "<div class='cerca__line cerca__line__elem--subtitol' style='cursor:pointer' onclick=\"parseInfoUrbIU('" + equip[colEtiq2] + "' );\" > "
                                    + "  <span>   Codi Parcel·la: " +   equip[colEtiq2] + "&nbsp &nbsp </span> "
                                    + "  <i class='fa fa-file-o'></i>" 
                                    + "</div>" ;
                           } 
                */ 

                if ( dataset == 'DS_PARCELARI100' && equip.hasOwnProperty('NOM_CARRER') ) {

                  html +=  "<div class='cerca__line cerca__line__elem--subtitol' style='cursor:pointer'>"
                          + "  <span> " +   equip['NOM_CARRER'] + "&nbsp &nbsp </span> "
                          + "  <i  onclick=\"window.open('https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/print/info_urb.html?codi=" + equip['CODI_IU'] + "&tipusFitxa=curta','_fines')\" class='fa fa-file-o'></i>"                           
                          + "  <i  onclick=\"window.open('https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/print/info_urb.html?codi=" + equip['CODI_IU'] + "','_fines')\" class='fa fa-table'></i>" 
                          + "</div>" ;       
                } 

                if ( dataset == 'DS_ACCES01' && equip.hasOwnProperty(colEtiq2) ) {
                  html +=  "<div class='cerca__line cerca__line__elem--subtitol' style='cursor:pointer'> "
                        + "  <span>   Codi Parcel·la: " +   equip[colEtiq2] + "&nbsp &nbsp </span> "                      
                        + "  <i  onclick=\"window.open('https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/print/info_urb.html?codi=" + equip[colEtiq2] + "&tipusFitxa=curta','_fines')\" class='fa fa-file-o'></i>" 
                        + "  <i  onclick=\"window.open('https://serveisweb.mataro.cat/visorSIG/images/RecursosVisor/InformacioUrbanistica/print/info_urb.html?codi=" + equip[colEtiq2] + "','_fines')\" class='fa fa-table'></i>" 
                        + "</div>" ;                     
                }        
              } 


               html +=  "  </div> </div>"; 

              listview.html( html );          
            } 
          if ( numResposta > nombre ){
                    html += 
                    +  "     <div class='cerca__title'> "
                    +  "       Resultats parcials"
                    +  "     </div>" ;        
            return false;
          }                   
      });

           /* 123     if ( visor.posicioActual.lat > 1 ) // Existeix l'atribut WKT i disposem de la posició
                {                                          
                   var ordena =  $('<div/>', {  id: 'ordena_id' }) .append(html);
                   $(ordena).find("[data-tema='"+ temaCerca  +"']").sort(sort_li).appendTo($(ordena));
                   visor.cercaHTML += $(ordena).html();
                }
                else { 123*/
                  // visor.cercaHTML += html;                               
              //  } 
              

              //  listview.listview( "refresh" );
               // listview.trigger( "updatelayout" );
           //     visor.map.addLayer(visor.markersTaula);                  
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
