(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var webgl_google_utils_1 = require("./webgl-google-utils");

var webgl_matrix_1 = require("./webgl-matrix");

var webgl_utils_1 = require("./webgl-utils");

var gl;
var attribs = {};
var uniforms = {};
var arraysToDraw = 0;
var viewMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
var modelMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
var modelViewMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
var perspectiveMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
var mvpMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
webgl_matrix_1.mat4.perspective(perspectiveMatrix, webgl_google_utils_1.degToRad(60), 1, 0.1, 100);

var generateCircleVertices = function generateCircleVertices(radius, accuracy) {
  var angle = 360 / accuracy * (Math.PI / 180);
  var vertices = [];

  for (var i = 0; i < accuracy; i += 1) {
    var x = radius * Math.cos(angle * i);
    var y = radius * Math.sin(angle * i);
    vertices.push(x, y);
  }

  return vertices;
};

var generateSphereVertices = function generateSphereVertices(radius, accuracy) {
  var n = accuracy;
  var vertices = [];

  function getCoords(alpha, phi) {
    var coords = [];
    var x = radius * Math.cos(phi) * Math.sin(alpha);
    var y = radius * Math.cos(alpha);
    var z = -1 * +(Math.sin(phi) * Math.sin(alpha));
    coords.push(x, y, z);
    return coords;
  }

  function getTriangle(alpha1, alpha2, phi1, phi2) {
    var left = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var triangle = [];
    var a;
    var b;
    var c;

    if (left) {
      a = getCoords(alpha1, phi2);
      b = getCoords(alpha2, phi1);
      c = getCoords(alpha1, phi1);
    } else {
      a = getCoords(alpha1, phi2);
      b = getCoords(alpha2, phi2);
      c = getCoords(alpha2, phi1);
    }

    triangle.push.apply(triangle, _toConsumableArray(a).concat(_toConsumableArray(b), _toConsumableArray(c)));
    return triangle;
  }

  for (var j = 0; j < n; j += 1) {
    var phi1 = 2 * Math.PI * j / n;
    var phi2 = 2 * Math.PI * (j + 1) / n;

    for (var i = 0; i < n; i += 1) {
      var alpha1 = Math.PI * i / n;
      var alpha2 = Math.PI * (i + 1) / n;

      if (i === 0) {
        vertices.push.apply(vertices, _toConsumableArray(getTriangle(alpha1, alpha2, phi1, phi2)));
        continue;
      } else if (i === n - 1) {
        vertices.push.apply(vertices, _toConsumableArray(getTriangle(alpha1, alpha2, phi1, phi2, true)));
        continue;
      }

      vertices.push.apply(vertices, _toConsumableArray(getTriangle(alpha1, alpha2, phi1, phi2, true)));
      vertices.push.apply(vertices, _toConsumableArray(getTriangle(alpha1, alpha2, phi1, phi2)));
    }
  }

  return vertices;
};

var $ = function $(selector, qs) {
  if (!qs) return document.getElementById(selector);
  return document.querySelector(selector);
};

var scene = {
  modelRotateX: {
    elem: $('modelRotateX'),
    value: 0
  },
  modelRotateY: {
    elem: $('modelRotateY'),
    value: 0
  },
  modelRotateZ: {
    elem: $('modelRotateZ'),
    value: 0
  },
  modelTranslateX: {
    elem: $('modelTranslateX'),
    value: 0
  },
  modelTranslateY: {
    elem: $('modelTranslateY'),
    value: 0
  },
  modelTranslateZ: {
    elem: $('modelTranslateZ'),
    value: 0
  },
  cameraX: {
    elem: $('cameraX'),
    value: 0
  },
  cameraY: {
    elem: $('cameraY'),
    value: 0
  },
  cameraZ: {
    elem: $('cameraZ'),
    value: 0
  }
};
var fpsCounter = $('fps-counter');
var frameCounter = $('frame-counter');
var timeCounter = $('time-counter');

var initShaders = function initShaders(resolve, reject) {
  var fShader = new Promise(function (res, rej) {
    return webgl_utils_1.createShader(gl, 'fragment-shader', res, rej);
  });
  var vShader = new Promise(function (res, rej) {
    return webgl_utils_1.createShader(gl, 'vertex-shader', res, rej);
  });
  Promise.all([fShader, vShader]).then(function (shaders) {
    gl.program = webgl_utils_1.createProgram(gl, shaders);
    gl.useProgram(gl.program);
    resolve();
  });
};

var initVariables = function initVariables() {
  attribs.aPosition = gl.getAttribLocation(gl.program, 'a_Position');
  uniforms.uMvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  uniforms.uModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  uniforms.uHeight = gl.getUniformLocation(gl.program, 'u_Height');
  uniforms.uWidth = gl.getUniformLocation(gl.program, 'u_Width');
};

var initTextures = function initTextures() {
  return true;
};

var initBuffer = function initBuffer() {
  var vertices = new Float32Array(_toConsumableArray(generateSphereVertices(1, 100)));
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribs.aPosition);
  arraysToDraw = vertices.length / 3;
};

var drawScene = function drawScene() {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var camera = webgl_matrix_1.vec3.fromValues(scene.cameraX.value, scene.cameraY.value, scene.cameraZ.value);
  var center = webgl_matrix_1.vec3.fromValues(0, 0, 0);
  var up = webgl_matrix_1.vec3.fromValues(0, 1, 0);
  webgl_matrix_1.mat4.lookAt(viewMatrix, camera, center, up);
  webgl_matrix_1.mat4.identity(modelMatrix);
  webgl_matrix_1.mat4.translate(modelMatrix, modelMatrix, webgl_matrix_1.vec3.fromValues(scene.modelTranslateX.value, scene.modelTranslateY.value, scene.modelTranslateZ.value));
  webgl_matrix_1.mat4.rotateX(modelMatrix, modelMatrix, webgl_google_utils_1.degToRad(scene.modelRotateX.value));
  webgl_matrix_1.mat4.rotateY(modelMatrix, modelMatrix, webgl_google_utils_1.degToRad(scene.modelRotateY.value));
  webgl_matrix_1.mat4.rotateZ(modelMatrix, modelMatrix, webgl_google_utils_1.degToRad(scene.modelRotateZ.value));
  webgl_matrix_1.mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
  webgl_matrix_1.mat4.mul(mvpMatrix, perspectiveMatrix, modelViewMatrix);
  gl.uniformMatrix4fv(uniforms.uMvpMatrix, false, mvpMatrix);
  gl.uniformMatrix4fv(uniforms.uModelMatrix, false, modelMatrix);
  gl.uniform1f(uniforms.uWidth, gl.drawingBufferWidth);
  gl.uniform1f(uniforms.uHeight, gl.drawingBufferHeight);
  gl.drawArrays(gl.TRIANGLES, 0, arraysToDraw);
};

var lastTime = 0;
var frames = 0;
var fps;

var render = function render() {
  var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  fps = 1000 / (time - lastTime);
  fpsCounter.textContent = fps.toFixed(0);
  frameCounter.textContent = ++frames + '';
  timeCounter.textContent = (time / 1000).toFixed(2);
  lastTime = time;
  window.requestAnimationFrame(render);
  drawScene();
};

var webGLStart = function webGLStart() {
  var canvas = $('canvas');
  var powerPreference = 'default' || 'high-performance' || 'low-power';
  gl = webgl_google_utils_1.default.setupWebGL(canvas, {
    alpha: true,
    depth: true,
    powerPreference: powerPreference
  });
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  webgl_utils_1.resizeCanvasToDisplaySize(gl.canvas);
  var promiseShader = new Promise(function (res, rej) {
    return initShaders(res, rej);
  });
  promiseShader.then(function () {
    return initVariables();
  }).then(function () {
    return initTextures();
  }).then(function () {
    return initBuffer();
  }).then(function () {
    return render();
  }).catch(function (error) {
    return console.error(error);
  });
}; // TODO Smooth animation
// const animate = function(duration: number, from: number, to: number): void {
// 	const easing = bezier(0.215, 0.61, 0.355, 1.0)
// 	const iterations: number = 60 / (duration / 1000)
// 	const step: number = 1 / iterations
// 	for (let i: number = 0; i <= iterations; i += 1) {
// 		(to - from) * easing(step * i) + from
// 	}
// }


var updateInfobar = function updateInfobar(elem) {
  elem.innerHTML = scene[elem.id].value.toFixed(2);
};

var setCanvasControls = function setCanvasControls() {
  var isRotatable = false;
  gl.canvas.addEventListener('mousedown', function (e) {
    return isRotatable = true;
  });
  gl.canvas.addEventListener('mouseup', function (e) {
    return isRotatable = false;
  });
  gl.canvas.addEventListener('mousemove', function (e) {
    if (!isRotatable) return false;

    if (e.shiftKey) {
      scene.modelTranslateX.value += 10 * (e.movementX / gl.drawingBufferWidth);
      scene.modelTranslateY.value -= 10 * (e.movementY / gl.drawingBufferWidth);
      updateInfobar(scene.modelTranslateX.elem);
      updateInfobar(scene.modelTranslateY.elem);
      return;
    }

    scene.modelRotateX.value += e.movementY / 3;
    scene.modelRotateY.value += e.movementX / 3;
    updateInfobar(scene.modelRotateX.elem);
    updateInfobar(scene.modelRotateY.elem);
  });
  gl.canvas.addEventListener('wheel', function (e) {
    var direction = e.deltaY < 0 ? -0.15 : 0.15;
    if (e.shiftKey) direction *= 3;
    scene.cameraZ.value += direction;
    updateInfobar(scene.cameraZ.elem);
  });
};

window.onload = function () {
  for (var key in scene) {
    if (scene.hasOwnProperty(key)) {
      scene[key].value = +parseFloat(scene[key].elem.innerHTML);
    }
  }

  webGLStart();
  setCanvasControls();
};

window.addEventListener('resize', function (e) {
  return webgl_utils_1.resizeCanvasToDisplaySize(gl.canvas);
});

},{"./webgl-google-utils":2,"./webgl-matrix":3,"./webgl-utils":4}],2:[function(require,module,exports){
"use strict";
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Modified by Alex Garneau - Feb 2, 2012 - gskinner.com inc.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

function getPositionFromMatrix(matrix) {
  return {
    x: matrix[12],
    y: matrix[13],
    z: matrix[14]
  };
}

exports.getPositionFromMatrix = getPositionFromMatrix;

function getRotationFromMatrix(matrix) {
  return {
    x: Math.asin(matrix[6]),
    y: Math.asin(matrix[8]),
    z: Math.asin(matrix[1])
  };
}

exports.getRotationFromMatrix = getRotationFromMatrix;

function degToRad(degrees) {
  return parseFloat(degrees) * Math.PI / 180;
}

exports.degToRad = degToRad;

function getMousePosition(event) {
  return {
    x: event.offsetX,
    y: event.offsetY
  };
}

exports.getMousePosition = getMousePosition;

function getNodeFromMouse(canvas, mouse, gridSize, GRID_WIDTH, GRID_HEIGHT) {
  // We're getting it in this format: left=0, right=gridSize. Same with top and bottom.
  // First, let's see what the grid looks like compared to the canvas.
  // Its borders will always be touching whichever part's thinner: the width or the height.
  var middleCanvas = {
    x: canvas.width / 2,
    y: canvas.height / 2
  };
  var pos = {
    x: gridSize * (mouse.x - (middleCanvas.x - GRID_WIDTH * 0.5)) / GRID_WIDTH,
    y: gridSize * (mouse.y - (middleCanvas.y - GRID_HEIGHT * 0.5)) / GRID_HEIGHT
  };

  if (pos.x >= 0 && pos.x <= gridSize && pos.y >= 0 && pos.y <= gridSize) {
    var item = {
      x: pos.x | 0,
      y: pos.y | 0
    };
    return item;
  } else {
    return null;
  }
}

exports.getNodeFromMouse = getNodeFromMouse;

function getCoordinateFromMouse(canvas, mouse, gridSize, GRID_WIDTH, GRID_HEIGHT) {
  // We're getting it in this format: left=0, right=gridSize. Same with top and bottom.
  // First, let's see what the grid looks like compared to the canvas.
  // Its borders will always be touching whichever part's thinner: the width or the height.
  var middleCanvas = {
    x: canvas.width,
    y: canvas.height
  };
  var pos = {
    x: gridSize * (mouse.x - (middleCanvas.x - GRID_WIDTH * 0.5)) / GRID_WIDTH,
    y: gridSize * (mouse.y - (middleCanvas.y - GRID_HEIGHT * 0.5)) / GRID_HEIGHT
  };
  return pos;
}

exports.getCoordinateFromMouse = getCoordinateFromMouse;
/*
 * When an image is loaded, this will store it in the shader to be used by the sampler references.
 * For example, to use the texture stored at TEXTURE0, you set the sampler to 0.
 */

function addTexture(gl, imageURL, glTexture) {
  function isPowerOf2(value) {
    if ((value & value - 1) === 0) {
      return true;
    }
  }

  var texture = gl.createTexture();
  texture.image = new Image();

  texture.image.onload = function () {
    gl.activeTexture(glTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image); // This clamps images whose dimensions are not a power of 2, letting you use images of any size.

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  texture.image.src = imageURL;
  return texture;
}

exports.addTexture = addTexture;

function ease(from, to, easiness) {
  if (easiness > 1) {
    easiness = 1 / easiness;
  }

  return (to - from) * easiness;
}

exports.ease = ease;

function displayAlertMatrix(matrix) {
  var testString = '';

  for (var i = 0, l = matrix.length; i < l; i++) {
    if (i % 4 === 0 && i > 0) {
      testString += '\n';
    }

    testString += matrix[i] + ', ';
  }

  testString += '';
  alert(testString);
}

exports.displayAlertMatrix = displayAlertMatrix;

function addVectors(vec1, vec2) {
  for (var i = 0, l = vec1.length; i < l; i++) {
    if (vec2[i]) {
      vec1[i] += vec2[i];
    }
  }

  return vec1;
}

exports.addVectors = addVectors;

function subtractVectors(vec1, vec2) {
  for (var i = 0, l = vec1.length; i < l; i++) {
    if (vec2[i]) {
      vec1[i] -= vec2[i];
    }
  }

  return vec1;
}

exports.subtractVectors = subtractVectors;

function inverseVector(vec) {
  for (var i = 0, l = vec.length; i < l; i++) {
    vec[i] = 1 - Math.abs(vec[i]);
  }

  return vec;
}

exports.inverseVector = inverseVector;

function alertMat4(mat) {
  var string = '[';

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      string += Math.round(mat[i * 4 + j]).toString() + ', \t';
    }

    string += '\n';
  }

  string += ']';
  alert(string);
}

exports.alertMat4 = alertMat4;

function Float32Concat(original, addition) {
  if (!original) {
    return addition;
  }

  var length = original.length;
  var totalLength = length + addition.length;
  var result = new Float32Array(totalLength);
  result.set(original);
  result.set(addition, length);
  return result;
}

exports.Float32Concat = Float32Concat;
var totalTimePassed = 0;
var lastTimePassed = 0;

function ConsoleTimePassed(message) {
  totalTimePassed = new Date().getTime();
  console.log(message + ': ' + (totalTimePassed - lastTimePassed));
  lastTimePassed = totalTimePassed;
}

exports.ConsoleTimePassed = ConsoleTimePassed;

function easeNormalVec(vec) {
  vec[0] += (1 - vec[0]) / 2;
  vec[1] += (1 - vec[1]) / 2;
  vec[2] += (1 - vec[2]) / 2;
  return vec;
}

exports.easeNormalVec = easeNormalVec;

function getBetweenVec(min, range) {
  var vec = [0, 0, 0];
  vec[0] = Math.random() * range[0] + min[0];
  vec[1] = Math.random() * range[1] + min[1];
  vec[2] = Math.random() * range[2] + min[2];
  return vec;
}

exports.getBetweenVec = getBetweenVec;

function normalize(vec) {
  var i = 0;
  var total = 0;
  var l = vec.length;

  for (i = 0; i < l; i++) {
    total += vec[i];
  }

  for (i = 0; i < l; i++) {
    vec[i] /= total;
  }

  return vec;
}

exports.normalize = normalize;

var WebGLUtils = function () {
  /**
   * Creates the HTLM for a failure message
   * @param {string} canvasContainerId id of container of th
   *        canvas.
   * @return {string} The html.
   */
  var makeFailHTML = function makeFailHTML(msg) {
    return '' + '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' + '<td align="center">' + '<div style="display: table-cell; vertical-align: middle;">' + '<div style="">' + msg + '</div>' + '</div>' + '</td></tr></table>';
  };
  /**
   * Mesasge for getting a webgl browser
   * @type {string}
   */


  var GET_A_WEBGL_BROWSER = '' + 'This page requires a browser that supports WebGL.<br/>' + '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
  /**
   * Mesasge for need better hardware
   * @type {string}
   */

  var OTHER_PROBLEM = "It doesn't appear your computer can support WebGL.<br/>\n\t\t<a href=\"http://get.webgl.org/troubleshooting/\">Click here for more information.</a>";
  /**
   * Creates a webgl context. If creation fails it will
   * change the contents of the container of the <canvas>
   * tag to an error message with the correct links for WebGL.
   * @param {HTMLCanvasElement} canvas. The canvas element to create a
   *     context from.
   * @param {WebGLContextCreationAttirbutes} opt_attribs Any
   *     creation attributes you want to pass in.
   * @param {function:(msg)} opt_onError An function to call
   *     if there is an error during creation.
   * @return {WebGLRenderingContext} The created context.
   */

  var setupWebGL = function setupWebGL(canvas, opt_attribs, opt_onError) {
    function handleCreationError(msg) {
      var container = canvas.parentNode;

      if (container) {
        var str = window.WebGLRenderingContext ? OTHER_PROBLEM : GET_A_WEBGL_BROWSER;

        if (msg) {
          str += '<br/><br/>Status: ' + msg;
        }

        container.textContent = makeFailHTML(str);
      }
    }

    opt_onError = opt_onError || handleCreationError;

    if (canvas.addEventListener) {
      canvas.addEventListener('webglcontextcreationerror', function (event) {
        return opt_onError(event.statusMessage);
      });
    }

    var context = create3DContext(canvas, opt_attribs);

    if (!context) {
      if (!window.WebGLRenderingContext) {
        opt_onError('');
      }
    }

    return context;
  };
  /**
   * Creates a webgl context.
   * @param {!Canvas} canvas The canvas tag to get context
   *     from. If one is not passed in one will be created.
   * @return {!WebGLContext} The created context.
   */


  var create3DContext = function create3DContext(canvas, opt_attribs) {
    var names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
    var context = null;

    for (var _i = 0; _i < names.length; _i++) {
      var name = names[_i];

      try {
        context = canvas.getContext(name, opt_attribs);
      } catch (e) {
        console.error(e);
      }

      if (context) {
        break;
      }
    }

    return context;
  };

  return {
    setupWebGL: setupWebGL,
    create3DContext: create3DContext
  };
}();

window.requestAnimationFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 15);
  };
}();

exports.default = WebGLUtils;

},{}],3:[function(require,module,exports){
/*!
@fileoverview gl-matrix - High performance matrix and vector operations
@author Brandon Jones
@author Colin MacKenzie IV
@version 3.0.0

Copyright (c) 2015-2019, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
;
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports)
        : typeof define === 'function' && define.amd
            ? define(['exports'], factory)
            : factory((global.glMatrix = {}));
})(this, function (exports) {
    'use strict';
    /**
     * Common utilities
     * @module glMatrix
     */
    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    var RANDOM = Math.random;
    /**
     * Sets the type of array used when creating new vectors and matrices
     *
     * @param {Type} type Array type, such as Float32Array or Array
     */
    function setMatrixArrayType(type) {
        ARRAY_TYPE = type;
    }
    var degree = Math.PI / 180;
    /**
     * Convert Degree To Radian
     *
     * @param {Number} a Angle in Degrees
     */
    function toRadian(a) {
        return a * degree;
    }
    /**
     * Tests whether or not the arguments have approximately the same value, within an absolute
     * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
     * than or equal to 1.0, and a relative tolerance is used for larger values)
     *
     * @param {Number} a The first number to test.
     * @param {Number} b The second number to test.
     * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
     */
    function equals(a, b) {
        return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
    }
    var common = /*#__PURE__*/ Object.freeze({
        EPSILON: EPSILON,
        get ARRAY_TYPE() {
            return ARRAY_TYPE;
        },
        RANDOM: RANDOM,
        setMatrixArrayType: setMatrixArrayType,
        toRadian: toRadian,
        equals: equals,
    });
    /**
     * 2x2 Matrix
     * @module mat2
     */
    /**
     * Creates a new identity mat2
     *
     * @returns {mat2} a new 2x2 matrix
     */
    function create() {
        var out = new ARRAY_TYPE(4);
        if (ARRAY_TYPE != Float32Array) {
            out[1] = 0;
            out[2] = 0;
        }
        out[0] = 1;
        out[3] = 1;
        return out;
    }
    /**
     * Creates a new mat2 initialized with values from an existing matrix
     *
     * @param {mat2} a matrix to clone
     * @returns {mat2} a new 2x2 matrix
     */
    function clone(a) {
        var out = new ARRAY_TYPE(4);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    /**
     * Copy the values from one mat2 to another
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the source matrix
     * @returns {mat2} out
     */
    function copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    /**
     * Set a mat2 to the identity matrix
     *
     * @param {mat2} out the receiving matrix
     * @returns {mat2} out
     */
    function identity(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
    }
    /**
     * Create a new mat2 with the given values
     *
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m10 Component in column 1, row 0 position (index 2)
     * @param {Number} m11 Component in column 1, row 1 position (index 3)
     * @returns {mat2} out A new 2x2 matrix
     */
    function fromValues(m00, m01, m10, m11) {
        var out = new ARRAY_TYPE(4);
        out[0] = m00;
        out[1] = m01;
        out[2] = m10;
        out[3] = m11;
        return out;
    }
    /**
     * Set the components of a mat2 to the given values
     *
     * @param {mat2} out the receiving matrix
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m10 Component in column 1, row 0 position (index 2)
     * @param {Number} m11 Component in column 1, row 1 position (index 3)
     * @returns {mat2} out
     */
    function set(out, m00, m01, m10, m11) {
        out[0] = m00;
        out[1] = m01;
        out[2] = m10;
        out[3] = m11;
        return out;
    }
    /**
     * Transpose the values of a mat2
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the source matrix
     * @returns {mat2} out
     */
    function transpose(out, a) {
        // If we are transposing ourselves we can skip a few steps but have to cache
        // some values
        if (out === a) {
            var a1 = a[1];
            out[1] = a[2];
            out[2] = a1;
        }
        else {
            out[0] = a[0];
            out[1] = a[2];
            out[2] = a[1];
            out[3] = a[3];
        }
        return out;
    }
    /**
     * Inverts a mat2
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the source matrix
     * @returns {mat2} out
     */
    function invert(out, a) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3]; // Calculate the determinant
        var det = a0 * a3 - a2 * a1;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = a3 * det;
        out[1] = -a1 * det;
        out[2] = -a2 * det;
        out[3] = a0 * det;
        return out;
    }
    /**
     * Calculates the adjugate of a mat2
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the source matrix
     * @returns {mat2} out
     */
    function adjoint(out, a) {
        // Caching this value is nessecary if out == a
        var a0 = a[0];
        out[0] = a[3];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a0;
        return out;
    }
    /**
     * Calculates the determinant of a mat2
     *
     * @param {mat2} a the source matrix
     * @returns {Number} determinant of a
     */
    function determinant(a) {
        return a[0] * a[3] - a[2] * a[1];
    }
    /**
     * Multiplies two mat2's
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the first operand
     * @param {mat2} b the second operand
     * @returns {mat2} out
     */
    function multiply(out, a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = a0 * b0 + a2 * b1;
        out[1] = a1 * b0 + a3 * b1;
        out[2] = a0 * b2 + a2 * b3;
        out[3] = a1 * b2 + a3 * b3;
        return out;
    }
    /**
     * Rotates a mat2 by the given angle
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat2} out
     */
    function rotate(out, a, rad) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        out[0] = a0 * c + a2 * s;
        out[1] = a1 * c + a3 * s;
        out[2] = a0 * -s + a2 * c;
        out[3] = a1 * -s + a3 * c;
        return out;
    }
    /**
     * Scales the mat2 by the dimensions in the given vec2
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the matrix to rotate
     * @param {vec2} v the vec2 to scale the matrix by
     * @returns {mat2} out
     **/
    function scale(out, a, v) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        var v0 = v[0], v1 = v[1];
        out[0] = a0 * v0;
        out[1] = a1 * v0;
        out[2] = a2 * v1;
        out[3] = a3 * v1;
        return out;
    }
    /**
     * Creates a matrix from a given angle
     * This is equivalent to (but much faster than):
     *
     *     mat2.identity(dest);
     *     mat2.rotate(dest, dest, rad);
     *
     * @param {mat2} out mat2 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat2} out
     */
    function fromRotation(out, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        out[0] = c;
        out[1] = s;
        out[2] = -s;
        out[3] = c;
        return out;
    }
    /**
     * Creates a matrix from a vector scaling
     * This is equivalent to (but much faster than):
     *
     *     mat2.identity(dest);
     *     mat2.scale(dest, dest, vec);
     *
     * @param {mat2} out mat2 receiving operation result
     * @param {vec2} v Scaling vector
     * @returns {mat2} out
     */
    function fromScaling(out, v) {
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = v[1];
        return out;
    }
    /**
     * Returns a string representation of a mat2
     *
     * @param {mat2} a matrix to represent as a string
     * @returns {String} string representation of the matrix
     */
    function str(a) {
        return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
    }
    /**
     * Returns Frobenius norm of a mat2
     *
     * @param {mat2} a the matrix to calculate Frobenius norm of
     * @returns {Number} Frobenius norm
     */
    function frob(a) {
        return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2));
    }
    /**
     * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
     * @param {mat2} L the lower triangular matrix
     * @param {mat2} D the diagonal matrix
     * @param {mat2} U the upper triangular matrix
     * @param {mat2} a the input matrix to factorize
     */
    function LDU(L, D, U, a) {
        L[2] = a[2] / a[0];
        U[0] = a[0];
        U[1] = a[1];
        U[3] = a[3] - L[2] * U[1];
        return [L, D, U];
    }
    /**
     * Adds two mat2's
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the first operand
     * @param {mat2} b the second operand
     * @returns {mat2} out
     */
    function add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    }
    /**
     * Subtracts matrix b from matrix a
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the first operand
     * @param {mat2} b the second operand
     * @returns {mat2} out
     */
    function subtract(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        return out;
    }
    /**
     * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
     *
     * @param {mat2} a The first matrix.
     * @param {mat2} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    function exactEquals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }
    /**
     * Returns whether or not the matrices have approximately the same elements in the same position.
     *
     * @param {mat2} a The first matrix.
     * @param {mat2} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    function equals$1(a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
    }
    /**
     * Multiply each element of the matrix by a scalar.
     *
     * @param {mat2} out the receiving matrix
     * @param {mat2} a the matrix to scale
     * @param {Number} b amount to scale the matrix's elements by
     * @returns {mat2} out
     */
    function multiplyScalar(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        return out;
    }
    /**
     * Adds two mat2's after multiplying each element of the second operand by a scalar value.
     *
     * @param {mat2} out the receiving vector
     * @param {mat2} a the first operand
     * @param {mat2} b the second operand
     * @param {Number} scale the amount to scale b's elements by before adding
     * @returns {mat2} out
     */
    function multiplyScalarAndAdd(out, a, b, scale) {
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        out[2] = a[2] + b[2] * scale;
        out[3] = a[3] + b[3] * scale;
        return out;
    }
    /**
     * Alias for {@link mat2.multiply}
     * @function
     */
    var mul = multiply;
    /**
     * Alias for {@link mat2.subtract}
     * @function
     */
    var sub = subtract;
    var mat2 = /*#__PURE__*/ Object.freeze({
        create: create,
        clone: clone,
        copy: copy,
        identity: identity,
        fromValues: fromValues,
        set: set,
        transpose: transpose,
        invert: invert,
        adjoint: adjoint,
        determinant: determinant,
        multiply: multiply,
        rotate: rotate,
        scale: scale,
        fromRotation: fromRotation,
        fromScaling: fromScaling,
        str: str,
        frob: frob,
        LDU: LDU,
        add: add,
        subtract: subtract,
        exactEquals: exactEquals,
        equals: equals$1,
        multiplyScalar: multiplyScalar,
        multiplyScalarAndAdd: multiplyScalarAndAdd,
        mul: mul,
        sub: sub,
    });
    /**
     * 2x3 Matrix
     * @module mat2d
     *
     * @description
     * A mat2d contains six elements defined as:
     * <pre>
     * [a, c, tx,
     *  b, d, ty]
     * </pre>
     * This is a short form for the 3x3 matrix:
     * <pre>
     * [a, c, tx,
     *  b, d, ty,
     *  0, 0, 1]
     * </pre>
     * The last row is ignored so the array is shorter and operations are faster.
     */
    /**
     * Creates a new identity mat2d
     *
     * @returns {mat2d} a new 2x3 matrix
     */
    function create$1() {
        var out = new ARRAY_TYPE(6);
        if (ARRAY_TYPE != Float32Array) {
            out[1] = 0;
            out[2] = 0;
            out[4] = 0;
            out[5] = 0;
        }
        out[0] = 1;
        out[3] = 1;
        return out;
    }
    /**
     * Creates a new mat2d initialized with values from an existing matrix
     *
     * @param {mat2d} a matrix to clone
     * @returns {mat2d} a new 2x3 matrix
     */
    function clone$1(a) {
        var out = new ARRAY_TYPE(6);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        return out;
    }
    /**
     * Copy the values from one mat2d to another
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the source matrix
     * @returns {mat2d} out
     */
    function copy$1(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        return out;
    }
    /**
     * Set a mat2d to the identity matrix
     *
     * @param {mat2d} out the receiving matrix
     * @returns {mat2d} out
     */
    function identity$1(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        out[4] = 0;
        out[5] = 0;
        return out;
    }
    /**
     * Create a new mat2d with the given values
     *
     * @param {Number} a Component A (index 0)
     * @param {Number} b Component B (index 1)
     * @param {Number} c Component C (index 2)
     * @param {Number} d Component D (index 3)
     * @param {Number} tx Component TX (index 4)
     * @param {Number} ty Component TY (index 5)
     * @returns {mat2d} A new mat2d
     */
    function fromValues$1(a, b, c, d, tx, ty) {
        var out = new ARRAY_TYPE(6);
        out[0] = a;
        out[1] = b;
        out[2] = c;
        out[3] = d;
        out[4] = tx;
        out[5] = ty;
        return out;
    }
    /**
     * Set the components of a mat2d to the given values
     *
     * @param {mat2d} out the receiving matrix
     * @param {Number} a Component A (index 0)
     * @param {Number} b Component B (index 1)
     * @param {Number} c Component C (index 2)
     * @param {Number} d Component D (index 3)
     * @param {Number} tx Component TX (index 4)
     * @param {Number} ty Component TY (index 5)
     * @returns {mat2d} out
     */
    function set$1(out, a, b, c, d, tx, ty) {
        out[0] = a;
        out[1] = b;
        out[2] = c;
        out[3] = d;
        out[4] = tx;
        out[5] = ty;
        return out;
    }
    /**
     * Inverts a mat2d
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the source matrix
     * @returns {mat2d} out
     */
    function invert$1(out, a) {
        var aa = a[0], ab = a[1], ac = a[2], ad = a[3];
        var atx = a[4], aty = a[5];
        var det = aa * ad - ab * ac;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = ad * det;
        out[1] = -ab * det;
        out[2] = -ac * det;
        out[3] = aa * det;
        out[4] = (ac * aty - ad * atx) * det;
        out[5] = (ab * atx - aa * aty) * det;
        return out;
    }
    /**
     * Calculates the determinant of a mat2d
     *
     * @param {mat2d} a the source matrix
     * @returns {Number} determinant of a
     */
    function determinant$1(a) {
        return a[0] * a[3] - a[1] * a[2];
    }
    /**
     * Multiplies two mat2d's
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the first operand
     * @param {mat2d} b the second operand
     * @returns {mat2d} out
     */
    function multiply$1(out, a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
        out[0] = a0 * b0 + a2 * b1;
        out[1] = a1 * b0 + a3 * b1;
        out[2] = a0 * b2 + a2 * b3;
        out[3] = a1 * b2 + a3 * b3;
        out[4] = a0 * b4 + a2 * b5 + a4;
        out[5] = a1 * b4 + a3 * b5 + a5;
        return out;
    }
    /**
     * Rotates a mat2d by the given angle
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat2d} out
     */
    function rotate$1(out, a, rad) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        out[0] = a0 * c + a2 * s;
        out[1] = a1 * c + a3 * s;
        out[2] = a0 * -s + a2 * c;
        out[3] = a1 * -s + a3 * c;
        out[4] = a4;
        out[5] = a5;
        return out;
    }
    /**
     * Scales the mat2d by the dimensions in the given vec2
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the matrix to translate
     * @param {vec2} v the vec2 to scale the matrix by
     * @returns {mat2d} out
     **/
    function scale$1(out, a, v) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
        var v0 = v[0], v1 = v[1];
        out[0] = a0 * v0;
        out[1] = a1 * v0;
        out[2] = a2 * v1;
        out[3] = a3 * v1;
        out[4] = a4;
        out[5] = a5;
        return out;
    }
    /**
     * Translates the mat2d by the dimensions in the given vec2
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the matrix to translate
     * @param {vec2} v the vec2 to translate the matrix by
     * @returns {mat2d} out
     **/
    function translate(out, a, v) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
        var v0 = v[0], v1 = v[1];
        out[0] = a0;
        out[1] = a1;
        out[2] = a2;
        out[3] = a3;
        out[4] = a0 * v0 + a2 * v1 + a4;
        out[5] = a1 * v0 + a3 * v1 + a5;
        return out;
    }
    /**
     * Creates a matrix from a given angle
     * This is equivalent to (but much faster than):
     *
     *     mat2d.identity(dest);
     *     mat2d.rotate(dest, dest, rad);
     *
     * @param {mat2d} out mat2d receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat2d} out
     */
    function fromRotation$1(out, rad) {
        var s = Math.sin(rad), c = Math.cos(rad);
        out[0] = c;
        out[1] = s;
        out[2] = -s;
        out[3] = c;
        out[4] = 0;
        out[5] = 0;
        return out;
    }
    /**
     * Creates a matrix from a vector scaling
     * This is equivalent to (but much faster than):
     *
     *     mat2d.identity(dest);
     *     mat2d.scale(dest, dest, vec);
     *
     * @param {mat2d} out mat2d receiving operation result
     * @param {vec2} v Scaling vector
     * @returns {mat2d} out
     */
    function fromScaling$1(out, v) {
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = v[1];
        out[4] = 0;
        out[5] = 0;
        return out;
    }
    /**
     * Creates a matrix from a vector translation
     * This is equivalent to (but much faster than):
     *
     *     mat2d.identity(dest);
     *     mat2d.translate(dest, dest, vec);
     *
     * @param {mat2d} out mat2d receiving operation result
     * @param {vec2} v Translation vector
     * @returns {mat2d} out
     */
    function fromTranslation(out, v) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        out[4] = v[0];
        out[5] = v[1];
        return out;
    }
    /**
     * Returns a string representation of a mat2d
     *
     * @param {mat2d} a matrix to represent as a string
     * @returns {String} string representation of the matrix
     */
    function str$1(a) {
        return ('mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ')');
    }
    /**
     * Returns Frobenius norm of a mat2d
     *
     * @param {mat2d} a the matrix to calculate Frobenius norm of
     * @returns {Number} Frobenius norm
     */
    function frob$1(a) {
        return Math.sqrt(Math.pow(a[0], 2) +
            Math.pow(a[1], 2) +
            Math.pow(a[2], 2) +
            Math.pow(a[3], 2) +
            Math.pow(a[4], 2) +
            Math.pow(a[5], 2) +
            1);
    }
    /**
     * Adds two mat2d's
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the first operand
     * @param {mat2d} b the second operand
     * @returns {mat2d} out
     */
    function add$1(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        out[4] = a[4] + b[4];
        out[5] = a[5] + b[5];
        return out;
    }
    /**
     * Subtracts matrix b from matrix a
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the first operand
     * @param {mat2d} b the second operand
     * @returns {mat2d} out
     */
    function subtract$1(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        out[4] = a[4] - b[4];
        out[5] = a[5] - b[5];
        return out;
    }
    /**
     * Multiply each element of the matrix by a scalar.
     *
     * @param {mat2d} out the receiving matrix
     * @param {mat2d} a the matrix to scale
     * @param {Number} b amount to scale the matrix's elements by
     * @returns {mat2d} out
     */
    function multiplyScalar$1(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        out[4] = a[4] * b;
        out[5] = a[5] * b;
        return out;
    }
    /**
     * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
     *
     * @param {mat2d} out the receiving vector
     * @param {mat2d} a the first operand
     * @param {mat2d} b the second operand
     * @param {Number} scale the amount to scale b's elements by before adding
     * @returns {mat2d} out
     */
    function multiplyScalarAndAdd$1(out, a, b, scale) {
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        out[2] = a[2] + b[2] * scale;
        out[3] = a[3] + b[3] * scale;
        out[4] = a[4] + b[4] * scale;
        out[5] = a[5] + b[5] * scale;
        return out;
    }
    /**
     * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
     *
     * @param {mat2d} a The first matrix.
     * @param {mat2d} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    function exactEquals$1(a, b) {
        return (a[0] === b[0] &&
            a[1] === b[1] &&
            a[2] === b[2] &&
            a[3] === b[3] &&
            a[4] === b[4] &&
            a[5] === b[5]);
    }
    /**
     * Returns whether or not the matrices have approximately the same elements in the same position.
     *
     * @param {mat2d} a The first matrix.
     * @param {mat2d} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    function equals$2(a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)));
    }
    /**
     * Alias for {@link mat2d.multiply}
     * @function
     */
    var mul$1 = multiply$1;
    /**
     * Alias for {@link mat2d.subtract}
     * @function
     */
    var sub$1 = subtract$1;
    var mat2d = /*#__PURE__*/ Object.freeze({
        create: create$1,
        clone: clone$1,
        copy: copy$1,
        identity: identity$1,
        fromValues: fromValues$1,
        set: set$1,
        invert: invert$1,
        determinant: determinant$1,
        multiply: multiply$1,
        rotate: rotate$1,
        scale: scale$1,
        translate: translate,
        fromRotation: fromRotation$1,
        fromScaling: fromScaling$1,
        fromTranslation: fromTranslation,
        str: str$1,
        frob: frob$1,
        add: add$1,
        subtract: subtract$1,
        multiplyScalar: multiplyScalar$1,
        multiplyScalarAndAdd: multiplyScalarAndAdd$1,
        exactEquals: exactEquals$1,
        equals: equals$2,
        mul: mul$1,
        sub: sub$1,
    });
    /**
     * 3x3 Matrix
     * @module mat3
     */
    /**
     * Creates a new identity mat3
     *
     * @returns {mat3} a new 3x3 matrix
     */
    function create$2() {
        var out = new ARRAY_TYPE(9);
        if (ARRAY_TYPE != Float32Array) {
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
        }
        out[0] = 1;
        out[4] = 1;
        out[8] = 1;
        return out;
    }
    /**
     * Copies the upper-left 3x3 values into the given mat3.
     *
     * @param {mat3} out the receiving 3x3 matrix
     * @param {mat4} a   the source 4x4 matrix
     * @returns {mat3} out
     */
    function fromMat4(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[4];
        out[4] = a[5];
        out[5] = a[6];
        out[6] = a[8];
        out[7] = a[9];
        out[8] = a[10];
        return out;
    }
    /**
     * Creates a new mat3 initialized with values from an existing matrix
     *
     * @param {mat3} a matrix to clone
     * @returns {mat3} a new 3x3 matrix
     */
    function clone$2(a) {
        var out = new ARRAY_TYPE(9);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        return out;
    }
    /**
     * Copy the values from one mat3 to another
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the source matrix
     * @returns {mat3} out
     */
    function copy$2(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        return out;
    }
    /**
     * Create a new mat3 with the given values
     *
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m02 Component in column 0, row 2 position (index 2)
     * @param {Number} m10 Component in column 1, row 0 position (index 3)
     * @param {Number} m11 Component in column 1, row 1 position (index 4)
     * @param {Number} m12 Component in column 1, row 2 position (index 5)
     * @param {Number} m20 Component in column 2, row 0 position (index 6)
     * @param {Number} m21 Component in column 2, row 1 position (index 7)
     * @param {Number} m22 Component in column 2, row 2 position (index 8)
     * @returns {mat3} A new mat3
     */
    function fromValues$2(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        var out = new ARRAY_TYPE(9);
        out[0] = m00;
        out[1] = m01;
        out[2] = m02;
        out[3] = m10;
        out[4] = m11;
        out[5] = m12;
        out[6] = m20;
        out[7] = m21;
        out[8] = m22;
        return out;
    }
    /**
     * Set the components of a mat3 to the given values
     *
     * @param {mat3} out the receiving matrix
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m02 Component in column 0, row 2 position (index 2)
     * @param {Number} m10 Component in column 1, row 0 position (index 3)
     * @param {Number} m11 Component in column 1, row 1 position (index 4)
     * @param {Number} m12 Component in column 1, row 2 position (index 5)
     * @param {Number} m20 Component in column 2, row 0 position (index 6)
     * @param {Number} m21 Component in column 2, row 1 position (index 7)
     * @param {Number} m22 Component in column 2, row 2 position (index 8)
     * @returns {mat3} out
     */
    function set$2(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        out[0] = m00;
        out[1] = m01;
        out[2] = m02;
        out[3] = m10;
        out[4] = m11;
        out[5] = m12;
        out[6] = m20;
        out[7] = m21;
        out[8] = m22;
        return out;
    }
    /**
     * Set a mat3 to the identity matrix
     *
     * @param {mat3} out the receiving matrix
     * @returns {mat3} out
     */
    function identity$2(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 1;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }
    /**
     * Transpose the values of a mat3
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the source matrix
     * @returns {mat3} out
     */
    function transpose$1(out, a) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (out === a) {
            var a01 = a[1], a02 = a[2], a12 = a[5];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a01;
            out[5] = a[7];
            out[6] = a02;
            out[7] = a12;
        }
        else {
            out[0] = a[0];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a[1];
            out[4] = a[4];
            out[5] = a[7];
            out[6] = a[2];
            out[7] = a[5];
            out[8] = a[8];
        }
        return out;
    }
    /**
     * Inverts a mat3
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the source matrix
     * @returns {mat3} out
     */
    function invert$2(out, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2];
        var a10 = a[3], a11 = a[4], a12 = a[5];
        var a20 = a[6], a21 = a[7], a22 = a[8];
        var b01 = a22 * a11 - a12 * a21;
        var b11 = -a22 * a10 + a12 * a20;
        var b21 = a21 * a10 - a11 * a20; // Calculate the determinant
        var det = a00 * b01 + a01 * b11 + a02 * b21;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = b01 * det;
        out[1] = (-a22 * a01 + a02 * a21) * det;
        out[2] = (a12 * a01 - a02 * a11) * det;
        out[3] = b11 * det;
        out[4] = (a22 * a00 - a02 * a20) * det;
        out[5] = (-a12 * a00 + a02 * a10) * det;
        out[6] = b21 * det;
        out[7] = (-a21 * a00 + a01 * a20) * det;
        out[8] = (a11 * a00 - a01 * a10) * det;
        return out;
    }
    /**
     * Calculates the adjugate of a mat3
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the source matrix
     * @returns {mat3} out
     */
    function adjoint$1(out, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2];
        var a10 = a[3], a11 = a[4], a12 = a[5];
        var a20 = a[6], a21 = a[7], a22 = a[8];
        out[0] = a11 * a22 - a12 * a21;
        out[1] = a02 * a21 - a01 * a22;
        out[2] = a01 * a12 - a02 * a11;
        out[3] = a12 * a20 - a10 * a22;
        out[4] = a00 * a22 - a02 * a20;
        out[5] = a02 * a10 - a00 * a12;
        out[6] = a10 * a21 - a11 * a20;
        out[7] = a01 * a20 - a00 * a21;
        out[8] = a00 * a11 - a01 * a10;
        return out;
    }
    /**
     * Calculates the determinant of a mat3
     *
     * @param {mat3} a the source matrix
     * @returns {Number} determinant of a
     */
    function determinant$2(a) {
        var a00 = a[0], a01 = a[1], a02 = a[2];
        var a10 = a[3], a11 = a[4], a12 = a[5];
        var a20 = a[6], a21 = a[7], a22 = a[8];
        return (a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20));
    }
    /**
     * Multiplies two mat3's
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the first operand
     * @param {mat3} b the second operand
     * @returns {mat3} out
     */
    function multiply$2(out, a, b) {
        var a00 = a[0], a01 = a[1], a02 = a[2];
        var a10 = a[3], a11 = a[4], a12 = a[5];
        var a20 = a[6], a21 = a[7], a22 = a[8];
        var b00 = b[0], b01 = b[1], b02 = b[2];
        var b10 = b[3], b11 = b[4], b12 = b[5];
        var b20 = b[6], b21 = b[7], b22 = b[8];
        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;
        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;
        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }
    /**
     * Translate a mat3 by the given vector
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the matrix to translate
     * @param {vec2} v vector to translate by
     * @returns {mat3} out
     */
    function translate$1(out, a, v) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], x = v[0], y = v[1];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a10;
        out[4] = a11;
        out[5] = a12;
        out[6] = x * a00 + y * a10 + a20;
        out[7] = x * a01 + y * a11 + a21;
        out[8] = x * a02 + y * a12 + a22;
        return out;
    }
    /**
     * Rotates a mat3 by the given angle
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat3} out
     */
    function rotate$2(out, a, rad) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], s = Math.sin(rad), c = Math.cos(rad);
        out[0] = c * a00 + s * a10;
        out[1] = c * a01 + s * a11;
        out[2] = c * a02 + s * a12;
        out[3] = c * a10 - s * a00;
        out[4] = c * a11 - s * a01;
        out[5] = c * a12 - s * a02;
        out[6] = a20;
        out[7] = a21;
        out[8] = a22;
        return out;
    }
    /**
     * Scales the mat3 by the dimensions in the given vec2
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the matrix to rotate
     * @param {vec2} v the vec2 to scale the matrix by
     * @returns {mat3} out
     **/
    function scale$2(out, a, v) {
        var x = v[0], y = v[1];
        out[0] = x * a[0];
        out[1] = x * a[1];
        out[2] = x * a[2];
        out[3] = y * a[3];
        out[4] = y * a[4];
        out[5] = y * a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        return out;
    }
    /**
     * Creates a matrix from a vector translation
     * This is equivalent to (but much faster than):
     *
     *     mat3.identity(dest);
     *     mat3.translate(dest, dest, vec);
     *
     * @param {mat3} out mat3 receiving operation result
     * @param {vec2} v Translation vector
     * @returns {mat3} out
     */
    function fromTranslation$1(out, v) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 1;
        out[5] = 0;
        out[6] = v[0];
        out[7] = v[1];
        out[8] = 1;
        return out;
    }
    /**
     * Creates a matrix from a given angle
     * This is equivalent to (but much faster than):
     *
     *     mat3.identity(dest);
     *     mat3.rotate(dest, dest, rad);
     *
     * @param {mat3} out mat3 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat3} out
     */
    function fromRotation$2(out, rad) {
        var s = Math.sin(rad), c = Math.cos(rad);
        out[0] = c;
        out[1] = s;
        out[2] = 0;
        out[3] = -s;
        out[4] = c;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }
    /**
     * Creates a matrix from a vector scaling
     * This is equivalent to (but much faster than):
     *
     *     mat3.identity(dest);
     *     mat3.scale(dest, dest, vec);
     *
     * @param {mat3} out mat3 receiving operation result
     * @param {vec2} v Scaling vector
     * @returns {mat3} out
     */
    function fromScaling$2(out, v) {
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = v[1];
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }
    /**
     * Copies the values from a mat2d into a mat3
     *
     * @param {mat3} out the receiving matrix
     * @param {mat2d} a the matrix to copy
     * @returns {mat3} out
     **/
    function fromMat2d(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = 0;
        out[3] = a[2];
        out[4] = a[3];
        out[5] = 0;
        out[6] = a[4];
        out[7] = a[5];
        out[8] = 1;
        return out;
    }
    /**
     * Calculates a 3x3 matrix from the given quaternion
     *
     * @param {mat3} out mat3 receiving operation result
     * @param {quat} q Quaternion to create matrix from
     *
     * @returns {mat3} out
     */
    function fromQuat(out, q) {
        var x = q[0], y = q[1], z = q[2], w = q[3];
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var yx = y * x2;
        var yy = y * y2;
        var zx = z * x2;
        var zy = z * y2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
        out[0] = 1 - yy - zz;
        out[3] = yx - wz;
        out[6] = zx + wy;
        out[1] = yx + wz;
        out[4] = 1 - xx - zz;
        out[7] = zy - wx;
        out[2] = zx - wy;
        out[5] = zy + wx;
        out[8] = 1 - xx - yy;
        return out;
    }
    /**
     * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
     *
     * @param {mat3} out mat3 receiving operation result
     * @param {mat4} a Mat4 to derive the normal matrix from
     *
     * @returns {mat3} out
     */
    function normalFromMat4(out, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32; // Calculate the determinant
        var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        return out;
    }
    /**
     * Generates a 2D projection matrix with the given bounds
     *
     * @param {mat3} out mat3 frustum matrix will be written into
     * @param {number} width Width of your gl context
     * @param {number} height Height of gl context
     * @returns {mat3} out
     */
    function projection(out, width, height) {
        out[0] = 2 / width;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = -2 / height;
        out[5] = 0;
        out[6] = -1;
        out[7] = 1;
        out[8] = 1;
        return out;
    }
    /**
     * Returns a string representation of a mat3
     *
     * @param {mat3} a matrix to represent as a string
     * @returns {String} string representation of the matrix
     */
    function str$2(a) {
        return ('mat3(' +
            a[0] +
            ', ' +
            a[1] +
            ', ' +
            a[2] +
            ', ' +
            a[3] +
            ', ' +
            a[4] +
            ', ' +
            a[5] +
            ', ' +
            a[6] +
            ', ' +
            a[7] +
            ', ' +
            a[8] +
            ')');
    }
    /**
     * Returns Frobenius norm of a mat3
     *
     * @param {mat3} a the matrix to calculate Frobenius norm of
     * @returns {Number} Frobenius norm
     */
    function frob$2(a) {
        return Math.sqrt(Math.pow(a[0], 2) +
            Math.pow(a[1], 2) +
            Math.pow(a[2], 2) +
            Math.pow(a[3], 2) +
            Math.pow(a[4], 2) +
            Math.pow(a[5], 2) +
            Math.pow(a[6], 2) +
            Math.pow(a[7], 2) +
            Math.pow(a[8], 2));
    }
    /**
     * Adds two mat3's
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the first operand
     * @param {mat3} b the second operand
     * @returns {mat3} out
     */
    function add$2(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        out[4] = a[4] + b[4];
        out[5] = a[5] + b[5];
        out[6] = a[6] + b[6];
        out[7] = a[7] + b[7];
        out[8] = a[8] + b[8];
        return out;
    }
    /**
     * Subtracts matrix b from matrix a
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the first operand
     * @param {mat3} b the second operand
     * @returns {mat3} out
     */
    function subtract$2(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        out[4] = a[4] - b[4];
        out[5] = a[5] - b[5];
        out[6] = a[6] - b[6];
        out[7] = a[7] - b[7];
        out[8] = a[8] - b[8];
        return out;
    }
    /**
     * Multiply each element of the matrix by a scalar.
     *
     * @param {mat3} out the receiving matrix
     * @param {mat3} a the matrix to scale
     * @param {Number} b amount to scale the matrix's elements by
     * @returns {mat3} out
     */
    function multiplyScalar$2(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        out[4] = a[4] * b;
        out[5] = a[5] * b;
        out[6] = a[6] * b;
        out[7] = a[7] * b;
        out[8] = a[8] * b;
        return out;
    }
    /**
     * Adds two mat3's after multiplying each element of the second operand by a scalar value.
     *
     * @param {mat3} out the receiving vector
     * @param {mat3} a the first operand
     * @param {mat3} b the second operand
     * @param {Number} scale the amount to scale b's elements by before adding
     * @returns {mat3} out
     */
    function multiplyScalarAndAdd$2(out, a, b, scale) {
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        out[2] = a[2] + b[2] * scale;
        out[3] = a[3] + b[3] * scale;
        out[4] = a[4] + b[4] * scale;
        out[5] = a[5] + b[5] * scale;
        out[6] = a[6] + b[6] * scale;
        out[7] = a[7] + b[7] * scale;
        out[8] = a[8] + b[8] * scale;
        return out;
    }
    /**
     * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
     *
     * @param {mat3} a The first matrix.
     * @param {mat3} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    function exactEquals$2(a, b) {
        return (a[0] === b[0] &&
            a[1] === b[1] &&
            a[2] === b[2] &&
            a[3] === b[3] &&
            a[4] === b[4] &&
            a[5] === b[5] &&
            a[6] === b[6] &&
            a[7] === b[7] &&
            a[8] === b[8]);
    }
    /**
     * Returns whether or not the matrices have approximately the same elements in the same position.
     *
     * @param {mat3} a The first matrix.
     * @param {mat3} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    function equals$3(a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
            Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)));
    }
    /**
     * Alias for {@link mat3.multiply}
     * @function
     */
    var mul$2 = multiply$2;
    /**
     * Alias for {@link mat3.subtract}
     * @function
     */
    var sub$2 = subtract$2;
    var mat3 = /*#__PURE__*/ Object.freeze({
        create: create$2,
        fromMat4: fromMat4,
        clone: clone$2,
        copy: copy$2,
        fromValues: fromValues$2,
        set: set$2,
        identity: identity$2,
        transpose: transpose$1,
        invert: invert$2,
        adjoint: adjoint$1,
        determinant: determinant$2,
        multiply: multiply$2,
        translate: translate$1,
        rotate: rotate$2,
        scale: scale$2,
        fromTranslation: fromTranslation$1,
        fromRotation: fromRotation$2,
        fromScaling: fromScaling$2,
        fromMat2d: fromMat2d,
        fromQuat: fromQuat,
        normalFromMat4: normalFromMat4,
        projection: projection,
        str: str$2,
        frob: frob$2,
        add: add$2,
        subtract: subtract$2,
        multiplyScalar: multiplyScalar$2,
        multiplyScalarAndAdd: multiplyScalarAndAdd$2,
        exactEquals: exactEquals$2,
        equals: equals$3,
        mul: mul$2,
        sub: sub$2,
    });
    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */
    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */
    function create$3() {
        var out = new ARRAY_TYPE(16);
        if (ARRAY_TYPE != Float32Array) {
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
        }
        out[0] = 1;
        out[5] = 1;
        out[10] = 1;
        out[15] = 1;
        return out;
    }
    /**
     * Creates a new mat4 initialized with values from an existing matrix
     *
     * @param {mat4} a matrix to clone
     * @returns {mat4} a new 4x4 matrix
     */
    function clone$3(a) {
        var out = new ARRAY_TYPE(16);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    }
    /**
     * Copy the values from one mat4 to another
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    function copy$3(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    }
    /**
     * Create a new mat4 with the given values
     *
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m02 Component in column 0, row 2 position (index 2)
     * @param {Number} m03 Component in column 0, row 3 position (index 3)
     * @param {Number} m10 Component in column 1, row 0 position (index 4)
     * @param {Number} m11 Component in column 1, row 1 position (index 5)
     * @param {Number} m12 Component in column 1, row 2 position (index 6)
     * @param {Number} m13 Component in column 1, row 3 position (index 7)
     * @param {Number} m20 Component in column 2, row 0 position (index 8)
     * @param {Number} m21 Component in column 2, row 1 position (index 9)
     * @param {Number} m22 Component in column 2, row 2 position (index 10)
     * @param {Number} m23 Component in column 2, row 3 position (index 11)
     * @param {Number} m30 Component in column 3, row 0 position (index 12)
     * @param {Number} m31 Component in column 3, row 1 position (index 13)
     * @param {Number} m32 Component in column 3, row 2 position (index 14)
     * @param {Number} m33 Component in column 3, row 3 position (index 15)
     * @returns {mat4} A new mat4
     */
    function fromValues$3(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        var out = new ARRAY_TYPE(16);
        out[0] = m00;
        out[1] = m01;
        out[2] = m02;
        out[3] = m03;
        out[4] = m10;
        out[5] = m11;
        out[6] = m12;
        out[7] = m13;
        out[8] = m20;
        out[9] = m21;
        out[10] = m22;
        out[11] = m23;
        out[12] = m30;
        out[13] = m31;
        out[14] = m32;
        out[15] = m33;
        return out;
    }
    /**
     * Set the components of a mat4 to the given values
     *
     * @param {mat4} out the receiving matrix
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m02 Component in column 0, row 2 position (index 2)
     * @param {Number} m03 Component in column 0, row 3 position (index 3)
     * @param {Number} m10 Component in column 1, row 0 position (index 4)
     * @param {Number} m11 Component in column 1, row 1 position (index 5)
     * @param {Number} m12 Component in column 1, row 2 position (index 6)
     * @param {Number} m13 Component in column 1, row 3 position (index 7)
     * @param {Number} m20 Component in column 2, row 0 position (index 8)
     * @param {Number} m21 Component in column 2, row 1 position (index 9)
     * @param {Number} m22 Component in column 2, row 2 position (index 10)
     * @param {Number} m23 Component in column 2, row 3 position (index 11)
     * @param {Number} m30 Component in column 3, row 0 position (index 12)
     * @param {Number} m31 Component in column 3, row 1 position (index 13)
     * @param {Number} m32 Component in column 3, row 2 position (index 14)
     * @param {Number} m33 Component in column 3, row 3 position (index 15)
     * @returns {mat4} out
     */
    function set$3(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        out[0] = m00;
        out[1] = m01;
        out[2] = m02;
        out[3] = m03;
        out[4] = m10;
        out[5] = m11;
        out[6] = m12;
        out[7] = m13;
        out[8] = m20;
        out[9] = m21;
        out[10] = m22;
        out[11] = m23;
        out[12] = m30;
        out[13] = m31;
        out[14] = m32;
        out[15] = m33;
        return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */
    function identity$3(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    /**
     * Transpose the values of a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    function transpose$2(out, a) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (out === a) {
            var a01 = a[1], a02 = a[2], a03 = a[3];
            var a12 = a[6], a13 = a[7];
            var a23 = a[11];
            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a01;
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a02;
            out[9] = a12;
            out[11] = a[14];
            out[12] = a03;
            out[13] = a13;
            out[14] = a23;
        }
        else {
            out[0] = a[0];
            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a[1];
            out[5] = a[5];
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a[2];
            out[9] = a[6];
            out[10] = a[10];
            out[11] = a[14];
            out[12] = a[3];
            out[13] = a[7];
            out[14] = a[11];
            out[15] = a[15];
        }
        return out;
    }
    /**
     * Inverts a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    function invert$3(out, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32; // Calculate the determinant
        var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return out;
    }
    /**
     * Calculates the adjugate of a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    function adjoint$2(out, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        out[0] =
            a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
        out[1] = -(a01 * (a22 * a33 - a23 * a32) -
            a21 * (a02 * a33 - a03 * a32) +
            a31 * (a02 * a23 - a03 * a22));
        out[2] =
            a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
        out[3] = -(a01 * (a12 * a23 - a13 * a22) -
            a11 * (a02 * a23 - a03 * a22) +
            a21 * (a02 * a13 - a03 * a12));
        out[4] = -(a10 * (a22 * a33 - a23 * a32) -
            a20 * (a12 * a33 - a13 * a32) +
            a30 * (a12 * a23 - a13 * a22));
        out[5] =
            a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
        out[6] = -(a00 * (a12 * a33 - a13 * a32) -
            a10 * (a02 * a33 - a03 * a32) +
            a30 * (a02 * a13 - a03 * a12));
        out[7] =
            a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
        out[8] =
            a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
        out[9] = -(a00 * (a21 * a33 - a23 * a31) -
            a20 * (a01 * a33 - a03 * a31) +
            a30 * (a01 * a23 - a03 * a21));
        out[10] =
            a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
        out[11] = -(a00 * (a11 * a23 - a13 * a21) -
            a10 * (a01 * a23 - a03 * a21) +
            a20 * (a01 * a13 - a03 * a11));
        out[12] = -(a10 * (a21 * a32 - a22 * a31) -
            a20 * (a11 * a32 - a12 * a31) +
            a30 * (a11 * a22 - a12 * a21));
        out[13] =
            a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
        out[14] = -(a00 * (a11 * a32 - a12 * a31) -
            a10 * (a01 * a32 - a02 * a31) +
            a30 * (a01 * a12 - a02 * a11));
        out[15] =
            a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
        return out;
    }
    /**
     * Calculates the determinant of a mat4
     *
     * @param {mat4} a the source matrix
     * @returns {Number} determinant of a
     */
    function determinant$3(a) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32; // Calculate the determinant
        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    }
    /**
     * Multiplies two mat4s
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @returns {mat4} out
     */
    function multiply$3(out, a, b) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]; // Cache only the current line of the second matrix
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[4];
        b1 = b[5];
        b2 = b[6];
        b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[8];
        b1 = b[9];
        b2 = b[10];
        b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b[12];
        b1 = b[13];
        b2 = b[14];
        b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return out;
    }
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to translate
     * @param {vec3} v vector to translate by
     * @returns {mat4} out
     */
    function translate$2(out, a, v) {
        var x = v[0], y = v[1], z = v[2];
        var a00, a01, a02, a03;
        var a10, a11, a12, a13;
        var a20, a21, a22, a23;
        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        }
        else {
            a00 = a[0];
            a01 = a[1];
            a02 = a[2];
            a03 = a[3];
            a10 = a[4];
            a11 = a[5];
            a12 = a[6];
            a13 = a[7];
            a20 = a[8];
            a21 = a[9];
            a22 = a[10];
            a23 = a[11];
            out[0] = a00;
            out[1] = a01;
            out[2] = a02;
            out[3] = a03;
            out[4] = a10;
            out[5] = a11;
            out[6] = a12;
            out[7] = a13;
            out[8] = a20;
            out[9] = a21;
            out[10] = a22;
            out[11] = a23;
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }
        return out;
    }
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to scale
     * @param {vec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/
    function scale$3(out, a, v) {
        var x = v[0], y = v[1], z = v[2];
        out[0] = a[0] * x;
        out[1] = a[1] * x;
        out[2] = a[2] * x;
        out[3] = a[3] * x;
        out[4] = a[4] * y;
        out[5] = a[5] * y;
        out[6] = a[6] * y;
        out[7] = a[7] * y;
        out[8] = a[8] * z;
        out[9] = a[9] * z;
        out[10] = a[10] * z;
        out[11] = a[11] * z;
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    }
    /**
     * Rotates a mat4 by the given angle around the given axis
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @param {vec3} axis the axis to rotate around
     * @returns {mat4} out
     */
    function rotate$3(out, a, rad, axis) {
        var x = axis[0], y = axis[1], z = axis[2];
        var len = Math.sqrt(x * x + y * y + z * z);
        var s, c, t;
        var a00, a01, a02, a03;
        var a10, a11, a12, a13;
        var a20, a21, a22, a23;
        var b00, b01, b02;
        var b10, b11, b12;
        var b20, b21, b22;
        if (len < EPSILON) {
            return null;
        }
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c;
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11]; // Construct the elements of the rotation matrix
        b00 = x * x * t + c;
        b01 = y * x * t + z * s;
        b02 = z * x * t - y * s;
        b10 = x * y * t - z * s;
        b11 = y * y * t + c;
        b12 = z * y * t + x * s;
        b20 = x * z * t + y * s;
        b21 = y * z * t - x * s;
        b22 = z * z * t + c; // Perform rotation-specific matrix multiplication
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;
        if (a !== out) {
            // If the source and destination differ, copy the unchanged last row
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        return out;
    }
    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    function rotateX(out, a, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        var a10 = a[4];
        var a11 = a[5];
        var a12 = a[6];
        var a13 = a[7];
        var a20 = a[8];
        var a21 = a[9];
        var a22 = a[10];
        var a23 = a[11];
        if (a !== out) {
            // If the source and destination differ, copy the unchanged rows
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        } // Perform axis-specific matrix multiplication
        out[4] = a10 * c + a20 * s;
        out[5] = a11 * c + a21 * s;
        out[6] = a12 * c + a22 * s;
        out[7] = a13 * c + a23 * s;
        out[8] = a20 * c - a10 * s;
        out[9] = a21 * c - a11 * s;
        out[10] = a22 * c - a12 * s;
        out[11] = a23 * c - a13 * s;
        return out;
    }
    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    function rotateY(out, a, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        var a00 = a[0];
        var a01 = a[1];
        var a02 = a[2];
        var a03 = a[3];
        var a20 = a[8];
        var a21 = a[9];
        var a22 = a[10];
        var a23 = a[11];
        if (a !== out) {
            // If the source and destination differ, copy the unchanged rows
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        } // Perform axis-specific matrix multiplication
        out[0] = a00 * c - a20 * s;
        out[1] = a01 * c - a21 * s;
        out[2] = a02 * c - a22 * s;
        out[3] = a03 * c - a23 * s;
        out[8] = a00 * s + a20 * c;
        out[9] = a01 * s + a21 * c;
        out[10] = a02 * s + a22 * c;
        out[11] = a03 * s + a23 * c;
        return out;
    }
    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    function rotateZ(out, a, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        var a00 = a[0];
        var a01 = a[1];
        var a02 = a[2];
        var a03 = a[3];
        var a10 = a[4];
        var a11 = a[5];
        var a12 = a[6];
        var a13 = a[7];
        if (a !== out) {
            // If the source and destination differ, copy the unchanged last row
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        } // Perform axis-specific matrix multiplication
        out[0] = a00 * c + a10 * s;
        out[1] = a01 * c + a11 * s;
        out[2] = a02 * c + a12 * s;
        out[3] = a03 * c + a13 * s;
        out[4] = a10 * c - a00 * s;
        out[5] = a11 * c - a01 * s;
        out[6] = a12 * c - a02 * s;
        out[7] = a13 * c - a03 * s;
        return out;
    }
    /**
     * Creates a matrix from a vector translation
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.translate(dest, dest, vec);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {vec3} v Translation vector
     * @returns {mat4} out
     */
    function fromTranslation$2(out, v) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;
        return out;
    }
    /**
     * Creates a matrix from a vector scaling
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.scale(dest, dest, vec);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {vec3} v Scaling vector
     * @returns {mat4} out
     */
    function fromScaling$3(out, v) {
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = v[1];
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = v[2];
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    /**
     * Creates a matrix from a given angle around a given axis
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.rotate(dest, dest, rad, axis);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @param {vec3} axis the axis to rotate around
     * @returns {mat4} out
     */
    function fromRotation$3(out, rad, axis) {
        var x = axis[0], y = axis[1], z = axis[2];
        var len = Math.sqrt(x * x + y * y + z * z);
        var s, c, t;
        if (len < EPSILON) {
            return null;
        }
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c; // Perform rotation-specific matrix multiplication
        out[0] = x * x * t + c;
        out[1] = y * x * t + z * s;
        out[2] = z * x * t - y * s;
        out[3] = 0;
        out[4] = x * y * t - z * s;
        out[5] = y * y * t + c;
        out[6] = z * y * t + x * s;
        out[7] = 0;
        out[8] = x * z * t + y * s;
        out[9] = y * z * t - x * s;
        out[10] = z * z * t + c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    /**
     * Creates a matrix from the given angle around the X axis
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.rotateX(dest, dest, rad);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    function fromXRotation(out, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad); // Perform axis-specific matrix multiplication
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = c;
        out[6] = s;
        out[7] = 0;
        out[8] = 0;
        out[9] = -s;
        out[10] = c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    /**
     * Creates a matrix from the given angle around the Y axis
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.rotateY(dest, dest, rad);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    function fromYRotation(out, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad); // Perform axis-specific matrix multiplication
        out[0] = c;
        out[1] = 0;
        out[2] = -s;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = s;
        out[9] = 0;
        out[10] = c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    /**
     * Creates a matrix from the given angle around the Z axis
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.rotateZ(dest, dest, rad);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    function fromZRotation(out, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad); // Perform axis-specific matrix multiplication
        out[0] = c;
        out[1] = s;
        out[2] = 0;
        out[3] = 0;
        out[4] = -s;
        out[5] = c;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    /**
     * Creates a matrix from a quaternion rotation and vector translation
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.translate(dest, vec);
     *     let quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     mat4.multiply(dest, quatMat);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat4} q Rotation quaternion
     * @param {vec3} v Translation vector
     * @returns {mat4} out
     */
    function fromRotationTranslation(out, q, v) {
        // Quaternion math
        var x = q[0], y = q[1], z = q[2], w = q[3];
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var xy = x * y2;
        var xz = x * z2;
        var yy = y * y2;
        var yz = y * z2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
        out[0] = 1 - (yy + zz);
        out[1] = xy + wz;
        out[2] = xz - wy;
        out[3] = 0;
        out[4] = xy - wz;
        out[5] = 1 - (xx + zz);
        out[6] = yz + wx;
        out[7] = 0;
        out[8] = xz + wy;
        out[9] = yz - wx;
        out[10] = 1 - (xx + yy);
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;
        return out;
    }
    /**
     * Creates a new mat4 from a dual quat.
     *
     * @param {mat4} out Matrix
     * @param {quat2} a Dual Quaternion
     * @returns {mat4} mat4 receiving operation result
     */
    function fromQuat2(out, a) {
        var translation = new ARRAY_TYPE(3);
        var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
        var magnitude = bx * bx + by * by + bz * bz + bw * bw; //Only scale if it makes sense
        if (magnitude > 0) {
            translation[0] = ((ax * bw + aw * bx + ay * bz - az * by) * 2) / magnitude;
            translation[1] = ((ay * bw + aw * by + az * bx - ax * bz) * 2) / magnitude;
            translation[2] = ((az * bw + aw * bz + ax * by - ay * bx) * 2) / magnitude;
        }
        else {
            translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
            translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
            translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
        }
        fromRotationTranslation(out, a, translation);
        return out;
    }
    /**
     * Returns the translation vector component of a transformation
     *  matrix. If a matrix is built with fromRotationTranslation,
     *  the returned vector will be the same as the translation vector
     *  originally supplied.
     * @param  {vec3} out Vector to receive translation component
     * @param  {mat4} mat Matrix to be decomposed (input)
     * @return {vec3} out
     */
    function getTranslation(out, mat) {
        out[0] = mat[12];
        out[1] = mat[13];
        out[2] = mat[14];
        return out;
    }
    /**
     * Returns the scaling factor component of a transformation
     *  matrix. If a matrix is built with fromRotationTranslationScale
     *  with a normalized Quaternion paramter, the returned vector will be
     *  the same as the scaling vector
     *  originally supplied.
     * @param  {vec3} out Vector to receive scaling factor component
     * @param  {mat4} mat Matrix to be decomposed (input)
     * @return {vec3} out
     */
    function getScaling(out, mat) {
        var m11 = mat[0];
        var m12 = mat[1];
        var m13 = mat[2];
        var m21 = mat[4];
        var m22 = mat[5];
        var m23 = mat[6];
        var m31 = mat[8];
        var m32 = mat[9];
        var m33 = mat[10];
        out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
        out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
        out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
        return out;
    }
    /**
     * Returns a quaternion representing the rotational component
     *  of a transformation matrix. If a matrix is built with
     *  fromRotationTranslation, the returned quaternion will be the
     *  same as the quaternion originally supplied.
     * @param {quat} out Quaternion to receive the rotation component
     * @param {mat4} mat Matrix to be decomposed (input)
     * @return {quat} out
     */
    function getRotation(out, mat) {
        // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
        var trace = mat[0] + mat[5] + mat[10];
        var S = 0;
        if (trace > 0) {
            S = Math.sqrt(trace + 1.0) * 2;
            out[3] = 0.25 * S;
            out[0] = (mat[6] - mat[9]) / S;
            out[1] = (mat[8] - mat[2]) / S;
            out[2] = (mat[1] - mat[4]) / S;
        }
        else if (mat[0] > mat[5] && mat[0] > mat[10]) {
            S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
            out[3] = (mat[6] - mat[9]) / S;
            out[0] = 0.25 * S;
            out[1] = (mat[1] + mat[4]) / S;
            out[2] = (mat[8] + mat[2]) / S;
        }
        else if (mat[5] > mat[10]) {
            S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
            out[3] = (mat[8] - mat[2]) / S;
            out[0] = (mat[1] + mat[4]) / S;
            out[1] = 0.25 * S;
            out[2] = (mat[6] + mat[9]) / S;
        }
        else {
            S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
            out[3] = (mat[1] - mat[4]) / S;
            out[0] = (mat[8] + mat[2]) / S;
            out[1] = (mat[6] + mat[9]) / S;
            out[2] = 0.25 * S;
        }
        return out;
    }
    /**
     * Creates a matrix from a quaternion rotation, vector translation and vector scale
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.translate(dest, vec);
     *     let quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     mat4.multiply(dest, quatMat);
     *     mat4.scale(dest, scale)
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat4} q Rotation quaternion
     * @param {vec3} v Translation vector
     * @param {vec3} s Scaling vector
     * @returns {mat4} out
     */
    function fromRotationTranslationScale(out, q, v, s) {
        // Quaternion math
        var x = q[0], y = q[1], z = q[2], w = q[3];
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var xy = x * y2;
        var xz = x * z2;
        var yy = y * y2;
        var yz = y * z2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
        var sx = s[0];
        var sy = s[1];
        var sz = s[2];
        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;
        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;
        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;
        return out;
    }
    /**
     * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.translate(dest, vec);
     *     mat4.translate(dest, origin);
     *     let quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     mat4.multiply(dest, quatMat);
     *     mat4.scale(dest, scale)
     *     mat4.translate(dest, negativeOrigin);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat4} q Rotation quaternion
     * @param {vec3} v Translation vector
     * @param {vec3} s Scaling vector
     * @param {vec3} o The origin vector around which to scale and rotate
     * @returns {mat4} out
     */
    function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
        // Quaternion math
        var x = q[0], y = q[1], z = q[2], w = q[3];
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var xy = x * y2;
        var xz = x * z2;
        var yy = y * y2;
        var yz = y * z2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
        var sx = s[0];
        var sy = s[1];
        var sz = s[2];
        var ox = o[0];
        var oy = o[1];
        var oz = o[2];
        var out0 = (1 - (yy + zz)) * sx;
        var out1 = (xy + wz) * sx;
        var out2 = (xz - wy) * sx;
        var out4 = (xy - wz) * sy;
        var out5 = (1 - (xx + zz)) * sy;
        var out6 = (yz + wx) * sy;
        var out8 = (xz + wy) * sz;
        var out9 = (yz - wx) * sz;
        var out10 = (1 - (xx + yy)) * sz;
        out[0] = out0;
        out[1] = out1;
        out[2] = out2;
        out[3] = 0;
        out[4] = out4;
        out[5] = out5;
        out[6] = out6;
        out[7] = 0;
        out[8] = out8;
        out[9] = out9;
        out[10] = out10;
        out[11] = 0;
        out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
        out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
        out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
        out[15] = 1;
        return out;
    }
    /**
     * Calculates a 4x4 matrix from the given quaternion
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat} q Quaternion to create matrix from
     *
     * @returns {mat4} out
     */
    function fromQuat$1(out, q) {
        var x = q[0], y = q[1], z = q[2], w = q[3];
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var yx = y * x2;
        var yy = y * y2;
        var zx = z * x2;
        var zy = z * y2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
        out[0] = 1 - yy - zz;
        out[1] = yx + wz;
        out[2] = zx - wy;
        out[3] = 0;
        out[4] = yx - wz;
        out[5] = 1 - xx - zz;
        out[6] = zy + wx;
        out[7] = 0;
        out[8] = zx + wy;
        out[9] = zy - wx;
        out[10] = 1 - xx - yy;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    /**
     * Generates a frustum matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {Number} left Left bound of the frustum
     * @param {Number} right Right bound of the frustum
     * @param {Number} bottom Bottom bound of the frustum
     * @param {Number} top Top bound of the frustum
     * @param {Number} near Near bound of the frustum
     * @param {Number} far Far bound of the frustum
     * @returns {mat4} out
     */
    function frustum(out, left, right, bottom, top, near, far) {
        var rl = 1 / (right - left);
        var tb = 1 / (top - bottom);
        var nf = 1 / (near - far);
        out[0] = near * 2 * rl;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = near * 2 * tb;
        out[6] = 0;
        out[7] = 0;
        out[8] = (right + left) * rl;
        out[9] = (top + bottom) * tb;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = far * near * 2 * nf;
        out[15] = 0;
        return out;
    }
    /**
     * Generates a perspective projection matrix with the given bounds.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */
    function perspective(out, fovy, aspect, near, far) {
        var f = 1.0 / Math.tan(fovy / 2), nf;
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[15] = 0;
        if (far != null && far !== Infinity) {
            nf = 1 / (near - far);
            out[10] = (far + near) * nf;
            out[14] = 2 * far * near * nf;
        }
        else {
            out[10] = -1;
            out[14] = -2 * near;
        }
        return out;
    }
    /**
     * Generates a perspective projection matrix with the given field of view.
     * This is primarily useful for generating projection matrices to be used
     * with the still experiemental WebVR API.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */
    function perspectiveFromFieldOfView(out, fov, near, far) {
        var upTan = Math.tan((fov.upDegrees * Math.PI) / 180.0);
        var downTan = Math.tan((fov.downDegrees * Math.PI) / 180.0);
        var leftTan = Math.tan((fov.leftDegrees * Math.PI) / 180.0);
        var rightTan = Math.tan((fov.rightDegrees * Math.PI) / 180.0);
        var xScale = 2.0 / (leftTan + rightTan);
        var yScale = 2.0 / (upTan + downTan);
        out[0] = xScale;
        out[1] = 0.0;
        out[2] = 0.0;
        out[3] = 0.0;
        out[4] = 0.0;
        out[5] = yScale;
        out[6] = 0.0;
        out[7] = 0.0;
        out[8] = -((leftTan - rightTan) * xScale * 0.5);
        out[9] = (upTan - downTan) * yScale * 0.5;
        out[10] = far / (near - far);
        out[11] = -1.0;
        out[12] = 0.0;
        out[13] = 0.0;
        out[14] = (far * near) / (near - far);
        out[15] = 0.0;
        return out;
    }
    /**
     * Generates a orthogonal projection matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */
    function ortho(out, left, right, bottom, top, near, far) {
        var lr = 1 / (left - right);
        var bt = 1 / (bottom - top);
        var nf = 1 / (near - far);
        out[0] = -2 * lr;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = -2 * bt;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 2 * nf;
        out[11] = 0;
        out[12] = (left + right) * lr;
        out[13] = (top + bottom) * bt;
        out[14] = (far + near) * nf;
        out[15] = 1;
        return out;
    }
    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis.
     * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing up
     * @returns {mat4} out
     */
    function lookAt(out, eye, center, up) {
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        var eyex = eye[0];
        var eyey = eye[1];
        var eyez = eye[2];
        var upx = up[0];
        var upy = up[1];
        var upz = up[2];
        var centerx = center[0];
        var centery = center[1];
        var centerz = center[2];
        if (Math.abs(eyex - centerx) < EPSILON &&
            Math.abs(eyey - centery) < EPSILON &&
            Math.abs(eyez - centerz) < EPSILON) {
            return identity$3(out);
        }
        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;
        len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        }
        else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;
        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        }
        else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }
        out[0] = x0;
        out[1] = y0;
        out[2] = z0;
        out[3] = 0;
        out[4] = x1;
        out[5] = y1;
        out[6] = z1;
        out[7] = 0;
        out[8] = x2;
        out[9] = y2;
        out[10] = z2;
        out[11] = 0;
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;
        return out;
    }
    /**
     * Generates a matrix that makes something look at something else.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing up
     * @returns {mat4} out
     */
    function targetTo(out, eye, target, up) {
        var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
        var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
        var len = z0 * z0 + z1 * z1 + z2 * z2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            z0 *= len;
            z1 *= len;
            z2 *= len;
        }
        var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
        len = x0 * x0 + x1 * x1 + x2 * x2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
        out[0] = x0;
        out[1] = x1;
        out[2] = x2;
        out[3] = 0;
        out[4] = z1 * x2 - z2 * x1;
        out[5] = z2 * x0 - z0 * x2;
        out[6] = z0 * x1 - z1 * x0;
        out[7] = 0;
        out[8] = z0;
        out[9] = z1;
        out[10] = z2;
        out[11] = 0;
        out[12] = eyex;
        out[13] = eyey;
        out[14] = eyez;
        out[15] = 1;
        return out;
    }
    /**
     * Returns a string representation of a mat4
     *
     * @param {mat4} a matrix to represent as a string
     * @returns {String} string representation of the matrix
     */
    function str$3(a) {
        return ('mat4(' +
            a[0] +
            ', ' +
            a[1] +
            ', ' +
            a[2] +
            ', ' +
            a[3] +
            ', ' +
            a[4] +
            ', ' +
            a[5] +
            ', ' +
            a[6] +
            ', ' +
            a[7] +
            ', ' +
            a[8] +
            ', ' +
            a[9] +
            ', ' +
            a[10] +
            ', ' +
            a[11] +
            ', ' +
            a[12] +
            ', ' +
            a[13] +
            ', ' +
            a[14] +
            ', ' +
            a[15] +
            ')');
    }
    /**
     * Returns Frobenius norm of a mat4
     *
     * @param {mat4} a the matrix to calculate Frobenius norm of
     * @returns {Number} Frobenius norm
     */
    function frob$3(a) {
        return Math.sqrt(Math.pow(a[0], 2) +
            Math.pow(a[1], 2) +
            Math.pow(a[2], 2) +
            Math.pow(a[3], 2) +
            Math.pow(a[4], 2) +
            Math.pow(a[5], 2) +
            Math.pow(a[6], 2) +
            Math.pow(a[7], 2) +
            Math.pow(a[8], 2) +
            Math.pow(a[9], 2) +
            Math.pow(a[10], 2) +
            Math.pow(a[11], 2) +
            Math.pow(a[12], 2) +
            Math.pow(a[13], 2) +
            Math.pow(a[14], 2) +
            Math.pow(a[15], 2));
    }
    /**
     * Adds two mat4's
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @returns {mat4} out
     */
    function add$3(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        out[4] = a[4] + b[4];
        out[5] = a[5] + b[5];
        out[6] = a[6] + b[6];
        out[7] = a[7] + b[7];
        out[8] = a[8] + b[8];
        out[9] = a[9] + b[9];
        out[10] = a[10] + b[10];
        out[11] = a[11] + b[11];
        out[12] = a[12] + b[12];
        out[13] = a[13] + b[13];
        out[14] = a[14] + b[14];
        out[15] = a[15] + b[15];
        return out;
    }
    /**
     * Subtracts matrix b from matrix a
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @returns {mat4} out
     */
    function subtract$3(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        out[4] = a[4] - b[4];
        out[5] = a[5] - b[5];
        out[6] = a[6] - b[6];
        out[7] = a[7] - b[7];
        out[8] = a[8] - b[8];
        out[9] = a[9] - b[9];
        out[10] = a[10] - b[10];
        out[11] = a[11] - b[11];
        out[12] = a[12] - b[12];
        out[13] = a[13] - b[13];
        out[14] = a[14] - b[14];
        out[15] = a[15] - b[15];
        return out;
    }
    /**
     * Multiply each element of the matrix by a scalar.
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to scale
     * @param {Number} b amount to scale the matrix's elements by
     * @returns {mat4} out
     */
    function multiplyScalar$3(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        out[4] = a[4] * b;
        out[5] = a[5] * b;
        out[6] = a[6] * b;
        out[7] = a[7] * b;
        out[8] = a[8] * b;
        out[9] = a[9] * b;
        out[10] = a[10] * b;
        out[11] = a[11] * b;
        out[12] = a[12] * b;
        out[13] = a[13] * b;
        out[14] = a[14] * b;
        out[15] = a[15] * b;
        return out;
    }
    /**
     * Adds two mat4's after multiplying each element of the second operand by a scalar value.
     *
     * @param {mat4} out the receiving vector
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @param {Number} scale the amount to scale b's elements by before adding
     * @returns {mat4} out
     */
    function multiplyScalarAndAdd$3(out, a, b, scale) {
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        out[2] = a[2] + b[2] * scale;
        out[3] = a[3] + b[3] * scale;
        out[4] = a[4] + b[4] * scale;
        out[5] = a[5] + b[5] * scale;
        out[6] = a[6] + b[6] * scale;
        out[7] = a[7] + b[7] * scale;
        out[8] = a[8] + b[8] * scale;
        out[9] = a[9] + b[9] * scale;
        out[10] = a[10] + b[10] * scale;
        out[11] = a[11] + b[11] * scale;
        out[12] = a[12] + b[12] * scale;
        out[13] = a[13] + b[13] * scale;
        out[14] = a[14] + b[14] * scale;
        out[15] = a[15] + b[15] * scale;
        return out;
    }
    /**
     * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
     *
     * @param {mat4} a The first matrix.
     * @param {mat4} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    function exactEquals$3(a, b) {
        return (a[0] === b[0] &&
            a[1] === b[1] &&
            a[2] === b[2] &&
            a[3] === b[3] &&
            a[4] === b[4] &&
            a[5] === b[5] &&
            a[6] === b[6] &&
            a[7] === b[7] &&
            a[8] === b[8] &&
            a[9] === b[9] &&
            a[10] === b[10] &&
            a[11] === b[11] &&
            a[12] === b[12] &&
            a[13] === b[13] &&
            a[14] === b[14] &&
            a[15] === b[15]);
    }
    /**
     * Returns whether or not the matrices have approximately the same elements in the same position.
     *
     * @param {mat4} a The first matrix.
     * @param {mat4} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    function equals$4(a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
        var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
        var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
        var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
        var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
            Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
            Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
            Math.abs(a10 - b10) <= EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
            Math.abs(a11 - b11) <= EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
            Math.abs(a12 - b12) <= EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
            Math.abs(a13 - b13) <= EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
            Math.abs(a14 - b14) <= EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
            Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15)));
    }
    /**
     * Alias for {@link mat4.multiply}
     * @function
     */
    var mul$3 = multiply$3;
    /**
     * Alias for {@link mat4.subtract}
     * @function
     */
    var sub$3 = subtract$3;
    var mat4 = /*#__PURE__*/ Object.freeze({
        create: create$3,
        clone: clone$3,
        copy: copy$3,
        fromValues: fromValues$3,
        set: set$3,
        identity: identity$3,
        transpose: transpose$2,
        invert: invert$3,
        adjoint: adjoint$2,
        determinant: determinant$3,
        multiply: multiply$3,
        translate: translate$2,
        scale: scale$3,
        rotate: rotate$3,
        rotateX: rotateX,
        rotateY: rotateY,
        rotateZ: rotateZ,
        fromTranslation: fromTranslation$2,
        fromScaling: fromScaling$3,
        fromRotation: fromRotation$3,
        fromXRotation: fromXRotation,
        fromYRotation: fromYRotation,
        fromZRotation: fromZRotation,
        fromRotationTranslation: fromRotationTranslation,
        fromQuat2: fromQuat2,
        getTranslation: getTranslation,
        getScaling: getScaling,
        getRotation: getRotation,
        fromRotationTranslationScale: fromRotationTranslationScale,
        fromRotationTranslationScaleOrigin: fromRotationTranslationScaleOrigin,
        fromQuat: fromQuat$1,
        frustum: frustum,
        perspective: perspective,
        perspectiveFromFieldOfView: perspectiveFromFieldOfView,
        ortho: ortho,
        lookAt: lookAt,
        targetTo: targetTo,
        str: str$3,
        frob: frob$3,
        add: add$3,
        subtract: subtract$3,
        multiplyScalar: multiplyScalar$3,
        multiplyScalarAndAdd: multiplyScalarAndAdd$3,
        exactEquals: exactEquals$3,
        equals: equals$4,
        mul: mul$3,
        sub: sub$3,
    });
    /**
     * 3 Dimensional Vector
     * @module vec3
     */
    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */
    function create$4() {
        var out = new ARRAY_TYPE(3);
        if (ARRAY_TYPE != Float32Array) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
        }
        return out;
    }
    /**
     * Creates a new vec3 initialized with values from an existing vector
     *
     * @param {vec3} a vector to clone
     * @returns {vec3} a new 3D vector
     */
    function clone$4(a) {
        var out = new ARRAY_TYPE(3);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }
    /**
     * Calculates the length of a vec3
     *
     * @param {vec3} a vector to calculate length of
     * @returns {Number} length of a
     */
    function length(a) {
        var x = a[0];
        var y = a[1];
        var z = a[2];
        return Math.sqrt(x * x + y * y + z * z);
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */
    function fromValues$4(x, y, z) {
        var out = new ARRAY_TYPE(3);
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }
    /**
     * Copy the values from one vec3 to another
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the source vector
     * @returns {vec3} out
     */
    function copy$4(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }
    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */
    function set$4(out, x, y, z) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }
    /**
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function add$4(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    }
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function subtract$4(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    }
    /**
     * Multiplies two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function multiply$4(out, a, b) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    }
    /**
     * Divides two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function divide(out, a, b) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
    }
    /**
     * Math.ceil the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to ceil
     * @returns {vec3} out
     */
    function ceil(out, a) {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        out[2] = Math.ceil(a[2]);
        return out;
    }
    /**
     * Math.floor the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to floor
     * @returns {vec3} out
     */
    function floor(out, a) {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        out[2] = Math.floor(a[2]);
        return out;
    }
    /**
     * Returns the minimum of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function min(out, a, b) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    }
    /**
     * Returns the maximum of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function max(out, a, b) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    }
    /**
     * Math.round the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to round
     * @returns {vec3} out
     */
    function round(out, a) {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        return out;
    }
    /**
     * Scales a vec3 by a scalar number
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec3} out
     */
    function scale$4(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        return out;
    }
    /**
     * Adds two vec3's after scaling the second operand by a scalar value
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {Number} scale the amount to scale b by before adding
     * @returns {vec3} out
     */
    function scaleAndAdd(out, a, b, scale) {
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        out[2] = a[2] + b[2] * scale;
        return out;
    }
    /**
     * Calculates the euclidian distance between two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} distance between a and b
     */
    function distance(a, b) {
        var x = b[0] - a[0];
        var y = b[1] - a[1];
        var z = b[2] - a[2];
        return Math.sqrt(x * x + y * y + z * z);
    }
    /**
     * Calculates the squared euclidian distance between two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} squared distance between a and b
     */
    function squaredDistance(a, b) {
        var x = b[0] - a[0];
        var y = b[1] - a[1];
        var z = b[2] - a[2];
        return x * x + y * y + z * z;
    }
    /**
     * Calculates the squared length of a vec3
     *
     * @param {vec3} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    function squaredLength(a) {
        var x = a[0];
        var y = a[1];
        var z = a[2];
        return x * x + y * y + z * z;
    }
    /**
     * Negates the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to negate
     * @returns {vec3} out
     */
    function negate(out, a) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    }
    /**
     * Returns the inverse of the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to invert
     * @returns {vec3} out
     */
    function inverse(out, a) {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
    }
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to normalize
     * @returns {vec3} out
     */
    function normalize(out, a) {
        var x = a[0];
        var y = a[1];
        var z = a[2];
        var len = x * x + y * y + z * z;
        if (len > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len = 1 / Math.sqrt(len);
        }
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        return out;
    }
    /**
     * Calculates the dot product of two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} dot product of a and b
     */
    function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function cross(out, a, b) {
        var ax = a[0], ay = a[1], az = a[2];
        var bx = b[0], by = b[1], bz = b[2];
        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    }
    /**
     * Performs a linear interpolation between two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {vec3} out
     */
    function lerp(out, a, b, t) {
        var ax = a[0];
        var ay = a[1];
        var az = a[2];
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        out[2] = az + t * (b[2] - az);
        return out;
    }
    /**
     * Performs a hermite interpolation with two control points
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {vec3} c the third operand
     * @param {vec3} d the fourth operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {vec3} out
     */
    function hermite(out, a, b, c, d, t) {
        var factorTimes2 = t * t;
        var factor1 = factorTimes2 * (2 * t - 3) + 1;
        var factor2 = factorTimes2 * (t - 2) + t;
        var factor3 = factorTimes2 * (t - 1);
        var factor4 = factorTimes2 * (3 - 2 * t);
        out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
        out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
        out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
        return out;
    }
    /**
     * Performs a bezier interpolation with two control points
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {vec3} c the third operand
     * @param {vec3} d the fourth operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {vec3} out
     */
    function bezier(out, a, b, c, d, t) {
        var inverseFactor = 1 - t;
        var inverseFactorTimesTwo = inverseFactor * inverseFactor;
        var factorTimes2 = t * t;
        var factor1 = inverseFactorTimesTwo * inverseFactor;
        var factor2 = 3 * t * inverseFactorTimesTwo;
        var factor3 = 3 * factorTimes2 * inverseFactor;
        var factor4 = factorTimes2 * t;
        out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
        out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
        out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
        return out;
    }
    /**
     * Generates a random vector with the given scale
     *
     * @param {vec3} out the receiving vector
     * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
     * @returns {vec3} out
     */
    function random(out, scale) {
        scale = scale || 1.0;
        var r = RANDOM() * 2.0 * Math.PI;
        var z = RANDOM() * 2.0 - 1.0;
        var zScale = Math.sqrt(1.0 - z * z) * scale;
        out[0] = Math.cos(r) * zScale;
        out[1] = Math.sin(r) * zScale;
        out[2] = z * scale;
        return out;
    }
    /**
     * Transforms the vec3 with a mat4.
     * 4th vector component is implicitly '1'
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec3} out
     */
    function transformMat4(out, a, m) {
        var x = a[0], y = a[1], z = a[2];
        var w = m[3] * x + m[7] * y + m[11] * z + m[15];
        w = w || 1.0;
        out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
        out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
        out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        return out;
    }
    /**
     * Transforms the vec3 with a mat3.
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat3} m the 3x3 matrix to transform with
     * @returns {vec3} out
     */
    function transformMat3(out, a, m) {
        var x = a[0], y = a[1], z = a[2];
        out[0] = x * m[0] + y * m[3] + z * m[6];
        out[1] = x * m[1] + y * m[4] + z * m[7];
        out[2] = x * m[2] + y * m[5] + z * m[8];
        return out;
    }
    /**
     * Transforms the vec3 with a quat
     * Can also be used for dual quaternions. (Multiply it with the real part)
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {quat} q quaternion to transform with
     * @returns {vec3} out
     */
    function transformQuat(out, a, q) {
        // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
        var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
        var x = a[0], y = a[1], z = a[2]; // var qvec = [qx, qy, qz];
        // var uv = vec3.cross([], qvec, a);
        var uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x; // var uuv = vec3.cross([], qvec, uv);
        var uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx; // vec3.scale(uv, uv, 2 * w);
        var w2 = qw * 2;
        uvx *= w2;
        uvy *= w2;
        uvz *= w2; // vec3.scale(uuv, uuv, 2);
        uuvx *= 2;
        uuvy *= 2;
        uuvz *= 2; // return vec3.add(out, a, vec3.add(out, uv, uuv));
        out[0] = x + uvx + uuvx;
        out[1] = y + uvy + uuvy;
        out[2] = z + uvz + uuvz;
        return out;
    }
    /**
     * Rotate a 3D vector around the x-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
    function rotateX$1(out, a, b, c) {
        var p = [], r = []; //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2]; //perform rotation
        r[0] = p[0];
        r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
        r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c); //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];
        return out;
    }
    /**
     * Rotate a 3D vector around the y-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
    function rotateY$1(out, a, b, c) {
        var p = [], r = []; //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2]; //perform rotation
        r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
        r[1] = p[1];
        r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c); //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];
        return out;
    }
    /**
     * Rotate a 3D vector around the z-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
    function rotateZ$1(out, a, b, c) {
        var p = [], r = []; //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2]; //perform rotation
        r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
        r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
        r[2] = p[2]; //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];
        return out;
    }
    /**
     * Get the angle between two 3D vectors
     * @param {vec3} a The first operand
     * @param {vec3} b The second operand
     * @returns {Number} The angle in radians
     */
    function angle(a, b) {
        var tempA = fromValues$4(a[0], a[1], a[2]);
        var tempB = fromValues$4(b[0], b[1], b[2]);
        normalize(tempA, tempA);
        normalize(tempB, tempB);
        var cosine = dot(tempA, tempB);
        if (cosine > 1.0) {
            return 0;
        }
        else if (cosine < -1.0) {
            return Math.PI;
        }
        else {
            return Math.acos(cosine);
        }
    }
    /**
     * Set the components of a vec3 to zero
     *
     * @param {vec3} out the receiving vector
     * @returns {vec3} out
     */
    function zero(out) {
        out[0] = 0.0;
        out[1] = 0.0;
        out[2] = 0.0;
        return out;
    }
    /**
     * Returns a string representation of a vector
     *
     * @param {vec3} a vector to represent as a string
     * @returns {String} string representation of the vector
     */
    function str$4(a) {
        return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
    }
    /**
     * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
     *
     * @param {vec3} a The first vector.
     * @param {vec3} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function exactEquals$4(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    }
    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     *
     * @param {vec3} a The first vector.
     * @param {vec3} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function equals$5(a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2];
        var b0 = b[0], b1 = b[1], b2 = b[2];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
    }
    /**
     * Alias for {@link vec3.subtract}
     * @function
     */
    var sub$4 = subtract$4;
    /**
     * Alias for {@link vec3.multiply}
     * @function
     */
    var mul$4 = multiply$4;
    /**
     * Alias for {@link vec3.divide}
     * @function
     */
    var div = divide;
    /**
     * Alias for {@link vec3.distance}
     * @function
     */
    var dist = distance;
    /**
     * Alias for {@link vec3.squaredDistance}
     * @function
     */
    var sqrDist = squaredDistance;
    /**
     * Alias for {@link vec3.length}
     * @function
     */
    var len = length;
    /**
     * Alias for {@link vec3.squaredLength}
     * @function
     */
    var sqrLen = squaredLength;
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
    var forEach = (function () {
        var vec = create$4();
        return function (a, stride, offset, count, fn, arg) {
            var i, l;
            if (!stride) {
                stride = 3;
            }
            if (!offset) {
                offset = 0;
            }
            if (count) {
                l = Math.min(count * stride + offset, a.length);
            }
            else {
                l = a.length;
            }
            for (i = offset; i < l; i += stride) {
                vec[0] = a[i];
                vec[1] = a[i + 1];
                vec[2] = a[i + 2];
                fn(vec, vec, arg);
                a[i] = vec[0];
                a[i + 1] = vec[1];
                a[i + 2] = vec[2];
            }
            return a;
        };
    })();
    var vec3 = /*#__PURE__*/ Object.freeze({
        create: create$4,
        clone: clone$4,
        length: length,
        fromValues: fromValues$4,
        copy: copy$4,
        set: set$4,
        add: add$4,
        subtract: subtract$4,
        multiply: multiply$4,
        divide: divide,
        ceil: ceil,
        floor: floor,
        min: min,
        max: max,
        round: round,
        scale: scale$4,
        scaleAndAdd: scaleAndAdd,
        distance: distance,
        squaredDistance: squaredDistance,
        squaredLength: squaredLength,
        negate: negate,
        inverse: inverse,
        normalize: normalize,
        dot: dot,
        cross: cross,
        lerp: lerp,
        hermite: hermite,
        bezier: bezier,
        random: random,
        transformMat4: transformMat4,
        transformMat3: transformMat3,
        transformQuat: transformQuat,
        rotateX: rotateX$1,
        rotateY: rotateY$1,
        rotateZ: rotateZ$1,
        angle: angle,
        zero: zero,
        str: str$4,
        exactEquals: exactEquals$4,
        equals: equals$5,
        sub: sub$4,
        mul: mul$4,
        div: div,
        dist: dist,
        sqrDist: sqrDist,
        len: len,
        sqrLen: sqrLen,
        forEach: forEach,
    });
    /**
     * 4 Dimensional Vector
     * @module vec4
     */
    /**
     * Creates a new, empty vec4
     *
     * @returns {vec4} a new 4D vector
     */
    function create$5() {
        var out = new ARRAY_TYPE(4);
        if (ARRAY_TYPE != Float32Array) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
        }
        return out;
    }
    /**
     * Creates a new vec4 initialized with values from an existing vector
     *
     * @param {vec4} a vector to clone
     * @returns {vec4} a new 4D vector
     */
    function clone$5(a) {
        var out = new ARRAY_TYPE(4);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    /**
     * Creates a new vec4 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {vec4} a new 4D vector
     */
    function fromValues$5(x, y, z, w) {
        var out = new ARRAY_TYPE(4);
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    }
    /**
     * Copy the values from one vec4 to another
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the source vector
     * @returns {vec4} out
     */
    function copy$5(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    /**
     * Set the components of a vec4 to the given values
     *
     * @param {vec4} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {vec4} out
     */
    function set$5(out, x, y, z, w) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    }
    /**
     * Adds two vec4's
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {vec4} out
     */
    function add$5(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    }
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {vec4} out
     */
    function subtract$5(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        return out;
    }
    /**
     * Multiplies two vec4's
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {vec4} out
     */
    function multiply$5(out, a, b) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        out[3] = a[3] * b[3];
        return out;
    }
    /**
     * Divides two vec4's
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {vec4} out
     */
    function divide$1(out, a, b) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        out[3] = a[3] / b[3];
        return out;
    }
    /**
     * Math.ceil the components of a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to ceil
     * @returns {vec4} out
     */
    function ceil$1(out, a) {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        out[2] = Math.ceil(a[2]);
        out[3] = Math.ceil(a[3]);
        return out;
    }
    /**
     * Math.floor the components of a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to floor
     * @returns {vec4} out
     */
    function floor$1(out, a) {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        out[2] = Math.floor(a[2]);
        out[3] = Math.floor(a[3]);
        return out;
    }
    /**
     * Returns the minimum of two vec4's
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {vec4} out
     */
    function min$1(out, a, b) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        out[3] = Math.min(a[3], b[3]);
        return out;
    }
    /**
     * Returns the maximum of two vec4's
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {vec4} out
     */
    function max$1(out, a, b) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        out[3] = Math.max(a[3], b[3]);
        return out;
    }
    /**
     * Math.round the components of a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to round
     * @returns {vec4} out
     */
    function round$1(out, a) {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        out[3] = Math.round(a[3]);
        return out;
    }
    /**
     * Scales a vec4 by a scalar number
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec4} out
     */
    function scale$5(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        return out;
    }
    /**
     * Adds two vec4's after scaling the second operand by a scalar value
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @param {Number} scale the amount to scale b by before adding
     * @returns {vec4} out
     */
    function scaleAndAdd$1(out, a, b, scale) {
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        out[2] = a[2] + b[2] * scale;
        out[3] = a[3] + b[3] * scale;
        return out;
    }
    /**
     * Calculates the euclidian distance between two vec4's
     *
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {Number} distance between a and b
     */
    function distance$1(a, b) {
        var x = b[0] - a[0];
        var y = b[1] - a[1];
        var z = b[2] - a[2];
        var w = b[3] - a[3];
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    /**
     * Calculates the squared euclidian distance between two vec4's
     *
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {Number} squared distance between a and b
     */
    function squaredDistance$1(a, b) {
        var x = b[0] - a[0];
        var y = b[1] - a[1];
        var z = b[2] - a[2];
        var w = b[3] - a[3];
        return x * x + y * y + z * z + w * w;
    }
    /**
     * Calculates the length of a vec4
     *
     * @param {vec4} a vector to calculate length of
     * @returns {Number} length of a
     */
    function length$1(a) {
        var x = a[0];
        var y = a[1];
        var z = a[2];
        var w = a[3];
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    /**
     * Calculates the squared length of a vec4
     *
     * @param {vec4} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    function squaredLength$1(a) {
        var x = a[0];
        var y = a[1];
        var z = a[2];
        var w = a[3];
        return x * x + y * y + z * z + w * w;
    }
    /**
     * Negates the components of a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to negate
     * @returns {vec4} out
     */
    function negate$1(out, a) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = -a[3];
        return out;
    }
    /**
     * Returns the inverse of the components of a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to invert
     * @returns {vec4} out
     */
    function inverse$1(out, a) {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        out[3] = 1.0 / a[3];
        return out;
    }
    /**
     * Normalize a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to normalize
     * @returns {vec4} out
     */
    function normalize$1(out, a) {
        var x = a[0];
        var y = a[1];
        var z = a[2];
        var w = a[3];
        var len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
        }
        out[0] = x * len;
        out[1] = y * len;
        out[2] = z * len;
        out[3] = w * len;
        return out;
    }
    /**
     * Calculates the dot product of two vec4's
     *
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @returns {Number} dot product of a and b
     */
    function dot$1(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }
    /**
     * Returns the cross-product of three vectors in a 4-dimensional space
     *
     * @param {vec4} result the receiving vector
     * @param {vec4} U the first vector
     * @param {vec4} V the second vector
     * @param {vec4} W the third vector
     * @returns {vec4} result
     */
    function cross$1(out, u, v, w) {
        var A = v[0] * w[1] - v[1] * w[0], B = v[0] * w[2] - v[2] * w[0], C = v[0] * w[3] - v[3] * w[0], D = v[1] * w[2] - v[2] * w[1], E = v[1] * w[3] - v[3] * w[1], F = v[2] * w[3] - v[3] * w[2];
        var G = u[0];
        var H = u[1];
        var I = u[2];
        var J = u[3];
        out[0] = H * F - I * E + J * D;
        out[1] = -(G * F) + I * C - J * B;
        out[2] = G * E - H * C + J * A;
        out[3] = -(G * D) + H * B - I * A;
        return out;
    }
    /**
     * Performs a linear interpolation between two vec4's
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the first operand
     * @param {vec4} b the second operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {vec4} out
     */
    function lerp$1(out, a, b, t) {
        var ax = a[0];
        var ay = a[1];
        var az = a[2];
        var aw = a[3];
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        out[2] = az + t * (b[2] - az);
        out[3] = aw + t * (b[3] - aw);
        return out;
    }
    /**
     * Generates a random vector with the given scale
     *
     * @param {vec4} out the receiving vector
     * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
     * @returns {vec4} out
     */
    function random$1(out, scale) {
        scale = scale || 1.0; // Marsaglia, George. Choosing a Point from the Surface of a
        // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
        // http://projecteuclid.org/euclid.aoms/1177692644;
        var v1, v2, v3, v4;
        var s1, s2;
        do {
            v1 = RANDOM() * 2 - 1;
            v2 = RANDOM() * 2 - 1;
            s1 = v1 * v1 + v2 * v2;
        } while (s1 >= 1);
        do {
            v3 = RANDOM() * 2 - 1;
            v4 = RANDOM() * 2 - 1;
            s2 = v3 * v3 + v4 * v4;
        } while (s2 >= 1);
        var d = Math.sqrt((1 - s1) / s2);
        out[0] = scale * v1;
        out[1] = scale * v2;
        out[2] = scale * v3 * d;
        out[3] = scale * v4 * d;
        return out;
    }
    /**
     * Transforms the vec4 with a mat4.
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec4} out
     */
    function transformMat4$1(out, a, m) {
        var x = a[0], y = a[1], z = a[2], w = a[3];
        out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
        out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
        out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
        out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
        return out;
    }
    /**
     * Transforms the vec4 with a quat
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a the vector to transform
     * @param {quat} q quaternion to transform with
     * @returns {vec4} out
     */
    function transformQuat$1(out, a, q) {
        var x = a[0], y = a[1], z = a[2];
        var qx = q[0], qy = q[1], qz = q[2], qw = q[3]; // calculate quat * vec
        var ix = qw * x + qy * z - qz * y;
        var iy = qw * y + qz * x - qx * z;
        var iz = qw * z + qx * y - qy * x;
        var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat
        out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        out[3] = a[3];
        return out;
    }
    /**
     * Set the components of a vec4 to zero
     *
     * @param {vec4} out the receiving vector
     * @returns {vec4} out
     */
    function zero$1(out) {
        out[0] = 0.0;
        out[1] = 0.0;
        out[2] = 0.0;
        out[3] = 0.0;
        return out;
    }
    /**
     * Returns a string representation of a vector
     *
     * @param {vec4} a vector to represent as a string
     * @returns {String} string representation of the vector
     */
    function str$5(a) {
        return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
    }
    /**
     * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
     *
     * @param {vec4} a The first vector.
     * @param {vec4} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function exactEquals$5(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }
    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     *
     * @param {vec4} a The first vector.
     * @param {vec4} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function equals$6(a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
    }
    /**
     * Alias for {@link vec4.subtract}
     * @function
     */
    var sub$5 = subtract$5;
    /**
     * Alias for {@link vec4.multiply}
     * @function
     */
    var mul$5 = multiply$5;
    /**
     * Alias for {@link vec4.divide}
     * @function
     */
    var div$1 = divide$1;
    /**
     * Alias for {@link vec4.distance}
     * @function
     */
    var dist$1 = distance$1;
    /**
     * Alias for {@link vec4.squaredDistance}
     * @function
     */
    var sqrDist$1 = squaredDistance$1;
    /**
     * Alias for {@link vec4.length}
     * @function
     */
    var len$1 = length$1;
    /**
     * Alias for {@link vec4.squaredLength}
     * @function
     */
    var sqrLen$1 = squaredLength$1;
    /**
     * Perform some operation over an array of vec4s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
    var forEach$1 = (function () {
        var vec = create$5();
        return function (a, stride, offset, count, fn, arg) {
            var i, l;
            if (!stride) {
                stride = 4;
            }
            if (!offset) {
                offset = 0;
            }
            if (count) {
                l = Math.min(count * stride + offset, a.length);
            }
            else {
                l = a.length;
            }
            for (i = offset; i < l; i += stride) {
                vec[0] = a[i];
                vec[1] = a[i + 1];
                vec[2] = a[i + 2];
                vec[3] = a[i + 3];
                fn(vec, vec, arg);
                a[i] = vec[0];
                a[i + 1] = vec[1];
                a[i + 2] = vec[2];
                a[i + 3] = vec[3];
            }
            return a;
        };
    })();
    var vec4 = /*#__PURE__*/ Object.freeze({
        create: create$5,
        clone: clone$5,
        fromValues: fromValues$5,
        copy: copy$5,
        set: set$5,
        add: add$5,
        subtract: subtract$5,
        multiply: multiply$5,
        divide: divide$1,
        ceil: ceil$1,
        floor: floor$1,
        min: min$1,
        max: max$1,
        round: round$1,
        scale: scale$5,
        scaleAndAdd: scaleAndAdd$1,
        distance: distance$1,
        squaredDistance: squaredDistance$1,
        length: length$1,
        squaredLength: squaredLength$1,
        negate: negate$1,
        inverse: inverse$1,
        normalize: normalize$1,
        dot: dot$1,
        cross: cross$1,
        lerp: lerp$1,
        random: random$1,
        transformMat4: transformMat4$1,
        transformQuat: transformQuat$1,
        zero: zero$1,
        str: str$5,
        exactEquals: exactEquals$5,
        equals: equals$6,
        sub: sub$5,
        mul: mul$5,
        div: div$1,
        dist: dist$1,
        sqrDist: sqrDist$1,
        len: len$1,
        sqrLen: sqrLen$1,
        forEach: forEach$1,
    });
    /**
     * Quaternion
     * @module quat
     */
    /**
     * Creates a new identity quat
     *
     * @returns {quat} a new quaternion
     */
    function create$6() {
        var out = new ARRAY_TYPE(4);
        if (ARRAY_TYPE != Float32Array) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
        }
        out[3] = 1;
        return out;
    }
    /**
     * Set a quat to the identity quaternion
     *
     * @param {quat} out the receiving quaternion
     * @returns {quat} out
     */
    function identity$4(out) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
    }
    /**
     * Sets a quat from the given angle and rotation axis,
     * then returns it.
     *
     * @param {quat} out the receiving quaternion
     * @param {vec3} axis the axis around which to rotate
     * @param {Number} rad the angle in radians
     * @returns {quat} out
     **/
    function setAxisAngle(out, axis, rad) {
        rad = rad * 0.5;
        var s = Math.sin(rad);
        out[0] = s * axis[0];
        out[1] = s * axis[1];
        out[2] = s * axis[2];
        out[3] = Math.cos(rad);
        return out;
    }
    /**
     * Gets the rotation axis and angle for a given
     *  quaternion. If a quaternion is created with
     *  setAxisAngle, this method will return the same
     *  values as providied in the original parameter list
     *  OR functionally equivalent values.
     * Example: The quaternion formed by axis [0, 0, 1] and
     *  angle -90 is the same as the quaternion formed by
     *  [0, 0, 1] and 270. This method favors the latter.
     * @param  {vec3} out_axis  Vector receiving the axis of rotation
     * @param  {quat} q     Quaternion to be decomposed
     * @return {Number}     Angle, in radians, of the rotation
     */
    function getAxisAngle(out_axis, q) {
        var rad = Math.acos(q[3]) * 2.0;
        var s = Math.sin(rad / 2.0);
        if (s > EPSILON) {
            out_axis[0] = q[0] / s;
            out_axis[1] = q[1] / s;
            out_axis[2] = q[2] / s;
        }
        else {
            // If s is zero, return any axis (no rotation - axis does not matter)
            out_axis[0] = 1;
            out_axis[1] = 0;
            out_axis[2] = 0;
        }
        return rad;
    }
    /**
     * Multiplies two quat's
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @returns {quat} out
     */
    function multiply$6(out, a, b) {
        var ax = a[0], ay = a[1], az = a[2], aw = a[3];
        var bx = b[0], by = b[1], bz = b[2], bw = b[3];
        out[0] = ax * bw + aw * bx + ay * bz - az * by;
        out[1] = ay * bw + aw * by + az * bx - ax * bz;
        out[2] = az * bw + aw * bz + ax * by - ay * bx;
        out[3] = aw * bw - ax * bx - ay * by - az * bz;
        return out;
    }
    /**
     * Rotates a quaternion by the given angle about the X axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    function rotateX$2(out, a, rad) {
        rad *= 0.5;
        var ax = a[0], ay = a[1], az = a[2], aw = a[3];
        var bx = Math.sin(rad), bw = Math.cos(rad);
        out[0] = ax * bw + aw * bx;
        out[1] = ay * bw + az * bx;
        out[2] = az * bw - ay * bx;
        out[3] = aw * bw - ax * bx;
        return out;
    }
    /**
     * Rotates a quaternion by the given angle about the Y axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    function rotateY$2(out, a, rad) {
        rad *= 0.5;
        var ax = a[0], ay = a[1], az = a[2], aw = a[3];
        var by = Math.sin(rad), bw = Math.cos(rad);
        out[0] = ax * bw - az * by;
        out[1] = ay * bw + aw * by;
        out[2] = az * bw + ax * by;
        out[3] = aw * bw - ay * by;
        return out;
    }
    /**
     * Rotates a quaternion by the given angle about the Z axis
     *
     * @param {quat} out quat receiving operation result
     * @param {quat} a quat to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {quat} out
     */
    function rotateZ$2(out, a, rad) {
        rad *= 0.5;
        var ax = a[0], ay = a[1], az = a[2], aw = a[3];
        var bz = Math.sin(rad), bw = Math.cos(rad);
        out[0] = ax * bw + ay * bz;
        out[1] = ay * bw - ax * bz;
        out[2] = az * bw + aw * bz;
        out[3] = aw * bw - az * bz;
        return out;
    }
    /**
     * Calculates the W component of a quat from the X, Y, and Z components.
     * Assumes that quaternion is 1 unit in length.
     * Any existing W component will be ignored.
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quat to calculate W component of
     * @returns {quat} out
     */
    function calculateW(out, a) {
        var x = a[0], y = a[1], z = a[2];
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
        return out;
    }
    /**
     * Performs a spherical linear interpolation between two quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {quat} out
     */
    function slerp(out, a, b, t) {
        // benchmarks:
        //    http://jsperf.com/quaternion-slerp-implementations
        var ax = a[0], ay = a[1], az = a[2], aw = a[3];
        var bx = b[0], by = b[1], bz = b[2], bw = b[3];
        var omega, cosom, sinom, scale0, scale1; // calc cosine
        cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        } // calculate coefficients
        if (1.0 - cosom > EPSILON) {
            // standard case (slerp)
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        }
        else {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        } // calculate final values
        out[0] = scale0 * ax + scale1 * bx;
        out[1] = scale0 * ay + scale1 * by;
        out[2] = scale0 * az + scale1 * bz;
        out[3] = scale0 * aw + scale1 * bw;
        return out;
    }
    /**
     * Generates a random quaternion
     *
     * @param {quat} out the receiving quaternion
     * @returns {quat} out
     */
    function random$2(out) {
        // Implementation of http://planning.cs.uiuc.edu/node198.html
        // TODO: Calling random 3 times is probably not the fastest solution
        var u1 = RANDOM();
        var u2 = RANDOM();
        var u3 = RANDOM();
        var sqrt1MinusU1 = Math.sqrt(1 - u1);
        var sqrtU1 = Math.sqrt(u1);
        out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
        out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
        out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
        out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
        return out;
    }
    /**
     * Calculates the inverse of a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quat to calculate inverse of
     * @returns {quat} out
     */
    function invert$4(out, a) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        var dot$$1 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        var invDot = dot$$1 ? 1.0 / dot$$1 : 0; // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
        out[0] = -a0 * invDot;
        out[1] = -a1 * invDot;
        out[2] = -a2 * invDot;
        out[3] = a3 * invDot;
        return out;
    }
    /**
     * Calculates the conjugate of a quat
     * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quat to calculate conjugate of
     * @returns {quat} out
     */
    function conjugate(out, a) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a[3];
        return out;
    }
    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     *
     * NOTE: The resultant quaternion is not normalized, so you should be sure
     * to renormalize the quaternion yourself where necessary.
     *
     * @param {quat} out the receiving quaternion
     * @param {mat3} m rotation matrix
     * @returns {quat} out
     * @function
     */
    function fromMat3(out, m) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        var fTrace = m[0] + m[4] + m[8];
        var fRoot;
        if (fTrace > 0.0) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0); // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot; // 1/(4w)
            out[0] = (m[5] - m[7]) * fRoot;
            out[1] = (m[6] - m[2]) * fRoot;
            out[2] = (m[1] - m[3]) * fRoot;
        }
        else {
            // |w| <= 1/2
            var i = 0;
            if (m[4] > m[0])
                i = 1;
            if (m[8] > m[i * 3 + i])
                i = 2;
            var j = (i + 1) % 3;
            var k = (i + 2) % 3;
            fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
            out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
            out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
        }
        return out;
    }
    /**
     * Creates a quaternion from the given euler angle x, y, z.
     *
     * @param {quat} out the receiving quaternion
     * @param {x} Angle to rotate around X axis in degrees.
     * @param {y} Angle to rotate around Y axis in degrees.
     * @param {z} Angle to rotate around Z axis in degrees.
     * @returns {quat} out
     * @function
     */
    function fromEuler(out, x, y, z) {
        var halfToRad = (0.5 * Math.PI) / 180.0;
        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;
        var sx = Math.sin(x);
        var cx = Math.cos(x);
        var sy = Math.sin(y);
        var cy = Math.cos(y);
        var sz = Math.sin(z);
        var cz = Math.cos(z);
        out[0] = sx * cy * cz - cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz + sx * sy * sz;
        return out;
    }
    /**
     * Returns a string representation of a quatenion
     *
     * @param {quat} a vector to represent as a string
     * @returns {String} string representation of the vector
     */
    function str$6(a) {
        return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
    }
    /**
     * Creates a new quat initialized with values from an existing quaternion
     *
     * @param {quat} a quaternion to clone
     * @returns {quat} a new quaternion
     * @function
     */
    var clone$6 = clone$5;
    /**
     * Creates a new quat initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {quat} a new quaternion
     * @function
     */
    var fromValues$6 = fromValues$5;
    /**
     * Copy the values from one quat to another
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the source quaternion
     * @returns {quat} out
     * @function
     */
    var copy$6 = copy$5;
    /**
     * Set the components of a quat to the given values
     *
     * @param {quat} out the receiving quaternion
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @param {Number} w W component
     * @returns {quat} out
     * @function
     */
    var set$6 = set$5;
    /**
     * Adds two quat's
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @returns {quat} out
     * @function
     */
    var add$6 = add$5;
    /**
     * Alias for {@link quat.multiply}
     * @function
     */
    var mul$6 = multiply$6;
    /**
     * Scales a quat by a scalar number
     *
     * @param {quat} out the receiving vector
     * @param {quat} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {quat} out
     * @function
     */
    var scale$6 = scale$5;
    /**
     * Calculates the dot product of two quat's
     *
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @returns {Number} dot product of a and b
     * @function
     */
    var dot$2 = dot$1;
    /**
     * Performs a linear interpolation between two quat's
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {quat} out
     * @function
     */
    var lerp$2 = lerp$1;
    /**
     * Calculates the length of a quat
     *
     * @param {quat} a vector to calculate length of
     * @returns {Number} length of a
     */
    var length$2 = length$1;
    /**
     * Alias for {@link quat.length}
     * @function
     */
    var len$2 = length$2;
    /**
     * Calculates the squared length of a quat
     *
     * @param {quat} a vector to calculate squared length of
     * @returns {Number} squared length of a
     * @function
     */
    var squaredLength$2 = squaredLength$1;
    /**
     * Alias for {@link quat.squaredLength}
     * @function
     */
    var sqrLen$2 = squaredLength$2;
    /**
     * Normalize a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quaternion to normalize
     * @returns {quat} out
     * @function
     */
    var normalize$2 = normalize$1;
    /**
     * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
     *
     * @param {quat} a The first quaternion.
     * @param {quat} b The second quaternion.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    var exactEquals$6 = exactEquals$5;
    /**
     * Returns whether or not the quaternions have approximately the same elements in the same position.
     *
     * @param {quat} a The first vector.
     * @param {quat} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    var equals$7 = equals$6;
    /**
     * Sets a quaternion to represent the shortest rotation from one
     * vector to another.
     *
     * Both vectors are assumed to be unit length.
     *
     * @param {quat} out the receiving quaternion.
     * @param {vec3} a the initial vector
     * @param {vec3} b the destination vector
     * @returns {quat} out
     */
    var rotationTo = (function () {
        var tmpvec3 = create$4();
        var xUnitVec3 = fromValues$4(1, 0, 0);
        var yUnitVec3 = fromValues$4(0, 1, 0);
        return function (out, a, b) {
            var dot$$1 = dot(a, b);
            if (dot$$1 < -0.999999) {
                cross(tmpvec3, xUnitVec3, a);
                if (len(tmpvec3) < 0.000001)
                    cross(tmpvec3, yUnitVec3, a);
                normalize(tmpvec3, tmpvec3);
                setAxisAngle(out, tmpvec3, Math.PI);
                return out;
            }
            else if (dot$$1 > 0.999999) {
                out[0] = 0;
                out[1] = 0;
                out[2] = 0;
                out[3] = 1;
                return out;
            }
            else {
                cross(tmpvec3, a, b);
                out[0] = tmpvec3[0];
                out[1] = tmpvec3[1];
                out[2] = tmpvec3[2];
                out[3] = 1 + dot$$1;
                return normalize$2(out, out);
            }
        };
    })();
    /**
     * Performs a spherical linear interpolation with two control points
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a the first operand
     * @param {quat} b the second operand
     * @param {quat} c the third operand
     * @param {quat} d the fourth operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {quat} out
     */
    var sqlerp = (function () {
        var temp1 = create$6();
        var temp2 = create$6();
        return function (out, a, b, c, d, t) {
            slerp(temp1, a, d, t);
            slerp(temp2, b, c, t);
            slerp(out, temp1, temp2, 2 * t * (1 - t));
            return out;
        };
    })();
    /**
     * Sets the specified quaternion with values corresponding to the given
     * axes. Each axis is a vec3 and is expected to be unit length and
     * perpendicular to all other specified axes.
     *
     * @param {vec3} view  the vector representing the viewing direction
     * @param {vec3} right the vector representing the local "right" direction
     * @param {vec3} up    the vector representing the local "up" direction
     * @returns {quat} out
     */
    var setAxes = (function () {
        var matr = create$2();
        return function (out, view, right, up) {
            matr[0] = right[0];
            matr[3] = right[1];
            matr[6] = right[2];
            matr[1] = up[0];
            matr[4] = up[1];
            matr[7] = up[2];
            matr[2] = -view[0];
            matr[5] = -view[1];
            matr[8] = -view[2];
            return normalize$2(out, fromMat3(out, matr));
        };
    })();
    var quat = /*#__PURE__*/ Object.freeze({
        create: create$6,
        identity: identity$4,
        setAxisAngle: setAxisAngle,
        getAxisAngle: getAxisAngle,
        multiply: multiply$6,
        rotateX: rotateX$2,
        rotateY: rotateY$2,
        rotateZ: rotateZ$2,
        calculateW: calculateW,
        slerp: slerp,
        random: random$2,
        invert: invert$4,
        conjugate: conjugate,
        fromMat3: fromMat3,
        fromEuler: fromEuler,
        str: str$6,
        clone: clone$6,
        fromValues: fromValues$6,
        copy: copy$6,
        set: set$6,
        add: add$6,
        mul: mul$6,
        scale: scale$6,
        dot: dot$2,
        lerp: lerp$2,
        length: length$2,
        len: len$2,
        squaredLength: squaredLength$2,
        sqrLen: sqrLen$2,
        normalize: normalize$2,
        exactEquals: exactEquals$6,
        equals: equals$7,
        rotationTo: rotationTo,
        sqlerp: sqlerp,
        setAxes: setAxes,
    });
    /**
     * Dual Quaternion<br>
     * Format: [real, dual]<br>
     * Quaternion format: XYZW<br>
     * Make sure to have normalized dual quaternions, otherwise the functions may not work as intended.<br>
     * @module quat2
     */
    /**
     * Creates a new identity dual quat
     *
     * @returns {quat2} a new dual quaternion [real -> rotation, dual -> translation]
     */
    function create$7() {
        var dq = new ARRAY_TYPE(8);
        if (ARRAY_TYPE != Float32Array) {
            dq[0] = 0;
            dq[1] = 0;
            dq[2] = 0;
            dq[4] = 0;
            dq[5] = 0;
            dq[6] = 0;
            dq[7] = 0;
        }
        dq[3] = 1;
        return dq;
    }
    /**
     * Creates a new quat initialized with values from an existing quaternion
     *
     * @param {quat2} a dual quaternion to clone
     * @returns {quat2} new dual quaternion
     * @function
     */
    function clone$7(a) {
        var dq = new ARRAY_TYPE(8);
        dq[0] = a[0];
        dq[1] = a[1];
        dq[2] = a[2];
        dq[3] = a[3];
        dq[4] = a[4];
        dq[5] = a[5];
        dq[6] = a[6];
        dq[7] = a[7];
        return dq;
    }
    /**
     * Creates a new dual quat initialized with the given values
     *
     * @param {Number} x1 X component
     * @param {Number} y1 Y component
     * @param {Number} z1 Z component
     * @param {Number} w1 W component
     * @param {Number} x2 X component
     * @param {Number} y2 Y component
     * @param {Number} z2 Z component
     * @param {Number} w2 W component
     * @returns {quat2} new dual quaternion
     * @function
     */
    function fromValues$7(x1, y1, z1, w1, x2, y2, z2, w2) {
        var dq = new ARRAY_TYPE(8);
        dq[0] = x1;
        dq[1] = y1;
        dq[2] = z1;
        dq[3] = w1;
        dq[4] = x2;
        dq[5] = y2;
        dq[6] = z2;
        dq[7] = w2;
        return dq;
    }
    /**
     * Creates a new dual quat from the given values (quat and translation)
     *
     * @param {Number} x1 X component
     * @param {Number} y1 Y component
     * @param {Number} z1 Z component
     * @param {Number} w1 W component
     * @param {Number} x2 X component (translation)
     * @param {Number} y2 Y component (translation)
     * @param {Number} z2 Z component (translation)
     * @returns {quat2} new dual quaternion
     * @function
     */
    function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
        var dq = new ARRAY_TYPE(8);
        dq[0] = x1;
        dq[1] = y1;
        dq[2] = z1;
        dq[3] = w1;
        var ax = x2 * 0.5, ay = y2 * 0.5, az = z2 * 0.5;
        dq[4] = ax * w1 + ay * z1 - az * y1;
        dq[5] = ay * w1 + az * x1 - ax * z1;
        dq[6] = az * w1 + ax * y1 - ay * x1;
        dq[7] = -ax * x1 - ay * y1 - az * z1;
        return dq;
    }
    /**
     * Creates a dual quat from a quaternion and a translation
     *
     * @param {quat2} dual quaternion receiving operation result
     * @param {quat} q quaternion
     * @param {vec3} t tranlation vector
     * @returns {quat2} dual quaternion receiving operation result
     * @function
     */
    function fromRotationTranslation$1(out, q, t) {
        var ax = t[0] * 0.5, ay = t[1] * 0.5, az = t[2] * 0.5, bx = q[0], by = q[1], bz = q[2], bw = q[3];
        out[0] = bx;
        out[1] = by;
        out[2] = bz;
        out[3] = bw;
        out[4] = ax * bw + ay * bz - az * by;
        out[5] = ay * bw + az * bx - ax * bz;
        out[6] = az * bw + ax * by - ay * bx;
        out[7] = -ax * bx - ay * by - az * bz;
        return out;
    }
    /**
     * Creates a dual quat from a translation
     *
     * @param {quat2} dual quaternion receiving operation result
     * @param {vec3} t translation vector
     * @returns {quat2} dual quaternion receiving operation result
     * @function
     */
    function fromTranslation$3(out, t) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        out[4] = t[0] * 0.5;
        out[5] = t[1] * 0.5;
        out[6] = t[2] * 0.5;
        out[7] = 0;
        return out;
    }
    /**
     * Creates a dual quat from a quaternion
     *
     * @param {quat2} dual quaternion receiving operation result
     * @param {quat} q the quaternion
     * @returns {quat2} dual quaternion receiving operation result
     * @function
     */
    function fromRotation$4(out, q) {
        out[0] = q[0];
        out[1] = q[1];
        out[2] = q[2];
        out[3] = q[3];
        out[4] = 0;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        return out;
    }
    /**
     * Creates a new dual quat from a matrix (4x4)
     *
     * @param {quat2} out the dual quaternion
     * @param {mat4} a the matrix
     * @returns {quat2} dual quat receiving operation result
     * @function
     */
    function fromMat4$1(out, a) {
        //TODO Optimize this
        var outer = create$6();
        getRotation(outer, a);
        var t = new ARRAY_TYPE(3);
        getTranslation(t, a);
        fromRotationTranslation$1(out, outer, t);
        return out;
    }
    /**
     * Copy the values from one dual quat to another
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the source dual quaternion
     * @returns {quat2} out
     * @function
     */
    function copy$7(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        return out;
    }
    /**
     * Set a dual quat to the identity dual quaternion
     *
     * @param {quat2} out the receiving quaternion
     * @returns {quat2} out
     */
    function identity$5(out) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        out[4] = 0;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        return out;
    }
    /**
     * Set the components of a dual quat to the given values
     *
     * @param {quat2} out the receiving quaternion
     * @param {Number} x1 X component
     * @param {Number} y1 Y component
     * @param {Number} z1 Z component
     * @param {Number} w1 W component
     * @param {Number} x2 X component
     * @param {Number} y2 Y component
     * @param {Number} z2 Z component
     * @param {Number} w2 W component
     * @returns {quat2} out
     * @function
     */
    function set$7(out, x1, y1, z1, w1, x2, y2, z2, w2) {
        out[0] = x1;
        out[1] = y1;
        out[2] = z1;
        out[3] = w1;
        out[4] = x2;
        out[5] = y2;
        out[6] = z2;
        out[7] = w2;
        return out;
    }
    /**
     * Gets the real part of a dual quat
     * @param  {quat} out real part
     * @param  {quat2} a Dual Quaternion
     * @return {quat} real part
     */
    var getReal = copy$6;
    /**
     * Gets the dual part of a dual quat
     * @param  {quat} out dual part
     * @param  {quat2} a Dual Quaternion
     * @return {quat} dual part
     */
    function getDual(out, a) {
        out[0] = a[4];
        out[1] = a[5];
        out[2] = a[6];
        out[3] = a[7];
        return out;
    }
    /**
     * Set the real component of a dual quat to the given quaternion
     *
     * @param {quat2} out the receiving quaternion
     * @param {quat} q a quaternion representing the real part
     * @returns {quat2} out
     * @function
     */
    var setReal = copy$6;
    /**
     * Set the dual component of a dual quat to the given quaternion
     *
     * @param {quat2} out the receiving quaternion
     * @param {quat} q a quaternion representing the dual part
     * @returns {quat2} out
     * @function
     */
    function setDual(out, q) {
        out[4] = q[0];
        out[5] = q[1];
        out[6] = q[2];
        out[7] = q[3];
        return out;
    }
    /**
     * Gets the translation of a normalized dual quat
     * @param  {vec3} out translation
     * @param  {quat2} a Dual Quaternion to be decomposed
     * @return {vec3} translation
     */
    function getTranslation$1(out, a) {
        var ax = a[4], ay = a[5], az = a[6], aw = a[7], bx = -a[0], by = -a[1], bz = -a[2], bw = a[3];
        out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
        out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
        out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
        return out;
    }
    /**
     * Translates a dual quat by the given vector
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the dual quaternion to translate
     * @param {vec3} v vector to translate by
     * @returns {quat2} out
     */
    function translate$3(out, a, v) {
        var ax1 = a[0], ay1 = a[1], az1 = a[2], aw1 = a[3], bx1 = v[0] * 0.5, by1 = v[1] * 0.5, bz1 = v[2] * 0.5, ax2 = a[4], ay2 = a[5], az2 = a[6], aw2 = a[7];
        out[0] = ax1;
        out[1] = ay1;
        out[2] = az1;
        out[3] = aw1;
        out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
        out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
        out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
        out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
        return out;
    }
    /**
     * Rotates a dual quat around the X axis
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the dual quaternion to rotate
     * @param {number} rad how far should the rotation be
     * @returns {quat2} out
     */
    function rotateX$3(out, a, rad) {
        var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
        rotateX$2(out, a, rad);
        bx = out[0];
        by = out[1];
        bz = out[2];
        bw = out[3];
        out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
        out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
        out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
        out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
        return out;
    }
    /**
     * Rotates a dual quat around the Y axis
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the dual quaternion to rotate
     * @param {number} rad how far should the rotation be
     * @returns {quat2} out
     */
    function rotateY$3(out, a, rad) {
        var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
        rotateY$2(out, a, rad);
        bx = out[0];
        by = out[1];
        bz = out[2];
        bw = out[3];
        out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
        out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
        out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
        out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
        return out;
    }
    /**
     * Rotates a dual quat around the Z axis
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the dual quaternion to rotate
     * @param {number} rad how far should the rotation be
     * @returns {quat2} out
     */
    function rotateZ$3(out, a, rad) {
        var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
        rotateZ$2(out, a, rad);
        bx = out[0];
        by = out[1];
        bz = out[2];
        bw = out[3];
        out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
        out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
        out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
        out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
        return out;
    }
    /**
     * Rotates a dual quat by a given quaternion (a * q)
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the dual quaternion to rotate
     * @param {quat} q quaternion to rotate by
     * @returns {quat2} out
     */
    function rotateByQuatAppend(out, a, q) {
        var qx = q[0], qy = q[1], qz = q[2], qw = q[3], ax = a[0], ay = a[1], az = a[2], aw = a[3];
        out[0] = ax * qw + aw * qx + ay * qz - az * qy;
        out[1] = ay * qw + aw * qy + az * qx - ax * qz;
        out[2] = az * qw + aw * qz + ax * qy - ay * qx;
        out[3] = aw * qw - ax * qx - ay * qy - az * qz;
        ax = a[4];
        ay = a[5];
        az = a[6];
        aw = a[7];
        out[4] = ax * qw + aw * qx + ay * qz - az * qy;
        out[5] = ay * qw + aw * qy + az * qx - ax * qz;
        out[6] = az * qw + aw * qz + ax * qy - ay * qx;
        out[7] = aw * qw - ax * qx - ay * qy - az * qz;
        return out;
    }
    /**
     * Rotates a dual quat by a given quaternion (q * a)
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat} q quaternion to rotate by
     * @param {quat2} a the dual quaternion to rotate
     * @returns {quat2} out
     */
    function rotateByQuatPrepend(out, q, a) {
        var qx = q[0], qy = q[1], qz = q[2], qw = q[3], bx = a[0], by = a[1], bz = a[2], bw = a[3];
        out[0] = qx * bw + qw * bx + qy * bz - qz * by;
        out[1] = qy * bw + qw * by + qz * bx - qx * bz;
        out[2] = qz * bw + qw * bz + qx * by - qy * bx;
        out[3] = qw * bw - qx * bx - qy * by - qz * bz;
        bx = a[4];
        by = a[5];
        bz = a[6];
        bw = a[7];
        out[4] = qx * bw + qw * bx + qy * bz - qz * by;
        out[5] = qy * bw + qw * by + qz * bx - qx * bz;
        out[6] = qz * bw + qw * bz + qx * by - qy * bx;
        out[7] = qw * bw - qx * bx - qy * by - qz * bz;
        return out;
    }
    /**
     * Rotates a dual quat around a given axis. Does the normalisation automatically
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the dual quaternion to rotate
     * @param {vec3} axis the axis to rotate around
     * @param {Number} rad how far the rotation should be
     * @returns {quat2} out
     */
    function rotateAroundAxis(out, a, axis, rad) {
        //Special case for rad = 0
        if (Math.abs(rad) < EPSILON) {
            return copy$7(out, a);
        }
        var axisLength = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
        rad = rad * 0.5;
        var s = Math.sin(rad);
        var bx = (s * axis[0]) / axisLength;
        var by = (s * axis[1]) / axisLength;
        var bz = (s * axis[2]) / axisLength;
        var bw = Math.cos(rad);
        var ax1 = a[0], ay1 = a[1], az1 = a[2], aw1 = a[3];
        out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
        out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
        out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
        out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
        var ax = a[4], ay = a[5], az = a[6], aw = a[7];
        out[4] = ax * bw + aw * bx + ay * bz - az * by;
        out[5] = ay * bw + aw * by + az * bx - ax * bz;
        out[6] = az * bw + aw * bz + ax * by - ay * bx;
        out[7] = aw * bw - ax * bx - ay * by - az * bz;
        return out;
    }
    /**
     * Adds two dual quat's
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the first operand
     * @param {quat2} b the second operand
     * @returns {quat2} out
     * @function
     */
    function add$7(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        out[4] = a[4] + b[4];
        out[5] = a[5] + b[5];
        out[6] = a[6] + b[6];
        out[7] = a[7] + b[7];
        return out;
    }
    /**
     * Multiplies two dual quat's
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a the first operand
     * @param {quat2} b the second operand
     * @returns {quat2} out
     */
    function multiply$7(out, a, b) {
        var ax0 = a[0], ay0 = a[1], az0 = a[2], aw0 = a[3], bx1 = b[4], by1 = b[5], bz1 = b[6], bw1 = b[7], ax1 = a[4], ay1 = a[5], az1 = a[6], aw1 = a[7], bx0 = b[0], by0 = b[1], bz0 = b[2], bw0 = b[3];
        out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
        out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
        out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
        out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
        out[4] =
            ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
        out[5] =
            ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
        out[6] =
            az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
        out[7] =
            aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
        return out;
    }
    /**
     * Alias for {@link quat2.multiply}
     * @function
     */
    var mul$7 = multiply$7;
    /**
     * Scales a dual quat by a scalar number
     *
     * @param {quat2} out the receiving dual quat
     * @param {quat2} a the dual quat to scale
     * @param {Number} b amount to scale the dual quat by
     * @returns {quat2} out
     * @function
     */
    function scale$7(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        out[4] = a[4] * b;
        out[5] = a[5] * b;
        out[6] = a[6] * b;
        out[7] = a[7] * b;
        return out;
    }
    /**
     * Calculates the dot product of two dual quat's (The dot product of the real parts)
     *
     * @param {quat2} a the first operand
     * @param {quat2} b the second operand
     * @returns {Number} dot product of a and b
     * @function
     */
    var dot$3 = dot$2;
    /**
     * Performs a linear interpolation between two dual quats's
     * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
     *
     * @param {quat2} out the receiving dual quat
     * @param {quat2} a the first operand
     * @param {quat2} b the second operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {quat2} out
     */
    function lerp$3(out, a, b, t) {
        var mt = 1 - t;
        if (dot$3(a, b) < 0)
            t = -t;
        out[0] = a[0] * mt + b[0] * t;
        out[1] = a[1] * mt + b[1] * t;
        out[2] = a[2] * mt + b[2] * t;
        out[3] = a[3] * mt + b[3] * t;
        out[4] = a[4] * mt + b[4] * t;
        out[5] = a[5] * mt + b[5] * t;
        out[6] = a[6] * mt + b[6] * t;
        out[7] = a[7] * mt + b[7] * t;
        return out;
    }
    /**
     * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a dual quat to calculate inverse of
     * @returns {quat2} out
     */
    function invert$5(out, a) {
        var sqlen = squaredLength$3(a);
        out[0] = -a[0] / sqlen;
        out[1] = -a[1] / sqlen;
        out[2] = -a[2] / sqlen;
        out[3] = a[3] / sqlen;
        out[4] = -a[4] / sqlen;
        out[5] = -a[5] / sqlen;
        out[6] = -a[6] / sqlen;
        out[7] = a[7] / sqlen;
        return out;
    }
    /**
     * Calculates the conjugate of a dual quat
     * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
     *
     * @param {quat2} out the receiving quaternion
     * @param {quat2} a quat to calculate conjugate of
     * @returns {quat2} out
     */
    function conjugate$1(out, a) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a[3];
        out[4] = -a[4];
        out[5] = -a[5];
        out[6] = -a[6];
        out[7] = a[7];
        return out;
    }
    /**
     * Calculates the length of a dual quat
     *
     * @param {quat2} a dual quat to calculate length of
     * @returns {Number} length of a
     * @function
     */
    var length$3 = length$2;
    /**
     * Alias for {@link quat2.length}
     * @function
     */
    var len$3 = length$3;
    /**
     * Calculates the squared length of a dual quat
     *
     * @param {quat2} a dual quat to calculate squared length of
     * @returns {Number} squared length of a
     * @function
     */
    var squaredLength$3 = squaredLength$2;
    /**
     * Alias for {@link quat2.squaredLength}
     * @function
     */
    var sqrLen$3 = squaredLength$3;
    /**
     * Normalize a dual quat
     *
     * @param {quat2} out the receiving dual quaternion
     * @param {quat2} a dual quaternion to normalize
     * @returns {quat2} out
     * @function
     */
    function normalize$3(out, a) {
        var magnitude = squaredLength$3(a);
        if (magnitude > 0) {
            magnitude = Math.sqrt(magnitude);
            var a0 = a[0] / magnitude;
            var a1 = a[1] / magnitude;
            var a2 = a[2] / magnitude;
            var a3 = a[3] / magnitude;
            var b0 = a[4];
            var b1 = a[5];
            var b2 = a[6];
            var b3 = a[7];
            var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
            out[0] = a0;
            out[1] = a1;
            out[2] = a2;
            out[3] = a3;
            out[4] = (b0 - a0 * a_dot_b) / magnitude;
            out[5] = (b1 - a1 * a_dot_b) / magnitude;
            out[6] = (b2 - a2 * a_dot_b) / magnitude;
            out[7] = (b3 - a3 * a_dot_b) / magnitude;
        }
        return out;
    }
    /**
     * Returns a string representation of a dual quatenion
     *
     * @param {quat2} a dual quaternion to represent as a string
     * @returns {String} string representation of the dual quat
     */
    function str$7(a) {
        return ('quat2(' +
            a[0] +
            ', ' +
            a[1] +
            ', ' +
            a[2] +
            ', ' +
            a[3] +
            ', ' +
            a[4] +
            ', ' +
            a[5] +
            ', ' +
            a[6] +
            ', ' +
            a[7] +
            ')');
    }
    /**
     * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
     *
     * @param {quat2} a the first dual quaternion.
     * @param {quat2} b the second dual quaternion.
     * @returns {Boolean} true if the dual quaternions are equal, false otherwise.
     */
    function exactEquals$7(a, b) {
        return (a[0] === b[0] &&
            a[1] === b[1] &&
            a[2] === b[2] &&
            a[3] === b[3] &&
            a[4] === b[4] &&
            a[5] === b[5] &&
            a[6] === b[6] &&
            a[7] === b[7]);
    }
    /**
     * Returns whether or not the dual quaternions have approximately the same elements in the same position.
     *
     * @param {quat2} a the first dual quat.
     * @param {quat2} b the second dual quat.
     * @returns {Boolean} true if the dual quats are equal, false otherwise.
     */
    function equals$8(a, b) {
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)));
    }
    var quat2 = /*#__PURE__*/ Object.freeze({
        create: create$7,
        clone: clone$7,
        fromValues: fromValues$7,
        fromRotationTranslationValues: fromRotationTranslationValues,
        fromRotationTranslation: fromRotationTranslation$1,
        fromTranslation: fromTranslation$3,
        fromRotation: fromRotation$4,
        fromMat4: fromMat4$1,
        copy: copy$7,
        identity: identity$5,
        set: set$7,
        getReal: getReal,
        getDual: getDual,
        setReal: setReal,
        setDual: setDual,
        getTranslation: getTranslation$1,
        translate: translate$3,
        rotateX: rotateX$3,
        rotateY: rotateY$3,
        rotateZ: rotateZ$3,
        rotateByQuatAppend: rotateByQuatAppend,
        rotateByQuatPrepend: rotateByQuatPrepend,
        rotateAroundAxis: rotateAroundAxis,
        add: add$7,
        multiply: multiply$7,
        mul: mul$7,
        scale: scale$7,
        dot: dot$3,
        lerp: lerp$3,
        invert: invert$5,
        conjugate: conjugate$1,
        length: length$3,
        len: len$3,
        squaredLength: squaredLength$3,
        sqrLen: sqrLen$3,
        normalize: normalize$3,
        str: str$7,
        exactEquals: exactEquals$7,
        equals: equals$8,
    });
    /**
     * 2 Dimensional Vector
     * @module vec2
     */
    /**
     * Creates a new, empty vec2
     *
     * @returns {vec2} a new 2D vector
     */
    function create$8() {
        var out = new ARRAY_TYPE(2);
        if (ARRAY_TYPE != Float32Array) {
            out[0] = 0;
            out[1] = 0;
        }
        return out;
    }
    /**
     * Creates a new vec2 initialized with values from an existing vector
     *
     * @param {vec2} a vector to clone
     * @returns {vec2} a new 2D vector
     */
    function clone$8(a) {
        var out = new ARRAY_TYPE(2);
        out[0] = a[0];
        out[1] = a[1];
        return out;
    }
    /**
     * Creates a new vec2 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @returns {vec2} a new 2D vector
     */
    function fromValues$8(x, y) {
        var out = new ARRAY_TYPE(2);
        out[0] = x;
        out[1] = y;
        return out;
    }
    /**
     * Copy the values from one vec2 to another
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the source vector
     * @returns {vec2} out
     */
    function copy$8(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    }
    /**
     * Set the components of a vec2 to the given values
     *
     * @param {vec2} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @returns {vec2} out
     */
    function set$8(out, x, y) {
        out[0] = x;
        out[1] = y;
        return out;
    }
    /**
     * Adds two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function add$8(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    }
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function subtract$6(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out;
    }
    /**
     * Multiplies two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function multiply$8(out, a, b) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        return out;
    }
    /**
     * Divides two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function divide$2(out, a, b) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        return out;
    }
    /**
     * Math.ceil the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to ceil
     * @returns {vec2} out
     */
    function ceil$2(out, a) {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        return out;
    }
    /**
     * Math.floor the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to floor
     * @returns {vec2} out
     */
    function floor$2(out, a) {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        return out;
    }
    /**
     * Returns the minimum of two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function min$2(out, a, b) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        return out;
    }
    /**
     * Returns the maximum of two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec2} out
     */
    function max$2(out, a, b) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        return out;
    }
    /**
     * Math.round the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to round
     * @returns {vec2} out
     */
    function round$2(out, a) {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        return out;
    }
    /**
     * Scales a vec2 by a scalar number
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec2} out
     */
    function scale$8(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        return out;
    }
    /**
     * Adds two vec2's after scaling the second operand by a scalar value
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @param {Number} scale the amount to scale b by before adding
     * @returns {vec2} out
     */
    function scaleAndAdd$2(out, a, b, scale) {
        out[0] = a[0] + b[0] * scale;
        out[1] = a[1] + b[1] * scale;
        return out;
    }
    /**
     * Calculates the euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} distance between a and b
     */
    function distance$2(a, b) {
        var x = b[0] - a[0], y = b[1] - a[1];
        return Math.sqrt(x * x + y * y);
    }
    /**
     * Calculates the squared euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} squared distance between a and b
     */
    function squaredDistance$2(a, b) {
        var x = b[0] - a[0], y = b[1] - a[1];
        return x * x + y * y;
    }
    /**
     * Calculates the length of a vec2
     *
     * @param {vec2} a vector to calculate length of
     * @returns {Number} length of a
     */
    function length$4(a) {
        var x = a[0], y = a[1];
        return Math.sqrt(x * x + y * y);
    }
    /**
     * Calculates the squared length of a vec2
     *
     * @param {vec2} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    function squaredLength$4(a) {
        var x = a[0], y = a[1];
        return x * x + y * y;
    }
    /**
     * Negates the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to negate
     * @returns {vec2} out
     */
    function negate$2(out, a) {
        out[0] = -a[0];
        out[1] = -a[1];
        return out;
    }
    /**
     * Returns the inverse of the components of a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to invert
     * @returns {vec2} out
     */
    function inverse$2(out, a) {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        return out;
    }
    /**
     * Normalize a vec2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a vector to normalize
     * @returns {vec2} out
     */
    function normalize$4(out, a) {
        var x = a[0], y = a[1];
        var len = x * x + y * y;
        if (len > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len = 1 / Math.sqrt(len);
        }
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        return out;
    }
    /**
     * Calculates the dot product of two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} dot product of a and b
     */
    function dot$4(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
    /**
     * Computes the cross product of two vec2's
     * Note that the cross product must by definition produce a 3D vector
     *
     * @param {vec3} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {vec3} out
     */
    function cross$2(out, a, b) {
        var z = a[0] * b[1] - a[1] * b[0];
        out[0] = out[1] = 0;
        out[2] = z;
        return out;
    }
    /**
     * Performs a linear interpolation between two vec2's
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {vec2} out
     */
    function lerp$4(out, a, b, t) {
        var ax = a[0], ay = a[1];
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        return out;
    }
    /**
     * Generates a random vector with the given scale
     *
     * @param {vec2} out the receiving vector
     * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
     * @returns {vec2} out
     */
    function random$3(out, scale) {
        scale = scale || 1.0;
        var r = RANDOM() * 2.0 * Math.PI;
        out[0] = Math.cos(r) * scale;
        out[1] = Math.sin(r) * scale;
        return out;
    }
    /**
     * Transforms the vec2 with a mat2
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat2} m matrix to transform with
     * @returns {vec2} out
     */
    function transformMat2(out, a, m) {
        var x = a[0], y = a[1];
        out[0] = m[0] * x + m[2] * y;
        out[1] = m[1] * x + m[3] * y;
        return out;
    }
    /**
     * Transforms the vec2 with a mat2d
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat2d} m matrix to transform with
     * @returns {vec2} out
     */
    function transformMat2d(out, a, m) {
        var x = a[0], y = a[1];
        out[0] = m[0] * x + m[2] * y + m[4];
        out[1] = m[1] * x + m[3] * y + m[5];
        return out;
    }
    /**
     * Transforms the vec2 with a mat3
     * 3rd vector component is implicitly '1'
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat3} m matrix to transform with
     * @returns {vec2} out
     */
    function transformMat3$1(out, a, m) {
        var x = a[0], y = a[1];
        out[0] = m[0] * x + m[3] * y + m[6];
        out[1] = m[1] * x + m[4] * y + m[7];
        return out;
    }
    /**
     * Transforms the vec2 with a mat4
     * 3rd vector component is implicitly '0'
     * 4th vector component is implicitly '1'
     *
     * @param {vec2} out the receiving vector
     * @param {vec2} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec2} out
     */
    function transformMat4$2(out, a, m) {
        var x = a[0];
        var y = a[1];
        out[0] = m[0] * x + m[4] * y + m[12];
        out[1] = m[1] * x + m[5] * y + m[13];
        return out;
    }
    /**
     * Rotate a 2D vector
     * @param {vec2} out The receiving vec2
     * @param {vec2} a The vec2 point to rotate
     * @param {vec2} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec2} out
     */
    function rotate$4(out, a, b, c) {
        //Translate point to the origin
        var p0 = a[0] - b[0], p1 = a[1] - b[1], sinC = Math.sin(c), cosC = Math.cos(c); //perform rotation and translate to correct position
        out[0] = p0 * cosC - p1 * sinC + b[0];
        out[1] = p0 * sinC + p1 * cosC + b[1];
        return out;
    }
    /**
     * Get the angle between two 2D vectors
     * @param {vec2} a The first operand
     * @param {vec2} b The second operand
     * @returns {Number} The angle in radians
     */
    function angle$1(a, b) {
        var x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1];
        var len1 = x1 * x1 + y1 * y1;
        if (len1 > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len1 = 1 / Math.sqrt(len1);
        }
        var len2 = x2 * x2 + y2 * y2;
        if (len2 > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len2 = 1 / Math.sqrt(len2);
        }
        var cosine = (x1 * x2 + y1 * y2) * len1 * len2;
        if (cosine > 1.0) {
            return 0;
        }
        else if (cosine < -1.0) {
            return Math.PI;
        }
        else {
            return Math.acos(cosine);
        }
    }
    /**
     * Set the components of a vec2 to zero
     *
     * @param {vec2} out the receiving vector
     * @returns {vec2} out
     */
    function zero$2(out) {
        out[0] = 0.0;
        out[1] = 0.0;
        return out;
    }
    /**
     * Returns a string representation of a vector
     *
     * @param {vec2} a vector to represent as a string
     * @returns {String} string representation of the vector
     */
    function str$8(a) {
        return 'vec2(' + a[0] + ', ' + a[1] + ')';
    }
    /**
     * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
     *
     * @param {vec2} a The first vector.
     * @param {vec2} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function exactEquals$8(a, b) {
        return a[0] === b[0] && a[1] === b[1];
    }
    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     *
     * @param {vec2} a The first vector.
     * @param {vec2} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function equals$9(a, b) {
        var a0 = a[0], a1 = a[1];
        var b0 = b[0], b1 = b[1];
        return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)));
    }
    /**
     * Alias for {@link vec2.length}
     * @function
     */
    var len$4 = length$4;
    /**
     * Alias for {@link vec2.subtract}
     * @function
     */
    var sub$6 = subtract$6;
    /**
     * Alias for {@link vec2.multiply}
     * @function
     */
    var mul$8 = multiply$8;
    /**
     * Alias for {@link vec2.divide}
     * @function
     */
    var div$2 = divide$2;
    /**
     * Alias for {@link vec2.distance}
     * @function
     */
    var dist$2 = distance$2;
    /**
     * Alias for {@link vec2.squaredDistance}
     * @function
     */
    var sqrDist$2 = squaredDistance$2;
    /**
     * Alias for {@link vec2.squaredLength}
     * @function
     */
    var sqrLen$4 = squaredLength$4;
    /**
     * Perform some operation over an array of vec2s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
    var forEach$2 = (function () {
        var vec = create$8();
        return function (a, stride, offset, count, fn, arg) {
            var i, l;
            if (!stride) {
                stride = 2;
            }
            if (!offset) {
                offset = 0;
            }
            if (count) {
                l = Math.min(count * stride + offset, a.length);
            }
            else {
                l = a.length;
            }
            for (i = offset; i < l; i += stride) {
                vec[0] = a[i];
                vec[1] = a[i + 1];
                fn(vec, vec, arg);
                a[i] = vec[0];
                a[i + 1] = vec[1];
            }
            return a;
        };
    })();
    var vec2 = /*#__PURE__*/ Object.freeze({
        create: create$8,
        clone: clone$8,
        fromValues: fromValues$8,
        copy: copy$8,
        set: set$8,
        add: add$8,
        subtract: subtract$6,
        multiply: multiply$8,
        divide: divide$2,
        ceil: ceil$2,
        floor: floor$2,
        min: min$2,
        max: max$2,
        round: round$2,
        scale: scale$8,
        scaleAndAdd: scaleAndAdd$2,
        distance: distance$2,
        squaredDistance: squaredDistance$2,
        length: length$4,
        squaredLength: squaredLength$4,
        negate: negate$2,
        inverse: inverse$2,
        normalize: normalize$4,
        dot: dot$4,
        cross: cross$2,
        lerp: lerp$4,
        random: random$3,
        transformMat2: transformMat2,
        transformMat2d: transformMat2d,
        transformMat3: transformMat3$1,
        transformMat4: transformMat4$2,
        rotate: rotate$4,
        angle: angle$1,
        zero: zero$2,
        str: str$8,
        exactEquals: exactEquals$8,
        equals: equals$9,
        len: len$4,
        sub: sub$6,
        mul: mul$8,
        div: div$2,
        dist: dist$2,
        sqrDist: sqrDist$2,
        sqrLen: sqrLen$4,
        forEach: forEach$2,
    });
    exports.glMatrix = common;
    exports.mat2 = mat2;
    exports.mat2d = mat2d;
    exports.mat3 = mat3;
    exports.mat4 = mat4;
    exports.quat = quat;
    exports.quat2 = quat2;
    exports.vec2 = vec2;
    exports.vec3 = vec3;
    exports.vec4 = vec4;
    Object.defineProperty(exports, '__esModule', { value: true });
});
},{}],4:[function(require,module,exports){
"use strict";
/*
 * Copyright 2012, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names.
 * Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the.
 * A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * By default it just prints an error to the console on error.
 * If you want something else pass an callback. It's passed an error message.
 * @memberOf module:webgl-utils
 */

function createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
  var errFn = opt_errorCallback || console.error;
  var program = gl.createProgram();
  shaders.forEach(function (shader) {
    return gl.attachShader(program, shader);
  });

  if (opt_attribs) {
    opt_attribs.forEach(function (attrib, ndx) {
      return gl.bindAttribLocation(program, opt_locations ? opt_locations[ndx] : ndx, attrib);
    });
  }

  gl.linkProgram(program); // Check the link status

  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!linked) {
    // something went wrong with the link
    var lastError = gl.getProgramInfoLog(program);
    errFn('Error in program linking:' + lastError);
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

exports.createProgram = createProgram;
/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */

function resizeCanvasToDisplaySize(canvas) {
  var multiplier = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var width = canvas.clientWidth * multiplier | 0;
  var height = canvas.clientHeight * multiplier | 0;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }

  return false;
}

exports.resizeCanvasToDisplaySize = resizeCanvasToDisplaySize;
/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */

function resizeCanvasToSquare(canvas) {
  var styles = getComputedStyle(canvas);
  var width = parseFloat(styles.width);
  var height = parseFloat(styles.height);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = width;
    return true;
  }

  return false;
}

exports.resizeCanvasToSquare = resizeCanvasToSquare;

function createShader(gl, type, resolve, reject) {
  function handleShader(data) {
    var shader;

    if (type === 'fragment-shader') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type === 'vertex-shader') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, data);
    gl.compileShader(shader);
    return shader;
  }

  fetch("http://localhost:1337/assets/shaders/".concat(type, ".glsl")).then(function (resp) {
    return resp.text();
  }).then(function (data) {
    return handleShader(data);
  }).then(function (shader) {
    return resolve(shader);
  }).catch(function (err) {
    return reject(err);
  }); // if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
  // 	alert(gl.getShaderInfoLog(shader))
  // 	return null
  // }
}

exports.createShader = createShader;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9pbmRleC50cyIsInNyYy9zY3JpcHRzL3dlYmdsLWdvb2dsZS11dGlscy50cyIsInNyYy9zY3JpcHRzL3dlYmdsLW1hdHJpeC5qcyIsInNyYy9zY3JpcHRzL3dlYmdsLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUNDQSxJQUFBLG9CQUFBLEdBQUEsT0FBQSxDQUFBLHNCQUFBLENBQUE7O0FBQ0EsSUFBQSxjQUFBLEdBQUEsT0FBQSxDQUFBLGdCQUFBLENBQUE7O0FBQ0EsSUFBQSxhQUFBLEdBQUEsT0FBQSxDQUFBLGVBQUEsQ0FBQTs7QUFNQSxJQUFJLEVBQUo7QUFFQSxJQUFNLE9BQU8sR0FBUSxFQUFyQjtBQUNBLElBQU0sUUFBUSxHQUFRLEVBQXRCO0FBRUEsSUFBSSxZQUFZLEdBQVcsQ0FBM0I7QUFFQSxJQUFNLFVBQVUsR0FBUSxjQUFBLENBQUEsSUFBQSxDQUFLLFFBQUwsQ0FBYyxjQUFBLENBQUEsSUFBQSxDQUFLLE1BQUwsRUFBZCxDQUF4QjtBQUNBLElBQU0sV0FBVyxHQUFRLGNBQUEsQ0FBQSxJQUFBLENBQUssUUFBTCxDQUFjLGNBQUEsQ0FBQSxJQUFBLENBQUssTUFBTCxFQUFkLENBQXpCO0FBQ0EsSUFBTSxlQUFlLEdBQVEsY0FBQSxDQUFBLElBQUEsQ0FBSyxRQUFMLENBQWMsY0FBQSxDQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWQsQ0FBN0I7QUFDQSxJQUFNLGlCQUFpQixHQUFRLGNBQUEsQ0FBQSxJQUFBLENBQUssUUFBTCxDQUFjLGNBQUEsQ0FBQSxJQUFBLENBQUssTUFBTCxFQUFkLENBQS9CO0FBQ0EsSUFBTSxTQUFTLEdBQVEsY0FBQSxDQUFBLElBQUEsQ0FBSyxRQUFMLENBQWMsY0FBQSxDQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWQsQ0FBdkI7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFL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QUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0Qiw4Q0FBOEM7UUFDOUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsV0FBVyxDQUFDLENBQUM7UUFDckIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDakMsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1Ys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R0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNiLE9BQU8sT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7SUFDdEUsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxJQUFJLENBQUMsQ0FBQztRQUNkLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2hHLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FB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SUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDdkMsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7O09BV0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ3JDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBRTNCLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQTtTQUNYO1FBRUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNwQyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsYUFBYSxDQUFDLENBQUM7UUFDdkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDakMsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQy9CLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDNUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O1FBT0k7SUFFSixTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztRQU9JO0lBRUosU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzNCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMvQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMvQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDL0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDcEIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxLQUFLLENBQUMsQ0FBQztRQUNmLE9BQU8sQ0FDTixRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQzNGLENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLE1BQU0sQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FDZixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixDQUFDLENBQ0YsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLO1FBQy9DLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FDTixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxDQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3hFLENBQUE7SUFDRixDQUFDO0lBQ0Q7OztPQUdHO0lBRUgsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFBO0lBQ3RCOzs7T0FHRztJQUVILElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQTtJQUV0QixJQUFJLEtBQUssR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN2QyxNQUFNLEVBQUUsUUFBUTtRQUNoQixLQUFLLEVBQUUsT0FBTztRQUNkLElBQUksRUFBRSxNQUFNO1FBQ1osUUFBUSxFQUFFLFVBQVU7UUFDcEIsVUFBVSxFQUFFLFlBQVk7UUFDeEIsR0FBRyxFQUFFLEtBQUs7UUFDVixNQUFNLEVBQUUsUUFBUTtRQUNoQixXQUFXLEVBQUUsYUFBYTtRQUMxQixRQUFRLEVBQUUsVUFBVTtRQUNwQixNQUFNLEVBQUUsUUFBUTtRQUNoQixLQUFLLEVBQUUsT0FBTztRQUNkLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLFlBQVksRUFBRSxjQUFjO1FBQzVCLFdBQVcsRUFBRSxhQUFhO1FBQzFCLGVBQWUsRUFBRSxlQUFlO1FBQ2hDLEdBQUcsRUFBRSxLQUFLO1FBQ1YsSUFBSSxFQUFFLE1BQU07UUFDWixHQUFHLEVBQUUsS0FBSztRQUNWLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLGNBQWMsRUFBRSxnQkFBZ0I7UUFDaEMsb0JBQW9CLEVBQUUsc0JBQXNCO1FBQzVDLFdBQVcsRUFBRSxhQUFhO1FBQzFCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7S0FDVixDQUFDLENBQUE7SUFFRjs7O09BR0c7SUFFSDs7OztPQUlHO0lBRUgsU0FBUyxRQUFRO1FBQ2hCLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRTNCLElBQUksVUFBVSxJQUFJLFlBQVksRUFBRTtZQUMvQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDVjtRQUVELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNkLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxPQUFPLENBQUMsQ0FBQztRQUNqQixJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7OztPQWFHO0lBRUgsU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1FBQ2hFLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztRQUM5RCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7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Q0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBLENBQUMsNEJBQTRCO1FBRTVELElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBRTNDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQTtTQUNYO1FBRUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUN2QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDdEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ3RDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ3ZDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ3ZDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUN0QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsYUFBYSxDQUFDLENBQUM7UUFDdkIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxDQUNOLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzlGLENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzdCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDaEMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM1QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNqQixDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztRQU9JO0lBRUosU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ3BCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7UUFNSTtJQUVKLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNkLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUEsQ0FBQyw0QkFBNEI7UUFFNUQsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFFL0UsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFBO1NBQ1g7UUFFRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU07UUFDckMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsS0FBSyxDQUFDLENBQUM7UUFDZixPQUFPLENBQ04sT0FBTztZQUNQLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osR0FBRyxDQUNILENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLE1BQU0sQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FDZixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNsQixDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUs7UUFDL0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixPQUFPLENBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxD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Q0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQ1g7UUFFRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxDQUFDO1FBQ2pCLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bb0JHO0lBRUgsU0FBUyxZQUFZLENBQ3BCLEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUc7UUFFSCxJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXFCRztJQUVILFNBQVMsS0FBSyxDQUNiLEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHO1FBRUgsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsd0ZBQXdGO1FBQ3hGLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtZQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtTQUNiO2FBQU07WUFDTixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ2Y7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQSxDQUFDLDRCQUE0QjtRQUU1RCxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUUvRSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUE7U0FDWDtRQUVELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNkLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ04sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FDVixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FDVixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNOLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQ1YsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsYUFBYSxDQUFDLENBQUM7UUFDdkIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNkLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUEsQ0FBQyw0QkFBNEI7UUFFNUQsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUM3RSxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUEsQ0FBQyxtREFBbUQ7UUFFaEUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbkQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUE7UUFDdEIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUE7UUFDdEIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUE7UUFFdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNoRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2hELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDakQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUNqRDthQUFNO1lBQ04sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUM3QyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzdDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDN0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUM3QztRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O1FBT0k7SUFFSixTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUk7UUFDbEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNkLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUMxQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUE7UUFDdEIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUE7UUFDdEIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUE7UUFDdEIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUNqQixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFBO1FBQ2pCLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUE7UUFFakIsSUFBSSxHQUFHLEdBQUcsT0FBTyxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFBO1NBQ1g7UUFFRCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLENBQUMsSUFBSSxHQUFHLENBQUE7UUFDUixDQUFDLElBQUksR0FBRyxDQUFBO1FBQ1IsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtRQUNSLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBLENBQUMsZ0RBQWdEO1FBRTVELEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsa0RBQWtEO1FBRXRFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDM0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBRTNDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUNkLG9FQUFvRTtZQUNwRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ2Y7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzNCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFZixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDZCxnRUFBZ0U7WUFDaEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZixDQUFDLDhDQUE4QztRQUVoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDM0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRWYsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2QsZ0VBQWdFO1lBQ2hFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ2YsQ0FBQyw4Q0FBOEM7UUFFaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMzQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUVkLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUNkLG9FQUFvRTtZQUNwRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUNmLENBQUMsOENBQThDO1FBRWhELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7T0FXRztJQUVILFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSTtRQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ2QsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQzFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFWCxJQUFJLEdBQUcsR0FBRyxPQUFPLEVBQUU7WUFDbEIsT0FBTyxJQUFJLENBQUE7U0FDWDtRQUVELEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtRQUNSLENBQUMsSUFBSSxHQUFHLENBQUE7UUFDUixDQUFDLElBQUksR0FBRyxDQUFBO1FBQ1IsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQyxrREFBa0Q7UUFFNUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRztRQUM5QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQyw4Q0FBOEM7UUFFcEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQzlCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLDhDQUE4QztRQUVwRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDOUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsOENBQThDO1FBRXBFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBRUgsU0FBUyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekMsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksU0FBUyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUEsQ0FBQyw4QkFBOEI7UUFFcEYsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQTtZQUMxRSxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUE7WUFDMUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFBO1NBQzFFO2FBQU07WUFDTixXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFB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QUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzlCO2FBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDL0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7WUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzlCO2FBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzVCLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7WUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUM5QjthQUFNO1lBQ04sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFBO1NBQ2pCO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7T0FnQkc7SUFFSCxTQUFTLDRCQUE0QixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDakQsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDOUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW1CRztJQUVILFNBQVMsa0NBQWtDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUQsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQy9CLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQy9CLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN6RCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDekQsR0FBRyxDQUFDLEVBQUUs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QUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDM0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFBO1FBQzNCLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUM1QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUM3QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHO1FBQ2hELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFDL0IsRUFBRSxDQUFBO1FBQ0gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRVgsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDcEMs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LENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7O09BV0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHO1FBQ3RELElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQTtRQUMzQixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDM0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FB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QUFHLENBQUE7U0FDVDtRQUVELEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDdEIsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3RCLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFFNUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDTixFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ04sRUFBRSxHQUFHLENBQUMsQ0FBQTtTQUNOO2FBQU07WUFDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEVBQUUsSUFBSSxHQUFHLENBQUE7WUFDVCxFQUFFLElBQUksR0FBRyxDQUFBO1lBQ1QsRUFBRSxJQUFJLEdBQUcsQ0FBQTtTQUNUO1FBRUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVB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RUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsS0FBSyxDQUFDLENBQUM7UUFDZixPQUFPLENBQ04sT0FBTztZQUNQLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNMLElBQUk7WUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ0wsSUFBSTtZQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDTCxJQUFJO1lBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNMLElBQUk7WUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ0wsSUFBSTtZQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDTCxHQUFHLENBQ0gsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsTUFBTSxDQUFDLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNuQixDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUs7UUFDL0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQy9CLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FDTixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUNmLENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNkLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNkLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osT0FBTyxDQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDNUUsQ0FBQTtJQUNGLENBQUM7SUFDRDs7O09BR0c7SUFFSCxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUE7SUFDdEI7OztPQUdHO0lBRUgsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFBO0lBRXRCLElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxD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QUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLO1FBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3hDLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzdCLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsYUFBYSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM3QixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFL0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ1oseUNBQXlDO1lBQ3pDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUN4QjtRQUVELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25CLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDL0MsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxJQUFJLFlBQVksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3hCLElBQUksT0FBTyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzVDLElBQUksT0FBTyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDeEMsSUFBSSxPQUFPLEdBQUcsWUFBWSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3BDLElBQUksT0FBTyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDeEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUE7UUFDMUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUE7UUFDMUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUE7UUFDMUUsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcs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QUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3RELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQy9CLGlGQUFpRjtRQUNqRixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsMkJBQTJCO1FBQ3JDLG9DQUFvQztRQUVwQyxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQ3hCLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQ3JCLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUEsQ0FBQyxzQ0FBc0M7UUFFN0QsSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUM3QixJQUFJLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUMxQixJQUFJLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBLENBQUMsNkJBQTZCO1FBRXpELElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDZixHQUFHLElBQUksRUFBRSxDQUFBO1FBQ1QsR0FBRyxJQUFJLEVBQUUsQ0FBQTtRQUNULEdBQUcsSUFBSSxFQUFFLENBQUEsQ0FBQywyQkFBMkI7UUFFckMsSUFBSSxJQUFJLENBQUMsQ0FBQTtRQUNULElBQUksSUFBSSxDQUFDLENBQUE7UUFDVCxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUMsbURBQW1EO1FBRTdELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUE7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFBO1FBQ3ZCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFDVCxDQUFDLEdBQUcsRUFBRSxDQUFBLENBQUMsK0JBQStCO1FBRXZDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsa0JBQWtCO1FBRXJDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsK0JBQStCO1FBRTlFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFDVCxDQUFDLEdBQUcsRUFBRSxDQUFBLENBQUMsK0JBQStCO1FBRXZDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsa0JBQWtCO1FBRXJDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsK0JBQStCO1FBRTlFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFDVCxDQUFDLEdBQUcsRUFBRSxDQUFBLENBQUMsK0JBQStCO1FBRXZDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsa0JBQWtCO1FBRXJDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLCtCQUErQjtRQUUzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2xCLElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFDLElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDdkIsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUN2QixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRTlCLElBQUksTUFBTSxHQUFHLEdBQUcsRUFBRTtZQUNqQixPQUFPLENBQUMsQ0FBQTtTQUNSO2FBQU0sSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDekIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFBO1NBQ2Q7YUFBTTtZQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUN4QjtJQUNGLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsSUFBSSxDQUFDLEdBQUc7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxDQUFDO1FBQ2YsT0FBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7SUFDeEQsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdkQsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxDQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFB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LEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7OztPQVNHO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVB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RSxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFdkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ1osR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQ3hCO1FBRUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDaEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdELENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNoQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDM0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUs7UUFDM0IsS0FBSyxHQUFHLEtBQUssSUFBSSxHQUFHLENBQUEsQ0FBQyw0REFBNEQ7UUFDakYsMERBQTBEO1FBQzFELG1EQUFtRDtRQUVuRCxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQTtRQUNsQixJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUE7UUFFVixHQUFHO1lBQ0YsRUFBRSxHQUFHLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDckIsRUFBRSxHQUFHLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDckIsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtTQUN0QixRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUM7UUFFakIsR0FBRztZQUNGLEVBQUUsR0FBRyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3JCLEVBQUUsR0FBRyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3JCLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7U0FDdEIsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFDO1FBRWpCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN2QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLHVCQUF1QjtRQUVsQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNqQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNqQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNqQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBLENBQUMsa0NBQWtDO1FBRXJFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFBO1FBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFBO1FBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFBO1FBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsTUFBTSxD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QyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDdEIsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDdEI7YUFBTTtZQUNOLHFFQUFxRTtZQUNyRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2YsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNmLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDZjtRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM3QixHQUFHLElBQUksR0FBRyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDckIsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzdCLEdBQUcsSUFBSSxHQUFHLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNyQixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsR0FBRyxJQUFJLEdBQUcsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFH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RyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7U0FDOUI7YUFBTTtZQUNOLGFBQWE7WUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDdEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNuQixLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQTtZQUNuRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQTtZQUNwQixLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQTtZQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtZQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtZQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtTQUM5QztRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7T0FTRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN2QyxDQUFDLElBQUksU0FBUyxDQUFBO1FBQ2QsQ0FBQyxJQUFJLFNBQVMsQ0FBQTtRQUNkLENBQUMsSUFBSSxTQUFTLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxDQUFDO1FBQ2YsT0FBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0RSxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFBO0lBQ3JCOzs7Ozs7Ozs7T0FTRztJQUVILElBQUksWUFBWSxHQUFHLFlBQVksQ0FBQTtJQUMvQjs7Ozs7OztPQU9HO0lBRUgsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFBO0lBQ25COzs7Ozs7Ozs7O09BVUc7SUFFSCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUE7SUFDakI7Ozs7Ozs7O09BUUc7SUFFSCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUE7SUFDakI7OztPQUdHO0lBRUgsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFBO0lBQ3RCOzs7Ozs7OztPQVFHO0lBRUgsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFBO0lBQ3JCOzs7Ozs7O09BT0c7SUFFSCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUE7SUFDakI7Ozs7Ozs7OztPQVNHO0lBRUgsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFBO0lBQ25COzs7OztPQUtHO0lBRUgsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFBO0lBQ3ZCOzs7T0FHRztJQUVILElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQTtJQUNwQjs7Ozs7O09BTUc7SUFFSCxJQUFJLGVBQWUsR0FBRyxlQUFlLENBQUE7SUFDckM7OztPQUdHO0lBRUgsSUFBSSxRQUFRLEdBQUcsZUFBZSxDQUFBO0lBQzlCOzs7Ozs7O09BT0c7SUFFSCxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUE7SUFDN0I7Ozs7OztPQU1HO0lBRUgsSUFBSSxhQUFhLEdBQUcsYUFBYSxDQUFBO0lBQ2pDOzs7Ozs7T0FNRztJQUVILElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQTtJQUN2Qjs7Ozs7Ozs7OztPQVVHO0lBRUgsSUFBSSxVQUFVLEdBQUcsQ0FBQztRQUNqQixJQUFJLE9BQU8sR0FBRyxRQUFRLEVBQUUsQ0FBQTtRQUN4QixJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNyQyxJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNyQyxPQUFPLFVBQVMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3hCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFFdEIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZCLEtBQUssQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFBO2dCQUM1QixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxRQUFRO29CQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFBO2dCQUN6RCxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO2dCQUMzQixZQUFZLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ25DLE9BQU8sR0FBRyxDQUFBO2FBQ1Y7aUJBQU0sSUFBSSxNQUFNLEdBQUcsUUFBUSxFQUFFO2dCQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNWLE9BQU8sR0FBRyxDQUFBO2FBQ1Y7aUJBQU07Z0JBQ04sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFBO2dCQUNuQixPQUFPLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7YUFDNUI7UUFDRixDQUFDLENBQUE7SUFDRixDQUFDLENBQUMsRUFBRSxDQUFBO0lBQ0o7Ozs7Ozs7Ozs7T0FVRztJQUVILElBQUksTUFBTSxHQUFHLENBQUM7UUFDYixJQUFJLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQTtRQUN0QixJQUFJLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQTtRQUN0QixPQUFPLFVBQVMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUNyQixLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUN6QyxPQUFPLEdBQUcsQ0FBQTtRQUNYLENBQUMsQ0FBQTtJQUNGLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFDSjs7Ozs7Ozs7O09BU0c7SUFFSCxJQUFJLE9BQU8sR0FBRyxDQUFDO1FBQ2QsSUFBSSxJQUFJLEdBQUcsUUFBUSxFQUFFLENBQUE7UUFDckIsT0FBTyxVQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNsQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNmLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDZixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2YsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNsQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDbEIsT0FBTyxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtRQUM3QyxDQUFDLENBQUE7SUFDRixDQUFDLENBQUMsRUFBRSxDQUFBO0lBRUosSUFBSSxJQUFJLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdEMsTUFBTSxFQUFFLFFBQVE7UUFDaEIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsWUFBWSxFQUFFLFlBQVk7UUFDMUIsWUFBWSxFQUFFLFlBQVk7UUFDMUIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsVUFBVSxFQUFFLFVBQVU7UUFDdEIsS0FBSyxFQUFFLEtBQUs7UUFDWixNQUFNLEVBQUUsUUFBUTtRQUNoQixNQUFNLEVBQUUsUUFBUTtRQUNoQixTQUFTLEVBQUUsU0FBUztRQUNwQixRQUFRLEVBQUUsUUFBUTtRQUNsQixTQUFTLEVBQUUsU0FBUztRQUNwQixHQUFHLEVBQUUsS0FBSztRQUNWLEtBQUssRUFBRSxPQUFPO1FBQ2QsVUFBVSxFQUFFLFlBQVk7UUFDeEIsSUFBSSxFQUFFLE1BQU07UUFDWixHQUFHLEVBQUUsS0FBSztRQUNWLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7UUFDVixLQUFLLEVBQUUsT0FBTztRQUNkLEdBQUcsRUFBRSxLQUFLO1FBQ1YsSUFBSSxFQUFFLE1BQU07UUFDWixNQUFNLEVBQUUsUUFBUTtRQUNoQixHQUFHLEVBQUUsS0FBSztRQUNWLGFBQWEsRUFBRSxlQUFlO1FBQzlCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFNBQVMsRUFBRSxXQUFXO1FBQ3RCLFdBQVcsRUFBRSxhQUFhO1FBQzFCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFVBQVUsRUFBRSxVQUFVO1FBQ3RCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsT0FBTyxFQUFFLE9BQU87S0FDaEIsQ0FBQyxDQUFBO0lBRUY7Ozs7OztPQU1HO0lBRUg7Ozs7T0FJRztJQUVILFNBQVMsUUFBUTtRQUNoQixJQUFJLEVBQUUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUUxQixJQUFJLFVBQVUsSUFBSSxZQUFZLEVBQUU7WUFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNULEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNULEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNUO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNULE9BQU8sRUFBRSxDQUFBO0lBQ1YsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsT0FBTyxDQUFDLENBQUM7UUFDakIsSUFBSSxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWixPQUFPLEVBQUUsQ0FBQTtJQUNWLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7OztPQWFHO0lBRUgsU0FBUyxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDbkQsSUFBSSxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNWLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDVixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNWLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDVixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNWLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDVixPQUFPLEVBQUUsQ0FBQTtJQUNWLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7O09BWUc7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QUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLG9CQUFvQjtRQUNwQixJQUFJLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQTtRQUN0QixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDcEIseUJBQXlCLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUN4QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUc7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUNqRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFBO0lBQ3BCOzs7OztPQUtHO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFD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LENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzVDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3RCLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzdCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzVDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3RCLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzdCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzVDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3RCLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDcEMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3JDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHO1FBQzFDLDBCQUEwQjtRQUMxQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxFQUFFO1lBQzVCLE9BQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUNyQjtRQUVELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyRixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNmLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBO1FBQ25DLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtRQUNuQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUE7UUFDbkMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN0QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNsRCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ3RELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ3RELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ3RELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ3RELEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUYsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7OztPQUdHO0lBRUgsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFBO0lBQ3RCOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUE7SUFDakI7Ozs7Ozs7OztPQVNHO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMzQixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksS0FBSyxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUNyQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FB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QUM7UUFDMUIsT0FBTyxDQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixPQUFPLENBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxH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QUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdB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LENBQVQ7QUFDQSxLQUZNLE1BRUE7QUFDTixhQUFPLElBQVA7QUFDQTs7QUFFRCxJQUFBLEVBQUUsQ0FBQyxZQUFILENBQWdCLE1BQWhCLEVBQXdCLElBQXhCO0FBQ0EsSUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixNQUFqQjtBQUVBLFdBQU8sTUFBUDtBQUNBOztBQUVELEVBQUEsS0FBSyxnREFBeUMsSUFBekMsV0FBTCxDQUNFLElBREYsQ0FDTyxVQUFDLElBQUQ7QUFBQSxXQUFvQixJQUFJLENBQUMsSUFBTCxFQUFwQjtBQUFBLEdBRFAsRUFFRSxJQUZGLENBRU8sVUFBQyxJQUFEO0FBQUEsV0FBa0IsWUFBWSxDQUFDLElBQUQsQ0FBOUI7QUFBQSxHQUZQLEVBR0UsSUFIRixDQUdPLFVBQUMsTUFBRDtBQUFBLFdBQXlCLE9BQU8sQ0FBQyxNQUFELENBQWhDO0FBQUEsR0FIUCxFQUlFLEtBSkYsQ0FJUSxVQUFDLEdBQUQ7QUFBQSxXQUFnQixNQUFNLENBQUMsR0FBRCxDQUF0QjtBQUFBLEdBSlIsRUFsQitCLENBd0IvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWhDRCxPQUFBLENBQUEsWUFBQSxHQUFBLFlBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgYmV6aWVyIGZyb20gJy4vYmV6aWVyLWVhc2luZydcclxuaW1wb3J0IFdlYkdMVXRpbHMsIHsgYWRkVGV4dHVyZSwgZGVnVG9SYWQgfSBmcm9tICcuL3dlYmdsLWdvb2dsZS11dGlscydcclxuaW1wb3J0IHsgbWF0NCwgdmVjMyB9IGZyb20gJy4vd2ViZ2wtbWF0cml4J1xyXG5pbXBvcnQgeyBjcmVhdGVQcm9ncmFtLCBjcmVhdGVTaGFkZXIsIHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUgfSBmcm9tICcuL3dlYmdsLXV0aWxzJ1xyXG5cclxuaW50ZXJmYWNlIElXZWJHTFJlbmRlcmluZ0NvbnRleHRFeHRlbmRlZCBleHRlbmRzIFdlYkdMUmVuZGVyaW5nQ29udGV4dCB7XHJcblx0cHJvZ3JhbTogV2ViR0xQcm9ncmFtXHJcbn1cclxuXHJcbmxldCBnbDogSVdlYkdMUmVuZGVyaW5nQ29udGV4dEV4dGVuZGVkXHJcblxyXG5jb25zdCBhdHRyaWJzOiBhbnkgPSB7fVxyXG5jb25zdCB1bmlmb3JtczogYW55ID0ge31cclxuXHJcbmxldCBhcnJheXNUb0RyYXc6IG51bWJlciA9IDBcclxuXHJcbmNvbnN0IHZpZXdNYXRyaXg6IGFueSA9IG1hdDQuaWRlbnRpdHkobWF0NC5jcmVhdGUoKSlcclxuY29uc3QgbW9kZWxNYXRyaXg6IGFueSA9IG1hdDQuaWRlbnRpdHkobWF0NC5jcmVhdGUoKSlcclxuY29uc3QgbW9kZWxWaWV3TWF0cml4OiBhbnkgPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbmNvbnN0IHBlcnNwZWN0aXZlTWF0cml4OiBhbnkgPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbmNvbnN0IG12cE1hdHJpeDogYW55ID0gbWF0NC5pZGVudGl0eShtYXQ0LmNyZWF0ZSgpKVxyXG5tYXQ0LnBlcnNwZWN0aXZlKHBlcnNwZWN0aXZlTWF0cml4LCBkZWdUb1JhZCg2MCksIDEsIDAuMSwgMTAwKVxyXG5cclxuY29uc3QgZ2VuZXJhdGVDaXJjbGVWZXJ0aWNlcyA9IGZ1bmN0aW9uKHJhZGl1czogbnVtYmVyLCBhY2N1cmFjeTogbnVtYmVyKTogbnVtYmVyW10ge1xyXG5cdGNvbnN0IGFuZ2xlID0gKDM2MCAvIGFjY3VyYWN5KSAqIChNYXRoLlBJIC8gMTgwKVxyXG5cdGNvbnN0IHZlcnRpY2VzID0gW11cclxuXHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhY2N1cmFjeTsgaSArPSAxKSB7XHJcblx0XHRjb25zdCB4ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUgKiBpKVxyXG5cdFx0Y29uc3QgeSA9IHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlICogaSlcclxuXHJcblx0XHR2ZXJ0aWNlcy5wdXNoKHgsIHkpXHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdmVydGljZXNcclxufVxyXG5cclxuY29uc3QgZ2VuZXJhdGVTcGhlcmVWZXJ0aWNlcyA9IGZ1bmN0aW9uKHJhZGl1czogbnVtYmVyLCBhY2N1cmFjeTogbnVtYmVyKTogbnVtYmVyW10ge1xyXG5cdGNvbnN0IG4gPSBhY2N1cmFjeVxyXG5cdGNvbnN0IHZlcnRpY2VzID0gW11cclxuXHJcblx0ZnVuY3Rpb24gZ2V0Q29vcmRzKGFscGhhOiBudW1iZXIsIHBoaTogbnVtYmVyKTogbnVtYmVyW10ge1xyXG5cdFx0Y29uc3QgY29vcmRzOiBudW1iZXJbXSA9IFtdXHJcblxyXG5cdFx0Y29uc3QgeCA9IHJhZGl1cyAqIE1hdGguY29zKHBoaSkgKiBNYXRoLnNpbihhbHBoYSlcclxuXHRcdGNvbnN0IHkgPSByYWRpdXMgKiBNYXRoLmNvcyhhbHBoYSlcclxuXHRcdGNvbnN0IHogPSAtMSAqICsoTWF0aC5zaW4ocGhpKSAqIE1hdGguc2luKGFscGhhKSlcclxuXHRcdGNvb3Jkcy5wdXNoKHgsIHksIHopXHJcblxyXG5cdFx0cmV0dXJuIGNvb3Jkc1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VHJpYW5nbGUoXHJcblx0XHRhbHBoYTE6IG51bWJlcixcclxuXHRcdGFscGhhMjogbnVtYmVyLFxyXG5cdFx0cGhpMTogbnVtYmVyLFxyXG5cdFx0cGhpMjogbnVtYmVyLFxyXG5cdFx0bGVmdDogYm9vbGVhbiA9IGZhbHNlXHJcblx0KTogbnVtYmVyW10ge1xyXG5cdFx0Y29uc3QgdHJpYW5nbGU6IG51bWJlcltdID0gW11cclxuXHRcdGxldCBhOiBudW1iZXJbXVxyXG5cdFx0bGV0IGI6IG51bWJlcltdXHJcblx0XHRsZXQgYzogbnVtYmVyW11cclxuXHJcblx0XHRpZiAobGVmdCkge1xyXG5cdFx0XHRhID0gZ2V0Q29vcmRzKGFscGhhMSwgcGhpMilcclxuXHRcdFx0YiA9IGdldENvb3JkcyhhbHBoYTIsIHBoaTEpXHJcblx0XHRcdGMgPSBnZXRDb29yZHMoYWxwaGExLCBwaGkxKVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YSA9IGdldENvb3JkcyhhbHBoYTEsIHBoaTIpXHJcblx0XHRcdGIgPSBnZXRDb29yZHMoYWxwaGEyLCBwaGkyKVxyXG5cdFx0XHRjID0gZ2V0Q29vcmRzKGFscGhhMiwgcGhpMSlcclxuXHRcdH1cclxuXHJcblx0XHR0cmlhbmdsZS5wdXNoKC4uLmEsIC4uLmIsIC4uLmMpXHJcblxyXG5cdFx0cmV0dXJuIHRyaWFuZ2xlXHJcblx0fVxyXG5cclxuXHRmb3IgKGxldCBqID0gMDsgaiA8IG47IGogKz0gMSkge1xyXG5cdFx0Y29uc3QgcGhpMSA9ICgyICogTWF0aC5QSSAqIGopIC8gblxyXG5cdFx0Y29uc3QgcGhpMiA9ICgyICogTWF0aC5QSSAqIChqICsgMSkpIC8gblxyXG5cclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSArPSAxKSB7XHJcblx0XHRcdGNvbnN0IGFscGhhMSA9IChNYXRoLlBJICogaSkgLyBuXHJcblx0XHRcdGNvbnN0IGFscGhhMiA9IChNYXRoLlBJICogKGkgKyAxKSkgLyBuXHJcblxyXG5cdFx0XHRpZiAoaSA9PT0gMCkge1xyXG5cdFx0XHRcdHZlcnRpY2VzLnB1c2goLi4uZ2V0VHJpYW5nbGUoYWxwaGExLCBhbHBoYTIsIHBoaTEsIHBoaTIpKVxyXG5cdFx0XHRcdGNvbnRpbnVlXHJcblx0XHRcdH0gZWxzZSBpZiAoaSA9PT0gbiAtIDEpIHtcclxuXHRcdFx0XHR2ZXJ0aWNlcy5wdXNoKC4uLmdldFRyaWFuZ2xlKGFscGhhMSwgYWxwaGEyLCBwaGkxLCBwaGkyLCB0cnVlKSlcclxuXHRcdFx0XHRjb250aW51ZVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2ZXJ0aWNlcy5wdXNoKC4uLmdldFRyaWFuZ2xlKGFscGhhMSwgYWxwaGEyLCBwaGkxLCBwaGkyLCB0cnVlKSlcclxuXHRcdFx0dmVydGljZXMucHVzaCguLi5nZXRUcmlhbmdsZShhbHBoYTEsIGFscGhhMiwgcGhpMSwgcGhpMikpXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdmVydGljZXNcclxufVxyXG5cclxuY29uc3QgJCA9IGZ1bmN0aW9uKHNlbGVjdG9yOiBzdHJpbmcsIHFzPzogYm9vbGVhbik6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCB7XHJcblx0aWYgKCFxcykgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKVxyXG5cdHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxyXG59XHJcblxyXG5pbnRlcmZhY2UgSVNjZW5lIHtcclxuXHRba2V5OiBzdHJpbmddOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxufVxyXG5cclxuY29uc3Qgc2NlbmU6IElTY2VuZSA9IHtcclxuXHRtb2RlbFJvdGF0ZVg6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsUm90YXRlWCcpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFJvdGF0ZVk6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsUm90YXRlWScpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFJvdGF0ZVo6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsUm90YXRlWicpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFRyYW5zbGF0ZVg6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsVHJhbnNsYXRlWCcpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFRyYW5zbGF0ZVk6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsVHJhbnNsYXRlWScpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFRyYW5zbGF0ZVo6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsVHJhbnNsYXRlWicpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRjYW1lcmFYOiB7XHJcblx0XHRlbGVtOiAkKCdjYW1lcmFYJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdGNhbWVyYVk6IHtcclxuXHRcdGVsZW06ICQoJ2NhbWVyYVknKSBhcyBIVE1MRWxlbWVudCxcclxuXHRcdHZhbHVlOiAwLFxyXG5cdH0sXHJcblx0Y2FtZXJhWjoge1xyXG5cdFx0ZWxlbTogJCgnY2FtZXJhWicpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxufVxyXG5cclxuY29uc3QgZnBzQ291bnRlciA9ICQoJ2Zwcy1jb3VudGVyJylcclxuY29uc3QgZnJhbWVDb3VudGVyID0gJCgnZnJhbWUtY291bnRlcicpXHJcbmNvbnN0IHRpbWVDb3VudGVyID0gJCgndGltZS1jb3VudGVyJylcclxuXHJcbmNvbnN0IGluaXRTaGFkZXJzID0gZnVuY3Rpb24ocmVzb2x2ZTogKCkgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiBFcnJvcikgPT4gdm9pZCkge1xyXG5cdGNvbnN0IGZTaGFkZXI6IFdlYkdMU2hhZGVyID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PlxyXG5cdFx0Y3JlYXRlU2hhZGVyKGdsLCAnZnJhZ21lbnQtc2hhZGVyJywgcmVzLCByZWopXHJcblx0KVxyXG5cdGNvbnN0IHZTaGFkZXI6IFdlYkdMU2hhZGVyID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PlxyXG5cdFx0Y3JlYXRlU2hhZGVyKGdsLCAndmVydGV4LXNoYWRlcicsIHJlcywgcmVqKVxyXG5cdClcclxuXHJcblx0UHJvbWlzZS5hbGwoW2ZTaGFkZXIsIHZTaGFkZXJdKS50aGVuKChzaGFkZXJzKSA9PiB7XHJcblx0XHRnbC5wcm9ncmFtID0gY3JlYXRlUHJvZ3JhbShnbCwgc2hhZGVycylcclxuXHRcdGdsLnVzZVByb2dyYW0oZ2wucHJvZ3JhbSlcclxuXHJcblx0XHRyZXNvbHZlKClcclxuXHR9KVxyXG59XHJcblxyXG5jb25zdCBpbml0VmFyaWFibGVzID0gZnVuY3Rpb24oKSB7XHJcblx0YXR0cmlicy5hUG9zaXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihnbC5wcm9ncmFtLCAnYV9Qb3NpdGlvbicpXHJcblxyXG5cdHVuaWZvcm1zLnVNdnBNYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZ2wucHJvZ3JhbSwgJ3VfTXZwTWF0cml4JylcclxuXHR1bmlmb3Jtcy51TW9kZWxNYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZ2wucHJvZ3JhbSwgJ3VfTW9kZWxNYXRyaXgnKVxyXG5cdHVuaWZvcm1zLnVIZWlnaHQgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZ2wucHJvZ3JhbSwgJ3VfSGVpZ2h0JylcclxuXHR1bmlmb3Jtcy51V2lkdGggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZ2wucHJvZ3JhbSwgJ3VfV2lkdGgnKVxyXG59XHJcblxyXG5jb25zdCBpbml0VGV4dHVyZXMgPSBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG5jb25zdCBpbml0QnVmZmVyID0gZnVuY3Rpb24oKTogdm9pZCB7XHJcblx0Y29uc3QgdmVydGljZXM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoWy4uLmdlbmVyYXRlU3BoZXJlVmVydGljZXMoMSwgMTAwKV0pXHJcblxyXG5cdGNvbnN0IHZlcnRleEJ1ZmZlcjogV2ViR0xCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKVxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpXHJcblx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHZlcnRpY2VzLCBnbC5TVEFUSUNfRFJBVylcclxuXHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcihhdHRyaWJzLmFQb3NpdGlvbiwgMywgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKVxyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGF0dHJpYnMuYVBvc2l0aW9uKVxyXG5cclxuXHRhcnJheXNUb0RyYXcgPSB2ZXJ0aWNlcy5sZW5ndGggLyAzXHJcbn1cclxuXHJcbmNvbnN0IGRyYXdTY2VuZSA9IGZ1bmN0aW9uKCk6IHZvaWQge1xyXG5cdGdsLnZpZXdwb3J0KDAsIDAsIGdsLmRyYXdpbmdCdWZmZXJXaWR0aCwgZ2wuZHJhd2luZ0J1ZmZlckhlaWdodClcclxuXHJcblx0Z2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpXHJcblxyXG5cdGNvbnN0IGNhbWVyYSA9IHZlYzMuZnJvbVZhbHVlcyhzY2VuZS5jYW1lcmFYLnZhbHVlLCBzY2VuZS5jYW1lcmFZLnZhbHVlLCBzY2VuZS5jYW1lcmFaLnZhbHVlKVxyXG5cdGNvbnN0IGNlbnRlciA9IHZlYzMuZnJvbVZhbHVlcygwLCAwLCAwKVxyXG5cdGNvbnN0IHVwID0gdmVjMy5mcm9tVmFsdWVzKDAsIDEsIDApXHJcblxyXG5cdG1hdDQubG9va0F0KHZpZXdNYXRyaXgsIGNhbWVyYSwgY2VudGVyLCB1cClcclxuXHJcblx0bWF0NC5pZGVudGl0eShtb2RlbE1hdHJpeClcclxuXHRtYXQ0LnRyYW5zbGF0ZShcclxuXHRcdG1vZGVsTWF0cml4LFxyXG5cdFx0bW9kZWxNYXRyaXgsXHJcblx0XHR2ZWMzLmZyb21WYWx1ZXMoXHJcblx0XHRcdHNjZW5lLm1vZGVsVHJhbnNsYXRlWC52YWx1ZSxcclxuXHRcdFx0c2NlbmUubW9kZWxUcmFuc2xhdGVZLnZhbHVlLFxyXG5cdFx0XHRzY2VuZS5tb2RlbFRyYW5zbGF0ZVoudmFsdWVcclxuXHRcdClcclxuXHQpXHJcblx0bWF0NC5yb3RhdGVYKG1vZGVsTWF0cml4LCBtb2RlbE1hdHJpeCwgZGVnVG9SYWQoc2NlbmUubW9kZWxSb3RhdGVYLnZhbHVlKSlcclxuXHRtYXQ0LnJvdGF0ZVkobW9kZWxNYXRyaXgsIG1vZGVsTWF0cml4LCBkZWdUb1JhZChzY2VuZS5tb2RlbFJvdGF0ZVkudmFsdWUpKVxyXG5cdG1hdDQucm90YXRlWihtb2RlbE1hdHJpeCwgbW9kZWxNYXRyaXgsIGRlZ1RvUmFkKHNjZW5lLm1vZGVsUm90YXRlWi52YWx1ZSkpXHJcblxyXG5cdG1hdDQubXVsKG1vZGVsVmlld01hdHJpeCwgdmlld01hdHJpeCwgbW9kZWxNYXRyaXgpXHJcblx0bWF0NC5tdWwobXZwTWF0cml4LCBwZXJzcGVjdGl2ZU1hdHJpeCwgbW9kZWxWaWV3TWF0cml4KVxyXG5cclxuXHRnbC51bmlmb3JtTWF0cml4NGZ2KHVuaWZvcm1zLnVNdnBNYXRyaXgsIGZhbHNlLCBtdnBNYXRyaXgpXHJcblx0Z2wudW5pZm9ybU1hdHJpeDRmdih1bmlmb3Jtcy51TW9kZWxNYXRyaXgsIGZhbHNlLCBtb2RlbE1hdHJpeClcclxuXHJcblx0Z2wudW5pZm9ybTFmKHVuaWZvcm1zLnVXaWR0aCwgZ2wuZHJhd2luZ0J1ZmZlcldpZHRoKVxyXG5cdGdsLnVuaWZvcm0xZih1bmlmb3Jtcy51SGVpZ2h0LCBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0KVxyXG5cclxuXHRnbC5kcmF3QXJyYXlzKGdsLlRSSUFOR0xFUywgMCwgYXJyYXlzVG9EcmF3KVxyXG59XHJcblxyXG5sZXQgbGFzdFRpbWU6IG51bWJlciA9IDBcclxubGV0IGZyYW1lczogbnVtYmVyID0gMFxyXG5sZXQgZnBzOiBudW1iZXJcclxuY29uc3QgcmVuZGVyID0gZnVuY3Rpb24odGltZTogRE9NSGlnaFJlc1RpbWVTdGFtcCA9IDApIHtcclxuXHRmcHMgPSAxMDAwIC8gKHRpbWUgLSBsYXN0VGltZSlcclxuXHRmcHNDb3VudGVyLnRleHRDb250ZW50ID0gZnBzLnRvRml4ZWQoMClcclxuXHRmcmFtZUNvdW50ZXIudGV4dENvbnRlbnQgPSArK2ZyYW1lcyArICcnXHJcblx0dGltZUNvdW50ZXIudGV4dENvbnRlbnQgPSAodGltZSAvIDEwMDApLnRvRml4ZWQoMilcclxuXHRsYXN0VGltZSA9IHRpbWVcclxuXHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcilcclxuXHRkcmF3U2NlbmUoKVxyXG59XHJcblxyXG5jb25zdCB3ZWJHTFN0YXJ0ID0gZnVuY3Rpb24oKTogdm9pZCB7XHJcblx0Y29uc3QgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9ICQoJ2NhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50XHJcblxyXG5cdGNvbnN0IHBvd2VyUHJlZmVyZW5jZTogc3RyaW5nID0gJ2RlZmF1bHQnIHx8ICdoaWdoLXBlcmZvcm1hbmNlJyB8fCAnbG93LXBvd2VyJ1xyXG5cdGdsID0gV2ViR0xVdGlscy5zZXR1cFdlYkdMKGNhbnZhcywge1xyXG5cdFx0YWxwaGE6IHRydWUsXHJcblx0XHRkZXB0aDogdHJ1ZSxcclxuXHRcdHBvd2VyUHJlZmVyZW5jZSxcclxuXHR9KSBhcyBJV2ViR0xSZW5kZXJpbmdDb250ZXh0RXh0ZW5kZWRcclxuXHJcblx0Z2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApXHJcblx0Z2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpXHJcblxyXG5cdHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoZ2wuY2FudmFzKVxyXG5cclxuXHRjb25zdCBwcm9taXNlU2hhZGVyOiBQcm9taXNlPHt9PiA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4gaW5pdFNoYWRlcnMocmVzLCByZWopKVxyXG5cdHByb21pc2VTaGFkZXJcclxuXHRcdC50aGVuKCgpID0+IGluaXRWYXJpYWJsZXMoKSlcclxuXHRcdC50aGVuKCgpID0+IGluaXRUZXh0dXJlcygpKVxyXG5cdFx0LnRoZW4oKCkgPT4gaW5pdEJ1ZmZlcigpKVxyXG5cdFx0LnRoZW4oKCkgPT4gcmVuZGVyKCkpXHJcblx0XHQuY2F0Y2goKGVycm9yOiBFcnJvcikgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcbn1cclxuXHJcbi8vIFRPRE8gU21vb3RoIGFuaW1hdGlvblxyXG4vLyBjb25zdCBhbmltYXRlID0gZnVuY3Rpb24oZHVyYXRpb246IG51bWJlciwgZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyKTogdm9pZCB7XHJcbi8vIFx0Y29uc3QgZWFzaW5nID0gYmV6aWVyKDAuMjE1LCAwLjYxLCAwLjM1NSwgMS4wKVxyXG4vLyBcdGNvbnN0IGl0ZXJhdGlvbnM6IG51bWJlciA9IDYwIC8gKGR1cmF0aW9uIC8gMTAwMClcclxuLy8gXHRjb25zdCBzdGVwOiBudW1iZXIgPSAxIC8gaXRlcmF0aW9uc1xyXG5cclxuLy8gXHRmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDw9IGl0ZXJhdGlvbnM7IGkgKz0gMSkge1xyXG4vLyBcdFx0KHRvIC0gZnJvbSkgKiBlYXNpbmcoc3RlcCAqIGkpICsgZnJvbVxyXG4vLyBcdH1cclxuLy8gfVxyXG5cclxuY29uc3QgdXBkYXRlSW5mb2JhciA9IGZ1bmN0aW9uKGVsZW06IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcblx0ZWxlbS5pbm5lckhUTUwgPSBzY2VuZVtlbGVtLmlkXS52YWx1ZS50b0ZpeGVkKDIpXHJcbn1cclxuXHJcbmNvbnN0IHNldENhbnZhc0NvbnRyb2xzID0gZnVuY3Rpb24oKTogdm9pZCB7XHJcblx0bGV0IGlzUm90YXRhYmxlOiBib29sZWFuID0gZmFsc2VcclxuXHJcblx0Z2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlOiBNb3VzZUV2ZW50KSA9PiAoaXNSb3RhdGFibGUgPSB0cnVlKSlcclxuXHRnbC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChlOiBNb3VzZUV2ZW50KSA9PiAoaXNSb3RhdGFibGUgPSBmYWxzZSkpXHJcblx0Z2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcblx0XHRpZiAoIWlzUm90YXRhYmxlKSByZXR1cm4gZmFsc2VcclxuXHJcblx0XHRpZiAoZS5zaGlmdEtleSkge1xyXG5cdFx0XHRzY2VuZS5tb2RlbFRyYW5zbGF0ZVgudmFsdWUgKz0gMTAgKiAoZS5tb3ZlbWVudFggLyBnbC5kcmF3aW5nQnVmZmVyV2lkdGgpXHJcblx0XHRcdHNjZW5lLm1vZGVsVHJhbnNsYXRlWS52YWx1ZSAtPSAxMCAqIChlLm1vdmVtZW50WSAvIGdsLmRyYXdpbmdCdWZmZXJXaWR0aClcclxuXHJcblx0XHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUubW9kZWxUcmFuc2xhdGVYLmVsZW0pXHJcblx0XHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUubW9kZWxUcmFuc2xhdGVZLmVsZW0pXHJcblxyXG5cdFx0XHRyZXR1cm5cclxuXHRcdH1cclxuXHJcblx0XHRzY2VuZS5tb2RlbFJvdGF0ZVgudmFsdWUgKz0gZS5tb3ZlbWVudFkgLyAzXHJcblx0XHRzY2VuZS5tb2RlbFJvdGF0ZVkudmFsdWUgKz0gZS5tb3ZlbWVudFggLyAzXHJcblxyXG5cdFx0dXBkYXRlSW5mb2JhcihzY2VuZS5tb2RlbFJvdGF0ZVguZWxlbSlcclxuXHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUubW9kZWxSb3RhdGVZLmVsZW0pXHJcblx0fSlcclxuXHJcblx0Z2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgKGU6IFdoZWVsRXZlbnQpID0+IHtcclxuXHRcdGxldCBkaXJlY3Rpb246IG51bWJlciA9IGUuZGVsdGFZIDwgMCA/IC0wLjE1IDogMC4xNVxyXG5cdFx0aWYgKGUuc2hpZnRLZXkpIGRpcmVjdGlvbiAqPSAzXHJcblx0XHRzY2VuZS5jYW1lcmFaLnZhbHVlICs9IGRpcmVjdGlvblxyXG5cdFx0dXBkYXRlSW5mb2JhcihzY2VuZS5jYW1lcmFaLmVsZW0pXHJcblx0fSlcclxufVxyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCk6IHZvaWQge1xyXG5cdGZvciAoY29uc3Qga2V5IGluIHNjZW5lKSB7XHJcblx0XHRpZiAoc2NlbmUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG5cdFx0XHRzY2VuZVtrZXldLnZhbHVlID0gK3BhcnNlRmxvYXQoc2NlbmVba2V5XS5lbGVtLmlubmVySFRNTClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHdlYkdMU3RhcnQoKVxyXG5cdHNldENhbnZhc0NvbnRyb2xzKClcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIChlOiBFdmVudCkgPT4gcmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShnbC5jYW52YXMpKVxyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgMjAxMCwgR29vZ2xlIEluYy5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XHJcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcclxuICogbWV0OlxyXG4gKlxyXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxyXG4gKiBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXHJcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcclxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxyXG4gKiBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlXHJcbiAqIGRpc3RyaWJ1dGlvbi5cclxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHb29nbGUgSW5jLiBub3IgdGhlIG5hbWVzIG9mIGl0c1xyXG4gKiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbVxyXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxyXG4gKlxyXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXHJcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcclxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXHJcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXHJcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxyXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXHJcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxyXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcclxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxyXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcclxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICpcclxuICogTW9kaWZpZWQgYnkgQWxleCBHYXJuZWF1IC0gRmViIDIsIDIwMTIgLSBnc2tpbm5lci5jb20gaW5jLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgZmlsZSBjb250YWlucyBmdW5jdGlvbnMgZXZlcnkgd2ViZ2wgcHJvZ3JhbSB3aWxsIG5lZWRcclxuICogYSB2ZXJzaW9uIG9mIG9uZSB3YXkgb3IgYW5vdGhlci5cclxuICpcclxuICogSW5zdGVhZCBvZiBzZXR0aW5nIHVwIGEgY29udGV4dCBtYW51YWxseSBpdCBpcyByZWNvbW1lbmRlZCB0b1xyXG4gKiB1c2UuIFRoaXMgd2lsbCBjaGVjayBmb3Igc3VjY2VzcyBvciBmYWlsdXJlLiBPbiBmYWlsdXJlIGl0XHJcbiAqIHdpbGwgYXR0ZW1wdCB0byBwcmVzZW50IGFuIGFwcHJvcmlhdGUgbWVzc2FnZSB0byB0aGUgdXNlci5cclxuICpcclxuICogICAgICAgZ2wgPSBXZWJHTFV0aWxzLnNldHVwV2ViR0woY2FudmFzKTtcclxuICpcclxuICogRm9yIGFuaW1hdGVkIFdlYkdMIGFwcHMgdXNlIG9mIHNldFRpbWVvdXQgb3Igc2V0SW50ZXJ2YWwgYXJlXHJcbiAqIGRpc2NvdXJhZ2VkLiBJdCBpcyByZWNvbW1lbmRlZCB5b3Ugc3RydWN0dXJlIHlvdXIgcmVuZGVyaW5nXHJcbiAqIGxvb3AgbGlrZSB0aGlzLlxyXG4gKlxyXG4gKiAgICAgICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAqICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltRnJhbWUocmVuZGVyLCBjYW52YXMpO1xyXG4gKlxyXG4gKiAgICAgICAgIC8vIGRvIHJlbmRlcmluZ1xyXG4gKiAgICAgICAgIC4uLlxyXG4gKiAgICAgICB9XHJcbiAqICAgICAgIHJlbmRlcigpO1xyXG4gKlxyXG4gKiBUaGlzIHdpbGwgY2FsbCB5b3VyIHJlbmRlcmluZyBmdW5jdGlvbiB1cCB0byB0aGUgcmVmcmVzaCByYXRlXHJcbiAqIG9mIHlvdXIgZGlzcGxheSBidXQgd2lsbCBzdG9wIHJlbmRlcmluZyBpZiB5b3VyIGFwcCBpcyBub3RcclxuICogdmlzaWJsZS5cclxuICovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb25Gcm9tTWF0cml4KG1hdHJpeDogbnVtYmVyW10pOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyOyB6OiBudW1iZXIgfSB7XHJcblx0cmV0dXJuIHsgeDogbWF0cml4WzEyXSwgeTogbWF0cml4WzEzXSwgejogbWF0cml4WzE0XSB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3RhdGlvbkZyb21NYXRyaXgobWF0cml4OiBudW1iZXJbXSkge1xyXG5cdHJldHVybiB7IHg6IE1hdGguYXNpbihtYXRyaXhbNl0pLCB5OiBNYXRoLmFzaW4obWF0cml4WzhdKSwgejogTWF0aC5hc2luKG1hdHJpeFsxXSkgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVnVG9SYWQoZGVncmVlczogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyIHtcclxuXHRyZXR1cm4gKHBhcnNlRmxvYXQoZGVncmVlcyBhcyBzdHJpbmcpICogTWF0aC5QSSkgLyAxODBcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQpOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0ge1xyXG5cdHJldHVybiB7IHg6IGV2ZW50Lm9mZnNldFgsIHk6IGV2ZW50Lm9mZnNldFkgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZUZyb21Nb3VzZShcclxuXHRjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG5cdG1vdXNlOiBNb3VzZUV2ZW50LFxyXG5cdGdyaWRTaXplOiBudW1iZXIsXHJcblx0R1JJRF9XSURUSDogbnVtYmVyLFxyXG5cdEdSSURfSEVJR0hUOiBudW1iZXJcclxuKTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCB7XHJcblx0Ly8gV2UncmUgZ2V0dGluZyBpdCBpbiB0aGlzIGZvcm1hdDogbGVmdD0wLCByaWdodD1ncmlkU2l6ZS4gU2FtZSB3aXRoIHRvcCBhbmQgYm90dG9tLlxyXG5cdC8vIEZpcnN0LCBsZXQncyBzZWUgd2hhdCB0aGUgZ3JpZCBsb29rcyBsaWtlIGNvbXBhcmVkIHRvIHRoZSBjYW52YXMuXHJcblx0Ly8gSXRzIGJvcmRlcnMgd2lsbCBhbHdheXMgYmUgdG91Y2hpbmcgd2hpY2hldmVyIHBhcnQncyB0aGlubmVyOiB0aGUgd2lkdGggb3IgdGhlIGhlaWdodC5cclxuXHJcblx0Y29uc3QgbWlkZGxlQ2FudmFzOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gPSB7IHg6IGNhbnZhcy53aWR0aCAvIDIsIHk6IGNhbnZhcy5oZWlnaHQgLyAyIH1cclxuXHJcblx0Y29uc3QgcG9zOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gPSB7XHJcblx0XHR4OiAoZ3JpZFNpemUgKiAobW91c2UueCAtIChtaWRkbGVDYW52YXMueCAtIEdSSURfV0lEVEggKiAwLjUpKSkgLyBHUklEX1dJRFRILFxyXG5cdFx0eTogKGdyaWRTaXplICogKG1vdXNlLnkgLSAobWlkZGxlQ2FudmFzLnkgLSBHUklEX0hFSUdIVCAqIDAuNSkpKSAvIEdSSURfSEVJR0hULFxyXG5cdH1cclxuXHJcblx0aWYgKHBvcy54ID49IDAgJiYgcG9zLnggPD0gZ3JpZFNpemUgJiYgcG9zLnkgPj0gMCAmJiBwb3MueSA8PSBncmlkU2l6ZSkge1xyXG5cdFx0Y29uc3QgaXRlbSA9IHsgeDogcG9zLnggfCAwLCB5OiBwb3MueSB8IDAgfVxyXG5cdFx0cmV0dXJuIGl0ZW1cclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIG51bGxcclxuXHR9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvb3JkaW5hdGVGcm9tTW91c2UoXHJcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRtb3VzZTogTW91c2VFdmVudCxcclxuXHRncmlkU2l6ZTogbnVtYmVyLFxyXG5cdEdSSURfV0lEVEg6IG51bWJlcixcclxuXHRHUklEX0hFSUdIVDogbnVtYmVyXHJcbik6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XHJcblx0Ly8gV2UncmUgZ2V0dGluZyBpdCBpbiB0aGlzIGZvcm1hdDogbGVmdD0wLCByaWdodD1ncmlkU2l6ZS4gU2FtZSB3aXRoIHRvcCBhbmQgYm90dG9tLlxyXG5cdC8vIEZpcnN0LCBsZXQncyBzZWUgd2hhdCB0aGUgZ3JpZCBsb29rcyBsaWtlIGNvbXBhcmVkIHRvIHRoZSBjYW52YXMuXHJcblx0Ly8gSXRzIGJvcmRlcnMgd2lsbCBhbHdheXMgYmUgdG91Y2hpbmcgd2hpY2hldmVyIHBhcnQncyB0aGlubmVyOiB0aGUgd2lkdGggb3IgdGhlIGhlaWdodC5cclxuXHJcblx0Y29uc3QgbWlkZGxlQ2FudmFzOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gPSB7IHg6IGNhbnZhcy53aWR0aCwgeTogY2FudmFzLmhlaWdodCB9XHJcblxyXG5cdGNvbnN0IHBvczogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9ID0ge1xyXG5cdFx0eDogKGdyaWRTaXplICogKG1vdXNlLnggLSAobWlkZGxlQ2FudmFzLnggLSBHUklEX1dJRFRIICogMC41KSkpIC8gR1JJRF9XSURUSCxcclxuXHRcdHk6IChncmlkU2l6ZSAqIChtb3VzZS55IC0gKG1pZGRsZUNhbnZhcy55IC0gR1JJRF9IRUlHSFQgKiAwLjUpKSkgLyBHUklEX0hFSUdIVCxcclxuXHR9XHJcblxyXG5cdHJldHVybiBwb3NcclxufVxyXG5cclxuLypcclxuICogV2hlbiBhbiBpbWFnZSBpcyBsb2FkZWQsIHRoaXMgd2lsbCBzdG9yZSBpdCBpbiB0aGUgc2hhZGVyIHRvIGJlIHVzZWQgYnkgdGhlIHNhbXBsZXIgcmVmZXJlbmNlcy5cclxuICogRm9yIGV4YW1wbGUsIHRvIHVzZSB0aGUgdGV4dHVyZSBzdG9yZWQgYXQgVEVYVFVSRTAsIHlvdSBzZXQgdGhlIHNhbXBsZXIgdG8gMC5cclxuICovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkVGV4dHVyZShcclxuXHRnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0LFxyXG5cdGltYWdlVVJMOiBzdHJpbmcsXHJcblx0Z2xUZXh0dXJlOiBHTGVudW1cclxuKTogV2ViR0xUZXh0dXJlIHtcclxuXHRmdW5jdGlvbiBpc1Bvd2VyT2YyKHZhbHVlOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHRcdGlmICgodmFsdWUgJiAodmFsdWUgLSAxKSkgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIHRydWVcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGludGVyZmFjZSBJV2ViR0xUZXh0dXJlRXh0ZW5kZWQgZXh0ZW5kcyBXZWJHTFRleHR1cmUge1xyXG5cdFx0aW1hZ2U/OiBIVE1MSW1hZ2VFbGVtZW50XHJcblx0fVxyXG5cclxuXHRjb25zdCB0ZXh0dXJlOiBJV2ViR0xUZXh0dXJlRXh0ZW5kZWQgPSBnbC5jcmVhdGVUZXh0dXJlKClcclxuXHR0ZXh0dXJlLmltYWdlID0gbmV3IEltYWdlKClcclxuXHR0ZXh0dXJlLmltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCk6IHZvaWQge1xyXG5cdFx0Z2wuYWN0aXZlVGV4dHVyZShnbFRleHR1cmUpXHJcblx0XHRnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCAxKVxyXG5cdFx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSlcclxuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpXHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKVxyXG5cdFx0Z2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0ZXh0dXJlLmltYWdlKVxyXG5cclxuXHRcdC8vIFRoaXMgY2xhbXBzIGltYWdlcyB3aG9zZSBkaW1lbnNpb25zIGFyZSBub3QgYSBwb3dlciBvZiAyLCBsZXR0aW5nIHlvdSB1c2UgaW1hZ2VzIG9mIGFueSBzaXplLlxyXG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSlcclxuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpXHJcblx0fVxyXG5cclxuXHR0ZXh0dXJlLmltYWdlLnNyYyA9IGltYWdlVVJMXHJcblx0cmV0dXJuIHRleHR1cmVcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVhc2UoZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyLCBlYXNpbmVzczogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRpZiAoZWFzaW5lc3MgPiAxKSB7XHJcblx0XHRlYXNpbmVzcyA9IDEgLyBlYXNpbmVzc1xyXG5cdH1cclxuXHRyZXR1cm4gKHRvIC0gZnJvbSkgKiBlYXNpbmVzc1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGlzcGxheUFsZXJ0TWF0cml4KG1hdHJpeDogbnVtYmVyW10pOiB2b2lkIHtcclxuXHRsZXQgdGVzdFN0cmluZzogc3RyaW5nID0gJydcclxuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAwLCBsOiBudW1iZXIgPSBtYXRyaXgubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHRpZiAoaSAlIDQgPT09IDAgJiYgaSA+IDApIHtcclxuXHRcdFx0dGVzdFN0cmluZyArPSAnXFxuJ1xyXG5cdFx0fVxyXG5cdFx0dGVzdFN0cmluZyArPSBtYXRyaXhbaV0gKyAnLCAnXHJcblx0fVxyXG5cdHRlc3RTdHJpbmcgKz0gJydcclxuXHRhbGVydCh0ZXN0U3RyaW5nKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkVmVjdG9ycyh2ZWMxOiBudW1iZXJbXSwgdmVjMjogbnVtYmVyW10pOiBudW1iZXJbXSB7XHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMCwgbDogbnVtYmVyID0gdmVjMS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuXHRcdGlmICh2ZWMyW2ldKSB7XHJcblx0XHRcdHZlYzFbaV0gKz0gdmVjMltpXVxyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gdmVjMVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdFZlY3RvcnModmVjMTogbnVtYmVyW10sIHZlYzI6IG51bWJlcltdKTogbnVtYmVyW10ge1xyXG5cdGZvciAobGV0IGk6IG51bWJlciA9IDAsIGw6IG51bWJlciA9IHZlYzEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHRpZiAodmVjMltpXSkge1xyXG5cdFx0XHR2ZWMxW2ldIC09IHZlYzJbaV1cclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIHZlYzFcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2VWZWN0b3IodmVjOiBudW1iZXJbXSk6IG51bWJlcltdIHtcclxuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAwLCBsOiBudW1iZXIgPSB2ZWMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHR2ZWNbaV0gPSAxIC0gTWF0aC5hYnModmVjW2ldKVxyXG5cdH1cclxuXHRyZXR1cm4gdmVjXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhbGVydE1hdDQobWF0OiBudW1iZXJbXSk6IHZvaWQge1xyXG5cdGxldCBzdHJpbmc6IHN0cmluZyA9ICdbJ1xyXG5cclxuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgNDsgaSsrKSB7XHJcblx0XHRmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgNDsgaisrKSB7XHJcblx0XHRcdHN0cmluZyArPSBNYXRoLnJvdW5kKG1hdFtpICogNCArIGpdKS50b1N0cmluZygpICsgJywgXFx0J1xyXG5cdFx0fVxyXG5cdFx0c3RyaW5nICs9ICdcXG4nXHJcblx0fVxyXG5cdHN0cmluZyArPSAnXSdcclxuXHRhbGVydChzdHJpbmcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGbG9hdDMyQ29uY2F0KG9yaWdpbmFsOiBudW1iZXJbXSwgYWRkaXRpb246IG51bWJlcltdKTogRmxvYXQzMkFycmF5IHwgbnVtYmVyW10ge1xyXG5cdGlmICghb3JpZ2luYWwpIHtcclxuXHRcdHJldHVybiBhZGRpdGlvblxyXG5cdH1cclxuXHJcblx0Y29uc3QgbGVuZ3RoOiBudW1iZXIgPSBvcmlnaW5hbC5sZW5ndGhcclxuXHRjb25zdCB0b3RhbExlbmd0aDogbnVtYmVyID0gbGVuZ3RoICsgYWRkaXRpb24ubGVuZ3RoXHJcblxyXG5cdGNvbnN0IHJlc3VsdCA9IG5ldyBGbG9hdDMyQXJyYXkodG90YWxMZW5ndGgpXHJcblxyXG5cdHJlc3VsdC5zZXQob3JpZ2luYWwpXHJcblx0cmVzdWx0LnNldChhZGRpdGlvbiwgbGVuZ3RoKVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmxldCB0b3RhbFRpbWVQYXNzZWQ6IG51bWJlciA9IDBcclxubGV0IGxhc3RUaW1lUGFzc2VkOiBudW1iZXIgPSAwXHJcbmV4cG9ydCBmdW5jdGlvbiBDb25zb2xlVGltZVBhc3NlZChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuXHR0b3RhbFRpbWVQYXNzZWQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG5cdGNvbnNvbGUubG9nKG1lc3NhZ2UgKyAnOiAnICsgKHRvdGFsVGltZVBhc3NlZCAtIGxhc3RUaW1lUGFzc2VkKSlcclxuXHRsYXN0VGltZVBhc3NlZCA9IHRvdGFsVGltZVBhc3NlZFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZWFzZU5vcm1hbFZlYyh2ZWM6IG51bWJlcltdKTogbnVtYmVyW10ge1xyXG5cdHZlY1swXSArPSAoMSAtIHZlY1swXSkgLyAyXHJcblx0dmVjWzFdICs9ICgxIC0gdmVjWzFdKSAvIDJcclxuXHR2ZWNbMl0gKz0gKDEgLSB2ZWNbMl0pIC8gMlxyXG5cclxuXHRyZXR1cm4gdmVjXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEJldHdlZW5WZWMobWluOiBudW1iZXJbXSwgcmFuZ2U6IG51bWJlcltdKTogbnVtYmVyW10ge1xyXG5cdGNvbnN0IHZlYzogbnVtYmVyW10gPSBbMCwgMCwgMF1cclxuXHR2ZWNbMF0gPSBNYXRoLnJhbmRvbSgpICogcmFuZ2VbMF0gKyBtaW5bMF1cclxuXHR2ZWNbMV0gPSBNYXRoLnJhbmRvbSgpICogcmFuZ2VbMV0gKyBtaW5bMV1cclxuXHR2ZWNbMl0gPSBNYXRoLnJhbmRvbSgpICogcmFuZ2VbMl0gKyBtaW5bMl1cclxuXHJcblx0cmV0dXJuIHZlY1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHZlYzogbnVtYmVyW10pOiBudW1iZXJbXSB7XHJcblx0bGV0IGk6IG51bWJlciA9IDBcclxuXHRsZXQgdG90YWw6IG51bWJlciA9IDBcclxuXHRjb25zdCBsOiBudW1iZXIgPSB2ZWMubGVuZ3RoXHJcblx0Zm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG5cdFx0dG90YWwgKz0gdmVjW2ldXHJcblx0fVxyXG5cdGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuXHRcdHZlY1tpXSAvPSB0b3RhbFxyXG5cdH1cclxuXHRyZXR1cm4gdmVjXHJcbn1cclxuXHJcbmNvbnN0IFdlYkdMVXRpbHMgPSAoZnVuY3Rpb24oKToge1xyXG5cdHNldHVwV2ViR0w6IChcclxuXHRcdGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXHJcblx0XHRvcHRfYXR0cmlicz86IG9iamVjdCxcclxuXHRcdG9wdF9vbkVycm9yPzogYW55XHJcblx0KSA9PiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBXZWJHTFJlbmRlcmluZ0NvbnRleHQgfCBudWxsXHJcblx0Y3JlYXRlM0RDb250ZXh0OiAoXHJcblx0XHRjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG5cdFx0b3B0X2F0dHJpYnM/OiBvYmplY3RcclxuXHQpID0+IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IG51bGxcclxufSB7XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyB0aGUgSFRMTSBmb3IgYSBmYWlsdXJlIG1lc3NhZ2VcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gY2FudmFzQ29udGFpbmVySWQgaWQgb2YgY29udGFpbmVyIG9mIHRoXHJcblx0ICogICAgICAgIGNhbnZhcy5cclxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBodG1sLlxyXG5cdCAqL1xyXG5cdGNvbnN0IG1ha2VGYWlsSFRNTCA9IGZ1bmN0aW9uKG1zZzogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdCcnICtcclxuXHRcdFx0Jzx0YWJsZSBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICM4Q0U7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7XCI+PHRyPicgK1xyXG5cdFx0XHQnPHRkIGFsaWduPVwiY2VudGVyXCI+JyArXHJcblx0XHRcdCc8ZGl2IHN0eWxlPVwiZGlzcGxheTogdGFibGUtY2VsbDsgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcIj4nICtcclxuXHRcdFx0JzxkaXYgc3R5bGU9XCJcIj4nICtcclxuXHRcdFx0bXNnICtcclxuXHRcdFx0JzwvZGl2PicgK1xyXG5cdFx0XHQnPC9kaXY+JyArXHJcblx0XHRcdCc8L3RkPjwvdHI+PC90YWJsZT4nXHJcblx0XHQpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNZXNhc2dlIGZvciBnZXR0aW5nIGEgd2ViZ2wgYnJvd3NlclxyXG5cdCAqIEB0eXBlIHtzdHJpbmd9XHJcblx0ICovXHJcblx0Y29uc3QgR0VUX0FfV0VCR0xfQlJPV1NFUjogc3RyaW5nID1cclxuXHRcdCcnICtcclxuXHRcdCdUaGlzIHBhZ2UgcmVxdWlyZXMgYSBicm93c2VyIHRoYXQgc3VwcG9ydHMgV2ViR0wuPGJyLz4nICtcclxuXHRcdCc8YSBocmVmPVwiaHR0cDovL2dldC53ZWJnbC5vcmdcIj5DbGljayBoZXJlIHRvIHVwZ3JhZGUgeW91ciBicm93c2VyLjwvYT4nXHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lc2FzZ2UgZm9yIG5lZWQgYmV0dGVyIGhhcmR3YXJlXHJcblx0ICogQHR5cGUge3N0cmluZ31cclxuXHQgKi9cclxuXHRjb25zdCBPVEhFUl9QUk9CTEVNOiBzdHJpbmcgPSBgSXQgZG9lc24ndCBhcHBlYXIgeW91ciBjb21wdXRlciBjYW4gc3VwcG9ydCBXZWJHTC48YnIvPlxyXG5cdFx0PGEgaHJlZj1cImh0dHA6Ly9nZXQud2ViZ2wub3JnL3Ryb3VibGVzaG9vdGluZy9cIj5DbGljayBoZXJlIGZvciBtb3JlIGluZm9ybWF0aW9uLjwvYT5gXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSB3ZWJnbCBjb250ZXh0LiBJZiBjcmVhdGlvbiBmYWlscyBpdCB3aWxsXHJcblx0ICogY2hhbmdlIHRoZSBjb250ZW50cyBvZiB0aGUgY29udGFpbmVyIG9mIHRoZSA8Y2FudmFzPlxyXG5cdCAqIHRhZyB0byBhbiBlcnJvciBtZXNzYWdlIHdpdGggdGhlIGNvcnJlY3QgbGlua3MgZm9yIFdlYkdMLlxyXG5cdCAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhcy4gVGhlIGNhbnZhcyBlbGVtZW50IHRvIGNyZWF0ZSBhXHJcblx0ICogICAgIGNvbnRleHQgZnJvbS5cclxuXHQgKiBAcGFyYW0ge1dlYkdMQ29udGV4dENyZWF0aW9uQXR0aXJidXRlc30gb3B0X2F0dHJpYnMgQW55XHJcblx0ICogICAgIGNyZWF0aW9uIGF0dHJpYnV0ZXMgeW91IHdhbnQgdG8gcGFzcyBpbi5cclxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uOihtc2cpfSBvcHRfb25FcnJvciBBbiBmdW5jdGlvbiB0byBjYWxsXHJcblx0ICogICAgIGlmIHRoZXJlIGlzIGFuIGVycm9yIGR1cmluZyBjcmVhdGlvbi5cclxuXHQgKiBAcmV0dXJuIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IFRoZSBjcmVhdGVkIGNvbnRleHQuXHJcblx0ICovXHJcblx0Y29uc3Qgc2V0dXBXZWJHTCA9IGZ1bmN0aW9uKFxyXG5cdFx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRcdG9wdF9hdHRyaWJzPzogb2JqZWN0LFxyXG5cdFx0b3B0X29uRXJyb3I/OiBhbnlcclxuXHQpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBXZWJHTFJlbmRlcmluZ0NvbnRleHQgfCBudWxsIHtcclxuXHRcdGZ1bmN0aW9uIGhhbmRsZUNyZWF0aW9uRXJyb3IobXNnOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0Y29uc3QgY29udGFpbmVyOiBOb2RlID0gY2FudmFzLnBhcmVudE5vZGVcclxuXHRcdFx0aWYgKGNvbnRhaW5lcikge1xyXG5cdFx0XHRcdGxldCBzdHI6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5XZWJHTFJlbmRlcmluZ0NvbnRleHRcclxuXHRcdFx0XHRcdD8gT1RIRVJfUFJPQkxFTVxyXG5cdFx0XHRcdFx0OiBHRVRfQV9XRUJHTF9CUk9XU0VSXHJcblx0XHRcdFx0aWYgKG1zZykge1xyXG5cdFx0XHRcdFx0c3RyICs9ICc8YnIvPjxici8+U3RhdHVzOiAnICsgbXNnXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnRhaW5lci50ZXh0Q29udGVudCA9IG1ha2VGYWlsSFRNTChzdHIpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRvcHRfb25FcnJvciA9IG9wdF9vbkVycm9yIHx8IGhhbmRsZUNyZWF0aW9uRXJyb3JcclxuXHJcblx0XHRpZiAoY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXHJcblx0XHRcdFx0J3dlYmdsY29udGV4dGNyZWF0aW9uZXJyb3InLFxyXG5cdFx0XHRcdChldmVudDogV2ViR0xDb250ZXh0RXZlbnQpOiB2b2lkID0+IG9wdF9vbkVycm9yKGV2ZW50LnN0YXR1c01lc3NhZ2UpXHJcblx0XHRcdClcclxuXHRcdH1cclxuXHRcdGNvbnN0IGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IG51bGwgPSBjcmVhdGUzRENvbnRleHQoXHJcblx0XHRcdGNhbnZhcyxcclxuXHRcdFx0b3B0X2F0dHJpYnNcclxuXHRcdClcclxuXHRcdGlmICghY29udGV4dCkge1xyXG5cdFx0XHRpZiAoISh3aW5kb3cgYXMgYW55KS5XZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcclxuXHRcdFx0XHRvcHRfb25FcnJvcignJylcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNvbnRleHRcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSB3ZWJnbCBjb250ZXh0LlxyXG5cdCAqIEBwYXJhbSB7IUNhbnZhc30gY2FudmFzIFRoZSBjYW52YXMgdGFnIHRvIGdldCBjb250ZXh0XHJcblx0ICogICAgIGZyb20uIElmIG9uZSBpcyBub3QgcGFzc2VkIGluIG9uZSB3aWxsIGJlIGNyZWF0ZWQuXHJcblx0ICogQHJldHVybiB7IVdlYkdMQ29udGV4dH0gVGhlIGNyZWF0ZWQgY29udGV4dC5cclxuXHQgKi9cclxuXHRjb25zdCBjcmVhdGUzRENvbnRleHQgPSBmdW5jdGlvbihcclxuXHRcdGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXHJcblx0XHRvcHRfYXR0cmlicz86IG9iamVjdFxyXG5cdCk6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IG51bGwge1xyXG5cdFx0Y29uc3QgbmFtZXM6IHN0cmluZ1tdID0gWyd3ZWJnbCcsICdleHBlcmltZW50YWwtd2ViZ2wnLCAnd2Via2l0LTNkJywgJ21vei13ZWJnbCddXHJcblx0XHRsZXQgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgV2ViR0xSZW5kZXJpbmdDb250ZXh0IHwgbnVsbCA9IG51bGxcclxuXHRcdGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChuYW1lLCBvcHRfYXR0cmlicylcclxuXHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoY29udGV4dCkge1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBjb250ZXh0XHJcblx0fVxyXG5cclxuXHRyZXR1cm4geyBzZXR1cFdlYkdMLCBjcmVhdGUzRENvbnRleHQgfVxyXG59KSgpXHJcblxyXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiAoXHJcblx0XHQod2luZG93IGFzIGFueSkucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHQod2luZG93IGFzIGFueSkud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHQod2luZG93IGFzIGFueSkubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHQod2luZG93IGFzIGFueSkub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHRmdW5jdGlvbihjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG5cdFx0XHR3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDE1KVxyXG5cdFx0fVxyXG5cdClcclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2ViR0xVdGlsc1xyXG4iLCIvKiFcclxuQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcclxuQGF1dGhvciBCcmFuZG9uIEpvbmVzXHJcbkBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXHJcbkB2ZXJzaW9uIDMuMC4wXHJcblxyXG5Db3B5cmlnaHQgKGMpIDIwMTUtMjAxOSwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuXHJcblxyXG4qL1xyXG47KGZ1bmN0aW9uKGdsb2JhbCwgZmFjdG9yeSkge1xyXG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJ1xyXG5cdFx0PyBmYWN0b3J5KGV4cG9ydHMpXHJcblx0XHQ6IHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZFxyXG5cdFx0PyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpXHJcblx0XHQ6IGZhY3RvcnkoKGdsb2JhbC5nbE1hdHJpeCA9IHt9KSlcclxufSkodGhpcywgZnVuY3Rpb24oZXhwb3J0cykge1xyXG5cdCd1c2Ugc3RyaWN0J1xyXG5cclxuXHQvKipcclxuXHQgKiBDb21tb24gdXRpbGl0aWVzXHJcblx0ICogQG1vZHVsZSBnbE1hdHJpeFxyXG5cdCAqL1xyXG5cdC8vIENvbmZpZ3VyYXRpb24gQ29uc3RhbnRzXHJcblx0dmFyIEVQU0lMT04gPSAwLjAwMDAwMVxyXG5cdHZhciBBUlJBWV9UWVBFID0gdHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBGbG9hdDMyQXJyYXkgOiBBcnJheVxyXG5cdHZhciBSQU5ET00gPSBNYXRoLnJhbmRvbVxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtUeXBlfSB0eXBlIEFycmF5IHR5cGUsIHN1Y2ggYXMgRmxvYXQzMkFycmF5IG9yIEFycmF5XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldE1hdHJpeEFycmF5VHlwZSh0eXBlKSB7XHJcblx0XHRBUlJBWV9UWVBFID0gdHlwZVxyXG5cdH1cclxuXHR2YXIgZGVncmVlID0gTWF0aC5QSSAvIDE4MFxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgRGVncmVlIFRvIFJhZGlhblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGEgQW5nbGUgaW4gRGVncmVlc1xyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0b1JhZGlhbihhKSB7XHJcblx0XHRyZXR1cm4gYSAqIGRlZ3JlZVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnRzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSB2YWx1ZSwgd2l0aGluIGFuIGFic29sdXRlXHJcblx0ICogb3IgcmVsYXRpdmUgdG9sZXJhbmNlIG9mIGdsTWF0cml4LkVQU0lMT04gKGFuIGFic29sdXRlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciB2YWx1ZXMgbGVzc1xyXG5cdCAqIHRoYW4gb3IgZXF1YWwgdG8gMS4wLCBhbmQgYSByZWxhdGl2ZSB0b2xlcmFuY2UgaXMgdXNlZCBmb3IgbGFyZ2VyIHZhbHVlcylcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBhIFRoZSBmaXJzdCBudW1iZXIgdG8gdGVzdC5cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBUaGUgc2Vjb25kIG51bWJlciB0byB0ZXN0LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBudW1iZXJzIGFyZSBhcHByb3hpbWF0ZWx5IGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEpLCBNYXRoLmFicyhiKSlcclxuXHR9XHJcblxyXG5cdHZhciBjb21tb24gPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0RVBTSUxPTjogRVBTSUxPTixcclxuXHRcdGdldCBBUlJBWV9UWVBFKCkge1xyXG5cdFx0XHRyZXR1cm4gQVJSQVlfVFlQRVxyXG5cdFx0fSxcclxuXHRcdFJBTkRPTTogUkFORE9NLFxyXG5cdFx0c2V0TWF0cml4QXJyYXlUeXBlOiBzZXRNYXRyaXhBcnJheVR5cGUsXHJcblx0XHR0b1JhZGlhbjogdG9SYWRpYW4sXHJcblx0XHRlcXVhbHM6IGVxdWFscyxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAyeDIgTWF0cml4XHJcblx0ICogQG1vZHVsZSBtYXQyXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MlxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBtYXQyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgbWF0cml4IHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBtYXQyIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgbmV3IG1hdDIgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dCBBIG5ldyAyeDIgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMobTAwLCBtMDEsIG0xMCwgbTExKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHRcdG91dFswXSA9IG0wMFxyXG5cdFx0b3V0WzFdID0gbTAxXHJcblx0XHRvdXRbMl0gPSBtMTBcclxuXHRcdG91dFszXSA9IG0xMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0xMCwgbTExKSB7XHJcblx0XHRvdXRbMF0gPSBtMDBcclxuXHRcdG91dFsxXSA9IG0wMVxyXG5cdFx0b3V0WzJdID0gbTEwXHJcblx0XHRvdXRbM10gPSBtMTFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xyXG5cdFx0Ly8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZVxyXG5cdFx0Ly8gc29tZSB2YWx1ZXNcclxuXHRcdGlmIChvdXQgPT09IGEpIHtcclxuXHRcdFx0dmFyIGExID0gYVsxXVxyXG5cdFx0XHRvdXRbMV0gPSBhWzJdXHJcblx0XHRcdG91dFsyXSA9IGExXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRcdG91dFsxXSA9IGFbMl1cclxuXHRcdFx0b3V0WzJdID0gYVsxXVxyXG5cdFx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBJbnZlcnRzIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10gLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG5cclxuXHRcdHZhciBkZXQgPSBhMCAqIGEzIC0gYTIgKiBhMVxyXG5cclxuXHRcdGlmICghZGV0KSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0ZGV0ID0gMS4wIC8gZGV0XHJcblx0XHRvdXRbMF0gPSBhMyAqIGRldFxyXG5cdFx0b3V0WzFdID0gLWExICogZGV0XHJcblx0XHRvdXRbMl0gPSAtYTIgKiBkZXRcclxuXHRcdG91dFszXSA9IGEwICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkam9pbnQob3V0LCBhKSB7XHJcblx0XHQvLyBDYWNoaW5nIHRoaXMgdmFsdWUgaXMgbmVzc2VjYXJ5IGlmIG91dCA9PSBhXHJcblx0XHR2YXIgYTAgPSBhWzBdXHJcblx0XHRvdXRbMF0gPSBhWzNdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0b3V0WzJdID0gLWFbMl1cclxuXHRcdG91dFszXSA9IGEwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XHJcblx0XHRyZXR1cm4gYVswXSAqIGFbM10gLSBhWzJdICogYVsxXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBtYXQyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdXHJcblx0XHRvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMVxyXG5cdFx0b3V0WzFdID0gYTEgKiBiMCArIGEzICogYjFcclxuXHRcdG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzXHJcblx0XHRvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiM1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0MiBieSB0aGUgZ2l2ZW4gYW5nbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGEwICogYyArIGEyICogc1xyXG5cdFx0b3V0WzFdID0gYTEgKiBjICsgYTMgKiBzXHJcblx0XHRvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjXHJcblx0XHRvdXRbM10gPSBhMSAqIC1zICsgYTMgKiBjXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyB0aGUgbWF0MiBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIHYwID0gdlswXSxcclxuXHRcdFx0djEgPSB2WzFdXHJcblx0XHRvdXRbMF0gPSBhMCAqIHYwXHJcblx0XHRvdXRbMV0gPSBhMSAqIHYwXHJcblx0XHRvdXRbMl0gPSBhMiAqIHYxXHJcblx0XHRvdXRbM10gPSBhMyAqIHYxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0Mi5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0Mi5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IG1hdDIgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gY1xyXG5cdFx0b3V0WzFdID0gc1xyXG5cdFx0b3V0WzJdID0gLXNcclxuXHRcdG91dFszXSA9IGNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQyLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQyLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCBtYXQyIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IHZbMF1cclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IHZbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyKGEpIHtcclxuXHRcdHJldHVybiAnbWF0MignICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvYihhKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpKVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIEwsIEQgYW5kIFUgbWF0cmljZXMgKExvd2VyIHRyaWFuZ3VsYXIsIERpYWdvbmFsIGFuZCBVcHBlciB0cmlhbmd1bGFyKSBieSBmYWN0b3JpemluZyB0aGUgaW5wdXQgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBMIHRoZSBsb3dlciB0cmlhbmd1bGFyIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gRCB0aGUgZGlhZ29uYWwgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBVIHRoZSB1cHBlciB0cmlhbmd1bGFyIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgaW5wdXQgbWF0cml4IHRvIGZhY3Rvcml6ZVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBMRFUoTCwgRCwgVSwgYSkge1xyXG5cdFx0TFsyXSA9IGFbMl0gLyBhWzBdXHJcblx0XHRVWzBdID0gYVswXVxyXG5cdFx0VVsxXSA9IGFbMV1cclxuXHRcdFVbM10gPSBhWzNdIC0gTFsyXSAqIFVbMV1cclxuXHRcdHJldHVybiBbTCwgRCwgVV1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0MidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAtIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC0gYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAtIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xyXG5cdFx0cmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM11cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDEoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0MidzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwgPSBtdWx0aXBseVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0Mi5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiA9IHN1YnRyYWN0XHJcblxyXG5cdHZhciBtYXQyID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlLFxyXG5cdFx0Y2xvbmU6IGNsb25lLFxyXG5cdFx0Y29weTogY29weSxcclxuXHRcdGlkZW50aXR5OiBpZGVudGl0eSxcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMsXHJcblx0XHRzZXQ6IHNldCxcclxuXHRcdHRyYW5zcG9zZTogdHJhbnNwb3NlLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQsXHJcblx0XHRhZGpvaW50OiBhZGpvaW50LFxyXG5cdFx0ZGV0ZXJtaW5hbnQ6IGRldGVybWluYW50LFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5LFxyXG5cdFx0cm90YXRlOiByb3RhdGUsXHJcblx0XHRzY2FsZTogc2NhbGUsXHJcblx0XHRmcm9tUm90YXRpb246IGZyb21Sb3RhdGlvbixcclxuXHRcdGZyb21TY2FsaW5nOiBmcm9tU2NhbGluZyxcclxuXHRcdHN0cjogc3RyLFxyXG5cdFx0ZnJvYjogZnJvYixcclxuXHRcdExEVTogTERVLFxyXG5cdFx0YWRkOiBhZGQsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQxLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXI6IG11bHRpcGx5U2NhbGFyLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXJBbmRBZGQ6IG11bHRpcGx5U2NhbGFyQW5kQWRkLFxyXG5cdFx0bXVsOiBtdWwsXHJcblx0XHRzdWI6IHN1YixcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAyeDMgTWF0cml4XHJcblx0ICogQG1vZHVsZSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQGRlc2NyaXB0aW9uXHJcblx0ICogQSBtYXQyZCBjb250YWlucyBzaXggZWxlbWVudHMgZGVmaW5lZCBhczpcclxuXHQgKiA8cHJlPlxyXG5cdCAqIFthLCBjLCB0eCxcclxuXHQgKiAgYiwgZCwgdHldXHJcblx0ICogPC9wcmU+XHJcblx0ICogVGhpcyBpcyBhIHNob3J0IGZvcm0gZm9yIHRoZSAzeDMgbWF0cml4OlxyXG5cdCAqIDxwcmU+XHJcblx0ICogW2EsIGMsIHR4LFxyXG5cdCAqICBiLCBkLCB0eSxcclxuXHQgKiAgMCwgMCwgMV1cclxuXHQgKiA8L3ByZT5cclxuXHQgKiBUaGUgbGFzdCByb3cgaXMgaWdub3JlZCBzbyB0aGUgYXJyYXkgaXMgc2hvcnRlciBhbmQgb3BlcmF0aW9ucyBhcmUgZmFzdGVyLlxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDEoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNilcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdG91dFs0XSA9IDBcclxuXHRcdFx0b3V0WzVdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBtYXQyZCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkMShhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNilcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDJkIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCBhIG1hdDJkIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGlkZW50aXR5JDEob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIG5ldyBtYXQyZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBhIENvbXBvbmVudCBBIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIENvbXBvbmVudCBCIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIENvbXBvbmVudCBDIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkIENvbXBvbmVudCBEIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0eCBDb21wb25lbnQgVFggKGluZGV4IDQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHR5IENvbXBvbmVudCBUWSAoaW5kZXggNSlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IEEgbmV3IG1hdDJkXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkMShhLCBiLCBjLCBkLCB0eCwgdHkpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg2KVxyXG5cdFx0b3V0WzBdID0gYVxyXG5cdFx0b3V0WzFdID0gYlxyXG5cdFx0b3V0WzJdID0gY1xyXG5cdFx0b3V0WzNdID0gZFxyXG5cdFx0b3V0WzRdID0gdHhcclxuXHRcdG91dFs1XSA9IHR5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDJkIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBhIENvbXBvbmVudCBBIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIENvbXBvbmVudCBCIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIENvbXBvbmVudCBDIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkIENvbXBvbmVudCBEIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0eCBDb21wb25lbnQgVFggKGluZGV4IDQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHR5IENvbXBvbmVudCBUWSAoaW5kZXggNSlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkMShvdXQsIGEsIGIsIGMsIGQsIHR4LCB0eSkge1xyXG5cdFx0b3V0WzBdID0gYVxyXG5cdFx0b3V0WzFdID0gYlxyXG5cdFx0b3V0WzJdID0gY1xyXG5cdFx0b3V0WzNdID0gZFxyXG5cdFx0b3V0WzRdID0gdHhcclxuXHRcdG91dFs1XSA9IHR5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEludmVydHMgYSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVydCQxKG91dCwgYSkge1xyXG5cdFx0dmFyIGFhID0gYVswXSxcclxuXHRcdFx0YWIgPSBhWzFdLFxyXG5cdFx0XHRhYyA9IGFbMl0sXHJcblx0XHRcdGFkID0gYVszXVxyXG5cdFx0dmFyIGF0eCA9IGFbNF0sXHJcblx0XHRcdGF0eSA9IGFbNV1cclxuXHRcdHZhciBkZXQgPSBhYSAqIGFkIC0gYWIgKiBhY1xyXG5cclxuXHRcdGlmICghZGV0KSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0ZGV0ID0gMS4wIC8gZGV0XHJcblx0XHRvdXRbMF0gPSBhZCAqIGRldFxyXG5cdFx0b3V0WzFdID0gLWFiICogZGV0XHJcblx0XHRvdXRbMl0gPSAtYWMgKiBkZXRcclxuXHRcdG91dFszXSA9IGFhICogZGV0XHJcblx0XHRvdXRbNF0gPSAoYWMgKiBhdHkgLSBhZCAqIGF0eCkgKiBkZXRcclxuXHRcdG91dFs1XSA9IChhYiAqIGF0eCAtIGFhICogYXR5KSAqIGRldFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkZXRlcm1pbmFudCQxKGEpIHtcclxuXHRcdHJldHVybiBhWzBdICogYVszXSAtIGFbMV0gKiBhWzJdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIG1hdDJkJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5JDEob3V0LCBhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXSxcclxuXHRcdFx0YjQgPSBiWzRdLFxyXG5cdFx0XHRiNSA9IGJbNV1cclxuXHRcdG91dFswXSA9IGEwICogYjAgKyBhMiAqIGIxXHJcblx0XHRvdXRbMV0gPSBhMSAqIGIwICsgYTMgKiBiMVxyXG5cdFx0b3V0WzJdID0gYTAgKiBiMiArIGEyICogYjNcclxuXHRcdG91dFszXSA9IGExICogYjIgKyBhMyAqIGIzXHJcblx0XHRvdXRbNF0gPSBhMCAqIGI0ICsgYTIgKiBiNSArIGE0XHJcblx0XHRvdXRbNV0gPSBhMSAqIGI0ICsgYTMgKiBiNSArIGE1XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBtYXQyZCBieSB0aGUgZ2l2ZW4gYW5nbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZSQxKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XVxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGEwICogYyArIGEyICogc1xyXG5cdFx0b3V0WzFdID0gYTEgKiBjICsgYTMgKiBzXHJcblx0XHRvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjXHJcblx0XHRvdXRbM10gPSBhMSAqIC1zICsgYTMgKiBjXHJcblx0XHRvdXRbNF0gPSBhNFxyXG5cdFx0b3V0WzVdID0gYTVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDEob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XVxyXG5cdFx0dmFyIHYwID0gdlswXSxcclxuXHRcdFx0djEgPSB2WzFdXHJcblx0XHRvdXRbMF0gPSBhMCAqIHYwXHJcblx0XHRvdXRbMV0gPSBhMSAqIHYwXHJcblx0XHRvdXRbMl0gPSBhMiAqIHYxXHJcblx0XHRvdXRbM10gPSBhMyAqIHYxXHJcblx0XHRvdXRbNF0gPSBhNFxyXG5cdFx0b3V0WzVdID0gYTVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNsYXRlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gdHJhbnNsYXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV1cclxuXHRcdHZhciB2MCA9IHZbMF0sXHJcblx0XHRcdHYxID0gdlsxXVxyXG5cdFx0b3V0WzBdID0gYTBcclxuXHRcdG91dFsxXSA9IGExXHJcblx0XHRvdXRbMl0gPSBhMlxyXG5cdFx0b3V0WzNdID0gYTNcclxuXHRcdG91dFs0XSA9IGEwICogdjAgKyBhMiAqIHYxICsgYTRcclxuXHRcdG91dFs1XSA9IGExICogdjAgKyBhMyAqIHYxICsgYTVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGVcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQyZC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0MmQucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgbWF0MmQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvbiQxKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSBzXHJcblx0XHRvdXRbMl0gPSAtc1xyXG5cdFx0b3V0WzNdID0gY1xyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDJkLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQyZC5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IG1hdDJkIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVNjYWxpbmckMShvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IHZbMF1cclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IHZbMV1cclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHRyYW5zbGF0aW9uXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0MmQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDJkLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IG1hdDJkIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdG91dFs0XSA9IHZbMF1cclxuXHRcdG91dFs1XSA9IHZbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkMShhKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQnbWF0MmQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnLCAnICsgYVs0XSArICcsICcgKyBhWzVdICsgJyknXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb2IkMShhKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KFxyXG5cdFx0XHRNYXRoLnBvdyhhWzBdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzNdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs0XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNV0sIDIpICtcclxuXHRcdFx0XHQxXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDJkJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQxKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkMShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLSBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdIC0gYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSAtIGJbNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIkMShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRvdXRbNF0gPSBhWzRdICogYlxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0MmQncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZCQxKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGVcclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGVcclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdICogc2NhbGVcclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQxKGEsIGIpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdGFbMF0gPT09IGJbMF0gJiZcclxuXHRcdFx0YVsxXSA9PT0gYlsxXSAmJlxyXG5cdFx0XHRhWzJdID09PSBiWzJdICYmXHJcblx0XHRcdGFbM10gPT09IGJbM10gJiZcclxuXHRcdFx0YVs0XSA9PT0gYls0XSAmJlxyXG5cdFx0XHRhWzVdID09PSBiWzVdXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDIoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV1cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM10sXHJcblx0XHRcdGI0ID0gYls0XSxcclxuXHRcdFx0YjUgPSBiWzVdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMyAtIGIzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTQgLSBiNCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE1IC0gYjUpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDJkLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDEgPSBtdWx0aXBseSQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQyZC5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQxID0gc3VidHJhY3QkMVxyXG5cclxuXHR2YXIgbWF0MmQgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkMSxcclxuXHRcdGNsb25lOiBjbG9uZSQxLFxyXG5cdFx0Y29weTogY29weSQxLFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5JDEsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDEsXHJcblx0XHRzZXQ6IHNldCQxLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkMSxcclxuXHRcdGRldGVybWluYW50OiBkZXRlcm1pbmFudCQxLFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDEsXHJcblx0XHRyb3RhdGU6IHJvdGF0ZSQxLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDEsXHJcblx0XHR0cmFuc2xhdGU6IHRyYW5zbGF0ZSxcclxuXHRcdGZyb21Sb3RhdGlvbjogZnJvbVJvdGF0aW9uJDEsXHJcblx0XHRmcm9tU2NhbGluZzogZnJvbVNjYWxpbmckMSxcclxuXHRcdGZyb21UcmFuc2xhdGlvbjogZnJvbVRyYW5zbGF0aW9uLFxyXG5cdFx0c3RyOiBzdHIkMSxcclxuXHRcdGZyb2I6IGZyb2IkMSxcclxuXHRcdGFkZDogYWRkJDEsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkMSxcclxuXHRcdG11bHRpcGx5U2NhbGFyOiBtdWx0aXBseVNjYWxhciQxLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXJBbmRBZGQ6IG11bHRpcGx5U2NhbGFyQW5kQWRkJDEsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkMSxcclxuXHRcdGVxdWFsczogZXF1YWxzJDIsXHJcblx0XHRtdWw6IG11bCQxLFxyXG5cdFx0c3ViOiBzdWIkMSxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAzeDMgTWF0cml4XHJcblx0ICogQG1vZHVsZSBtYXQzXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0M1xyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDIoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoOSlcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdG91dFszXSA9IDBcclxuXHRcdFx0b3V0WzVdID0gMFxyXG5cdFx0XHRvdXRbNl0gPSAwXHJcblx0XHRcdG91dFs3XSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbNF0gPSAxXHJcblx0XHRvdXRbOF0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcGllcyB0aGUgdXBwZXItbGVmdCAzeDMgdmFsdWVzIGludG8gdGhlIGdpdmVuIG1hdDMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIDN4MyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgICB0aGUgc291cmNlIDR4NCBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21NYXQ0KG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVs0XVxyXG5cdFx0b3V0WzRdID0gYVs1XVxyXG5cdFx0b3V0WzVdID0gYVs2XVxyXG5cdFx0b3V0WzZdID0gYVs4XVxyXG5cdFx0b3V0WzddID0gYVs5XVxyXG5cdFx0b3V0WzhdID0gYVsxMF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBtYXQzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkMihhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoOSlcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdG91dFs2XSA9IGFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkMihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdG91dFs2XSA9IGFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgbmV3IG1hdDMgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggOClcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gQSBuZXcgbWF0M1xyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDIobTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDkpXHJcblx0XHRvdXRbMF0gPSBtMDBcclxuXHRcdG91dFsxXSA9IG0wMVxyXG5cdFx0b3V0WzJdID0gbTAyXHJcblx0XHRvdXRbM10gPSBtMTBcclxuXHRcdG91dFs0XSA9IG0xMVxyXG5cdFx0b3V0WzVdID0gbTEyXHJcblx0XHRvdXRbNl0gPSBtMjBcclxuXHRcdG91dFs3XSA9IG0yMVxyXG5cdFx0b3V0WzhdID0gbTIyXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDMgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggOClcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldCQyKG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0wMlxyXG5cdFx0b3V0WzNdID0gbTEwXHJcblx0XHRvdXRbNF0gPSBtMTFcclxuXHRcdG91dFs1XSA9IG0xMlxyXG5cdFx0b3V0WzZdID0gbTIwXHJcblx0XHRvdXRbN10gPSBtMjFcclxuXHRcdG91dFs4XSA9IG0yMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBtYXQzIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQyKG91dCkge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMVxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc3Bvc2UkMShvdXQsIGEpIHtcclxuXHRcdC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcclxuXHRcdGlmIChvdXQgPT09IGEpIHtcclxuXHRcdFx0dmFyIGEwMSA9IGFbMV0sXHJcblx0XHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0XHRhMTIgPSBhWzVdXHJcblx0XHRcdG91dFsxXSA9IGFbM11cclxuXHRcdFx0b3V0WzJdID0gYVs2XVxyXG5cdFx0XHRvdXRbM10gPSBhMDFcclxuXHRcdFx0b3V0WzVdID0gYVs3XVxyXG5cdFx0XHRvdXRbNl0gPSBhMDJcclxuXHRcdFx0b3V0WzddID0gYTEyXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRcdG91dFsxXSA9IGFbM11cclxuXHRcdFx0b3V0WzJdID0gYVs2XVxyXG5cdFx0XHRvdXRbM10gPSBhWzFdXHJcblx0XHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdFx0b3V0WzVdID0gYVs3XVxyXG5cdFx0XHRvdXRbNl0gPSBhWzJdXHJcblx0XHRcdG91dFs3XSA9IGFbNV1cclxuXHRcdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogSW52ZXJ0cyBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQkMihvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTEwID0gYVszXSxcclxuXHRcdFx0YTExID0gYVs0XSxcclxuXHRcdFx0YTEyID0gYVs1XVxyXG5cdFx0dmFyIGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF1cclxuXHRcdHZhciBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjFcclxuXHRcdHZhciBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwXHJcblx0XHR2YXIgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuXHJcblx0XHR2YXIgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxXHJcblxyXG5cdFx0aWYgKCFkZXQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRkZXQgPSAxLjAgLyBkZXRcclxuXHRcdG91dFswXSA9IGIwMSAqIGRldFxyXG5cdFx0b3V0WzFdID0gKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpICogZGV0XHJcblx0XHRvdXRbMl0gPSAoYTEyICogYTAxIC0gYTAyICogYTExKSAqIGRldFxyXG5cdFx0b3V0WzNdID0gYjExICogZGV0XHJcblx0XHRvdXRbNF0gPSAoYTIyICogYTAwIC0gYTAyICogYTIwKSAqIGRldFxyXG5cdFx0b3V0WzVdID0gKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApICogZGV0XHJcblx0XHRvdXRbNl0gPSBiMjEgKiBkZXRcclxuXHRcdG91dFs3XSA9ICgtYTIxICogYTAwICsgYTAxICogYTIwKSAqIGRldFxyXG5cdFx0b3V0WzhdID0gKGExMSAqIGEwMCAtIGEwMSAqIGExMCkgKiBkZXRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRqb2ludCQxKG91dCwgYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMTAgPSBhWzNdLFxyXG5cdFx0XHRhMTEgPSBhWzRdLFxyXG5cdFx0XHRhMTIgPSBhWzVdXHJcblx0XHR2YXIgYTIwID0gYVs2XSxcclxuXHRcdFx0YTIxID0gYVs3XSxcclxuXHRcdFx0YTIyID0gYVs4XVxyXG5cdFx0b3V0WzBdID0gYTExICogYTIyIC0gYTEyICogYTIxXHJcblx0XHRvdXRbMV0gPSBhMDIgKiBhMjEgLSBhMDEgKiBhMjJcclxuXHRcdG91dFsyXSA9IGEwMSAqIGExMiAtIGEwMiAqIGExMVxyXG5cdFx0b3V0WzNdID0gYTEyICogYTIwIC0gYTEwICogYTIyXHJcblx0XHRvdXRbNF0gPSBhMDAgKiBhMjIgLSBhMDIgKiBhMjBcclxuXHRcdG91dFs1XSA9IGEwMiAqIGExMCAtIGEwMCAqIGExMlxyXG5cdFx0b3V0WzZdID0gYTEwICogYTIxIC0gYTExICogYTIwXHJcblx0XHRvdXRbN10gPSBhMDEgKiBhMjAgLSBhMDAgKiBhMjFcclxuXHRcdG91dFs4XSA9IGEwMCAqIGExMSAtIGEwMSAqIGExMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGV0ZXJtaW5hbnQkMihhKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXVxyXG5cdFx0dmFyIGExMCA9IGFbM10sXHJcblx0XHRcdGExMSA9IGFbNF0sXHJcblx0XHRcdGExMiA9IGFbNV1cclxuXHRcdHZhciBhMjAgPSBhWzZdLFxyXG5cdFx0XHRhMjEgPSBhWzddLFxyXG5cdFx0XHRhMjIgPSBhWzhdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRhMDAgKiAoYTIyICogYTExIC0gYTEyICogYTIxKSArIGEwMSAqICgtYTIyICogYTEwICsgYTEyICogYTIwKSArIGEwMiAqIChhMjEgKiBhMTAgLSBhMTEgKiBhMjApXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIG1hdDMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQyKG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMTAgPSBhWzNdLFxyXG5cdFx0XHRhMTEgPSBhWzRdLFxyXG5cdFx0XHRhMTIgPSBhWzVdXHJcblx0XHR2YXIgYTIwID0gYVs2XSxcclxuXHRcdFx0YTIxID0gYVs3XSxcclxuXHRcdFx0YTIyID0gYVs4XVxyXG5cdFx0dmFyIGIwMCA9IGJbMF0sXHJcblx0XHRcdGIwMSA9IGJbMV0sXHJcblx0XHRcdGIwMiA9IGJbMl1cclxuXHRcdHZhciBiMTAgPSBiWzNdLFxyXG5cdFx0XHRiMTEgPSBiWzRdLFxyXG5cdFx0XHRiMTIgPSBiWzVdXHJcblx0XHR2YXIgYjIwID0gYls2XSxcclxuXHRcdFx0YjIxID0gYls3XSxcclxuXHRcdFx0YjIyID0gYls4XVxyXG5cdFx0b3V0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwXHJcblx0XHRvdXRbMV0gPSBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjFcclxuXHRcdG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMlxyXG5cdFx0b3V0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwXHJcblx0XHRvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjFcclxuXHRcdG91dFs1XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMlxyXG5cdFx0b3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwXHJcblx0XHRvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjFcclxuXHRcdG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zbGF0ZSQxKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGExMCA9IGFbM10sXHJcblx0XHRcdGExMSA9IGFbNF0sXHJcblx0XHRcdGExMiA9IGFbNV0sXHJcblx0XHRcdGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF0sXHJcblx0XHRcdHggPSB2WzBdLFxyXG5cdFx0XHR5ID0gdlsxXVxyXG5cdFx0b3V0WzBdID0gYTAwXHJcblx0XHRvdXRbMV0gPSBhMDFcclxuXHRcdG91dFsyXSA9IGEwMlxyXG5cdFx0b3V0WzNdID0gYTEwXHJcblx0XHRvdXRbNF0gPSBhMTFcclxuXHRcdG91dFs1XSA9IGExMlxyXG5cdFx0b3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjBcclxuXHRcdG91dFs3XSA9IHggKiBhMDEgKyB5ICogYTExICsgYTIxXHJcblx0XHRvdXRbOF0gPSB4ICogYTAyICsgeSAqIGExMiArIGEyMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0MyBieSB0aGUgZ2l2ZW4gYW5nbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZSQyKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0YTEwID0gYVszXSxcclxuXHRcdFx0YTExID0gYVs0XSxcclxuXHRcdFx0YTEyID0gYVs1XSxcclxuXHRcdFx0YTIwID0gYVs2XSxcclxuXHRcdFx0YTIxID0gYVs3XSxcclxuXHRcdFx0YTIyID0gYVs4XSxcclxuXHRcdFx0cyA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMFxyXG5cdFx0b3V0WzFdID0gYyAqIGEwMSArIHMgKiBhMTFcclxuXHRcdG91dFsyXSA9IGMgKiBhMDIgKyBzICogYTEyXHJcblx0XHRvdXRbM10gPSBjICogYTEwIC0gcyAqIGEwMFxyXG5cdFx0b3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDFcclxuXHRcdG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyXHJcblx0XHRvdXRbNl0gPSBhMjBcclxuXHRcdG91dFs3XSA9IGEyMVxyXG5cdFx0b3V0WzhdID0gYTIyXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDIob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgeCA9IHZbMF0sXHJcblx0XHRcdHkgPSB2WzFdXHJcblx0XHRvdXRbMF0gPSB4ICogYVswXVxyXG5cdFx0b3V0WzFdID0geCAqIGFbMV1cclxuXHRcdG91dFsyXSA9IHggKiBhWzJdXHJcblx0XHRvdXRbM10gPSB5ICogYVszXVxyXG5cdFx0b3V0WzRdID0geSAqIGFbNF1cclxuXHRcdG91dFs1XSA9IHkgKiBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDMudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uJDEob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAxXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSB2WzBdXHJcblx0XHRvdXRbN10gPSB2WzFdXHJcblx0XHRvdXRbOF0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0My5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uJDIob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKSxcclxuXHRcdFx0YyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGNcclxuXHRcdG91dFsxXSA9IHNcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IC1zXHJcblx0XHRvdXRbNF0gPSBjXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0My5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVNjYWxpbmckMihvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IHZbMF1cclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IHZbMV1cclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29waWVzIHRoZSB2YWx1ZXMgZnJvbSBhIG1hdDJkIGludG8gYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjb3B5XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbU1hdDJkKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gYVsyXVxyXG5cdFx0b3V0WzRdID0gYVszXVxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gYVs0XVxyXG5cdFx0b3V0WzddID0gYVs1XVxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB5eCA9IHkgKiB4MlxyXG5cdFx0dmFyIHl5ID0geSAqIHkyXHJcblx0XHR2YXIgenggPSB6ICogeDJcclxuXHRcdHZhciB6eSA9IHogKiB5MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHRvdXRbMF0gPSAxIC0geXkgLSB6elxyXG5cdFx0b3V0WzNdID0geXggLSB3elxyXG5cdFx0b3V0WzZdID0genggKyB3eVxyXG5cdFx0b3V0WzFdID0geXggKyB3elxyXG5cdFx0b3V0WzRdID0gMSAtIHh4IC0genpcclxuXHRcdG91dFs3XSA9IHp5IC0gd3hcclxuXHRcdG91dFsyXSA9IHp4IC0gd3lcclxuXHRcdG91dFs1XSA9IHp5ICsgd3hcclxuXHRcdG91dFs4XSA9IDEgLSB4eCAtIHl5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBub3JtYWxGcm9tTWF0NChvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XSxcclxuXHRcdFx0YTExID0gYVs1XSxcclxuXHRcdFx0YTEyID0gYVs2XSxcclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF0sXHJcblx0XHRcdGEyMSA9IGFbOV0sXHJcblx0XHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0dmFyIGEzMCA9IGFbMTJdLFxyXG5cdFx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdFx0YTMyID0gYVsxNF0sXHJcblx0XHRcdGEzMyA9IGFbMTVdXHJcblx0XHR2YXIgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwXHJcblx0XHR2YXIgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwXHJcblx0XHR2YXIgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwXHJcblx0XHR2YXIgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExXHJcblx0XHR2YXIgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExXHJcblx0XHR2YXIgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyXHJcblx0XHR2YXIgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwXHJcblx0XHR2YXIgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwXHJcblx0XHR2YXIgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwXHJcblx0XHR2YXIgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxXHJcblx0XHR2YXIgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxXHJcblx0XHR2YXIgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuXHJcblx0XHR2YXIgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2XHJcblxyXG5cdFx0aWYgKCFkZXQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRkZXQgPSAxLjAgLyBkZXRcclxuXHRcdG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0XHJcblx0XHRvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldFxyXG5cdFx0b3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXRcclxuXHRcdG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0XHJcblx0XHRvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldFxyXG5cdFx0b3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXRcclxuXHRcdG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0XHJcblx0XHRvdXRbN10gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldFxyXG5cdFx0b3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgMkQgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIG9mIHlvdXIgZ2wgY29udGV4dFxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHByb2plY3Rpb24ob3V0LCB3aWR0aCwgaGVpZ2h0KSB7XHJcblx0XHRvdXRbMF0gPSAyIC8gd2lkdGhcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IC0yIC8gaGVpZ2h0XHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSAtMVxyXG5cdFx0b3V0WzddID0gMVxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkMihhKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQnbWF0MygnICtcclxuXHRcdFx0YVswXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzFdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbMl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVszXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzRdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs2XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzddICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbOF0gK1xyXG5cdFx0XHQnKSdcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb2IkMihhKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KFxyXG5cdFx0XHRNYXRoLnBvdyhhWzBdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzNdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs0XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzZdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs3XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbOF0sIDIpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkMihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV1cclxuXHRcdG91dFs2XSA9IGFbNl0gKyBiWzZdXHJcblx0XHRvdXRbN10gPSBhWzddICsgYls3XVxyXG5cdFx0b3V0WzhdID0gYVs4XSArIGJbOF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkMihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLSBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdIC0gYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSAtIGJbNV1cclxuXHRcdG91dFs2XSA9IGFbNl0gLSBiWzZdXHJcblx0XHRvdXRbN10gPSBhWzddIC0gYls3XVxyXG5cdFx0b3V0WzhdID0gYVs4XSAtIGJbOF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIkMihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRvdXRbNF0gPSBhWzRdICogYlxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIGJcclxuXHRcdG91dFs2XSA9IGFbNl0gKiBiXHJcblx0XHRvdXRbN10gPSBhWzddICogYlxyXG5cdFx0b3V0WzhdID0gYVs4XSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0MydzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQkMihvdXQsIGEsIGIsIHNjYWxlKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXSAqIHNjYWxlXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XSAqIHNjYWxlXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XSAqIHNjYWxlXHJcblx0XHRvdXRbNl0gPSBhWzZdICsgYls2XSAqIHNjYWxlXHJcblx0XHRvdXRbN10gPSBhWzddICsgYls3XSAqIHNjYWxlXHJcblx0XHRvdXRbOF0gPSBhWzhdICsgYls4XSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGV4YWN0RXF1YWxzJDIoYSwgYikge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0YVswXSA9PT0gYlswXSAmJlxyXG5cdFx0XHRhWzFdID09PSBiWzFdICYmXHJcblx0XHRcdGFbMl0gPT09IGJbMl0gJiZcclxuXHRcdFx0YVszXSA9PT0gYlszXSAmJlxyXG5cdFx0XHRhWzRdID09PSBiWzRdICYmXHJcblx0XHRcdGFbNV0gPT09IGJbNV0gJiZcclxuXHRcdFx0YVs2XSA9PT0gYls2XSAmJlxyXG5cdFx0XHRhWzddID09PSBiWzddICYmXHJcblx0XHRcdGFbOF0gPT09IGJbOF1cclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDMoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV0sXHJcblx0XHRcdGE2ID0gYVs2XSxcclxuXHRcdFx0YTcgPSBhWzddLFxyXG5cdFx0XHRhOCA9IGFbOF1cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM10sXHJcblx0XHRcdGI0ID0gYls0XSxcclxuXHRcdFx0YjUgPSBiWzVdLFxyXG5cdFx0XHRiNiA9IGJbNl0sXHJcblx0XHRcdGI3ID0gYls3XSxcclxuXHRcdFx0YjggPSBiWzhdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMyAtIGIzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTQgLSBiNCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE1IC0gYjUpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNiAtIGI2KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTcgLSBiNykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE4IC0gYjgpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE4KSwgTWF0aC5hYnMoYjgpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkMiA9IG11bHRpcGx5JDJcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMuc3VidHJhY3R9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzdWIkMiA9IHN1YnRyYWN0JDJcclxuXHJcblx0dmFyIG1hdDMgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkMixcclxuXHRcdGZyb21NYXQ0OiBmcm9tTWF0NCxcclxuXHRcdGNsb25lOiBjbG9uZSQyLFxyXG5cdFx0Y29weTogY29weSQyLFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQyLFxyXG5cdFx0c2V0OiBzZXQkMixcclxuXHRcdGlkZW50aXR5OiBpZGVudGl0eSQyLFxyXG5cdFx0dHJhbnNwb3NlOiB0cmFuc3Bvc2UkMSxcclxuXHRcdGludmVydDogaW52ZXJ0JDIsXHJcblx0XHRhZGpvaW50OiBhZGpvaW50JDEsXHJcblx0XHRkZXRlcm1pbmFudDogZGV0ZXJtaW5hbnQkMixcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQyLFxyXG5cdFx0dHJhbnNsYXRlOiB0cmFuc2xhdGUkMSxcclxuXHRcdHJvdGF0ZTogcm90YXRlJDIsXHJcblx0XHRzY2FsZTogc2NhbGUkMixcclxuXHRcdGZyb21UcmFuc2xhdGlvbjogZnJvbVRyYW5zbGF0aW9uJDEsXHJcblx0XHRmcm9tUm90YXRpb246IGZyb21Sb3RhdGlvbiQyLFxyXG5cdFx0ZnJvbVNjYWxpbmc6IGZyb21TY2FsaW5nJDIsXHJcblx0XHRmcm9tTWF0MmQ6IGZyb21NYXQyZCxcclxuXHRcdGZyb21RdWF0OiBmcm9tUXVhdCxcclxuXHRcdG5vcm1hbEZyb21NYXQ0OiBub3JtYWxGcm9tTWF0NCxcclxuXHRcdHByb2plY3Rpb246IHByb2plY3Rpb24sXHJcblx0XHRzdHI6IHN0ciQyLFxyXG5cdFx0ZnJvYjogZnJvYiQyLFxyXG5cdFx0YWRkOiBhZGQkMixcclxuXHRcdHN1YnRyYWN0OiBzdWJ0cmFjdCQyLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXI6IG11bHRpcGx5U2NhbGFyJDIsXHJcblx0XHRtdWx0aXBseVNjYWxhckFuZEFkZDogbXVsdGlwbHlTY2FsYXJBbmRBZGQkMixcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQyLFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkMyxcclxuXHRcdG11bDogbXVsJDIsXHJcblx0XHRzdWI6IHN1YiQyLFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIDR4NCBNYXRyaXg8YnI+Rm9ybWF0OiBjb2x1bW4tbWFqb3IsIHdoZW4gdHlwZWQgb3V0IGl0IGxvb2tzIGxpa2Ugcm93LW1ham9yPGJyPlRoZSBtYXRyaWNlcyBhcmUgYmVpbmcgcG9zdCBtdWx0aXBsaWVkLlxyXG5cdCAqIEBtb2R1bGUgbWF0NFxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDRcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQzKCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDE2KVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMV0gPSAwXHJcblx0XHRcdG91dFsyXSA9IDBcclxuXHRcdFx0b3V0WzNdID0gMFxyXG5cdFx0XHRvdXRbNF0gPSAwXHJcblx0XHRcdG91dFs2XSA9IDBcclxuXHRcdFx0b3V0WzddID0gMFxyXG5cdFx0XHRvdXRbOF0gPSAwXHJcblx0XHRcdG91dFs5XSA9IDBcclxuXHRcdFx0b3V0WzExXSA9IDBcclxuXHRcdFx0b3V0WzEyXSA9IDBcclxuXHRcdFx0b3V0WzEzXSA9IDBcclxuXHRcdFx0b3V0WzE0XSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbNV0gPSAxXHJcblx0XHRvdXRbMTBdID0gMVxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkMyhhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMTYpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdXHJcblx0XHRvdXRbOV0gPSBhWzldXHJcblx0XHRvdXRbMTBdID0gYVsxMF1cclxuXHRcdG91dFsxMV0gPSBhWzExXVxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdG91dFsxNF0gPSBhWzE0XVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQ0IHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDMob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdXHJcblx0XHRvdXRbOV0gPSBhWzldXHJcblx0XHRvdXRbMTBdID0gYVsxMF1cclxuXHRcdG91dFsxMV0gPSBhWzExXVxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdG91dFsxNF0gPSBhWzE0XVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIG5ldyBtYXQ0IHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMyBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA2KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTMgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggNylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA5KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMwIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDAgcG9zaXRpb24gKGluZGV4IDEyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzEgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMTMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMzIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDMgcG9zaXRpb24gKGluZGV4IDE1KVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBBIG5ldyBtYXQ0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkMyhcclxuXHRcdG0wMCxcclxuXHRcdG0wMSxcclxuXHRcdG0wMixcclxuXHRcdG0wMyxcclxuXHRcdG0xMCxcclxuXHRcdG0xMSxcclxuXHRcdG0xMixcclxuXHRcdG0xMyxcclxuXHRcdG0yMCxcclxuXHRcdG0yMSxcclxuXHRcdG0yMixcclxuXHRcdG0yMyxcclxuXHRcdG0zMCxcclxuXHRcdG0zMSxcclxuXHRcdG0zMixcclxuXHRcdG0zM1xyXG5cdCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDE2KVxyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0wMlxyXG5cdFx0b3V0WzNdID0gbTAzXHJcblx0XHRvdXRbNF0gPSBtMTBcclxuXHRcdG91dFs1XSA9IG0xMVxyXG5cdFx0b3V0WzZdID0gbTEyXHJcblx0XHRvdXRbN10gPSBtMTNcclxuXHRcdG91dFs4XSA9IG0yMFxyXG5cdFx0b3V0WzldID0gbTIxXHJcblx0XHRvdXRbMTBdID0gbTIyXHJcblx0XHRvdXRbMTFdID0gbTIzXHJcblx0XHRvdXRbMTJdID0gbTMwXHJcblx0XHRvdXRbMTNdID0gbTMxXHJcblx0XHRvdXRbMTRdID0gbTMyXHJcblx0XHRvdXRbMTVdID0gbTMzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMyBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAzIHBvc2l0aW9uIChpbmRleCA3KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggOClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIzIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDMgcG9zaXRpb24gKGluZGV4IDExKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMSBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxMylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMyIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDIgcG9zaXRpb24gKGluZGV4IDE0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkMyhcclxuXHRcdG91dCxcclxuXHRcdG0wMCxcclxuXHRcdG0wMSxcclxuXHRcdG0wMixcclxuXHRcdG0wMyxcclxuXHRcdG0xMCxcclxuXHRcdG0xMSxcclxuXHRcdG0xMixcclxuXHRcdG0xMyxcclxuXHRcdG0yMCxcclxuXHRcdG0yMSxcclxuXHRcdG0yMixcclxuXHRcdG0yMyxcclxuXHRcdG0zMCxcclxuXHRcdG0zMSxcclxuXHRcdG0zMixcclxuXHRcdG0zM1xyXG5cdCkge1xyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0wMlxyXG5cdFx0b3V0WzNdID0gbTAzXHJcblx0XHRvdXRbNF0gPSBtMTBcclxuXHRcdG91dFs1XSA9IG0xMVxyXG5cdFx0b3V0WzZdID0gbTEyXHJcblx0XHRvdXRbN10gPSBtMTNcclxuXHRcdG91dFs4XSA9IG0yMFxyXG5cdFx0b3V0WzldID0gbTIxXHJcblx0XHRvdXRbMTBdID0gbTIyXHJcblx0XHRvdXRbMTFdID0gbTIzXHJcblx0XHRvdXRbMTJdID0gbTMwXHJcblx0XHRvdXRbMTNdID0gbTMxXHJcblx0XHRvdXRbMTRdID0gbTMyXHJcblx0XHRvdXRbMTVdID0gbTMzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCBhIG1hdDQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGlkZW50aXR5JDMob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAxXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAwXHJcblx0XHRvdXRbMTBdID0gMVxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSAwXHJcblx0XHRvdXRbMTNdID0gMFxyXG5cdFx0b3V0WzE0XSA9IDBcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zcG9zZSQyKG91dCwgYSkge1xyXG5cdFx0Ly8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xyXG5cdFx0aWYgKG91dCA9PT0gYSkge1xyXG5cdFx0XHR2YXIgYTAxID0gYVsxXSxcclxuXHRcdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRcdGEwMyA9IGFbM11cclxuXHRcdFx0dmFyIGExMiA9IGFbNl0sXHJcblx0XHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0XHR2YXIgYTIzID0gYVsxMV1cclxuXHRcdFx0b3V0WzFdID0gYVs0XVxyXG5cdFx0XHRvdXRbMl0gPSBhWzhdXHJcblx0XHRcdG91dFszXSA9IGFbMTJdXHJcblx0XHRcdG91dFs0XSA9IGEwMVxyXG5cdFx0XHRvdXRbNl0gPSBhWzldXHJcblx0XHRcdG91dFs3XSA9IGFbMTNdXHJcblx0XHRcdG91dFs4XSA9IGEwMlxyXG5cdFx0XHRvdXRbOV0gPSBhMTJcclxuXHRcdFx0b3V0WzExXSA9IGFbMTRdXHJcblx0XHRcdG91dFsxMl0gPSBhMDNcclxuXHRcdFx0b3V0WzEzXSA9IGExM1xyXG5cdFx0XHRvdXRbMTRdID0gYTIzXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRcdG91dFsxXSA9IGFbNF1cclxuXHRcdFx0b3V0WzJdID0gYVs4XVxyXG5cdFx0XHRvdXRbM10gPSBhWzEyXVxyXG5cdFx0XHRvdXRbNF0gPSBhWzFdXHJcblx0XHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdFx0b3V0WzZdID0gYVs5XVxyXG5cdFx0XHRvdXRbN10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbOF0gPSBhWzJdXHJcblx0XHRcdG91dFs5XSA9IGFbNl1cclxuXHRcdFx0b3V0WzEwXSA9IGFbMTBdXHJcblx0XHRcdG91dFsxMV0gPSBhWzE0XVxyXG5cdFx0XHRvdXRbMTJdID0gYVszXVxyXG5cdFx0XHRvdXRbMTNdID0gYVs3XVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxMV1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBJbnZlcnRzIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVydCQzKG91dCwgYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdHZhciBhMTAgPSBhWzRdLFxyXG5cdFx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0XHRhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XSxcclxuXHRcdFx0YTIxID0gYVs5XSxcclxuXHRcdFx0YTIyID0gYVsxMF0sXHJcblx0XHRcdGEyMyA9IGFbMTFdXHJcblx0XHR2YXIgYTMwID0gYVsxMl0sXHJcblx0XHRcdGEzMSA9IGFbMTNdLFxyXG5cdFx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdFx0YTMzID0gYVsxNV1cclxuXHRcdHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTBcclxuXHRcdHZhciBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTBcclxuXHRcdHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTBcclxuXHRcdHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTFcclxuXHRcdHZhciBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTFcclxuXHRcdHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTJcclxuXHRcdHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzBcclxuXHRcdHZhciBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzBcclxuXHRcdHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzBcclxuXHRcdHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzFcclxuXHRcdHZhciBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzFcclxuXHRcdHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG5cclxuXHRcdHZhciBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDZcclxuXHJcblx0XHRpZiAoIWRldCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGRldCA9IDEuMCAvIGRldFxyXG5cdFx0b3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXRcclxuXHRcdG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0XHJcblx0XHRvdXRbMl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldFxyXG5cdFx0b3V0WzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXRcclxuXHRcdG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0XHJcblx0XHRvdXRbNV0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldFxyXG5cdFx0b3V0WzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXRcclxuXHRcdG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0XHJcblx0XHRvdXRbOF0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldFxyXG5cdFx0b3V0WzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXRcclxuXHRcdG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldFxyXG5cdFx0b3V0WzExXSA9IChhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDApICogZGV0XHJcblx0XHRvdXRbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXRcclxuXHRcdG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldFxyXG5cdFx0b3V0WzE0XSA9IChhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDApICogZGV0XHJcblx0XHRvdXRbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRqb2ludCQyKG91dCwgYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdHZhciBhMTAgPSBhWzRdLFxyXG5cdFx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0XHRhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XSxcclxuXHRcdFx0YTIxID0gYVs5XSxcclxuXHRcdFx0YTIyID0gYVsxMF0sXHJcblx0XHRcdGEyMyA9IGFbMTFdXHJcblx0XHR2YXIgYTMwID0gYVsxMl0sXHJcblx0XHRcdGEzMSA9IGFbMTNdLFxyXG5cdFx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdFx0YTMzID0gYVsxNV1cclxuXHRcdG91dFswXSA9XHJcblx0XHRcdGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKVxyXG5cdFx0b3V0WzFdID0gLShcclxuXHRcdFx0YTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLVxyXG5cdFx0XHRhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArXHJcblx0XHRcdGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpXHJcblx0XHQpXHJcblx0XHRvdXRbMl0gPVxyXG5cdFx0XHRhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMilcclxuXHRcdG91dFszXSA9IC0oXHJcblx0XHRcdGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC1cclxuXHRcdFx0YTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgK1xyXG5cdFx0XHRhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzRdID0gLShcclxuXHRcdFx0YTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLVxyXG5cdFx0XHRhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArXHJcblx0XHRcdGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpXHJcblx0XHQpXHJcblx0XHRvdXRbNV0gPVxyXG5cdFx0XHRhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMilcclxuXHRcdG91dFs2XSA9IC0oXHJcblx0XHRcdGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC1cclxuXHRcdFx0YTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgK1xyXG5cdFx0XHRhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzddID1cclxuXHRcdFx0YTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpXHJcblx0XHRvdXRbOF0gPVxyXG5cdFx0XHRhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSlcclxuXHRcdG91dFs5XSA9IC0oXHJcblx0XHRcdGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC1cclxuXHRcdFx0YTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgK1xyXG5cdFx0XHRhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzEwXSA9XHJcblx0XHRcdGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKVxyXG5cdFx0b3V0WzExXSA9IC0oXHJcblx0XHRcdGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpIC1cclxuXHRcdFx0YTEwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkgK1xyXG5cdFx0XHRhMjAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzEyXSA9IC0oXHJcblx0XHRcdGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC1cclxuXHRcdFx0YTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgK1xyXG5cdFx0XHRhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzEzXSA9XHJcblx0XHRcdGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKVxyXG5cdFx0b3V0WzE0XSA9IC0oXHJcblx0XHRcdGEwMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpIC1cclxuXHRcdFx0YTEwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgK1xyXG5cdFx0XHRhMzAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzE1XSA9XHJcblx0XHRcdGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGV0ZXJtaW5hbnQkMyhhKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0YTAzID0gYVszXVxyXG5cdFx0dmFyIGExMCA9IGFbNF0sXHJcblx0XHRcdGExMSA9IGFbNV0sXHJcblx0XHRcdGExMiA9IGFbNl0sXHJcblx0XHRcdGExMyA9IGFbN11cclxuXHRcdHZhciBhMjAgPSBhWzhdLFxyXG5cdFx0XHRhMjEgPSBhWzldLFxyXG5cdFx0XHRhMjIgPSBhWzEwXSxcclxuXHRcdFx0YTIzID0gYVsxMV1cclxuXHRcdHZhciBhMzAgPSBhWzEyXSxcclxuXHRcdFx0YTMxID0gYVsxM10sXHJcblx0XHRcdGEzMiA9IGFbMTRdLFxyXG5cdFx0XHRhMzMgPSBhWzE1XVxyXG5cdFx0dmFyIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMFxyXG5cdFx0dmFyIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMFxyXG5cdFx0dmFyIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMFxyXG5cdFx0dmFyIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMVxyXG5cdFx0dmFyIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMVxyXG5cdFx0dmFyIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMlxyXG5cdFx0dmFyIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMFxyXG5cdFx0dmFyIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMFxyXG5cdFx0dmFyIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMFxyXG5cdFx0dmFyIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMVxyXG5cdFx0dmFyIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMVxyXG5cdFx0dmFyIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMiAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblxyXG5cdFx0cmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNlxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBtYXQ0c1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQzKG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdHZhciBhMTAgPSBhWzRdLFxyXG5cdFx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0XHRhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XSxcclxuXHRcdFx0YTIxID0gYVs5XSxcclxuXHRcdFx0YTIyID0gYVsxMF0sXHJcblx0XHRcdGEyMyA9IGFbMTFdXHJcblx0XHR2YXIgYTMwID0gYVsxMl0sXHJcblx0XHRcdGEzMSA9IGFbMTNdLFxyXG5cdFx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdFx0YTMzID0gYVsxNV0gLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XHJcblxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0b3V0WzBdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzBcclxuXHRcdG91dFsxXSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxXHJcblx0XHRvdXRbMl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMlxyXG5cdFx0b3V0WzNdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzNcclxuXHRcdGIwID0gYls0XVxyXG5cdFx0YjEgPSBiWzVdXHJcblx0XHRiMiA9IGJbNl1cclxuXHRcdGIzID0gYls3XVxyXG5cdFx0b3V0WzRdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzBcclxuXHRcdG91dFs1XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxXHJcblx0XHRvdXRbNl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMlxyXG5cdFx0b3V0WzddID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzNcclxuXHRcdGIwID0gYls4XVxyXG5cdFx0YjEgPSBiWzldXHJcblx0XHRiMiA9IGJbMTBdXHJcblx0XHRiMyA9IGJbMTFdXHJcblx0XHRvdXRbOF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMFxyXG5cdFx0b3V0WzldID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzFcclxuXHRcdG91dFsxMF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMlxyXG5cdFx0b3V0WzExXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzXHJcblx0XHRiMCA9IGJbMTJdXHJcblx0XHRiMSA9IGJbMTNdXHJcblx0XHRiMiA9IGJbMTRdXHJcblx0XHRiMyA9IGJbMTVdXHJcblx0XHRvdXRbMTJdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzBcclxuXHRcdG91dFsxM10gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMVxyXG5cdFx0b3V0WzE0XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyXHJcblx0XHRvdXRbMTVdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNsYXRlIGEgbWF0NCBieSB0aGUgZ2l2ZW4gdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2xhdGUkMihvdXQsIGEsIHYpIHtcclxuXHRcdHZhciB4ID0gdlswXSxcclxuXHRcdFx0eSA9IHZbMV0sXHJcblx0XHRcdHogPSB2WzJdXHJcblx0XHR2YXIgYTAwLCBhMDEsIGEwMiwgYTAzXHJcblx0XHR2YXIgYTEwLCBhMTEsIGExMiwgYTEzXHJcblx0XHR2YXIgYTIwLCBhMjEsIGEyMiwgYTIzXHJcblxyXG5cdFx0aWYgKGEgPT09IG91dCkge1xyXG5cdFx0XHRvdXRbMTJdID0gYVswXSAqIHggKyBhWzRdICogeSArIGFbOF0gKiB6ICsgYVsxMl1cclxuXHRcdFx0b3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdXHJcblx0XHRcdG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbM10gKiB4ICsgYVs3XSAqIHkgKyBhWzExXSAqIHogKyBhWzE1XVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YTAwID0gYVswXVxyXG5cdFx0XHRhMDEgPSBhWzFdXHJcblx0XHRcdGEwMiA9IGFbMl1cclxuXHRcdFx0YTAzID0gYVszXVxyXG5cdFx0XHRhMTAgPSBhWzRdXHJcblx0XHRcdGExMSA9IGFbNV1cclxuXHRcdFx0YTEyID0gYVs2XVxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHRcdGEyMCA9IGFbOF1cclxuXHRcdFx0YTIxID0gYVs5XVxyXG5cdFx0XHRhMjIgPSBhWzEwXVxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0XHRvdXRbMF0gPSBhMDBcclxuXHRcdFx0b3V0WzFdID0gYTAxXHJcblx0XHRcdG91dFsyXSA9IGEwMlxyXG5cdFx0XHRvdXRbM10gPSBhMDNcclxuXHRcdFx0b3V0WzRdID0gYTEwXHJcblx0XHRcdG91dFs1XSA9IGExMVxyXG5cdFx0XHRvdXRbNl0gPSBhMTJcclxuXHRcdFx0b3V0WzddID0gYTEzXHJcblx0XHRcdG91dFs4XSA9IGEyMFxyXG5cdFx0XHRvdXRbOV0gPSBhMjFcclxuXHRcdFx0b3V0WzEwXSA9IGEyMlxyXG5cdFx0XHRvdXRbMTFdID0gYTIzXHJcblx0XHRcdG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzIG5vdCB1c2luZyB2ZWN0b3JpemF0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IHRoZSB2ZWMzIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQzKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIHggPSB2WzBdLFxyXG5cdFx0XHR5ID0gdlsxXSxcclxuXHRcdFx0eiA9IHZbMl1cclxuXHRcdG91dFswXSA9IGFbMF0gKiB4XHJcblx0XHRvdXRbMV0gPSBhWzFdICogeFxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIHhcclxuXHRcdG91dFszXSA9IGFbM10gKiB4XHJcblx0XHRvdXRbNF0gPSBhWzRdICogeVxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIHlcclxuXHRcdG91dFs2XSA9IGFbNl0gKiB5XHJcblx0XHRvdXRbN10gPSBhWzddICogeVxyXG5cdFx0b3V0WzhdID0gYVs4XSAqIHpcclxuXHRcdG91dFs5XSA9IGFbOV0gKiB6XHJcblx0XHRvdXRbMTBdID0gYVsxMF0gKiB6XHJcblx0XHRvdXRbMTFdID0gYVsxMV0gKiB6XHJcblx0XHRvdXRbMTJdID0gYVsxMl1cclxuXHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRvdXRbMTVdID0gYVsxNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGUkMyhvdXQsIGEsIHJhZCwgYXhpcykge1xyXG5cdFx0dmFyIHggPSBheGlzWzBdLFxyXG5cdFx0XHR5ID0gYXhpc1sxXSxcclxuXHRcdFx0eiA9IGF4aXNbMl1cclxuXHRcdHZhciBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KVxyXG5cdFx0dmFyIHMsIGMsIHRcclxuXHRcdHZhciBhMDAsIGEwMSwgYTAyLCBhMDNcclxuXHRcdHZhciBhMTAsIGExMSwgYTEyLCBhMTNcclxuXHRcdHZhciBhMjAsIGEyMSwgYTIyLCBhMjNcclxuXHRcdHZhciBiMDAsIGIwMSwgYjAyXHJcblx0XHR2YXIgYjEwLCBiMTEsIGIxMlxyXG5cdFx0dmFyIGIyMCwgYjIxLCBiMjJcclxuXHJcblx0XHRpZiAobGVuIDwgRVBTSUxPTikge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGxlbiA9IDEgLyBsZW5cclxuXHRcdHggKj0gbGVuXHJcblx0XHR5ICo9IGxlblxyXG5cdFx0eiAqPSBsZW5cclxuXHRcdHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHRjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0dCA9IDEgLSBjXHJcblx0XHRhMDAgPSBhWzBdXHJcblx0XHRhMDEgPSBhWzFdXHJcblx0XHRhMDIgPSBhWzJdXHJcblx0XHRhMDMgPSBhWzNdXHJcblx0XHRhMTAgPSBhWzRdXHJcblx0XHRhMTEgPSBhWzVdXHJcblx0XHRhMTIgPSBhWzZdXHJcblx0XHRhMTMgPSBhWzddXHJcblx0XHRhMjAgPSBhWzhdXHJcblx0XHRhMjEgPSBhWzldXHJcblx0XHRhMjIgPSBhWzEwXVxyXG5cdFx0YTIzID0gYVsxMV0gLy8gQ29uc3RydWN0IHRoZSBlbGVtZW50cyBvZiB0aGUgcm90YXRpb24gbWF0cml4XHJcblxyXG5cdFx0YjAwID0geCAqIHggKiB0ICsgY1xyXG5cdFx0YjAxID0geSAqIHggKiB0ICsgeiAqIHNcclxuXHRcdGIwMiA9IHogKiB4ICogdCAtIHkgKiBzXHJcblx0XHRiMTAgPSB4ICogeSAqIHQgLSB6ICogc1xyXG5cdFx0YjExID0geSAqIHkgKiB0ICsgY1xyXG5cdFx0YjEyID0geiAqIHkgKiB0ICsgeCAqIHNcclxuXHRcdGIyMCA9IHggKiB6ICogdCArIHkgKiBzXHJcblx0XHRiMjEgPSB5ICogeiAqIHQgLSB4ICogc1xyXG5cdFx0YjIyID0geiAqIHogKiB0ICsgYyAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG5cclxuXHRcdG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMlxyXG5cdFx0b3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyXHJcblx0XHRvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDJcclxuXHRcdG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMlxyXG5cdFx0b3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyXHJcblx0XHRvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTJcclxuXHRcdG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMlxyXG5cdFx0b3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyXHJcblx0XHRvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjJcclxuXHRcdG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMlxyXG5cdFx0b3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMlxyXG5cdFx0b3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMlxyXG5cclxuXHRcdGlmIChhICE9PSBvdXQpIHtcclxuXHRcdFx0Ly8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcclxuXHRcdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdHZhciBhMTAgPSBhWzRdXHJcblx0XHR2YXIgYTExID0gYVs1XVxyXG5cdFx0dmFyIGExMiA9IGFbNl1cclxuXHRcdHZhciBhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XVxyXG5cdFx0dmFyIGEyMSA9IGFbOV1cclxuXHRcdHZhciBhMjIgPSBhWzEwXVxyXG5cdFx0dmFyIGEyMyA9IGFbMTFdXHJcblxyXG5cdFx0aWYgKGEgIT09IG91dCkge1xyXG5cdFx0XHQvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXHJcblx0XHRcdG91dFswXSA9IGFbMF1cclxuXHRcdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRcdG91dFszXSA9IGFbM11cclxuXHRcdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogc1xyXG5cdFx0b3V0WzVdID0gYTExICogYyArIGEyMSAqIHNcclxuXHRcdG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzXHJcblx0XHRvdXRbN10gPSBhMTMgKiBjICsgYTIzICogc1xyXG5cdFx0b3V0WzhdID0gYTIwICogYyAtIGExMCAqIHNcclxuXHRcdG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzXHJcblx0XHRvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHNcclxuXHRcdG91dFsxMV0gPSBhMjMgKiBjIC0gYTEzICogc1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdHZhciBhMDAgPSBhWzBdXHJcblx0XHR2YXIgYTAxID0gYVsxXVxyXG5cdFx0dmFyIGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTIwID0gYVs4XVxyXG5cdFx0dmFyIGEyMSA9IGFbOV1cclxuXHRcdHZhciBhMjIgPSBhWzEwXVxyXG5cdFx0dmFyIGEyMyA9IGFbMTFdXHJcblxyXG5cdFx0aWYgKGEgIT09IG91dCkge1xyXG5cdFx0XHQvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXHJcblx0XHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRcdG91dFs3XSA9IGFbN11cclxuXHRcdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBhMDAgKiBjIC0gYTIwICogc1xyXG5cdFx0b3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHNcclxuXHRcdG91dFsyXSA9IGEwMiAqIGMgLSBhMjIgKiBzXHJcblx0XHRvdXRbM10gPSBhMDMgKiBjIC0gYTIzICogc1xyXG5cdFx0b3V0WzhdID0gYTAwICogcyArIGEyMCAqIGNcclxuXHRcdG91dFs5XSA9IGEwMSAqIHMgKyBhMjEgKiBjXHJcblx0XHRvdXRbMTBdID0gYTAyICogcyArIGEyMiAqIGNcclxuXHRcdG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogY1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdHZhciBhMDAgPSBhWzBdXHJcblx0XHR2YXIgYTAxID0gYVsxXVxyXG5cdFx0dmFyIGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XVxyXG5cdFx0dmFyIGExMSA9IGFbNV1cclxuXHRcdHZhciBhMTIgPSBhWzZdXHJcblx0XHR2YXIgYTEzID0gYVs3XVxyXG5cclxuXHRcdGlmIChhICE9PSBvdXQpIHtcclxuXHRcdFx0Ly8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcclxuXHRcdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0XHRvdXRbOV0gPSBhWzldXHJcblx0XHRcdG91dFsxMF0gPSBhWzEwXVxyXG5cdFx0XHRvdXRbMTFdID0gYVsxMV1cclxuXHRcdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBhMDAgKiBjICsgYTEwICogc1xyXG5cdFx0b3V0WzFdID0gYTAxICogYyArIGExMSAqIHNcclxuXHRcdG91dFsyXSA9IGEwMiAqIGMgKyBhMTIgKiBzXHJcblx0XHRvdXRbM10gPSBhMDMgKiBjICsgYTEzICogc1xyXG5cdFx0b3V0WzRdID0gYTEwICogYyAtIGEwMCAqIHNcclxuXHRcdG91dFs1XSA9IGExMSAqIGMgLSBhMDEgKiBzXHJcblx0XHRvdXRbNl0gPSBhMTIgKiBjIC0gYTAyICogc1xyXG5cdFx0b3V0WzddID0gYTEzICogYyAtIGEwMyAqIHNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHRyYW5zbGF0aW9uXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24kMihvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDFcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDBcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSAxXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IHZbMF1cclxuXHRcdG91dFsxM10gPSB2WzFdXHJcblx0XHRvdXRbMTRdID0gdlsyXVxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tU2NhbGluZyQzKG91dCwgdikge1xyXG5cdFx0b3V0WzBdID0gdlswXVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gdlsxXVxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzEwXSA9IHZbMl1cclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZSBhcm91bmQgYSBnaXZlbiBheGlzXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkLCBheGlzKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb24kMyhvdXQsIHJhZCwgYXhpcykge1xyXG5cdFx0dmFyIHggPSBheGlzWzBdLFxyXG5cdFx0XHR5ID0gYXhpc1sxXSxcclxuXHRcdFx0eiA9IGF4aXNbMl1cclxuXHRcdHZhciBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KVxyXG5cdFx0dmFyIHMsIGMsIHRcclxuXHJcblx0XHRpZiAobGVuIDwgRVBTSUxPTikge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGxlbiA9IDEgLyBsZW5cclxuXHRcdHggKj0gbGVuXHJcblx0XHR5ICo9IGxlblxyXG5cdFx0eiAqPSBsZW5cclxuXHRcdHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHRjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0dCA9IDEgLSBjIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0geCAqIHggKiB0ICsgY1xyXG5cdFx0b3V0WzFdID0geSAqIHggKiB0ICsgeiAqIHNcclxuXHRcdG91dFsyXSA9IHogKiB4ICogdCAtIHkgKiBzXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSB4ICogeSAqIHQgLSB6ICogc1xyXG5cdFx0b3V0WzVdID0geSAqIHkgKiB0ICsgY1xyXG5cdFx0b3V0WzZdID0geiAqIHkgKiB0ICsgeCAqIHNcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IHggKiB6ICogdCArIHkgKiBzXHJcblx0XHRvdXRbOV0gPSB5ICogeiAqIHQgLSB4ICogc1xyXG5cdFx0b3V0WzEwXSA9IHogKiB6ICogdCArIGNcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5yb3RhdGVYKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21YUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSBjXHJcblx0XHRvdXRbNl0gPSBzXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAtc1xyXG5cdFx0b3V0WzEwXSA9IGNcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5yb3RhdGVZKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21ZUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAtc1xyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMVxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gc1xyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzEwXSA9IGNcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5yb3RhdGVaKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21aUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSBzXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAtc1xyXG5cdFx0b3V0WzVdID0gY1xyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzEwXSA9IDFcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uIGFuZCB2ZWN0b3IgdHJhbnNsYXRpb25cclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xyXG5cdCAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcblx0ICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcclxuXHQgKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIHEsIHYpIHtcclxuXHRcdC8vIFF1YXRlcm5pb24gbWF0aFxyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB4eSA9IHggKiB5MlxyXG5cdFx0dmFyIHh6ID0geCAqIHoyXHJcblx0XHR2YXIgeXkgPSB5ICogeTJcclxuXHRcdHZhciB5eiA9IHkgKiB6MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHRvdXRbMF0gPSAxIC0gKHl5ICsgenopXHJcblx0XHRvdXRbMV0gPSB4eSArIHd6XHJcblx0XHRvdXRbMl0gPSB4eiAtIHd5XHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSB4eSAtIHd6XHJcblx0XHRvdXRbNV0gPSAxIC0gKHh4ICsgenopXHJcblx0XHRvdXRbNl0gPSB5eiArIHd4XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSB4eiArIHd5XHJcblx0XHRvdXRbOV0gPSB5eiAtIHd4XHJcblx0XHRvdXRbMTBdID0gMSAtICh4eCArIHl5KVxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSB2WzBdXHJcblx0XHRvdXRbMTNdID0gdlsxXVxyXG5cdFx0b3V0WzE0XSA9IHZbMl1cclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgbWF0NCBmcm9tIGEgZHVhbCBxdWF0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgTWF0cml4XHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUXVhdDIob3V0LCBhKSB7XHJcblx0XHR2YXIgdHJhbnNsYXRpb24gPSBuZXcgQVJSQVlfVFlQRSgzKVxyXG5cdFx0dmFyIGJ4ID0gLWFbMF0sXHJcblx0XHRcdGJ5ID0gLWFbMV0sXHJcblx0XHRcdGJ6ID0gLWFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXSxcclxuXHRcdFx0YXggPSBhWzRdLFxyXG5cdFx0XHRheSA9IGFbNV0sXHJcblx0XHRcdGF6ID0gYVs2XSxcclxuXHRcdFx0YXcgPSBhWzddXHJcblx0XHR2YXIgbWFnbml0dWRlID0gYnggKiBieCArIGJ5ICogYnkgKyBieiAqIGJ6ICsgYncgKiBidyAvL09ubHkgc2NhbGUgaWYgaXQgbWFrZXMgc2Vuc2VcclxuXHJcblx0XHRpZiAobWFnbml0dWRlID4gMCkge1xyXG5cdFx0XHR0cmFuc2xhdGlvblswXSA9ICgoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyKSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR0cmFuc2xhdGlvblsxXSA9ICgoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyKSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR0cmFuc2xhdGlvblsyXSA9ICgoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyKSAvIG1hZ25pdHVkZVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dHJhbnNsYXRpb25bMF0gPSAoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyXHJcblx0XHRcdHRyYW5zbGF0aW9uWzFdID0gKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMlxyXG5cdFx0XHR0cmFuc2xhdGlvblsyXSA9IChheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4KSAqIDJcclxuXHRcdH1cclxuXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIGEsIHRyYW5zbGF0aW9uKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cclxuXHQgKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLFxyXG5cdCAqICB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxyXG5cdCAqIEBwYXJhbSAge3ZlYzN9IG91dCBWZWN0b3IgdG8gcmVjZWl2ZSB0cmFuc2xhdGlvbiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG5cdCAqIEByZXR1cm4ge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbihvdXQsIG1hdCkge1xyXG5cdFx0b3V0WzBdID0gbWF0WzEyXVxyXG5cdFx0b3V0WzFdID0gbWF0WzEzXVxyXG5cdFx0b3V0WzJdID0gbWF0WzE0XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBzY2FsaW5nIGZhY3RvciBjb21wb25lbnQgb2YgYSB0cmFuc2Zvcm1hdGlvblxyXG5cdCAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZVxyXG5cdCAqICB3aXRoIGEgbm9ybWFsaXplZCBRdWF0ZXJuaW9uIHBhcmFtdGVyLCB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmVcclxuXHQgKiAgdGhlIHNhbWUgYXMgdGhlIHNjYWxpbmcgdmVjdG9yXHJcblx0ICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXHJcblx0ICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSAge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXHJcblx0ICogQHJldHVybiB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGdldFNjYWxpbmcob3V0LCBtYXQpIHtcclxuXHRcdHZhciBtMTEgPSBtYXRbMF1cclxuXHRcdHZhciBtMTIgPSBtYXRbMV1cclxuXHRcdHZhciBtMTMgPSBtYXRbMl1cclxuXHRcdHZhciBtMjEgPSBtYXRbNF1cclxuXHRcdHZhciBtMjIgPSBtYXRbNV1cclxuXHRcdHZhciBtMjMgPSBtYXRbNl1cclxuXHRcdHZhciBtMzEgPSBtYXRbOF1cclxuXHRcdHZhciBtMzIgPSBtYXRbOV1cclxuXHRcdHZhciBtMzMgPSBtYXRbMTBdXHJcblx0XHRvdXRbMF0gPSBNYXRoLnNxcnQobTExICogbTExICsgbTEyICogbTEyICsgbTEzICogbTEzKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5zcXJ0KG0yMSAqIG0yMSArIG0yMiAqIG0yMiArIG0yMyAqIG0yMylcclxuXHRcdG91dFsyXSA9IE1hdGguc3FydChtMzEgKiBtMzEgKyBtMzIgKiBtMzIgKyBtMzMgKiBtMzMpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb25hbCBjb21wb25lbnRcclxuXHQgKiAgb2YgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGhcclxuXHQgKiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sIHRoZSByZXR1cm5lZCBxdWF0ZXJuaW9uIHdpbGwgYmUgdGhlXHJcblx0ICogIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gb3JpZ2luYWxseSBzdXBwbGllZC5cclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCBRdWF0ZXJuaW9uIHRvIHJlY2VpdmUgdGhlIHJvdGF0aW9uIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcclxuXHQgKiBAcmV0dXJuIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0Um90YXRpb24ob3V0LCBtYXQpIHtcclxuXHRcdC8vIEFsZ29yaXRobSB0YWtlbiBmcm9tIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2dlb21ldHJ5L3JvdGF0aW9ucy9jb252ZXJzaW9ucy9tYXRyaXhUb1F1YXRlcm5pb24vaW5kZXguaHRtXHJcblx0XHR2YXIgdHJhY2UgPSBtYXRbMF0gKyBtYXRbNV0gKyBtYXRbMTBdXHJcblx0XHR2YXIgUyA9IDBcclxuXHJcblx0XHRpZiAodHJhY2UgPiAwKSB7XHJcblx0XHRcdFMgPSBNYXRoLnNxcnQodHJhY2UgKyAxLjApICogMlxyXG5cdFx0XHRvdXRbM10gPSAwLjI1ICogU1xyXG5cdFx0XHRvdXRbMF0gPSAobWF0WzZdIC0gbWF0WzldKSAvIFNcclxuXHRcdFx0b3V0WzFdID0gKG1hdFs4XSAtIG1hdFsyXSkgLyBTXHJcblx0XHRcdG91dFsyXSA9IChtYXRbMV0gLSBtYXRbNF0pIC8gU1xyXG5cdFx0fSBlbHNlIGlmIChtYXRbMF0gPiBtYXRbNV0gJiYgbWF0WzBdID4gbWF0WzEwXSkge1xyXG5cdFx0XHRTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFswXSAtIG1hdFs1XSAtIG1hdFsxMF0pICogMlxyXG5cdFx0XHRvdXRbM10gPSAobWF0WzZdIC0gbWF0WzldKSAvIFNcclxuXHRcdFx0b3V0WzBdID0gMC4yNSAqIFNcclxuXHRcdFx0b3V0WzFdID0gKG1hdFsxXSArIG1hdFs0XSkgLyBTXHJcblx0XHRcdG91dFsyXSA9IChtYXRbOF0gKyBtYXRbMl0pIC8gU1xyXG5cdFx0fSBlbHNlIGlmIChtYXRbNV0gPiBtYXRbMTBdKSB7XHJcblx0XHRcdFMgPSBNYXRoLnNxcnQoMS4wICsgbWF0WzVdIC0gbWF0WzBdIC0gbWF0WzEwXSkgKiAyXHJcblx0XHRcdG91dFszXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gU1xyXG5cdFx0XHRvdXRbMF0gPSAobWF0WzFdICsgbWF0WzRdKSAvIFNcclxuXHRcdFx0b3V0WzFdID0gMC4yNSAqIFNcclxuXHRcdFx0b3V0WzJdID0gKG1hdFs2XSArIG1hdFs5XSkgLyBTXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFsxMF0gLSBtYXRbMF0gLSBtYXRbNV0pICogMlxyXG5cdFx0XHRvdXRbM10gPSAobWF0WzFdIC0gbWF0WzRdKSAvIFNcclxuXHRcdFx0b3V0WzBdID0gKG1hdFs4XSArIG1hdFsyXSkgLyBTXHJcblx0XHRcdG91dFsxXSA9IChtYXRbNl0gKyBtYXRbOV0pIC8gU1xyXG5cdFx0XHRvdXRbMl0gPSAwLjI1ICogU1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiwgdmVjdG9yIHRyYW5zbGF0aW9uIGFuZCB2ZWN0b3Igc2NhbGVcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xyXG5cdCAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcblx0ICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcclxuXHQgKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcclxuXHQgKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKG91dCwgcSwgdiwgcykge1xyXG5cdFx0Ly8gUXVhdGVybmlvbiBtYXRoXHJcblx0XHR2YXIgeCA9IHFbMF0sXHJcblx0XHRcdHkgPSBxWzFdLFxyXG5cdFx0XHR6ID0gcVsyXSxcclxuXHRcdFx0dyA9IHFbM11cclxuXHRcdHZhciB4MiA9IHggKyB4XHJcblx0XHR2YXIgeTIgPSB5ICsgeVxyXG5cdFx0dmFyIHoyID0geiArIHpcclxuXHRcdHZhciB4eCA9IHggKiB4MlxyXG5cdFx0dmFyIHh5ID0geCAqIHkyXHJcblx0XHR2YXIgeHogPSB4ICogejJcclxuXHRcdHZhciB5eSA9IHkgKiB5MlxyXG5cdFx0dmFyIHl6ID0geSAqIHoyXHJcblx0XHR2YXIgenogPSB6ICogejJcclxuXHRcdHZhciB3eCA9IHcgKiB4MlxyXG5cdFx0dmFyIHd5ID0gdyAqIHkyXHJcblx0XHR2YXIgd3ogPSB3ICogejJcclxuXHRcdHZhciBzeCA9IHNbMF1cclxuXHRcdHZhciBzeSA9IHNbMV1cclxuXHRcdHZhciBzeiA9IHNbMl1cclxuXHRcdG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4XHJcblx0XHRvdXRbMV0gPSAoeHkgKyB3eikgKiBzeFxyXG5cdFx0b3V0WzJdID0gKHh6IC0gd3kpICogc3hcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5XHJcblx0XHRvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeVxyXG5cdFx0b3V0WzZdID0gKHl6ICsgd3gpICogc3lcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9ICh4eiArIHd5KSAqIHN6XHJcblx0XHRvdXRbOV0gPSAoeXogLSB3eCkgKiBzelxyXG5cdFx0b3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6XHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IHZbMF1cclxuXHRcdG91dFsxM10gPSB2WzFdXHJcblx0XHRvdXRbMTRdID0gdlsyXVxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiwgdmVjdG9yIHRyYW5zbGF0aW9uIGFuZCB2ZWN0b3Igc2NhbGUsIHJvdGF0aW5nIGFuZCBzY2FsaW5nIGFyb3VuZCB0aGUgZ2l2ZW4gb3JpZ2luXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgb3JpZ2luKTtcclxuXHQgKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG5cdCAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQuc2NhbGUoZGVzdCwgc2NhbGUpXHJcblx0ICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG5lZ2F0aXZlT3JpZ2luKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvIFRoZSBvcmlnaW4gdmVjdG9yIGFyb3VuZCB3aGljaCB0byBzY2FsZSBhbmQgcm90YXRlXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luKG91dCwgcSwgdiwgcywgbykge1xyXG5cdFx0Ly8gUXVhdGVybmlvbiBtYXRoXHJcblx0XHR2YXIgeCA9IHFbMF0sXHJcblx0XHRcdHkgPSBxWzFdLFxyXG5cdFx0XHR6ID0gcVsyXSxcclxuXHRcdFx0dyA9IHFbM11cclxuXHRcdHZhciB4MiA9IHggKyB4XHJcblx0XHR2YXIgeTIgPSB5ICsgeVxyXG5cdFx0dmFyIHoyID0geiArIHpcclxuXHRcdHZhciB4eCA9IHggKiB4MlxyXG5cdFx0dmFyIHh5ID0geCAqIHkyXHJcblx0XHR2YXIgeHogPSB4ICogejJcclxuXHRcdHZhciB5eSA9IHkgKiB5MlxyXG5cdFx0dmFyIHl6ID0geSAqIHoyXHJcblx0XHR2YXIgenogPSB6ICogejJcclxuXHRcdHZhciB3eCA9IHcgKiB4MlxyXG5cdFx0dmFyIHd5ID0gdyAqIHkyXHJcblx0XHR2YXIgd3ogPSB3ICogejJcclxuXHRcdHZhciBzeCA9IHNbMF1cclxuXHRcdHZhciBzeSA9IHNbMV1cclxuXHRcdHZhciBzeiA9IHNbMl1cclxuXHRcdHZhciBveCA9IG9bMF1cclxuXHRcdHZhciBveSA9IG9bMV1cclxuXHRcdHZhciBveiA9IG9bMl1cclxuXHRcdHZhciBvdXQwID0gKDEgLSAoeXkgKyB6eikpICogc3hcclxuXHRcdHZhciBvdXQxID0gKHh5ICsgd3opICogc3hcclxuXHRcdHZhciBvdXQyID0gKHh6IC0gd3kpICogc3hcclxuXHRcdHZhciBvdXQ0ID0gKHh5IC0gd3opICogc3lcclxuXHRcdHZhciBvdXQ1ID0gKDEgLSAoeHggKyB6eikpICogc3lcclxuXHRcdHZhciBvdXQ2ID0gKHl6ICsgd3gpICogc3lcclxuXHRcdHZhciBvdXQ4ID0gKHh6ICsgd3kpICogc3pcclxuXHRcdHZhciBvdXQ5ID0gKHl6IC0gd3gpICogc3pcclxuXHRcdHZhciBvdXQxMCA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6XHJcblx0XHRvdXRbMF0gPSBvdXQwXHJcblx0XHRvdXRbMV0gPSBvdXQxXHJcblx0XHRvdXRbMl0gPSBvdXQyXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSBvdXQ0XHJcblx0XHRvdXRbNV0gPSBvdXQ1XHJcblx0XHRvdXRbNl0gPSBvdXQ2XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSBvdXQ4XHJcblx0XHRvdXRbOV0gPSBvdXQ5XHJcblx0XHRvdXRbMTBdID0gb3V0MTBcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gdlswXSArIG94IC0gKG91dDAgKiBveCArIG91dDQgKiBveSArIG91dDggKiBveilcclxuXHRcdG91dFsxM10gPSB2WzFdICsgb3kgLSAob3V0MSAqIG94ICsgb3V0NSAqIG95ICsgb3V0OSAqIG96KVxyXG5cdFx0b3V0WzE0XSA9IHZbMl0gKyBveiAtIChvdXQyICogb3ggKyBvdXQ2ICogb3kgKyBvdXQxMCAqIG96KVxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyBhIDR4NCBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUXVhdCQxKG91dCwgcSkge1xyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB5eCA9IHkgKiB4MlxyXG5cdFx0dmFyIHl5ID0geSAqIHkyXHJcblx0XHR2YXIgenggPSB6ICogeDJcclxuXHRcdHZhciB6eSA9IHogKiB5MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHRvdXRbMF0gPSAxIC0geXkgLSB6elxyXG5cdFx0b3V0WzFdID0geXggKyB3elxyXG5cdFx0b3V0WzJdID0genggLSB3eVxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0geXggLSB3elxyXG5cdFx0b3V0WzVdID0gMSAtIHh4IC0genpcclxuXHRcdG91dFs2XSA9IHp5ICsgd3hcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IHp4ICsgd3lcclxuXHRcdG91dFs5XSA9IHp5IC0gd3hcclxuXHRcdG91dFsxMF0gPSAxIC0geHggLSB5eVxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSAwXHJcblx0XHRvdXRbMTNdID0gMFxyXG5cdFx0b3V0WzE0XSA9IDBcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcnVzdHVtKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcclxuXHRcdHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KVxyXG5cdFx0dmFyIHRiID0gMSAvICh0b3AgLSBib3R0b20pXHJcblx0XHR2YXIgbmYgPSAxIC8gKG5lYXIgLSBmYXIpXHJcblx0XHRvdXRbMF0gPSBuZWFyICogMiAqIHJsXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSBuZWFyICogMiAqIHRiXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAocmlnaHQgKyBsZWZ0KSAqIHJsXHJcblx0XHRvdXRbOV0gPSAodG9wICsgYm90dG9tKSAqIHRiXHJcblx0XHRvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmZcclxuXHRcdG91dFsxMV0gPSAtMVxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gZmFyICogbmVhciAqIDIgKiBuZlxyXG5cdFx0b3V0WzE1XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzLlxyXG5cdCAqIFBhc3NpbmcgbnVsbC91bmRlZmluZWQvbm8gdmFsdWUgZm9yIGZhciB3aWxsIGdlbmVyYXRlIGluZmluaXRlIHByb2plY3Rpb24gbWF0cml4LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtLCBjYW4gYmUgbnVsbCBvciBJbmZpbml0eVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcGVyc3BlY3RpdmUob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xyXG5cdFx0dmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXHJcblx0XHRcdG5mXHJcblx0XHRvdXRbMF0gPSBmIC8gYXNwZWN0XHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSBmXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAwXHJcblx0XHRvdXRbMTFdID0gLTFcclxuXHRcdG91dFsxMl0gPSAwXHJcblx0XHRvdXRbMTNdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDBcclxuXHJcblx0XHRpZiAoZmFyICE9IG51bGwgJiYgZmFyICE9PSBJbmZpbml0eSkge1xyXG5cdFx0XHRuZiA9IDEgLyAobmVhciAtIGZhcilcclxuXHRcdFx0b3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mXHJcblx0XHRcdG91dFsxNF0gPSAyICogZmFyICogbmVhciAqIG5mXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvdXRbMTBdID0gLTFcclxuXHRcdFx0b3V0WzE0XSA9IC0yICogbmVhclxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZmllbGQgb2Ygdmlldy5cclxuXHQgKiBUaGlzIGlzIHByaW1hcmlseSB1c2VmdWwgZm9yIGdlbmVyYXRpbmcgcHJvamVjdGlvbiBtYXRyaWNlcyB0byBiZSB1c2VkXHJcblx0ICogd2l0aCB0aGUgc3RpbGwgZXhwZXJpZW1lbnRhbCBXZWJWUiBBUEkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGZvdiBPYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIHZhbHVlczogdXBEZWdyZWVzLCBkb3duRGVncmVlcywgbGVmdERlZ3JlZXMsIHJpZ2h0RGVncmVlc1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXcob3V0LCBmb3YsIG5lYXIsIGZhcikge1xyXG5cdFx0dmFyIHVwVGFuID0gTWF0aC50YW4oKGZvdi51cERlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MC4wKVxyXG5cdFx0dmFyIGRvd25UYW4gPSBNYXRoLnRhbigoZm92LmRvd25EZWdyZWVzICogTWF0aC5QSSkgLyAxODAuMClcclxuXHRcdHZhciBsZWZ0VGFuID0gTWF0aC50YW4oKGZvdi5sZWZ0RGVncmVlcyAqIE1hdGguUEkpIC8gMTgwLjApXHJcblx0XHR2YXIgcmlnaHRUYW4gPSBNYXRoLnRhbigoZm92LnJpZ2h0RGVncmVlcyAqIE1hdGguUEkpIC8gMTgwLjApXHJcblx0XHR2YXIgeFNjYWxlID0gMi4wIC8gKGxlZnRUYW4gKyByaWdodFRhbilcclxuXHRcdHZhciB5U2NhbGUgPSAyLjAgLyAodXBUYW4gKyBkb3duVGFuKVxyXG5cdFx0b3V0WzBdID0geFNjYWxlXHJcblx0XHRvdXRbMV0gPSAwLjBcclxuXHRcdG91dFsyXSA9IDAuMFxyXG5cdFx0b3V0WzNdID0gMC4wXHJcblx0XHRvdXRbNF0gPSAwLjBcclxuXHRcdG91dFs1XSA9IHlTY2FsZVxyXG5cdFx0b3V0WzZdID0gMC4wXHJcblx0XHRvdXRbN10gPSAwLjBcclxuXHRcdG91dFs4XSA9IC0oKGxlZnRUYW4gLSByaWdodFRhbikgKiB4U2NhbGUgKiAwLjUpXHJcblx0XHRvdXRbOV0gPSAodXBUYW4gLSBkb3duVGFuKSAqIHlTY2FsZSAqIDAuNVxyXG5cdFx0b3V0WzEwXSA9IGZhciAvIChuZWFyIC0gZmFyKVxyXG5cdFx0b3V0WzExXSA9IC0xLjBcclxuXHRcdG91dFsxMl0gPSAwLjBcclxuXHRcdG91dFsxM10gPSAwLjBcclxuXHRcdG91dFsxNF0gPSAoZmFyICogbmVhcikgLyAobmVhciAtIGZhcilcclxuXHRcdG91dFsxNV0gPSAwLjBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gb3J0aG8ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xyXG5cdFx0dmFyIGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpXHJcblx0XHR2YXIgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcClcclxuXHRcdHZhciBuZiA9IDEgLyAobmVhciAtIGZhcilcclxuXHRcdG91dFswXSA9IC0yICogbHJcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IC0yICogYnRcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDBcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSAyICogbmZcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBsclxyXG5cdFx0b3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnRcclxuXHRcdG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZlxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgbG9vay1hdCBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZXllIHBvc2l0aW9uLCBmb2NhbCBwb2ludCwgYW5kIHVwIGF4aXMuXHJcblx0ICogSWYgeW91IHdhbnQgYSBtYXRyaXggdGhhdCBhY3R1YWxseSBtYWtlcyBhbiBvYmplY3QgbG9vayBhdCBhbm90aGVyIG9iamVjdCwgeW91IHNob3VsZCB1c2UgdGFyZ2V0VG8gaW5zdGVhZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsb29rQXQob3V0LCBleWUsIGNlbnRlciwgdXApIHtcclxuXHRcdHZhciB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW5cclxuXHRcdHZhciBleWV4ID0gZXllWzBdXHJcblx0XHR2YXIgZXlleSA9IGV5ZVsxXVxyXG5cdFx0dmFyIGV5ZXogPSBleWVbMl1cclxuXHRcdHZhciB1cHggPSB1cFswXVxyXG5cdFx0dmFyIHVweSA9IHVwWzFdXHJcblx0XHR2YXIgdXB6ID0gdXBbMl1cclxuXHRcdHZhciBjZW50ZXJ4ID0gY2VudGVyWzBdXHJcblx0XHR2YXIgY2VudGVyeSA9IGNlbnRlclsxXVxyXG5cdFx0dmFyIGNlbnRlcnogPSBjZW50ZXJbMl1cclxuXHJcblx0XHRpZiAoXHJcblx0XHRcdE1hdGguYWJzKGV5ZXggLSBjZW50ZXJ4KSA8IEVQU0lMT04gJiZcclxuXHRcdFx0TWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgRVBTSUxPTiAmJlxyXG5cdFx0XHRNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBFUFNJTE9OXHJcblx0XHQpIHtcclxuXHRcdFx0cmV0dXJuIGlkZW50aXR5JDMob3V0KVxyXG5cdFx0fVxyXG5cclxuXHRcdHowID0gZXlleCAtIGNlbnRlcnhcclxuXHRcdHoxID0gZXlleSAtIGNlbnRlcnlcclxuXHRcdHoyID0gZXlleiAtIGNlbnRlcnpcclxuXHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQoejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyKVxyXG5cdFx0ejAgKj0gbGVuXHJcblx0XHR6MSAqPSBsZW5cclxuXHRcdHoyICo9IGxlblxyXG5cdFx0eDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxXHJcblx0XHR4MSA9IHVweiAqIHowIC0gdXB4ICogejJcclxuXHRcdHgyID0gdXB4ICogejEgLSB1cHkgKiB6MFxyXG5cdFx0bGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4MilcclxuXHJcblx0XHRpZiAoIWxlbikge1xyXG5cdFx0XHR4MCA9IDBcclxuXHRcdFx0eDEgPSAwXHJcblx0XHRcdHgyID0gMFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bGVuID0gMSAvIGxlblxyXG5cdFx0XHR4MCAqPSBsZW5cclxuXHRcdFx0eDEgKj0gbGVuXHJcblx0XHRcdHgyICo9IGxlblxyXG5cdFx0fVxyXG5cclxuXHRcdHkwID0gejEgKiB4MiAtIHoyICogeDFcclxuXHRcdHkxID0gejIgKiB4MCAtIHowICogeDJcclxuXHRcdHkyID0gejAgKiB4MSAtIHoxICogeDBcclxuXHRcdGxlbiA9IE1hdGguc3FydCh5MCAqIHkwICsgeTEgKiB5MSArIHkyICogeTIpXHJcblxyXG5cdFx0aWYgKCFsZW4pIHtcclxuXHRcdFx0eTAgPSAwXHJcblx0XHRcdHkxID0gMFxyXG5cdFx0XHR5MiA9IDBcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGxlbiA9IDEgLyBsZW5cclxuXHRcdFx0eTAgKj0gbGVuXHJcblx0XHRcdHkxICo9IGxlblxyXG5cdFx0XHR5MiAqPSBsZW5cclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSB4MFxyXG5cdFx0b3V0WzFdID0geTBcclxuXHRcdG91dFsyXSA9IHowXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSB4MVxyXG5cdFx0b3V0WzVdID0geTFcclxuXHRcdG91dFs2XSA9IHoxXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSB4MlxyXG5cdFx0b3V0WzldID0geTJcclxuXHRcdG91dFsxMF0gPSB6MlxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSAtKHgwICogZXlleCArIHgxICogZXlleSArIHgyICogZXlleilcclxuXHRcdG91dFsxM10gPSAtKHkwICogZXlleCArIHkxICogZXlleSArIHkyICogZXlleilcclxuXHRcdG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleilcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIG1hdHJpeCB0aGF0IG1ha2VzIHNvbWV0aGluZyBsb29rIGF0IHNvbWV0aGluZyBlbHNlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRhcmdldFRvKG91dCwgZXllLCB0YXJnZXQsIHVwKSB7XHJcblx0XHR2YXIgZXlleCA9IGV5ZVswXSxcclxuXHRcdFx0ZXlleSA9IGV5ZVsxXSxcclxuXHRcdFx0ZXlleiA9IGV5ZVsyXSxcclxuXHRcdFx0dXB4ID0gdXBbMF0sXHJcblx0XHRcdHVweSA9IHVwWzFdLFxyXG5cdFx0XHR1cHogPSB1cFsyXVxyXG5cdFx0dmFyIHowID0gZXlleCAtIHRhcmdldFswXSxcclxuXHRcdFx0ejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxyXG5cdFx0XHR6MiA9IGV5ZXogLSB0YXJnZXRbMl1cclxuXHRcdHZhciBsZW4gPSB6MCAqIHowICsgejEgKiB6MSArIHoyICogejJcclxuXHJcblx0XHRpZiAobGVuID4gMCkge1xyXG5cdFx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcclxuXHRcdFx0ejAgKj0gbGVuXHJcblx0XHRcdHoxICo9IGxlblxyXG5cdFx0XHR6MiAqPSBsZW5cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxLFxyXG5cdFx0XHR4MSA9IHVweiAqIHowIC0gdXB4ICogejIsXHJcblx0XHRcdHgyID0gdXB4ICogejEgLSB1cHkgKiB6MFxyXG5cdFx0bGVuID0geDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyXHJcblxyXG5cdFx0aWYgKGxlbiA+IDApIHtcclxuXHRcdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pXHJcblx0XHRcdHgwICo9IGxlblxyXG5cdFx0XHR4MSAqPSBsZW5cclxuXHRcdFx0eDIgKj0gbGVuXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0geDBcclxuXHRcdG91dFsxXSA9IHgxXHJcblx0XHRvdXRbMl0gPSB4MlxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gejEgKiB4MiAtIHoyICogeDFcclxuXHRcdG91dFs1XSA9IHoyICogeDAgLSB6MCAqIHgyXHJcblx0XHRvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gejBcclxuXHRcdG91dFs5XSA9IHoxXHJcblx0XHRvdXRbMTBdID0gejJcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gZXlleFxyXG5cdFx0b3V0WzEzXSA9IGV5ZXlcclxuXHRcdG91dFsxNF0gPSBleWV6XHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkMyhhKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQnbWF0NCgnICtcclxuXHRcdFx0YVswXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzFdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbMl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVszXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzRdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs2XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzddICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbOF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs5XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzEwXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzExXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzEyXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzEzXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzE0XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzE1XSArXHJcblx0XHRcdCcpJ1xyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvYiQzKGEpIHtcclxuXHRcdHJldHVybiBNYXRoLnNxcnQoXHJcblx0XHRcdE1hdGgucG93KGFbMF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzFdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsyXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbM10sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzRdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs1XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzddLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs4XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbOV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzEwXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMTFdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxMl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzEzXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMTRdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxNV0sIDIpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkMyhvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV1cclxuXHRcdG91dFs2XSA9IGFbNl0gKyBiWzZdXHJcblx0XHRvdXRbN10gPSBhWzddICsgYls3XVxyXG5cdFx0b3V0WzhdID0gYVs4XSArIGJbOF1cclxuXHRcdG91dFs5XSA9IGFbOV0gKyBiWzldXHJcblx0XHRvdXRbMTBdID0gYVsxMF0gKyBiWzEwXVxyXG5cdFx0b3V0WzExXSA9IGFbMTFdICsgYlsxMV1cclxuXHRcdG91dFsxMl0gPSBhWzEyXSArIGJbMTJdXHJcblx0XHRvdXRbMTNdID0gYVsxM10gKyBiWzEzXVxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdICsgYlsxNF1cclxuXHRcdG91dFsxNV0gPSBhWzE1XSArIGJbMTVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDMob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdIC0gYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSAtIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gLSBiWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdIC0gYls2XVxyXG5cdFx0b3V0WzddID0gYVs3XSAtIGJbN11cclxuXHRcdG91dFs4XSA9IGFbOF0gLSBiWzhdXHJcblx0XHRvdXRbOV0gPSBhWzldIC0gYls5XVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdIC0gYlsxMF1cclxuXHRcdG91dFsxMV0gPSBhWzExXSAtIGJbMTFdXHJcblx0XHRvdXRbMTJdID0gYVsxMl0gLSBiWzEyXVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdIC0gYlsxM11cclxuXHRcdG91dFsxNF0gPSBhWzE0XSAtIGJbMTRdXHJcblx0XHRvdXRbMTVdID0gYVsxNV0gLSBiWzE1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseVNjYWxhciQzKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJcclxuXHRcdG91dFs0XSA9IGFbNF0gKiBiXHJcblx0XHRvdXRbNV0gPSBhWzVdICogYlxyXG5cdFx0b3V0WzZdID0gYVs2XSAqIGJcclxuXHRcdG91dFs3XSA9IGFbN10gKiBiXHJcblx0XHRvdXRbOF0gPSBhWzhdICogYlxyXG5cdFx0b3V0WzldID0gYVs5XSAqIGJcclxuXHRcdG91dFsxMF0gPSBhWzEwXSAqIGJcclxuXHRcdG91dFsxMV0gPSBhWzExXSAqIGJcclxuXHRcdG91dFsxMl0gPSBhWzEyXSAqIGJcclxuXHRcdG91dFsxM10gPSBhWzEzXSAqIGJcclxuXHRcdG91dFsxNF0gPSBhWzE0XSAqIGJcclxuXHRcdG91dFsxNV0gPSBhWzE1XSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0NCdzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQkMyhvdXQsIGEsIGIsIHNjYWxlKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXSAqIHNjYWxlXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XSAqIHNjYWxlXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XSAqIHNjYWxlXHJcblx0XHRvdXRbNl0gPSBhWzZdICsgYls2XSAqIHNjYWxlXHJcblx0XHRvdXRbN10gPSBhWzddICsgYls3XSAqIHNjYWxlXHJcblx0XHRvdXRbOF0gPSBhWzhdICsgYls4XSAqIHNjYWxlXHJcblx0XHRvdXRbOV0gPSBhWzldICsgYls5XSAqIHNjYWxlXHJcblx0XHRvdXRbMTBdID0gYVsxMF0gKyBiWzEwXSAqIHNjYWxlXHJcblx0XHRvdXRbMTFdID0gYVsxMV0gKyBiWzExXSAqIHNjYWxlXHJcblx0XHRvdXRbMTJdID0gYVsxMl0gKyBiWzEyXSAqIHNjYWxlXHJcblx0XHRvdXRbMTNdID0gYVsxM10gKyBiWzEzXSAqIHNjYWxlXHJcblx0XHRvdXRbMTRdID0gYVsxNF0gKyBiWzE0XSAqIHNjYWxlXHJcblx0XHRvdXRbMTVdID0gYVsxNV0gKyBiWzE1XSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGV4YWN0RXF1YWxzJDMoYSwgYikge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0YVswXSA9PT0gYlswXSAmJlxyXG5cdFx0XHRhWzFdID09PSBiWzFdICYmXHJcblx0XHRcdGFbMl0gPT09IGJbMl0gJiZcclxuXHRcdFx0YVszXSA9PT0gYlszXSAmJlxyXG5cdFx0XHRhWzRdID09PSBiWzRdICYmXHJcblx0XHRcdGFbNV0gPT09IGJbNV0gJiZcclxuXHRcdFx0YVs2XSA9PT0gYls2XSAmJlxyXG5cdFx0XHRhWzddID09PSBiWzddICYmXHJcblx0XHRcdGFbOF0gPT09IGJbOF0gJiZcclxuXHRcdFx0YVs5XSA9PT0gYls5XSAmJlxyXG5cdFx0XHRhWzEwXSA9PT0gYlsxMF0gJiZcclxuXHRcdFx0YVsxMV0gPT09IGJbMTFdICYmXHJcblx0XHRcdGFbMTJdID09PSBiWzEyXSAmJlxyXG5cdFx0XHRhWzEzXSA9PT0gYlsxM10gJiZcclxuXHRcdFx0YVsxNF0gPT09IGJbMTRdICYmXHJcblx0XHRcdGFbMTVdID09PSBiWzE1XVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBlcXVhbHMkNChhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgYTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV0sXHJcblx0XHRcdGE2ID0gYVs2XSxcclxuXHRcdFx0YTcgPSBhWzddXHJcblx0XHR2YXIgYTggPSBhWzhdLFxyXG5cdFx0XHRhOSA9IGFbOV0sXHJcblx0XHRcdGExMCA9IGFbMTBdLFxyXG5cdFx0XHRhMTEgPSBhWzExXVxyXG5cdFx0dmFyIGExMiA9IGFbMTJdLFxyXG5cdFx0XHRhMTMgPSBhWzEzXSxcclxuXHRcdFx0YTE0ID0gYVsxNF0sXHJcblx0XHRcdGExNSA9IGFbMTVdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdXHJcblx0XHR2YXIgYjQgPSBiWzRdLFxyXG5cdFx0XHRiNSA9IGJbNV0sXHJcblx0XHRcdGI2ID0gYls2XSxcclxuXHRcdFx0YjcgPSBiWzddXHJcblx0XHR2YXIgYjggPSBiWzhdLFxyXG5cdFx0XHRiOSA9IGJbOV0sXHJcblx0XHRcdGIxMCA9IGJbMTBdLFxyXG5cdFx0XHRiMTEgPSBiWzExXVxyXG5cdFx0dmFyIGIxMiA9IGJbMTJdLFxyXG5cdFx0XHRiMTMgPSBiWzEzXSxcclxuXHRcdFx0YjE0ID0gYlsxNF0sXHJcblx0XHRcdGIxNSA9IGJbMTVdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMyAtIGIzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTQgLSBiNCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE1IC0gYjUpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNiAtIGI2KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTcgLSBiNykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE4IC0gYjgpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE4KSwgTWF0aC5hYnMoYjgpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhOSAtIGI5KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOSksIE1hdGguYWJzKGI5KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEwIC0gYjEwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTApLCBNYXRoLmFicyhiMTApKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMTEgLSBiMTEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMSksIE1hdGguYWJzKGIxMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExMiAtIGIxMikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEyKSwgTWF0aC5hYnMoYjEyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEzIC0gYjEzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTMpLCBNYXRoLmFicyhiMTMpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMTQgLSBiMTQpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExNCksIE1hdGguYWJzKGIxNCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExNSAtIGIxNSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTE1KSwgTWF0aC5hYnMoYjE1KSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDMgPSBtdWx0aXBseSQzXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQ0LnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViJDMgPSBzdWJ0cmFjdCQzXHJcblxyXG5cdHZhciBtYXQ0ID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDMsXHJcblx0XHRjbG9uZTogY2xvbmUkMyxcclxuXHRcdGNvcHk6IGNvcHkkMyxcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkMyxcclxuXHRcdHNldDogc2V0JDMsXHJcblx0XHRpZGVudGl0eTogaWRlbnRpdHkkMyxcclxuXHRcdHRyYW5zcG9zZTogdHJhbnNwb3NlJDIsXHJcblx0XHRpbnZlcnQ6IGludmVydCQzLFxyXG5cdFx0YWRqb2ludDogYWRqb2ludCQyLFxyXG5cdFx0ZGV0ZXJtaW5hbnQ6IGRldGVybWluYW50JDMsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkMyxcclxuXHRcdHRyYW5zbGF0ZTogdHJhbnNsYXRlJDIsXHJcblx0XHRzY2FsZTogc2NhbGUkMyxcclxuXHRcdHJvdGF0ZTogcm90YXRlJDMsXHJcblx0XHRyb3RhdGVYOiByb3RhdGVYLFxyXG5cdFx0cm90YXRlWTogcm90YXRlWSxcclxuXHRcdHJvdGF0ZVo6IHJvdGF0ZVosXHJcblx0XHRmcm9tVHJhbnNsYXRpb246IGZyb21UcmFuc2xhdGlvbiQyLFxyXG5cdFx0ZnJvbVNjYWxpbmc6IGZyb21TY2FsaW5nJDMsXHJcblx0XHRmcm9tUm90YXRpb246IGZyb21Sb3RhdGlvbiQzLFxyXG5cdFx0ZnJvbVhSb3RhdGlvbjogZnJvbVhSb3RhdGlvbixcclxuXHRcdGZyb21ZUm90YXRpb246IGZyb21ZUm90YXRpb24sXHJcblx0XHRmcm9tWlJvdGF0aW9uOiBmcm9tWlJvdGF0aW9uLFxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb246IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLFxyXG5cdFx0ZnJvbVF1YXQyOiBmcm9tUXVhdDIsXHJcblx0XHRnZXRUcmFuc2xhdGlvbjogZ2V0VHJhbnNsYXRpb24sXHJcblx0XHRnZXRTY2FsaW5nOiBnZXRTY2FsaW5nLFxyXG5cdFx0Z2V0Um90YXRpb246IGdldFJvdGF0aW9uLFxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZTogZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZSxcclxuXHRcdGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVPcmlnaW46IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVPcmlnaW4sXHJcblx0XHRmcm9tUXVhdDogZnJvbVF1YXQkMSxcclxuXHRcdGZydXN0dW06IGZydXN0dW0sXHJcblx0XHRwZXJzcGVjdGl2ZTogcGVyc3BlY3RpdmUsXHJcblx0XHRwZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldzogcGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXcsXHJcblx0XHRvcnRobzogb3J0aG8sXHJcblx0XHRsb29rQXQ6IGxvb2tBdCxcclxuXHRcdHRhcmdldFRvOiB0YXJnZXRUbyxcclxuXHRcdHN0cjogc3RyJDMsXHJcblx0XHRmcm9iOiBmcm9iJDMsXHJcblx0XHRhZGQ6IGFkZCQzLFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0JDMsXHJcblx0XHRtdWx0aXBseVNjYWxhcjogbXVsdGlwbHlTY2FsYXIkMyxcclxuXHRcdG11bHRpcGx5U2NhbGFyQW5kQWRkOiBtdWx0aXBseVNjYWxhckFuZEFkZCQzLFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDMsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQ0LFxyXG5cdFx0bXVsOiBtdWwkMyxcclxuXHRcdHN1Yjogc3ViJDMsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogMyBEaW1lbnNpb25hbCBWZWN0b3JcclxuXHQgKiBAbW9kdWxlIHZlYzNcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjM1xyXG5cdCAqXHJcblx0ICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkNCgpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgzKVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMF0gPSAwXHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjbG9uZSQ0KGEpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgzKVxyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsZW5ndGgoYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdXHJcblx0XHR2YXIgeSA9IGFbMV1cclxuXHRcdHZhciB6ID0gYVsyXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyQ0KHgsIHksIHopIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgzKVxyXG5cdFx0b3V0WzBdID0geFxyXG5cdFx0b3V0WzFdID0geVxyXG5cdFx0b3V0WzJdID0gelxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29weSQ0KG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkNChvdXQsIHgsIHksIHopIHtcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQ0KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdWJ0cmFjdCQ0KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAtIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC0gYlsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkNChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogRGl2aWRlcyB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC8gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAvIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNlaWxcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguY2VpbChhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gZmxvb3JcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWluKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIHJvdW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGgucm91bmQoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUkNChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjMydzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XHJcblx0XHR2YXIgeCA9IGJbMF0gLSBhWzBdXHJcblx0XHR2YXIgeSA9IGJbMV0gLSBhWzFdXHJcblx0XHR2YXIgeiA9IGJbMl0gLSBhWzJdXHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF1cclxuXHRcdHZhciB5ID0gYlsxXSAtIGFbMV1cclxuXHRcdHZhciB6ID0gYlsyXSAtIGFbMl1cclxuXHRcdHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHpcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF1cclxuXHRcdHZhciB5ID0gYVsxXVxyXG5cdFx0dmFyIHogPSBhWzJdXHJcblx0XHRyZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAtYVswXVxyXG5cdFx0b3V0WzFdID0gLWFbMV1cclxuXHRcdG91dFsyXSA9IC1hWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gaW52ZXJ0XHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gMS4wIC8gYVswXVxyXG5cdFx0b3V0WzFdID0gMS4wIC8gYVsxXVxyXG5cdFx0b3V0WzJdID0gMS4wIC8gYVsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF1cclxuXHRcdHZhciB5ID0gYVsxXVxyXG5cdFx0dmFyIHogPSBhWzJdXHJcblx0XHR2YXIgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6XHJcblxyXG5cdFx0aWYgKGxlbiA+IDApIHtcclxuXHRcdFx0Ly9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cclxuXHRcdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0gYVswXSAqIGxlblxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGxlblxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGxlblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkb3QoYSwgYikge1xyXG5cdFx0cmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl1cclxuXHRcdHZhciBieCA9IGJbMF0sXHJcblx0XHRcdGJ5ID0gYlsxXSxcclxuXHRcdFx0YnogPSBiWzJdXHJcblx0XHRvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieVxyXG5cdFx0b3V0WzFdID0gYXogKiBieCAtIGF4ICogYnpcclxuXHRcdG91dFsyXSA9IGF4ICogYnkgLSBheSAqIGJ4XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xyXG5cdFx0dmFyIGF4ID0gYVswXVxyXG5cdFx0dmFyIGF5ID0gYVsxXVxyXG5cdFx0dmFyIGF6ID0gYVsyXVxyXG5cdFx0b3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheClcclxuXHRcdG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpXHJcblx0XHRvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGhlcm1pdGUgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBjIHRoZSB0aGlyZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGhlcm1pdGUob3V0LCBhLCBiLCBjLCBkLCB0KSB7XHJcblx0XHR2YXIgZmFjdG9yVGltZXMyID0gdCAqIHRcclxuXHRcdHZhciBmYWN0b3IxID0gZmFjdG9yVGltZXMyICogKDIgKiB0IC0gMykgKyAxXHJcblx0XHR2YXIgZmFjdG9yMiA9IGZhY3RvclRpbWVzMiAqICh0IC0gMikgKyB0XHJcblx0XHR2YXIgZmFjdG9yMyA9IGZhY3RvclRpbWVzMiAqICh0IC0gMSlcclxuXHRcdHZhciBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogKDMgLSAyICogdClcclxuXHRcdG91dFswXSA9IGFbMF0gKiBmYWN0b3IxICsgYlswXSAqIGZhY3RvcjIgKyBjWzBdICogZmFjdG9yMyArIGRbMF0gKiBmYWN0b3I0XHJcblx0XHRvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNFxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGZhY3RvcjEgKyBiWzJdICogZmFjdG9yMiArIGNbMl0gKiBmYWN0b3IzICsgZFsyXSAqIGZhY3RvcjRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBiZXppZXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBjIHRoZSB0aGlyZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGJlemllcihvdXQsIGEsIGIsIGMsIGQsIHQpIHtcclxuXHRcdHZhciBpbnZlcnNlRmFjdG9yID0gMSAtIHRcclxuXHRcdHZhciBpbnZlcnNlRmFjdG9yVGltZXNUd28gPSBpbnZlcnNlRmFjdG9yICogaW52ZXJzZUZhY3RvclxyXG5cdFx0dmFyIGZhY3RvclRpbWVzMiA9IHQgKiB0XHJcblx0XHR2YXIgZmFjdG9yMSA9IGludmVyc2VGYWN0b3JUaW1lc1R3byAqIGludmVyc2VGYWN0b3JcclxuXHRcdHZhciBmYWN0b3IyID0gMyAqIHQgKiBpbnZlcnNlRmFjdG9yVGltZXNUd29cclxuXHRcdHZhciBmYWN0b3IzID0gMyAqIGZhY3RvclRpbWVzMiAqIGludmVyc2VGYWN0b3JcclxuXHRcdHZhciBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogdFxyXG5cdFx0b3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjRcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0XHJcblx0XHRvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcmFuZG9tKG91dCwgc2NhbGUpIHtcclxuXHRcdHNjYWxlID0gc2NhbGUgfHwgMS4wXHJcblx0XHR2YXIgciA9IFJBTkRPTSgpICogMi4wICogTWF0aC5QSVxyXG5cdFx0dmFyIHogPSBSQU5ET00oKSAqIDIuMCAtIDEuMFxyXG5cdFx0dmFyIHpTY2FsZSA9IE1hdGguc3FydCgxLjAgLSB6ICogeikgKiBzY2FsZVxyXG5cdFx0b3V0WzBdID0gTWF0aC5jb3MocikgKiB6U2NhbGVcclxuXHRcdG91dFsxXSA9IE1hdGguc2luKHIpICogelNjYWxlXHJcblx0XHRvdXRbMl0gPSB6ICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0NC5cclxuXHQgKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXSxcclxuXHRcdFx0eiA9IGFbMl1cclxuXHRcdHZhciB3ID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdXHJcblx0XHR3ID0gdyB8fCAxLjBcclxuXHRcdG91dFswXSA9IChtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSkgLyB3XHJcblx0XHRvdXRbMV0gPSAobVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10pIC8gd1xyXG5cdFx0b3V0WzJdID0gKG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSkgLyB3XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0M30gbSB0aGUgM3gzIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0MyhvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV0sXHJcblx0XHRcdHogPSBhWzJdXHJcblx0XHRvdXRbMF0gPSB4ICogbVswXSArIHkgKiBtWzNdICsgeiAqIG1bNl1cclxuXHRcdG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XVxyXG5cdFx0b3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcclxuXHQgKiBDYW4gYWxzbyBiZSB1c2VkIGZvciBkdWFsIHF1YXRlcm5pb25zLiAoTXVsdGlwbHkgaXQgd2l0aCB0aGUgcmVhbCBwYXJ0KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHtcclxuXHRcdC8vIGJlbmNobWFya3M6IGh0dHBzOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXRyYW5zZm9ybS12ZWMzLWltcGxlbWVudGF0aW9ucy1maXhlZFxyXG5cdFx0dmFyIHF4ID0gcVswXSxcclxuXHRcdFx0cXkgPSBxWzFdLFxyXG5cdFx0XHRxeiA9IHFbMl0sXHJcblx0XHRcdHF3ID0gcVszXVxyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXSxcclxuXHRcdFx0eiA9IGFbMl0gLy8gdmFyIHF2ZWMgPSBbcXgsIHF5LCBxel07XHJcblx0XHQvLyB2YXIgdXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCBhKTtcclxuXHJcblx0XHR2YXIgdXZ4ID0gcXkgKiB6IC0gcXogKiB5LFxyXG5cdFx0XHR1dnkgPSBxeiAqIHggLSBxeCAqIHosXHJcblx0XHRcdHV2eiA9IHF4ICogeSAtIHF5ICogeCAvLyB2YXIgdXV2ID0gdmVjMy5jcm9zcyhbXSwgcXZlYywgdXYpO1xyXG5cclxuXHRcdHZhciB1dXZ4ID0gcXkgKiB1dnogLSBxeiAqIHV2eSxcclxuXHRcdFx0dXV2eSA9IHF6ICogdXZ4IC0gcXggKiB1dnosXHJcblx0XHRcdHV1dnogPSBxeCAqIHV2eSAtIHF5ICogdXZ4IC8vIHZlYzMuc2NhbGUodXYsIHV2LCAyICogdyk7XHJcblxyXG5cdFx0dmFyIHcyID0gcXcgKiAyXHJcblx0XHR1dnggKj0gdzJcclxuXHRcdHV2eSAqPSB3MlxyXG5cdFx0dXZ6ICo9IHcyIC8vIHZlYzMuc2NhbGUodXV2LCB1dXYsIDIpO1xyXG5cclxuXHRcdHV1dnggKj0gMlxyXG5cdFx0dXV2eSAqPSAyXHJcblx0XHR1dXZ6ICo9IDIgLy8gcmV0dXJuIHZlYzMuYWRkKG91dCwgYSwgdmVjMy5hZGQob3V0LCB1diwgdXV2KSk7XHJcblxyXG5cdFx0b3V0WzBdID0geCArIHV2eCArIHV1dnhcclxuXHRcdG91dFsxXSA9IHkgKyB1dnkgKyB1dXZ5XHJcblx0XHRvdXRbMl0gPSB6ICsgdXZ6ICsgdXV2elxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB4LWF4aXNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVYJDEob3V0LCBhLCBiLCBjKSB7XHJcblx0XHR2YXIgcCA9IFtdLFxyXG5cdFx0XHRyID0gW10gLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG5cclxuXHRcdHBbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0cFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRwWzJdID0gYVsyXSAtIGJbMl0gLy9wZXJmb3JtIHJvdGF0aW9uXHJcblxyXG5cdFx0clswXSA9IHBbMF1cclxuXHRcdHJbMV0gPSBwWzFdICogTWF0aC5jb3MoYykgLSBwWzJdICogTWF0aC5zaW4oYylcclxuXHRcdHJbMl0gPSBwWzFdICogTWF0aC5zaW4oYykgKyBwWzJdICogTWF0aC5jb3MoYykgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxyXG5cclxuXHRcdG91dFswXSA9IHJbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSByWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gclsyXSArIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeS1heGlzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWSQxKG91dCwgYSwgYiwgYykge1xyXG5cdFx0dmFyIHAgPSBbXSxcclxuXHRcdFx0ciA9IFtdIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cclxuXHJcblx0XHRwWzBdID0gYVswXSAtIGJbMF1cclxuXHRcdHBbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0cFsyXSA9IGFbMl0gLSBiWzJdIC8vcGVyZm9ybSByb3RhdGlvblxyXG5cclxuXHRcdHJbMF0gPSBwWzJdICogTWF0aC5zaW4oYykgKyBwWzBdICogTWF0aC5jb3MoYylcclxuXHRcdHJbMV0gPSBwWzFdXHJcblx0XHRyWzJdID0gcFsyXSAqIE1hdGguY29zKGMpIC0gcFswXSAqIE1hdGguc2luKGMpIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSByWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gclsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IHJbMl0gKyBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHotYXhpc1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVokMShvdXQsIGEsIGIsIGMpIHtcclxuXHRcdHZhciBwID0gW10sXHJcblx0XHRcdHIgPSBbXSAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcblxyXG5cdFx0cFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRwWzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdHBbMl0gPSBhWzJdIC0gYlsyXSAvL3BlcmZvcm0gcm90YXRpb25cclxuXHJcblx0XHRyWzBdID0gcFswXSAqIE1hdGguY29zKGMpIC0gcFsxXSAqIE1hdGguc2luKGMpXHJcblx0XHRyWzFdID0gcFswXSAqIE1hdGguc2luKGMpICsgcFsxXSAqIE1hdGguY29zKGMpXHJcblx0XHRyWzJdID0gcFsyXSAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gclswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IHJbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSByWzJdICsgYlsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDNEIHZlY3RvcnNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYW5nbGUoYSwgYikge1xyXG5cdFx0dmFyIHRlbXBBID0gZnJvbVZhbHVlcyQ0KGFbMF0sIGFbMV0sIGFbMl0pXHJcblx0XHR2YXIgdGVtcEIgPSBmcm9tVmFsdWVzJDQoYlswXSwgYlsxXSwgYlsyXSlcclxuXHRcdG5vcm1hbGl6ZSh0ZW1wQSwgdGVtcEEpXHJcblx0XHRub3JtYWxpemUodGVtcEIsIHRlbXBCKVxyXG5cdFx0dmFyIGNvc2luZSA9IGRvdCh0ZW1wQSwgdGVtcEIpXHJcblxyXG5cdFx0aWYgKGNvc2luZSA+IDEuMCkge1xyXG5cdFx0XHRyZXR1cm4gMFxyXG5cdFx0fSBlbHNlIGlmIChjb3NpbmUgPCAtMS4wKSB7XHJcblx0XHRcdHJldHVybiBNYXRoLlBJXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5hY29zKGNvc2luZSlcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB6ZXJvXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gemVybyhvdXQpIHtcclxuXHRcdG91dFswXSA9IDAuMFxyXG5cdFx0b3V0WzFdID0gMC4wXHJcblx0XHRvdXRbMl0gPSAwLjBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkNChhKSB7XHJcblx0XHRyZXR1cm4gJ3ZlYzMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJyknXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQ0KGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDUoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl1cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3VidHJhY3R9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzdWIkNCA9IHN1YnRyYWN0JDRcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkNCA9IG11bHRpcGx5JDRcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZGl2ID0gZGl2aWRlXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpc3RhbmNlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZGlzdCA9IGRpc3RhbmNlXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckRpc3QgPSBzcXVhcmVkRGlzdGFuY2VcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuID0gbGVuZ3RoXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4gPSBzcXVhcmVkTGVuZ3RoXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzNzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cclxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IGFcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdmVjID0gY3JlYXRlJDQoKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xyXG5cdFx0XHR2YXIgaSwgbFxyXG5cclxuXHRcdFx0aWYgKCFzdHJpZGUpIHtcclxuXHRcdFx0XHRzdHJpZGUgPSAzXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghb2Zmc2V0KSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gMFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoY291bnQpIHtcclxuXHRcdFx0XHRsID0gTWF0aC5taW4oY291bnQgKiBzdHJpZGUgKyBvZmZzZXQsIGEubGVuZ3RoKVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGwgPSBhLmxlbmd0aFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xyXG5cdFx0XHRcdHZlY1swXSA9IGFbaV1cclxuXHRcdFx0XHR2ZWNbMV0gPSBhW2kgKyAxXVxyXG5cdFx0XHRcdHZlY1syXSA9IGFbaSArIDJdXHJcblx0XHRcdFx0Zm4odmVjLCB2ZWMsIGFyZylcclxuXHRcdFx0XHRhW2ldID0gdmVjWzBdXHJcblx0XHRcdFx0YVtpICsgMV0gPSB2ZWNbMV1cclxuXHRcdFx0XHRhW2kgKyAyXSA9IHZlY1syXVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYVxyXG5cdFx0fVxyXG5cdH0pKClcclxuXHJcblx0dmFyIHZlYzMgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkNCxcclxuXHRcdGNsb25lOiBjbG9uZSQ0LFxyXG5cdFx0bGVuZ3RoOiBsZW5ndGgsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDQsXHJcblx0XHRjb3B5OiBjb3B5JDQsXHJcblx0XHRzZXQ6IHNldCQ0LFxyXG5cdFx0YWRkOiBhZGQkNCxcclxuXHRcdHN1YnRyYWN0OiBzdWJ0cmFjdCQ0LFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDQsXHJcblx0XHRkaXZpZGU6IGRpdmlkZSxcclxuXHRcdGNlaWw6IGNlaWwsXHJcblx0XHRmbG9vcjogZmxvb3IsXHJcblx0XHRtaW46IG1pbixcclxuXHRcdG1heDogbWF4LFxyXG5cdFx0cm91bmQ6IHJvdW5kLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDQsXHJcblx0XHRzY2FsZUFuZEFkZDogc2NhbGVBbmRBZGQsXHJcblx0XHRkaXN0YW5jZTogZGlzdGFuY2UsXHJcblx0XHRzcXVhcmVkRGlzdGFuY2U6IHNxdWFyZWREaXN0YW5jZSxcclxuXHRcdHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGgsXHJcblx0XHRuZWdhdGU6IG5lZ2F0ZSxcclxuXHRcdGludmVyc2U6IGludmVyc2UsXHJcblx0XHRub3JtYWxpemU6IG5vcm1hbGl6ZSxcclxuXHRcdGRvdDogZG90LFxyXG5cdFx0Y3Jvc3M6IGNyb3NzLFxyXG5cdFx0bGVycDogbGVycCxcclxuXHRcdGhlcm1pdGU6IGhlcm1pdGUsXHJcblx0XHRiZXppZXI6IGJlemllcixcclxuXHRcdHJhbmRvbTogcmFuZG9tLFxyXG5cdFx0dHJhbnNmb3JtTWF0NDogdHJhbnNmb3JtTWF0NCxcclxuXHRcdHRyYW5zZm9ybU1hdDM6IHRyYW5zZm9ybU1hdDMsXHJcblx0XHR0cmFuc2Zvcm1RdWF0OiB0cmFuc2Zvcm1RdWF0LFxyXG5cdFx0cm90YXRlWDogcm90YXRlWCQxLFxyXG5cdFx0cm90YXRlWTogcm90YXRlWSQxLFxyXG5cdFx0cm90YXRlWjogcm90YXRlWiQxLFxyXG5cdFx0YW5nbGU6IGFuZ2xlLFxyXG5cdFx0emVybzogemVybyxcclxuXHRcdHN0cjogc3RyJDQsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkNCxcclxuXHRcdGVxdWFsczogZXF1YWxzJDUsXHJcblx0XHRzdWI6IHN1YiQ0LFxyXG5cdFx0bXVsOiBtdWwkNCxcclxuXHRcdGRpdjogZGl2LFxyXG5cdFx0ZGlzdDogZGlzdCxcclxuXHRcdHNxckRpc3Q6IHNxckRpc3QsXHJcblx0XHRsZW46IGxlbixcclxuXHRcdHNxckxlbjogc3FyTGVuLFxyXG5cdFx0Zm9yRWFjaDogZm9yRWFjaCxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiA0IERpbWVuc2lvbmFsIFZlY3RvclxyXG5cdCAqIEBtb2R1bGUgdmVjNFxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQ1KCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFswXSA9IDBcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdG91dFszXSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkNShhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkNSh4LCB5LCB6LCB3KSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdG91dFszXSA9IHdcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkNShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkNShvdXQsIHgsIHksIHosIHcpIHtcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdG91dFszXSA9IHdcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQ1KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkNShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLSBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQ1KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogRGl2aWRlcyB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpdmlkZSQxKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAvIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC8gYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAvIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNlaWxcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNlaWwkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguY2VpbChhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSlcclxuXHRcdG91dFszXSA9IE1hdGguY2VpbChhWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGZsb29yXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmbG9vciQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKVxyXG5cdFx0b3V0WzNdID0gTWF0aC5mbG9vcihhWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWluJDEob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pXHJcblx0XHRvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWF4JDEob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pXHJcblx0XHRvdXRbM10gPSBNYXRoLm1heChhWzNdLCBiWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJvdW5kXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3VuZCQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKVxyXG5cdFx0b3V0WzNdID0gTWF0aC5yb3VuZChhWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTY2FsZXMgYSB2ZWM0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQ1KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjNCdzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlQW5kQWRkJDEob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpc3RhbmNlJDEoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXVxyXG5cdFx0dmFyIHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0dmFyIHogPSBiWzJdIC0gYVsyXVxyXG5cdFx0dmFyIHcgPSBiWzNdIC0gYVszXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdylcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlJDEoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXVxyXG5cdFx0dmFyIHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0dmFyIHogPSBiWzJdIC0gYVsyXVxyXG5cdFx0dmFyIHcgPSBiWzNdIC0gYVszXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlbmd0aCQxKGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHZhciB3ID0gYVszXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdylcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3F1YXJlZExlbmd0aCQxKGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHZhciB3ID0gYVszXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbmVnYXRlXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBuZWdhdGUkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IC1hWzBdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0b3V0WzJdID0gLWFbMl1cclxuXHRcdG91dFszXSA9IC1hWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gaW52ZXJ0XHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnNlJDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAxLjAgLyBhWzBdXHJcblx0XHRvdXRbMV0gPSAxLjAgLyBhWzFdXHJcblx0XHRvdXRbMl0gPSAxLjAgLyBhWzJdXHJcblx0XHRvdXRbM10gPSAxLjAgLyBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZSQxKG91dCwgYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdXHJcblx0XHR2YXIgeSA9IGFbMV1cclxuXHRcdHZhciB6ID0gYVsyXVxyXG5cdFx0dmFyIHcgPSBhWzNdXHJcblx0XHR2YXIgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHdcclxuXHJcblx0XHRpZiAobGVuID4gMCkge1xyXG5cdFx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSB4ICogbGVuXHJcblx0XHRvdXRbMV0gPSB5ICogbGVuXHJcblx0XHRvdXRbMl0gPSB6ICogbGVuXHJcblx0XHRvdXRbM10gPSB3ICogbGVuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRvdCQxKGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBjcm9zcy1wcm9kdWN0IG9mIHRocmVlIHZlY3RvcnMgaW4gYSA0LWRpbWVuc2lvbmFsIHNwYWNlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IHJlc3VsdCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gVSB0aGUgZmlyc3QgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBWIHRoZSBzZWNvbmQgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBXIHRoZSB0aGlyZCB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gcmVzdWx0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyb3NzJDEob3V0LCB1LCB2LCB3KSB7XHJcblx0XHR2YXIgQSA9IHZbMF0gKiB3WzFdIC0gdlsxXSAqIHdbMF0sXHJcblx0XHRcdEIgPSB2WzBdICogd1syXSAtIHZbMl0gKiB3WzBdLFxyXG5cdFx0XHRDID0gdlswXSAqIHdbM10gLSB2WzNdICogd1swXSxcclxuXHRcdFx0RCA9IHZbMV0gKiB3WzJdIC0gdlsyXSAqIHdbMV0sXHJcblx0XHRcdEUgPSB2WzFdICogd1szXSAtIHZbM10gKiB3WzFdLFxyXG5cdFx0XHRGID0gdlsyXSAqIHdbM10gLSB2WzNdICogd1syXVxyXG5cdFx0dmFyIEcgPSB1WzBdXHJcblx0XHR2YXIgSCA9IHVbMV1cclxuXHRcdHZhciBJID0gdVsyXVxyXG5cdFx0dmFyIEogPSB1WzNdXHJcblx0XHRvdXRbMF0gPSBIICogRiAtIEkgKiBFICsgSiAqIERcclxuXHRcdG91dFsxXSA9IC0oRyAqIEYpICsgSSAqIEMgLSBKICogQlxyXG5cdFx0b3V0WzJdID0gRyAqIEUgLSBIICogQyArIEogKiBBXHJcblx0XHRvdXRbM10gPSAtKEcgKiBEKSArIEggKiBCIC0gSSAqIEFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlcnAkMShvdXQsIGEsIGIsIHQpIHtcclxuXHRcdHZhciBheCA9IGFbMF1cclxuXHRcdHZhciBheSA9IGFbMV1cclxuXHRcdHZhciBheiA9IGFbMl1cclxuXHRcdHZhciBhdyA9IGFbM11cclxuXHRcdG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpXHJcblx0XHRvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KVxyXG5cdFx0b3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheilcclxuXHRcdG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByYW5kb20kMShvdXQsIHNjYWxlKSB7XHJcblx0XHRzY2FsZSA9IHNjYWxlIHx8IDEuMCAvLyBNYXJzYWdsaWEsIEdlb3JnZS4gQ2hvb3NpbmcgYSBQb2ludCBmcm9tIHRoZSBTdXJmYWNlIG9mIGFcclxuXHRcdC8vIFNwaGVyZS4gQW5uLiBNYXRoLiBTdGF0aXN0LiA0MyAoMTk3MiksIG5vLiAyLCA2NDUtLTY0Ni5cclxuXHRcdC8vIGh0dHA6Ly9wcm9qZWN0ZXVjbGlkLm9yZy9ldWNsaWQuYW9tcy8xMTc3NjkyNjQ0O1xyXG5cclxuXHRcdHZhciB2MSwgdjIsIHYzLCB2NFxyXG5cdFx0dmFyIHMxLCBzMlxyXG5cclxuXHRcdGRvIHtcclxuXHRcdFx0djEgPSBSQU5ET00oKSAqIDIgLSAxXHJcblx0XHRcdHYyID0gUkFORE9NKCkgKiAyIC0gMVxyXG5cdFx0XHRzMSA9IHYxICogdjEgKyB2MiAqIHYyXHJcblx0XHR9IHdoaWxlIChzMSA+PSAxKVxyXG5cclxuXHRcdGRvIHtcclxuXHRcdFx0djMgPSBSQU5ET00oKSAqIDIgLSAxXHJcblx0XHRcdHY0ID0gUkFORE9NKCkgKiAyIC0gMVxyXG5cdFx0XHRzMiA9IHYzICogdjMgKyB2NCAqIHY0XHJcblx0XHR9IHdoaWxlIChzMiA+PSAxKVxyXG5cclxuXHRcdHZhciBkID0gTWF0aC5zcXJ0KCgxIC0gczEpIC8gczIpXHJcblx0XHRvdXRbMF0gPSBzY2FsZSAqIHYxXHJcblx0XHRvdXRbMV0gPSBzY2FsZSAqIHYyXHJcblx0XHRvdXRbMl0gPSBzY2FsZSAqIHYzICogZFxyXG5cdFx0b3V0WzNdID0gc2NhbGUgKiB2NCAqIGRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgbWF0NC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0NCQxKG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXSxcclxuXHRcdFx0eiA9IGFbMl0sXHJcblx0XHRcdHcgPSBhWzNdXHJcblx0XHRvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSAqIHdcclxuXHRcdG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogd1xyXG5cdFx0b3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdICogd1xyXG5cdFx0b3V0WzNdID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdICogd1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0JDEob3V0LCBhLCBxKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXVxyXG5cdFx0dmFyIHF4ID0gcVswXSxcclxuXHRcdFx0cXkgPSBxWzFdLFxyXG5cdFx0XHRxeiA9IHFbMl0sXHJcblx0XHRcdHF3ID0gcVszXSAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xyXG5cclxuXHRcdHZhciBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeVxyXG5cdFx0dmFyIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6XHJcblx0XHR2YXIgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHhcclxuXHRcdHZhciBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHogLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxyXG5cclxuXHRcdG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXlcclxuXHRcdG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXpcclxuXHRcdG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXhcclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB6ZXJvXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gemVybyQxKG91dCkge1xyXG5cdFx0b3V0WzBdID0gMC4wXHJcblx0XHRvdXRbMV0gPSAwLjBcclxuXHRcdG91dFsyXSA9IDAuMFxyXG5cdFx0b3V0WzNdID0gMC4wXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDUoYSkge1xyXG5cdFx0cmV0dXJuICd2ZWM0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQ1KGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBlcXVhbHMkNihhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMyAtIGIzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViJDUgPSBzdWJ0cmFjdCQ1XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDUgPSBtdWx0aXBseSQ1XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpdiQxID0gZGl2aWRlJDFcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkaXN0JDEgPSBkaXN0YW5jZSQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWREaXN0YW5jZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckRpc3QkMSA9IHNxdWFyZWREaXN0YW5jZSQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lmxlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbiQxID0gbGVuZ3RoJDFcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZExlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckxlbiQxID0gc3F1YXJlZExlbmd0aCQxXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzRzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzQuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzRzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cclxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IGFcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGZvckVhY2gkMSA9IChmdW5jdGlvbigpIHtcclxuXHRcdHZhciB2ZWMgPSBjcmVhdGUkNSgpXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XHJcblx0XHRcdHZhciBpLCBsXHJcblxyXG5cdFx0XHRpZiAoIXN0cmlkZSkge1xyXG5cdFx0XHRcdHN0cmlkZSA9IDRcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCFvZmZzZXQpIHtcclxuXHRcdFx0XHRvZmZzZXQgPSAwXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChjb3VudCkge1xyXG5cdFx0XHRcdGwgPSBNYXRoLm1pbihjb3VudCAqIHN0cmlkZSArIG9mZnNldCwgYS5sZW5ndGgpXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bCA9IGEubGVuZ3RoXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvciAoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XHJcblx0XHRcdFx0dmVjWzBdID0gYVtpXVxyXG5cdFx0XHRcdHZlY1sxXSA9IGFbaSArIDFdXHJcblx0XHRcdFx0dmVjWzJdID0gYVtpICsgMl1cclxuXHRcdFx0XHR2ZWNbM10gPSBhW2kgKyAzXVxyXG5cdFx0XHRcdGZuKHZlYywgdmVjLCBhcmcpXHJcblx0XHRcdFx0YVtpXSA9IHZlY1swXVxyXG5cdFx0XHRcdGFbaSArIDFdID0gdmVjWzFdXHJcblx0XHRcdFx0YVtpICsgMl0gPSB2ZWNbMl1cclxuXHRcdFx0XHRhW2kgKyAzXSA9IHZlY1szXVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYVxyXG5cdFx0fVxyXG5cdH0pKClcclxuXHJcblx0dmFyIHZlYzQgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkNSxcclxuXHRcdGNsb25lOiBjbG9uZSQ1LFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQ1LFxyXG5cdFx0Y29weTogY29weSQ1LFxyXG5cdFx0c2V0OiBzZXQkNSxcclxuXHRcdGFkZDogYWRkJDUsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkNSxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQ1LFxyXG5cdFx0ZGl2aWRlOiBkaXZpZGUkMSxcclxuXHRcdGNlaWw6IGNlaWwkMSxcclxuXHRcdGZsb29yOiBmbG9vciQxLFxyXG5cdFx0bWluOiBtaW4kMSxcclxuXHRcdG1heDogbWF4JDEsXHJcblx0XHRyb3VuZDogcm91bmQkMSxcclxuXHRcdHNjYWxlOiBzY2FsZSQ1LFxyXG5cdFx0c2NhbGVBbmRBZGQ6IHNjYWxlQW5kQWRkJDEsXHJcblx0XHRkaXN0YW5jZTogZGlzdGFuY2UkMSxcclxuXHRcdHNxdWFyZWREaXN0YW5jZTogc3F1YXJlZERpc3RhbmNlJDEsXHJcblx0XHRsZW5ndGg6IGxlbmd0aCQxLFxyXG5cdFx0c3F1YXJlZExlbmd0aDogc3F1YXJlZExlbmd0aCQxLFxyXG5cdFx0bmVnYXRlOiBuZWdhdGUkMSxcclxuXHRcdGludmVyc2U6IGludmVyc2UkMSxcclxuXHRcdG5vcm1hbGl6ZTogbm9ybWFsaXplJDEsXHJcblx0XHRkb3Q6IGRvdCQxLFxyXG5cdFx0Y3Jvc3M6IGNyb3NzJDEsXHJcblx0XHRsZXJwOiBsZXJwJDEsXHJcblx0XHRyYW5kb206IHJhbmRvbSQxLFxyXG5cdFx0dHJhbnNmb3JtTWF0NDogdHJhbnNmb3JtTWF0NCQxLFxyXG5cdFx0dHJhbnNmb3JtUXVhdDogdHJhbnNmb3JtUXVhdCQxLFxyXG5cdFx0emVybzogemVybyQxLFxyXG5cdFx0c3RyOiBzdHIkNSxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQ1LFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkNixcclxuXHRcdHN1Yjogc3ViJDUsXHJcblx0XHRtdWw6IG11bCQ1LFxyXG5cdFx0ZGl2OiBkaXYkMSxcclxuXHRcdGRpc3Q6IGRpc3QkMSxcclxuXHRcdHNxckRpc3Q6IHNxckRpc3QkMSxcclxuXHRcdGxlbjogbGVuJDEsXHJcblx0XHRzcXJMZW46IHNxckxlbiQxLFxyXG5cdFx0Zm9yRWFjaDogZm9yRWFjaCQxLFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIFF1YXRlcm5pb25cclxuXHQgKiBAbW9kdWxlIHF1YXRcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkNigpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg0KVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMF0gPSAwXHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQ0KG91dCkge1xyXG5cdFx0b3V0WzBdID0gMFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcclxuXHQgKiB0aGVuIHJldHVybnMgaXQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgYXJvdW5kIHdoaWNoIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXRBeGlzQW5nbGUob3V0LCBheGlzLCByYWQpIHtcclxuXHRcdHJhZCA9IHJhZCAqIDAuNVxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHRvdXRbMF0gPSBzICogYXhpc1swXVxyXG5cdFx0b3V0WzFdID0gcyAqIGF4aXNbMV1cclxuXHRcdG91dFsyXSA9IHMgKiBheGlzWzJdXHJcblx0XHRvdXRbM10gPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIHJvdGF0aW9uIGF4aXMgYW5kIGFuZ2xlIGZvciBhIGdpdmVuXHJcblx0ICogIHF1YXRlcm5pb24uIElmIGEgcXVhdGVybmlvbiBpcyBjcmVhdGVkIHdpdGhcclxuXHQgKiAgc2V0QXhpc0FuZ2xlLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgc2FtZVxyXG5cdCAqICB2YWx1ZXMgYXMgcHJvdmlkaWVkIGluIHRoZSBvcmlnaW5hbCBwYXJhbWV0ZXIgbGlzdFxyXG5cdCAqICBPUiBmdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB2YWx1ZXMuXHJcblx0ICogRXhhbXBsZTogVGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5IGF4aXMgWzAsIDAsIDFdIGFuZFxyXG5cdCAqICBhbmdsZSAtOTAgaXMgdGhlIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5XHJcblx0ICogIFswLCAwLCAxXSBhbmQgMjcwLiBUaGlzIG1ldGhvZCBmYXZvcnMgdGhlIGxhdHRlci5cclxuXHQgKiBAcGFyYW0gIHt2ZWMzfSBvdXRfYXhpcyAgVmVjdG9yIHJlY2VpdmluZyB0aGUgYXhpcyBvZiByb3RhdGlvblxyXG5cdCAqIEBwYXJhbSAge3F1YXR9IHEgICAgIFF1YXRlcm5pb24gdG8gYmUgZGVjb21wb3NlZFxyXG5cdCAqIEByZXR1cm4ge051bWJlcn0gICAgIEFuZ2xlLCBpbiByYWRpYW5zLCBvZiB0aGUgcm90YXRpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0QXhpc0FuZ2xlKG91dF9heGlzLCBxKSB7XHJcblx0XHR2YXIgcmFkID0gTWF0aC5hY29zKHFbM10pICogMi4wXHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZCAvIDIuMClcclxuXHJcblx0XHRpZiAocyA+IEVQU0lMT04pIHtcclxuXHRcdFx0b3V0X2F4aXNbMF0gPSBxWzBdIC8gc1xyXG5cdFx0XHRvdXRfYXhpc1sxXSA9IHFbMV0gLyBzXHJcblx0XHRcdG91dF9heGlzWzJdID0gcVsyXSAvIHNcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIElmIHMgaXMgemVybywgcmV0dXJuIGFueSBheGlzIChubyByb3RhdGlvbiAtIGF4aXMgZG9lcyBub3QgbWF0dGVyKVxyXG5cdFx0XHRvdXRfYXhpc1swXSA9IDFcclxuXHRcdFx0b3V0X2F4aXNbMV0gPSAwXHJcblx0XHRcdG91dF9heGlzWzJdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByYWRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQ2KG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0dmFyIGJ4ID0gYlswXSxcclxuXHRcdFx0YnkgPSBiWzFdLFxyXG5cdFx0XHRieiA9IGJbMl0sXHJcblx0XHRcdGJ3ID0gYlszXVxyXG5cdFx0b3V0WzBdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieVxyXG5cdFx0b3V0WzFdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBielxyXG5cdFx0b3V0WzJdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieFxyXG5cdFx0b3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFggYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWCQyKG91dCwgYSwgcmFkKSB7XHJcblx0XHRyYWQgKj0gMC41XHJcblx0XHR2YXIgYXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXSxcclxuXHRcdFx0YXcgPSBhWzNdXHJcblx0XHR2YXIgYnggPSBNYXRoLnNpbihyYWQpLFxyXG5cdFx0XHRidyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4XHJcblx0XHRvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieFxyXG5cdFx0b3V0WzJdID0gYXogKiBidyAtIGF5ICogYnhcclxuXHRcdG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWSBheGlzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVZJDIob3V0LCBhLCByYWQpIHtcclxuXHRcdHJhZCAqPSAwLjVcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdLFxyXG5cdFx0XHRhdyA9IGFbM11cclxuXHRcdHZhciBieSA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGJ3ID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gYXggKiBidyAtIGF6ICogYnlcclxuXHRcdG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5XHJcblx0XHRvdXRbMl0gPSBheiAqIGJ3ICsgYXggKiBieVxyXG5cdFx0b3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVokMihvdXQsIGEsIHJhZCkge1xyXG5cdFx0cmFkICo9IDAuNVxyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0dmFyIGJ6ID0gTWF0aC5zaW4ocmFkKSxcclxuXHRcdFx0YncgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBheCAqIGJ3ICsgYXkgKiBielxyXG5cdFx0b3V0WzFdID0gYXkgKiBidyAtIGF4ICogYnpcclxuXHRcdG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6XHJcblx0XHRvdXRbM10gPSBhdyAqIGJ3IC0gYXogKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBXIGNvbXBvbmVudCBvZiBhIHF1YXQgZnJvbSB0aGUgWCwgWSwgYW5kIFogY29tcG9uZW50cy5cclxuXHQgKiBBc3N1bWVzIHRoYXQgcXVhdGVybmlvbiBpcyAxIHVuaXQgaW4gbGVuZ3RoLlxyXG5cdCAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNhbGN1bGF0ZVcob3V0LCBhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXVxyXG5cdFx0b3V0WzBdID0geFxyXG5cdFx0b3V0WzFdID0geVxyXG5cdFx0b3V0WzJdID0gelxyXG5cdFx0b3V0WzNdID0gTWF0aC5zcXJ0KE1hdGguYWJzKDEuMCAtIHggKiB4IC0geSAqIHkgLSB6ICogeikpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzbGVycChvdXQsIGEsIGIsIHQpIHtcclxuXHRcdC8vIGJlbmNobWFya3M6XHJcblx0XHQvLyAgICBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXNsZXJwLWltcGxlbWVudGF0aW9uc1xyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0dmFyIGJ4ID0gYlswXSxcclxuXHRcdFx0YnkgPSBiWzFdLFxyXG5cdFx0XHRieiA9IGJbMl0sXHJcblx0XHRcdGJ3ID0gYlszXVxyXG5cdFx0dmFyIG9tZWdhLCBjb3NvbSwgc2lub20sIHNjYWxlMCwgc2NhbGUxIC8vIGNhbGMgY29zaW5lXHJcblxyXG5cdFx0Y29zb20gPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3IC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxyXG5cclxuXHRcdGlmIChjb3NvbSA8IDAuMCkge1xyXG5cdFx0XHRjb3NvbSA9IC1jb3NvbVxyXG5cdFx0XHRieCA9IC1ieFxyXG5cdFx0XHRieSA9IC1ieVxyXG5cdFx0XHRieiA9IC1ielxyXG5cdFx0XHRidyA9IC1id1xyXG5cdFx0fSAvLyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXHJcblxyXG5cdFx0aWYgKDEuMCAtIGNvc29tID4gRVBTSUxPTikge1xyXG5cdFx0XHQvLyBzdGFuZGFyZCBjYXNlIChzbGVycClcclxuXHRcdFx0b21lZ2EgPSBNYXRoLmFjb3MoY29zb20pXHJcblx0XHRcdHNpbm9tID0gTWF0aC5zaW4ob21lZ2EpXHJcblx0XHRcdHNjYWxlMCA9IE1hdGguc2luKCgxLjAgLSB0KSAqIG9tZWdhKSAvIHNpbm9tXHJcblx0XHRcdHNjYWxlMSA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gXCJmcm9tXCIgYW5kIFwidG9cIiBxdWF0ZXJuaW9ucyBhcmUgdmVyeSBjbG9zZVxyXG5cdFx0XHQvLyAgLi4uIHNvIHdlIGNhbiBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uXHJcblx0XHRcdHNjYWxlMCA9IDEuMCAtIHRcclxuXHRcdFx0c2NhbGUxID0gdFxyXG5cdFx0fSAvLyBjYWxjdWxhdGUgZmluYWwgdmFsdWVzXHJcblxyXG5cdFx0b3V0WzBdID0gc2NhbGUwICogYXggKyBzY2FsZTEgKiBieFxyXG5cdFx0b3V0WzFdID0gc2NhbGUwICogYXkgKyBzY2FsZTEgKiBieVxyXG5cdFx0b3V0WzJdID0gc2NhbGUwICogYXogKyBzY2FsZTEgKiBielxyXG5cdFx0b3V0WzNdID0gc2NhbGUwICogYXcgKyBzY2FsZTEgKiBid1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSByYW5kb20gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByYW5kb20kMihvdXQpIHtcclxuXHRcdC8vIEltcGxlbWVudGF0aW9uIG9mIGh0dHA6Ly9wbGFubmluZy5jcy51aXVjLmVkdS9ub2RlMTk4Lmh0bWxcclxuXHRcdC8vIFRPRE86IENhbGxpbmcgcmFuZG9tIDMgdGltZXMgaXMgcHJvYmFibHkgbm90IHRoZSBmYXN0ZXN0IHNvbHV0aW9uXHJcblx0XHR2YXIgdTEgPSBSQU5ET00oKVxyXG5cdFx0dmFyIHUyID0gUkFORE9NKClcclxuXHRcdHZhciB1MyA9IFJBTkRPTSgpXHJcblx0XHR2YXIgc3FydDFNaW51c1UxID0gTWF0aC5zcXJ0KDEgLSB1MSlcclxuXHRcdHZhciBzcXJ0VTEgPSBNYXRoLnNxcnQodTEpXHJcblx0XHRvdXRbMF0gPSBzcXJ0MU1pbnVzVTEgKiBNYXRoLnNpbigyLjAgKiBNYXRoLlBJICogdTIpXHJcblx0XHRvdXRbMV0gPSBzcXJ0MU1pbnVzVTEgKiBNYXRoLmNvcygyLjAgKiBNYXRoLlBJICogdTIpXHJcblx0XHRvdXRbMl0gPSBzcXJ0VTEgKiBNYXRoLnNpbigyLjAgKiBNYXRoLlBJICogdTMpXHJcblx0XHRvdXRbM10gPSBzcXJ0VTEgKiBNYXRoLmNvcygyLjAgKiBNYXRoLlBJICogdTMpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJ0JDQob3V0LCBhKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgZG90JCQxID0gYTAgKiBhMCArIGExICogYTEgKyBhMiAqIGEyICsgYTMgKiBhM1xyXG5cdFx0dmFyIGludkRvdCA9IGRvdCQkMSA/IDEuMCAvIGRvdCQkMSA6IDAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcclxuXHJcblx0XHRvdXRbMF0gPSAtYTAgKiBpbnZEb3RcclxuXHRcdG91dFsxXSA9IC1hMSAqIGludkRvdFxyXG5cdFx0b3V0WzJdID0gLWEyICogaW52RG90XHJcblx0XHRvdXRbM10gPSBhMyAqIGludkRvdFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBjb25qdWdhdGUgb2YgYSBxdWF0XHJcblx0ICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IC1hWzBdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0b3V0WzJdID0gLWFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cclxuXHQgKlxyXG5cdCAqIE5PVEU6IFRoZSByZXN1bHRhbnQgcXVhdGVybmlvbiBpcyBub3Qgbm9ybWFsaXplZCwgc28geW91IHNob3VsZCBiZSBzdXJlXHJcblx0ICogdG8gcmVub3JtYWxpemUgdGhlIHF1YXRlcm5pb24geW91cnNlbGYgd2hlcmUgbmVjZXNzYXJ5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHttYXQzfSBtIHJvdGF0aW9uIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbU1hdDMob3V0LCBtKSB7XHJcblx0XHQvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xyXG5cdFx0Ly8gYXJ0aWNsZSBcIlF1YXRlcm5pb24gQ2FsY3VsdXMgYW5kIEZhc3QgQW5pbWF0aW9uXCIuXHJcblx0XHR2YXIgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdXHJcblx0XHR2YXIgZlJvb3RcclxuXHJcblx0XHRpZiAoZlRyYWNlID4gMC4wKSB7XHJcblx0XHRcdC8vIHx3fCA+IDEvMiwgbWF5IGFzIHdlbGwgY2hvb3NlIHcgPiAxLzJcclxuXHRcdFx0ZlJvb3QgPSBNYXRoLnNxcnQoZlRyYWNlICsgMS4wKSAvLyAyd1xyXG5cclxuXHRcdFx0b3V0WzNdID0gMC41ICogZlJvb3RcclxuXHRcdFx0ZlJvb3QgPSAwLjUgLyBmUm9vdCAvLyAxLyg0dylcclxuXHJcblx0XHRcdG91dFswXSA9IChtWzVdIC0gbVs3XSkgKiBmUm9vdFxyXG5cdFx0XHRvdXRbMV0gPSAobVs2XSAtIG1bMl0pICogZlJvb3RcclxuXHRcdFx0b3V0WzJdID0gKG1bMV0gLSBtWzNdKSAqIGZSb290XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB8d3wgPD0gMS8yXHJcblx0XHRcdHZhciBpID0gMFxyXG5cdFx0XHRpZiAobVs0XSA+IG1bMF0pIGkgPSAxXHJcblx0XHRcdGlmIChtWzhdID4gbVtpICogMyArIGldKSBpID0gMlxyXG5cdFx0XHR2YXIgaiA9IChpICsgMSkgJSAzXHJcblx0XHRcdHZhciBrID0gKGkgKyAyKSAlIDNcclxuXHRcdFx0ZlJvb3QgPSBNYXRoLnNxcnQobVtpICogMyArIGldIC0gbVtqICogMyArIGpdIC0gbVtrICogMyArIGtdICsgMS4wKVxyXG5cdFx0XHRvdXRbaV0gPSAwLjUgKiBmUm9vdFxyXG5cdFx0XHRmUm9vdCA9IDAuNSAvIGZSb290XHJcblx0XHRcdG91dFszXSA9IChtW2ogKiAzICsga10gLSBtW2sgKiAzICsgal0pICogZlJvb3RcclxuXHRcdFx0b3V0W2pdID0gKG1baiAqIDMgKyBpXSArIG1baSAqIDMgKyBqXSkgKiBmUm9vdFxyXG5cdFx0XHRvdXRba10gPSAobVtrICogMyArIGldICsgbVtpICogMyArIGtdKSAqIGZSb290XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiBldWxlciBhbmdsZSB4LCB5LCB6LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt4fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFggYXhpcyBpbiBkZWdyZWVzLlxyXG5cdCAqIEBwYXJhbSB7eX0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBZIGF4aXMgaW4gZGVncmVlcy5cclxuXHQgKiBAcGFyYW0ge3p9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWiBheGlzIGluIGRlZ3JlZXMuXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tRXVsZXIob3V0LCB4LCB5LCB6KSB7XHJcblx0XHR2YXIgaGFsZlRvUmFkID0gKDAuNSAqIE1hdGguUEkpIC8gMTgwLjBcclxuXHRcdHggKj0gaGFsZlRvUmFkXHJcblx0XHR5ICo9IGhhbGZUb1JhZFxyXG5cdFx0eiAqPSBoYWxmVG9SYWRcclxuXHRcdHZhciBzeCA9IE1hdGguc2luKHgpXHJcblx0XHR2YXIgY3ggPSBNYXRoLmNvcyh4KVxyXG5cdFx0dmFyIHN5ID0gTWF0aC5zaW4oeSlcclxuXHRcdHZhciBjeSA9IE1hdGguY29zKHkpXHJcblx0XHR2YXIgc3ogPSBNYXRoLnNpbih6KVxyXG5cdFx0dmFyIGN6ID0gTWF0aC5jb3MoeilcclxuXHRcdG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzelxyXG5cdFx0b3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6XHJcblx0XHRvdXRbMl0gPSBjeCAqIGN5ICogc3ogLSBzeCAqIHN5ICogY3pcclxuXHRcdG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzelxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcXVhdGVuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ2KGEpIHtcclxuXHRcdHJldHVybiAncXVhdCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBjbG9uZSQ2ID0gY2xvbmUkNVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGZyb21WYWx1ZXMkNiA9IGZyb21WYWx1ZXMkNVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBjb3B5JDYgPSBjb3B5JDVcclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc2V0JDYgPSBzZXQkNVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHF1YXQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGFkZCQ2ID0gYWRkJDVcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkNiA9IG11bHRpcGx5JDZcclxuXHQvKipcclxuXHQgKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc2NhbGUkNiA9IHNjYWxlJDVcclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZG90JDIgPSBkb3QkMVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlcnAkMiA9IGxlcnAkMVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW5ndGgkMiA9IGxlbmd0aCQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbiQyID0gbGVuZ3RoJDJcclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3F1YXJlZExlbmd0aCQyID0gc3F1YXJlZExlbmd0aCQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBxdWF0LnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4kMiA9IHNxdWFyZWRMZW5ndGgkMlxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG5vcm1hbGl6ZSQyID0gbm9ybWFsaXplJDFcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgVGhlIGZpcnN0IHF1YXRlcm5pb24uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIFRoZSBzZWNvbmQgcXVhdGVybmlvbi5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0dmFyIGV4YWN0RXF1YWxzJDYgPSBleGFjdEVxdWFscyQ1XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcXVhdGVybmlvbnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZXF1YWxzJDcgPSBlcXVhbHMkNlxyXG5cdC8qKlxyXG5cdCAqIFNldHMgYSBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCB0aGUgc2hvcnRlc3Qgcm90YXRpb24gZnJvbSBvbmVcclxuXHQgKiB2ZWN0b3IgdG8gYW5vdGhlci5cclxuXHQgKlxyXG5cdCAqIEJvdGggdmVjdG9ycyBhcmUgYXNzdW1lZCB0byBiZSB1bml0IGxlbmd0aC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvbi5cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGluaXRpYWwgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBkZXN0aW5hdGlvbiB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdHZhciByb3RhdGlvblRvID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHRtcHZlYzMgPSBjcmVhdGUkNCgpXHJcblx0XHR2YXIgeFVuaXRWZWMzID0gZnJvbVZhbHVlcyQ0KDEsIDAsIDApXHJcblx0XHR2YXIgeVVuaXRWZWMzID0gZnJvbVZhbHVlcyQ0KDAsIDEsIDApXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XHJcblx0XHRcdHZhciBkb3QkJDEgPSBkb3QoYSwgYilcclxuXHJcblx0XHRcdGlmIChkb3QkJDEgPCAtMC45OTk5OTkpIHtcclxuXHRcdFx0XHRjcm9zcyh0bXB2ZWMzLCB4VW5pdFZlYzMsIGEpXHJcblx0XHRcdFx0aWYgKGxlbih0bXB2ZWMzKSA8IDAuMDAwMDAxKSBjcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpXHJcblx0XHRcdFx0bm9ybWFsaXplKHRtcHZlYzMsIHRtcHZlYzMpXHJcblx0XHRcdFx0c2V0QXhpc0FuZ2xlKG91dCwgdG1wdmVjMywgTWF0aC5QSSlcclxuXHRcdFx0XHRyZXR1cm4gb3V0XHJcblx0XHRcdH0gZWxzZSBpZiAoZG90JCQxID4gMC45OTk5OTkpIHtcclxuXHRcdFx0XHRvdXRbMF0gPSAwXHJcblx0XHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRcdG91dFsyXSA9IDBcclxuXHRcdFx0XHRvdXRbM10gPSAxXHJcblx0XHRcdFx0cmV0dXJuIG91dFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNyb3NzKHRtcHZlYzMsIGEsIGIpXHJcblx0XHRcdFx0b3V0WzBdID0gdG1wdmVjM1swXVxyXG5cdFx0XHRcdG91dFsxXSA9IHRtcHZlYzNbMV1cclxuXHRcdFx0XHRvdXRbMl0gPSB0bXB2ZWMzWzJdXHJcblx0XHRcdFx0b3V0WzNdID0gMSArIGRvdCQkMVxyXG5cdFx0XHRcdHJldHVybiBub3JtYWxpemUkMihvdXQsIG91dClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pKClcclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gZCB0aGUgZm91cnRoIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FsZXJwID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHRlbXAxID0gY3JlYXRlJDYoKVxyXG5cdFx0dmFyIHRlbXAyID0gY3JlYXRlJDYoKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG91dCwgYSwgYiwgYywgZCwgdCkge1xyXG5cdFx0XHRzbGVycCh0ZW1wMSwgYSwgZCwgdClcclxuXHRcdFx0c2xlcnAodGVtcDIsIGIsIGMsIHQpXHJcblx0XHRcdHNsZXJwKG91dCwgdGVtcDEsIHRlbXAyLCAyICogdCAqICgxIC0gdCkpXHJcblx0XHRcdHJldHVybiBvdXRcclxuXHRcdH1cclxuXHR9KSgpXHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgc3BlY2lmaWVkIHF1YXRlcm5pb24gd2l0aCB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW5cclxuXHQgKiBheGVzLiBFYWNoIGF4aXMgaXMgYSB2ZWMzIGFuZCBpcyBleHBlY3RlZCB0byBiZSB1bml0IGxlbmd0aCBhbmRcclxuXHQgKiBwZXJwZW5kaWN1bGFyIHRvIGFsbCBvdGhlciBzcGVjaWZpZWQgYXhlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdmlldyAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHZpZXdpbmcgZGlyZWN0aW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSByaWdodCB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJyaWdodFwiIGRpcmVjdGlvblxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdXAgICAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwidXBcIiBkaXJlY3Rpb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdHZhciBzZXRBeGVzID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG1hdHIgPSBjcmVhdGUkMigpXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24ob3V0LCB2aWV3LCByaWdodCwgdXApIHtcclxuXHRcdFx0bWF0clswXSA9IHJpZ2h0WzBdXHJcblx0XHRcdG1hdHJbM10gPSByaWdodFsxXVxyXG5cdFx0XHRtYXRyWzZdID0gcmlnaHRbMl1cclxuXHRcdFx0bWF0clsxXSA9IHVwWzBdXHJcblx0XHRcdG1hdHJbNF0gPSB1cFsxXVxyXG5cdFx0XHRtYXRyWzddID0gdXBbMl1cclxuXHRcdFx0bWF0clsyXSA9IC12aWV3WzBdXHJcblx0XHRcdG1hdHJbNV0gPSAtdmlld1sxXVxyXG5cdFx0XHRtYXRyWzhdID0gLXZpZXdbMl1cclxuXHRcdFx0cmV0dXJuIG5vcm1hbGl6ZSQyKG91dCwgZnJvbU1hdDMob3V0LCBtYXRyKSlcclxuXHRcdH1cclxuXHR9KSgpXHJcblxyXG5cdHZhciBxdWF0ID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDYsXHJcblx0XHRpZGVudGl0eTogaWRlbnRpdHkkNCxcclxuXHRcdHNldEF4aXNBbmdsZTogc2V0QXhpc0FuZ2xlLFxyXG5cdFx0Z2V0QXhpc0FuZ2xlOiBnZXRBeGlzQW5nbGUsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkNixcclxuXHRcdHJvdGF0ZVg6IHJvdGF0ZVgkMixcclxuXHRcdHJvdGF0ZVk6IHJvdGF0ZVkkMixcclxuXHRcdHJvdGF0ZVo6IHJvdGF0ZVokMixcclxuXHRcdGNhbGN1bGF0ZVc6IGNhbGN1bGF0ZVcsXHJcblx0XHRzbGVycDogc2xlcnAsXHJcblx0XHRyYW5kb206IHJhbmRvbSQyLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkNCxcclxuXHRcdGNvbmp1Z2F0ZTogY29uanVnYXRlLFxyXG5cdFx0ZnJvbU1hdDM6IGZyb21NYXQzLFxyXG5cdFx0ZnJvbUV1bGVyOiBmcm9tRXVsZXIsXHJcblx0XHRzdHI6IHN0ciQ2LFxyXG5cdFx0Y2xvbmU6IGNsb25lJDYsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDYsXHJcblx0XHRjb3B5OiBjb3B5JDYsXHJcblx0XHRzZXQ6IHNldCQ2LFxyXG5cdFx0YWRkOiBhZGQkNixcclxuXHRcdG11bDogbXVsJDYsXHJcblx0XHRzY2FsZTogc2NhbGUkNixcclxuXHRcdGRvdDogZG90JDIsXHJcblx0XHRsZXJwOiBsZXJwJDIsXHJcblx0XHRsZW5ndGg6IGxlbmd0aCQyLFxyXG5cdFx0bGVuOiBsZW4kMixcclxuXHRcdHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGgkMixcclxuXHRcdHNxckxlbjogc3FyTGVuJDIsXHJcblx0XHRub3JtYWxpemU6IG5vcm1hbGl6ZSQyLFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDYsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQ3LFxyXG5cdFx0cm90YXRpb25Ubzogcm90YXRpb25UbyxcclxuXHRcdHNxbGVycDogc3FsZXJwLFxyXG5cdFx0c2V0QXhlczogc2V0QXhlcyxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiBEdWFsIFF1YXRlcm5pb248YnI+XHJcblx0ICogRm9ybWF0OiBbcmVhbCwgZHVhbF08YnI+XHJcblx0ICogUXVhdGVybmlvbiBmb3JtYXQ6IFhZWlc8YnI+XHJcblx0ICogTWFrZSBzdXJlIHRvIGhhdmUgbm9ybWFsaXplZCBkdWFsIHF1YXRlcm5pb25zLCBvdGhlcndpc2UgdGhlIGZ1bmN0aW9ucyBtYXkgbm90IHdvcmsgYXMgaW50ZW5kZWQuPGJyPlxyXG5cdCAqIEBtb2R1bGUgcXVhdDJcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBkdWFsIHF1YXRcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gYSBuZXcgZHVhbCBxdWF0ZXJuaW9uIFtyZWFsIC0+IHJvdGF0aW9uLCBkdWFsIC0+IHRyYW5zbGF0aW9uXVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkNygpIHtcclxuXHRcdHZhciBkcSA9IG5ldyBBUlJBWV9UWVBFKDgpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdGRxWzBdID0gMFxyXG5cdFx0XHRkcVsxXSA9IDBcclxuXHRcdFx0ZHFbMl0gPSAwXHJcblx0XHRcdGRxWzRdID0gMFxyXG5cdFx0XHRkcVs1XSA9IDBcclxuXHRcdFx0ZHFbNl0gPSAwXHJcblx0XHRcdGRxWzddID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdGRxWzNdID0gMVxyXG5cdFx0cmV0dXJuIGRxXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBuZXcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDcoYSkge1xyXG5cdFx0dmFyIGRxID0gbmV3IEFSUkFZX1RZUEUoOClcclxuXHRcdGRxWzBdID0gYVswXVxyXG5cdFx0ZHFbMV0gPSBhWzFdXHJcblx0XHRkcVsyXSA9IGFbMl1cclxuXHRcdGRxWzNdID0gYVszXVxyXG5cdFx0ZHFbNF0gPSBhWzRdXHJcblx0XHRkcVs1XSA9IGFbNV1cclxuXHRcdGRxWzZdID0gYVs2XVxyXG5cdFx0ZHFbN10gPSBhWzddXHJcblx0XHRyZXR1cm4gZHFcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBkdWFsIHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geDEgWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTEgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gejEgWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdzEgVyBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geDIgWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gejIgWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdzIgVyBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG5ldyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyQ3KHgxLCB5MSwgejEsIHcxLCB4MiwgeTIsIHoyLCB3Mikge1xyXG5cdFx0dmFyIGRxID0gbmV3IEFSUkFZX1RZUEUoOClcclxuXHRcdGRxWzBdID0geDFcclxuXHRcdGRxWzFdID0geTFcclxuXHRcdGRxWzJdID0gejFcclxuXHRcdGRxWzNdID0gdzFcclxuXHRcdGRxWzRdID0geDJcclxuXHRcdGRxWzVdID0geTJcclxuXHRcdGRxWzZdID0gejJcclxuXHRcdGRxWzddID0gdzJcclxuXHRcdHJldHVybiBkcVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGR1YWwgcXVhdCBmcm9tIHRoZSBnaXZlbiB2YWx1ZXMgKHF1YXQgYW5kIHRyYW5zbGF0aW9uKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHgxIFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkxIFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcxIFcgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHgyIFggY29tcG9uZW50ICh0cmFuc2xhdGlvbilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnQgKHRyYW5zbGF0aW9uKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MiBaIGNvbXBvbmVudCAodHJhbnNsYXRpb24pXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBuZXcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uVmFsdWVzKHgxLCB5MSwgejEsIHcxLCB4MiwgeTIsIHoyKSB7XHJcblx0XHR2YXIgZHEgPSBuZXcgQVJSQVlfVFlQRSg4KVxyXG5cdFx0ZHFbMF0gPSB4MVxyXG5cdFx0ZHFbMV0gPSB5MVxyXG5cdFx0ZHFbMl0gPSB6MVxyXG5cdFx0ZHFbM10gPSB3MVxyXG5cdFx0dmFyIGF4ID0geDIgKiAwLjUsXHJcblx0XHRcdGF5ID0geTIgKiAwLjUsXHJcblx0XHRcdGF6ID0gejIgKiAwLjVcclxuXHRcdGRxWzRdID0gYXggKiB3MSArIGF5ICogejEgLSBheiAqIHkxXHJcblx0XHRkcVs1XSA9IGF5ICogdzEgKyBheiAqIHgxIC0gYXggKiB6MVxyXG5cdFx0ZHFbNl0gPSBheiAqIHcxICsgYXggKiB5MSAtIGF5ICogeDFcclxuXHRcdGRxWzddID0gLWF4ICogeDEgLSBheSAqIHkxIC0gYXogKiB6MVxyXG5cdFx0cmV0dXJuIGRxXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHF1YXRlcm5pb24gYW5kIGEgdHJhbnNsYXRpb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB0IHRyYW5sYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24kMShvdXQsIHEsIHQpIHtcclxuXHRcdHZhciBheCA9IHRbMF0gKiAwLjUsXHJcblx0XHRcdGF5ID0gdFsxXSAqIDAuNSxcclxuXHRcdFx0YXogPSB0WzJdICogMC41LFxyXG5cdFx0XHRieCA9IHFbMF0sXHJcblx0XHRcdGJ5ID0gcVsxXSxcclxuXHRcdFx0YnogPSBxWzJdLFxyXG5cdFx0XHRidyA9IHFbM11cclxuXHRcdG91dFswXSA9IGJ4XHJcblx0XHRvdXRbMV0gPSBieVxyXG5cdFx0b3V0WzJdID0gYnpcclxuXHRcdG91dFszXSA9IGJ3XHJcblx0XHRvdXRbNF0gPSBheCAqIGJ3ICsgYXkgKiBieiAtIGF6ICogYnlcclxuXHRcdG91dFs1XSA9IGF5ICogYncgKyBheiAqIGJ4IC0gYXggKiBielxyXG5cdFx0b3V0WzZdID0gYXogKiBidyArIGF4ICogYnkgLSBheSAqIGJ4XHJcblx0XHRvdXRbN10gPSAtYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHRyYW5zbGF0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHQgdHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uJDMob3V0LCB0KSB7XHJcblx0XHRvdXRbMF0gPSAwXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRvdXRbNF0gPSB0WzBdICogMC41XHJcblx0XHRvdXRbNV0gPSB0WzFdICogMC41XHJcblx0XHRvdXRbNl0gPSB0WzJdICogMC41XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSB0aGUgcXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvbiQ0KG91dCwgcSkge1xyXG5cdFx0b3V0WzBdID0gcVswXVxyXG5cdFx0b3V0WzFdID0gcVsxXVxyXG5cdFx0b3V0WzJdID0gcVsyXVxyXG5cdFx0b3V0WzNdID0gcVszXVxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGR1YWwgcXVhdCBmcm9tIGEgbWF0cml4ICg0eDQpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBkdWFsIHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbU1hdDQkMShvdXQsIGEpIHtcclxuXHRcdC8vVE9ETyBPcHRpbWl6ZSB0aGlzXHJcblx0XHR2YXIgb3V0ZXIgPSBjcmVhdGUkNigpXHJcblx0XHRnZXRSb3RhdGlvbihvdXRlciwgYSlcclxuXHRcdHZhciB0ID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHRcdGdldFRyYW5zbGF0aW9uKHQsIGEpXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvbiQxKG91dCwgb3V0ZXIsIHQpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBkdWFsIHF1YXQgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgc291cmNlIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkNyhvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdG91dFs2XSA9IGFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IGEgZHVhbCBxdWF0IHRvIHRoZSBpZGVudGl0eSBkdWFsIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQ1KG91dCkge1xyXG5cdFx0b3V0WzBdID0gMFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBkdWFsIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4MSBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MSBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3MSBXIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5MiBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3MiBXIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldCQ3KG91dCwgeDEsIHkxLCB6MSwgdzEsIHgyLCB5MiwgejIsIHcyKSB7XHJcblx0XHRvdXRbMF0gPSB4MVxyXG5cdFx0b3V0WzFdID0geTFcclxuXHRcdG91dFsyXSA9IHoxXHJcblx0XHRvdXRbM10gPSB3MVxyXG5cdFx0b3V0WzRdID0geDJcclxuXHRcdG91dFs1XSA9IHkyXHJcblx0XHRvdXRbNl0gPSB6MlxyXG5cdFx0b3V0WzddID0gdzJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcmVhbCBwYXJ0IG9mIGEgZHVhbCBxdWF0XHJcblx0ICogQHBhcmFtICB7cXVhdH0gb3V0IHJlYWwgcGFydFxyXG5cdCAqIEBwYXJhbSAge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm4ge3F1YXR9IHJlYWwgcGFydFxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZ2V0UmVhbCA9IGNvcHkkNlxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIGR1YWwgcGFydCBvZiBhIGR1YWwgcXVhdFxyXG5cdCAqIEBwYXJhbSAge3F1YXR9IG91dCBkdWFsIHBhcnRcclxuXHQgKiBAcGFyYW0gIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJuIHtxdWF0fSBkdWFsIHBhcnRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0RHVhbChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbNF1cclxuXHRcdG91dFsxXSA9IGFbNV1cclxuXHRcdG91dFsyXSA9IGFbNl1cclxuXHRcdG91dFszXSA9IGFbN11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSByZWFsIGNvbXBvbmVudCBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByZWFsIHBhcnRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc2V0UmVhbCA9IGNvcHkkNlxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZHVhbCBjb21wb25lbnQgb2YgYSBkdWFsIHF1YXQgdG8gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgZHVhbCBwYXJ0XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0RHVhbChvdXQsIHEpIHtcclxuXHRcdG91dFs0XSA9IHFbMF1cclxuXHRcdG91dFs1XSA9IHFbMV1cclxuXHRcdG91dFs2XSA9IHFbMl1cclxuXHRcdG91dFs3XSA9IHFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgdHJhbnNsYXRpb24gb2YgYSBub3JtYWxpemVkIGR1YWwgcXVhdFxyXG5cdCAqIEBwYXJhbSAge3ZlYzN9IG91dCB0cmFuc2xhdGlvblxyXG5cdCAqIEBwYXJhbSAge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvbiB0byBiZSBkZWNvbXBvc2VkXHJcblx0ICogQHJldHVybiB7dmVjM30gdHJhbnNsYXRpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24kMShvdXQsIGEpIHtcclxuXHRcdHZhciBheCA9IGFbNF0sXHJcblx0XHRcdGF5ID0gYVs1XSxcclxuXHRcdFx0YXogPSBhWzZdLFxyXG5cdFx0XHRhdyA9IGFbN10sXHJcblx0XHRcdGJ4ID0gLWFbMF0sXHJcblx0XHRcdGJ5ID0gLWFbMV0sXHJcblx0XHRcdGJ6ID0gLWFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXVxyXG5cdFx0b3V0WzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMlxyXG5cdFx0b3V0WzFdID0gKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMlxyXG5cdFx0b3V0WzJdID0gKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2xhdGVzIGEgZHVhbCBxdWF0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byB0cmFuc2xhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zbGF0ZSQzKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGF4MSA9IGFbMF0sXHJcblx0XHRcdGF5MSA9IGFbMV0sXHJcblx0XHRcdGF6MSA9IGFbMl0sXHJcblx0XHRcdGF3MSA9IGFbM10sXHJcblx0XHRcdGJ4MSA9IHZbMF0gKiAwLjUsXHJcblx0XHRcdGJ5MSA9IHZbMV0gKiAwLjUsXHJcblx0XHRcdGJ6MSA9IHZbMl0gKiAwLjUsXHJcblx0XHRcdGF4MiA9IGFbNF0sXHJcblx0XHRcdGF5MiA9IGFbNV0sXHJcblx0XHRcdGF6MiA9IGFbNl0sXHJcblx0XHRcdGF3MiA9IGFbN11cclxuXHRcdG91dFswXSA9IGF4MVxyXG5cdFx0b3V0WzFdID0gYXkxXHJcblx0XHRvdXRbMl0gPSBhejFcclxuXHRcdG91dFszXSA9IGF3MVxyXG5cdFx0b3V0WzRdID0gYXcxICogYngxICsgYXkxICogYnoxIC0gYXoxICogYnkxICsgYXgyXHJcblx0XHRvdXRbNV0gPSBhdzEgKiBieTEgKyBhejEgKiBieDEgLSBheDEgKiBiejEgKyBheTJcclxuXHRcdG91dFs2XSA9IGF3MSAqIGJ6MSArIGF4MSAqIGJ5MSAtIGF5MSAqIGJ4MSArIGF6MlxyXG5cdFx0b3V0WzddID0gLWF4MSAqIGJ4MSAtIGF5MSAqIGJ5MSAtIGF6MSAqIGJ6MSArIGF3MlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCB0aGUgWCBheGlzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZCBob3cgZmFyIHNob3VsZCB0aGUgcm90YXRpb24gYmVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVYJDMob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBieCA9IC1hWzBdLFxyXG5cdFx0XHRieSA9IC1hWzFdLFxyXG5cdFx0XHRieiA9IC1hWzJdLFxyXG5cdFx0XHRidyA9IGFbM10sXHJcblx0XHRcdGF4ID0gYVs0XSxcclxuXHRcdFx0YXkgPSBhWzVdLFxyXG5cdFx0XHRheiA9IGFbNl0sXHJcblx0XHRcdGF3ID0gYVs3XSxcclxuXHRcdFx0YXgxID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSxcclxuXHRcdFx0YXkxID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieixcclxuXHRcdFx0YXoxID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCxcclxuXHRcdFx0YXcxID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBielxyXG5cdFx0cm90YXRlWCQyKG91dCwgYSwgcmFkKVxyXG5cdFx0YnggPSBvdXRbMF1cclxuXHRcdGJ5ID0gb3V0WzFdXHJcblx0XHRieiA9IG91dFsyXVxyXG5cdFx0YncgPSBvdXRbM11cclxuXHRcdG91dFs0XSA9IGF4MSAqIGJ3ICsgYXcxICogYnggKyBheTEgKiBieiAtIGF6MSAqIGJ5XHJcblx0XHRvdXRbNV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBielxyXG5cdFx0b3V0WzZdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYnhcclxuXHRcdG91dFs3XSA9IGF3MSAqIGJ3IC0gYXgxICogYnggLSBheTEgKiBieSAtIGF6MSAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYXJvdW5kIHRoZSBZIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmFkIGhvdyBmYXIgc2hvdWxkIHRoZSByb3RhdGlvbiBiZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVkkMyhvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGJ4ID0gLWFbMF0sXHJcblx0XHRcdGJ5ID0gLWFbMV0sXHJcblx0XHRcdGJ6ID0gLWFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXSxcclxuXHRcdFx0YXggPSBhWzRdLFxyXG5cdFx0XHRheSA9IGFbNV0sXHJcblx0XHRcdGF6ID0gYVs2XSxcclxuXHRcdFx0YXcgPSBhWzddLFxyXG5cdFx0XHRheDEgPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5LFxyXG5cdFx0XHRheTEgPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6LFxyXG5cdFx0XHRhejEgPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4LFxyXG5cdFx0XHRhdzEgPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6XHJcblx0XHRyb3RhdGVZJDIob3V0LCBhLCByYWQpXHJcblx0XHRieCA9IG91dFswXVxyXG5cdFx0YnkgPSBvdXRbMV1cclxuXHRcdGJ6ID0gb3V0WzJdXHJcblx0XHRidyA9IG91dFszXVxyXG5cdFx0b3V0WzRdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnlcclxuXHRcdG91dFs1XSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6XHJcblx0XHRvdXRbNl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieFxyXG5cdFx0b3V0WzddID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgdGhlIFogYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWQgaG93IGZhciBzaG91bGQgdGhlIHJvdGF0aW9uIGJlXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWiQzKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYnggPSAtYVswXSxcclxuXHRcdFx0YnkgPSAtYVsxXSxcclxuXHRcdFx0YnogPSAtYVsyXSxcclxuXHRcdFx0YncgPSBhWzNdLFxyXG5cdFx0XHRheCA9IGFbNF0sXHJcblx0XHRcdGF5ID0gYVs1XSxcclxuXHRcdFx0YXogPSBhWzZdLFxyXG5cdFx0XHRhdyA9IGFbN10sXHJcblx0XHRcdGF4MSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnksXHJcblx0XHRcdGF5MSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnosXHJcblx0XHRcdGF6MSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngsXHJcblx0XHRcdGF3MSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYnpcclxuXHRcdHJvdGF0ZVokMihvdXQsIGEsIHJhZClcclxuXHRcdGJ4ID0gb3V0WzBdXHJcblx0XHRieSA9IG91dFsxXVxyXG5cdFx0YnogPSBvdXRbMl1cclxuXHRcdGJ3ID0gb3V0WzNdXHJcblx0XHRvdXRbNF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieVxyXG5cdFx0b3V0WzVdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYnpcclxuXHRcdG91dFs2XSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4XHJcblx0XHRvdXRbN10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGJ5IGEgZ2l2ZW4gcXVhdGVybmlvbiAoYSAqIHEpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gcm90YXRlIGJ5XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlQnlRdWF0QXBwZW5kKG91dCwgYSwgcSkge1xyXG5cdFx0dmFyIHF4ID0gcVswXSxcclxuXHRcdFx0cXkgPSBxWzFdLFxyXG5cdFx0XHRxeiA9IHFbMl0sXHJcblx0XHRcdHF3ID0gcVszXSxcclxuXHRcdFx0YXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXSxcclxuXHRcdFx0YXcgPSBhWzNdXHJcblx0XHRvdXRbMF0gPSBheCAqIHF3ICsgYXcgKiBxeCArIGF5ICogcXogLSBheiAqIHF5XHJcblx0XHRvdXRbMV0gPSBheSAqIHF3ICsgYXcgKiBxeSArIGF6ICogcXggLSBheCAqIHF6XHJcblx0XHRvdXRbMl0gPSBheiAqIHF3ICsgYXcgKiBxeiArIGF4ICogcXkgLSBheSAqIHF4XHJcblx0XHRvdXRbM10gPSBhdyAqIHF3IC0gYXggKiBxeCAtIGF5ICogcXkgLSBheiAqIHF6XHJcblx0XHRheCA9IGFbNF1cclxuXHRcdGF5ID0gYVs1XVxyXG5cdFx0YXogPSBhWzZdXHJcblx0XHRhdyA9IGFbN11cclxuXHRcdG91dFs0XSA9IGF4ICogcXcgKyBhdyAqIHF4ICsgYXkgKiBxeiAtIGF6ICogcXlcclxuXHRcdG91dFs1XSA9IGF5ICogcXcgKyBhdyAqIHF5ICsgYXogKiBxeCAtIGF4ICogcXpcclxuXHRcdG91dFs2XSA9IGF6ICogcXcgKyBhdyAqIHF6ICsgYXggKiBxeSAtIGF5ICogcXhcclxuXHRcdG91dFs3XSA9IGF3ICogcXcgLSBheCAqIHF4IC0gYXkgKiBxeSAtIGF6ICogcXpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIGR1YWwgcXVhdCBieSBhIGdpdmVuIHF1YXRlcm5pb24gKHEgKiBhKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gcm90YXRlIGJ5XHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZUJ5UXVhdFByZXBlbmQob3V0LCBxLCBhKSB7XHJcblx0XHR2YXIgcXggPSBxWzBdLFxyXG5cdFx0XHRxeSA9IHFbMV0sXHJcblx0XHRcdHF6ID0gcVsyXSxcclxuXHRcdFx0cXcgPSBxWzNdLFxyXG5cdFx0XHRieCA9IGFbMF0sXHJcblx0XHRcdGJ5ID0gYVsxXSxcclxuXHRcdFx0YnogPSBhWzJdLFxyXG5cdFx0XHRidyA9IGFbM11cclxuXHRcdG91dFswXSA9IHF4ICogYncgKyBxdyAqIGJ4ICsgcXkgKiBieiAtIHF6ICogYnlcclxuXHRcdG91dFsxXSA9IHF5ICogYncgKyBxdyAqIGJ5ICsgcXogKiBieCAtIHF4ICogYnpcclxuXHRcdG91dFsyXSA9IHF6ICogYncgKyBxdyAqIGJ6ICsgcXggKiBieSAtIHF5ICogYnhcclxuXHRcdG91dFszXSA9IHF3ICogYncgLSBxeCAqIGJ4IC0gcXkgKiBieSAtIHF6ICogYnpcclxuXHRcdGJ4ID0gYVs0XVxyXG5cdFx0YnkgPSBhWzVdXHJcblx0XHRieiA9IGFbNl1cclxuXHRcdGJ3ID0gYVs3XVxyXG5cdFx0b3V0WzRdID0gcXggKiBidyArIHF3ICogYnggKyBxeSAqIGJ6IC0gcXogKiBieVxyXG5cdFx0b3V0WzVdID0gcXkgKiBidyArIHF3ICogYnkgKyBxeiAqIGJ4IC0gcXggKiBielxyXG5cdFx0b3V0WzZdID0gcXogKiBidyArIHF3ICogYnogKyBxeCAqIGJ5IC0gcXkgKiBieFxyXG5cdFx0b3V0WzddID0gcXcgKiBidyAtIHF4ICogYnggLSBxeSAqIGJ5IC0gcXogKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCBhIGdpdmVuIGF4aXMuIERvZXMgdGhlIG5vcm1hbGlzYXRpb24gYXV0b21hdGljYWxseVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCBob3cgZmFyIHRoZSByb3RhdGlvbiBzaG91bGQgYmVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVBcm91bmRBeGlzKG91dCwgYSwgYXhpcywgcmFkKSB7XHJcblx0XHQvL1NwZWNpYWwgY2FzZSBmb3IgcmFkID0gMFxyXG5cdFx0aWYgKE1hdGguYWJzKHJhZCkgPCBFUFNJTE9OKSB7XHJcblx0XHRcdHJldHVybiBjb3B5JDcob3V0LCBhKVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBheGlzTGVuZ3RoID0gTWF0aC5zcXJ0KGF4aXNbMF0gKiBheGlzWzBdICsgYXhpc1sxXSAqIGF4aXNbMV0gKyBheGlzWzJdICogYXhpc1syXSlcclxuXHRcdHJhZCA9IHJhZCAqIDAuNVxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYnggPSAocyAqIGF4aXNbMF0pIC8gYXhpc0xlbmd0aFxyXG5cdFx0dmFyIGJ5ID0gKHMgKiBheGlzWzFdKSAvIGF4aXNMZW5ndGhcclxuXHRcdHZhciBieiA9IChzICogYXhpc1syXSkgLyBheGlzTGVuZ3RoXHJcblx0XHR2YXIgYncgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHR2YXIgYXgxID0gYVswXSxcclxuXHRcdFx0YXkxID0gYVsxXSxcclxuXHRcdFx0YXoxID0gYVsyXSxcclxuXHRcdFx0YXcxID0gYVszXVxyXG5cdFx0b3V0WzBdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnlcclxuXHRcdG91dFsxXSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6XHJcblx0XHRvdXRbMl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieFxyXG5cdFx0b3V0WzNdID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYnpcclxuXHRcdHZhciBheCA9IGFbNF0sXHJcblx0XHRcdGF5ID0gYVs1XSxcclxuXHRcdFx0YXogPSBhWzZdLFxyXG5cdFx0XHRhdyA9IGFbN11cclxuXHRcdG91dFs0XSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnlcclxuXHRcdG91dFs1XSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnpcclxuXHRcdG91dFs2XSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYnhcclxuXHRcdG91dFs3XSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gZHVhbCBxdWF0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQ3KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XVxyXG5cdFx0b3V0WzZdID0gYVs2XSArIGJbNl1cclxuXHRcdG91dFs3XSA9IGFbN10gKyBiWzddXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIGR1YWwgcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQ3KG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGF4MCA9IGFbMF0sXHJcblx0XHRcdGF5MCA9IGFbMV0sXHJcblx0XHRcdGF6MCA9IGFbMl0sXHJcblx0XHRcdGF3MCA9IGFbM10sXHJcblx0XHRcdGJ4MSA9IGJbNF0sXHJcblx0XHRcdGJ5MSA9IGJbNV0sXHJcblx0XHRcdGJ6MSA9IGJbNl0sXHJcblx0XHRcdGJ3MSA9IGJbN10sXHJcblx0XHRcdGF4MSA9IGFbNF0sXHJcblx0XHRcdGF5MSA9IGFbNV0sXHJcblx0XHRcdGF6MSA9IGFbNl0sXHJcblx0XHRcdGF3MSA9IGFbN10sXHJcblx0XHRcdGJ4MCA9IGJbMF0sXHJcblx0XHRcdGJ5MCA9IGJbMV0sXHJcblx0XHRcdGJ6MCA9IGJbMl0sXHJcblx0XHRcdGJ3MCA9IGJbM11cclxuXHRcdG91dFswXSA9IGF4MCAqIGJ3MCArIGF3MCAqIGJ4MCArIGF5MCAqIGJ6MCAtIGF6MCAqIGJ5MFxyXG5cdFx0b3V0WzFdID0gYXkwICogYncwICsgYXcwICogYnkwICsgYXowICogYngwIC0gYXgwICogYnowXHJcblx0XHRvdXRbMl0gPSBhejAgKiBidzAgKyBhdzAgKiBiejAgKyBheDAgKiBieTAgLSBheTAgKiBieDBcclxuXHRcdG91dFszXSA9IGF3MCAqIGJ3MCAtIGF4MCAqIGJ4MCAtIGF5MCAqIGJ5MCAtIGF6MCAqIGJ6MFxyXG5cdFx0b3V0WzRdID1cclxuXHRcdFx0YXgwICogYncxICsgYXcwICogYngxICsgYXkwICogYnoxIC0gYXowICogYnkxICsgYXgxICogYncwICsgYXcxICogYngwICsgYXkxICogYnowIC0gYXoxICogYnkwXHJcblx0XHRvdXRbNV0gPVxyXG5cdFx0XHRheTAgKiBidzEgKyBhdzAgKiBieTEgKyBhejAgKiBieDEgLSBheDAgKiBiejEgKyBheTEgKiBidzAgKyBhdzEgKiBieTAgKyBhejEgKiBieDAgLSBheDEgKiBiejBcclxuXHRcdG91dFs2XSA9XHJcblx0XHRcdGF6MCAqIGJ3MSArIGF3MCAqIGJ6MSArIGF4MCAqIGJ5MSAtIGF5MCAqIGJ4MSArIGF6MSAqIGJ3MCArIGF3MSAqIGJ6MCArIGF4MSAqIGJ5MCAtIGF5MSAqIGJ4MFxyXG5cdFx0b3V0WzddID1cclxuXHRcdFx0YXcwICogYncxIC0gYXgwICogYngxIC0gYXkwICogYnkxIC0gYXowICogYnoxICsgYXcxICogYncwIC0gYXgxICogYngwIC0gYXkxICogYnkwIC0gYXoxICogYnowXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdDIubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkNyA9IG11bHRpcGx5JDdcclxuXHQvKipcclxuXHQgKiBTY2FsZXMgYSBkdWFsIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXQgdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIGR1YWwgcXVhdCBieVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDcob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRvdXRbM10gPSBhWzNdICogYlxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIGJcclxuXHRcdG91dFs1XSA9IGFbNV0gKiBiXHJcblx0XHRvdXRbNl0gPSBhWzZdICogYlxyXG5cdFx0b3V0WzddID0gYVs3XSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIGR1YWwgcXVhdCdzIChUaGUgZG90IHByb2R1Y3Qgb2YgdGhlIHJlYWwgcGFydHMpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkb3QkMyA9IGRvdCQyXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBkdWFsIHF1YXRzJ3NcclxuXHQgKiBOT1RFOiBUaGUgcmVzdWx0aW5nIGR1YWwgcXVhdGVybmlvbnMgd29uJ3QgYWx3YXlzIGJlIG5vcm1hbGl6ZWQgKFRoZSBlcnJvciBpcyBtb3N0IG5vdGljZWFibGUgd2hlbiB0ID0gMC41KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0XHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlcnAkMyhvdXQsIGEsIGIsIHQpIHtcclxuXHRcdHZhciBtdCA9IDEgLSB0XHJcblx0XHRpZiAoZG90JDMoYSwgYikgPCAwKSB0ID0gLXRcclxuXHRcdG91dFswXSA9IGFbMF0gKiBtdCArIGJbMF0gKiB0XHJcblx0XHRvdXRbMV0gPSBhWzFdICogbXQgKyBiWzFdICogdFxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIG10ICsgYlsyXSAqIHRcclxuXHRcdG91dFszXSA9IGFbM10gKiBtdCArIGJbM10gKiB0XHJcblx0XHRvdXRbNF0gPSBhWzRdICogbXQgKyBiWzRdICogdFxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIG10ICsgYls1XSAqIHRcclxuXHRcdG91dFs2XSA9IGFbNl0gKiBtdCArIGJbNl0gKiB0XHJcblx0XHRvdXRbN10gPSBhWzddICogbXQgKyBiWzddICogdFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgZHVhbCBxdWF0LiBJZiB0aGV5IGFyZSBub3JtYWxpemVkLCBjb25qdWdhdGUgaXMgY2hlYXBlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQkNShvdXQsIGEpIHtcclxuXHRcdHZhciBzcWxlbiA9IHNxdWFyZWRMZW5ndGgkMyhhKVxyXG5cdFx0b3V0WzBdID0gLWFbMF0gLyBzcWxlblxyXG5cdFx0b3V0WzFdID0gLWFbMV0gLyBzcWxlblxyXG5cdFx0b3V0WzJdID0gLWFbMl0gLyBzcWxlblxyXG5cdFx0b3V0WzNdID0gYVszXSAvIHNxbGVuXHJcblx0XHRvdXRbNF0gPSAtYVs0XSAvIHNxbGVuXHJcblx0XHRvdXRbNV0gPSAtYVs1XSAvIHNxbGVuXHJcblx0XHRvdXRbNl0gPSAtYVs2XSAvIHNxbGVuXHJcblx0XHRvdXRbN10gPSBhWzddIC8gc3FsZW5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgZHVhbCBxdWF0XHJcblx0ICogSWYgdGhlIGR1YWwgcXVhdGVybmlvbiBpcyBub3JtYWxpemVkLCB0aGlzIGZ1bmN0aW9uIGlzIGZhc3RlciB0aGFuIHF1YXQyLmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHF1YXQgdG8gY2FsY3VsYXRlIGNvbmp1Z2F0ZSBvZlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvbmp1Z2F0ZSQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gLWFbMF1cclxuXHRcdG91dFsxXSA9IC1hWzFdXHJcblx0XHRvdXRbMl0gPSAtYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gLWFbNF1cclxuXHRcdG91dFs1XSA9IC1hWzVdXHJcblx0XHRvdXRbNl0gPSAtYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBkdWFsIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0IHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuZ3RoJDMgPSBsZW5ndGgkMlxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdDIubGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuJDMgPSBsZW5ndGgkM1xyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgZHVhbCBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXVhcmVkTGVuZ3RoJDMgPSBzcXVhcmVkTGVuZ3RoJDJcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQyLnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4kMyA9IHNxdWFyZWRMZW5ndGgkM1xyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIGR1YWwgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbm9ybWFsaXplJDMob3V0LCBhKSB7XHJcblx0XHR2YXIgbWFnbml0dWRlID0gc3F1YXJlZExlbmd0aCQzKGEpXHJcblxyXG5cdFx0aWYgKG1hZ25pdHVkZSA+IDApIHtcclxuXHRcdFx0bWFnbml0dWRlID0gTWF0aC5zcXJ0KG1hZ25pdHVkZSlcclxuXHRcdFx0dmFyIGEwID0gYVswXSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR2YXIgYTEgPSBhWzFdIC8gbWFnbml0dWRlXHJcblx0XHRcdHZhciBhMiA9IGFbMl0gLyBtYWduaXR1ZGVcclxuXHRcdFx0dmFyIGEzID0gYVszXSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR2YXIgYjAgPSBhWzRdXHJcblx0XHRcdHZhciBiMSA9IGFbNV1cclxuXHRcdFx0dmFyIGIyID0gYVs2XVxyXG5cdFx0XHR2YXIgYjMgPSBhWzddXHJcblx0XHRcdHZhciBhX2RvdF9iID0gYTAgKiBiMCArIGExICogYjEgKyBhMiAqIGIyICsgYTMgKiBiM1xyXG5cdFx0XHRvdXRbMF0gPSBhMFxyXG5cdFx0XHRvdXRbMV0gPSBhMVxyXG5cdFx0XHRvdXRbMl0gPSBhMlxyXG5cdFx0XHRvdXRbM10gPSBhM1xyXG5cdFx0XHRvdXRbNF0gPSAoYjAgLSBhMCAqIGFfZG90X2IpIC8gbWFnbml0dWRlXHJcblx0XHRcdG91dFs1XSA9IChiMSAtIGExICogYV9kb3RfYikgLyBtYWduaXR1ZGVcclxuXHRcdFx0b3V0WzZdID0gKGIyIC0gYTIgKiBhX2RvdF9iKSAvIG1hZ25pdHVkZVxyXG5cdFx0XHRvdXRbN10gPSAoYjMgLSBhMyAqIGFfZG90X2IpIC8gbWFnbml0dWRlXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgZHVhbCBxdWF0ZW5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZHVhbCBxdWF0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ3KGEpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdCdxdWF0MignICtcclxuXHRcdFx0YVswXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzFdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbMl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVszXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzRdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs2XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzddICtcclxuXHRcdFx0JyknXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGR1YWwgcXVhdGVybmlvbnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3QgZHVhbCBxdWF0ZXJuaW9uLlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBkdWFsIHF1YXRlcm5pb24uXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgdGhlIGR1YWwgcXVhdGVybmlvbnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGV4YWN0RXF1YWxzJDcoYSwgYikge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0YVswXSA9PT0gYlswXSAmJlxyXG5cdFx0XHRhWzFdID09PSBiWzFdICYmXHJcblx0XHRcdGFbMl0gPT09IGJbMl0gJiZcclxuXHRcdFx0YVszXSA9PT0gYlszXSAmJlxyXG5cdFx0XHRhWzRdID09PSBiWzRdICYmXHJcblx0XHRcdGFbNV0gPT09IGJbNV0gJiZcclxuXHRcdFx0YVs2XSA9PT0gYls2XSAmJlxyXG5cdFx0XHRhWzddID09PSBiWzddXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGR1YWwgcXVhdGVybmlvbnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3QgZHVhbCBxdWF0LlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBkdWFsIHF1YXQuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgdGhlIGR1YWwgcXVhdHMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQ4KGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdLFxyXG5cdFx0XHRhNiA9IGFbNl0sXHJcblx0XHRcdGE3ID0gYVs3XVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXSxcclxuXHRcdFx0YjQgPSBiWzRdLFxyXG5cdFx0XHRiNSA9IGJbNV0sXHJcblx0XHRcdGI2ID0gYls2XSxcclxuXHRcdFx0YjcgPSBiWzddXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMyAtIGIzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTQgLSBiNCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE1IC0gYjUpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNiAtIGI2KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTcgLSBiNykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpXHJcblx0XHQpXHJcblx0fVxyXG5cclxuXHR2YXIgcXVhdDIgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkNyxcclxuXHRcdGNsb25lOiBjbG9uZSQ3LFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQ3LFxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25WYWx1ZXM6IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uVmFsdWVzLFxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb246IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uJDEsXHJcblx0XHRmcm9tVHJhbnNsYXRpb246IGZyb21UcmFuc2xhdGlvbiQzLFxyXG5cdFx0ZnJvbVJvdGF0aW9uOiBmcm9tUm90YXRpb24kNCxcclxuXHRcdGZyb21NYXQ0OiBmcm9tTWF0NCQxLFxyXG5cdFx0Y29weTogY29weSQ3LFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5JDUsXHJcblx0XHRzZXQ6IHNldCQ3LFxyXG5cdFx0Z2V0UmVhbDogZ2V0UmVhbCxcclxuXHRcdGdldER1YWw6IGdldER1YWwsXHJcblx0XHRzZXRSZWFsOiBzZXRSZWFsLFxyXG5cdFx0c2V0RHVhbDogc2V0RHVhbCxcclxuXHRcdGdldFRyYW5zbGF0aW9uOiBnZXRUcmFuc2xhdGlvbiQxLFxyXG5cdFx0dHJhbnNsYXRlOiB0cmFuc2xhdGUkMyxcclxuXHRcdHJvdGF0ZVg6IHJvdGF0ZVgkMyxcclxuXHRcdHJvdGF0ZVk6IHJvdGF0ZVkkMyxcclxuXHRcdHJvdGF0ZVo6IHJvdGF0ZVokMyxcclxuXHRcdHJvdGF0ZUJ5UXVhdEFwcGVuZDogcm90YXRlQnlRdWF0QXBwZW5kLFxyXG5cdFx0cm90YXRlQnlRdWF0UHJlcGVuZDogcm90YXRlQnlRdWF0UHJlcGVuZCxcclxuXHRcdHJvdGF0ZUFyb3VuZEF4aXM6IHJvdGF0ZUFyb3VuZEF4aXMsXHJcblx0XHRhZGQ6IGFkZCQ3LFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDcsXHJcblx0XHRtdWw6IG11bCQ3LFxyXG5cdFx0c2NhbGU6IHNjYWxlJDcsXHJcblx0XHRkb3Q6IGRvdCQzLFxyXG5cdFx0bGVycDogbGVycCQzLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkNSxcclxuXHRcdGNvbmp1Z2F0ZTogY29uanVnYXRlJDEsXHJcblx0XHRsZW5ndGg6IGxlbmd0aCQzLFxyXG5cdFx0bGVuOiBsZW4kMyxcclxuXHRcdHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGgkMyxcclxuXHRcdHNxckxlbjogc3FyTGVuJDMsXHJcblx0XHRub3JtYWxpemU6IG5vcm1hbGl6ZSQzLFxyXG5cdFx0c3RyOiBzdHIkNyxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQ3LFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkOCxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAyIERpbWVuc2lvbmFsIFZlY3RvclxyXG5cdCAqIEBtb2R1bGUgdmVjMlxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQ4KCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDIpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFswXSA9IDBcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjbG9uZSQ4KGEpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgyKVxyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDgoeCwgeSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDIpXHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMyIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBzb3VyY2UgdmVjdG9yXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDgob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkOChvdXQsIHgsIHkpIHtcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQ4KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDYob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5JDgob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogRGl2aWRlcyB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpdmlkZSQyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAvIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLyBiWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjZWlsXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjZWlsJDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguY2VpbChhWzFdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGZsb29yXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmbG9vciQyKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWluJDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1heCQyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gcm91bmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdW5kJDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyBhIHZlYzIgYnkgYSBzY2FsYXIgbnVtYmVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDgob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjMidzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlQW5kQWRkJDIob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpc3RhbmNlJDIoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXSxcclxuXHRcdFx0eSA9IGJbMV0gLSBhWzFdXHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZSQyKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF0sXHJcblx0XHRcdHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHlcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVuZ3RoJDQoYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoJDQoYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHlcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5lZ2F0ZSQyKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gLWFbMF1cclxuXHRcdG91dFsxXSA9IC1hWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gaW52ZXJ0XHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnNlJDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAxLjAgLyBhWzBdXHJcblx0XHRvdXRbMV0gPSAxLjAgLyBhWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZSQ0KG91dCwgYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0dmFyIGxlbiA9IHggKiB4ICsgeSAqIHlcclxuXHJcblx0XHRpZiAobGVuID4gMCkge1xyXG5cdFx0XHQvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG5cdFx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSBhWzBdICogbGVuXHJcblx0XHRvdXRbMV0gPSBhWzFdICogbGVuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRvdCQ0KGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcclxuXHQgKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgbXVzdCBieSBkZWZpbml0aW9uIHByb2R1Y2UgYSAzRCB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3Jvc3MkMihvdXQsIGEsIGIpIHtcclxuXHRcdHZhciB6ID0gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXVxyXG5cdFx0b3V0WzBdID0gb3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gelxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVycCQ0KG91dCwgYSwgYiwgdCkge1xyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdXHJcblx0XHRvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KVxyXG5cdFx0b3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJhbmRvbSQzKG91dCwgc2NhbGUpIHtcclxuXHRcdHNjYWxlID0gc2NhbGUgfHwgMS4wXHJcblx0XHR2YXIgciA9IFJBTkRPTSgpICogMi4wICogTWF0aC5QSVxyXG5cdFx0b3V0WzBdID0gTWF0aC5jb3MocikgKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gTWF0aC5zaW4ocikgKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDIob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdXHJcblx0XHRvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5XHJcblx0XHRvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyZChvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV1cclxuXHRcdG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdXHJcblx0XHRvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5ICsgbVs1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQzXHJcblx0ICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQzfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0MyQxKG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0b3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl1cclxuXHRcdG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDRcclxuXHQgKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xyXG5cdCAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQkMihvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHRvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl1cclxuXHRcdG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGUgYSAyRCB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzJcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIHZlYzIgcG9pbnQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGUkNChvdXQsIGEsIGIsIGMpIHtcclxuXHRcdC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cclxuXHRcdHZhciBwMCA9IGFbMF0gLSBiWzBdLFxyXG5cdFx0XHRwMSA9IGFbMV0gLSBiWzFdLFxyXG5cdFx0XHRzaW5DID0gTWF0aC5zaW4oYyksXHJcblx0XHRcdGNvc0MgPSBNYXRoLmNvcyhjKSAvL3BlcmZvcm0gcm90YXRpb24gYW5kIHRyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gcDAgKiBjb3NDIC0gcDEgKiBzaW5DICsgYlswXVxyXG5cdFx0b3V0WzFdID0gcDAgKiBzaW5DICsgcDEgKiBjb3NDICsgYlsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDJEIHZlY3RvcnNcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYW5nbGUkMShhLCBiKSB7XHJcblx0XHR2YXIgeDEgPSBhWzBdLFxyXG5cdFx0XHR5MSA9IGFbMV0sXHJcblx0XHRcdHgyID0gYlswXSxcclxuXHRcdFx0eTIgPSBiWzFdXHJcblx0XHR2YXIgbGVuMSA9IHgxICogeDEgKyB5MSAqIHkxXHJcblxyXG5cdFx0aWYgKGxlbjEgPiAwKSB7XHJcblx0XHRcdC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XHJcblx0XHRcdGxlbjEgPSAxIC8gTWF0aC5zcXJ0KGxlbjEpXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGxlbjIgPSB4MiAqIHgyICsgeTIgKiB5MlxyXG5cclxuXHRcdGlmIChsZW4yID4gMCkge1xyXG5cdFx0XHQvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG5cdFx0XHRsZW4yID0gMSAvIE1hdGguc3FydChsZW4yKVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjb3NpbmUgPSAoeDEgKiB4MiArIHkxICogeTIpICogbGVuMSAqIGxlbjJcclxuXHJcblx0XHRpZiAoY29zaW5lID4gMS4wKSB7XHJcblx0XHRcdHJldHVybiAwXHJcblx0XHR9IGVsc2UgaWYgKGNvc2luZSA8IC0xLjApIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguUElcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmFjb3MoY29zaW5lKVxyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHplcm9cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB6ZXJvJDIob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAwLjBcclxuXHRcdG91dFsxXSA9IDAuMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ4KGEpIHtcclxuXHRcdHJldHVybiAndmVjMignICsgYVswXSArICcsICcgKyBhWzFdICsgJyknXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgZXhhY3RseSBoYXZlIHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQ4KGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQ5KGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5sZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW4kNCA9IGxlbmd0aCQ0XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViJDYgPSBzdWJ0cmFjdCQ2XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDggPSBtdWx0aXBseSQ4XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpdmlkZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpdiQyID0gZGl2aWRlJDJcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkaXN0JDIgPSBkaXN0YW5jZSQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWREaXN0YW5jZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckRpc3QkMiA9IHNxdWFyZWREaXN0YW5jZSQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4kNCA9IHNxdWFyZWRMZW5ndGgkNFxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMycyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcblx0ICogQHJldHVybnMge0FycmF5fSBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBmb3JFYWNoJDIgPSAoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdmVjID0gY3JlYXRlJDgoKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xyXG5cdFx0XHR2YXIgaSwgbFxyXG5cclxuXHRcdFx0aWYgKCFzdHJpZGUpIHtcclxuXHRcdFx0XHRzdHJpZGUgPSAyXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghb2Zmc2V0KSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gMFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoY291bnQpIHtcclxuXHRcdFx0XHRsID0gTWF0aC5taW4oY291bnQgKiBzdHJpZGUgKyBvZmZzZXQsIGEubGVuZ3RoKVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGwgPSBhLmxlbmd0aFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xyXG5cdFx0XHRcdHZlY1swXSA9IGFbaV1cclxuXHRcdFx0XHR2ZWNbMV0gPSBhW2kgKyAxXVxyXG5cdFx0XHRcdGZuKHZlYywgdmVjLCBhcmcpXHJcblx0XHRcdFx0YVtpXSA9IHZlY1swXVxyXG5cdFx0XHRcdGFbaSArIDFdID0gdmVjWzFdXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhXHJcblx0XHR9XHJcblx0fSkoKVxyXG5cclxuXHR2YXIgdmVjMiA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQ4LFxyXG5cdFx0Y2xvbmU6IGNsb25lJDgsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDgsXHJcblx0XHRjb3B5OiBjb3B5JDgsXHJcblx0XHRzZXQ6IHNldCQ4LFxyXG5cdFx0YWRkOiBhZGQkOCxcclxuXHRcdHN1YnRyYWN0OiBzdWJ0cmFjdCQ2LFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDgsXHJcblx0XHRkaXZpZGU6IGRpdmlkZSQyLFxyXG5cdFx0Y2VpbDogY2VpbCQyLFxyXG5cdFx0Zmxvb3I6IGZsb29yJDIsXHJcblx0XHRtaW46IG1pbiQyLFxyXG5cdFx0bWF4OiBtYXgkMixcclxuXHRcdHJvdW5kOiByb3VuZCQyLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDgsXHJcblx0XHRzY2FsZUFuZEFkZDogc2NhbGVBbmRBZGQkMixcclxuXHRcdGRpc3RhbmNlOiBkaXN0YW5jZSQyLFxyXG5cdFx0c3F1YXJlZERpc3RhbmNlOiBzcXVhcmVkRGlzdGFuY2UkMixcclxuXHRcdGxlbmd0aDogbGVuZ3RoJDQsXHJcblx0XHRzcXVhcmVkTGVuZ3RoOiBzcXVhcmVkTGVuZ3RoJDQsXHJcblx0XHRuZWdhdGU6IG5lZ2F0ZSQyLFxyXG5cdFx0aW52ZXJzZTogaW52ZXJzZSQyLFxyXG5cdFx0bm9ybWFsaXplOiBub3JtYWxpemUkNCxcclxuXHRcdGRvdDogZG90JDQsXHJcblx0XHRjcm9zczogY3Jvc3MkMixcclxuXHRcdGxlcnA6IGxlcnAkNCxcclxuXHRcdHJhbmRvbTogcmFuZG9tJDMsXHJcblx0XHR0cmFuc2Zvcm1NYXQyOiB0cmFuc2Zvcm1NYXQyLFxyXG5cdFx0dHJhbnNmb3JtTWF0MmQ6IHRyYW5zZm9ybU1hdDJkLFxyXG5cdFx0dHJhbnNmb3JtTWF0MzogdHJhbnNmb3JtTWF0MyQxLFxyXG5cdFx0dHJhbnNmb3JtTWF0NDogdHJhbnNmb3JtTWF0NCQyLFxyXG5cdFx0cm90YXRlOiByb3RhdGUkNCxcclxuXHRcdGFuZ2xlOiBhbmdsZSQxLFxyXG5cdFx0emVybzogemVybyQyLFxyXG5cdFx0c3RyOiBzdHIkOCxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQ4LFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkOSxcclxuXHRcdGxlbjogbGVuJDQsXHJcblx0XHRzdWI6IHN1YiQ2LFxyXG5cdFx0bXVsOiBtdWwkOCxcclxuXHRcdGRpdjogZGl2JDIsXHJcblx0XHRkaXN0OiBkaXN0JDIsXHJcblx0XHRzcXJEaXN0OiBzcXJEaXN0JDIsXHJcblx0XHRzcXJMZW46IHNxckxlbiQ0LFxyXG5cdFx0Zm9yRWFjaDogZm9yRWFjaCQyLFxyXG5cdH0pXHJcblxyXG5cdGV4cG9ydHMuZ2xNYXRyaXggPSBjb21tb25cclxuXHRleHBvcnRzLm1hdDIgPSBtYXQyXHJcblx0ZXhwb3J0cy5tYXQyZCA9IG1hdDJkXHJcblx0ZXhwb3J0cy5tYXQzID0gbWF0M1xyXG5cdGV4cG9ydHMubWF0NCA9IG1hdDRcclxuXHRleHBvcnRzLnF1YXQgPSBxdWF0XHJcblx0ZXhwb3J0cy5xdWF0MiA9IHF1YXQyXHJcblx0ZXhwb3J0cy52ZWMyID0gdmVjMlxyXG5cdGV4cG9ydHMudmVjMyA9IHZlYzNcclxuXHRleHBvcnRzLnZlYzQgPSB2ZWM0XHJcblxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSlcclxufSlcclxuIiwiLypcclxuICogQ29weXJpZ2h0IDIwMTIsIEdyZWdnIFRhdmFyZXMuXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxyXG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXHJcbiAqIG1ldDpcclxuICpcclxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcclxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXHJcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxyXG4gKiBkaXN0cmlidXRpb24uXHJcbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcclxuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cclxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xyXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXHJcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxyXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxyXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcclxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxyXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcclxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXHJcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcclxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXHJcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBwcm9ncmFtLCBhdHRhY2hlcyBzaGFkZXJzLCBiaW5kcyBhdHRyaWIgbG9jYXRpb25zLCBsaW5rcyB0aGVcclxuICogcHJvZ3JhbSBhbmQgY2FsbHMgdXNlUHJvZ3JhbS5cclxuICogQHBhcmFtIHtXZWJHTFNoYWRlcltdfSBzaGFkZXJzIFRoZSBzaGFkZXJzIHRvIGF0dGFjaFxyXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBbb3B0X2F0dHJpYnNdIEFuIGFycmF5IG9mIGF0dHJpYnMgbmFtZXMuXHJcbiAqIExvY2F0aW9ucyB3aWxsIGJlIGFzc2lnbmVkIGJ5IGluZGV4IGlmIG5vdCBwYXNzZWQgaW5cclxuICogQHBhcmFtIHtudW1iZXJbXX0gW29wdF9sb2NhdGlvbnNdIFRoZSBsb2NhdGlvbnMgZm9yIHRoZS5cclxuICogQSBwYXJhbGxlbCBhcnJheSB0byBvcHRfYXR0cmlicyBsZXR0aW5nIHlvdSBhc3NpZ24gbG9jYXRpb25zLlxyXG4gKiBAcGFyYW0ge21vZHVsZTp3ZWJnbC11dGlscy5FcnJvckNhbGxiYWNrfSBvcHRfZXJyb3JDYWxsYmFjayBjYWxsYmFjayBmb3IgZXJyb3JzLlxyXG4gKiBCeSBkZWZhdWx0IGl0IGp1c3QgcHJpbnRzIGFuIGVycm9yIHRvIHRoZSBjb25zb2xlIG9uIGVycm9yLlxyXG4gKiBJZiB5b3Ugd2FudCBzb21ldGhpbmcgZWxzZSBwYXNzIGFuIGNhbGxiYWNrLiBJdCdzIHBhc3NlZCBhbiBlcnJvciBtZXNzYWdlLlxyXG4gKiBAbWVtYmVyT2YgbW9kdWxlOndlYmdsLXV0aWxzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbShcclxuXHRnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0LFxyXG5cdHNoYWRlcnM6IFdlYkdMU2hhZGVyW10sXHJcblx0b3B0X2F0dHJpYnM/OiBzdHJpbmdbXSxcclxuXHRvcHRfbG9jYXRpb25zPzogbnVtYmVyW10sXHJcblx0b3B0X2Vycm9yQ2FsbGJhY2s/OiBhbnlcclxuKTogV2ViR0xQcm9ncmFtIHwgbnVsbCB7XHJcblx0Y29uc3QgZXJyRm46IChlcnJvck1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCB8IENvbnNvbGUgPSBvcHRfZXJyb3JDYWxsYmFjayB8fCBjb25zb2xlLmVycm9yXHJcblx0Y29uc3QgcHJvZ3JhbTogV2ViR0xQcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpXHJcblxyXG5cdHNoYWRlcnMuZm9yRWFjaCgoc2hhZGVyKTogdm9pZCA9PiBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgc2hhZGVyKSlcclxuXHJcblx0aWYgKG9wdF9hdHRyaWJzKSB7XHJcblx0XHRvcHRfYXR0cmlicy5mb3JFYWNoKFxyXG5cdFx0XHQoYXR0cmliLCBuZHgpOiB2b2lkID0+XHJcblx0XHRcdFx0Z2wuYmluZEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIG9wdF9sb2NhdGlvbnMgPyBvcHRfbG9jYXRpb25zW25keF0gOiBuZHgsIGF0dHJpYilcclxuXHRcdClcclxuXHR9XHJcblxyXG5cdGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pXHJcblxyXG5cdC8vIENoZWNrIHRoZSBsaW5rIHN0YXR1c1xyXG5cdGNvbnN0IGxpbmtlZDogYW55ID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUylcclxuXHRpZiAoIWxpbmtlZCkge1xyXG5cdFx0Ly8gc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgbGlua1xyXG5cdFx0Y29uc3QgbGFzdEVycm9yOiBzdHJpbmcgPSBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKVxyXG5cdFx0ZXJyRm4oJ0Vycm9yIGluIHByb2dyYW0gbGlua2luZzonICsgbGFzdEVycm9yKVxyXG5cclxuXHRcdGdsLmRlbGV0ZVByb2dyYW0ocHJvZ3JhbSlcclxuXHRcdHJldHVybiBudWxsXHJcblx0fVxyXG5cdHJldHVybiBwcm9ncmFtXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXNpemUgYSBjYW52YXMgdG8gbWF0Y2ggdGhlIHNpemUgaXRzIGRpc3BsYXllZC5cclxuICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzIFRoZSBjYW52YXMgdG8gcmVzaXplLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gW211bHRpcGxpZXJdIGFtb3VudCB0byBtdWx0aXBseSBieS5cclxuICogICAgUGFzcyBpbiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyBmb3IgbmF0aXZlIHBpeGVscy5cclxuICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY2FudmFzIHdhcyByZXNpemVkLlxyXG4gKiBAbWVtYmVyT2YgbW9kdWxlOndlYmdsLXV0aWxzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShcclxuXHRjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG5cdG11bHRpcGxpZXI6IG51bWJlciA9IDFcclxuKTogYm9vbGVhbiB7XHJcblx0Y29uc3Qgd2lkdGggPSAoY2FudmFzLmNsaWVudFdpZHRoICogbXVsdGlwbGllcikgfCAwXHJcblx0Y29uc3QgaGVpZ2h0ID0gKGNhbnZhcy5jbGllbnRIZWlnaHQgKiBtdWx0aXBsaWVyKSB8IDBcclxuXHRpZiAoY2FudmFzLndpZHRoICE9PSB3aWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBoZWlnaHQpIHtcclxuXHRcdGNhbnZhcy53aWR0aCA9IHdpZHRoXHJcblx0XHRjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XHJcblx0XHRyZXR1cm4gdHJ1ZVxyXG5cdH1cclxuXHRyZXR1cm4gZmFsc2VcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc2l6ZSBhIGNhbnZhcyB0byBtYXRjaCB0aGUgc2l6ZSBpdHMgZGlzcGxheWVkLlxyXG4gKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXMgVGhlIGNhbnZhcyB0byByZXNpemUuXHJcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNhbnZhcyB3YXMgcmVzaXplZC5cclxuICogQG1lbWJlck9mIG1vZHVsZTp3ZWJnbC11dGlsc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZUNhbnZhc1RvU3F1YXJlKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBib29sZWFuIHtcclxuXHRjb25zdCBzdHlsZXM6IENTU1N0eWxlRGVjbGFyYXRpb24gPSBnZXRDb21wdXRlZFN0eWxlKGNhbnZhcylcclxuXHRjb25zdCB3aWR0aDogbnVtYmVyID0gcGFyc2VGbG9hdChzdHlsZXMud2lkdGgpXHJcblx0Y29uc3QgaGVpZ2h0OiBudW1iZXIgPSBwYXJzZUZsb2F0KHN0eWxlcy5oZWlnaHQpXHJcblxyXG5cdGlmIChjYW52YXMud2lkdGggIT09IHdpZHRoIHx8IGNhbnZhcy5oZWlnaHQgIT09IGhlaWdodCkge1xyXG5cdFx0Y2FudmFzLndpZHRoID0gd2lkdGhcclxuXHRcdGNhbnZhcy5oZWlnaHQgPSB3aWR0aFxyXG5cdFx0cmV0dXJuIHRydWVcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaGFkZXIoXHJcblx0Z2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCxcclxuXHR0eXBlOiBzdHJpbmcsXHJcblx0cmVzb2x2ZTogKHZhbHVlOiBXZWJHTFNoYWRlciB8IFByb21pc2VMaWtlPHt9PikgPT4gdm9pZCxcclxuXHRyZWplY3Q6IChyZWFzb246IEVycm9yKSA9PiB2b2lkXHJcbik6IHZvaWQge1xyXG5cdGZ1bmN0aW9uIGhhbmRsZVNoYWRlcihkYXRhOiBzdHJpbmcpOiBXZWJHTFNoYWRlciB8IG51bGwge1xyXG5cdFx0bGV0IHNoYWRlcjogV2ViR0xTaGFkZXJcclxuXHRcdGlmICh0eXBlID09PSAnZnJhZ21lbnQtc2hhZGVyJykge1xyXG5cdFx0XHRzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKVxyXG5cdFx0fSBlbHNlIGlmICh0eXBlID09PSAndmVydGV4LXNoYWRlcicpIHtcclxuXHRcdFx0c2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIGRhdGEpXHJcblx0XHRnbC5jb21waWxlU2hhZGVyKHNoYWRlcilcclxuXHJcblx0XHRyZXR1cm4gc2hhZGVyXHJcblx0fVxyXG5cclxuXHRmZXRjaChgaHR0cDovL2xvY2FsaG9zdDoxMzM3L2Fzc2V0cy9zaGFkZXJzLyR7dHlwZX0uZ2xzbGApXHJcblx0XHQudGhlbigocmVzcDogUmVzcG9uc2UpID0+IHJlc3AudGV4dCgpKVxyXG5cdFx0LnRoZW4oKGRhdGE6IHN0cmluZykgPT4gaGFuZGxlU2hhZGVyKGRhdGEpKVxyXG5cdFx0LnRoZW4oKHNoYWRlcjogV2ViR0xTaGFkZXIpID0+IHJlc29sdmUoc2hhZGVyKSlcclxuXHRcdC5jYXRjaCgoZXJyOiBFcnJvcikgPT4gcmVqZWN0KGVycikpXHJcblxyXG5cdC8vIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcblx0Ly8gXHRhbGVydChnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpXHJcblx0Ly8gXHRyZXR1cm4gbnVsbFxyXG5cdC8vIH1cclxufVxyXG4iXX0=
