function MapJS(mapCatalog, mapDiv, options) {
  // this.bounds = null; // mapBounds del mapa ( Ja es troba en el MapJS.map)
  this.mapCatalog = mapCatalog; // Catàleg on es troba el mapaJS, tots els mapesJS es troben en un catàleg
  this.map = {}; // Objecte mapa leaflet
  this.mapDiv = mapDiv; // Div on es troba el mapa leaflet
  //this.searchFeatures = L.featureGroup (); // Features resultat d'una cerca (Pendent)
  this.geomInitWKT =
    'POLYGON ((2.44348994193451 41.5421595692297, 2.44348996236308 41.5421571864573, 2.44350260774148 41.5421620133926, 2.44354756107984 41.5420978933965, 2.44353495656433 41.5420883009215, 2.44348994193451 41.5421595692297))'; // Només s'utilitza si no hi ha editfeature ni viewfeature
  this.CRS = new L.Proj // CRS per defecte ( Caldrà guardar en fitxer apart )
    .CRS(
      'EPSG:25831',
      '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', {
        bounds: L.bounds([257909.15, 4484800.15], [535906.39, 4751797.52]),
        resolutions: [10, 5, 2, 1, 0.5, 0.25, 0.15, 0.05],
        origin: [257909.15, 4484800.15],
      }
    );

  this.serveiOrtoCache = L.tileLayer.wms(
    'http://mapcache.icc.cat/map/bases/service?', {
      layers: 'orto',
      format: 'image/jpeg',
    //  crs: this.crs25831,
      continuousWorld: true,
      attribution: 'Institut Cartogràfic i Geològic de Catalunya -ICGC',
    }
  );

  this.planejamentRefos = L.tileLayer.wms (
    'https://serveisweb.mataro.cat/cartografia/serveisMP/service?',
    {
      layers: 'ly_cache_src_quali_cedi_refos_qgis_etrs89_wmts',
      format: 'image/png',
      crs: this.CRS,
      transparent: false,
      continuousWorld: true,
      attribution: 'Ajuntament de Mataró',
      opacity:1,
    }
  );

  this.topo = L.tileLayer (
    ' http://serveisweb.mataro.cat/mapproxy/tms/1.0.0/ly_topo_tms/grd_25831_tms/{z}/{x}/{-y}.png', {    
      maxZoom: 7,
      minZoom: 0,
      attribution: 'Mataró ',
      transparent: true,
    }
  );

  this.capaInicial = L.tileLayer(
    ' https://serveisweb.mataro.cat/mapproxy/tms/1.0.0/ly_guiaurbana_tms/grd_4326_tms/{z}/{x}/{-y}.png', {
      maxZoom: 7,
      minZoom: 0,
      attribution: 'Mataró ',
    }
  ); 

  this.capaBase = {
    'Base': this.planejamentRefos,
    'Imatge aèria': this.serveiOrtoCache,
    'topogràfic': this.topo
  };

  this.overlayMap ={
   // 'Planejaments Refós' : this.planejamentRefos
  }
  this.drawFeatureGroup = L.featureGroup(); // Features resultat de l'edició 

  this.viewFeatureGroup = L.featureGroup(); // Features resultat de l'edició

  this.searchFeatureGroup = L.featureGroup(); // Features resultat de l'edició

  this.options = {

    // Totes les defincions inicials de l'objecte
    
    capaInicial : this.topo,    
    event: {apex_itemDblClick: ''}, // Item apex on es guarda WKT dobleclick
    draw: {
      // Permet l'edició de geometries amb el plugin Draw
      active: true, // Si es vol activar l'edició de geometries en accedir al mapa
      geometryType: 'any', // Tipus de eometria que es voldrà editar
      geomInitWKT: '',
      geomDrawnWKT: '',
      apex_item: '', // Item apex on es guarda la geometria dibuixada
      
      drawPlugin: {
        plugin: {}, //  El propi objecte del plugin de Draw
        options: {
          //  Les opcions de l'objecte anterior
          position: 'topleft',
          draw: {
            polyline: false,
            circle: false,
            line: false,
            rectangle: false,
            marker: true,
            polygon: true,
            circlemarker: false,
            polygon: {
              allowIntersection: false, // Restricts shapes to simple polygons
              drawError: {
                color: '#e1e100', // Color the shape will turn when intersects
                message: '<strong>No es pot creuar<strong> ' // Message that will show when intersect
              },
              shapeOptions: {
                color: '#f00'
              },
            },
          },
          edit: {
            featureGroup: this.drawFeatureGroup,
            remove: false,
          },
        },
      },
    },
    view: {
      active: false,
      geomInitWKT: 'POLYGON ((2.44348994193451 41.5421595692297, 2.44348996236308 41.5421571864573, 2.44350260774148 41.5421620133926, 2.44354756107984 41.5420978933965, 2.44353495656433 41.5420883009215, 2.44348994193451 41.5421595692297))',
      featureGroup: this.viewFeatureGroup, // Features resultat de la visualització (query normalment)
      geomInitWKT: {},
    },
    search: {
      active: false,
      geomInitWKT: '',
      featureGroup: this.searchFeatureGroup, // Features resultat de la visualització (query normalment)
      geomInitWKT: {},
    },
  };

  this.moveend = function (e) {
    // Event quan es mou el mapa. Per ara fa un desplaçament en múltiples capes ->
    // si la propietat val està activa
    /*
    if (mapCatalog.mapJSArray.length > 1 && mapCatalog.synchro.val == true) {
      // Si hi ha més d'un mapa i synchro
      for (var i in mapCatalog.mapJSArray) {
        // Revisa tots els mapes
        if (
          mapCatalog.mapJSArray[i].map == e.sourceTarget &&
          mapCatalog.synchro.mapJS.map == e.sourceTarget
        ) {
          // Trobem el mapa que s'ha mogut i si és el principal
          for (var j in mapCatalog.mapJSArray) {
            if (i != j) {
              // si no és el que s'ha mogut desplacem
              mapCatalog.mapJSArray[j].map.panTo (e.sourceTarget.getCenter ());
            }
          }
        } 
      }
    }*/
  };

  this.getData = function () {
    return JSON.stringify(this.options.draw);
  };

  //function _init () {
  this.init(options);

  //}

  /*return {
    //init: _init,
   map: this.map,
    mapDiv: this.mapDiv,
    getData: this.getData,
    options: this.options,
    drawWKT: this.drawWKT,
    drawFeatureGroup: this.drawFeatureGroup,
    viewFeatureGroup: this.viewFeatureGroup,
    //  addWKT:_flyToWKT
  };*/

  //function _flyToWKT(WKT) {
  //  this.map = omnivore.wkt.parse(WKT).getBounds();
  //  this.map.flyToBounds(this.map.bounds);
  //  this.map.fitBounds(this.map.bounds);
  // }
}


MapJS.prototype.init = function (options) {
  $.extend(true, this.options, options);
  this.map = L.map(this.mapDiv, {
      crs: this.CRS,
      worldCopyJump: false,
      layers: this.options.capaInicial,
      maxZoom: 6,
      minZoom: 0,
    })
    .on('moveend', this.moveend)
    .setView([41.54, 2.44], 3);

  this.drawFeatureGroup.addTo(this.map);

  this.viewFeatureGroup.addTo(this.map);

  this.searchFeatureGroup.addTo(this.map);

  L.control.layers(this.capaBase,
                   this.overlayMap
  
  ).addTo(this.map);

  L.control.scale().addTo(this.map);

  this.map.on('dblclick', function(e) {

    /*
    apex
    .item(
      mapCatalog.getMapJS(e.sourceTarget._container.id).options.event
      .apex_itemDblClick
    )
    .setValue(
      toWKT( L.marker(e.latlng) )
    );
    */
  }); 
  

  /* -- Posició Inicial
       -- depenent de les options
       -- Mode edició, view o position
       -- Es treu per posar-ho en el codi de la crida
  

  if (this.options.draw.active == true && this.options.draw.geomInitWKT) {
    this.drawPlugin ();
  } else if (
    this.options.view.active == true &&
    this.options.view.geomInitWKT
  ) {
    this.flyToWKT (this.options.view.geomInitWKT);
    this.viewWKT (this.options.view.geomInitWKT);
  } else {
    this.flyToWKT (this.geomInitWKT);
  }
  
  */
  this.mapCatalog.addMapJS(this); // Afegeix el mapa al catàleg
  //return this.map;
};

MapJS.prototype.getData = function () {
  return JSON.stringify(this.options);
};

MapJS.prototype.drawPlugin = function () {
  //--L.drawLocal.draw.toolbar.buttons.polygon = 'Filtra sobre el mapa';
  //--L.drawLocal.draw.toolbar.buttons.marker = 'Selecciona un punt en el mapa';

  // var WKT = omnivore.wkt.parse (this.options.draw.geomInitWKT);

  // WKT._layers[Object.keys (WKT._layers)[0]].addTo (this.drawFeatureGroup); // Afegeix la capa a les features

  this.options.draw.drawPlugin.plugin = new L.Control.Draw(
    this.options.draw.drawPlugin.options
  );

  this.options.draw.drawPlugin.plugin.addTo(this.map);

  $('.leaflet-top').css({
    'z-index': 500
  }); // Evita que els botons surtin fora de 

  //callback();

  //this.flyToWKT (WKT);

  //this.drawWKT (WKT);

  //  document.querySelector ('.leaflet-draw-edit-edit').click (); // Sense jQuery emular click
  //this.map.doubleClickZoom.disable();

  this.map.on(
    'draw:created',
    function (ev) {
      //alert (toWKT (ev.layer));
      mapCatalog
        .getMapJS(ev.sourceTarget._container.id)
        .drawFeatureGroup.clearLayers()
        .addLayer(ev.layer);

      mapCatalog.getMapJS(
        ev.sourceTarget._container.id
      ).options.draw.geomDrawnWKT = toWKT(ev.layer);
    
      apex
        .item(
          mapCatalog.getMapJS(ev.sourceTarget._container.id).options.draw
          .apex_item
        )
        .setValue(toWKT(ev.layer));
      //this.drawFeatures.clearLayers (); // Esborra les capes (important l''ordre
      // this.options.draw.geomDrawnWKT (toWKT(ev.layer)) ; //toWKT (e.layer); // Afegeix la capa dibuixada
    },
    false
  );

  this.map.on(
    'draw:edited',
    function (ev) {
      var layerTmp = ev.layers._layers[Object.keys(ev.layers._layers)[0]];
      mapCatalog
        .getMapJS(ev.sourceTarget._container.id)
        .drawFeatureGroup.addLayer(layerTmp);
      mapCatalog.getMapJS(
        ev.sourceTarget._container.id
      ).options.draw.geomDrawnWKT = toWKT(
        ev.layers._layers[Object.keys(ev.layers._layers)[0]]
      );

      apex
        .item(
          mapCatalog.getMapJS(ev.sourceTarget._container.id).options.draw
          .apex_item
        )
        .setValue(
          toWKT(ev.layers._layers[Object.keys(ev.layers._layers)[0]])
        );
      //this.drawFeatures.clearLayers (); // Esborra les capes (important l''ordre
      // this.options.draw.geomDrawnWKT (toWKT(ev.layer)) ; //toWKT (e.layer); // Afegeix la capa dibuixada
    },
    false
  );

  /*
  this.map.on ('draw:edited', function (e) {
    e.layers.eachLayer (function (layer) {
      //apex.item ('P92_WKTMAPA').setValue (toWKT (layer));
    });

    //apm_PLG_MAPA_EDIT.editFeatures.addLayer( e.layer); // Afegeix la capa dibuixada
    // apm_PLG_MAPA_EDIT.editFeatures.clearLayers(); // Esborra les capes (important l''ordre
    //apm_PLG_MAPA_EDIT.editFeatures.addLayer( e.layer); // Afegeix la capa dibuixada
  });*/
};

MapJS.prototype.drawWKT = function (WKT) {
  this.drawFeatureGroup.clearLayers ();
  var WKT2 = omnivore.wkt.parse (WKT);
  var lay21 = WKT2._layers[Object.keys (WKT2._layers)[0]];
  lay21.addTo (this.drawFeatureGroup); 
  lay21.setStyle({'color':'#f00'}) 
  $ ('.leaflet-draw-edit-edit').click (); // Sense jQuery emular click
};


MapJS.prototype.clearDrawWKT = function (WKT) {
  this.drawFeatureGroup.clearLayers(); 
};

MapJS.prototype.flyToWKT = function (WKT) {
  if (WKT.length > 10) {
    this.map
      // .flyToBounds (omnivore.wkt.parse (WKT).getBounds ())
      .fitBounds(omnivore.wkt.parse(WKT).getBounds());
  }
};

MapJS.prototype.searchWKT = function (WKT, tooltipHTML) {
  if (WKT.length > 10) {
    this.searchFeatureGroup.clearLayers().addLayer(omnivore.wkt.parse(WKT));
  }
};

MapJS.prototype.viewWKT = function (WKT) {
  if (WKT.length > 10) {
    this.viewFeatureGroup.addLayer(omnivore.wkt.parse(WKT));
  } 
};

MapJS.prototype.clearViewWKT = function (WKT) {
    this.viewFeatureGroup.clearLayers();
};

/* --Creació del catàleg de mapes  S'haurà de crear un altre fitxer per guardar-ho */
function MapCatalog(name) {
  this.mapJSArray = [];
  this.name = name;
  //this.synchro = {
  //  val: false, // Si es vol sondronitzar el desplaçament
  //  mapJS: null,
  //};
}

MapCatalog.prototype.addMapJS = function (mapJS) {
  this.mapJSArray[this.mapJSArray.length] = mapJS;
  //if (this.mapJSArray.length == 1 && this.synchro == true) {
  //  this.synchro.mapJS = mapJS;
  // }
};

MapCatalog.prototype.getMapJS = function (mapDiv) {
  for (var i in mapCatalog.mapJSArray) {
    // Revisa tots els mapes
    if (mapCatalog.mapJSArray[i].mapDiv == mapDiv) {
      // Trobem el mapa que s'ha mogut i si és el principal
      return mapCatalog.mapJSArray[i];
    }
  }
};

/*
function carregaCRS () {
  var crs25831 = new L.Proj
    .CRS (
    'EPSG:25831',
    '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      bounds: L.bounds ([257909.15, 4484800.15], [535906.39, 4751797.52]),
      resolutions: [10, 5, 2, 1, 0.5, 0.25, 0.15, 0.05],
      origin: [257909.15, 4484800.15],
    }
  ),
    crs23031 = new L.Proj
      .CRS ('EPSG:23031', '+proj=utm +zone=31 +ellps=intl +units=m +no_defs', {
      resolutions: [10, 5, 2, 1, 0.5, 0.25, 0.15, 0.05],
      bounds: L.bounds ([258000, 4485000], [536000, 4752000]),
      origin: [258000, 4485000],
    }
  );
}

  capa.guiaUrbana_nit = L.tileLayer (
    ' http:/serveisweb.mataro.cat/mapproxy/tms/1.0.0/ly_guiaurbana_nit_tms/grd_25831_tms/{z}/{x}/{-y}.png',
    {
      maxZoom: 7,
      minZoom: 0,
      attribution: ' Mataró ',
    }
  );

  capa.parcelari = L.tileLayer (
    ' http:/serveisweb.mataro.cat/mapproxy/tms/1.0.0/ly_parcellari_tms/grd_25831_tms/{z}/{x}/{-y}.png',
    {
      maxZoom: 7,
      minZoom: 0,
      attribution: ' Mataró ',
    }
  );

  capa.topo = L.tileLayer (
    ' http:/serveisweb.mataro.cat/mapproxy/tms/1.0.0/ly_topo_tms/grd_25831_tms/{z}/{x}/{-y}.png',
    {
      maxZoom: 7,
      minZoom: 0,
      attribution: ' Mataró ',
    }
  );

  capa.serveiTopoCache = L.tileLayer.wms (
    'http://mapcache.icc.cat/map/bases/service?',
    {
      layers: 'topo',
      format: 'image/jpeg',
      crs: this.crs25831,
      continuousWorld: true,
      attribution: 'Institut Cartogràfic i Geològic de Catalunya -ICGC',
    }
  );

  capa.serveiOrtoCache = L.tileLayer.wms (
    'http://mapcache.icc.cat/map/bases/service?',
    {
      layers: 'orto',
      format: 'image/jpeg',
      crs: this.crs25831,
      continuousWorld: true,
      attribution: 'Institut Cartogràfic i Geològic de Catalunya -ICGC',
    }
  );

  capa.serveitopoGrisCache = L.tileLayer.wms (
    'http://mapcache.icc.cat/map/bases/service?',
    {
      layers: 'topogris',
      format: 'image/jpeg',
      crs: this.crs25831,
      continuousWorld: true,
      attribution: 'Institut Cartogràfic i Geològic de Catalunya -ICGC',
    }
  );

  capa.wmsComarques = L.tileLayer.wms (
    'http://geoserveis.icc.cat/icc_limadmin/wms/service?',
    {
      layers: '5,1',
      format: 'image/png',
      crs: this.crs25831,
      transparent: true,
      continuousWorld: true,
      attribution: 'Base Comarcal 1:50.000 - ICGC',
    }
  );

  this.capaBase = {
    'Guia Urbana': this.capa.guiaUrbana,
    'Guia Urbana Nit': this.capa.guiaUrbana_nit,
    'Parcel·lari': this.capa.parcelari,
    'Topogràfic': this.capa.topo,
    'Topogràfic ICGC': this.capa.serveiTopoCache,
    'Topogràfic gris ICGC': this.capa.serveitopoGrisCache,
    'Ortofoto': this.capa.serveiOrtoCache,
  };

  this.markersInici = L.markerClusterGroup (); // Marker inicial 

  this.markers = L.markerClusterGroup (); // Marker edició
  
  L.control.layers (this.baseMaps).addTo (this.map);

  this.cercaFeatures = L.featureGroup ().addTo (this.map);

  this.map.doubleClickZoom.disable ();

  var _init = function(){

  }

  // this.valors = [];

  this.map.addLayer (this.markersInici);

  setTimeout (function () {
    this.map.invalidateSize ();
  }, 400);

 // this.valors.push ([41.5521113868808, 2.44028575424343, 4]);

  this.markersInici.addLayer (
    L.marker ([
      41.5521113868808,
      2.44028575424343,
    ]).bindPopup ('<b>etiqueta</b></br>', {maxWidth: 500})
  );

  var bounds = this.markersInici.getBounds ();

  this.map.fitBounds (bounds);

  this.map.panTo (bounds.getCenter ());

  if (this.map.getZoom () > 4) {
    this.map.setZoom (0);
  }

  // setTimeout(function(){' || v_map_name || '.invalidateSize()}, 400);
  setTimeout (function () {
    $ ('.leaflet-top, .leaflet-bottom').css ({'z-index': 500});
  }, 500);

}) ();*/
function toWKT(layer) {
  var lng, lat, coords = [];
  if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
    var latlngs_ini = layer.getLatLngs();
    var latlngs = latlngs_ini[0];
    for (var i = 0; i < latlngs.length; i++) {
      latlngs[i];
      coords.push(latlngs[i].lng + ' ' + latlngs[i].lat);
      if (i === 0) {
        lng = latlngs[i].lng;
        lat = latlngs[i].lat;
      }
    }
    if (layer instanceof L.Polygon) {
      return 'POLYGON((' + coords.join(',') + ',' + lng + ' ' + lat + '))';
    } else if (layer instanceof L.Polyline) {
      return 'LINESTRING(' + coords.join(',') + ')';
    }
  } else if (layer instanceof L.Marker) {
    return (
      'POINT(' + layer.getLatLng().lng + ' ' + layer.getLatLng().lat + ')'
    );
  }
}

function isEmpty(property) {
  return (property === null || property === "" || typeof property === "undefined");
}