
var jcrop, selection

//THREEJS-----
var textureLoader;

var material1;

//THREE.Cache.enabled = true

var container, stats, permalink, hex;

var camera, cameraTarget, scene, renderer;

var group, group_container, textMesh1, textMesh2, textGeo, materials;

var firstLetter = true;

var text = "HAPPY",
    split_text = text.split(" "),

    height = 70,
    size = 120,
    hover = 0,

    curveSegments = 4,

    bevelThickness = 5,
    bevelSize = 1.5,
    bevelEnabled = false,

    font = undefined,

    fontName = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
    fontWeight = "bold"; // normal bold

var mirror = true;

var fontMap = {
    "helvetiker": 0,
    "optimer": 1,
    "gentilis": 2,
    "droid/droid_sans": 3,
    "droid/droid_serif": 4
};

var weightMap = {
    "regular": 0,
    "bold": 1
};

var texture;

var reverseFontMap = [];
var reverseWeightMap = [];

for ( var i in fontMap ) reverseFontMap[ fontMap[ i ] ] = i;
for ( var i in weightMap ) reverseWeightMap[ weightMap[ i ] ] = i;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var targetRotation_z = 0;
var targetRotationOnMouseDown_z = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;

var mouseY = 0;
var mouseYOnMouseDown = 0;

var windowHalfY = window.innerHeight / 2;

var fontIndex = 1;
//-----

var overlay = ((active) => (state) => {
  active = typeof state === 'boolean' ? state : state === null ? active : !active
  $('.jcrop-holder')[active ? 'show' : 'hide']()
  chrome.runtime.sendMessage({message: 'active', active})
})(false)

var image = (done) => {
  var image = new Image()
  image.id = 'fake-image'
  image.src = chrome.runtime.getURL('/images/pixel.png')
  image.onload = () => {
    $('body').append(image)
    done()
  }
}

var init = (done) => {
  $('#fake-image').Jcrop({
    bgColor: 'none',
    onSelect: (e) => {
      selection = e
      capture()
    },
    onChange: (e) => {
      selection = e
    },
    onRelease: (e) => {
      setTimeout(() => {
        selection = null
      }, 100)
    },
    aspectRatio: (6 / 4)
  }, function ready () {
    jcrop = this

    $('.jcrop-hline, .jcrop-vline').css({
      backgroundImage: `url(${chrome.runtime.getURL('/images/Jcrop.gif')})`
    })

    if (selection) {
      jcrop.setSelect([
        selection.x, selection.y,
        selection.x2, selection.y2
      ])
    }

    done && done()
  })
}

var capture = (force) => {
  chrome.storage.sync.get((config) => {
    if (selection && (config.method === 'crop' || (config.method === 'wait' && force))) {
      jcrop.release()
      setTimeout(() => {
        chrome.runtime.sendMessage({
          message: 'capture', area: selection, dpr: devicePixelRatio
        }, (res) => {
          overlay(false)
          selection = null
          save(res.image, config.format)
        })
      }, 50)
    }
    else if (config.method === 'view') {
      chrome.runtime.sendMessage({
        message: 'capture',
        area: {x: 0, y: 0, w: innerWidth, h: innerHeight}, dpr: devicePixelRatio
      }, (res) => {
        overlay(false)
        save(res.image, config.format)
      })
    }
  })
}

var filename = (format) => {
  var pad = (n) => (n = n + '', n.length >= 2 ? n : `0${n}`)
  var ext = (format) => format === 'jpeg' ? 'jpg' : format === 'png' ? 'png' : 'png'
  var timestamp = (now) =>
    [pad(now.getFullYear()), pad(now.getMonth() + 1), pad(now.getDate())].join('-')
    + ' - ' +
    [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('-')
  return `Postcard Capture - ${timestamp(new Date())}.${ext(format)}`
}

var save = (image, format) => {


  console.log(image)
  var img = document.createElement('img')
  img.src = image;
  img.id="postimage";
  // var link = document.createElement('a')
  // link.download = filename(format)
  // link.href = image
  // link.click()
  var overlay = document.createElement("div");
  var underlay = document.createElement("div");
  underlay.id = "postcard-underlay"

  overlay.id = "postcard-overlay"


  overlay.innerHTML = `<div id="container">
  <h1>Make your Postcard! </h1>
  <div class="card" id="card">
    <div class="front face" id="three-contain">
      <div id="postcard-image-container">
      </div>
    </div>
    <div class="back face" id="cardback">
    <div class="messagebox"></div>
      <div class="vert-ruler"></div>
      <div class="address">
            <p id="insert-url">From: </p>
        <form>
            <input type="text" />
            <input type="text" />
            <input type="text" />
            <input type="text" />
            <input type="text" />
        </form>
      </div>
    </div>
    <div id="flip">flip</div>
  </div>

  <div id="options">
  </div>
</div>`

document.body.appendChild(overlay)

document.getElementById("flip").addEventListener("click", function(e){
     document.getElementById("card").classList.toggle("flipped");
});

var close = document.createElement('img');
close.src = chrome.runtime.getURL('/images/close.svg');
close.id = "close-button";

var stamp = document.createElement('img');
stamp.src = chrome.runtime.getURL('/images/stamp.png');
stamp.id = "stamp";
var cardback = document.getElementById("cardback");
cardback.appendChild(stamp);

overlay.appendChild(close);

var send = document.createElement('img');
send.src = chrome.runtime.getURL('/images/send.svg');

send.addEventListener('click', ()=>{
  
  alert("printing is not available yet :(");
  //   var three_canvas = document.getElementById("threecan");
  //   var bg = document.getElementById("postimage");
  //
  //   var new_canvas = document.createElement('CANVAS');
  //
  //   var can_wid = 600;
  //   var can_hei = 400;
  //
  //   new_canvas.width = can_wid;
  //   new_canvas.height = can_hei;
  //
  //   var ctx = new_canvas.getContext('2d');
  //
  //   ctx.drawImage(bg, 0, 0, 400, 600);
  //   ctx.drawImage(three_canvas, 0, 0, can_wid, can_hei);
  //
  //
  // var d=new_canvas.toDataURL("image/png");
  // var w=window.open('about:blank','image from canvas');
  // w.document.write("<img src='"+d+"' alt='from canvas'/>");
});

// var sadface = document.createElement('img');
// sadface.src = chrome.runtime.getURL('/images/sadface.svg');

var wordart = document.createElement('img');
wordart.src = chrome.runtime.getURL('/images/wordart.svg');

var options = document.getElementById("options");
options.appendChild(send);
//options.appendChild(sadface);
options.appendChild(wordart);


document.getElementById("postcard-image-container").appendChild(img)

document.body.appendChild(underlay)

var headHTML = document.getElementsByTagName('head')[0].innerHTML;
headHTML += '<link href="https://fonts.googleapis.com/css?family=Pacifico" rel="stylesheet"><link href="https://fonts.googleapis.com/css?family=Kalam" rel="stylesheet">';
document.getElementsByTagName('head')[0].innerHTML = headHTML;
document.getElementById("insert-url").innerHTML = "From: " + window.location.href;

  //
  // document.getElementsByTagName('head')[0].appendChild(script);

  close.addEventListener('click', () => {
    overlay.remove();
    underlay.remove();
  })

  wordart.addEventListener('click', make_three_js);

}

window.addEventListener('resize', ((timeout) => () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    jcrop.destroy()
    init(() => overlay(null))
  }, 100)
})())

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === 'init') {
    res({}) // prevent re-injecting

    if (!jcrop) {
      image(() => init(() => {
        overlay()
        capture()
      }))
    }
    else {
      overlay()
      capture(true)
    }
  }
  return true
})

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

function decimalToHex( d ) {

    var hex = Number( d ).toString( 16 );
    hex = "000000".substr( 0, 6 - hex.length ) + hex;
    return hex.toUpperCase();

}

function make_three_js(){

  let three = document.getElementById("three-contain");
  let threeHTML = three.innerHTML;
  three.innerHTML = (threeHTML + '<p id="greetings">greetings from</p><p id="wish">wish you were here</p>');


  var script2 = document.createElement('script');
  script2.type = 'text/javascript';
  script2.src = chrome.runtime.getURL('/build/threejs/build/three.js');
  document.getElementsByTagName('head')[0].appendChild(script2);

  var script1 = document.createElement('script');
  script1.type = 'text/javascript';
  script1.src = chrome.runtime.getURL('/build/threejs/js/GeometryUtils.js');
  document.getElementsByTagName('head')[0].appendChild(script1);

  var script3 = document.createElement('script');
  script3.type = 'text/javascript';
  script3.src = chrome.runtime.getURL('/build/threejs/js/WebGL.js');
  document.getElementsByTagName('head')[0].appendChild(script3);

  var script4 = document.createElement('script');
  script4.type = 'text/javascript';
  script4.src = chrome.runtime.getURL('/build/threejs/js/SVGLoader.js');
  document.getElementsByTagName('head')[0].appendChild(script4);

  var script5 = document.createElement('script');
  script5.type = 'text/javascript';
  script5.src = chrome.runtime.getURL('/build/threejs/js/stats.min.js');
  document.getElementsByTagName('head')[0].appendChild(script5);

  let msg = window.location.href;
  msg = msg.substring(msg.indexOf("://") + 3)
  if(msg.indexOf("www.") >= 0){
    msg = msg.substring(msg.indexOf("www.") + 4)
  }
  if(msg.indexOf(".") >= 0){
    msg = msg.substring(0, msg.indexOf("."))
  }
  if (msg.length > 6){
    msg = msg.substring(0, 6);
  }
  text = msg;

  // if ( WEBGL.isWebGLAvailable() === false ) {
  //       document.body.appendChild( WEBGL.getWebGLErrorMessage() );
  //       return;
  // }

  three_init();
  animate();
}

function three_init() {

    container = document.createElement( 'div' );
    container.id = "threejs";
    document.getElementById("three-contain").appendChild( container );

    permalink = document.getElementById( "permalink" );

    textureLoader = new THREE.TextureLoader();
    let results = document.getElementsByTagName("img");
    console.log(results, results.length);
    var firstImage;
    if(results.length != 0){
      firstImage = results[Math.floor(results.length/2)].src;
    } else {
      firstImage = chrome.runtime.getURL("/build/threejs/textures/cabbage.png");
    }

    texture = textureLoader.load( firstImage, function(tex){
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set( 0.001, 0.001);
        tex.anisotropy = 1;
    } );

    afterTextureLoaded(texture);

}

function afterTextureLoaded(tex){
                // CAMERA

  var wid = 580;
  var hei = 410;

  camera = new THREE.PerspectiveCamera( 30, wid / hei, 1, 1500 );
  camera.position.set( 0, 200, 900 );

  cameraTarget = new THREE.Vector3( 0, 150, 0 );

  // SCENE

  scene = new THREE.Scene();
  // scene.background = new THREE.Color( 0x00000000 );
  // LIGHTS

  var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.position.set( 0, 0, 1 ).normalize();
  scene.add( dirLight );

  var pointLight = new THREE.PointLight( 0xffffff, 1 );
  pointLight.position.set( 0, 100, 90 );
  scene.add( pointLight );

  var ambientLight = new THREE.AmbientLight( 0xffffff );
  ambientLight.position.set( 0, 100, 90 );
  scene.add( ambientLight );

  console.log("texture is: ", texture);
  var texture1 = textureLoader.load( chrome.runtime.getURL("/build/threejs/textures/lingscars.png") );
  material1 = new THREE.MeshBasicMaterial( { map: texture });

  materials = [
      material1,
      new THREE.MeshStandardMaterial( { color: 0xff0000 } ) // side
  ];

  group = new THREE.Group();
  group.position.y = 100;

  group_container = new THREE.Group();

  group_container.add(group);
  scene.add( group_container );

  loadFont();


  // RENDERER

  renderer = new THREE.WebGLRenderer( { alpha:true} );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  renderer.domElement.id = "threecan";
  //renderer.setClearColor( 0x000000, 0 ); // the default

  // STATS

  stats = new Stats();
  //container.appendChild( stats.dom );

  // EVENTS

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function boolToNum( b ) {
    return b ? 1 : 0;
}

function updatePermalink() {
    return;
}

function onDocumentKeyDown( event ) {
    if ( firstLetter ) {
        firstLetter = false;
        text = "";
    }

    var keyCode = event.keyCode;
    // backspace
    if ( keyCode == 8 ) {

        event.preventDefault();
        text = text.substring( 0, text.length - 1 );
        refreshText();
        return false;
    }
}

function onDocumentKeyPress( event ) {

    var keyCode = event.which;

    // backspace

    if ( keyCode == 8 ) {

        event.preventDefault();

    } else {

        var ch = String.fromCharCode( keyCode );
        text += ch;

        refreshText();

    }

}

function loadFont() {

    var loader = new THREE.FontLoader();
    loader.load( chrome.runtime.getURL('/build/threejs/fonts/Erica_One_Regular.json'), function ( response ) {

        font = response;

        refreshText();

    } );

}

function createText() {

    textGeo = new THREE.TextGeometry( text, {

        font: font,

        size: size,
        height: height,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    } );

    var shapes = font.generateShapes( text, 120 );
    stroke_vertices = [];

    var geometry = new THREE.ShapeGeometry( shapes );
        geometry.computeBoundingBox();
        xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        geometry.translate( xMid, 0, 0 );
        // make shape ( N.B. edge view not visible )
        text = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
        text.position.z = - 150;
        //scene.add( text );
        // make line shape ( N.B. edge view remains visible )
        var holeShapes = [];
        for ( var i = 0; i < shapes.length; i ++ ) {
            var shape = shapes[ i ];
            if ( shape.holes && shape.holes.length > 0 ) {
                for ( var j = 0; j < shape.holes.length; j ++ ) {
                    var hole = shape.holes[ j ];
                    holeShapes.push( hole );
                }
            }
        }
        shapes.push.apply( shapes, holeShapes );
        var color = new THREE.Color( 0x006699 );
        var style = THREE.SVGLoader.getStrokeStyle( 3, color.getStyle() );
        var strokeText = new THREE.Group();
        for ( var i = 0; i < shapes.length; i ++ ) {
            var shape = shapes[ i ];
            var points = shape.getPoints();
            var geometry = THREE.SVGLoader.pointsToStroke( points, style );
            stroke_vertices = stroke_vertices.concat(geometry.attributes.position.array);
            geometry.translate( 0, 0, 70.5 );
            console.log(geometry);
            var strokeMesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
            strokeText.add( strokeMesh );
        }
        group.add( strokeText );

        console.log(stroke_vertices);
    textGeo.computeBoundingBox();

    // console.log(strokeText);
    var amp = 20.0;
    var freq = 60.0;
    var shift = 0.5;
    for(var i = 0; i < stroke_vertices.length; i++){

        for(var j = 1; j < stroke_vertices[i].length; j = j + 3){
            //console.log(stroke_vertices[i][j]);
            var vx = stroke_vertices[i][j - 1];
            stroke_vertices[i][j] += amp * Math.sin(vx/freq + shift);
        }
    }


    textGeo.computeVertexNormals();

    var vert = textGeo.vertices;
    var stroke_vert = geometry.vertices;

    for(var i = 0; i < vert.length; i++){
        let v = vert[i];
        v.y += amp*Math.sin(v.x/freq + shift);
    }
    // for(var i = 0; i < stroke_vert.length; i++){
    //  let v = stroke_vert[i];
    //  v.y += 10*Math.cos(v.x/50.0);
    // }
    // geometry.verticesNeedUpdate = true;
    textGeo.verticesNeedUpdate = true;

    // "fix" side normals by removing z-component of normals for side faces
    // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

    if ( ! bevelEnabled ) {

        var triangleAreaHeuristics = 0.1 * ( height * size );

        for ( var i = 0; i < textGeo.faces.length; i ++ ) {

            var face = textGeo.faces[ i ];

            if ( face.materialIndex == 1 ) {

                for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

                    face.vertexNormals[ j ].z = 0;
                    face.vertexNormals[ j ].normalize();

                }

                var va = textGeo.vertices[ face.a ];
                var vb = textGeo.vertices[ face.b ];
                var vc = textGeo.vertices[ face.c ];

                var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

                if ( s > triangleAreaHeuristics ) {

                    for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

                        face.vertexNormals[ j ].copy( face.normal );

                    }

                }

            }

        }

    }

    var centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

    textGeo = new THREE.BufferGeometry().fromGeometry( textGeo );

    textMesh1 = new THREE.Mesh( textGeo, materials );

    textMesh1.position.x = 0;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    // var cube = new THREE.Mesh( geometry, material );
    // group.add( cube );

    group.add( textMesh1 );
    group.position.set(centerOffset, 0, 0);

}

function refreshText() {

    updatePermalink();

    group.remove( textMesh1 );
    if ( mirror ) group.remove( textMesh2 );

    if ( ! text ) return;

    createText();

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'mouseout', onDocumentMouseOut, false );

    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

    mouseXOnMouseDown_z = event.clientY - windowHalfY;
    targetRotationOnMouseDown_z = targetRotation_z;

}

function onDocumentMouseMove( event ) {

    mouseX = event.clientX - windowHalfX;

    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;


    mouseY = event.clientY - windowHalfY;

    targetRotation_z = targetRotationOnMouseDown_z + ( mouseY - mouseYOnMouseDown ) * 0.02;

}

function onDocumentMouseUp() {

    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseOut() {

    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentTouchStart( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;

    }

}

function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

    }

}

//

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}


function render() {

    group_container.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

    group_container.rotation.y = group_container.rotation.y.clamp(-0.25, 0.25);

    // group_container.rotation.z += ( targetRotation_z - group.rotation.z ) * 0.05;

    // group_container.rotation.z = group_container.rotation.z.clamp(-0.5, 0.5);

    camera.lookAt( cameraTarget );

    renderer.clear();
    renderer.render( scene, camera );

}
