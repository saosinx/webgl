(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var webgl_google_utils_1 = require("./webgl-google-utils");

var webgl_matrix_1 = require("./webgl-matrix");

var webgl_utils_1 = require("./webgl-utils");

var gl;
var attribs = {};
var uniforms = {};
var viewMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
var modelMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
var modelViewMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
var perspectiveMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
var mvpMatrix = webgl_matrix_1.mat4.identity(webgl_matrix_1.mat4.create());
webgl_matrix_1.mat4.perspective(perspectiveMatrix, webgl_google_utils_1.degToRad(60), 1, 1, 100);

var $ = function $(selector, qs) {
  if (!qs) return document.getElementById(selector);
  return document.querySelector(selector);
};

var scene = {
  modelScale: {
    elem: $('modelScale'),
    value: 0
  },
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
var controlPanel = $('control-panel');
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
  attribs.aColor = gl.getAttribLocation(gl.program, 'a_Color');
  uniforms.uWidth = gl.getUniformLocation(gl.program, 'u_Width');
  uniforms.uHeight = gl.getUniformLocation(gl.program, 'u_Height');
  uniforms.uMvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
};

var initTextures = function initTextures() {
  return true;
}; // prettier-ignore


var initBuffer = function initBuffer() {
  var vertices = new Float32Array([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, -1.0, -1.0, 0.0, 1.0, 0.0, 1.0, 1.0, -1.0, 0.0, 1.0, 1.0, -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, -1.0, -1.0, -1.0, 0.0, 0.0, 0.0]);
  var FSIZE = vertices.BYTES_PER_ELEMENT;
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(attribs.aPosition);
  gl.vertexAttribPointer(attribs.aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(attribs.aColor);
  var indices = new Uint8Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 1, 1, 6, 7, 1, 7, 2, 7, 4, 3, 7, 3, 2, 4, 7, 6, 4, 6, 5]);
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  return indices.length;
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
  webgl_matrix_1.mat4.scale(modelMatrix, modelMatrix, webgl_matrix_1.vec3.fromValues(scene.modelScale.value, scene.modelScale.value, scene.modelScale.value));
  webgl_matrix_1.mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
  webgl_matrix_1.mat4.mul(mvpMatrix, perspectiveMatrix, modelViewMatrix);
  gl.uniformMatrix4fv(uniforms.uMvpMatrix, false, mvpMatrix);
  gl.uniform1f(uniforms.uWidth, gl.drawingBufferWidth);
  gl.uniform1f(uniforms.uHeight, gl.drawingBufferHeight);
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
};

var lastTime = 0;
var frames = 0;
var fps;

var render = function render() {
  var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  fps = (1000 / (time - lastTime)).toFixed(0);
  fpsCounter.textContent = fps;
  frameCounter.textContent = ++frames + '';
  timeCounter.textContent = (time / 1000).toFixed(2);
  lastTime = time;
  window.requestAnimationFrame(render);
  drawScene();
};

var webGLStart = function webGLStart() {
  var canvas = document.getElementById('canvas');
  var powerPreference = 'default' || 'high-performance' || 'low-power';
  gl = webgl_google_utils_1.default.setupWebGL(canvas, {
    alpha: true,
    depth: true,
    powerPreference: powerPreference
  });
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  webgl_utils_1.resizeCanvasToDisplaySize(gl.canvas);
  console.log(gl);
  var promiseShader = new Promise(function (res, rej) {
    return initShaders(res, rej);
  });
  promiseShader.then(function () {
    return initVariables();
  }).then(function () {
    return initTextures();
  }).then(function () {
    return initBuffer();
  }).then(function (indices) {
    return render();
  }).catch(function (error) {
    return console.error(error);
  });
};

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
    scene.modelRotateX.value += e.movementY;
    scene.modelRotateY.value += e.movementX;
    updateInfobar(scene.modelRotateX.elem);
    updateInfobar(scene.modelRotateY.elem);
  });
}; // prettier-ignore


window.onload = function () {
  for (var key in scene) {
    scene[key].value = +parseFloat(scene[key].elem.innerHTML);
  }

  webGLStart();
  setCanvasControls();
};

window.addEventListener('resize', function (e) {
  return webgl_utils_1.resizeCanvasToDisplaySize(gl.canvas);
});
window.addEventListener('wheel', function (e) {
  var direction = e.deltaY < 0 ? -0.15 : 0.15;
  scene.cameraZ.value += direction;
  updateInfobar(scene.cameraZ.elem);
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
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this); // This clamps images whose dimensions are not a power of 2, letting you use images of any size.

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
@version 3.0.0-0

Copyright (c) 2015-2018, Brandon Jones, Colin MacKenzie IV.

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
        lerp: lerp$1,
        random: random$1,
        transformMat4: transformMat4$1,
        transformQuat: transformQuat$1,
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
    function cross$1(out, a, b) {
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
        cross: cross$1,
        lerp: lerp$4,
        random: random$3,
        transformMat2: transformMat2,
        transformMat2d: transformMat2d,
        transformMat3: transformMat3$1,
        transformMat4: transformMat4$2,
        rotate: rotate$4,
        angle: angle$1,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9pbmRleC50cyIsInNyYy9zY3JpcHRzL3dlYmdsLWdvb2dsZS11dGlscy50cyIsInNyYy9zY3JpcHRzL3dlYmdsLW1hdHJpeC5qcyIsInNyYy9zY3JpcHRzL3dlYmdsLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUEsSUFBQSxvQkFBQSxHQUFBLE9BQUEsQ0FBQSxzQkFBQSxDQUFBOztBQUNBLElBQUEsY0FBQSxHQUFBLE9BQUEsQ0FBQSxnQkFBQSxDQUFBOztBQUNBLElBQUEsYUFBQSxHQUFBLE9BQUEsQ0FBQSxlQUFBLENBQUE7O0FBRUEsSUFBSSxFQUFKO0FBRUEsSUFBTSxPQUFPLEdBQVEsRUFBckI7QUFDQSxJQUFNLFFBQVEsR0FBUSxFQUF0QjtBQUVBLElBQU0sVUFBVSxHQUFHLGNBQUEsQ0FBQSxJQUFBLENBQUssUUFBTCxDQUFjLGNBQUEsQ0FBQSxJQUFBLENBQUssTUFBTCxFQUFkLENBQW5CO0FBQ0EsSUFBTSxXQUFXLEdBQUcsY0FBQSxDQUFBLElBQUEsQ0FBSyxRQUFMLENBQWMsY0FBQSxDQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWQsQ0FBcEI7QUFDQSxJQUFNLGVBQWUsR0FBRyxjQUFBLENBQUEsSUFBQSxDQUFLLFFBQUwsQ0FBYyxjQUFBLENBQUEsSUFBQSxDQUFLLE1BQUwsRUFBZCxDQUF4QjtBQUNBLElBQU0saUJBQWlCLEdBQUcsY0FBQSxDQUFBLElBQUEsQ0FBSyxRQUFMLENBQWMsY0FBQSxDQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWQsQ0FBMUI7QUFDQSxJQUFNLFNBQVMsR0FBRyxjQUFBLENBQUEsSUFBQSxDQUFLLFFBQUwsQ0FBYyxjQUFBLENBQUEsSUFBQSxDQUFLLE1BQUwsRUFBZCxDQUFsQjtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUssV0FBTCxDQUFpQixpQkFBakIsRUFBb0Msb0JBQUEsQ0FB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LENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDMUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMs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QUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0RSxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLElBQUksQ0FBQyxDQUFDO1FBQ2QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDeEUsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLE9BQU8sQ0FDTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMs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LENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUc7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUN2QyxJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFD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QUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDL0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDL0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM1QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7UUFPSTtJQUVKLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O1FBT0k7SUFFSixTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDM0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQy9CLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRztRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNwQixDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMs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VUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUs7UUFDL0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixPQUFPLENBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDeEUsQ0FBQTtJQUNGLENBQUM7SUFDRDs7O09BR0c7SUFFSCxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUE7SUFDdEI7OztPQUdHO0lBRUgsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFBO0lBRXRCLElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3ZDLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsVUFBVTtRQUNwQixVQUFVLEVBQUUsWUFBWTtRQUN4QixHQUFHLEVBQUUsS0FBSztRQUNWLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFdBQVcsRUFBRSxhQUFhO1FBQzFCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsU0FBUyxFQUFFLFNBQVM7UUFDcEIsWUFBWSxFQUFFLGNBQWM7UUFDNUIsV0FBVyxFQUFFLGFBQWE7UUFDMUIsZUFBZSxFQUFFLGVBQWU7UUFDaEMsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsTUFBTTtRQUNaLEdBQUcsRUFBRSxLQUFLO1FBQ1YsUUFBUSxFQUFFLFVBQVU7UUFDcEIsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxvQkFBb0IsRUFBRSxzQkFBc0I7UUFDNUMsV0FBVyxFQUFFLGFBQWE7UUFDMUIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsR0FBRyxFQUFFLEtBQUs7UUFDVixHQUFHLEVBQUUsS0FBSztLQUNWLENBQUMsQ0FBQTtJQUVGOzs7T0FHRztJQUVIOzs7O09BSUc7SUFFSCxTQUFTLFFBQVE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFM0IsSUFBSSxVQUFVLElBQUksWUFBWSxFQUFFO1lBQy9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNWO1FBRUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2QsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxDQUFDO1FBQ2pCLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFFSCxTQUFTLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7UUFDaEUsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7O09BY0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1FBQzlELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxQix3RkFBd0Y7UUFDeEYsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtTQUNaO2FBQU07WUFDTixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdB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R0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxPQUFPLENBQ04sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDOUYsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDN0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoQyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzVCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ2pCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O1FBT0k7SUFFSixTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDL0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDcEIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztRQU1JO0lBRUosU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQSxDQUFDLDRCQUE0QjtRQUU1RCxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUUvRSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUE7U0FDWDtRQUVELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFD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QyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSztRQUMvQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLE9BQU8sQ0FDTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJ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QUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsT0FBTyxDQUFDLENBQUM7UUFDakIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFFSCxTQUFTLFlBQVksQ0FDcEIsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRztRQUVILElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BcUJHO0lBRUgsU0FBUyxLQUFLLENBQ2IsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUc7UUFFSCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxQix3RkFBd0Y7UUFDeEYsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1NBQ2I7YUFBTTtZQUNOLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZjtRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBLENBQUMsNEJBQTRCO1FBRTVELElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBRS9FLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQTtTQUNYO1FBRUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUNWLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUNWLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ04sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FDVixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNOLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQSxDQUFDLDRCQUE0QjtRQUU1RCxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO0lBQzdFLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQSxDQUFDLG1EQUFtRDtRQUVoRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUN0QixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUN0QixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUV0QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2hELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDaEQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNqRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ2pEO2FBQU07WUFDTixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzdDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDN0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUM3QyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQzdDO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7UUFPSTtJQUVKLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENB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QUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUEsQ0FBQyxnREFBZ0Q7UUFFNUQsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQyxrREFBa0Q7UUFFdEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMzQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFFM0MsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2Qsb0VBQW9FO1lBQ3BFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZjtRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUVmLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUNkLGdFQUFnRTtZQUNoRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUNmLENBQUMsOENBQThDO1FBRWhELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMzQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzNCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFZixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDZCxnRUFBZ0U7WUFDaEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZixDQUFDLDhDQUE4QztRQUVoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDM0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRWQsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2Qsb0VBQW9FO1lBQ3BFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ2YsQ0FBQyw4Q0FBOEM7UUFFaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFB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RyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQzlCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLDhDQUE4QztRQUVwRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDOUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsOENBQThDO1FBRXBFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxD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QTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksV0FBVyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25DLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxTQUFTLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQSxDQUFDLDhCQUE4QjtRQUVwRixJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7WUFDbEIsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFBO1lBQzFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQTtZQUMxRSxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUE7U0FDMUU7YUFBTTtZQUNOLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDNUQsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM1RCxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzVEO1FBRUQsdUJBQXVCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtRQUM1QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQy9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2hCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7T0FTRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQzNCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDckQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUNyRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ3JELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDNUIsdUhBQXVIO1FBQ3ZILElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVULElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNkLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7WUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDOUI7YUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUMvQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtZQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDOUI7YUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDNUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtZQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzlCO2FBQU07WUFDTixDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7U0FDakI7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7OztPQWdCRztJQUVILFNBQVMsNEJBQTRCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNqRCxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUM5QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BbUJHO0lBRUgsU0FBUyxrQ0FBa0MsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxRCxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDekIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ3pELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN6RCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDMUQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3JCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7O09BV0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHO1FBQ3hELElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUMzQixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUE7UUFDM0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFD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RUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUN4QixFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ3hCLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFFNUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDTixFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ04sRUFBRSxHQUFHLENBQUMsQ0FBQTtTQUNOO2FBQU07WUFDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEVBQUUsSUFBSSxHQUFHLENBQUE7WUFDVCxFQUFFLElBQUksR0FBRyxDQUFBO1lBQ1QsRUFBRSxJQUFJLEdBQUcsQ0FBQTtTQUNUO1FBRUQsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3RCLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDdEIsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUU1QyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNOLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDTixFQUFFLEdBQUcsQ0FBQyxDQUFBO1NBQ047YUFBTTtZQUNOLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ2IsRUFBRSxJQUFJLEdBQUcsQ0FBQTtZQUNULEVBQUUsSUFBSSxHQUFHLENBQUE7WUFDVCxFQUFFLElBQUksR0FBRyxDQUFBO1NBQ1Q7UUFFRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDOUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7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QUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSztRQUMvQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDL0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ2YsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixPQUFPLENBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLE9BQU8s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QUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMs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QUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFD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QUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtRQUMxRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtRQUMxRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtRQUMxRSxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSztRQUN6QixLQUFLLEdBQUcsS0FBSyxJQUFJLEdBQUcsQ0FBQTtRQUNwQixJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQTtRQUNoQyxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzVCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUNsQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUs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LEdBQUcsR0FBRyxJQUFJLENBQUE7UUFDdkIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUNULENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQywrQkFBK0I7UUFFdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxrQkFBa0I7UUFFckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQywrQkFBK0I7UUFFOUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUNULENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQywrQkFBK0I7UUFFdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxrQkFBa0I7UUFFckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQywrQkFBK0I7UUFFOUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUNULENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQywrQkFBK0I7UUFFdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxrQkFBa0I7UUFFckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FB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Q0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7O09BU0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxD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LENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUV2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDWixHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDeEI7UUFFRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMzQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUM3QixH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R0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzdCLEdBQUcsSUFBSSxHQUFHLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNyQixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsR0FBRyxJQUFJLEdBQUcsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ3JCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM3QixHQUFHLElBQUksR0FBRyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDckIsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFCLGNBQWM7UUFDZCx3REFBd0Q7UUFDeEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFBLENBQUMsY0FBYztRQUV0RCxLQUFLLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQSxD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QUFHLENBQUMsQ0FBQTtZQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ25CLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1lBQ25FLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFBO1lBQ3BCLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFBO1lBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1NBQzlDO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7OztPQVNHO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM5QixJQUFJLFNBQVMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3ZDLENBQUMsSUFBSSxTQUFTLENBQUE7UUFDZCxDQUFDLElBQUksU0FBUyxDQUFBO1FBQ2QsQ0FBQyxJQUFJLFNBQVMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQyxPQUFPLEdB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QUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FB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QUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUNoQixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFDaEIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQ2hCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2hELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2pELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDNUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDdEIsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDNUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDdEIsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDNUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDdEIsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUc7UUFDMUMsMEJBQTBCO1FBQzFCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLEVBQUU7WUFDNUIsT0FBTyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3JCO1FBRUQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3JGLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2YsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUE7UUFDbkMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBO1FBQ25DLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtRQUNuQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3RCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDdEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDdEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDdEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDdEQsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5RixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7O09BR0c7SUFFSCxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUE7SUFDdEI7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQTtJQUNqQjs7Ozs7Ozs7O09BU0c7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzNCLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxLQUFLLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3JCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENB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LENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLE9BQU8sQ0FDTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDeEUsQ0FBQTtJQUNGLENBQUM7SUFFRCxJQUFJLEtBQUssR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN2QyxNQUFNLEVBQUUsUUFBUTtRQUNoQixLQUFLLEVBQUUsT0FBTztRQUNkLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLDZCQUE2QixFQUFFLDZCQUE2QjtRQUM1RCx1QkFBdUIsRUFBRSx5QkFBeUI7UUFDbEQsZUFBZSxFQUFFLGlCQUFpQjtRQUNsQyxZQUFZLEVBQUUsY0FBYztRQUM1QixRQUFRLEVBQUUsVUFBVTtRQUNwQixJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLEdBQUcsRUFBRSxLQUFLO1FBQ1YsT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxTQUFTLEVBQUUsV0FBVztRQUN0QixPQUFPLEVBQUUsU0FBUztRQUNsQixPQUFPLEVBQUUsU0FBUztRQUNsQixPQUFPLEVBQUUsU0FBUztRQUNsQixrQkFBa0IsRUFBRSxrQkFBa0I7UUFDdEMsbUJBQW1CLEVBQUUsbUJBQW1CO1FBQ3hDLGdCQUFnQixFQUFFLGdCQUFnQjtRQUNsQyxHQUFHLEVBQUUsS0FBSztRQUNWLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLEdBQUcsRUFBRSxLQUFLO1FBQ1YsS0FBSyxFQUFFLE9BQU87UUFDZCxHQUFHLEVBQUUsS0FBSztRQUNWLElBQUksRUFBRSxNQUFNO1FBQ1osTUFBTSxFQUFFLFFBQVE7UUFDaEIsU0FBUyxFQUFFLFdBQVc7UUFDdEIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsR0FBRyxFQUFFLEtBQUs7UUFDVixhQUFhLEVBQUUsZUFBZTtRQUM5QixNQUFNLEVBQUUsUUFBUTtRQUNoQixTQUFTLEVBQUUsV0FBVztRQUN0QixHQUFHLEVBQUUsS0FBSztRQUNWLFdBQVcsRUFBRSxhQUFhO1FBQzFCLE1BQU0sRUFBRSxRQUFRO0tBQ2hCLENBQUMsQ0FBQTtJQUVGOzs7T0FHRztJQUVIOzs7O09BSUc7SUFFSCxTQUFTLFFBQVE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFM0IsSUFBSSxVQUFVLElBQUksWUFBWSxFQUFFO1lBQy9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQ1Y7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsT0FBTyxDQUFDLENBQUM7UUFDakIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN6QixJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFD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QWtDO0FBQ2pDLFFBQUksTUFBSjs7QUFDQSxRQUFJLElBQUksS0FBSyxpQkFBYixFQUFnQztBQUMvQixNQUFBLE1BQU0sR0FBRyxFQUFFLENBQUMsWUFBSCxDQUFnQixFQUFFLENBQUMsZUFBbkIsQ0FBVDtBQUNBLEtBRkQsTUFFTyxJQUFJLElBQUksS0FBSyxlQUFiLEVBQThCO0FBQ3BDLE1BQUEsTUFBTSxHQUFHLEVBQUUsQ0FBQyxZQUFILENBQWdCLEVBQUUsQ0FBQyxhQUFuQixDQUFUO0FBQ0EsS0FGTSxNQUVBO0FBQ04sYUFBTyxJQUFQO0FBQ0E7O0FBRUQsSUFBQSxFQUFFLENBQUMsWUFBSCxDQUFnQixNQUFoQixFQUF3QixJQUF4QjtBQUNBLElBQUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsTUFBakI7QUFFQSxXQUFPLE1BQVA7QUFDQTs7QUFFRCxFQUFBLEtBQUssZ0RBQXlDLElBQXpDLFdBQUwsQ0FDRSxJQURGLENBQ08sVUFBQyxJQUFEO0FBQUEsV0FBVSxJQUFJLENBQUMsSUFBTCxFQUFWO0FBQUEsR0FEUCxFQUVFLElBRkYsQ0FFTyxVQUFDLElBQUQ7QUFBQSxXQUFrQixZQUFZLENBQUMsSUFBRCxDQUE5QjtBQUFBLEdBRlAsRUFHRSxJQUhGLENBR08sVUFBQyxNQUFEO0FBQUEsV0FBeUIsT0FBTyxDQUFDLE1BQUQsQ0FBaEM7QUFBQSxHQUhQLEVBSUUsS0FKRixDQUlRLFVBQUMsR0FBRDtBQUFBLFdBQWdCLE1BQU0sQ0FBQyxHQUFELENBQXRCO0FBQUEsR0FKUixFQWxCK0IsQ0F3Qi9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaENELE9BQUEsQ0FBQSxZQUFBLEdBQUEsWUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBXZWJHTFV0aWxzLCB7IGFkZFRleHR1cmUsIGRlZ1RvUmFkIH0gZnJvbSAnLi93ZWJnbC1nb29nbGUtdXRpbHMnXHJcbmltcG9ydCB7IG1hdDQsIHZlYzMgfSBmcm9tICcuL3dlYmdsLW1hdHJpeCdcclxuaW1wb3J0IHsgY3JlYXRlUHJvZ3JhbSwgY3JlYXRlU2hhZGVyLCByZXNpemVDYW52YXNUb0Rpc3BsYXlTaXplIH0gZnJvbSAnLi93ZWJnbC11dGlscydcclxuXHJcbmxldCBnbDogYW55XHJcblxyXG5jb25zdCBhdHRyaWJzOiBhbnkgPSB7fVxyXG5jb25zdCB1bmlmb3JtczogYW55ID0ge31cclxuXHJcbmNvbnN0IHZpZXdNYXRyaXggPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbmNvbnN0IG1vZGVsTWF0cml4ID0gbWF0NC5pZGVudGl0eShtYXQ0LmNyZWF0ZSgpKVxyXG5jb25zdCBtb2RlbFZpZXdNYXRyaXggPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbmNvbnN0IHBlcnNwZWN0aXZlTWF0cml4ID0gbWF0NC5pZGVudGl0eShtYXQ0LmNyZWF0ZSgpKVxyXG5jb25zdCBtdnBNYXRyaXggPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbm1hdDQucGVyc3BlY3RpdmUocGVyc3BlY3RpdmVNYXRyaXgsIGRlZ1RvUmFkKDYwKSwgMSwgMSwgMTAwKVxyXG5cclxuY29uc3QgJCA9IGZ1bmN0aW9uKHNlbGVjdG9yOiBzdHJpbmcsIHFzPzogYm9vbGVhbik6IEhUTUxFbGVtZW50IHtcclxuXHRpZiAoIXFzKSByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpXHJcblx0cmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXHJcbn1cclxuXHJcbmludGVyZmFjZSBJU2NlbmUge1xyXG5cdG1vZGVsU2NhbGU6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdG1vZGVsUm90YXRlWDoge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0bW9kZWxSb3RhdGVZOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRtb2RlbFJvdGF0ZVo6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdG1vZGVsVHJhbnNsYXRlWDoge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0bW9kZWxUcmFuc2xhdGVZOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRtb2RlbFRyYW5zbGF0ZVo6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdGNhbWVyYVg6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdGNhbWVyYVk6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdGNhbWVyYVo6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdFtrZXk6IHN0cmluZ106IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBzY2VuZTogSVNjZW5lID0ge1xyXG5cdG1vZGVsU2NhbGU6IHtcclxuXHRcdGVsZW06IDxIVE1MRWxlbWVudD4kKCdtb2RlbFNjYWxlJyksXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdG1vZGVsUm90YXRlWDoge1xyXG5cdFx0ZWxlbTogPEhUTUxFbGVtZW50PiQoJ21vZGVsUm90YXRlWCcpLFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFJvdGF0ZVk6IHtcclxuXHRcdGVsZW06IDxIVE1MRWxlbWVudD4kKCdtb2RlbFJvdGF0ZVknKSxcclxuXHRcdHZhbHVlOiAwLFxyXG5cdH0sXHJcblx0bW9kZWxSb3RhdGVaOiB7XHJcblx0XHRlbGVtOiA8SFRNTEVsZW1lbnQ+JCgnbW9kZWxSb3RhdGVaJyksXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdG1vZGVsVHJhbnNsYXRlWDoge1xyXG5cdFx0ZWxlbTogPEhUTUxFbGVtZW50PiQoJ21vZGVsVHJhbnNsYXRlWCcpLFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFRyYW5zbGF0ZVk6IHtcclxuXHRcdGVsZW06IDxIVE1MRWxlbWVudD4kKCdtb2RlbFRyYW5zbGF0ZVknKSxcclxuXHRcdHZhbHVlOiAwLFxyXG5cdH0sXHJcblx0bW9kZWxUcmFuc2xhdGVaOiB7XHJcblx0XHRlbGVtOiA8SFRNTEVsZW1lbnQ+JCgnbW9kZWxUcmFuc2xhdGVaJyksXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdGNhbWVyYVg6IHtcclxuXHRcdGVsZW06IDxIVE1MRWxlbWVudD4kKCdjYW1lcmFYJyksXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdGNhbWVyYVk6IHtcclxuXHRcdGVsZW06IDxIVE1MRWxlbWVudD4kKCdjYW1lcmFZJyksXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdGNhbWVyYVo6IHtcclxuXHRcdGVsZW06IDxIVE1MRWxlbWVudD4kKCdjYW1lcmFaJyksXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG59XHJcblxyXG5jb25zdCBjb250cm9sUGFuZWwgPSAkKCdjb250cm9sLXBhbmVsJylcclxuY29uc3QgZnBzQ291bnRlciA9ICQoJ2Zwcy1jb3VudGVyJylcclxuY29uc3QgZnJhbWVDb3VudGVyID0gJCgnZnJhbWUtY291bnRlcicpXHJcbmNvbnN0IHRpbWVDb3VudGVyID0gJCgndGltZS1jb3VudGVyJylcclxuXHJcbmNvbnN0IGluaXRTaGFkZXJzID0gZnVuY3Rpb24ocmVzb2x2ZTogKCkgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiBFcnJvcikgPT4gdm9pZCkge1xyXG5cdGNvbnN0IGZTaGFkZXI6IFdlYkdMU2hhZGVyID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PlxyXG5cdFx0Y3JlYXRlU2hhZGVyKGdsLCAnZnJhZ21lbnQtc2hhZGVyJywgcmVzLCByZWopLFxyXG5cdClcclxuXHRjb25zdCB2U2hhZGVyOiBXZWJHTFNoYWRlciA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT5cclxuXHRcdGNyZWF0ZVNoYWRlcihnbCwgJ3ZlcnRleC1zaGFkZXInLCByZXMsIHJlaiksXHJcblx0KVxyXG5cclxuXHRQcm9taXNlLmFsbChbZlNoYWRlciwgdlNoYWRlcl0pLnRoZW4oKHNoYWRlcnMpID0+IHtcclxuXHRcdGdsLnByb2dyYW0gPSBjcmVhdGVQcm9ncmFtKGdsLCBzaGFkZXJzKVxyXG5cdFx0Z2wudXNlUHJvZ3JhbShnbC5wcm9ncmFtKVxyXG5cclxuXHRcdHJlc29sdmUoKVxyXG5cdH0pXHJcbn1cclxuXHJcbmNvbnN0IGluaXRWYXJpYWJsZXMgPSBmdW5jdGlvbigpIHtcclxuXHRhdHRyaWJzLmFQb3NpdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKGdsLnByb2dyYW0sICdhX1Bvc2l0aW9uJylcclxuXHRhdHRyaWJzLmFDb2xvciA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKGdsLnByb2dyYW0sICdhX0NvbG9yJylcclxuXHJcblx0dW5pZm9ybXMudVdpZHRoID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGdsLnByb2dyYW0sICd1X1dpZHRoJylcclxuXHR1bmlmb3Jtcy51SGVpZ2h0ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGdsLnByb2dyYW0sICd1X0hlaWdodCcpXHJcblx0dW5pZm9ybXMudU12cE1hdHJpeCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihnbC5wcm9ncmFtLCAndV9NdnBNYXRyaXgnKVxyXG59XHJcblxyXG5jb25zdCBpbml0VGV4dHVyZXMgPSBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdHJ1ZVxyXG59XHJcbi8vIHByZXR0aWVyLWlnbm9yZVxyXG5jb25zdCBpbml0QnVmZmVyID0gZnVuY3Rpb24oKTogbnVtYmVyIHtcclxuXHRjb25zdCB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG5cdFx0MS4wLCAxLjAsIDEuMCwgMS4wLCAxLjAsIDEuMCxcclxuXHRcdC0xLjAsIDEuMCwgMS4wLCAxLjAsIDAuMCwgMS4wLFxyXG5cdFx0LTEuMCwgLTEuMCwgMS4wLCAxLjAsIDAuMCwgMC4wLFxyXG5cdFx0MS4wLCAtMS4wLCAxLjAsIDEuMCwgMS4wLCAwLjAsXHJcblx0XHQxLjAsIC0xLjAsIC0xLjAsIDAuMCwgMS4wLCAwLjAsXHJcblx0XHQxLjAsIDEuMCwgLTEuMCwgMC4wLCAxLjAsIDEuMCxcclxuXHRcdC0xLjAsIDEuMCwgLTEuMCwgMC4wLCAwLjAsIDEuMCxcclxuXHRcdC0xLjAsIC0xLjAsIC0xLjAsIDAuMCwgMC4wLCAwLjAsXHJcblx0XSlcclxuXHJcblx0Y29uc3QgRlNJWkUgPSB2ZXJ0aWNlcy5CWVRFU19QRVJfRUxFTUVOVFxyXG5cclxuXHRjb25zdCB2ZXJ0ZXhCdWZmZXI6IFdlYkdMQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKClcclxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKVxyXG5cdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0aWNlcywgZ2wuU1RBVElDX0RSQVcpXHJcblxyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoYXR0cmlicy5hUG9zaXRpb24sIDMsIGdsLkZMT0FULCBmYWxzZSwgRlNJWkUgKiA2LCAwKVxyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGF0dHJpYnMuYVBvc2l0aW9uKVxyXG5cclxuXHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dHJpYnMuYUNvbG9yLCAzLCBnbC5GTE9BVCwgZmFsc2UsIEZTSVpFICogNiwgRlNJWkUgKiAzKVxyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGF0dHJpYnMuYUNvbG9yKVxyXG5cclxuXHRjb25zdCBpbmRpY2VzID0gbmV3IFVpbnQ4QXJyYXkoW1xyXG5cdFx0MCwgMSwgMiwgMCwgMiwgMyxcclxuXHRcdDAsIDMsIDQsIDAsIDQsIDUsXHJcblx0XHQwLCA1LCA2LCAwLCA2LCAxLFxyXG5cdFx0MSwgNiwgNywgMSwgNywgMixcclxuXHRcdDcsIDQsIDMsIDcsIDMsIDIsXHJcblx0XHQ0LCA3LCA2LCA0LCA2LCA1LFxyXG5cdF0pXHJcblxyXG5cdGNvbnN0IGluZGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhCdWZmZXIpXHJcblx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlcywgZ2wuU1RBVElDX0RSQVcpXHJcblxyXG5cdHJldHVybiBpbmRpY2VzLmxlbmd0aFxyXG59XHJcblxyXG5jb25zdCBkcmF3U2NlbmUgPSBmdW5jdGlvbigpIHtcclxuXHRnbC52aWV3cG9ydCgwLCAwLCBnbC5kcmF3aW5nQnVmZmVyV2lkdGgsIGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQpXHJcblxyXG5cdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKVxyXG5cclxuXHRjb25zdCBjYW1lcmEgPSB2ZWMzLmZyb21WYWx1ZXMoc2NlbmUuY2FtZXJhWC52YWx1ZSwgc2NlbmUuY2FtZXJhWS52YWx1ZSwgc2NlbmUuY2FtZXJhWi52YWx1ZSlcclxuXHRjb25zdCBjZW50ZXIgPSB2ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMClcclxuXHRjb25zdCB1cCA9IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKVxyXG5cclxuXHRtYXQ0Lmxvb2tBdCh2aWV3TWF0cml4LCBjYW1lcmEsIGNlbnRlciwgdXApXHJcblxyXG5cdG1hdDQuaWRlbnRpdHkobW9kZWxNYXRyaXgpXHJcblx0bWF0NC50cmFuc2xhdGUoXHJcblx0XHRtb2RlbE1hdHJpeCxcclxuXHRcdG1vZGVsTWF0cml4LFxyXG5cdFx0dmVjMy5mcm9tVmFsdWVzKFxyXG5cdFx0XHRzY2VuZS5tb2RlbFRyYW5zbGF0ZVgudmFsdWUsXHJcblx0XHRcdHNjZW5lLm1vZGVsVHJhbnNsYXRlWS52YWx1ZSxcclxuXHRcdFx0c2NlbmUubW9kZWxUcmFuc2xhdGVaLnZhbHVlLFxyXG5cdFx0KSxcclxuXHQpXHJcblx0bWF0NC5yb3RhdGVYKG1vZGVsTWF0cml4LCBtb2RlbE1hdHJpeCwgZGVnVG9SYWQoc2NlbmUubW9kZWxSb3RhdGVYLnZhbHVlKSlcclxuXHRtYXQ0LnJvdGF0ZVkobW9kZWxNYXRyaXgsIG1vZGVsTWF0cml4LCBkZWdUb1JhZChzY2VuZS5tb2RlbFJvdGF0ZVkudmFsdWUpKVxyXG5cdG1hdDQucm90YXRlWihtb2RlbE1hdHJpeCwgbW9kZWxNYXRyaXgsIGRlZ1RvUmFkKHNjZW5lLm1vZGVsUm90YXRlWi52YWx1ZSkpXHJcblx0bWF0NC5zY2FsZShcclxuXHRcdG1vZGVsTWF0cml4LFxyXG5cdFx0bW9kZWxNYXRyaXgsXHJcblx0XHR2ZWMzLmZyb21WYWx1ZXMoc2NlbmUubW9kZWxTY2FsZS52YWx1ZSwgc2NlbmUubW9kZWxTY2FsZS52YWx1ZSwgc2NlbmUubW9kZWxTY2FsZS52YWx1ZSksXHJcblx0KVxyXG5cdG1hdDQubXVsKG1vZGVsVmlld01hdHJpeCwgdmlld01hdHJpeCwgbW9kZWxNYXRyaXgpXHJcblx0bWF0NC5tdWwobXZwTWF0cml4LCBwZXJzcGVjdGl2ZU1hdHJpeCwgbW9kZWxWaWV3TWF0cml4KVxyXG5cclxuXHRnbC51bmlmb3JtTWF0cml4NGZ2KHVuaWZvcm1zLnVNdnBNYXRyaXgsIGZhbHNlLCBtdnBNYXRyaXgpXHJcblxyXG5cdGdsLnVuaWZvcm0xZih1bmlmb3Jtcy51V2lkdGgsIGdsLmRyYXdpbmdCdWZmZXJXaWR0aClcclxuXHRnbC51bmlmb3JtMWYodW5pZm9ybXMudUhlaWdodCwgZ2wuZHJhd2luZ0J1ZmZlckhlaWdodClcclxuXHJcblx0Z2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgMzYsIGdsLlVOU0lHTkVEX0JZVEUsIDApXHJcbn1cclxuXHJcbmxldCBsYXN0VGltZTogbnVtYmVyID0gPG51bWJlcj4wXHJcbmxldCBmcmFtZXM6IG51bWJlciA9IDBcclxubGV0IGZwczogbnVtYmVyIHwgc3RyaW5nXHJcbmNvbnN0IHJlbmRlciA9IGZ1bmN0aW9uKHRpbWU6IERPTUhpZ2hSZXNUaW1lU3RhbXAgPSAwKSB7XHJcblx0ZnBzID0gKDEwMDAgLyAodGltZSAtIGxhc3RUaW1lKSkudG9GaXhlZCgwKVxyXG5cdGZwc0NvdW50ZXIudGV4dENvbnRlbnQgPSBmcHNcclxuXHRmcmFtZUNvdW50ZXIudGV4dENvbnRlbnQgPSArK2ZyYW1lcyArICcnXHJcblx0dGltZUNvdW50ZXIudGV4dENvbnRlbnQgPSAodGltZSAvIDEwMDApLnRvRml4ZWQoMilcclxuXHRsYXN0VGltZSA9IHRpbWVcclxuXHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcilcclxuXHRkcmF3U2NlbmUoKVxyXG59XHJcblxyXG5jb25zdCB3ZWJHTFN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcblx0Y29uc3QgY2FudmFzOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJylcclxuXHJcblx0Y29uc3QgcG93ZXJQcmVmZXJlbmNlID0gJ2RlZmF1bHQnIHx8ICdoaWdoLXBlcmZvcm1hbmNlJyB8fCAnbG93LXBvd2VyJ1xyXG5cdGdsID0gV2ViR0xVdGlscy5zZXR1cFdlYkdMKGNhbnZhcywge1xyXG5cdFx0YWxwaGE6IHRydWUsXHJcblx0XHRkZXB0aDogdHJ1ZSxcclxuXHRcdHBvd2VyUHJlZmVyZW5jZSxcclxuXHR9KVxyXG5cclxuXHRnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMClcclxuXHRnbC5lbmFibGUoZ2wuREVQVEhfVEVTVClcclxuXHJcblx0cmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShnbC5jYW52YXMpXHJcblxyXG5cdGNvbnNvbGUubG9nKGdsKVxyXG5cclxuXHRjb25zdCBwcm9taXNlU2hhZGVyID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiBpbml0U2hhZGVycyhyZXMsIHJlaikpXHJcblx0cHJvbWlzZVNoYWRlclxyXG5cdFx0LnRoZW4oKCkgPT4gaW5pdFZhcmlhYmxlcygpKVxyXG5cdFx0LnRoZW4oKCkgPT4gaW5pdFRleHR1cmVzKCkpXHJcblx0XHQudGhlbigoKSA9PiBpbml0QnVmZmVyKCkpXHJcblx0XHQudGhlbigoaW5kaWNlcykgPT4gcmVuZGVyKCkpXHJcblx0XHQuY2F0Y2goKGVycm9yOiBFcnJvcikgPT4gY29uc29sZS5lcnJvcihlcnJvcikpXHJcbn1cclxuXHJcbmNvbnN0IHVwZGF0ZUluZm9iYXIgPSBmdW5jdGlvbihlbGVtOiBIVE1MRWxlbWVudCkge1xyXG5cdGVsZW0uaW5uZXJIVE1MID0gc2NlbmVbZWxlbS5pZF0udmFsdWUudG9GaXhlZCgyKVxyXG59XHJcblxyXG5jb25zdCBzZXRDYW52YXNDb250cm9scyA9IGZ1bmN0aW9uKCk6IHZvaWQge1xyXG5cdGxldCBpc1JvdGF0YWJsZSA9IGZhbHNlXHJcblxyXG5cdGdsLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZTogTW91c2VFdmVudCkgPT4gKGlzUm90YXRhYmxlID0gdHJ1ZSkpXHJcblx0Z2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZTogTW91c2VFdmVudCkgPT4gKGlzUm90YXRhYmxlID0gZmFsc2UpKVxyXG5cdGdsLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZTogTW91c2VFdmVudCkgPT4ge1xyXG5cdFx0aWYgKCFpc1JvdGF0YWJsZSkgcmV0dXJuIGZhbHNlXHJcblxyXG5cdFx0c2NlbmUubW9kZWxSb3RhdGVYLnZhbHVlICs9IGUubW92ZW1lbnRZXHJcblx0XHRzY2VuZS5tb2RlbFJvdGF0ZVkudmFsdWUgKz0gZS5tb3ZlbWVudFhcclxuXHJcblx0XHR1cGRhdGVJbmZvYmFyKHNjZW5lLm1vZGVsUm90YXRlWC5lbGVtKVxyXG5cdFx0dXBkYXRlSW5mb2JhcihzY2VuZS5tb2RlbFJvdGF0ZVkuZWxlbSlcclxuXHR9KVxyXG59XHJcblxyXG4vLyBwcmV0dGllci1pZ25vcmVcclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cdGZvciAoY29uc3Qga2V5IGluIHNjZW5lKSB7XHJcblx0XHRzY2VuZVtrZXldLnZhbHVlID0gK3BhcnNlRmxvYXQoc2NlbmVba2V5XS5lbGVtLmlubmVySFRNTClcclxuXHR9XHJcblxyXG5cdHdlYkdMU3RhcnQoKVxyXG5cdHNldENhbnZhc0NvbnRyb2xzKClcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIChlOiBFdmVudCkgPT4gcmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShnbC5jYW52YXMpKVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCAoZTogV2hlZWxFdmVudCkgPT4ge1xyXG5cdGNvbnN0IGRpcmVjdGlvbiA9IGUuZGVsdGFZIDwgMCA/IC0wLjE1IDogMC4xNVxyXG5cdHNjZW5lLmNhbWVyYVoudmFsdWUgKz0gZGlyZWN0aW9uXHJcblx0dXBkYXRlSW5mb2JhcihzY2VuZS5jYW1lcmFaLmVsZW0pXHJcbn0pXHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAyMDEwLCBHb29nbGUgSW5jLlxyXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKlxyXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcclxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxyXG4gKiBtZXQ6XHJcbiAqXHJcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XHJcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxyXG4gKiBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyXHJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcclxuICogZGlzdHJpYnV0aW9uLlxyXG4gKiAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdvb2dsZSBJbmMuIG5vciB0aGUgbmFtZXMgb2YgaXRzXHJcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXHJcbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcclxuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxyXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcclxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcclxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXHJcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcclxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXHJcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxyXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXHJcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxyXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKlxyXG4gKiBNb2RpZmllZCBieSBBbGV4IEdhcm5lYXUgLSBGZWIgMiwgMjAxMiAtIGdza2lubmVyLmNvbSBpbmMuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBmaWxlIGNvbnRhaW5zIGZ1bmN0aW9ucyBldmVyeSB3ZWJnbCBwcm9ncmFtIHdpbGwgbmVlZFxyXG4gKiBhIHZlcnNpb24gb2Ygb25lIHdheSBvciBhbm90aGVyLlxyXG4gKlxyXG4gKiBJbnN0ZWFkIG9mIHNldHRpbmcgdXAgYSBjb250ZXh0IG1hbnVhbGx5IGl0IGlzIHJlY29tbWVuZGVkIHRvXHJcbiAqIHVzZS4gVGhpcyB3aWxsIGNoZWNrIGZvciBzdWNjZXNzIG9yIGZhaWx1cmUuIE9uIGZhaWx1cmUgaXRcclxuICogd2lsbCBhdHRlbXB0IHRvIHByZXNlbnQgYW4gYXBwcm9yaWF0ZSBtZXNzYWdlIHRvIHRoZSB1c2VyLlxyXG4gKlxyXG4gKiAgICAgICBnbCA9IFdlYkdMVXRpbHMuc2V0dXBXZWJHTChjYW52YXMpO1xyXG4gKlxyXG4gKiBGb3IgYW5pbWF0ZWQgV2ViR0wgYXBwcyB1c2Ugb2Ygc2V0VGltZW91dCBvciBzZXRJbnRlcnZhbCBhcmVcclxuICogZGlzY291cmFnZWQuIEl0IGlzIHJlY29tbWVuZGVkIHlvdSBzdHJ1Y3R1cmUgeW91ciByZW5kZXJpbmdcclxuICogbG9vcCBsaWtlIHRoaXMuXHJcbiAqXHJcbiAqICAgICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICogICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1GcmFtZShyZW5kZXIsIGNhbnZhcyk7XHJcbiAqXHJcbiAqICAgICAgICAgLy8gZG8gcmVuZGVyaW5nXHJcbiAqICAgICAgICAgLi4uXHJcbiAqICAgICAgIH1cclxuICogICAgICAgcmVuZGVyKCk7XHJcbiAqXHJcbiAqIFRoaXMgd2lsbCBjYWxsIHlvdXIgcmVuZGVyaW5nIGZ1bmN0aW9uIHVwIHRvIHRoZSByZWZyZXNoIHJhdGVcclxuICogb2YgeW91ciBkaXNwbGF5IGJ1dCB3aWxsIHN0b3AgcmVuZGVyaW5nIGlmIHlvdXIgYXBwIGlzIG5vdFxyXG4gKiB2aXNpYmxlLlxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3NpdGlvbkZyb21NYXRyaXgobWF0cml4OiBudW1iZXJbXSkge1xyXG5cdHJldHVybiB7IHg6IG1hdHJpeFsxMl0sIHk6IG1hdHJpeFsxM10sIHo6IG1hdHJpeFsxNF0gfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um90YXRpb25Gcm9tTWF0cml4KG1hdHJpeDogbnVtYmVyW10pIHtcclxuXHRyZXR1cm4geyB4OiBNYXRoLmFzaW4obWF0cml4WzZdKSwgeTogTWF0aC5hc2luKG1hdHJpeFs4XSksIHo6IE1hdGguYXNpbihtYXRyaXhbMV0pIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZ1RvUmFkKGRlZ3JlZXM6IG51bWJlciB8IHN0cmluZyk6IG51bWJlciB7XHJcblx0cmV0dXJuIChwYXJzZUZsb2F0KDxzdHJpbmc+ZGVncmVlcykgKiBNYXRoLlBJKSAvIDE4MFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCkge1xyXG5cdHJldHVybiB7IHg6IGV2ZW50Lm9mZnNldFgsIHk6IGV2ZW50Lm9mZnNldFkgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZUZyb21Nb3VzZShcclxuXHRjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG5cdG1vdXNlOiBNb3VzZUV2ZW50LFxyXG5cdGdyaWRTaXplOiBudW1iZXIsXHJcblx0R1JJRF9XSURUSDogbnVtYmVyLFxyXG5cdEdSSURfSEVJR0hUOiBudW1iZXIsXHJcbikge1xyXG5cdC8vIFdlJ3JlIGdldHRpbmcgaXQgaW4gdGhpcyBmb3JtYXQ6IGxlZnQ9MCwgcmlnaHQ9Z3JpZFNpemUuIFNhbWUgd2l0aCB0b3AgYW5kIGJvdHRvbS5cclxuXHQvLyBGaXJzdCwgbGV0J3Mgc2VlIHdoYXQgdGhlIGdyaWQgbG9va3MgbGlrZSBjb21wYXJlZCB0byB0aGUgY2FudmFzLlxyXG5cdC8vIEl0cyBib3JkZXJzIHdpbGwgYWx3YXlzIGJlIHRvdWNoaW5nIHdoaWNoZXZlciBwYXJ0J3MgdGhpbm5lcjogdGhlIHdpZHRoIG9yIHRoZSBoZWlnaHQuXHJcblxyXG5cdGNvbnN0IG1pZGRsZUNhbnZhcyA9IHsgeDogY2FudmFzLndpZHRoIC8gMiwgeTogY2FudmFzLmhlaWdodCAvIDIgfVxyXG5cclxuXHRjb25zdCBwb3MgPSB7XHJcblx0XHR4OiAoZ3JpZFNpemUgKiAobW91c2UueCAtIChtaWRkbGVDYW52YXMueCAtIEdSSURfV0lEVEggKiAwLjUpKSkgLyBHUklEX1dJRFRILFxyXG5cdFx0eTogKGdyaWRTaXplICogKG1vdXNlLnkgLSAobWlkZGxlQ2FudmFzLnkgLSBHUklEX0hFSUdIVCAqIDAuNSkpKSAvIEdSSURfSEVJR0hULFxyXG5cdH1cclxuXHJcblx0aWYgKHBvcy54ID49IDAgJiYgcG9zLnggPD0gZ3JpZFNpemUgJiYgcG9zLnkgPj0gMCAmJiBwb3MueSA8PSBncmlkU2l6ZSkge1xyXG5cdFx0Y29uc3QgaXRlbSA9IHsgeDogcG9zLnggfCAwLCB5OiBwb3MueSB8IDAgfVxyXG5cdFx0cmV0dXJuIGl0ZW1cclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIG51bGxcclxuXHR9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvb3JkaW5hdGVGcm9tTW91c2UoXHJcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRtb3VzZTogTW91c2VFdmVudCxcclxuXHRncmlkU2l6ZTogbnVtYmVyLFxyXG5cdEdSSURfV0lEVEg6IG51bWJlcixcclxuXHRHUklEX0hFSUdIVDogbnVtYmVyLFxyXG4pIHtcclxuXHQvLyBXZSdyZSBnZXR0aW5nIGl0IGluIHRoaXMgZm9ybWF0OiBsZWZ0PTAsIHJpZ2h0PWdyaWRTaXplLiBTYW1lIHdpdGggdG9wIGFuZCBib3R0b20uXHJcblx0Ly8gRmlyc3QsIGxldCdzIHNlZSB3aGF0IHRoZSBncmlkIGxvb2tzIGxpa2UgY29tcGFyZWQgdG8gdGhlIGNhbnZhcy5cclxuXHQvLyBJdHMgYm9yZGVycyB3aWxsIGFsd2F5cyBiZSB0b3VjaGluZyB3aGljaGV2ZXIgcGFydCdzIHRoaW5uZXI6IHRoZSB3aWR0aCBvciB0aGUgaGVpZ2h0LlxyXG5cclxuXHRjb25zdCBtaWRkbGVDYW52YXMgPSB7IHg6IGNhbnZhcy53aWR0aCwgeTogY2FudmFzLmhlaWdodCB9XHJcblxyXG5cdGNvbnN0IHBvcyA9IHtcclxuXHRcdHg6IChncmlkU2l6ZSAqIChtb3VzZS54IC0gKG1pZGRsZUNhbnZhcy54IC0gR1JJRF9XSURUSCAqIDAuNSkpKSAvIEdSSURfV0lEVEgsXHJcblx0XHR5OiAoZ3JpZFNpemUgKiAobW91c2UueSAtIChtaWRkbGVDYW52YXMueSAtIEdSSURfSEVJR0hUICogMC41KSkpIC8gR1JJRF9IRUlHSFQsXHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcG9zXHJcbn1cclxuXHJcbi8qXHJcbiAqIFdoZW4gYW4gaW1hZ2UgaXMgbG9hZGVkLCB0aGlzIHdpbGwgc3RvcmUgaXQgaW4gdGhlIHNoYWRlciB0byBiZSB1c2VkIGJ5IHRoZSBzYW1wbGVyIHJlZmVyZW5jZXMuXHJcbiAqIEZvciBleGFtcGxlLCB0byB1c2UgdGhlIHRleHR1cmUgc3RvcmVkIGF0IFRFWFRVUkUwLCB5b3Ugc2V0IHRoZSBzYW1wbGVyIHRvIDAuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRleHR1cmUoZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgaW1hZ2VVUkw6IHN0cmluZywgZ2xUZXh0dXJlOiBHTGVudW0pIHtcclxuXHRmdW5jdGlvbiBpc1Bvd2VyT2YyKHZhbHVlOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHRcdGlmICgodmFsdWUgJiAodmFsdWUgLSAxKSkgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIHRydWVcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNvbnN0IHRleHR1cmU6IGFueSA9IGdsLmNyZWF0ZVRleHR1cmUoKVxyXG5cdHRleHR1cmUuaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG5cdHRleHR1cmUuaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRnbC5hY3RpdmVUZXh0dXJlKGdsVGV4dHVyZSlcclxuXHRcdGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIDEpXHJcblx0XHRnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKVxyXG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUilcclxuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpXHJcblx0XHRnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIHRoaXMpXHJcblxyXG5cdFx0Ly8gVGhpcyBjbGFtcHMgaW1hZ2VzIHdob3NlIGRpbWVuc2lvbnMgYXJlIG5vdCBhIHBvd2VyIG9mIDIsIGxldHRpbmcgeW91IHVzZSBpbWFnZXMgb2YgYW55IHNpemUuXHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKVxyXG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSlcclxuXHR9XHJcblxyXG5cdHRleHR1cmUuaW1hZ2Uuc3JjID0gaW1hZ2VVUkxcclxuXHRyZXR1cm4gdGV4dHVyZVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZWFzZShmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIsIGVhc2luZXNzOiBudW1iZXIpIHtcclxuXHRpZiAoZWFzaW5lc3MgPiAxKSB7XHJcblx0XHRlYXNpbmVzcyA9IDEgLyBlYXNpbmVzc1xyXG5cdH1cclxuXHRyZXR1cm4gKHRvIC0gZnJvbSkgKiBlYXNpbmVzc1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGlzcGxheUFsZXJ0TWF0cml4KG1hdHJpeDogbnVtYmVyW10pIHtcclxuXHRsZXQgdGVzdFN0cmluZyA9ICcnXHJcblx0Zm9yIChsZXQgaSA9IDAsIGwgPSBtYXRyaXgubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHRpZiAoaSAlIDQgPT09IDAgJiYgaSA+IDApIHtcclxuXHRcdFx0dGVzdFN0cmluZyArPSAnXFxuJ1xyXG5cdFx0fVxyXG5cdFx0dGVzdFN0cmluZyArPSBtYXRyaXhbaV0gKyAnLCAnXHJcblx0fVxyXG5cdHRlc3RTdHJpbmcgKz0gJydcclxuXHRhbGVydCh0ZXN0U3RyaW5nKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkVmVjdG9ycyh2ZWMxOiBudW1iZXJbXSwgdmVjMjogbnVtYmVyW10pIHtcclxuXHRmb3IgKGxldCBpID0gMCwgbCA9IHZlYzEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHRpZiAodmVjMltpXSkge1xyXG5cdFx0XHR2ZWMxW2ldICs9IHZlYzJbaV1cclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIHZlYzFcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3RWZWN0b3JzKHZlYzE6IG51bWJlcltdLCB2ZWMyOiBudW1iZXJbXSkge1xyXG5cdGZvciAobGV0IGkgPSAwLCBsID0gdmVjMS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuXHRcdGlmICh2ZWMyW2ldKSB7XHJcblx0XHRcdHZlYzFbaV0gLT0gdmVjMltpXVxyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gdmVjMVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZVZlY3Rvcih2ZWM6IG51bWJlcltdKSB7XHJcblx0Zm9yIChsZXQgaSA9IDAsIGwgPSB2ZWMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHR2ZWNbaV0gPSAxIC0gTWF0aC5hYnModmVjW2ldKVxyXG5cdH1cclxuXHRyZXR1cm4gdmVjXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhbGVydE1hdDQobWF0OiBudW1iZXJbXSkge1xyXG5cdGxldCBzdHJpbmcgPSAnWydcclxuXHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuXHRcdGZvciAobGV0IGogPSAwOyBqIDwgNDsgaisrKSB7XHJcblx0XHRcdHN0cmluZyArPSBNYXRoLnJvdW5kKG1hdFtpICogNCArIGpdKS50b1N0cmluZygpICsgJywgXFx0J1xyXG5cdFx0fVxyXG5cdFx0c3RyaW5nICs9ICdcXG4nXHJcblx0fVxyXG5cdHN0cmluZyArPSAnXSdcclxuXHRhbGVydChzdHJpbmcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBGbG9hdDMyQ29uY2F0KG9yaWdpbmFsOiBudW1iZXJbXSwgYWRkaXRpb246IG51bWJlcltdKSB7XHJcblx0aWYgKCFvcmlnaW5hbCkge1xyXG5cdFx0cmV0dXJuIGFkZGl0aW9uXHJcblx0fVxyXG5cclxuXHRjb25zdCBsZW5ndGggPSBvcmlnaW5hbC5sZW5ndGhcclxuXHRjb25zdCB0b3RhbExlbmd0aCA9IGxlbmd0aCArIGFkZGl0aW9uLmxlbmd0aFxyXG5cclxuXHRjb25zdCByZXN1bHQgPSBuZXcgRmxvYXQzMkFycmF5KHRvdGFsTGVuZ3RoKVxyXG5cclxuXHRyZXN1bHQuc2V0KG9yaWdpbmFsKVxyXG5cdHJlc3VsdC5zZXQoYWRkaXRpb24sIGxlbmd0aClcclxuXHJcblx0cmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5sZXQgdG90YWxUaW1lUGFzc2VkID0gMFxyXG5sZXQgbGFzdFRpbWVQYXNzZWQgPSAwXHJcbmV4cG9ydCBmdW5jdGlvbiBDb25zb2xlVGltZVBhc3NlZChtZXNzYWdlOiBzdHJpbmcpIHtcclxuXHR0b3RhbFRpbWVQYXNzZWQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG5cdGNvbnNvbGUubG9nKG1lc3NhZ2UgKyAnOiAnICsgKHRvdGFsVGltZVBhc3NlZCAtIGxhc3RUaW1lUGFzc2VkKSlcclxuXHRsYXN0VGltZVBhc3NlZCA9IHRvdGFsVGltZVBhc3NlZFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZWFzZU5vcm1hbFZlYyh2ZWM6IG51bWJlcltdKSB7XHJcblx0dmVjWzBdICs9ICgxIC0gdmVjWzBdKSAvIDJcclxuXHR2ZWNbMV0gKz0gKDEgLSB2ZWNbMV0pIC8gMlxyXG5cdHZlY1syXSArPSAoMSAtIHZlY1syXSkgLyAyXHJcblxyXG5cdHJldHVybiB2ZWNcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmV0d2VlblZlYyhtaW46IG51bWJlcltdLCByYW5nZTogbnVtYmVyW10pIHtcclxuXHRjb25zdCB2ZWM6IG51bWJlcltdID0gWzAsIDAsIDBdXHJcblx0dmVjWzBdID0gTWF0aC5yYW5kb20oKSAqIHJhbmdlWzBdICsgbWluWzBdXHJcblx0dmVjWzFdID0gTWF0aC5yYW5kb20oKSAqIHJhbmdlWzFdICsgbWluWzFdXHJcblx0dmVjWzJdID0gTWF0aC5yYW5kb20oKSAqIHJhbmdlWzJdICsgbWluWzJdXHJcblxyXG5cdHJldHVybiB2ZWNcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZSh2ZWM6IG51bWJlcltdKSB7XHJcblx0bGV0IGkgPSAwXHJcblx0bGV0IHRvdGFsID0gMFxyXG5cdGNvbnN0IGwgPSB2ZWMubGVuZ3RoXHJcblx0Zm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG5cdFx0dG90YWwgKz0gdmVjW2ldXHJcblx0fVxyXG5cdGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuXHRcdHZlY1tpXSAvPSB0b3RhbFxyXG5cdH1cclxuXHRyZXR1cm4gdmVjXHJcbn1cclxuXHJcbmNvbnN0IFdlYkdMVXRpbHMgPSAoZnVuY3Rpb24oKSB7XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyB0aGUgSFRMTSBmb3IgYSBmYWlsdXJlIG1lc3NhZ2VcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gY2FudmFzQ29udGFpbmVySWQgaWQgb2YgY29udGFpbmVyIG9mIHRoXHJcblx0ICogICAgICAgIGNhbnZhcy5cclxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBodG1sLlxyXG5cdCAqL1xyXG5cdGNvbnN0IG1ha2VGYWlsSFRNTCA9IGZ1bmN0aW9uKG1zZzogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdCcnICtcclxuXHRcdFx0Jzx0YWJsZSBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICM4Q0U7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7XCI+PHRyPicgK1xyXG5cdFx0XHQnPHRkIGFsaWduPVwiY2VudGVyXCI+JyArXHJcblx0XHRcdCc8ZGl2IHN0eWxlPVwiZGlzcGxheTogdGFibGUtY2VsbDsgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcIj4nICtcclxuXHRcdFx0JzxkaXYgc3R5bGU9XCJcIj4nICtcclxuXHRcdFx0bXNnICtcclxuXHRcdFx0JzwvZGl2PicgK1xyXG5cdFx0XHQnPC9kaXY+JyArXHJcblx0XHRcdCc8L3RkPjwvdHI+PC90YWJsZT4nXHJcblx0XHQpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNZXNhc2dlIGZvciBnZXR0aW5nIGEgd2ViZ2wgYnJvd3NlclxyXG5cdCAqIEB0eXBlIHtzdHJpbmd9XHJcblx0ICovXHJcblx0Y29uc3QgR0VUX0FfV0VCR0xfQlJPV1NFUjogc3RyaW5nID1cclxuXHRcdCcnICtcclxuXHRcdCdUaGlzIHBhZ2UgcmVxdWlyZXMgYSBicm93c2VyIHRoYXQgc3VwcG9ydHMgV2ViR0wuPGJyLz4nICtcclxuXHRcdCc8YSBocmVmPVwiaHR0cDovL2dldC53ZWJnbC5vcmdcIj5DbGljayBoZXJlIHRvIHVwZ3JhZGUgeW91ciBicm93c2VyLjwvYT4nXHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lc2FzZ2UgZm9yIG5lZWQgYmV0dGVyIGhhcmR3YXJlXHJcblx0ICogQHR5cGUge3N0cmluZ31cclxuXHQgKi9cclxuXHRjb25zdCBPVEhFUl9QUk9CTEVNOiBzdHJpbmcgPSBgSXQgZG9lc24ndCBhcHBlYXIgeW91ciBjb21wdXRlciBjYW4gc3VwcG9ydCBXZWJHTC48YnIvPlxyXG5cdFx0PGEgaHJlZj1cImh0dHA6Ly9nZXQud2ViZ2wub3JnL3Ryb3VibGVzaG9vdGluZy9cIj5DbGljayBoZXJlIGZvciBtb3JlIGluZm9ybWF0aW9uLjwvYT5gXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSB3ZWJnbCBjb250ZXh0LiBJZiBjcmVhdGlvbiBmYWlscyBpdCB3aWxsXHJcblx0ICogY2hhbmdlIHRoZSBjb250ZW50cyBvZiB0aGUgY29udGFpbmVyIG9mIHRoZSA8Y2FudmFzPlxyXG5cdCAqIHRhZyB0byBhbiBlcnJvciBtZXNzYWdlIHdpdGggdGhlIGNvcnJlY3QgbGlua3MgZm9yIFdlYkdMLlxyXG5cdCAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhcy4gVGhlIGNhbnZhcyBlbGVtZW50IHRvIGNyZWF0ZSBhXHJcblx0ICogICAgIGNvbnRleHQgZnJvbS5cclxuXHQgKiBAcGFyYW0ge1dlYkdMQ29udGV4dENyZWF0aW9uQXR0aXJidXRlc30gb3B0X2F0dHJpYnMgQW55XHJcblx0ICogICAgIGNyZWF0aW9uIGF0dHJpYnV0ZXMgeW91IHdhbnQgdG8gcGFzcyBpbi5cclxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uOihtc2cpfSBvcHRfb25FcnJvciBBbiBmdW5jdGlvbiB0byBjYWxsXHJcblx0ICogICAgIGlmIHRoZXJlIGlzIGFuIGVycm9yIGR1cmluZyBjcmVhdGlvbi5cclxuXHQgKiBAcmV0dXJuIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IFRoZSBjcmVhdGVkIGNvbnRleHQuXHJcblx0ICovXHJcblx0Y29uc3Qgc2V0dXBXZWJHTCA9IGZ1bmN0aW9uKFxyXG5cdFx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRcdG9wdF9hdHRyaWJzPzogb2JqZWN0LFxyXG5cdFx0b3B0X29uRXJyb3I/OiBhbnksXHJcblx0KTogV2ViR0xSZW5kZXJpbmdDb250ZXh0IHwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHtcclxuXHRcdGZ1bmN0aW9uIGhhbmRsZUNyZWF0aW9uRXJyb3IobXNnOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0Y29uc3QgY29udGFpbmVyOiBOb2RlID0gY2FudmFzLnBhcmVudE5vZGVcclxuXHRcdFx0aWYgKGNvbnRhaW5lcikge1xyXG5cdFx0XHRcdGxldCBzdHIgPSAoPGFueT53aW5kb3cpLldlYkdMUmVuZGVyaW5nQ29udGV4dCA/IE9USEVSX1BST0JMRU0gOiBHRVRfQV9XRUJHTF9CUk9XU0VSXHJcblx0XHRcdFx0aWYgKG1zZykge1xyXG5cdFx0XHRcdFx0c3RyICs9ICc8YnIvPjxici8+U3RhdHVzOiAnICsgbXNnXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnRhaW5lci50ZXh0Q29udGVudCA9IG1ha2VGYWlsSFRNTChzdHIpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRvcHRfb25FcnJvciA9IG9wdF9vbkVycm9yIHx8IGhhbmRsZUNyZWF0aW9uRXJyb3JcclxuXHJcblx0XHRpZiAoY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmdsY29udGV4dGNyZWF0aW9uZXJyb3InLCAoZXZlbnQ6IFdlYkdMQ29udGV4dEV2ZW50KSA9PlxyXG5cdFx0XHRcdG9wdF9vbkVycm9yKGV2ZW50LnN0YXR1c01lc3NhZ2UpLFxyXG5cdFx0XHQpXHJcblx0XHR9XHJcblx0XHRjb25zdCBjb250ZXh0ID0gY3JlYXRlM0RDb250ZXh0KGNhbnZhcywgb3B0X2F0dHJpYnMpXHJcblx0XHRpZiAoIWNvbnRleHQpIHtcclxuXHRcdFx0aWYgKCEoPGFueT53aW5kb3cpLldlYkdMUmVuZGVyaW5nQ29udGV4dCkge1xyXG5cdFx0XHRcdG9wdF9vbkVycm9yKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY29udGV4dFxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIHdlYmdsIGNvbnRleHQuXHJcblx0ICogQHBhcmFtIHshQ2FudmFzfSBjYW52YXMgVGhlIGNhbnZhcyB0YWcgdG8gZ2V0IGNvbnRleHRcclxuXHQgKiAgICAgZnJvbS4gSWYgb25lIGlzIG5vdCBwYXNzZWQgaW4gb25lIHdpbGwgYmUgY3JlYXRlZC5cclxuXHQgKiBAcmV0dXJuIHshV2ViR0xDb250ZXh0fSBUaGUgY3JlYXRlZCBjb250ZXh0LlxyXG5cdCAqL1xyXG5cdGNvbnN0IGNyZWF0ZTNEQ29udGV4dCA9IGZ1bmN0aW9uKFxyXG5cdFx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRcdG9wdF9hdHRyaWJzPzogb2JqZWN0LFxyXG5cdCk6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XHJcblx0XHRjb25zdCBuYW1lcyA9IFsnd2ViZ2wnLCAnZXhwZXJpbWVudGFsLXdlYmdsJywgJ3dlYmtpdC0zZCcsICdtb3otd2ViZ2wnXVxyXG5cdFx0bGV0IGNvbnRleHQgPSBudWxsXHJcblx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQobmFtZSwgb3B0X2F0dHJpYnMpXHJcblx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGNvbnRleHQpIHtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY29udGV4dFxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHsgc2V0dXBXZWJHTCwgY3JlYXRlM0RDb250ZXh0IH1cclxufSkoKVxyXG5cclxud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gKFxyXG5cdFx0KDxhbnk+d2luZG93KS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuXHRcdCg8YW55PndpbmRvdykud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHQoPGFueT53aW5kb3cpLm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0KDxhbnk+d2luZG93KS5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHQoPGFueT53aW5kb3cpLm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHRmdW5jdGlvbihjYWxsYmFjazogKCkgPT4gdm9pZCkge1xyXG5cdFx0XHR3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDE1KVxyXG5cdFx0fVxyXG5cdClcclxufSkoKVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2ViR0xVdGlsc1xyXG4iLCIvKiFcclxuQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcclxuQGF1dGhvciBCcmFuZG9uIEpvbmVzXHJcbkBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXHJcbkB2ZXJzaW9uIDMuMC4wLTBcclxuXHJcbkNvcHlyaWdodCAoYykgMjAxNS0yMDE4LCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuXHJcblxyXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXHJcblRIRSBTT0ZUV0FSRS5cclxuXHJcbiovXHJcbjsoZnVuY3Rpb24oZ2xvYmFsLCBmYWN0b3J5KSB7XHJcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnXHJcblx0XHQ/IGZhY3RvcnkoZXhwb3J0cylcclxuXHRcdDogdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kXHJcblx0XHQ/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSlcclxuXHRcdDogZmFjdG9yeSgoZ2xvYmFsLmdsTWF0cml4ID0ge30pKVxyXG59KSh0aGlzLCBmdW5jdGlvbihleHBvcnRzKSB7XHJcblx0J3VzZSBzdHJpY3QnXHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbW1vbiB1dGlsaXRpZXNcclxuXHQgKiBAbW9kdWxlIGdsTWF0cml4XHJcblx0ICovXHJcblx0Ly8gQ29uZmlndXJhdGlvbiBDb25zdGFudHNcclxuXHR2YXIgRVBTSUxPTiA9IDAuMDAwMDAxXHJcblx0dmFyIEFSUkFZX1RZUEUgPSB0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJyA/IEZsb2F0MzJBcnJheSA6IEFycmF5XHJcblx0dmFyIFJBTkRPTSA9IE1hdGgucmFuZG9tXHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2VzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge1R5cGV9IHR5cGUgQXJyYXkgdHlwZSwgc3VjaCBhcyBGbG9hdDMyQXJyYXkgb3IgQXJyYXlcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0TWF0cml4QXJyYXlUeXBlKHR5cGUpIHtcclxuXHRcdEFSUkFZX1RZUEUgPSB0eXBlXHJcblx0fVxyXG5cdHZhciBkZWdyZWUgPSBNYXRoLlBJIC8gMTgwXHJcblx0LyoqXHJcblx0ICogQ29udmVydCBEZWdyZWUgVG8gUmFkaWFuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYSBBbmdsZSBpbiBEZWdyZWVzXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRvUmFkaWFuKGEpIHtcclxuXHRcdHJldHVybiBhICogZGVncmVlXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRlc3RzIHdoZXRoZXIgb3Igbm90IHRoZSBhcmd1bWVudHMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIHZhbHVlLCB3aXRoaW4gYW4gYWJzb2x1dGVcclxuXHQgKiBvciByZWxhdGl2ZSB0b2xlcmFuY2Ugb2YgZ2xNYXRyaXguRVBTSUxPTiAoYW4gYWJzb2x1dGUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIHZhbHVlcyBsZXNzXHJcblx0ICogdGhhbiBvciBlcXVhbCB0byAxLjAsIGFuZCBhIHJlbGF0aXZlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciBsYXJnZXIgdmFsdWVzKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIGZpcnN0IG51bWJlciB0byB0ZXN0LlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIFRoZSBzZWNvbmQgbnVtYmVyIHRvIHRlc3QuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG51bWJlcnMgYXJlIGFwcHJveGltYXRlbHkgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcclxuXHRcdHJldHVybiBNYXRoLmFicyhhIC0gYikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYSksIE1hdGguYWJzKGIpKVxyXG5cdH1cclxuXHJcblx0dmFyIGNvbW1vbiA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRFUFNJTE9OOiBFUFNJTE9OLFxyXG5cdFx0Z2V0IEFSUkFZX1RZUEUoKSB7XHJcblx0XHRcdHJldHVybiBBUlJBWV9UWVBFXHJcblx0XHR9LFxyXG5cdFx0UkFORE9NOiBSQU5ET00sXHJcblx0XHRzZXRNYXRyaXhBcnJheVR5cGU6IHNldE1hdHJpeEFycmF5VHlwZSxcclxuXHRcdHRvUmFkaWFuOiB0b1JhZGlhbixcclxuXHRcdGVxdWFsczogZXF1YWxzLFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIDJ4MiBNYXRyaXhcclxuXHQgKiBAbW9kdWxlIG1hdDJcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IG1hdDIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSBtYXRyaXggdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjbG9uZShhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDIgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCBhIG1hdDIgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBuZXcgbWF0MiB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMylcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0IEEgbmV3IDJ4MiBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTEwLCBtMTEpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg0KVxyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0xMFxyXG5cdFx0b3V0WzNdID0gbTExXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDIgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTEwLCBtMTEpIHtcclxuXHRcdG91dFswXSA9IG0wMFxyXG5cdFx0b3V0WzFdID0gbTAxXHJcblx0XHRvdXRbMl0gPSBtMTBcclxuXHRcdG91dFszXSA9IG0xMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XHJcblx0XHQvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlXHJcblx0XHQvLyBzb21lIHZhbHVlc1xyXG5cdFx0aWYgKG91dCA9PT0gYSkge1xyXG5cdFx0XHR2YXIgYTEgPSBhWzFdXHJcblx0XHRcdG91dFsxXSA9IGFbMl1cclxuXHRcdFx0b3V0WzJdID0gYTFcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG91dFswXSA9IGFbMF1cclxuXHRcdFx0b3V0WzFdID0gYVsyXVxyXG5cdFx0XHRvdXRbMl0gPSBhWzFdXHJcblx0XHRcdG91dFszXSA9IGFbM11cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEludmVydHMgYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblxyXG5cdFx0dmFyIGRldCA9IGEwICogYTMgLSBhMiAqIGExXHJcblxyXG5cdFx0aWYgKCFkZXQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRkZXQgPSAxLjAgLyBkZXRcclxuXHRcdG91dFswXSA9IGEzICogZGV0XHJcblx0XHRvdXRbMV0gPSAtYTEgKiBkZXRcclxuXHRcdG91dFsyXSA9IC1hMiAqIGRldFxyXG5cdFx0b3V0WzNdID0gYTAgKiBkZXRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRqb2ludChvdXQsIGEpIHtcclxuXHRcdC8vIENhY2hpbmcgdGhpcyB2YWx1ZSBpcyBuZXNzZWNhcnkgaWYgb3V0ID09IGFcclxuXHRcdHZhciBhMCA9IGFbMF1cclxuXHRcdG91dFswXSA9IGFbM11cclxuXHRcdG91dFsxXSA9IC1hWzFdXHJcblx0XHRvdXRbMl0gPSAtYVsyXVxyXG5cdFx0b3V0WzNdID0gYTBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcclxuXHRcdHJldHVybiBhWzBdICogYVszXSAtIGFbMl0gKiBhWzFdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIG1hdDInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM11cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM11cclxuXHRcdG91dFswXSA9IGEwICogYjAgKyBhMiAqIGIxXHJcblx0XHRvdXRbMV0gPSBhMSAqIGIwICsgYTMgKiBiMVxyXG5cdFx0b3V0WzJdID0gYTAgKiBiMiArIGEyICogYjNcclxuXHRcdG91dFszXSA9IGExICogYjIgKyBhMyAqIGIzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBtYXQyIGJ5IHRoZSBnaXZlbiBhbmdsZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gYTAgKiBjICsgYTIgKiBzXHJcblx0XHRvdXRbMV0gPSBhMSAqIGMgKyBhMyAqIHNcclxuXHRcdG91dFsyXSA9IGEwICogLXMgKyBhMiAqIGNcclxuXHRcdG91dFszXSA9IGExICogLXMgKyBhMyAqIGNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIHRoZSBtYXQyIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgdjAgPSB2WzBdLFxyXG5cdFx0XHR2MSA9IHZbMV1cclxuXHRcdG91dFswXSA9IGEwICogdjBcclxuXHRcdG91dFsxXSA9IGExICogdjBcclxuXHRcdG91dFsyXSA9IGEyICogdjFcclxuXHRcdG91dFszXSA9IGEzICogdjFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGVcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQyLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQyLnJvdGF0ZShkZXN0LCBkZXN0LCByYWQpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgbWF0MiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSBzXHJcblx0XHRvdXRbMl0gPSAtc1xyXG5cdFx0b3V0WzNdID0gY1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDIuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDIuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IG1hdDIgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgU2NhbGluZyB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xyXG5cdFx0b3V0WzBdID0gdlswXVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gdlsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIoYSkge1xyXG5cdFx0cmV0dXJuICdtYXQyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9iKGEpIHtcclxuXHRcdHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgTCwgRCBhbmQgVSBtYXRyaWNlcyAoTG93ZXIgdHJpYW5ndWxhciwgRGlhZ29uYWwgYW5kIFVwcGVyIHRyaWFuZ3VsYXIpIGJ5IGZhY3Rvcml6aW5nIHRoZSBpbnB1dCBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IEwgdGhlIGxvd2VyIHRyaWFuZ3VsYXIgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBEIHRoZSBkaWFnb25hbCBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IFUgdGhlIHVwcGVyIHRyaWFuZ3VsYXIgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBpbnB1dCBtYXRyaXggdG8gZmFjdG9yaXplXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIExEVShMLCBELCBVLCBhKSB7XHJcblx0XHRMWzJdID0gYVsyXSAvIGFbMF1cclxuXHRcdFVbMF0gPSBhWzBdXHJcblx0XHRVWzFdID0gYVsxXVxyXG5cdFx0VVszXSA9IGFbM10gLSBMWzJdICogVVsxXVxyXG5cdFx0cmV0dXJuIFtMLCBELCBVXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdIC0gYlszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDJ9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDJ9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBlcXVhbHMkMShhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMyAtIGIzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRvdXRbM10gPSBhWzNdICogYlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQyJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0Mi5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCA9IG11bHRpcGx5XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQyLnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViID0gc3VidHJhY3RcclxuXHJcblx0dmFyIG1hdDIgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUsXHJcblx0XHRjbG9uZTogY2xvbmUsXHJcblx0XHRjb3B5OiBjb3B5LFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5LFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyxcclxuXHRcdHNldDogc2V0LFxyXG5cdFx0dHJhbnNwb3NlOiB0cmFuc3Bvc2UsXHJcblx0XHRpbnZlcnQ6IGludmVydCxcclxuXHRcdGFkam9pbnQ6IGFkam9pbnQsXHJcblx0XHRkZXRlcm1pbmFudDogZGV0ZXJtaW5hbnQsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHksXHJcblx0XHRyb3RhdGU6IHJvdGF0ZSxcclxuXHRcdHNjYWxlOiBzY2FsZSxcclxuXHRcdGZyb21Sb3RhdGlvbjogZnJvbVJvdGF0aW9uLFxyXG5cdFx0ZnJvbVNjYWxpbmc6IGZyb21TY2FsaW5nLFxyXG5cdFx0c3RyOiBzdHIsXHJcblx0XHRmcm9iOiBmcm9iLFxyXG5cdFx0TERVOiBMRFUsXHJcblx0XHRhZGQ6IGFkZCxcclxuXHRcdHN1YnRyYWN0OiBzdWJ0cmFjdCxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyxcclxuXHRcdGVxdWFsczogZXF1YWxzJDEsXHJcblx0XHRtdWx0aXBseVNjYWxhcjogbXVsdGlwbHlTY2FsYXIsXHJcblx0XHRtdWx0aXBseVNjYWxhckFuZEFkZDogbXVsdGlwbHlTY2FsYXJBbmRBZGQsXHJcblx0XHRtdWw6IG11bCxcclxuXHRcdHN1Yjogc3ViLFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIDJ4MyBNYXRyaXhcclxuXHQgKiBAbW9kdWxlIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAZGVzY3JpcHRpb25cclxuXHQgKiBBIG1hdDJkIGNvbnRhaW5zIHNpeCBlbGVtZW50cyBkZWZpbmVkIGFzOlxyXG5cdCAqIDxwcmU+XHJcblx0ICogW2EsIGMsIHR4LFxyXG5cdCAqICBiLCBkLCB0eV1cclxuXHQgKiA8L3ByZT5cclxuXHQgKiBUaGlzIGlzIGEgc2hvcnQgZm9ybSBmb3IgdGhlIDN4MyBtYXRyaXg6XHJcblx0ICogPHByZT5cclxuXHQgKiBbYSwgYywgdHgsXHJcblx0ICogIGIsIGQsIHR5LFxyXG5cdCAqICAwLCAwLCAxXVxyXG5cdCAqIDwvcHJlPlxyXG5cdCAqIFRoZSBsYXN0IHJvdyBpcyBpZ25vcmVkIHNvIHRoZSBhcnJheSBpcyBzaG9ydGVyIGFuZCBvcGVyYXRpb25zIGFyZSBmYXN0ZXIuXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MmRcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gYSBuZXcgMngzIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkMSgpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg2KVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMV0gPSAwXHJcblx0XHRcdG91dFsyXSA9IDBcclxuXHRcdFx0b3V0WzRdID0gMFxyXG5cdFx0XHRvdXRbNV0gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IG1hdDJkIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gYSBuZXcgMngzIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjbG9uZSQxKGEpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg2KVxyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gYVs0XVxyXG5cdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MmQgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IGEgbWF0MmQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkkMShvdXQpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgbmV3IG1hdDJkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGEgQ29tcG9uZW50IEEgKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgQ29tcG9uZW50IEIgKGluZGV4IDEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGMgQ29tcG9uZW50IEMgKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGQgQ29tcG9uZW50IEQgKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHR4IENvbXBvbmVudCBUWCAoaW5kZXggNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdHkgQ29tcG9uZW50IFRZIChpbmRleCA1KVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gQSBuZXcgbWF0MmRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyQxKGEsIGIsIGMsIGQsIHR4LCB0eSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDYpXHJcblx0XHRvdXRbMF0gPSBhXHJcblx0XHRvdXRbMV0gPSBiXHJcblx0XHRvdXRbMl0gPSBjXHJcblx0XHRvdXRbM10gPSBkXHJcblx0XHRvdXRbNF0gPSB0eFxyXG5cdFx0b3V0WzVdID0gdHlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0MmQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGEgQ29tcG9uZW50IEEgKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgQ29tcG9uZW50IEIgKGluZGV4IDEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGMgQ29tcG9uZW50IEMgKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGQgQ29tcG9uZW50IEQgKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHR4IENvbXBvbmVudCBUWCAoaW5kZXggNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdHkgQ29tcG9uZW50IFRZIChpbmRleCA1KVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldCQxKG91dCwgYSwgYiwgYywgZCwgdHgsIHR5KSB7XHJcblx0XHRvdXRbMF0gPSBhXHJcblx0XHRvdXRbMV0gPSBiXHJcblx0XHRvdXRbMl0gPSBjXHJcblx0XHRvdXRbM10gPSBkXHJcblx0XHRvdXRbNF0gPSB0eFxyXG5cdFx0b3V0WzVdID0gdHlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogSW52ZXJ0cyBhIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJ0JDEob3V0LCBhKSB7XHJcblx0XHR2YXIgYWEgPSBhWzBdLFxyXG5cdFx0XHRhYiA9IGFbMV0sXHJcblx0XHRcdGFjID0gYVsyXSxcclxuXHRcdFx0YWQgPSBhWzNdXHJcblx0XHR2YXIgYXR4ID0gYVs0XSxcclxuXHRcdFx0YXR5ID0gYVs1XVxyXG5cdFx0dmFyIGRldCA9IGFhICogYWQgLSBhYiAqIGFjXHJcblxyXG5cdFx0aWYgKCFkZXQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRkZXQgPSAxLjAgLyBkZXRcclxuXHRcdG91dFswXSA9IGFkICogZGV0XHJcblx0XHRvdXRbMV0gPSAtYWIgKiBkZXRcclxuXHRcdG91dFsyXSA9IC1hYyAqIGRldFxyXG5cdFx0b3V0WzNdID0gYWEgKiBkZXRcclxuXHRcdG91dFs0XSA9IChhYyAqIGF0eSAtIGFkICogYXR4KSAqIGRldFxyXG5cdFx0b3V0WzVdID0gKGFiICogYXR4IC0gYWEgKiBhdHkpICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MmRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRldGVybWluYW50JDEoYSkge1xyXG5cdFx0cmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsxXSAqIGFbMl1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gbWF0MmQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkMShvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdLFxyXG5cdFx0XHRiNCA9IGJbNF0sXHJcblx0XHRcdGI1ID0gYls1XVxyXG5cdFx0b3V0WzBdID0gYTAgKiBiMCArIGEyICogYjFcclxuXHRcdG91dFsxXSA9IGExICogYjAgKyBhMyAqIGIxXHJcblx0XHRvdXRbMl0gPSBhMCAqIGIyICsgYTIgKiBiM1xyXG5cdFx0b3V0WzNdID0gYTEgKiBiMiArIGEzICogYjNcclxuXHRcdG91dFs0XSA9IGEwICogYjQgKyBhMiAqIGI1ICsgYTRcclxuXHRcdG91dFs1XSA9IGExICogYjQgKyBhMyAqIGI1ICsgYTVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdDJkIGJ5IHRoZSBnaXZlbiBhbmdsZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlJDEob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdXHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gYTAgKiBjICsgYTIgKiBzXHJcblx0XHRvdXRbMV0gPSBhMSAqIGMgKyBhMyAqIHNcclxuXHRcdG91dFsyXSA9IGEwICogLXMgKyBhMiAqIGNcclxuXHRcdG91dFszXSA9IGExICogLXMgKyBhMyAqIGNcclxuXHRcdG91dFs0XSA9IGE0XHJcblx0XHRvdXRbNV0gPSBhNVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTY2FsZXMgdGhlIG1hdDJkIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUkMShvdXQsIGEsIHYpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdXHJcblx0XHR2YXIgdjAgPSB2WzBdLFxyXG5cdFx0XHR2MSA9IHZbMV1cclxuXHRcdG91dFswXSA9IGEwICogdjBcclxuXHRcdG91dFsxXSA9IGExICogdjBcclxuXHRcdG91dFsyXSA9IGEyICogdjFcclxuXHRcdG91dFszXSA9IGEzICogdjFcclxuXHRcdG91dFs0XSA9IGE0XHJcblx0XHRvdXRbNV0gPSBhNVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2xhdGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byB0cmFuc2xhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XVxyXG5cdFx0dmFyIHYwID0gdlswXSxcclxuXHRcdFx0djEgPSB2WzFdXHJcblx0XHRvdXRbMF0gPSBhMFxyXG5cdFx0b3V0WzFdID0gYTFcclxuXHRcdG91dFsyXSA9IGEyXHJcblx0XHRvdXRbM10gPSBhM1xyXG5cdFx0b3V0WzRdID0gYTAgKiB2MCArIGEyICogdjEgKyBhNFxyXG5cdFx0b3V0WzVdID0gYTEgKiB2MCArIGEzICogdjEgKyBhNVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDJkLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQyZC5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCBtYXQyZCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uJDEob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKSxcclxuXHRcdFx0YyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGNcclxuXHRcdG91dFsxXSA9IHNcclxuXHRcdG91dFsyXSA9IC1zXHJcblx0XHRvdXRbM10gPSBjXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0MmQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDJkLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgbWF0MmQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgU2NhbGluZyB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tU2NhbGluZyQxKG91dCwgdikge1xyXG5cdFx0b3V0WzBdID0gdlswXVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gdlsxXVxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQyZC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0MmQudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgbWF0MmQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0b3V0WzRdID0gdlswXVxyXG5cdFx0b3V0WzVdID0gdlsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MmRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQxKGEpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdCdtYXQyZCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnKSdcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvYiQxKGEpIHtcclxuXHRcdHJldHVybiBNYXRoLnNxcnQoXHJcblx0XHRcdE1hdGgucG93KGFbMF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzFdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsyXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbM10sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzRdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs1XSwgMikgK1xyXG5cdFx0XHRcdDEsXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDJkJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQxKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkMShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLSBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdIC0gYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSAtIGJbNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIkMShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRvdXRbNF0gPSBhWzRdICogYlxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0MmQncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZCQxKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGVcclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGVcclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdICogc2NhbGVcclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQxKGEsIGIpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdGFbMF0gPT09IGJbMF0gJiZcclxuXHRcdFx0YVsxXSA9PT0gYlsxXSAmJlxyXG5cdFx0XHRhWzJdID09PSBiWzJdICYmXHJcblx0XHRcdGFbM10gPT09IGJbM10gJiZcclxuXHRcdFx0YVs0XSA9PT0gYls0XSAmJlxyXG5cdFx0XHRhWzVdID09PSBiWzVdXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDIoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV1cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM10sXHJcblx0XHRcdGI0ID0gYls0XSxcclxuXHRcdFx0YjUgPSBiWzVdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMyAtIGIzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTQgLSBiNCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE1IC0gYjUpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDJkLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDEgPSBtdWx0aXBseSQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQyZC5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQxID0gc3VidHJhY3QkMVxyXG5cclxuXHR2YXIgbWF0MmQgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkMSxcclxuXHRcdGNsb25lOiBjbG9uZSQxLFxyXG5cdFx0Y29weTogY29weSQxLFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5JDEsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDEsXHJcblx0XHRzZXQ6IHNldCQxLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkMSxcclxuXHRcdGRldGVybWluYW50OiBkZXRlcm1pbmFudCQxLFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDEsXHJcblx0XHRyb3RhdGU6IHJvdGF0ZSQxLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDEsXHJcblx0XHR0cmFuc2xhdGU6IHRyYW5zbGF0ZSxcclxuXHRcdGZyb21Sb3RhdGlvbjogZnJvbVJvdGF0aW9uJDEsXHJcblx0XHRmcm9tU2NhbGluZzogZnJvbVNjYWxpbmckMSxcclxuXHRcdGZyb21UcmFuc2xhdGlvbjogZnJvbVRyYW5zbGF0aW9uLFxyXG5cdFx0c3RyOiBzdHIkMSxcclxuXHRcdGZyb2I6IGZyb2IkMSxcclxuXHRcdGFkZDogYWRkJDEsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkMSxcclxuXHRcdG11bHRpcGx5U2NhbGFyOiBtdWx0aXBseVNjYWxhciQxLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXJBbmRBZGQ6IG11bHRpcGx5U2NhbGFyQW5kQWRkJDEsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkMSxcclxuXHRcdGVxdWFsczogZXF1YWxzJDIsXHJcblx0XHRtdWw6IG11bCQxLFxyXG5cdFx0c3ViOiBzdWIkMSxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAzeDMgTWF0cml4XHJcblx0ICogQG1vZHVsZSBtYXQzXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0M1xyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDIoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoOSlcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdG91dFszXSA9IDBcclxuXHRcdFx0b3V0WzVdID0gMFxyXG5cdFx0XHRvdXRbNl0gPSAwXHJcblx0XHRcdG91dFs3XSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbNF0gPSAxXHJcblx0XHRvdXRbOF0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcGllcyB0aGUgdXBwZXItbGVmdCAzeDMgdmFsdWVzIGludG8gdGhlIGdpdmVuIG1hdDMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIDN4MyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgICB0aGUgc291cmNlIDR4NCBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21NYXQ0KG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVs0XVxyXG5cdFx0b3V0WzRdID0gYVs1XVxyXG5cdFx0b3V0WzVdID0gYVs2XVxyXG5cdFx0b3V0WzZdID0gYVs4XVxyXG5cdFx0b3V0WzddID0gYVs5XVxyXG5cdFx0b3V0WzhdID0gYVsxMF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBtYXQzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkMihhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoOSlcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdG91dFs2XSA9IGFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkMihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdG91dFs2XSA9IGFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgbmV3IG1hdDMgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggOClcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gQSBuZXcgbWF0M1xyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDIobTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDkpXHJcblx0XHRvdXRbMF0gPSBtMDBcclxuXHRcdG91dFsxXSA9IG0wMVxyXG5cdFx0b3V0WzJdID0gbTAyXHJcblx0XHRvdXRbM10gPSBtMTBcclxuXHRcdG91dFs0XSA9IG0xMVxyXG5cdFx0b3V0WzVdID0gbTEyXHJcblx0XHRvdXRbNl0gPSBtMjBcclxuXHRcdG91dFs3XSA9IG0yMVxyXG5cdFx0b3V0WzhdID0gbTIyXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDMgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggOClcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldCQyKG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0wMlxyXG5cdFx0b3V0WzNdID0gbTEwXHJcblx0XHRvdXRbNF0gPSBtMTFcclxuXHRcdG91dFs1XSA9IG0xMlxyXG5cdFx0b3V0WzZdID0gbTIwXHJcblx0XHRvdXRbN10gPSBtMjFcclxuXHRcdG91dFs4XSA9IG0yMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBtYXQzIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQyKG91dCkge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMVxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc3Bvc2UkMShvdXQsIGEpIHtcclxuXHRcdC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcclxuXHRcdGlmIChvdXQgPT09IGEpIHtcclxuXHRcdFx0dmFyIGEwMSA9IGFbMV0sXHJcblx0XHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0XHRhMTIgPSBhWzVdXHJcblx0XHRcdG91dFsxXSA9IGFbM11cclxuXHRcdFx0b3V0WzJdID0gYVs2XVxyXG5cdFx0XHRvdXRbM10gPSBhMDFcclxuXHRcdFx0b3V0WzVdID0gYVs3XVxyXG5cdFx0XHRvdXRbNl0gPSBhMDJcclxuXHRcdFx0b3V0WzddID0gYTEyXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRcdG91dFsxXSA9IGFbM11cclxuXHRcdFx0b3V0WzJdID0gYVs2XVxyXG5cdFx0XHRvdXRbM10gPSBhWzFdXHJcblx0XHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdFx0b3V0WzVdID0gYVs3XVxyXG5cdFx0XHRvdXRbNl0gPSBhWzJdXHJcblx0XHRcdG91dFs3XSA9IGFbNV1cclxuXHRcdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogSW52ZXJ0cyBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQkMihvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTEwID0gYVszXSxcclxuXHRcdFx0YTExID0gYVs0XSxcclxuXHRcdFx0YTEyID0gYVs1XVxyXG5cdFx0dmFyIGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF1cclxuXHRcdHZhciBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjFcclxuXHRcdHZhciBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwXHJcblx0XHR2YXIgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuXHJcblx0XHR2YXIgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxXHJcblxyXG5cdFx0aWYgKCFkZXQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRkZXQgPSAxLjAgLyBkZXRcclxuXHRcdG91dFswXSA9IGIwMSAqIGRldFxyXG5cdFx0b3V0WzFdID0gKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpICogZGV0XHJcblx0XHRvdXRbMl0gPSAoYTEyICogYTAxIC0gYTAyICogYTExKSAqIGRldFxyXG5cdFx0b3V0WzNdID0gYjExICogZGV0XHJcblx0XHRvdXRbNF0gPSAoYTIyICogYTAwIC0gYTAyICogYTIwKSAqIGRldFxyXG5cdFx0b3V0WzVdID0gKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApICogZGV0XHJcblx0XHRvdXRbNl0gPSBiMjEgKiBkZXRcclxuXHRcdG91dFs3XSA9ICgtYTIxICogYTAwICsgYTAxICogYTIwKSAqIGRldFxyXG5cdFx0b3V0WzhdID0gKGExMSAqIGEwMCAtIGEwMSAqIGExMCkgKiBkZXRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRqb2ludCQxKG91dCwgYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMTAgPSBhWzNdLFxyXG5cdFx0XHRhMTEgPSBhWzRdLFxyXG5cdFx0XHRhMTIgPSBhWzVdXHJcblx0XHR2YXIgYTIwID0gYVs2XSxcclxuXHRcdFx0YTIxID0gYVs3XSxcclxuXHRcdFx0YTIyID0gYVs4XVxyXG5cdFx0b3V0WzBdID0gYTExICogYTIyIC0gYTEyICogYTIxXHJcblx0XHRvdXRbMV0gPSBhMDIgKiBhMjEgLSBhMDEgKiBhMjJcclxuXHRcdG91dFsyXSA9IGEwMSAqIGExMiAtIGEwMiAqIGExMVxyXG5cdFx0b3V0WzNdID0gYTEyICogYTIwIC0gYTEwICogYTIyXHJcblx0XHRvdXRbNF0gPSBhMDAgKiBhMjIgLSBhMDIgKiBhMjBcclxuXHRcdG91dFs1XSA9IGEwMiAqIGExMCAtIGEwMCAqIGExMlxyXG5cdFx0b3V0WzZdID0gYTEwICogYTIxIC0gYTExICogYTIwXHJcblx0XHRvdXRbN10gPSBhMDEgKiBhMjAgLSBhMDAgKiBhMjFcclxuXHRcdG91dFs4XSA9IGEwMCAqIGExMSAtIGEwMSAqIGExMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGV0ZXJtaW5hbnQkMihhKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXVxyXG5cdFx0dmFyIGExMCA9IGFbM10sXHJcblx0XHRcdGExMSA9IGFbNF0sXHJcblx0XHRcdGExMiA9IGFbNV1cclxuXHRcdHZhciBhMjAgPSBhWzZdLFxyXG5cdFx0XHRhMjEgPSBhWzddLFxyXG5cdFx0XHRhMjIgPSBhWzhdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRhMDAgKiAoYTIyICogYTExIC0gYTEyICogYTIxKSArIGEwMSAqICgtYTIyICogYTEwICsgYTEyICogYTIwKSArIGEwMiAqIChhMjEgKiBhMTAgLSBhMTEgKiBhMjApXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIG1hdDMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQyKG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMTAgPSBhWzNdLFxyXG5cdFx0XHRhMTEgPSBhWzRdLFxyXG5cdFx0XHRhMTIgPSBhWzVdXHJcblx0XHR2YXIgYTIwID0gYVs2XSxcclxuXHRcdFx0YTIxID0gYVs3XSxcclxuXHRcdFx0YTIyID0gYVs4XVxyXG5cdFx0dmFyIGIwMCA9IGJbMF0sXHJcblx0XHRcdGIwMSA9IGJbMV0sXHJcblx0XHRcdGIwMiA9IGJbMl1cclxuXHRcdHZhciBiMTAgPSBiWzNdLFxyXG5cdFx0XHRiMTEgPSBiWzRdLFxyXG5cdFx0XHRiMTIgPSBiWzVdXHJcblx0XHR2YXIgYjIwID0gYls2XSxcclxuXHRcdFx0YjIxID0gYls3XSxcclxuXHRcdFx0YjIyID0gYls4XVxyXG5cdFx0b3V0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwXHJcblx0XHRvdXRbMV0gPSBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjFcclxuXHRcdG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMlxyXG5cdFx0b3V0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwXHJcblx0XHRvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjFcclxuXHRcdG91dFs1XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMlxyXG5cdFx0b3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwXHJcblx0XHRvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjFcclxuXHRcdG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zbGF0ZSQxKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGExMCA9IGFbM10sXHJcblx0XHRcdGExMSA9IGFbNF0sXHJcblx0XHRcdGExMiA9IGFbNV0sXHJcblx0XHRcdGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF0sXHJcblx0XHRcdHggPSB2WzBdLFxyXG5cdFx0XHR5ID0gdlsxXVxyXG5cdFx0b3V0WzBdID0gYTAwXHJcblx0XHRvdXRbMV0gPSBhMDFcclxuXHRcdG91dFsyXSA9IGEwMlxyXG5cdFx0b3V0WzNdID0gYTEwXHJcblx0XHRvdXRbNF0gPSBhMTFcclxuXHRcdG91dFs1XSA9IGExMlxyXG5cdFx0b3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjBcclxuXHRcdG91dFs3XSA9IHggKiBhMDEgKyB5ICogYTExICsgYTIxXHJcblx0XHRvdXRbOF0gPSB4ICogYTAyICsgeSAqIGExMiArIGEyMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0MyBieSB0aGUgZ2l2ZW4gYW5nbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZSQyKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0YTEwID0gYVszXSxcclxuXHRcdFx0YTExID0gYVs0XSxcclxuXHRcdFx0YTEyID0gYVs1XSxcclxuXHRcdFx0YTIwID0gYVs2XSxcclxuXHRcdFx0YTIxID0gYVs3XSxcclxuXHRcdFx0YTIyID0gYVs4XSxcclxuXHRcdFx0cyA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMFxyXG5cdFx0b3V0WzFdID0gYyAqIGEwMSArIHMgKiBhMTFcclxuXHRcdG91dFsyXSA9IGMgKiBhMDIgKyBzICogYTEyXHJcblx0XHRvdXRbM10gPSBjICogYTEwIC0gcyAqIGEwMFxyXG5cdFx0b3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDFcclxuXHRcdG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyXHJcblx0XHRvdXRbNl0gPSBhMjBcclxuXHRcdG91dFs3XSA9IGEyMVxyXG5cdFx0b3V0WzhdID0gYTIyXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDIob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgeCA9IHZbMF0sXHJcblx0XHRcdHkgPSB2WzFdXHJcblx0XHRvdXRbMF0gPSB4ICogYVswXVxyXG5cdFx0b3V0WzFdID0geCAqIGFbMV1cclxuXHRcdG91dFsyXSA9IHggKiBhWzJdXHJcblx0XHRvdXRbM10gPSB5ICogYVszXVxyXG5cdFx0b3V0WzRdID0geSAqIGFbNF1cclxuXHRcdG91dFs1XSA9IHkgKiBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDMudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uJDEob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAxXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSB2WzBdXHJcblx0XHRvdXRbN10gPSB2WzFdXHJcblx0XHRvdXRbOF0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0My5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uJDIob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKSxcclxuXHRcdFx0YyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGNcclxuXHRcdG91dFsxXSA9IHNcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IC1zXHJcblx0XHRvdXRbNF0gPSBjXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0My5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVNjYWxpbmckMihvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IHZbMF1cclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IHZbMV1cclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29waWVzIHRoZSB2YWx1ZXMgZnJvbSBhIG1hdDJkIGludG8gYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjb3B5XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbU1hdDJkKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gYVsyXVxyXG5cdFx0b3V0WzRdID0gYVszXVxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gYVs0XVxyXG5cdFx0b3V0WzddID0gYVs1XVxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB5eCA9IHkgKiB4MlxyXG5cdFx0dmFyIHl5ID0geSAqIHkyXHJcblx0XHR2YXIgenggPSB6ICogeDJcclxuXHRcdHZhciB6eSA9IHogKiB5MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHRvdXRbMF0gPSAxIC0geXkgLSB6elxyXG5cdFx0b3V0WzNdID0geXggLSB3elxyXG5cdFx0b3V0WzZdID0genggKyB3eVxyXG5cdFx0b3V0WzFdID0geXggKyB3elxyXG5cdFx0b3V0WzRdID0gMSAtIHh4IC0genpcclxuXHRcdG91dFs3XSA9IHp5IC0gd3hcclxuXHRcdG91dFsyXSA9IHp4IC0gd3lcclxuXHRcdG91dFs1XSA9IHp5ICsgd3hcclxuXHRcdG91dFs4XSA9IDEgLSB4eCAtIHl5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBub3JtYWxGcm9tTWF0NChvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XSxcclxuXHRcdFx0YTExID0gYVs1XSxcclxuXHRcdFx0YTEyID0gYVs2XSxcclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF0sXHJcblx0XHRcdGEyMSA9IGFbOV0sXHJcblx0XHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0dmFyIGEzMCA9IGFbMTJdLFxyXG5cdFx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdFx0YTMyID0gYVsxNF0sXHJcblx0XHRcdGEzMyA9IGFbMTVdXHJcblx0XHR2YXIgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwXHJcblx0XHR2YXIgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwXHJcblx0XHR2YXIgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwXHJcblx0XHR2YXIgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExXHJcblx0XHR2YXIgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExXHJcblx0XHR2YXIgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyXHJcblx0XHR2YXIgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwXHJcblx0XHR2YXIgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwXHJcblx0XHR2YXIgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwXHJcblx0XHR2YXIgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxXHJcblx0XHR2YXIgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxXHJcblx0XHR2YXIgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuXHJcblx0XHR2YXIgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2XHJcblxyXG5cdFx0aWYgKCFkZXQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRkZXQgPSAxLjAgLyBkZXRcclxuXHRcdG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0XHJcblx0XHRvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldFxyXG5cdFx0b3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXRcclxuXHRcdG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0XHJcblx0XHRvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldFxyXG5cdFx0b3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXRcclxuXHRcdG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0XHJcblx0XHRvdXRbN10gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldFxyXG5cdFx0b3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgMkQgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIG9mIHlvdXIgZ2wgY29udGV4dFxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHByb2plY3Rpb24ob3V0LCB3aWR0aCwgaGVpZ2h0KSB7XHJcblx0XHRvdXRbMF0gPSAyIC8gd2lkdGhcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IC0yIC8gaGVpZ2h0XHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSAtMVxyXG5cdFx0b3V0WzddID0gMVxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkMihhKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQnbWF0MygnICtcclxuXHRcdFx0YVswXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzFdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbMl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVszXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzRdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs2XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzddICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbOF0gK1xyXG5cdFx0XHQnKSdcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb2IkMihhKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KFxyXG5cdFx0XHRNYXRoLnBvdyhhWzBdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzNdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs0XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzZdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs3XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbOF0sIDIpLFxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRkJDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdICsgYls2XVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN11cclxuXHRcdG91dFs4XSA9IGFbOF0gKyBiWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdIC0gYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSAtIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gLSBiWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdIC0gYls2XVxyXG5cdFx0b3V0WzddID0gYVs3XSAtIGJbN11cclxuXHRcdG91dFs4XSA9IGFbOF0gLSBiWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyJDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRvdXRbM10gPSBhWzNdICogYlxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIGJcclxuXHRcdG91dFs1XSA9IGFbNV0gKiBiXHJcblx0XHRvdXRbNl0gPSBhWzZdICogYlxyXG5cdFx0b3V0WzddID0gYVs3XSAqIGJcclxuXHRcdG91dFs4XSA9IGFbOF0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDMncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkJDIob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF0gKiBzY2FsZVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV0gKiBzY2FsZVxyXG5cdFx0b3V0WzZdID0gYVs2XSArIGJbNl0gKiBzY2FsZVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN10gKiBzY2FsZVxyXG5cdFx0b3V0WzhdID0gYVs4XSArIGJbOF0gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQyKGEsIGIpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdGFbMF0gPT09IGJbMF0gJiZcclxuXHRcdFx0YVsxXSA9PT0gYlsxXSAmJlxyXG5cdFx0XHRhWzJdID09PSBiWzJdICYmXHJcblx0XHRcdGFbM10gPT09IGJbM10gJiZcclxuXHRcdFx0YVs0XSA9PT0gYls0XSAmJlxyXG5cdFx0XHRhWzVdID09PSBiWzVdICYmXHJcblx0XHRcdGFbNl0gPT09IGJbNl0gJiZcclxuXHRcdFx0YVs3XSA9PT0gYls3XSAmJlxyXG5cdFx0XHRhWzhdID09PSBiWzhdXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQzKGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdLFxyXG5cdFx0XHRhNiA9IGFbNl0sXHJcblx0XHRcdGE3ID0gYVs3XSxcclxuXHRcdFx0YTggPSBhWzhdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdLFxyXG5cdFx0XHRiNCA9IGJbNF0sXHJcblx0XHRcdGI1ID0gYls1XSxcclxuXHRcdFx0YjYgPSBiWzZdLFxyXG5cdFx0XHRiNyA9IGJbN10sXHJcblx0XHRcdGI4ID0gYls4XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE0IC0gYjQpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNSAtIGI1KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTYgLSBiNikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXHJcblx0XHRcdE1hdGguYWJzKGE3IC0gYjcpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhOCAtIGI4KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDIgPSBtdWx0aXBseSQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQzLnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViJDIgPSBzdWJ0cmFjdCQyXHJcblxyXG5cdHZhciBtYXQzID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDIsXHJcblx0XHRmcm9tTWF0NDogZnJvbU1hdDQsXHJcblx0XHRjbG9uZTogY2xvbmUkMixcclxuXHRcdGNvcHk6IGNvcHkkMixcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkMixcclxuXHRcdHNldDogc2V0JDIsXHJcblx0XHRpZGVudGl0eTogaWRlbnRpdHkkMixcclxuXHRcdHRyYW5zcG9zZTogdHJhbnNwb3NlJDEsXHJcblx0XHRpbnZlcnQ6IGludmVydCQyLFxyXG5cdFx0YWRqb2ludDogYWRqb2ludCQxLFxyXG5cdFx0ZGV0ZXJtaW5hbnQ6IGRldGVybWluYW50JDIsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkMixcclxuXHRcdHRyYW5zbGF0ZTogdHJhbnNsYXRlJDEsXHJcblx0XHRyb3RhdGU6IHJvdGF0ZSQyLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDIsXHJcblx0XHRmcm9tVHJhbnNsYXRpb246IGZyb21UcmFuc2xhdGlvbiQxLFxyXG5cdFx0ZnJvbVJvdGF0aW9uOiBmcm9tUm90YXRpb24kMixcclxuXHRcdGZyb21TY2FsaW5nOiBmcm9tU2NhbGluZyQyLFxyXG5cdFx0ZnJvbU1hdDJkOiBmcm9tTWF0MmQsXHJcblx0XHRmcm9tUXVhdDogZnJvbVF1YXQsXHJcblx0XHRub3JtYWxGcm9tTWF0NDogbm9ybWFsRnJvbU1hdDQsXHJcblx0XHRwcm9qZWN0aW9uOiBwcm9qZWN0aW9uLFxyXG5cdFx0c3RyOiBzdHIkMixcclxuXHRcdGZyb2I6IGZyb2IkMixcclxuXHRcdGFkZDogYWRkJDIsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkMixcclxuXHRcdG11bHRpcGx5U2NhbGFyOiBtdWx0aXBseVNjYWxhciQyLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXJBbmRBZGQ6IG11bHRpcGx5U2NhbGFyQW5kQWRkJDIsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkMixcclxuXHRcdGVxdWFsczogZXF1YWxzJDMsXHJcblx0XHRtdWw6IG11bCQyLFxyXG5cdFx0c3ViOiBzdWIkMixcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiA0eDQgTWF0cml4PGJyPkZvcm1hdDogY29sdW1uLW1ham9yLCB3aGVuIHR5cGVkIG91dCBpdCBsb29rcyBsaWtlIHJvdy1tYWpvcjxicj5UaGUgbWF0cmljZXMgYXJlIGJlaW5nIHBvc3QgbXVsdGlwbGllZC5cclxuXHQgKiBAbW9kdWxlIG1hdDRcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkMygpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgxNilcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdG91dFszXSA9IDBcclxuXHRcdFx0b3V0WzRdID0gMFxyXG5cdFx0XHRvdXRbNl0gPSAwXHJcblx0XHRcdG91dFs3XSA9IDBcclxuXHRcdFx0b3V0WzhdID0gMFxyXG5cdFx0XHRvdXRbOV0gPSAwXHJcblx0XHRcdG91dFsxMV0gPSAwXHJcblx0XHRcdG91dFsxMl0gPSAwXHJcblx0XHRcdG91dFsxM10gPSAwXHJcblx0XHRcdG91dFsxNF0gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzVdID0gMVxyXG5cdFx0b3V0WzEwXSA9IDFcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgbWF0NCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDMoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDE2KVxyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gYVs0XVxyXG5cdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0b3V0WzldID0gYVs5XVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdXHJcblx0XHRvdXRbMTFdID0gYVsxMV1cclxuXHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdXHJcblx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29weSQzKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gYVs0XVxyXG5cdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0b3V0WzldID0gYVs5XVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdXHJcblx0XHRvdXRbMTFdID0gYVsxMV1cclxuXHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdXHJcblx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBuZXcgbWF0NCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDMgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA1KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA4KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggOSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjMgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMCBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAxMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzIgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMyBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxNSlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gQSBuZXcgbWF0NFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDMoXHJcblx0XHRtMDAsXHJcblx0XHRtMDEsXHJcblx0XHRtMDIsXHJcblx0XHRtMDMsXHJcblx0XHRtMTAsXHJcblx0XHRtMTEsXHJcblx0XHRtMTIsXHJcblx0XHRtMTMsXHJcblx0XHRtMjAsXHJcblx0XHRtMjEsXHJcblx0XHRtMjIsXHJcblx0XHRtMjMsXHJcblx0XHRtMzAsXHJcblx0XHRtMzEsXHJcblx0XHRtMzIsXHJcblx0XHRtMzMsXHJcblx0KSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMTYpXHJcblx0XHRvdXRbMF0gPSBtMDBcclxuXHRcdG91dFsxXSA9IG0wMVxyXG5cdFx0b3V0WzJdID0gbTAyXHJcblx0XHRvdXRbM10gPSBtMDNcclxuXHRcdG91dFs0XSA9IG0xMFxyXG5cdFx0b3V0WzVdID0gbTExXHJcblx0XHRvdXRbNl0gPSBtMTJcclxuXHRcdG91dFs3XSA9IG0xM1xyXG5cdFx0b3V0WzhdID0gbTIwXHJcblx0XHRvdXRbOV0gPSBtMjFcclxuXHRcdG91dFsxMF0gPSBtMjJcclxuXHRcdG91dFsxMV0gPSBtMjNcclxuXHRcdG91dFsxMl0gPSBtMzBcclxuXHRcdG91dFsxM10gPSBtMzFcclxuXHRcdG91dFsxNF0gPSBtMzJcclxuXHRcdG91dFsxNV0gPSBtMzNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0NCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDMgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA1KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA4KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggOSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjMgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMCBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAxMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzIgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMyBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxNSlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldCQzKFxyXG5cdFx0b3V0LFxyXG5cdFx0bTAwLFxyXG5cdFx0bTAxLFxyXG5cdFx0bTAyLFxyXG5cdFx0bTAzLFxyXG5cdFx0bTEwLFxyXG5cdFx0bTExLFxyXG5cdFx0bTEyLFxyXG5cdFx0bTEzLFxyXG5cdFx0bTIwLFxyXG5cdFx0bTIxLFxyXG5cdFx0bTIyLFxyXG5cdFx0bTIzLFxyXG5cdFx0bTMwLFxyXG5cdFx0bTMxLFxyXG5cdFx0bTMyLFxyXG5cdFx0bTMzLFxyXG5cdCkge1xyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0wMlxyXG5cdFx0b3V0WzNdID0gbTAzXHJcblx0XHRvdXRbNF0gPSBtMTBcclxuXHRcdG91dFs1XSA9IG0xMVxyXG5cdFx0b3V0WzZdID0gbTEyXHJcblx0XHRvdXRbN10gPSBtMTNcclxuXHRcdG91dFs4XSA9IG0yMFxyXG5cdFx0b3V0WzldID0gbTIxXHJcblx0XHRvdXRbMTBdID0gbTIyXHJcblx0XHRvdXRbMTFdID0gbTIzXHJcblx0XHRvdXRbMTJdID0gbTMwXHJcblx0XHRvdXRbMTNdID0gbTMxXHJcblx0XHRvdXRbMTRdID0gbTMyXHJcblx0XHRvdXRbMTVdID0gbTMzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCBhIG1hdDQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGlkZW50aXR5JDMob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAxXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAwXHJcblx0XHRvdXRbMTBdID0gMVxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSAwXHJcblx0XHRvdXRbMTNdID0gMFxyXG5cdFx0b3V0WzE0XSA9IDBcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zcG9zZSQyKG91dCwgYSkge1xyXG5cdFx0Ly8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xyXG5cdFx0aWYgKG91dCA9PT0gYSkge1xyXG5cdFx0XHR2YXIgYTAxID0gYVsxXSxcclxuXHRcdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRcdGEwMyA9IGFbM11cclxuXHRcdFx0dmFyIGExMiA9IGFbNl0sXHJcblx0XHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0XHR2YXIgYTIzID0gYVsxMV1cclxuXHRcdFx0b3V0WzFdID0gYVs0XVxyXG5cdFx0XHRvdXRbMl0gPSBhWzhdXHJcblx0XHRcdG91dFszXSA9IGFbMTJdXHJcblx0XHRcdG91dFs0XSA9IGEwMVxyXG5cdFx0XHRvdXRbNl0gPSBhWzldXHJcblx0XHRcdG91dFs3XSA9IGFbMTNdXHJcblx0XHRcdG91dFs4XSA9IGEwMlxyXG5cdFx0XHRvdXRbOV0gPSBhMTJcclxuXHRcdFx0b3V0WzExXSA9IGFbMTRdXHJcblx0XHRcdG91dFsxMl0gPSBhMDNcclxuXHRcdFx0b3V0WzEzXSA9IGExM1xyXG5cdFx0XHRvdXRbMTRdID0gYTIzXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRcdG91dFsxXSA9IGFbNF1cclxuXHRcdFx0b3V0WzJdID0gYVs4XVxyXG5cdFx0XHRvdXRbM10gPSBhWzEyXVxyXG5cdFx0XHRvdXRbNF0gPSBhWzFdXHJcblx0XHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdFx0b3V0WzZdID0gYVs5XVxyXG5cdFx0XHRvdXRbN10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbOF0gPSBhWzJdXHJcblx0XHRcdG91dFs5XSA9IGFbNl1cclxuXHRcdFx0b3V0WzEwXSA9IGFbMTBdXHJcblx0XHRcdG91dFsxMV0gPSBhWzE0XVxyXG5cdFx0XHRvdXRbMTJdID0gYVszXVxyXG5cdFx0XHRvdXRbMTNdID0gYVs3XVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxMV1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBJbnZlcnRzIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVydCQzKG91dCwgYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdHZhciBhMTAgPSBhWzRdLFxyXG5cdFx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0XHRhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XSxcclxuXHRcdFx0YTIxID0gYVs5XSxcclxuXHRcdFx0YTIyID0gYVsxMF0sXHJcblx0XHRcdGEyMyA9IGFbMTFdXHJcblx0XHR2YXIgYTMwID0gYVsxMl0sXHJcblx0XHRcdGEzMSA9IGFbMTNdLFxyXG5cdFx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdFx0YTMzID0gYVsxNV1cclxuXHRcdHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTBcclxuXHRcdHZhciBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTBcclxuXHRcdHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTBcclxuXHRcdHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTFcclxuXHRcdHZhciBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTFcclxuXHRcdHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTJcclxuXHRcdHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzBcclxuXHRcdHZhciBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzBcclxuXHRcdHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzBcclxuXHRcdHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzFcclxuXHRcdHZhciBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzFcclxuXHRcdHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG5cclxuXHRcdHZhciBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDZcclxuXHJcblx0XHRpZiAoIWRldCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGRldCA9IDEuMCAvIGRldFxyXG5cdFx0b3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXRcclxuXHRcdG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0XHJcblx0XHRvdXRbMl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldFxyXG5cdFx0b3V0WzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXRcclxuXHRcdG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0XHJcblx0XHRvdXRbNV0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldFxyXG5cdFx0b3V0WzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXRcclxuXHRcdG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0XHJcblx0XHRvdXRbOF0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldFxyXG5cdFx0b3V0WzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXRcclxuXHRcdG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldFxyXG5cdFx0b3V0WzExXSA9IChhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDApICogZGV0XHJcblx0XHRvdXRbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXRcclxuXHRcdG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldFxyXG5cdFx0b3V0WzE0XSA9IChhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDApICogZGV0XHJcblx0XHRvdXRbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRqb2ludCQyKG91dCwgYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdHZhciBhMTAgPSBhWzRdLFxyXG5cdFx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0XHRhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XSxcclxuXHRcdFx0YTIxID0gYVs5XSxcclxuXHRcdFx0YTIyID0gYVsxMF0sXHJcblx0XHRcdGEyMyA9IGFbMTFdXHJcblx0XHR2YXIgYTMwID0gYVsxMl0sXHJcblx0XHRcdGEzMSA9IGFbMTNdLFxyXG5cdFx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdFx0YTMzID0gYVsxNV1cclxuXHRcdG91dFswXSA9XHJcblx0XHRcdGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKVxyXG5cdFx0b3V0WzFdID0gLShcclxuXHRcdFx0YTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLVxyXG5cdFx0XHRhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArXHJcblx0XHRcdGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpXHJcblx0XHQpXHJcblx0XHRvdXRbMl0gPVxyXG5cdFx0XHRhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMilcclxuXHRcdG91dFszXSA9IC0oXHJcblx0XHRcdGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC1cclxuXHRcdFx0YTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgK1xyXG5cdFx0XHRhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzRdID0gLShcclxuXHRcdFx0YTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLVxyXG5cdFx0XHRhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArXHJcblx0XHRcdGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpXHJcblx0XHQpXHJcblx0XHRvdXRbNV0gPVxyXG5cdFx0XHRhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMilcclxuXHRcdG91dFs2XSA9IC0oXHJcblx0XHRcdGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC1cclxuXHRcdFx0YTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgK1xyXG5cdFx0XHRhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzddID1cclxuXHRcdFx0YTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpXHJcblx0XHRvdXRbOF0gPVxyXG5cdFx0XHRhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSlcclxuXHRcdG91dFs5XSA9IC0oXHJcblx0XHRcdGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC1cclxuXHRcdFx0YTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgK1xyXG5cdFx0XHRhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzEwXSA9XHJcblx0XHRcdGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKVxyXG5cdFx0b3V0WzExXSA9IC0oXHJcblx0XHRcdGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpIC1cclxuXHRcdFx0YTEwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkgK1xyXG5cdFx0XHRhMjAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzEyXSA9IC0oXHJcblx0XHRcdGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC1cclxuXHRcdFx0YTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgK1xyXG5cdFx0XHRhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzEzXSA9XHJcblx0XHRcdGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKVxyXG5cdFx0b3V0WzE0XSA9IC0oXHJcblx0XHRcdGEwMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpIC1cclxuXHRcdFx0YTEwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgK1xyXG5cdFx0XHRhMzAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzE1XSA9XHJcblx0XHRcdGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGV0ZXJtaW5hbnQkMyhhKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0YTAzID0gYVszXVxyXG5cdFx0dmFyIGExMCA9IGFbNF0sXHJcblx0XHRcdGExMSA9IGFbNV0sXHJcblx0XHRcdGExMiA9IGFbNl0sXHJcblx0XHRcdGExMyA9IGFbN11cclxuXHRcdHZhciBhMjAgPSBhWzhdLFxyXG5cdFx0XHRhMjEgPSBhWzldLFxyXG5cdFx0XHRhMjIgPSBhWzEwXSxcclxuXHRcdFx0YTIzID0gYVsxMV1cclxuXHRcdHZhciBhMzAgPSBhWzEyXSxcclxuXHRcdFx0YTMxID0gYVsxM10sXHJcblx0XHRcdGEzMiA9IGFbMTRdLFxyXG5cdFx0XHRhMzMgPSBhWzE1XVxyXG5cdFx0dmFyIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMFxyXG5cdFx0dmFyIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMFxyXG5cdFx0dmFyIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMFxyXG5cdFx0dmFyIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMVxyXG5cdFx0dmFyIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMVxyXG5cdFx0dmFyIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMlxyXG5cdFx0dmFyIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMFxyXG5cdFx0dmFyIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMFxyXG5cdFx0dmFyIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMFxyXG5cdFx0dmFyIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMVxyXG5cdFx0dmFyIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMVxyXG5cdFx0dmFyIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMiAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblxyXG5cdFx0cmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNlxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBtYXQ0c1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQzKG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdHZhciBhMTAgPSBhWzRdLFxyXG5cdFx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0XHRhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XSxcclxuXHRcdFx0YTIxID0gYVs5XSxcclxuXHRcdFx0YTIyID0gYVsxMF0sXHJcblx0XHRcdGEyMyA9IGFbMTFdXHJcblx0XHR2YXIgYTMwID0gYVsxMl0sXHJcblx0XHRcdGEzMSA9IGFbMTNdLFxyXG5cdFx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdFx0YTMzID0gYVsxNV0gLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XHJcblxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0b3V0WzBdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzBcclxuXHRcdG91dFsxXSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxXHJcblx0XHRvdXRbMl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMlxyXG5cdFx0b3V0WzNdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzNcclxuXHRcdGIwID0gYls0XVxyXG5cdFx0YjEgPSBiWzVdXHJcblx0XHRiMiA9IGJbNl1cclxuXHRcdGIzID0gYls3XVxyXG5cdFx0b3V0WzRdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzBcclxuXHRcdG91dFs1XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxXHJcblx0XHRvdXRbNl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMlxyXG5cdFx0b3V0WzddID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzNcclxuXHRcdGIwID0gYls4XVxyXG5cdFx0YjEgPSBiWzldXHJcblx0XHRiMiA9IGJbMTBdXHJcblx0XHRiMyA9IGJbMTFdXHJcblx0XHRvdXRbOF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMFxyXG5cdFx0b3V0WzldID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzFcclxuXHRcdG91dFsxMF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMlxyXG5cdFx0b3V0WzExXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzXHJcblx0XHRiMCA9IGJbMTJdXHJcblx0XHRiMSA9IGJbMTNdXHJcblx0XHRiMiA9IGJbMTRdXHJcblx0XHRiMyA9IGJbMTVdXHJcblx0XHRvdXRbMTJdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzBcclxuXHRcdG91dFsxM10gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMVxyXG5cdFx0b3V0WzE0XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyXHJcblx0XHRvdXRbMTVdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNsYXRlIGEgbWF0NCBieSB0aGUgZ2l2ZW4gdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2xhdGUkMihvdXQsIGEsIHYpIHtcclxuXHRcdHZhciB4ID0gdlswXSxcclxuXHRcdFx0eSA9IHZbMV0sXHJcblx0XHRcdHogPSB2WzJdXHJcblx0XHR2YXIgYTAwLCBhMDEsIGEwMiwgYTAzXHJcblx0XHR2YXIgYTEwLCBhMTEsIGExMiwgYTEzXHJcblx0XHR2YXIgYTIwLCBhMjEsIGEyMiwgYTIzXHJcblxyXG5cdFx0aWYgKGEgPT09IG91dCkge1xyXG5cdFx0XHRvdXRbMTJdID0gYVswXSAqIHggKyBhWzRdICogeSArIGFbOF0gKiB6ICsgYVsxMl1cclxuXHRcdFx0b3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdXHJcblx0XHRcdG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbM10gKiB4ICsgYVs3XSAqIHkgKyBhWzExXSAqIHogKyBhWzE1XVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YTAwID0gYVswXVxyXG5cdFx0XHRhMDEgPSBhWzFdXHJcblx0XHRcdGEwMiA9IGFbMl1cclxuXHRcdFx0YTAzID0gYVszXVxyXG5cdFx0XHRhMTAgPSBhWzRdXHJcblx0XHRcdGExMSA9IGFbNV1cclxuXHRcdFx0YTEyID0gYVs2XVxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHRcdGEyMCA9IGFbOF1cclxuXHRcdFx0YTIxID0gYVs5XVxyXG5cdFx0XHRhMjIgPSBhWzEwXVxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0XHRvdXRbMF0gPSBhMDBcclxuXHRcdFx0b3V0WzFdID0gYTAxXHJcblx0XHRcdG91dFsyXSA9IGEwMlxyXG5cdFx0XHRvdXRbM10gPSBhMDNcclxuXHRcdFx0b3V0WzRdID0gYTEwXHJcblx0XHRcdG91dFs1XSA9IGExMVxyXG5cdFx0XHRvdXRbNl0gPSBhMTJcclxuXHRcdFx0b3V0WzddID0gYTEzXHJcblx0XHRcdG91dFs4XSA9IGEyMFxyXG5cdFx0XHRvdXRbOV0gPSBhMjFcclxuXHRcdFx0b3V0WzEwXSA9IGEyMlxyXG5cdFx0XHRvdXRbMTFdID0gYTIzXHJcblx0XHRcdG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzIG5vdCB1c2luZyB2ZWN0b3JpemF0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IHRoZSB2ZWMzIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQzKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIHggPSB2WzBdLFxyXG5cdFx0XHR5ID0gdlsxXSxcclxuXHRcdFx0eiA9IHZbMl1cclxuXHRcdG91dFswXSA9IGFbMF0gKiB4XHJcblx0XHRvdXRbMV0gPSBhWzFdICogeFxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIHhcclxuXHRcdG91dFszXSA9IGFbM10gKiB4XHJcblx0XHRvdXRbNF0gPSBhWzRdICogeVxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIHlcclxuXHRcdG91dFs2XSA9IGFbNl0gKiB5XHJcblx0XHRvdXRbN10gPSBhWzddICogeVxyXG5cdFx0b3V0WzhdID0gYVs4XSAqIHpcclxuXHRcdG91dFs5XSA9IGFbOV0gKiB6XHJcblx0XHRvdXRbMTBdID0gYVsxMF0gKiB6XHJcblx0XHRvdXRbMTFdID0gYVsxMV0gKiB6XHJcblx0XHRvdXRbMTJdID0gYVsxMl1cclxuXHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRvdXRbMTVdID0gYVsxNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGUkMyhvdXQsIGEsIHJhZCwgYXhpcykge1xyXG5cdFx0dmFyIHggPSBheGlzWzBdLFxyXG5cdFx0XHR5ID0gYXhpc1sxXSxcclxuXHRcdFx0eiA9IGF4aXNbMl1cclxuXHRcdHZhciBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KVxyXG5cdFx0dmFyIHMsIGMsIHRcclxuXHRcdHZhciBhMDAsIGEwMSwgYTAyLCBhMDNcclxuXHRcdHZhciBhMTAsIGExMSwgYTEyLCBhMTNcclxuXHRcdHZhciBhMjAsIGEyMSwgYTIyLCBhMjNcclxuXHRcdHZhciBiMDAsIGIwMSwgYjAyXHJcblx0XHR2YXIgYjEwLCBiMTEsIGIxMlxyXG5cdFx0dmFyIGIyMCwgYjIxLCBiMjJcclxuXHJcblx0XHRpZiAobGVuIDwgRVBTSUxPTikge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGxlbiA9IDEgLyBsZW5cclxuXHRcdHggKj0gbGVuXHJcblx0XHR5ICo9IGxlblxyXG5cdFx0eiAqPSBsZW5cclxuXHRcdHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHRjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0dCA9IDEgLSBjXHJcblx0XHRhMDAgPSBhWzBdXHJcblx0XHRhMDEgPSBhWzFdXHJcblx0XHRhMDIgPSBhWzJdXHJcblx0XHRhMDMgPSBhWzNdXHJcblx0XHRhMTAgPSBhWzRdXHJcblx0XHRhMTEgPSBhWzVdXHJcblx0XHRhMTIgPSBhWzZdXHJcblx0XHRhMTMgPSBhWzddXHJcblx0XHRhMjAgPSBhWzhdXHJcblx0XHRhMjEgPSBhWzldXHJcblx0XHRhMjIgPSBhWzEwXVxyXG5cdFx0YTIzID0gYVsxMV0gLy8gQ29uc3RydWN0IHRoZSBlbGVtZW50cyBvZiB0aGUgcm90YXRpb24gbWF0cml4XHJcblxyXG5cdFx0YjAwID0geCAqIHggKiB0ICsgY1xyXG5cdFx0YjAxID0geSAqIHggKiB0ICsgeiAqIHNcclxuXHRcdGIwMiA9IHogKiB4ICogdCAtIHkgKiBzXHJcblx0XHRiMTAgPSB4ICogeSAqIHQgLSB6ICogc1xyXG5cdFx0YjExID0geSAqIHkgKiB0ICsgY1xyXG5cdFx0YjEyID0geiAqIHkgKiB0ICsgeCAqIHNcclxuXHRcdGIyMCA9IHggKiB6ICogdCArIHkgKiBzXHJcblx0XHRiMjEgPSB5ICogeiAqIHQgLSB4ICogc1xyXG5cdFx0YjIyID0geiAqIHogKiB0ICsgYyAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG5cclxuXHRcdG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMlxyXG5cdFx0b3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyXHJcblx0XHRvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDJcclxuXHRcdG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMlxyXG5cdFx0b3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyXHJcblx0XHRvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTJcclxuXHRcdG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMlxyXG5cdFx0b3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyXHJcblx0XHRvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjJcclxuXHRcdG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMlxyXG5cdFx0b3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMlxyXG5cdFx0b3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMlxyXG5cclxuXHRcdGlmIChhICE9PSBvdXQpIHtcclxuXHRcdFx0Ly8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcclxuXHRcdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdHZhciBhMTAgPSBhWzRdXHJcblx0XHR2YXIgYTExID0gYVs1XVxyXG5cdFx0dmFyIGExMiA9IGFbNl1cclxuXHRcdHZhciBhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XVxyXG5cdFx0dmFyIGEyMSA9IGFbOV1cclxuXHRcdHZhciBhMjIgPSBhWzEwXVxyXG5cdFx0dmFyIGEyMyA9IGFbMTFdXHJcblxyXG5cdFx0aWYgKGEgIT09IG91dCkge1xyXG5cdFx0XHQvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXHJcblx0XHRcdG91dFswXSA9IGFbMF1cclxuXHRcdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRcdG91dFszXSA9IGFbM11cclxuXHRcdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogc1xyXG5cdFx0b3V0WzVdID0gYTExICogYyArIGEyMSAqIHNcclxuXHRcdG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzXHJcblx0XHRvdXRbN10gPSBhMTMgKiBjICsgYTIzICogc1xyXG5cdFx0b3V0WzhdID0gYTIwICogYyAtIGExMCAqIHNcclxuXHRcdG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzXHJcblx0XHRvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHNcclxuXHRcdG91dFsxMV0gPSBhMjMgKiBjIC0gYTEzICogc1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdHZhciBhMDAgPSBhWzBdXHJcblx0XHR2YXIgYTAxID0gYVsxXVxyXG5cdFx0dmFyIGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTIwID0gYVs4XVxyXG5cdFx0dmFyIGEyMSA9IGFbOV1cclxuXHRcdHZhciBhMjIgPSBhWzEwXVxyXG5cdFx0dmFyIGEyMyA9IGFbMTFdXHJcblxyXG5cdFx0aWYgKGEgIT09IG91dCkge1xyXG5cdFx0XHQvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXHJcblx0XHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRcdG91dFs3XSA9IGFbN11cclxuXHRcdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBhMDAgKiBjIC0gYTIwICogc1xyXG5cdFx0b3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHNcclxuXHRcdG91dFsyXSA9IGEwMiAqIGMgLSBhMjIgKiBzXHJcblx0XHRvdXRbM10gPSBhMDMgKiBjIC0gYTIzICogc1xyXG5cdFx0b3V0WzhdID0gYTAwICogcyArIGEyMCAqIGNcclxuXHRcdG91dFs5XSA9IGEwMSAqIHMgKyBhMjEgKiBjXHJcblx0XHRvdXRbMTBdID0gYTAyICogcyArIGEyMiAqIGNcclxuXHRcdG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogY1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdHZhciBhMDAgPSBhWzBdXHJcblx0XHR2YXIgYTAxID0gYVsxXVxyXG5cdFx0dmFyIGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XVxyXG5cdFx0dmFyIGExMSA9IGFbNV1cclxuXHRcdHZhciBhMTIgPSBhWzZdXHJcblx0XHR2YXIgYTEzID0gYVs3XVxyXG5cclxuXHRcdGlmIChhICE9PSBvdXQpIHtcclxuXHRcdFx0Ly8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcclxuXHRcdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0XHRvdXRbOV0gPSBhWzldXHJcblx0XHRcdG91dFsxMF0gPSBhWzEwXVxyXG5cdFx0XHRvdXRbMTFdID0gYVsxMV1cclxuXHRcdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHR9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBhMDAgKiBjICsgYTEwICogc1xyXG5cdFx0b3V0WzFdID0gYTAxICogYyArIGExMSAqIHNcclxuXHRcdG91dFsyXSA9IGEwMiAqIGMgKyBhMTIgKiBzXHJcblx0XHRvdXRbM10gPSBhMDMgKiBjICsgYTEzICogc1xyXG5cdFx0b3V0WzRdID0gYTEwICogYyAtIGEwMCAqIHNcclxuXHRcdG91dFs1XSA9IGExMSAqIGMgLSBhMDEgKiBzXHJcblx0XHRvdXRbNl0gPSBhMTIgKiBjIC0gYTAyICogc1xyXG5cdFx0b3V0WzddID0gYTEzICogYyAtIGEwMyAqIHNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHRyYW5zbGF0aW9uXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24kMihvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDFcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDBcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSAxXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IHZbMF1cclxuXHRcdG91dFsxM10gPSB2WzFdXHJcblx0XHRvdXRbMTRdID0gdlsyXVxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tU2NhbGluZyQzKG91dCwgdikge1xyXG5cdFx0b3V0WzBdID0gdlswXVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gdlsxXVxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzEwXSA9IHZbMl1cclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZSBhcm91bmQgYSBnaXZlbiBheGlzXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkLCBheGlzKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb24kMyhvdXQsIHJhZCwgYXhpcykge1xyXG5cdFx0dmFyIHggPSBheGlzWzBdLFxyXG5cdFx0XHR5ID0gYXhpc1sxXSxcclxuXHRcdFx0eiA9IGF4aXNbMl1cclxuXHRcdHZhciBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KVxyXG5cdFx0dmFyIHMsIGMsIHRcclxuXHJcblx0XHRpZiAobGVuIDwgRVBTSUxPTikge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGxlbiA9IDEgLyBsZW5cclxuXHRcdHggKj0gbGVuXHJcblx0XHR5ICo9IGxlblxyXG5cdFx0eiAqPSBsZW5cclxuXHRcdHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHRjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0dCA9IDEgLSBjIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0geCAqIHggKiB0ICsgY1xyXG5cdFx0b3V0WzFdID0geSAqIHggKiB0ICsgeiAqIHNcclxuXHRcdG91dFsyXSA9IHogKiB4ICogdCAtIHkgKiBzXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSB4ICogeSAqIHQgLSB6ICogc1xyXG5cdFx0b3V0WzVdID0geSAqIHkgKiB0ICsgY1xyXG5cdFx0b3V0WzZdID0geiAqIHkgKiB0ICsgeCAqIHNcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IHggKiB6ICogdCArIHkgKiBzXHJcblx0XHRvdXRbOV0gPSB5ICogeiAqIHQgLSB4ICogc1xyXG5cdFx0b3V0WzEwXSA9IHogKiB6ICogdCArIGNcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5yb3RhdGVYKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21YUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSBjXHJcblx0XHRvdXRbNl0gPSBzXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAtc1xyXG5cdFx0b3V0WzEwXSA9IGNcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5yb3RhdGVZKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21ZUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAtc1xyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMVxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gc1xyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzEwXSA9IGNcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5yb3RhdGVaKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21aUm90YXRpb24ob3V0LCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSBzXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAtc1xyXG5cdFx0b3V0WzVdID0gY1xyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzEwXSA9IDFcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uIGFuZCB2ZWN0b3IgdHJhbnNsYXRpb25cclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xyXG5cdCAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcblx0ICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcclxuXHQgKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIHEsIHYpIHtcclxuXHRcdC8vIFF1YXRlcm5pb24gbWF0aFxyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB4eSA9IHggKiB5MlxyXG5cdFx0dmFyIHh6ID0geCAqIHoyXHJcblx0XHR2YXIgeXkgPSB5ICogeTJcclxuXHRcdHZhciB5eiA9IHkgKiB6MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHRvdXRbMF0gPSAxIC0gKHl5ICsgenopXHJcblx0XHRvdXRbMV0gPSB4eSArIHd6XHJcblx0XHRvdXRbMl0gPSB4eiAtIHd5XHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSB4eSAtIHd6XHJcblx0XHRvdXRbNV0gPSAxIC0gKHh4ICsgenopXHJcblx0XHRvdXRbNl0gPSB5eiArIHd4XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSB4eiArIHd5XHJcblx0XHRvdXRbOV0gPSB5eiAtIHd4XHJcblx0XHRvdXRbMTBdID0gMSAtICh4eCArIHl5KVxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSB2WzBdXHJcblx0XHRvdXRbMTNdID0gdlsxXVxyXG5cdFx0b3V0WzE0XSA9IHZbMl1cclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgbWF0NCBmcm9tIGEgZHVhbCBxdWF0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgTWF0cml4XHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUXVhdDIob3V0LCBhKSB7XHJcblx0XHR2YXIgdHJhbnNsYXRpb24gPSBuZXcgQVJSQVlfVFlQRSgzKVxyXG5cdFx0dmFyIGJ4ID0gLWFbMF0sXHJcblx0XHRcdGJ5ID0gLWFbMV0sXHJcblx0XHRcdGJ6ID0gLWFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXSxcclxuXHRcdFx0YXggPSBhWzRdLFxyXG5cdFx0XHRheSA9IGFbNV0sXHJcblx0XHRcdGF6ID0gYVs2XSxcclxuXHRcdFx0YXcgPSBhWzddXHJcblx0XHR2YXIgbWFnbml0dWRlID0gYnggKiBieCArIGJ5ICogYnkgKyBieiAqIGJ6ICsgYncgKiBidyAvL09ubHkgc2NhbGUgaWYgaXQgbWFrZXMgc2Vuc2VcclxuXHJcblx0XHRpZiAobWFnbml0dWRlID4gMCkge1xyXG5cdFx0XHR0cmFuc2xhdGlvblswXSA9ICgoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyKSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR0cmFuc2xhdGlvblsxXSA9ICgoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyKSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR0cmFuc2xhdGlvblsyXSA9ICgoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyKSAvIG1hZ25pdHVkZVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dHJhbnNsYXRpb25bMF0gPSAoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyXHJcblx0XHRcdHRyYW5zbGF0aW9uWzFdID0gKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMlxyXG5cdFx0XHR0cmFuc2xhdGlvblsyXSA9IChheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4KSAqIDJcclxuXHRcdH1cclxuXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIGEsIHRyYW5zbGF0aW9uKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cclxuXHQgKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLFxyXG5cdCAqICB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxyXG5cdCAqIEBwYXJhbSAge3ZlYzN9IG91dCBWZWN0b3IgdG8gcmVjZWl2ZSB0cmFuc2xhdGlvbiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG5cdCAqIEByZXR1cm4ge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbihvdXQsIG1hdCkge1xyXG5cdFx0b3V0WzBdID0gbWF0WzEyXVxyXG5cdFx0b3V0WzFdID0gbWF0WzEzXVxyXG5cdFx0b3V0WzJdID0gbWF0WzE0XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBzY2FsaW5nIGZhY3RvciBjb21wb25lbnQgb2YgYSB0cmFuc2Zvcm1hdGlvblxyXG5cdCAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZVxyXG5cdCAqICB3aXRoIGEgbm9ybWFsaXplZCBRdWF0ZXJuaW9uIHBhcmFtdGVyLCB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmVcclxuXHQgKiAgdGhlIHNhbWUgYXMgdGhlIHNjYWxpbmcgdmVjdG9yXHJcblx0ICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXHJcblx0ICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSAge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXHJcblx0ICogQHJldHVybiB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGdldFNjYWxpbmcob3V0LCBtYXQpIHtcclxuXHRcdHZhciBtMTEgPSBtYXRbMF1cclxuXHRcdHZhciBtMTIgPSBtYXRbMV1cclxuXHRcdHZhciBtMTMgPSBtYXRbMl1cclxuXHRcdHZhciBtMjEgPSBtYXRbNF1cclxuXHRcdHZhciBtMjIgPSBtYXRbNV1cclxuXHRcdHZhciBtMjMgPSBtYXRbNl1cclxuXHRcdHZhciBtMzEgPSBtYXRbOF1cclxuXHRcdHZhciBtMzIgPSBtYXRbOV1cclxuXHRcdHZhciBtMzMgPSBtYXRbMTBdXHJcblx0XHRvdXRbMF0gPSBNYXRoLnNxcnQobTExICogbTExICsgbTEyICogbTEyICsgbTEzICogbTEzKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5zcXJ0KG0yMSAqIG0yMSArIG0yMiAqIG0yMiArIG0yMyAqIG0yMylcclxuXHRcdG91dFsyXSA9IE1hdGguc3FydChtMzEgKiBtMzEgKyBtMzIgKiBtMzIgKyBtMzMgKiBtMzMpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb25hbCBjb21wb25lbnRcclxuXHQgKiAgb2YgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGhcclxuXHQgKiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sIHRoZSByZXR1cm5lZCBxdWF0ZXJuaW9uIHdpbGwgYmUgdGhlXHJcblx0ICogIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gb3JpZ2luYWxseSBzdXBwbGllZC5cclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCBRdWF0ZXJuaW9uIHRvIHJlY2VpdmUgdGhlIHJvdGF0aW9uIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcclxuXHQgKiBAcmV0dXJuIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0Um90YXRpb24ob3V0LCBtYXQpIHtcclxuXHRcdC8vIEFsZ29yaXRobSB0YWtlbiBmcm9tIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2dlb21ldHJ5L3JvdGF0aW9ucy9jb252ZXJzaW9ucy9tYXRyaXhUb1F1YXRlcm5pb24vaW5kZXguaHRtXHJcblx0XHR2YXIgdHJhY2UgPSBtYXRbMF0gKyBtYXRbNV0gKyBtYXRbMTBdXHJcblx0XHR2YXIgUyA9IDBcclxuXHJcblx0XHRpZiAodHJhY2UgPiAwKSB7XHJcblx0XHRcdFMgPSBNYXRoLnNxcnQodHJhY2UgKyAxLjApICogMlxyXG5cdFx0XHRvdXRbM10gPSAwLjI1ICogU1xyXG5cdFx0XHRvdXRbMF0gPSAobWF0WzZdIC0gbWF0WzldKSAvIFNcclxuXHRcdFx0b3V0WzFdID0gKG1hdFs4XSAtIG1hdFsyXSkgLyBTXHJcblx0XHRcdG91dFsyXSA9IChtYXRbMV0gLSBtYXRbNF0pIC8gU1xyXG5cdFx0fSBlbHNlIGlmIChtYXRbMF0gPiBtYXRbNV0gJiYgbWF0WzBdID4gbWF0WzEwXSkge1xyXG5cdFx0XHRTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFswXSAtIG1hdFs1XSAtIG1hdFsxMF0pICogMlxyXG5cdFx0XHRvdXRbM10gPSAobWF0WzZdIC0gbWF0WzldKSAvIFNcclxuXHRcdFx0b3V0WzBdID0gMC4yNSAqIFNcclxuXHRcdFx0b3V0WzFdID0gKG1hdFsxXSArIG1hdFs0XSkgLyBTXHJcblx0XHRcdG91dFsyXSA9IChtYXRbOF0gKyBtYXRbMl0pIC8gU1xyXG5cdFx0fSBlbHNlIGlmIChtYXRbNV0gPiBtYXRbMTBdKSB7XHJcblx0XHRcdFMgPSBNYXRoLnNxcnQoMS4wICsgbWF0WzVdIC0gbWF0WzBdIC0gbWF0WzEwXSkgKiAyXHJcblx0XHRcdG91dFszXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gU1xyXG5cdFx0XHRvdXRbMF0gPSAobWF0WzFdICsgbWF0WzRdKSAvIFNcclxuXHRcdFx0b3V0WzFdID0gMC4yNSAqIFNcclxuXHRcdFx0b3V0WzJdID0gKG1hdFs2XSArIG1hdFs5XSkgLyBTXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFsxMF0gLSBtYXRbMF0gLSBtYXRbNV0pICogMlxyXG5cdFx0XHRvdXRbM10gPSAobWF0WzFdIC0gbWF0WzRdKSAvIFNcclxuXHRcdFx0b3V0WzBdID0gKG1hdFs4XSArIG1hdFsyXSkgLyBTXHJcblx0XHRcdG91dFsxXSA9IChtYXRbNl0gKyBtYXRbOV0pIC8gU1xyXG5cdFx0XHRvdXRbMl0gPSAwLjI1ICogU1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiwgdmVjdG9yIHRyYW5zbGF0aW9uIGFuZCB2ZWN0b3Igc2NhbGVcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xyXG5cdCAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcblx0ICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcclxuXHQgKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcclxuXHQgKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKG91dCwgcSwgdiwgcykge1xyXG5cdFx0Ly8gUXVhdGVybmlvbiBtYXRoXHJcblx0XHR2YXIgeCA9IHFbMF0sXHJcblx0XHRcdHkgPSBxWzFdLFxyXG5cdFx0XHR6ID0gcVsyXSxcclxuXHRcdFx0dyA9IHFbM11cclxuXHRcdHZhciB4MiA9IHggKyB4XHJcblx0XHR2YXIgeTIgPSB5ICsgeVxyXG5cdFx0dmFyIHoyID0geiArIHpcclxuXHRcdHZhciB4eCA9IHggKiB4MlxyXG5cdFx0dmFyIHh5ID0geCAqIHkyXHJcblx0XHR2YXIgeHogPSB4ICogejJcclxuXHRcdHZhciB5eSA9IHkgKiB5MlxyXG5cdFx0dmFyIHl6ID0geSAqIHoyXHJcblx0XHR2YXIgenogPSB6ICogejJcclxuXHRcdHZhciB3eCA9IHcgKiB4MlxyXG5cdFx0dmFyIHd5ID0gdyAqIHkyXHJcblx0XHR2YXIgd3ogPSB3ICogejJcclxuXHRcdHZhciBzeCA9IHNbMF1cclxuXHRcdHZhciBzeSA9IHNbMV1cclxuXHRcdHZhciBzeiA9IHNbMl1cclxuXHRcdG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4XHJcblx0XHRvdXRbMV0gPSAoeHkgKyB3eikgKiBzeFxyXG5cdFx0b3V0WzJdID0gKHh6IC0gd3kpICogc3hcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5XHJcblx0XHRvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeVxyXG5cdFx0b3V0WzZdID0gKHl6ICsgd3gpICogc3lcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9ICh4eiArIHd5KSAqIHN6XHJcblx0XHRvdXRbOV0gPSAoeXogLSB3eCkgKiBzelxyXG5cdFx0b3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6XHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IHZbMF1cclxuXHRcdG91dFsxM10gPSB2WzFdXHJcblx0XHRvdXRbMTRdID0gdlsyXVxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiwgdmVjdG9yIHRyYW5zbGF0aW9uIGFuZCB2ZWN0b3Igc2NhbGUsIHJvdGF0aW5nIGFuZCBzY2FsaW5nIGFyb3VuZCB0aGUgZ2l2ZW4gb3JpZ2luXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgb3JpZ2luKTtcclxuXHQgKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG5cdCAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQuc2NhbGUoZGVzdCwgc2NhbGUpXHJcblx0ICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG5lZ2F0aXZlT3JpZ2luKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvIFRoZSBvcmlnaW4gdmVjdG9yIGFyb3VuZCB3aGljaCB0byBzY2FsZSBhbmQgcm90YXRlXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luKG91dCwgcSwgdiwgcywgbykge1xyXG5cdFx0Ly8gUXVhdGVybmlvbiBtYXRoXHJcblx0XHR2YXIgeCA9IHFbMF0sXHJcblx0XHRcdHkgPSBxWzFdLFxyXG5cdFx0XHR6ID0gcVsyXSxcclxuXHRcdFx0dyA9IHFbM11cclxuXHRcdHZhciB4MiA9IHggKyB4XHJcblx0XHR2YXIgeTIgPSB5ICsgeVxyXG5cdFx0dmFyIHoyID0geiArIHpcclxuXHRcdHZhciB4eCA9IHggKiB4MlxyXG5cdFx0dmFyIHh5ID0geCAqIHkyXHJcblx0XHR2YXIgeHogPSB4ICogejJcclxuXHRcdHZhciB5eSA9IHkgKiB5MlxyXG5cdFx0dmFyIHl6ID0geSAqIHoyXHJcblx0XHR2YXIgenogPSB6ICogejJcclxuXHRcdHZhciB3eCA9IHcgKiB4MlxyXG5cdFx0dmFyIHd5ID0gdyAqIHkyXHJcblx0XHR2YXIgd3ogPSB3ICogejJcclxuXHRcdHZhciBzeCA9IHNbMF1cclxuXHRcdHZhciBzeSA9IHNbMV1cclxuXHRcdHZhciBzeiA9IHNbMl1cclxuXHRcdHZhciBveCA9IG9bMF1cclxuXHRcdHZhciBveSA9IG9bMV1cclxuXHRcdHZhciBveiA9IG9bMl1cclxuXHRcdHZhciBvdXQwID0gKDEgLSAoeXkgKyB6eikpICogc3hcclxuXHRcdHZhciBvdXQxID0gKHh5ICsgd3opICogc3hcclxuXHRcdHZhciBvdXQyID0gKHh6IC0gd3kpICogc3hcclxuXHRcdHZhciBvdXQ0ID0gKHh5IC0gd3opICogc3lcclxuXHRcdHZhciBvdXQ1ID0gKDEgLSAoeHggKyB6eikpICogc3lcclxuXHRcdHZhciBvdXQ2ID0gKHl6ICsgd3gpICogc3lcclxuXHRcdHZhciBvdXQ4ID0gKHh6ICsgd3kpICogc3pcclxuXHRcdHZhciBvdXQ5ID0gKHl6IC0gd3gpICogc3pcclxuXHRcdHZhciBvdXQxMCA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6XHJcblx0XHRvdXRbMF0gPSBvdXQwXHJcblx0XHRvdXRbMV0gPSBvdXQxXHJcblx0XHRvdXRbMl0gPSBvdXQyXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSBvdXQ0XHJcblx0XHRvdXRbNV0gPSBvdXQ1XHJcblx0XHRvdXRbNl0gPSBvdXQ2XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSBvdXQ4XHJcblx0XHRvdXRbOV0gPSBvdXQ5XHJcblx0XHRvdXRbMTBdID0gb3V0MTBcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gdlswXSArIG94IC0gKG91dDAgKiBveCArIG91dDQgKiBveSArIG91dDggKiBveilcclxuXHRcdG91dFsxM10gPSB2WzFdICsgb3kgLSAob3V0MSAqIG94ICsgb3V0NSAqIG95ICsgb3V0OSAqIG96KVxyXG5cdFx0b3V0WzE0XSA9IHZbMl0gKyBveiAtIChvdXQyICogb3ggKyBvdXQ2ICogb3kgKyBvdXQxMCAqIG96KVxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyBhIDR4NCBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUXVhdCQxKG91dCwgcSkge1xyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB5eCA9IHkgKiB4MlxyXG5cdFx0dmFyIHl5ID0geSAqIHkyXHJcblx0XHR2YXIgenggPSB6ICogeDJcclxuXHRcdHZhciB6eSA9IHogKiB5MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHRvdXRbMF0gPSAxIC0geXkgLSB6elxyXG5cdFx0b3V0WzFdID0geXggKyB3elxyXG5cdFx0b3V0WzJdID0genggLSB3eVxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0geXggLSB3elxyXG5cdFx0b3V0WzVdID0gMSAtIHh4IC0genpcclxuXHRcdG91dFs2XSA9IHp5ICsgd3hcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IHp4ICsgd3lcclxuXHRcdG91dFs5XSA9IHp5IC0gd3hcclxuXHRcdG91dFsxMF0gPSAxIC0geHggLSB5eVxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSAwXHJcblx0XHRvdXRbMTNdID0gMFxyXG5cdFx0b3V0WzE0XSA9IDBcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcnVzdHVtKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcclxuXHRcdHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KVxyXG5cdFx0dmFyIHRiID0gMSAvICh0b3AgLSBib3R0b20pXHJcblx0XHR2YXIgbmYgPSAxIC8gKG5lYXIgLSBmYXIpXHJcblx0XHRvdXRbMF0gPSBuZWFyICogMiAqIHJsXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSBuZWFyICogMiAqIHRiXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAocmlnaHQgKyBsZWZ0KSAqIHJsXHJcblx0XHRvdXRbOV0gPSAodG9wICsgYm90dG9tKSAqIHRiXHJcblx0XHRvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmZcclxuXHRcdG91dFsxMV0gPSAtMVxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gZmFyICogbmVhciAqIDIgKiBuZlxyXG5cdFx0b3V0WzE1XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzLlxyXG5cdCAqIFBhc3NpbmcgbnVsbC91bmRlZmluZWQvbm8gdmFsdWUgZm9yIGZhciB3aWxsIGdlbmVyYXRlIGluZmluaXRlIHByb2plY3Rpb24gbWF0cml4LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtLCBjYW4gYmUgbnVsbCBvciBJbmZpbml0eVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcGVyc3BlY3RpdmUob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xyXG5cdFx0dmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXHJcblx0XHRcdG5mXHJcblx0XHRvdXRbMF0gPSBmIC8gYXNwZWN0XHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSBmXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAwXHJcblx0XHRvdXRbMTFdID0gLTFcclxuXHRcdG91dFsxMl0gPSAwXHJcblx0XHRvdXRbMTNdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDBcclxuXHJcblx0XHRpZiAoZmFyICE9IG51bGwgJiYgZmFyICE9PSBJbmZpbml0eSkge1xyXG5cdFx0XHRuZiA9IDEgLyAobmVhciAtIGZhcilcclxuXHRcdFx0b3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mXHJcblx0XHRcdG91dFsxNF0gPSAyICogZmFyICogbmVhciAqIG5mXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvdXRbMTBdID0gLTFcclxuXHRcdFx0b3V0WzE0XSA9IC0yICogbmVhclxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZmllbGQgb2Ygdmlldy5cclxuXHQgKiBUaGlzIGlzIHByaW1hcmlseSB1c2VmdWwgZm9yIGdlbmVyYXRpbmcgcHJvamVjdGlvbiBtYXRyaWNlcyB0byBiZSB1c2VkXHJcblx0ICogd2l0aCB0aGUgc3RpbGwgZXhwZXJpZW1lbnRhbCBXZWJWUiBBUEkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGZvdiBPYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIHZhbHVlczogdXBEZWdyZWVzLCBkb3duRGVncmVlcywgbGVmdERlZ3JlZXMsIHJpZ2h0RGVncmVlc1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXcob3V0LCBmb3YsIG5lYXIsIGZhcikge1xyXG5cdFx0dmFyIHVwVGFuID0gTWF0aC50YW4oKGZvdi51cERlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MC4wKVxyXG5cdFx0dmFyIGRvd25UYW4gPSBNYXRoLnRhbigoZm92LmRvd25EZWdyZWVzICogTWF0aC5QSSkgLyAxODAuMClcclxuXHRcdHZhciBsZWZ0VGFuID0gTWF0aC50YW4oKGZvdi5sZWZ0RGVncmVlcyAqIE1hdGguUEkpIC8gMTgwLjApXHJcblx0XHR2YXIgcmlnaHRUYW4gPSBNYXRoLnRhbigoZm92LnJpZ2h0RGVncmVlcyAqIE1hdGguUEkpIC8gMTgwLjApXHJcblx0XHR2YXIgeFNjYWxlID0gMi4wIC8gKGxlZnRUYW4gKyByaWdodFRhbilcclxuXHRcdHZhciB5U2NhbGUgPSAyLjAgLyAodXBUYW4gKyBkb3duVGFuKVxyXG5cdFx0b3V0WzBdID0geFNjYWxlXHJcblx0XHRvdXRbMV0gPSAwLjBcclxuXHRcdG91dFsyXSA9IDAuMFxyXG5cdFx0b3V0WzNdID0gMC4wXHJcblx0XHRvdXRbNF0gPSAwLjBcclxuXHRcdG91dFs1XSA9IHlTY2FsZVxyXG5cdFx0b3V0WzZdID0gMC4wXHJcblx0XHRvdXRbN10gPSAwLjBcclxuXHRcdG91dFs4XSA9IC0oKGxlZnRUYW4gLSByaWdodFRhbikgKiB4U2NhbGUgKiAwLjUpXHJcblx0XHRvdXRbOV0gPSAodXBUYW4gLSBkb3duVGFuKSAqIHlTY2FsZSAqIDAuNVxyXG5cdFx0b3V0WzEwXSA9IGZhciAvIChuZWFyIC0gZmFyKVxyXG5cdFx0b3V0WzExXSA9IC0xLjBcclxuXHRcdG91dFsxMl0gPSAwLjBcclxuXHRcdG91dFsxM10gPSAwLjBcclxuXHRcdG91dFsxNF0gPSAoZmFyICogbmVhcikgLyAobmVhciAtIGZhcilcclxuXHRcdG91dFsxNV0gPSAwLjBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gb3J0aG8ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xyXG5cdFx0dmFyIGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpXHJcblx0XHR2YXIgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcClcclxuXHRcdHZhciBuZiA9IDEgLyAobmVhciAtIGZhcilcclxuXHRcdG91dFswXSA9IC0yICogbHJcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IC0yICogYnRcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDBcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSAyICogbmZcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBsclxyXG5cdFx0b3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnRcclxuXHRcdG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZlxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgbG9vay1hdCBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZXllIHBvc2l0aW9uLCBmb2NhbCBwb2ludCwgYW5kIHVwIGF4aXMuXHJcblx0ICogSWYgeW91IHdhbnQgYSBtYXRyaXggdGhhdCBhY3R1YWxseSBtYWtlcyBhbiBvYmplY3QgbG9vayBhdCBhbm90aGVyIG9iamVjdCwgeW91IHNob3VsZCB1c2UgdGFyZ2V0VG8gaW5zdGVhZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsb29rQXQob3V0LCBleWUsIGNlbnRlciwgdXApIHtcclxuXHRcdHZhciB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW5cclxuXHRcdHZhciBleWV4ID0gZXllWzBdXHJcblx0XHR2YXIgZXlleSA9IGV5ZVsxXVxyXG5cdFx0dmFyIGV5ZXogPSBleWVbMl1cclxuXHRcdHZhciB1cHggPSB1cFswXVxyXG5cdFx0dmFyIHVweSA9IHVwWzFdXHJcblx0XHR2YXIgdXB6ID0gdXBbMl1cclxuXHRcdHZhciBjZW50ZXJ4ID0gY2VudGVyWzBdXHJcblx0XHR2YXIgY2VudGVyeSA9IGNlbnRlclsxXVxyXG5cdFx0dmFyIGNlbnRlcnogPSBjZW50ZXJbMl1cclxuXHJcblx0XHRpZiAoXHJcblx0XHRcdE1hdGguYWJzKGV5ZXggLSBjZW50ZXJ4KSA8IEVQU0lMT04gJiZcclxuXHRcdFx0TWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgRVBTSUxPTiAmJlxyXG5cdFx0XHRNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBFUFNJTE9OXHJcblx0XHQpIHtcclxuXHRcdFx0cmV0dXJuIGlkZW50aXR5JDMob3V0KVxyXG5cdFx0fVxyXG5cclxuXHRcdHowID0gZXlleCAtIGNlbnRlcnhcclxuXHRcdHoxID0gZXlleSAtIGNlbnRlcnlcclxuXHRcdHoyID0gZXlleiAtIGNlbnRlcnpcclxuXHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQoejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyKVxyXG5cdFx0ejAgKj0gbGVuXHJcblx0XHR6MSAqPSBsZW5cclxuXHRcdHoyICo9IGxlblxyXG5cdFx0eDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxXHJcblx0XHR4MSA9IHVweiAqIHowIC0gdXB4ICogejJcclxuXHRcdHgyID0gdXB4ICogejEgLSB1cHkgKiB6MFxyXG5cdFx0bGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4MilcclxuXHJcblx0XHRpZiAoIWxlbikge1xyXG5cdFx0XHR4MCA9IDBcclxuXHRcdFx0eDEgPSAwXHJcblx0XHRcdHgyID0gMFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bGVuID0gMSAvIGxlblxyXG5cdFx0XHR4MCAqPSBsZW5cclxuXHRcdFx0eDEgKj0gbGVuXHJcblx0XHRcdHgyICo9IGxlblxyXG5cdFx0fVxyXG5cclxuXHRcdHkwID0gejEgKiB4MiAtIHoyICogeDFcclxuXHRcdHkxID0gejIgKiB4MCAtIHowICogeDJcclxuXHRcdHkyID0gejAgKiB4MSAtIHoxICogeDBcclxuXHRcdGxlbiA9IE1hdGguc3FydCh5MCAqIHkwICsgeTEgKiB5MSArIHkyICogeTIpXHJcblxyXG5cdFx0aWYgKCFsZW4pIHtcclxuXHRcdFx0eTAgPSAwXHJcblx0XHRcdHkxID0gMFxyXG5cdFx0XHR5MiA9IDBcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGxlbiA9IDEgLyBsZW5cclxuXHRcdFx0eTAgKj0gbGVuXHJcblx0XHRcdHkxICo9IGxlblxyXG5cdFx0XHR5MiAqPSBsZW5cclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSB4MFxyXG5cdFx0b3V0WzFdID0geTBcclxuXHRcdG91dFsyXSA9IHowXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSB4MVxyXG5cdFx0b3V0WzVdID0geTFcclxuXHRcdG91dFs2XSA9IHoxXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSB4MlxyXG5cdFx0b3V0WzldID0geTJcclxuXHRcdG91dFsxMF0gPSB6MlxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSAtKHgwICogZXlleCArIHgxICogZXlleSArIHgyICogZXlleilcclxuXHRcdG91dFsxM10gPSAtKHkwICogZXlleCArIHkxICogZXlleSArIHkyICogZXlleilcclxuXHRcdG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleilcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIG1hdHJpeCB0aGF0IG1ha2VzIHNvbWV0aGluZyBsb29rIGF0IHNvbWV0aGluZyBlbHNlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRhcmdldFRvKG91dCwgZXllLCB0YXJnZXQsIHVwKSB7XHJcblx0XHR2YXIgZXlleCA9IGV5ZVswXSxcclxuXHRcdFx0ZXlleSA9IGV5ZVsxXSxcclxuXHRcdFx0ZXlleiA9IGV5ZVsyXSxcclxuXHRcdFx0dXB4ID0gdXBbMF0sXHJcblx0XHRcdHVweSA9IHVwWzFdLFxyXG5cdFx0XHR1cHogPSB1cFsyXVxyXG5cdFx0dmFyIHowID0gZXlleCAtIHRhcmdldFswXSxcclxuXHRcdFx0ejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxyXG5cdFx0XHR6MiA9IGV5ZXogLSB0YXJnZXRbMl1cclxuXHRcdHZhciBsZW4gPSB6MCAqIHowICsgejEgKiB6MSArIHoyICogejJcclxuXHJcblx0XHRpZiAobGVuID4gMCkge1xyXG5cdFx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcclxuXHRcdFx0ejAgKj0gbGVuXHJcblx0XHRcdHoxICo9IGxlblxyXG5cdFx0XHR6MiAqPSBsZW5cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxLFxyXG5cdFx0XHR4MSA9IHVweiAqIHowIC0gdXB4ICogejIsXHJcblx0XHRcdHgyID0gdXB4ICogejEgLSB1cHkgKiB6MFxyXG5cdFx0bGVuID0geDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyXHJcblxyXG5cdFx0aWYgKGxlbiA+IDApIHtcclxuXHRcdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pXHJcblx0XHRcdHgwICo9IGxlblxyXG5cdFx0XHR4MSAqPSBsZW5cclxuXHRcdFx0eDIgKj0gbGVuXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0geDBcclxuXHRcdG91dFsxXSA9IHgxXHJcblx0XHRvdXRbMl0gPSB4MlxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gejEgKiB4MiAtIHoyICogeDFcclxuXHRcdG91dFs1XSA9IHoyICogeDAgLSB6MCAqIHgyXHJcblx0XHRvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gejBcclxuXHRcdG91dFs5XSA9IHoxXHJcblx0XHRvdXRbMTBdID0gejJcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gZXlleFxyXG5cdFx0b3V0WzEzXSA9IGV5ZXlcclxuXHRcdG91dFsxNF0gPSBleWV6XHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkMyhhKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQnbWF0NCgnICtcclxuXHRcdFx0YVswXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzFdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbMl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVszXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzRdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs2XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzddICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbOF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs5XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzEwXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzExXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzEyXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzEzXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzE0XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzE1XSArXHJcblx0XHRcdCcpJ1xyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvYiQzKGEpIHtcclxuXHRcdHJldHVybiBNYXRoLnNxcnQoXHJcblx0XHRcdE1hdGgucG93KGFbMF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzFdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsyXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbM10sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzRdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs1XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzddLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs4XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbOV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzEwXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMTFdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxMl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzEzXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMTRdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxNV0sIDIpLFxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQ0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRkJDMob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdICsgYls2XVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN11cclxuXHRcdG91dFs4XSA9IGFbOF0gKyBiWzhdXHJcblx0XHRvdXRbOV0gPSBhWzldICsgYls5XVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdICsgYlsxMF1cclxuXHRcdG91dFsxMV0gPSBhWzExXSArIGJbMTFdXHJcblx0XHRvdXRbMTJdID0gYVsxMl0gKyBiWzEyXVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdICsgYlsxM11cclxuXHRcdG91dFsxNF0gPSBhWzE0XSArIGJbMTRdXHJcblx0XHRvdXRbMTVdID0gYVsxNV0gKyBiWzE1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdWJ0cmFjdCQzKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAtIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC0gYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAtIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gLSBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdIC0gYls1XVxyXG5cdFx0b3V0WzZdID0gYVs2XSAtIGJbNl1cclxuXHRcdG91dFs3XSA9IGFbN10gLSBiWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdIC0gYls4XVxyXG5cdFx0b3V0WzldID0gYVs5XSAtIGJbOV1cclxuXHRcdG91dFsxMF0gPSBhWzEwXSAtIGJbMTBdXHJcblx0XHRvdXRbMTFdID0gYVsxMV0gLSBiWzExXVxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdIC0gYlsxMl1cclxuXHRcdG91dFsxM10gPSBhWzEzXSAtIGJbMTNdXHJcblx0XHRvdXRbMTRdID0gYVsxNF0gLSBiWzE0XVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdIC0gYlsxNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIkMyhvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRvdXRbNF0gPSBhWzRdICogYlxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIGJcclxuXHRcdG91dFs2XSA9IGFbNl0gKiBiXHJcblx0XHRvdXRbN10gPSBhWzddICogYlxyXG5cdFx0b3V0WzhdID0gYVs4XSAqIGJcclxuXHRcdG91dFs5XSA9IGFbOV0gKiBiXHJcblx0XHRvdXRbMTBdID0gYVsxMF0gKiBiXHJcblx0XHRvdXRbMTFdID0gYVsxMV0gKiBiXHJcblx0XHRvdXRbMTJdID0gYVsxMl0gKiBiXHJcblx0XHRvdXRbMTNdID0gYVsxM10gKiBiXHJcblx0XHRvdXRbMTRdID0gYVsxNF0gKiBiXHJcblx0XHRvdXRbMTVdID0gYVsxNV0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDQncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkJDMob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF0gKiBzY2FsZVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV0gKiBzY2FsZVxyXG5cdFx0b3V0WzZdID0gYVs2XSArIGJbNl0gKiBzY2FsZVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN10gKiBzY2FsZVxyXG5cdFx0b3V0WzhdID0gYVs4XSArIGJbOF0gKiBzY2FsZVxyXG5cdFx0b3V0WzldID0gYVs5XSArIGJbOV0gKiBzY2FsZVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdICsgYlsxMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzExXSA9IGFbMTFdICsgYlsxMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdICsgYlsxMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdICsgYlsxM10gKiBzY2FsZVxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdICsgYlsxNF0gKiBzY2FsZVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdICsgYlsxNV0gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQzKGEsIGIpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdGFbMF0gPT09IGJbMF0gJiZcclxuXHRcdFx0YVsxXSA9PT0gYlsxXSAmJlxyXG5cdFx0XHRhWzJdID09PSBiWzJdICYmXHJcblx0XHRcdGFbM10gPT09IGJbM10gJiZcclxuXHRcdFx0YVs0XSA9PT0gYls0XSAmJlxyXG5cdFx0XHRhWzVdID09PSBiWzVdICYmXHJcblx0XHRcdGFbNl0gPT09IGJbNl0gJiZcclxuXHRcdFx0YVs3XSA9PT0gYls3XSAmJlxyXG5cdFx0XHRhWzhdID09PSBiWzhdICYmXHJcblx0XHRcdGFbOV0gPT09IGJbOV0gJiZcclxuXHRcdFx0YVsxMF0gPT09IGJbMTBdICYmXHJcblx0XHRcdGFbMTFdID09PSBiWzExXSAmJlxyXG5cdFx0XHRhWzEyXSA9PT0gYlsxMl0gJiZcclxuXHRcdFx0YVsxM10gPT09IGJbMTNdICYmXHJcblx0XHRcdGFbMTRdID09PSBiWzE0XSAmJlxyXG5cdFx0XHRhWzE1XSA9PT0gYlsxNV1cclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDQoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdLFxyXG5cdFx0XHRhNiA9IGFbNl0sXHJcblx0XHRcdGE3ID0gYVs3XVxyXG5cdFx0dmFyIGE4ID0gYVs4XSxcclxuXHRcdFx0YTkgPSBhWzldLFxyXG5cdFx0XHRhMTAgPSBhWzEwXSxcclxuXHRcdFx0YTExID0gYVsxMV1cclxuXHRcdHZhciBhMTIgPSBhWzEyXSxcclxuXHRcdFx0YTEzID0gYVsxM10sXHJcblx0XHRcdGExNCA9IGFbMTRdLFxyXG5cdFx0XHRhMTUgPSBhWzE1XVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0dmFyIGI0ID0gYls0XSxcclxuXHRcdFx0YjUgPSBiWzVdLFxyXG5cdFx0XHRiNiA9IGJbNl0sXHJcblx0XHRcdGI3ID0gYls3XVxyXG5cdFx0dmFyIGI4ID0gYls4XSxcclxuXHRcdFx0YjkgPSBiWzldLFxyXG5cdFx0XHRiMTAgPSBiWzEwXSxcclxuXHRcdFx0YjExID0gYlsxMV1cclxuXHRcdHZhciBiMTIgPSBiWzEyXSxcclxuXHRcdFx0YjEzID0gYlsxM10sXHJcblx0XHRcdGIxNCA9IGJbMTRdLFxyXG5cdFx0XHRiMTUgPSBiWzE1XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE0IC0gYjQpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNSAtIGI1KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTYgLSBiNikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXHJcblx0XHRcdE1hdGguYWJzKGE3IC0gYjcpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhOCAtIGI4KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTkgLSBiOSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTkpLCBNYXRoLmFicyhiOSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExMCAtIGIxMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEwKSwgTWF0aC5hYnMoYjEwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTExIC0gYjExKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTEpLCBNYXRoLmFicyhiMTEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMTIgLSBiMTIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMiksIE1hdGguYWJzKGIxMikpICYmXHJcblx0XHRcdE1hdGguYWJzKGExMyAtIGIxMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEzKSwgTWF0aC5hYnMoYjEzKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTE0IC0gYjE0KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTQpLCBNYXRoLmFicyhiMTQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMTUgLSBiMTUpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExNSksIE1hdGguYWJzKGIxNSkpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQzID0gbXVsdGlwbHkkM1xyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQzID0gc3VidHJhY3QkM1xyXG5cclxuXHR2YXIgbWF0NCA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQzLFxyXG5cdFx0Y2xvbmU6IGNsb25lJDMsXHJcblx0XHRjb3B5OiBjb3B5JDMsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDMsXHJcblx0XHRzZXQ6IHNldCQzLFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5JDMsXHJcblx0XHR0cmFuc3Bvc2U6IHRyYW5zcG9zZSQyLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkMyxcclxuXHRcdGFkam9pbnQ6IGFkam9pbnQkMixcclxuXHRcdGRldGVybWluYW50OiBkZXRlcm1pbmFudCQzLFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDMsXHJcblx0XHR0cmFuc2xhdGU6IHRyYW5zbGF0ZSQyLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDMsXHJcblx0XHRyb3RhdGU6IHJvdGF0ZSQzLFxyXG5cdFx0cm90YXRlWDogcm90YXRlWCxcclxuXHRcdHJvdGF0ZVk6IHJvdGF0ZVksXHJcblx0XHRyb3RhdGVaOiByb3RhdGVaLFxyXG5cdFx0ZnJvbVRyYW5zbGF0aW9uOiBmcm9tVHJhbnNsYXRpb24kMixcclxuXHRcdGZyb21TY2FsaW5nOiBmcm9tU2NhbGluZyQzLFxyXG5cdFx0ZnJvbVJvdGF0aW9uOiBmcm9tUm90YXRpb24kMyxcclxuXHRcdGZyb21YUm90YXRpb246IGZyb21YUm90YXRpb24sXHJcblx0XHRmcm9tWVJvdGF0aW9uOiBmcm9tWVJvdGF0aW9uLFxyXG5cdFx0ZnJvbVpSb3RhdGlvbjogZnJvbVpSb3RhdGlvbixcclxuXHRcdGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uOiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcclxuXHRcdGZyb21RdWF0MjogZnJvbVF1YXQyLFxyXG5cdFx0Z2V0VHJhbnNsYXRpb246IGdldFRyYW5zbGF0aW9uLFxyXG5cdFx0Z2V0U2NhbGluZzogZ2V0U2NhbGluZyxcclxuXHRcdGdldFJvdGF0aW9uOiBnZXRSb3RhdGlvbixcclxuXHRcdGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGU6IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUsXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luOiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luLFxyXG5cdFx0ZnJvbVF1YXQ6IGZyb21RdWF0JDEsXHJcblx0XHRmcnVzdHVtOiBmcnVzdHVtLFxyXG5cdFx0cGVyc3BlY3RpdmU6IHBlcnNwZWN0aXZlLFxyXG5cdFx0cGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXc6IHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3LFxyXG5cdFx0b3J0aG86IG9ydGhvLFxyXG5cdFx0bG9va0F0OiBsb29rQXQsXHJcblx0XHR0YXJnZXRUbzogdGFyZ2V0VG8sXHJcblx0XHRzdHI6IHN0ciQzLFxyXG5cdFx0ZnJvYjogZnJvYiQzLFxyXG5cdFx0YWRkOiBhZGQkMyxcclxuXHRcdHN1YnRyYWN0OiBzdWJ0cmFjdCQzLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXI6IG11bHRpcGx5U2NhbGFyJDMsXHJcblx0XHRtdWx0aXBseVNjYWxhckFuZEFkZDogbXVsdGlwbHlTY2FsYXJBbmRBZGQkMyxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQzLFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkNCxcclxuXHRcdG11bDogbXVsJDMsXHJcblx0XHRzdWI6IHN1YiQzLFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIDMgRGltZW5zaW9uYWwgVmVjdG9yXHJcblx0ICogQG1vZHVsZSB2ZWMzXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDQoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzBdID0gMFxyXG5cdFx0XHRvdXRbMV0gPSAwXHJcblx0XHRcdG91dFsyXSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkNChhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVuZ3RoKGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkNCh4LCB5LCB6KSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkNChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0JDQob3V0LCB4LCB5LCB6KSB7XHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkNChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkNChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5JDQob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIERpdmlkZXMgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC8gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAvIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLyBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjZWlsXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGguY2VpbChhWzJdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGZsb29yXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguZmxvb3IoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byByb3VuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm91bmQob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLnJvdW5kKGFbMl0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDQob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzMncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXVxyXG5cdFx0dmFyIHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0dmFyIHogPSBiWzJdIC0gYVsyXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XHJcblx0XHR2YXIgeCA9IGJbMF0gLSBhWzBdXHJcblx0XHR2YXIgeSA9IGJbMV0gLSBhWzFdXHJcblx0XHR2YXIgeiA9IGJbMl0gLSBhWzJdXHJcblx0XHRyZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdXHJcblx0XHR2YXIgeSA9IGFbMV1cclxuXHRcdHZhciB6ID0gYVsyXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogelxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gLWFbMF1cclxuXHRcdG91dFsxXSA9IC1hWzFdXHJcblx0XHRvdXRbMl0gPSAtYVsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGludmVydFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IDEuMCAvIGFbMF1cclxuXHRcdG91dFsxXSA9IDEuMCAvIGFbMV1cclxuXHRcdG91dFsyXSA9IDEuMCAvIGFbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdXHJcblx0XHR2YXIgeSA9IGFbMV1cclxuXHRcdHZhciB6ID0gYVsyXVxyXG5cdFx0dmFyIGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogelxyXG5cclxuXHRcdGlmIChsZW4gPiAwKSB7XHJcblx0XHRcdC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XHJcblx0XHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKVxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IGFbMF0gKiBsZW5cclxuXHRcdG91dFsxXSA9IGFbMV0gKiBsZW5cclxuXHRcdG91dFsyXSA9IGFbMl0gKiBsZW5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZG90KGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdXHJcblx0XHR2YXIgYnggPSBiWzBdLFxyXG5cdFx0XHRieSA9IGJbMV0sXHJcblx0XHRcdGJ6ID0gYlsyXVxyXG5cdFx0b3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnlcclxuXHRcdG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6XHJcblx0XHRvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcclxuXHRcdHZhciBheCA9IGFbMF1cclxuXHRcdHZhciBheSA9IGFbMV1cclxuXHRcdHZhciBheiA9IGFbMl1cclxuXHRcdG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpXHJcblx0XHRvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KVxyXG5cdFx0b3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheilcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBoZXJtaXRlIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gZCB0aGUgZm91cnRoIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBoZXJtaXRlKG91dCwgYSwgYiwgYywgZCwgdCkge1xyXG5cdFx0dmFyIGZhY3RvclRpbWVzMiA9IHQgKiB0XHJcblx0XHR2YXIgZmFjdG9yMSA9IGZhY3RvclRpbWVzMiAqICgyICogdCAtIDMpICsgMVxyXG5cdFx0dmFyIGZhY3RvcjIgPSBmYWN0b3JUaW1lczIgKiAodCAtIDIpICsgdFxyXG5cdFx0dmFyIGZhY3RvcjMgPSBmYWN0b3JUaW1lczIgKiAodCAtIDEpXHJcblx0XHR2YXIgZmFjdG9yNCA9IGZhY3RvclRpbWVzMiAqICgzIC0gMiAqIHQpXHJcblx0XHRvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNFxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjRcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgYmV6aWVyIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gZCB0aGUgZm91cnRoIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBiZXppZXIob3V0LCBhLCBiLCBjLCBkLCB0KSB7XHJcblx0XHR2YXIgaW52ZXJzZUZhY3RvciA9IDEgLSB0XHJcblx0XHR2YXIgaW52ZXJzZUZhY3RvclRpbWVzVHdvID0gaW52ZXJzZUZhY3RvciAqIGludmVyc2VGYWN0b3JcclxuXHRcdHZhciBmYWN0b3JUaW1lczIgPSB0ICogdFxyXG5cdFx0dmFyIGZhY3RvcjEgPSBpbnZlcnNlRmFjdG9yVGltZXNUd28gKiBpbnZlcnNlRmFjdG9yXHJcblx0XHR2YXIgZmFjdG9yMiA9IDMgKiB0ICogaW52ZXJzZUZhY3RvclRpbWVzVHdvXHJcblx0XHR2YXIgZmFjdG9yMyA9IDMgKiBmYWN0b3JUaW1lczIgKiBpbnZlcnNlRmFjdG9yXHJcblx0XHR2YXIgZmFjdG9yNCA9IGZhY3RvclRpbWVzMiAqIHRcclxuXHRcdG91dFswXSA9IGFbMF0gKiBmYWN0b3IxICsgYlswXSAqIGZhY3RvcjIgKyBjWzBdICogZmFjdG9yMyArIGRbMF0gKiBmYWN0b3I0XHJcblx0XHRvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNFxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGZhY3RvcjEgKyBiWzJdICogZmFjdG9yMiArIGNbMl0gKiBmYWN0b3IzICsgZFsyXSAqIGZhY3RvcjRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJhbmRvbShvdXQsIHNjYWxlKSB7XHJcblx0XHRzY2FsZSA9IHNjYWxlIHx8IDEuMFxyXG5cdFx0dmFyIHIgPSBSQU5ET00oKSAqIDIuMCAqIE1hdGguUElcclxuXHRcdHZhciB6ID0gUkFORE9NKCkgKiAyLjAgLSAxLjBcclxuXHRcdHZhciB6U2NhbGUgPSBNYXRoLnNxcnQoMS4wIC0geiAqIHopICogc2NhbGVcclxuXHRcdG91dFswXSA9IE1hdGguY29zKHIpICogelNjYWxlXHJcblx0XHRvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHpTY2FsZVxyXG5cdFx0b3V0WzJdID0geiAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXHJcblx0ICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV0sXHJcblx0XHRcdHogPSBhWzJdXHJcblx0XHR2YXIgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XVxyXG5cdFx0dyA9IHcgfHwgMS4wXHJcblx0XHRvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gd1xyXG5cdFx0b3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHdcclxuXHRcdG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gd1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge21hdDN9IG0gdGhlIDN4MyBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXVxyXG5cdFx0b3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdXHJcblx0XHRvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN11cclxuXHRcdG91dFsyXSA9IHggKiBtWzJdICsgeSAqIG1bNV0gKyB6ICogbVs4XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XHJcblx0ICogQ2FuIGFsc28gYmUgdXNlZCBmb3IgZHVhbCBxdWF0ZXJuaW9ucy4gKE11bHRpcGx5IGl0IHdpdGggdGhlIHJlYWwgcGFydClcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQob3V0LCBhLCBxKSB7XHJcblx0XHQvLyBiZW5jaG1hcmtzOiBodHRwczovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnMtZml4ZWRcclxuXHRcdHZhciBxeCA9IHFbMF0sXHJcblx0XHRcdHF5ID0gcVsxXSxcclxuXHRcdFx0cXogPSBxWzJdLFxyXG5cdFx0XHRxdyA9IHFbM11cclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV0sXHJcblx0XHRcdHogPSBhWzJdIC8vIHZhciBxdmVjID0gW3F4LCBxeSwgcXpdO1xyXG5cdFx0Ly8gdmFyIHV2ID0gdmVjMy5jcm9zcyhbXSwgcXZlYywgYSk7XHJcblxyXG5cdFx0dmFyIHV2eCA9IHF5ICogeiAtIHF6ICogeSxcclxuXHRcdFx0dXZ5ID0gcXogKiB4IC0gcXggKiB6LFxyXG5cdFx0XHR1dnogPSBxeCAqIHkgLSBxeSAqIHggLy8gdmFyIHV1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIHV2KTtcclxuXHJcblx0XHR2YXIgdXV2eCA9IHF5ICogdXZ6IC0gcXogKiB1dnksXHJcblx0XHRcdHV1dnkgPSBxeiAqIHV2eCAtIHF4ICogdXZ6LFxyXG5cdFx0XHR1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eCAvLyB2ZWMzLnNjYWxlKHV2LCB1diwgMiAqIHcpO1xyXG5cclxuXHRcdHZhciB3MiA9IHF3ICogMlxyXG5cdFx0dXZ4ICo9IHcyXHJcblx0XHR1dnkgKj0gdzJcclxuXHRcdHV2eiAqPSB3MiAvLyB2ZWMzLnNjYWxlKHV1diwgdXV2LCAyKTtcclxuXHJcblx0XHR1dXZ4ICo9IDJcclxuXHRcdHV1dnkgKj0gMlxyXG5cdFx0dXV2eiAqPSAyIC8vIHJldHVybiB2ZWMzLmFkZChvdXQsIGEsIHZlYzMuYWRkKG91dCwgdXYsIHV1dikpO1xyXG5cclxuXHRcdG91dFswXSA9IHggKyB1dnggKyB1dXZ4XHJcblx0XHRvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eVxyXG5cdFx0b3V0WzJdID0geiArIHV2eiArIHV1dnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeC1heGlzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWCQxKG91dCwgYSwgYiwgYykge1xyXG5cdFx0dmFyIHAgPSBbXSxcclxuXHRcdFx0ciA9IFtdIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cclxuXHJcblx0XHRwWzBdID0gYVswXSAtIGJbMF1cclxuXHRcdHBbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0cFsyXSA9IGFbMl0gLSBiWzJdIC8vcGVyZm9ybSByb3RhdGlvblxyXG5cclxuXHRcdHJbMF0gPSBwWzBdXHJcblx0XHRyWzFdID0gcFsxXSAqIE1hdGguY29zKGMpIC0gcFsyXSAqIE1hdGguc2luKGMpXHJcblx0XHRyWzJdID0gcFsxXSAqIE1hdGguc2luKGMpICsgcFsyXSAqIE1hdGguY29zKGMpIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSByWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gclsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IHJbMl0gKyBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHktYXhpc1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVkkMShvdXQsIGEsIGIsIGMpIHtcclxuXHRcdHZhciBwID0gW10sXHJcblx0XHRcdHIgPSBbXSAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcblxyXG5cdFx0cFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRwWzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdHBbMl0gPSBhWzJdIC0gYlsyXSAvL3BlcmZvcm0gcm90YXRpb25cclxuXHJcblx0XHRyWzBdID0gcFsyXSAqIE1hdGguc2luKGMpICsgcFswXSAqIE1hdGguY29zKGMpXHJcblx0XHRyWzFdID0gcFsxXVxyXG5cdFx0clsyXSA9IHBbMl0gKiBNYXRoLmNvcyhjKSAtIHBbMF0gKiBNYXRoLnNpbihjKSAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gclswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IHJbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSByWzJdICsgYlsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB6LWF4aXNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVaJDEob3V0LCBhLCBiLCBjKSB7XHJcblx0XHR2YXIgcCA9IFtdLFxyXG5cdFx0XHRyID0gW10gLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG5cclxuXHRcdHBbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0cFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRwWzJdID0gYVsyXSAtIGJbMl0gLy9wZXJmb3JtIHJvdGF0aW9uXHJcblxyXG5cdFx0clswXSA9IHBbMF0gKiBNYXRoLmNvcyhjKSAtIHBbMV0gKiBNYXRoLnNpbihjKVxyXG5cdFx0clsxXSA9IHBbMF0gKiBNYXRoLnNpbihjKSArIHBbMV0gKiBNYXRoLmNvcyhjKVxyXG5cdFx0clsyXSA9IHBbMl0gLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxyXG5cclxuXHRcdG91dFswXSA9IHJbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSByWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gclsyXSArIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAzRCB2ZWN0b3JzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFuZ2xlKGEsIGIpIHtcclxuXHRcdHZhciB0ZW1wQSA9IGZyb21WYWx1ZXMkNChhWzBdLCBhWzFdLCBhWzJdKVxyXG5cdFx0dmFyIHRlbXBCID0gZnJvbVZhbHVlcyQ0KGJbMF0sIGJbMV0sIGJbMl0pXHJcblx0XHRub3JtYWxpemUodGVtcEEsIHRlbXBBKVxyXG5cdFx0bm9ybWFsaXplKHRlbXBCLCB0ZW1wQilcclxuXHRcdHZhciBjb3NpbmUgPSBkb3QodGVtcEEsIHRlbXBCKVxyXG5cclxuXHRcdGlmIChjb3NpbmUgPiAxLjApIHtcclxuXHRcdFx0cmV0dXJuIDBcclxuXHRcdH0gZWxzZSBpZiAoY29zaW5lIDwgLTEuMCkge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5QSVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpXHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDQoYSkge1xyXG5cdFx0cmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkNChhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQ1KGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViJDQgPSBzdWJ0cmFjdCQ0XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDQgPSBtdWx0aXBseSQ0XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpdmlkZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpdiA9IGRpdmlkZVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXN0YW5jZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpc3QgPSBkaXN0YW5jZVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkRGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJEaXN0ID0gc3F1YXJlZERpc3RhbmNlXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmxlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbiA9IGxlbmd0aFxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyTGVuID0gc3F1YXJlZExlbmd0aFxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMzcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMzLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcblx0ICogQHJldHVybnMge0FycmF5fSBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBmb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHZlYyA9IGNyZWF0ZSQ0KClcclxuXHRcdHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcclxuXHRcdFx0dmFyIGksIGxcclxuXHJcblx0XHRcdGlmICghc3RyaWRlKSB7XHJcblx0XHRcdFx0c3RyaWRlID0gM1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIW9mZnNldCkge1xyXG5cdFx0XHRcdG9mZnNldCA9IDBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGNvdW50KSB7XHJcblx0XHRcdFx0bCA9IE1hdGgubWluKGNvdW50ICogc3RyaWRlICsgb2Zmc2V0LCBhLmxlbmd0aClcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsID0gYS5sZW5ndGhcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yIChpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcclxuXHRcdFx0XHR2ZWNbMF0gPSBhW2ldXHJcblx0XHRcdFx0dmVjWzFdID0gYVtpICsgMV1cclxuXHRcdFx0XHR2ZWNbMl0gPSBhW2kgKyAyXVxyXG5cdFx0XHRcdGZuKHZlYywgdmVjLCBhcmcpXHJcblx0XHRcdFx0YVtpXSA9IHZlY1swXVxyXG5cdFx0XHRcdGFbaSArIDFdID0gdmVjWzFdXHJcblx0XHRcdFx0YVtpICsgMl0gPSB2ZWNbMl1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGFcclxuXHRcdH1cclxuXHR9KSgpXHJcblxyXG5cdHZhciB2ZWMzID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDQsXHJcblx0XHRjbG9uZTogY2xvbmUkNCxcclxuXHRcdGxlbmd0aDogbGVuZ3RoLFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQ0LFxyXG5cdFx0Y29weTogY29weSQ0LFxyXG5cdFx0c2V0OiBzZXQkNCxcclxuXHRcdGFkZDogYWRkJDQsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkNCxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQ0LFxyXG5cdFx0ZGl2aWRlOiBkaXZpZGUsXHJcblx0XHRjZWlsOiBjZWlsLFxyXG5cdFx0Zmxvb3I6IGZsb29yLFxyXG5cdFx0bWluOiBtaW4sXHJcblx0XHRtYXg6IG1heCxcclxuXHRcdHJvdW5kOiByb3VuZCxcclxuXHRcdHNjYWxlOiBzY2FsZSQ0LFxyXG5cdFx0c2NhbGVBbmRBZGQ6IHNjYWxlQW5kQWRkLFxyXG5cdFx0ZGlzdGFuY2U6IGRpc3RhbmNlLFxyXG5cdFx0c3F1YXJlZERpc3RhbmNlOiBzcXVhcmVkRGlzdGFuY2UsXHJcblx0XHRzcXVhcmVkTGVuZ3RoOiBzcXVhcmVkTGVuZ3RoLFxyXG5cdFx0bmVnYXRlOiBuZWdhdGUsXHJcblx0XHRpbnZlcnNlOiBpbnZlcnNlLFxyXG5cdFx0bm9ybWFsaXplOiBub3JtYWxpemUsXHJcblx0XHRkb3Q6IGRvdCxcclxuXHRcdGNyb3NzOiBjcm9zcyxcclxuXHRcdGxlcnA6IGxlcnAsXHJcblx0XHRoZXJtaXRlOiBoZXJtaXRlLFxyXG5cdFx0YmV6aWVyOiBiZXppZXIsXHJcblx0XHRyYW5kb206IHJhbmRvbSxcclxuXHRcdHRyYW5zZm9ybU1hdDQ6IHRyYW5zZm9ybU1hdDQsXHJcblx0XHR0cmFuc2Zvcm1NYXQzOiB0cmFuc2Zvcm1NYXQzLFxyXG5cdFx0dHJhbnNmb3JtUXVhdDogdHJhbnNmb3JtUXVhdCxcclxuXHRcdHJvdGF0ZVg6IHJvdGF0ZVgkMSxcclxuXHRcdHJvdGF0ZVk6IHJvdGF0ZVkkMSxcclxuXHRcdHJvdGF0ZVo6IHJvdGF0ZVokMSxcclxuXHRcdGFuZ2xlOiBhbmdsZSxcclxuXHRcdHN0cjogc3RyJDQsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkNCxcclxuXHRcdGVxdWFsczogZXF1YWxzJDUsXHJcblx0XHRzdWI6IHN1YiQ0LFxyXG5cdFx0bXVsOiBtdWwkNCxcclxuXHRcdGRpdjogZGl2LFxyXG5cdFx0ZGlzdDogZGlzdCxcclxuXHRcdHNxckRpc3Q6IHNxckRpc3QsXHJcblx0XHRsZW46IGxlbixcclxuXHRcdHNxckxlbjogc3FyTGVuLFxyXG5cdFx0Zm9yRWFjaDogZm9yRWFjaCxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiA0IERpbWVuc2lvbmFsIFZlY3RvclxyXG5cdCAqIEBtb2R1bGUgdmVjNFxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQ1KCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFswXSA9IDBcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdG91dFszXSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkNShhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkNSh4LCB5LCB6LCB3KSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdG91dFszXSA9IHdcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkNShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkNShvdXQsIHgsIHksIHosIHcpIHtcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdG91dFszXSA9IHdcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQ1KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkNShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLSBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQ1KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogRGl2aWRlcyB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpdmlkZSQxKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAvIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC8gYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAvIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNlaWxcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNlaWwkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguY2VpbChhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSlcclxuXHRcdG91dFszXSA9IE1hdGguY2VpbChhWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGZsb29yXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmbG9vciQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKVxyXG5cdFx0b3V0WzNdID0gTWF0aC5mbG9vcihhWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWluJDEob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pXHJcblx0XHRvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWF4JDEob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pXHJcblx0XHRvdXRbM10gPSBNYXRoLm1heChhWzNdLCBiWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJvdW5kXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3VuZCQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKVxyXG5cdFx0b3V0WzNdID0gTWF0aC5yb3VuZChhWzNdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTY2FsZXMgYSB2ZWM0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQ1KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjNCdzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlQW5kQWRkJDEob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpc3RhbmNlJDEoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXVxyXG5cdFx0dmFyIHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0dmFyIHogPSBiWzJdIC0gYVsyXVxyXG5cdFx0dmFyIHcgPSBiWzNdIC0gYVszXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdylcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlJDEoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXVxyXG5cdFx0dmFyIHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0dmFyIHogPSBiWzJdIC0gYVsyXVxyXG5cdFx0dmFyIHcgPSBiWzNdIC0gYVszXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlbmd0aCQxKGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHZhciB3ID0gYVszXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdylcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3F1YXJlZExlbmd0aCQxKGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHZhciB3ID0gYVszXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbmVnYXRlXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBuZWdhdGUkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IC1hWzBdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0b3V0WzJdID0gLWFbMl1cclxuXHRcdG91dFszXSA9IC1hWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gaW52ZXJ0XHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnNlJDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAxLjAgLyBhWzBdXHJcblx0XHRvdXRbMV0gPSAxLjAgLyBhWzFdXHJcblx0XHRvdXRbMl0gPSAxLjAgLyBhWzJdXHJcblx0XHRvdXRbM10gPSAxLjAgLyBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZSQxKG91dCwgYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdXHJcblx0XHR2YXIgeSA9IGFbMV1cclxuXHRcdHZhciB6ID0gYVsyXVxyXG5cdFx0dmFyIHcgPSBhWzNdXHJcblx0XHR2YXIgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHdcclxuXHJcblx0XHRpZiAobGVuID4gMCkge1xyXG5cdFx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSB4ICogbGVuXHJcblx0XHRvdXRbMV0gPSB5ICogbGVuXHJcblx0XHRvdXRbMl0gPSB6ICogbGVuXHJcblx0XHRvdXRbM10gPSB3ICogbGVuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRvdCQxKGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVycCQxKG91dCwgYSwgYiwgdCkge1xyXG5cdFx0dmFyIGF4ID0gYVswXVxyXG5cdFx0dmFyIGF5ID0gYVsxXVxyXG5cdFx0dmFyIGF6ID0gYVsyXVxyXG5cdFx0dmFyIGF3ID0gYVszXVxyXG5cdFx0b3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheClcclxuXHRcdG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpXHJcblx0XHRvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KVxyXG5cdFx0b3V0WzNdID0gYXcgKyB0ICogKGJbM10gLSBhdylcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJhbmRvbSQxKG91dCwgc2NhbGUpIHtcclxuXHRcdHNjYWxlID0gc2NhbGUgfHwgMS4wIC8vIE1hcnNhZ2xpYSwgR2VvcmdlLiBDaG9vc2luZyBhIFBvaW50IGZyb20gdGhlIFN1cmZhY2Ugb2YgYVxyXG5cdFx0Ly8gU3BoZXJlLiBBbm4uIE1hdGguIFN0YXRpc3QuIDQzICgxOTcyKSwgbm8uIDIsIDY0NS0tNjQ2LlxyXG5cdFx0Ly8gaHR0cDovL3Byb2plY3RldWNsaWQub3JnL2V1Y2xpZC5hb21zLzExNzc2OTI2NDQ7XHJcblxyXG5cdFx0dmFyIHYxLCB2MiwgdjMsIHY0XHJcblx0XHR2YXIgczEsIHMyXHJcblxyXG5cdFx0ZG8ge1xyXG5cdFx0XHR2MSA9IFJBTkRPTSgpICogMiAtIDFcclxuXHRcdFx0djIgPSBSQU5ET00oKSAqIDIgLSAxXHJcblx0XHRcdHMxID0gdjEgKiB2MSArIHYyICogdjJcclxuXHRcdH0gd2hpbGUgKHMxID49IDEpXHJcblxyXG5cdFx0ZG8ge1xyXG5cdFx0XHR2MyA9IFJBTkRPTSgpICogMiAtIDFcclxuXHRcdFx0djQgPSBSQU5ET00oKSAqIDIgLSAxXHJcblx0XHRcdHMyID0gdjMgKiB2MyArIHY0ICogdjRcclxuXHRcdH0gd2hpbGUgKHMyID49IDEpXHJcblxyXG5cdFx0dmFyIGQgPSBNYXRoLnNxcnQoKDEgLSBzMSkgLyBzMilcclxuXHRcdG91dFswXSA9IHNjYWxlICogdjFcclxuXHRcdG91dFsxXSA9IHNjYWxlICogdjJcclxuXHRcdG91dFsyXSA9IHNjYWxlICogdjMgKiBkXHJcblx0XHRvdXRbM10gPSBzY2FsZSAqIHY0ICogZFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBtYXQ0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0JDEob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXSxcclxuXHRcdFx0dyA9IGFbM11cclxuXHRcdG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdICogd1xyXG5cdFx0b3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10gKiB3XHJcblx0XHRvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3XHJcblx0XHRvdXRbM10gPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQkMShvdXQsIGEsIHEpIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV0sXHJcblx0XHRcdHogPSBhWzJdXHJcblx0XHR2YXIgcXggPSBxWzBdLFxyXG5cdFx0XHRxeSA9IHFbMV0sXHJcblx0XHRcdHF6ID0gcVsyXSxcclxuXHRcdFx0cXcgPSBxWzNdIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXHJcblxyXG5cdFx0dmFyIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5XHJcblx0XHR2YXIgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHpcclxuXHRcdHZhciBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeFxyXG5cdFx0dmFyIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogeiAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XHJcblxyXG5cdFx0b3V0WzBdID0gaXggKiBxdyArIGl3ICogLXF4ICsgaXkgKiAtcXogLSBpeiAqIC1xeVxyXG5cdFx0b3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xelxyXG5cdFx0b3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeFxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ1KGEpIHtcclxuXHRcdHJldHVybiAndmVjNCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkNShhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDYoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQ1ID0gc3VidHJhY3QkNVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQ1ID0gbXVsdGlwbHkkNVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXZpZGV9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkaXYkMSA9IGRpdmlkZSQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZGlzdCQxID0gZGlzdGFuY2UkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkRGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJEaXN0JDEgPSBzcXVhcmVkRGlzdGFuY2UkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5sZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW4kMSA9IGxlbmd0aCQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4kMSA9IHNxdWFyZWRMZW5ndGgkMVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWM0cyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcblx0ICogQHJldHVybnMge0FycmF5fSBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBmb3JFYWNoJDEgPSAoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdmVjID0gY3JlYXRlJDUoKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xyXG5cdFx0XHR2YXIgaSwgbFxyXG5cclxuXHRcdFx0aWYgKCFzdHJpZGUpIHtcclxuXHRcdFx0XHRzdHJpZGUgPSA0XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghb2Zmc2V0KSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gMFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoY291bnQpIHtcclxuXHRcdFx0XHRsID0gTWF0aC5taW4oY291bnQgKiBzdHJpZGUgKyBvZmZzZXQsIGEubGVuZ3RoKVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGwgPSBhLmxlbmd0aFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xyXG5cdFx0XHRcdHZlY1swXSA9IGFbaV1cclxuXHRcdFx0XHR2ZWNbMV0gPSBhW2kgKyAxXVxyXG5cdFx0XHRcdHZlY1syXSA9IGFbaSArIDJdXHJcblx0XHRcdFx0dmVjWzNdID0gYVtpICsgM11cclxuXHRcdFx0XHRmbih2ZWMsIHZlYywgYXJnKVxyXG5cdFx0XHRcdGFbaV0gPSB2ZWNbMF1cclxuXHRcdFx0XHRhW2kgKyAxXSA9IHZlY1sxXVxyXG5cdFx0XHRcdGFbaSArIDJdID0gdmVjWzJdXHJcblx0XHRcdFx0YVtpICsgM10gPSB2ZWNbM11cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGFcclxuXHRcdH1cclxuXHR9KSgpXHJcblxyXG5cdHZhciB2ZWM0ID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDUsXHJcblx0XHRjbG9uZTogY2xvbmUkNSxcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkNSxcclxuXHRcdGNvcHk6IGNvcHkkNSxcclxuXHRcdHNldDogc2V0JDUsXHJcblx0XHRhZGQ6IGFkZCQ1LFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0JDUsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkNSxcclxuXHRcdGRpdmlkZTogZGl2aWRlJDEsXHJcblx0XHRjZWlsOiBjZWlsJDEsXHJcblx0XHRmbG9vcjogZmxvb3IkMSxcclxuXHRcdG1pbjogbWluJDEsXHJcblx0XHRtYXg6IG1heCQxLFxyXG5cdFx0cm91bmQ6IHJvdW5kJDEsXHJcblx0XHRzY2FsZTogc2NhbGUkNSxcclxuXHRcdHNjYWxlQW5kQWRkOiBzY2FsZUFuZEFkZCQxLFxyXG5cdFx0ZGlzdGFuY2U6IGRpc3RhbmNlJDEsXHJcblx0XHRzcXVhcmVkRGlzdGFuY2U6IHNxdWFyZWREaXN0YW5jZSQxLFxyXG5cdFx0bGVuZ3RoOiBsZW5ndGgkMSxcclxuXHRcdHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGgkMSxcclxuXHRcdG5lZ2F0ZTogbmVnYXRlJDEsXHJcblx0XHRpbnZlcnNlOiBpbnZlcnNlJDEsXHJcblx0XHRub3JtYWxpemU6IG5vcm1hbGl6ZSQxLFxyXG5cdFx0ZG90OiBkb3QkMSxcclxuXHRcdGxlcnA6IGxlcnAkMSxcclxuXHRcdHJhbmRvbTogcmFuZG9tJDEsXHJcblx0XHR0cmFuc2Zvcm1NYXQ0OiB0cmFuc2Zvcm1NYXQ0JDEsXHJcblx0XHR0cmFuc2Zvcm1RdWF0OiB0cmFuc2Zvcm1RdWF0JDEsXHJcblx0XHRzdHI6IHN0ciQ1LFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDUsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQ2LFxyXG5cdFx0c3ViOiBzdWIkNSxcclxuXHRcdG11bDogbXVsJDUsXHJcblx0XHRkaXY6IGRpdiQxLFxyXG5cdFx0ZGlzdDogZGlzdCQxLFxyXG5cdFx0c3FyRGlzdDogc3FyRGlzdCQxLFxyXG5cdFx0bGVuOiBsZW4kMSxcclxuXHRcdHNxckxlbjogc3FyTGVuJDEsXHJcblx0XHRmb3JFYWNoOiBmb3JFYWNoJDEsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogUXVhdGVybmlvblxyXG5cdCAqIEBtb2R1bGUgcXVhdFxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IHF1YXRcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQ2KCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFswXSA9IDBcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBxdWF0IHRvIHRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGlkZW50aXR5JDQob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAwXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldHMgYSBxdWF0IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFuZCByb3RhdGlvbiBheGlzLFxyXG5cdCAqIHRoZW4gcmV0dXJucyBpdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyBhcm91bmQgd2hpY2ggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIHNldEF4aXNBbmdsZShvdXQsIGF4aXMsIHJhZCkge1xyXG5cdFx0cmFkID0gcmFkICogMC41XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdG91dFswXSA9IHMgKiBheGlzWzBdXHJcblx0XHRvdXRbMV0gPSBzICogYXhpc1sxXVxyXG5cdFx0b3V0WzJdID0gcyAqIGF4aXNbMl1cclxuXHRcdG91dFszXSA9IE1hdGguY29zKHJhZClcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcm90YXRpb24gYXhpcyBhbmQgYW5nbGUgZm9yIGEgZ2l2ZW5cclxuXHQgKiAgcXVhdGVybmlvbi4gSWYgYSBxdWF0ZXJuaW9uIGlzIGNyZWF0ZWQgd2l0aFxyXG5cdCAqICBzZXRBeGlzQW5nbGUsIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIHRoZSBzYW1lXHJcblx0ICogIHZhbHVlcyBhcyBwcm92aWRpZWQgaW4gdGhlIG9yaWdpbmFsIHBhcmFtZXRlciBsaXN0XHJcblx0ICogIE9SIGZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHZhbHVlcy5cclxuXHQgKiBFeGFtcGxlOiBUaGUgcXVhdGVybmlvbiBmb3JtZWQgYnkgYXhpcyBbMCwgMCwgMV0gYW5kXHJcblx0ICogIGFuZ2xlIC05MCBpcyB0aGUgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBmb3JtZWQgYnlcclxuXHQgKiAgWzAsIDAsIDFdIGFuZCAyNzAuIFRoaXMgbWV0aG9kIGZhdm9ycyB0aGUgbGF0dGVyLlxyXG5cdCAqIEBwYXJhbSAge3ZlYzN9IG91dF9heGlzICBWZWN0b3IgcmVjZWl2aW5nIHRoZSBheGlzIG9mIHJvdGF0aW9uXHJcblx0ICogQHBhcmFtICB7cXVhdH0gcSAgICAgUXVhdGVybmlvbiB0byBiZSBkZWNvbXBvc2VkXHJcblx0ICogQHJldHVybiB7TnVtYmVyfSAgICAgQW5nbGUsIGluIHJhZGlhbnMsIG9mIHRoZSByb3RhdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBnZXRBeGlzQW5nbGUob3V0X2F4aXMsIHEpIHtcclxuXHRcdHZhciByYWQgPSBNYXRoLmFjb3MocVszXSkgKiAyLjBcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkIC8gMi4wKVxyXG5cclxuXHRcdGlmIChzID4gRVBTSUxPTikge1xyXG5cdFx0XHRvdXRfYXhpc1swXSA9IHFbMF0gLyBzXHJcblx0XHRcdG91dF9heGlzWzFdID0gcVsxXSAvIHNcclxuXHRcdFx0b3V0X2F4aXNbMl0gPSBxWzJdIC8gc1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gSWYgcyBpcyB6ZXJvLCByZXR1cm4gYW55IGF4aXMgKG5vIHJvdGF0aW9uIC0gYXhpcyBkb2VzIG5vdCBtYXR0ZXIpXHJcblx0XHRcdG91dF9heGlzWzBdID0gMVxyXG5cdFx0XHRvdXRfYXhpc1sxXSA9IDBcclxuXHRcdFx0b3V0X2F4aXNbMl0gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJhZFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBxdWF0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5JDYob3V0LCBhLCBiKSB7XHJcblx0XHR2YXIgYXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXSxcclxuXHRcdFx0YXcgPSBhWzNdXHJcblx0XHR2YXIgYnggPSBiWzBdLFxyXG5cdFx0XHRieSA9IGJbMV0sXHJcblx0XHRcdGJ6ID0gYlsyXSxcclxuXHRcdFx0YncgPSBiWzNdXHJcblx0XHRvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5XHJcblx0XHRvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6XHJcblx0XHRvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4XHJcblx0XHRvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWCBheGlzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVYJDIob3V0LCBhLCByYWQpIHtcclxuXHRcdHJhZCAqPSAwLjVcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdLFxyXG5cdFx0XHRhdyA9IGFbM11cclxuXHRcdHZhciBieCA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGJ3ID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gYXggKiBidyArIGF3ICogYnhcclxuXHRcdG91dFsxXSA9IGF5ICogYncgKyBheiAqIGJ4XHJcblx0XHRvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieFxyXG5cdFx0b3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnhcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBZIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVkkMihvdXQsIGEsIHJhZCkge1xyXG5cdFx0cmFkICo9IDAuNVxyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0dmFyIGJ5ID0gTWF0aC5zaW4ocmFkKSxcclxuXHRcdFx0YncgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBheCAqIGJ3IC0gYXogKiBieVxyXG5cdFx0b3V0WzFdID0gYXkgKiBidyArIGF3ICogYnlcclxuXHRcdG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5XHJcblx0XHRvdXRbM10gPSBhdyAqIGJ3IC0gYXkgKiBieVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFogYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWiQyKG91dCwgYSwgcmFkKSB7XHJcblx0XHRyYWQgKj0gMC41XHJcblx0XHR2YXIgYXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXSxcclxuXHRcdFx0YXcgPSBhWzNdXHJcblx0XHR2YXIgYnogPSBNYXRoLnNpbihyYWQpLFxyXG5cdFx0XHRidyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6XHJcblx0XHRvdXRbMV0gPSBheSAqIGJ3IC0gYXggKiBielxyXG5cdFx0b3V0WzJdID0gYXogKiBidyArIGF3ICogYnpcclxuXHRcdG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxyXG5cdCAqIEFzc3VtZXMgdGhhdCBxdWF0ZXJuaW9uIGlzIDEgdW5pdCBpbiBsZW5ndGguXHJcblx0ICogQW55IGV4aXN0aW5nIFcgY29tcG9uZW50IHdpbGwgYmUgaWdub3JlZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBXIGNvbXBvbmVudCBvZlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2FsY3VsYXRlVyhvdXQsIGEpIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV0sXHJcblx0XHRcdHogPSBhWzJdXHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRvdXRbM10gPSBNYXRoLnNxcnQoTWF0aC5hYnMoMS4wIC0geCAqIHggLSB5ICogeSAtIHogKiB6KSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNsZXJwKG91dCwgYSwgYiwgdCkge1xyXG5cdFx0Ly8gYmVuY2htYXJrczpcclxuXHRcdC8vICAgIGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tc2xlcnAtaW1wbGVtZW50YXRpb25zXHJcblx0XHR2YXIgYXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXSxcclxuXHRcdFx0YXcgPSBhWzNdXHJcblx0XHR2YXIgYnggPSBiWzBdLFxyXG5cdFx0XHRieSA9IGJbMV0sXHJcblx0XHRcdGJ6ID0gYlsyXSxcclxuXHRcdFx0YncgPSBiWzNdXHJcblx0XHR2YXIgb21lZ2EsIGNvc29tLCBzaW5vbSwgc2NhbGUwLCBzY2FsZTEgLy8gY2FsYyBjb3NpbmVcclxuXHJcblx0XHRjb3NvbSA9IGF4ICogYnggKyBheSAqIGJ5ICsgYXogKiBieiArIGF3ICogYncgLy8gYWRqdXN0IHNpZ25zIChpZiBuZWNlc3NhcnkpXHJcblxyXG5cdFx0aWYgKGNvc29tIDwgMC4wKSB7XHJcblx0XHRcdGNvc29tID0gLWNvc29tXHJcblx0XHRcdGJ4ID0gLWJ4XHJcblx0XHRcdGJ5ID0gLWJ5XHJcblx0XHRcdGJ6ID0gLWJ6XHJcblx0XHRcdGJ3ID0gLWJ3XHJcblx0XHR9IC8vIGNhbGN1bGF0ZSBjb2VmZmljaWVudHNcclxuXHJcblx0XHRpZiAoMS4wIC0gY29zb20gPiBFUFNJTE9OKSB7XHJcblx0XHRcdC8vIHN0YW5kYXJkIGNhc2UgKHNsZXJwKVxyXG5cdFx0XHRvbWVnYSA9IE1hdGguYWNvcyhjb3NvbSlcclxuXHRcdFx0c2lub20gPSBNYXRoLnNpbihvbWVnYSlcclxuXHRcdFx0c2NhbGUwID0gTWF0aC5zaW4oKDEuMCAtIHQpICogb21lZ2EpIC8gc2lub21cclxuXHRcdFx0c2NhbGUxID0gTWF0aC5zaW4odCAqIG9tZWdhKSAvIHNpbm9tXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBcImZyb21cIiBhbmQgXCJ0b1wiIHF1YXRlcm5pb25zIGFyZSB2ZXJ5IGNsb3NlXHJcblx0XHRcdC8vICAuLi4gc28gd2UgY2FuIGRvIGEgbGluZWFyIGludGVycG9sYXRpb25cclxuXHRcdFx0c2NhbGUwID0gMS4wIC0gdFxyXG5cdFx0XHRzY2FsZTEgPSB0XHJcblx0XHR9IC8vIGNhbGN1bGF0ZSBmaW5hbCB2YWx1ZXNcclxuXHJcblx0XHRvdXRbMF0gPSBzY2FsZTAgKiBheCArIHNjYWxlMSAqIGJ4XHJcblx0XHRvdXRbMV0gPSBzY2FsZTAgKiBheSArIHNjYWxlMSAqIGJ5XHJcblx0XHRvdXRbMl0gPSBzY2FsZTAgKiBheiArIHNjYWxlMSAqIGJ6XHJcblx0XHRvdXRbM10gPSBzY2FsZTAgKiBhdyArIHNjYWxlMSAqIGJ3XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHJhbmRvbSBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJhbmRvbSQyKG91dCkge1xyXG5cdFx0Ly8gSW1wbGVtZW50YXRpb24gb2YgaHR0cDovL3BsYW5uaW5nLmNzLnVpdWMuZWR1L25vZGUxOTguaHRtbFxyXG5cdFx0Ly8gVE9ETzogQ2FsbGluZyByYW5kb20gMyB0aW1lcyBpcyBwcm9iYWJseSBub3QgdGhlIGZhc3Rlc3Qgc29sdXRpb25cclxuXHRcdHZhciB1MSA9IFJBTkRPTSgpXHJcblx0XHR2YXIgdTIgPSBSQU5ET00oKVxyXG5cdFx0dmFyIHUzID0gUkFORE9NKClcclxuXHRcdHZhciBzcXJ0MU1pbnVzVTEgPSBNYXRoLnNxcnQoMSAtIHUxKVxyXG5cdFx0dmFyIHNxcnRVMSA9IE1hdGguc3FydCh1MSlcclxuXHRcdG91dFswXSA9IHNxcnQxTWludXNVMSAqIE1hdGguc2luKDIuMCAqIE1hdGguUEkgKiB1MilcclxuXHRcdG91dFsxXSA9IHNxcnQxTWludXNVMSAqIE1hdGguY29zKDIuMCAqIE1hdGguUEkgKiB1MilcclxuXHRcdG91dFsyXSA9IHNxcnRVMSAqIE1hdGguc2luKDIuMCAqIE1hdGguUEkgKiB1MylcclxuXHRcdG91dFszXSA9IHNxcnRVMSAqIE1hdGguY29zKDIuMCAqIE1hdGguUEkgKiB1MylcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQkNChvdXQsIGEpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM11cclxuXHRcdHZhciBkb3QkJDEgPSBhMCAqIGEwICsgYTEgKiBhMSArIGEyICogYTIgKyBhMyAqIGEzXHJcblx0XHR2YXIgaW52RG90ID0gZG90JCQxID8gMS4wIC8gZG90JCQxIDogMCAvLyBUT0RPOiBXb3VsZCBiZSBmYXN0ZXIgdG8gcmV0dXJuIFswLDAsMCwwXSBpbW1lZGlhdGVseSBpZiBkb3QgPT0gMFxyXG5cclxuXHRcdG91dFswXSA9IC1hMCAqIGludkRvdFxyXG5cdFx0b3V0WzFdID0gLWExICogaW52RG90XHJcblx0XHRvdXRbMl0gPSAtYTIgKiBpbnZEb3RcclxuXHRcdG91dFszXSA9IGEzICogaW52RG90XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcclxuXHQgKiBJZiB0aGUgcXVhdGVybmlvbiBpcyBub3JtYWxpemVkLCB0aGlzIGZ1bmN0aW9uIGlzIGZhc3RlciB0aGFuIHF1YXQuaW52ZXJzZSBhbmQgcHJvZHVjZXMgdGhlIHNhbWUgcmVzdWx0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGNvbmp1Z2F0ZSBvZlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29uanVnYXRlKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gLWFbMF1cclxuXHRcdG91dFsxXSA9IC1hWzFdXHJcblx0XHRvdXRbMl0gPSAtYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiAzeDMgcm90YXRpb24gbWF0cml4LlxyXG5cdCAqXHJcblx0ICogTk9URTogVGhlIHJlc3VsdGFudCBxdWF0ZXJuaW9uIGlzIG5vdCBub3JtYWxpemVkLCBzbyB5b3Ugc2hvdWxkIGJlIHN1cmVcclxuXHQgKiB0byByZW5vcm1hbGl6ZSB0aGUgcXVhdGVybmlvbiB5b3Vyc2VsZiB3aGVyZSBuZWNlc3NhcnkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge21hdDN9IG0gcm90YXRpb24gbWF0cml4XHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tTWF0MyhvdXQsIG0pIHtcclxuXHRcdC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXHJcblx0XHQvLyBhcnRpY2xlIFwiUXVhdGVybmlvbiBDYWxjdWx1cyBhbmQgRmFzdCBBbmltYXRpb25cIi5cclxuXHRcdHZhciBmVHJhY2UgPSBtWzBdICsgbVs0XSArIG1bOF1cclxuXHRcdHZhciBmUm9vdFxyXG5cclxuXHRcdGlmIChmVHJhY2UgPiAwLjApIHtcclxuXHRcdFx0Ly8gfHd8ID4gMS8yLCBtYXkgYXMgd2VsbCBjaG9vc2UgdyA+IDEvMlxyXG5cdFx0XHRmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApIC8vIDJ3XHJcblxyXG5cdFx0XHRvdXRbM10gPSAwLjUgKiBmUm9vdFxyXG5cdFx0XHRmUm9vdCA9IDAuNSAvIGZSb290IC8vIDEvKDR3KVxyXG5cclxuXHRcdFx0b3V0WzBdID0gKG1bNV0gLSBtWzddKSAqIGZSb290XHJcblx0XHRcdG91dFsxXSA9IChtWzZdIC0gbVsyXSkgKiBmUm9vdFxyXG5cdFx0XHRvdXRbMl0gPSAobVsxXSAtIG1bM10pICogZlJvb3RcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHx3fCA8PSAxLzJcclxuXHRcdFx0dmFyIGkgPSAwXHJcblx0XHRcdGlmIChtWzRdID4gbVswXSkgaSA9IDFcclxuXHRcdFx0aWYgKG1bOF0gPiBtW2kgKiAzICsgaV0pIGkgPSAyXHJcblx0XHRcdHZhciBqID0gKGkgKyAxKSAlIDNcclxuXHRcdFx0dmFyIGsgPSAoaSArIDIpICUgM1xyXG5cdFx0XHRmUm9vdCA9IE1hdGguc3FydChtW2kgKiAzICsgaV0gLSBtW2ogKiAzICsgal0gLSBtW2sgKiAzICsga10gKyAxLjApXHJcblx0XHRcdG91dFtpXSA9IDAuNSAqIGZSb290XHJcblx0XHRcdGZSb290ID0gMC41IC8gZlJvb3RcclxuXHRcdFx0b3V0WzNdID0gKG1baiAqIDMgKyBrXSAtIG1bayAqIDMgKyBqXSkgKiBmUm9vdFxyXG5cdFx0XHRvdXRbal0gPSAobVtqICogMyArIGldICsgbVtpICogMyArIGpdKSAqIGZSb290XHJcblx0XHRcdG91dFtrXSA9IChtW2sgKiAzICsgaV0gKyBtW2kgKiAzICsga10pICogZlJvb3RcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIGV1bGVyIGFuZ2xlIHgsIHksIHouXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3h9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWCBheGlzIGluIGRlZ3JlZXMuXHJcblx0ICogQHBhcmFtIHt5fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFkgYXhpcyBpbiBkZWdyZWVzLlxyXG5cdCAqIEBwYXJhbSB7en0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBaIGF4aXMgaW4gZGVncmVlcy5cclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21FdWxlcihvdXQsIHgsIHksIHopIHtcclxuXHRcdHZhciBoYWxmVG9SYWQgPSAoMC41ICogTWF0aC5QSSkgLyAxODAuMFxyXG5cdFx0eCAqPSBoYWxmVG9SYWRcclxuXHRcdHkgKj0gaGFsZlRvUmFkXHJcblx0XHR6ICo9IGhhbGZUb1JhZFxyXG5cdFx0dmFyIHN4ID0gTWF0aC5zaW4oeClcclxuXHRcdHZhciBjeCA9IE1hdGguY29zKHgpXHJcblx0XHR2YXIgc3kgPSBNYXRoLnNpbih5KVxyXG5cdFx0dmFyIGN5ID0gTWF0aC5jb3MoeSlcclxuXHRcdHZhciBzeiA9IE1hdGguc2luKHopXHJcblx0XHR2YXIgY3ogPSBNYXRoLmNvcyh6KVxyXG5cdFx0b3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6XHJcblx0XHRvdXRbMV0gPSBjeCAqIHN5ICogY3ogKyBzeCAqIGN5ICogc3pcclxuXHRcdG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjelxyXG5cdFx0b3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBxdWF0ZW5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDYoYSkge1xyXG5cdFx0cmV0dXJuICdxdWF0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGNsb25lJDYgPSBjbG9uZSQ1XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZnJvbVZhbHVlcyQ2ID0gZnJvbVZhbHVlcyQ1XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGNvcHkkNiA9IGNvcHkkNVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzZXQkNiA9IHNldCQ1XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgYWRkJDYgPSBhZGQkNVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQ2ID0gbXVsdGlwbHkkNlxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzY2FsZSQ2ID0gc2NhbGUkNVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBxdWF0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkb3QkMiA9IGRvdCQxXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVycCQyID0gbGVycCQxXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbmd0aCQyID0gbGVuZ3RoJDFcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuJDIgPSBsZW5ndGgkMlxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXVhcmVkTGVuZ3RoJDIgPSBzcXVhcmVkTGVuZ3RoJDFcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQuc3F1YXJlZExlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckxlbiQyID0gc3F1YXJlZExlbmd0aCQyXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIGEgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbm9ybWFsaXplJDIgPSBub3JtYWxpemUkMVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHF1YXRlcm5pb25zIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgcXVhdGVybmlvbi5cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgVGhlIHNlY29uZCBxdWF0ZXJuaW9uLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZXhhY3RFcXVhbHMkNiA9IGV4YWN0RXF1YWxzJDVcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdHZhciBlcXVhbHMkNyA9IGVxdWFscyQ2XHJcblx0LyoqXHJcblx0ICogU2V0cyBhIHF1YXRlcm5pb24gdG8gcmVwcmVzZW50IHRoZSBzaG9ydGVzdCByb3RhdGlvbiBmcm9tIG9uZVxyXG5cdCAqIHZlY3RvciB0byBhbm90aGVyLlxyXG5cdCAqXHJcblx0ICogQm90aCB2ZWN0b3JzIGFyZSBhc3N1bWVkIHRvIGJlIHVuaXQgbGVuZ3RoLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uLlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgaW5pdGlhbCB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIGRlc3RpbmF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0dmFyIHJvdGF0aW9uVG8gPSAoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdG1wdmVjMyA9IGNyZWF0ZSQ0KClcclxuXHRcdHZhciB4VW5pdFZlYzMgPSBmcm9tVmFsdWVzJDQoMSwgMCwgMClcclxuXHRcdHZhciB5VW5pdFZlYzMgPSBmcm9tVmFsdWVzJDQoMCwgMSwgMClcclxuXHRcdHJldHVybiBmdW5jdGlvbihvdXQsIGEsIGIpIHtcclxuXHRcdFx0dmFyIGRvdCQkMSA9IGRvdChhLCBiKVxyXG5cclxuXHRcdFx0aWYgKGRvdCQkMSA8IC0wLjk5OTk5OSkge1xyXG5cdFx0XHRcdGNyb3NzKHRtcHZlYzMsIHhVbml0VmVjMywgYSlcclxuXHRcdFx0XHRpZiAobGVuKHRtcHZlYzMpIDwgMC4wMDAwMDEpIGNyb3NzKHRtcHZlYzMsIHlVbml0VmVjMywgYSlcclxuXHRcdFx0XHRub3JtYWxpemUodG1wdmVjMywgdG1wdmVjMylcclxuXHRcdFx0XHRzZXRBeGlzQW5nbGUob3V0LCB0bXB2ZWMzLCBNYXRoLlBJKVxyXG5cdFx0XHRcdHJldHVybiBvdXRcclxuXHRcdFx0fSBlbHNlIGlmIChkb3QkJDEgPiAwLjk5OTk5OSkge1xyXG5cdFx0XHRcdG91dFswXSA9IDBcclxuXHRcdFx0XHRvdXRbMV0gPSAwXHJcblx0XHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0XHRcdG91dFszXSA9IDFcclxuXHRcdFx0XHRyZXR1cm4gb3V0XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y3Jvc3ModG1wdmVjMywgYSwgYilcclxuXHRcdFx0XHRvdXRbMF0gPSB0bXB2ZWMzWzBdXHJcblx0XHRcdFx0b3V0WzFdID0gdG1wdmVjM1sxXVxyXG5cdFx0XHRcdG91dFsyXSA9IHRtcHZlYzNbMl1cclxuXHRcdFx0XHRvdXRbM10gPSAxICsgZG90JCQxXHJcblx0XHRcdFx0cmV0dXJuIG5vcm1hbGl6ZSQyKG91dCwgb3V0KVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSkoKVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBjIHRoZSB0aGlyZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBkIHRoZSBmb3VydGggb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdHZhciBzcWxlcnAgPSAoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdGVtcDEgPSBjcmVhdGUkNigpXHJcblx0XHR2YXIgdGVtcDIgPSBjcmVhdGUkNigpXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24ob3V0LCBhLCBiLCBjLCBkLCB0KSB7XHJcblx0XHRcdHNsZXJwKHRlbXAxLCBhLCBkLCB0KVxyXG5cdFx0XHRzbGVycCh0ZW1wMiwgYiwgYywgdClcclxuXHRcdFx0c2xlcnAob3V0LCB0ZW1wMSwgdGVtcDIsIDIgKiB0ICogKDEgLSB0KSlcclxuXHRcdFx0cmV0dXJuIG91dFxyXG5cdFx0fVxyXG5cdH0pKClcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBzcGVjaWZpZWQgcXVhdGVybmlvbiB3aXRoIHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxyXG5cdCAqIGF4ZXMuIEVhY2ggYXhpcyBpcyBhIHZlYzMgYW5kIGlzIGV4cGVjdGVkIHRvIGJlIHVuaXQgbGVuZ3RoIGFuZFxyXG5cdCAqIHBlcnBlbmRpY3VsYXIgdG8gYWxsIG90aGVyIHNwZWNpZmllZCBheGVzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2aWV3ICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgdmlld2luZyBkaXJlY3Rpb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHJpZ2h0IHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhbCBcInJpZ2h0XCIgZGlyZWN0aW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB1cCAgICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJ1cFwiIGRpcmVjdGlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0dmFyIHNldEF4ZXMgPSAoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgbWF0ciA9IGNyZWF0ZSQyKClcclxuXHRcdHJldHVybiBmdW5jdGlvbihvdXQsIHZpZXcsIHJpZ2h0LCB1cCkge1xyXG5cdFx0XHRtYXRyWzBdID0gcmlnaHRbMF1cclxuXHRcdFx0bWF0clszXSA9IHJpZ2h0WzFdXHJcblx0XHRcdG1hdHJbNl0gPSByaWdodFsyXVxyXG5cdFx0XHRtYXRyWzFdID0gdXBbMF1cclxuXHRcdFx0bWF0cls0XSA9IHVwWzFdXHJcblx0XHRcdG1hdHJbN10gPSB1cFsyXVxyXG5cdFx0XHRtYXRyWzJdID0gLXZpZXdbMF1cclxuXHRcdFx0bWF0cls1XSA9IC12aWV3WzFdXHJcblx0XHRcdG1hdHJbOF0gPSAtdmlld1syXVxyXG5cdFx0XHRyZXR1cm4gbm9ybWFsaXplJDIob3V0LCBmcm9tTWF0MyhvdXQsIG1hdHIpKVxyXG5cdFx0fVxyXG5cdH0pKClcclxuXHJcblx0dmFyIHF1YXQgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkNixcclxuXHRcdGlkZW50aXR5OiBpZGVudGl0eSQ0LFxyXG5cdFx0c2V0QXhpc0FuZ2xlOiBzZXRBeGlzQW5nbGUsXHJcblx0XHRnZXRBeGlzQW5nbGU6IGdldEF4aXNBbmdsZSxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQ2LFxyXG5cdFx0cm90YXRlWDogcm90YXRlWCQyLFxyXG5cdFx0cm90YXRlWTogcm90YXRlWSQyLFxyXG5cdFx0cm90YXRlWjogcm90YXRlWiQyLFxyXG5cdFx0Y2FsY3VsYXRlVzogY2FsY3VsYXRlVyxcclxuXHRcdHNsZXJwOiBzbGVycCxcclxuXHRcdHJhbmRvbTogcmFuZG9tJDIsXHJcblx0XHRpbnZlcnQ6IGludmVydCQ0LFxyXG5cdFx0Y29uanVnYXRlOiBjb25qdWdhdGUsXHJcblx0XHRmcm9tTWF0MzogZnJvbU1hdDMsXHJcblx0XHRmcm9tRXVsZXI6IGZyb21FdWxlcixcclxuXHRcdHN0cjogc3RyJDYsXHJcblx0XHRjbG9uZTogY2xvbmUkNixcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkNixcclxuXHRcdGNvcHk6IGNvcHkkNixcclxuXHRcdHNldDogc2V0JDYsXHJcblx0XHRhZGQ6IGFkZCQ2LFxyXG5cdFx0bXVsOiBtdWwkNixcclxuXHRcdHNjYWxlOiBzY2FsZSQ2LFxyXG5cdFx0ZG90OiBkb3QkMixcclxuXHRcdGxlcnA6IGxlcnAkMixcclxuXHRcdGxlbmd0aDogbGVuZ3RoJDIsXHJcblx0XHRsZW46IGxlbiQyLFxyXG5cdFx0c3F1YXJlZExlbmd0aDogc3F1YXJlZExlbmd0aCQyLFxyXG5cdFx0c3FyTGVuOiBzcXJMZW4kMixcclxuXHRcdG5vcm1hbGl6ZTogbm9ybWFsaXplJDIsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkNixcclxuXHRcdGVxdWFsczogZXF1YWxzJDcsXHJcblx0XHRyb3RhdGlvblRvOiByb3RhdGlvblRvLFxyXG5cdFx0c3FsZXJwOiBzcWxlcnAsXHJcblx0XHRzZXRBeGVzOiBzZXRBeGVzLFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIER1YWwgUXVhdGVybmlvbjxicj5cclxuXHQgKiBGb3JtYXQ6IFtyZWFsLCBkdWFsXTxicj5cclxuXHQgKiBRdWF0ZXJuaW9uIGZvcm1hdDogWFlaVzxicj5cclxuXHQgKiBNYWtlIHN1cmUgdG8gaGF2ZSBub3JtYWxpemVkIGR1YWwgcXVhdGVybmlvbnMsIG90aGVyd2lzZSB0aGUgZnVuY3Rpb25zIG1heSBub3Qgd29yayBhcyBpbnRlbmRlZC48YnI+XHJcblx0ICogQG1vZHVsZSBxdWF0MlxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IGR1YWwgcXVhdFxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBhIG5ldyBkdWFsIHF1YXRlcm5pb24gW3JlYWwgLT4gcm90YXRpb24sIGR1YWwgLT4gdHJhbnNsYXRpb25dXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQ3KCkge1xyXG5cdFx0dmFyIGRxID0gbmV3IEFSUkFZX1RZUEUoOClcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0ZHFbMF0gPSAwXHJcblx0XHRcdGRxWzFdID0gMFxyXG5cdFx0XHRkcVsyXSA9IDBcclxuXHRcdFx0ZHFbNF0gPSAwXHJcblx0XHRcdGRxWzVdID0gMFxyXG5cdFx0XHRkcVs2XSA9IDBcclxuXHRcdFx0ZHFbN10gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0ZHFbM10gPSAxXHJcblx0XHRyZXR1cm4gZHFcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXRlcm5pb24gdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG5ldyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkNyhhKSB7XHJcblx0XHR2YXIgZHEgPSBuZXcgQVJSQVlfVFlQRSg4KVxyXG5cdFx0ZHFbMF0gPSBhWzBdXHJcblx0XHRkcVsxXSA9IGFbMV1cclxuXHRcdGRxWzJdID0gYVsyXVxyXG5cdFx0ZHFbM10gPSBhWzNdXHJcblx0XHRkcVs0XSA9IGFbNF1cclxuXHRcdGRxWzVdID0gYVs1XVxyXG5cdFx0ZHFbNl0gPSBhWzZdXHJcblx0XHRkcVs3XSA9IGFbN11cclxuXHRcdHJldHVybiBkcVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGR1YWwgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4MSBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MSBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3MSBXIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5MiBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3MiBXIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gbmV3IGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDcoeDEsIHkxLCB6MSwgdzEsIHgyLCB5MiwgejIsIHcyKSB7XHJcblx0XHR2YXIgZHEgPSBuZXcgQVJSQVlfVFlQRSg4KVxyXG5cdFx0ZHFbMF0gPSB4MVxyXG5cdFx0ZHFbMV0gPSB5MVxyXG5cdFx0ZHFbMl0gPSB6MVxyXG5cdFx0ZHFbM10gPSB3MVxyXG5cdFx0ZHFbNF0gPSB4MlxyXG5cdFx0ZHFbNV0gPSB5MlxyXG5cdFx0ZHFbNl0gPSB6MlxyXG5cdFx0ZHFbN10gPSB3MlxyXG5cdFx0cmV0dXJuIGRxXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgZHVhbCBxdWF0IGZyb20gdGhlIGdpdmVuIHZhbHVlcyAocXVhdCBhbmQgdHJhbnNsYXRpb24pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geDEgWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTEgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gejEgWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdzEgVyBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geDIgWCBjb21wb25lbnQgKHRyYW5zbGF0aW9uKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5MiBZIGNvbXBvbmVudCAodHJhbnNsYXRpb24pXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHoyIFogY29tcG9uZW50ICh0cmFuc2xhdGlvbilcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG5ldyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25WYWx1ZXMoeDEsIHkxLCB6MSwgdzEsIHgyLCB5MiwgejIpIHtcclxuXHRcdHZhciBkcSA9IG5ldyBBUlJBWV9UWVBFKDgpXHJcblx0XHRkcVswXSA9IHgxXHJcblx0XHRkcVsxXSA9IHkxXHJcblx0XHRkcVsyXSA9IHoxXHJcblx0XHRkcVszXSA9IHcxXHJcblx0XHR2YXIgYXggPSB4MiAqIDAuNSxcclxuXHRcdFx0YXkgPSB5MiAqIDAuNSxcclxuXHRcdFx0YXogPSB6MiAqIDAuNVxyXG5cdFx0ZHFbNF0gPSBheCAqIHcxICsgYXkgKiB6MSAtIGF6ICogeTFcclxuXHRcdGRxWzVdID0gYXkgKiB3MSArIGF6ICogeDEgLSBheCAqIHoxXHJcblx0XHRkcVs2XSA9IGF6ICogdzEgKyBheCAqIHkxIC0gYXkgKiB4MVxyXG5cdFx0ZHFbN10gPSAtYXggKiB4MSAtIGF5ICogeTEgLSBheiAqIHoxXHJcblx0XHRyZXR1cm4gZHFcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIGR1YWwgcXVhdCBmcm9tIGEgcXVhdGVybmlvbiBhbmQgYSB0cmFuc2xhdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHQgdHJhbmxhdGlvbiB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbiQxKG91dCwgcSwgdCkge1xyXG5cdFx0dmFyIGF4ID0gdFswXSAqIDAuNSxcclxuXHRcdFx0YXkgPSB0WzFdICogMC41LFxyXG5cdFx0XHRheiA9IHRbMl0gKiAwLjUsXHJcblx0XHRcdGJ4ID0gcVswXSxcclxuXHRcdFx0YnkgPSBxWzFdLFxyXG5cdFx0XHRieiA9IHFbMl0sXHJcblx0XHRcdGJ3ID0gcVszXVxyXG5cdFx0b3V0WzBdID0gYnhcclxuXHRcdG91dFsxXSA9IGJ5XHJcblx0XHRvdXRbMl0gPSBielxyXG5cdFx0b3V0WzNdID0gYndcclxuXHRcdG91dFs0XSA9IGF4ICogYncgKyBheSAqIGJ6IC0gYXogKiBieVxyXG5cdFx0b3V0WzVdID0gYXkgKiBidyArIGF6ICogYnggLSBheCAqIGJ6XHJcblx0XHRvdXRbNl0gPSBheiAqIGJ3ICsgYXggKiBieSAtIGF5ICogYnhcclxuXHRcdG91dFs3XSA9IC1heCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIGR1YWwgcXVhdCBmcm9tIGEgdHJhbnNsYXRpb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdCB0cmFuc2xhdGlvbiB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24kMyhvdXQsIHQpIHtcclxuXHRcdG91dFswXSA9IDBcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdG91dFs0XSA9IHRbMF0gKiAwLjVcclxuXHRcdG91dFs1XSA9IHRbMV0gKiAwLjVcclxuXHRcdG91dFs2XSA9IHRbMl0gKiAwLjVcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIGR1YWwgcXVhdCBmcm9tIGEgcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHRoZSBxdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uJDQob3V0LCBxKSB7XHJcblx0XHRvdXRbMF0gPSBxWzBdXHJcblx0XHRvdXRbMV0gPSBxWzFdXHJcblx0XHRvdXRbMl0gPSBxWzJdXHJcblx0XHRvdXRbM10gPSBxWzNdXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgZHVhbCBxdWF0IGZyb20gYSBtYXRyaXggKDR4NClcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tTWF0NCQxKG91dCwgYSkge1xyXG5cdFx0Ly9UT0RPIE9wdGltaXplIHRoaXNcclxuXHRcdHZhciBvdXRlciA9IGNyZWF0ZSQ2KClcclxuXHRcdGdldFJvdGF0aW9uKG91dGVyLCBhKVxyXG5cdFx0dmFyIHQgPSBuZXcgQVJSQVlfVFlQRSgzKVxyXG5cdFx0Z2V0VHJhbnNsYXRpb24odCwgYSlcclxuXHRcdGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uJDEob3V0LCBvdXRlciwgdClcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIGR1YWwgcXVhdCB0byBhbm90aGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBzb3VyY2UgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29weSQ3KG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gYVs0XVxyXG5cdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBkdWFsIHF1YXQgdG8gdGhlIGlkZW50aXR5IGR1YWwgcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGlkZW50aXR5JDUob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAwXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHgxIFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkxIFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcxIFcgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHgyIFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkyIFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHoyIFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcyIFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0JDcob3V0LCB4MSwgeTEsIHoxLCB3MSwgeDIsIHkyLCB6MiwgdzIpIHtcclxuXHRcdG91dFswXSA9IHgxXHJcblx0XHRvdXRbMV0gPSB5MVxyXG5cdFx0b3V0WzJdID0gejFcclxuXHRcdG91dFszXSA9IHcxXHJcblx0XHRvdXRbNF0gPSB4MlxyXG5cdFx0b3V0WzVdID0geTJcclxuXHRcdG91dFs2XSA9IHoyXHJcblx0XHRvdXRbN10gPSB3MlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZXRzIHRoZSByZWFsIHBhcnQgb2YgYSBkdWFsIHF1YXRcclxuXHQgKiBAcGFyYW0gIHtxdWF0fSBvdXQgcmVhbCBwYXJ0XHJcblx0ICogQHBhcmFtICB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybiB7cXVhdH0gcmVhbCBwYXJ0XHJcblx0ICovXHJcblxyXG5cdHZhciBnZXRSZWFsID0gY29weSQ2XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgZHVhbCBwYXJ0IG9mIGEgZHVhbCBxdWF0XHJcblx0ICogQHBhcmFtICB7cXVhdH0gb3V0IGR1YWwgcGFydFxyXG5cdCAqIEBwYXJhbSAge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm4ge3F1YXR9IGR1YWwgcGFydFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBnZXREdWFsKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVs0XVxyXG5cdFx0b3V0WzFdID0gYVs1XVxyXG5cdFx0b3V0WzJdID0gYVs2XVxyXG5cdFx0b3V0WzNdID0gYVs3XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIHJlYWwgY29tcG9uZW50IG9mIGEgZHVhbCBxdWF0IHRvIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJlYWwgcGFydFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzZXRSZWFsID0gY29weSQ2XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBkdWFsIGNvbXBvbmVudCBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSBkdWFsIHBhcnRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXREdWFsKG91dCwgcSkge1xyXG5cdFx0b3V0WzRdID0gcVswXVxyXG5cdFx0b3V0WzVdID0gcVsxXVxyXG5cdFx0b3V0WzZdID0gcVsyXVxyXG5cdFx0b3V0WzddID0gcVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZXRzIHRoZSB0cmFuc2xhdGlvbiBvZiBhIG5vcm1hbGl6ZWQgZHVhbCBxdWF0XHJcblx0ICogQHBhcmFtICB7dmVjM30gb3V0IHRyYW5zbGF0aW9uXHJcblx0ICogQHBhcmFtICB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uIHRvIGJlIGRlY29tcG9zZWRcclxuXHQgKiBAcmV0dXJuIHt2ZWMzfSB0cmFuc2xhdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbiQxKG91dCwgYSkge1xyXG5cdFx0dmFyIGF4ID0gYVs0XSxcclxuXHRcdFx0YXkgPSBhWzVdLFxyXG5cdFx0XHRheiA9IGFbNl0sXHJcblx0XHRcdGF3ID0gYVs3XSxcclxuXHRcdFx0YnggPSAtYVswXSxcclxuXHRcdFx0YnkgPSAtYVsxXSxcclxuXHRcdFx0YnogPSAtYVsyXSxcclxuXHRcdFx0YncgPSBhWzNdXHJcblx0XHRvdXRbMF0gPSAoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyXHJcblx0XHRvdXRbMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyXHJcblx0XHRvdXRbMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zbGF0ZXMgYSBkdWFsIHF1YXQgYnkgdGhlIGdpdmVuIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHRyYW5zbGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNsYXRlJDMob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgYXgxID0gYVswXSxcclxuXHRcdFx0YXkxID0gYVsxXSxcclxuXHRcdFx0YXoxID0gYVsyXSxcclxuXHRcdFx0YXcxID0gYVszXSxcclxuXHRcdFx0YngxID0gdlswXSAqIDAuNSxcclxuXHRcdFx0YnkxID0gdlsxXSAqIDAuNSxcclxuXHRcdFx0YnoxID0gdlsyXSAqIDAuNSxcclxuXHRcdFx0YXgyID0gYVs0XSxcclxuXHRcdFx0YXkyID0gYVs1XSxcclxuXHRcdFx0YXoyID0gYVs2XSxcclxuXHRcdFx0YXcyID0gYVs3XVxyXG5cdFx0b3V0WzBdID0gYXgxXHJcblx0XHRvdXRbMV0gPSBheTFcclxuXHRcdG91dFsyXSA9IGF6MVxyXG5cdFx0b3V0WzNdID0gYXcxXHJcblx0XHRvdXRbNF0gPSBhdzEgKiBieDEgKyBheTEgKiBiejEgLSBhejEgKiBieTEgKyBheDJcclxuXHRcdG91dFs1XSA9IGF3MSAqIGJ5MSArIGF6MSAqIGJ4MSAtIGF4MSAqIGJ6MSArIGF5MlxyXG5cdFx0b3V0WzZdID0gYXcxICogYnoxICsgYXgxICogYnkxIC0gYXkxICogYngxICsgYXoyXHJcblx0XHRvdXRbN10gPSAtYXgxICogYngxIC0gYXkxICogYnkxIC0gYXoxICogYnoxICsgYXcyXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYXJvdW5kIHRoZSBYIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmFkIGhvdyBmYXIgc2hvdWxkIHRoZSByb3RhdGlvbiBiZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVgkMyhvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGJ4ID0gLWFbMF0sXHJcblx0XHRcdGJ5ID0gLWFbMV0sXHJcblx0XHRcdGJ6ID0gLWFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXSxcclxuXHRcdFx0YXggPSBhWzRdLFxyXG5cdFx0XHRheSA9IGFbNV0sXHJcblx0XHRcdGF6ID0gYVs2XSxcclxuXHRcdFx0YXcgPSBhWzddLFxyXG5cdFx0XHRheDEgPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5LFxyXG5cdFx0XHRheTEgPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6LFxyXG5cdFx0XHRhejEgPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4LFxyXG5cdFx0XHRhdzEgPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6XHJcblx0XHRyb3RhdGVYJDIob3V0LCBhLCByYWQpXHJcblx0XHRieCA9IG91dFswXVxyXG5cdFx0YnkgPSBvdXRbMV1cclxuXHRcdGJ6ID0gb3V0WzJdXHJcblx0XHRidyA9IG91dFszXVxyXG5cdFx0b3V0WzRdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnlcclxuXHRcdG91dFs1XSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6XHJcblx0XHRvdXRbNl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieFxyXG5cdFx0b3V0WzddID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgdGhlIFkgYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWQgaG93IGZhciBzaG91bGQgdGhlIHJvdGF0aW9uIGJlXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWSQzKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYnggPSAtYVswXSxcclxuXHRcdFx0YnkgPSAtYVsxXSxcclxuXHRcdFx0YnogPSAtYVsyXSxcclxuXHRcdFx0YncgPSBhWzNdLFxyXG5cdFx0XHRheCA9IGFbNF0sXHJcblx0XHRcdGF5ID0gYVs1XSxcclxuXHRcdFx0YXogPSBhWzZdLFxyXG5cdFx0XHRhdyA9IGFbN10sXHJcblx0XHRcdGF4MSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnksXHJcblx0XHRcdGF5MSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnosXHJcblx0XHRcdGF6MSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngsXHJcblx0XHRcdGF3MSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYnpcclxuXHRcdHJvdGF0ZVkkMihvdXQsIGEsIHJhZClcclxuXHRcdGJ4ID0gb3V0WzBdXHJcblx0XHRieSA9IG91dFsxXVxyXG5cdFx0YnogPSBvdXRbMl1cclxuXHRcdGJ3ID0gb3V0WzNdXHJcblx0XHRvdXRbNF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieVxyXG5cdFx0b3V0WzVdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYnpcclxuXHRcdG91dFs2XSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4XHJcblx0XHRvdXRbN10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCB0aGUgWiBheGlzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZCBob3cgZmFyIHNob3VsZCB0aGUgcm90YXRpb24gYmVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVaJDMob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBieCA9IC1hWzBdLFxyXG5cdFx0XHRieSA9IC1hWzFdLFxyXG5cdFx0XHRieiA9IC1hWzJdLFxyXG5cdFx0XHRidyA9IGFbM10sXHJcblx0XHRcdGF4ID0gYVs0XSxcclxuXHRcdFx0YXkgPSBhWzVdLFxyXG5cdFx0XHRheiA9IGFbNl0sXHJcblx0XHRcdGF3ID0gYVs3XSxcclxuXHRcdFx0YXgxID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSxcclxuXHRcdFx0YXkxID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieixcclxuXHRcdFx0YXoxID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCxcclxuXHRcdFx0YXcxID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBielxyXG5cdFx0cm90YXRlWiQyKG91dCwgYSwgcmFkKVxyXG5cdFx0YnggPSBvdXRbMF1cclxuXHRcdGJ5ID0gb3V0WzFdXHJcblx0XHRieiA9IG91dFsyXVxyXG5cdFx0YncgPSBvdXRbM11cclxuXHRcdG91dFs0XSA9IGF4MSAqIGJ3ICsgYXcxICogYnggKyBheTEgKiBieiAtIGF6MSAqIGJ5XHJcblx0XHRvdXRbNV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBielxyXG5cdFx0b3V0WzZdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYnhcclxuXHRcdG91dFs3XSA9IGF3MSAqIGJ3IC0gYXgxICogYnggLSBheTEgKiBieSAtIGF6MSAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYnkgYSBnaXZlbiBxdWF0ZXJuaW9uIChhICogcSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byByb3RhdGUgYnlcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVCeVF1YXRBcHBlbmQob3V0LCBhLCBxKSB7XHJcblx0XHR2YXIgcXggPSBxWzBdLFxyXG5cdFx0XHRxeSA9IHFbMV0sXHJcblx0XHRcdHF6ID0gcVsyXSxcclxuXHRcdFx0cXcgPSBxWzNdLFxyXG5cdFx0XHRheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdLFxyXG5cdFx0XHRhdyA9IGFbM11cclxuXHRcdG91dFswXSA9IGF4ICogcXcgKyBhdyAqIHF4ICsgYXkgKiBxeiAtIGF6ICogcXlcclxuXHRcdG91dFsxXSA9IGF5ICogcXcgKyBhdyAqIHF5ICsgYXogKiBxeCAtIGF4ICogcXpcclxuXHRcdG91dFsyXSA9IGF6ICogcXcgKyBhdyAqIHF6ICsgYXggKiBxeSAtIGF5ICogcXhcclxuXHRcdG91dFszXSA9IGF3ICogcXcgLSBheCAqIHF4IC0gYXkgKiBxeSAtIGF6ICogcXpcclxuXHRcdGF4ID0gYVs0XVxyXG5cdFx0YXkgPSBhWzVdXHJcblx0XHRheiA9IGFbNl1cclxuXHRcdGF3ID0gYVs3XVxyXG5cdFx0b3V0WzRdID0gYXggKiBxdyArIGF3ICogcXggKyBheSAqIHF6IC0gYXogKiBxeVxyXG5cdFx0b3V0WzVdID0gYXkgKiBxdyArIGF3ICogcXkgKyBheiAqIHF4IC0gYXggKiBxelxyXG5cdFx0b3V0WzZdID0gYXogKiBxdyArIGF3ICogcXogKyBheCAqIHF5IC0gYXkgKiBxeFxyXG5cdFx0b3V0WzddID0gYXcgKiBxdyAtIGF4ICogcXggLSBheSAqIHF5IC0gYXogKiBxelxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGJ5IGEgZ2l2ZW4gcXVhdGVybmlvbiAocSAqIGEpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byByb3RhdGUgYnlcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlQnlRdWF0UHJlcGVuZChvdXQsIHEsIGEpIHtcclxuXHRcdHZhciBxeCA9IHFbMF0sXHJcblx0XHRcdHF5ID0gcVsxXSxcclxuXHRcdFx0cXogPSBxWzJdLFxyXG5cdFx0XHRxdyA9IHFbM10sXHJcblx0XHRcdGJ4ID0gYVswXSxcclxuXHRcdFx0YnkgPSBhWzFdLFxyXG5cdFx0XHRieiA9IGFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXVxyXG5cdFx0b3V0WzBdID0gcXggKiBidyArIHF3ICogYnggKyBxeSAqIGJ6IC0gcXogKiBieVxyXG5cdFx0b3V0WzFdID0gcXkgKiBidyArIHF3ICogYnkgKyBxeiAqIGJ4IC0gcXggKiBielxyXG5cdFx0b3V0WzJdID0gcXogKiBidyArIHF3ICogYnogKyBxeCAqIGJ5IC0gcXkgKiBieFxyXG5cdFx0b3V0WzNdID0gcXcgKiBidyAtIHF4ICogYnggLSBxeSAqIGJ5IC0gcXogKiBielxyXG5cdFx0YnggPSBhWzRdXHJcblx0XHRieSA9IGFbNV1cclxuXHRcdGJ6ID0gYVs2XVxyXG5cdFx0YncgPSBhWzddXHJcblx0XHRvdXRbNF0gPSBxeCAqIGJ3ICsgcXcgKiBieCArIHF5ICogYnogLSBxeiAqIGJ5XHJcblx0XHRvdXRbNV0gPSBxeSAqIGJ3ICsgcXcgKiBieSArIHF6ICogYnggLSBxeCAqIGJ6XHJcblx0XHRvdXRbNl0gPSBxeiAqIGJ3ICsgcXcgKiBieiArIHF4ICogYnkgLSBxeSAqIGJ4XHJcblx0XHRvdXRbN10gPSBxdyAqIGJ3IC0gcXggKiBieCAtIHF5ICogYnkgLSBxeiAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYXJvdW5kIGEgZ2l2ZW4gYXhpcy4gRG9lcyB0aGUgbm9ybWFsaXNhdGlvbiBhdXRvbWF0aWNhbGx5XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIGhvdyBmYXIgdGhlIHJvdGF0aW9uIHNob3VsZCBiZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZUFyb3VuZEF4aXMob3V0LCBhLCBheGlzLCByYWQpIHtcclxuXHRcdC8vU3BlY2lhbCBjYXNlIGZvciByYWQgPSAwXHJcblx0XHRpZiAoTWF0aC5hYnMocmFkKSA8IEVQU0lMT04pIHtcclxuXHRcdFx0cmV0dXJuIGNvcHkkNyhvdXQsIGEpXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGF4aXNMZW5ndGggPSBNYXRoLnNxcnQoYXhpc1swXSAqIGF4aXNbMF0gKyBheGlzWzFdICogYXhpc1sxXSArIGF4aXNbMl0gKiBheGlzWzJdKVxyXG5cdFx0cmFkID0gcmFkICogMC41XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBieCA9IChzICogYXhpc1swXSkgLyBheGlzTGVuZ3RoXHJcblx0XHR2YXIgYnkgPSAocyAqIGF4aXNbMV0pIC8gYXhpc0xlbmd0aFxyXG5cdFx0dmFyIGJ6ID0gKHMgKiBheGlzWzJdKSAvIGF4aXNMZW5ndGhcclxuXHRcdHZhciBidyA9IE1hdGguY29zKHJhZClcclxuXHRcdHZhciBheDEgPSBhWzBdLFxyXG5cdFx0XHRheTEgPSBhWzFdLFxyXG5cdFx0XHRhejEgPSBhWzJdLFxyXG5cdFx0XHRhdzEgPSBhWzNdXHJcblx0XHRvdXRbMF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieVxyXG5cdFx0b3V0WzFdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYnpcclxuXHRcdG91dFsyXSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4XHJcblx0XHRvdXRbM10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBielxyXG5cdFx0dmFyIGF4ID0gYVs0XSxcclxuXHRcdFx0YXkgPSBhWzVdLFxyXG5cdFx0XHRheiA9IGFbNl0sXHJcblx0XHRcdGF3ID0gYVs3XVxyXG5cdFx0b3V0WzRdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieVxyXG5cdFx0b3V0WzVdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBielxyXG5cdFx0b3V0WzZdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieFxyXG5cdFx0b3V0WzddID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBkdWFsIHF1YXQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRkJDcob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdICsgYls2XVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gZHVhbCBxdWF0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5JDcob3V0LCBhLCBiKSB7XHJcblx0XHR2YXIgYXgwID0gYVswXSxcclxuXHRcdFx0YXkwID0gYVsxXSxcclxuXHRcdFx0YXowID0gYVsyXSxcclxuXHRcdFx0YXcwID0gYVszXSxcclxuXHRcdFx0YngxID0gYls0XSxcclxuXHRcdFx0YnkxID0gYls1XSxcclxuXHRcdFx0YnoxID0gYls2XSxcclxuXHRcdFx0YncxID0gYls3XSxcclxuXHRcdFx0YXgxID0gYVs0XSxcclxuXHRcdFx0YXkxID0gYVs1XSxcclxuXHRcdFx0YXoxID0gYVs2XSxcclxuXHRcdFx0YXcxID0gYVs3XSxcclxuXHRcdFx0YngwID0gYlswXSxcclxuXHRcdFx0YnkwID0gYlsxXSxcclxuXHRcdFx0YnowID0gYlsyXSxcclxuXHRcdFx0YncwID0gYlszXVxyXG5cdFx0b3V0WzBdID0gYXgwICogYncwICsgYXcwICogYngwICsgYXkwICogYnowIC0gYXowICogYnkwXHJcblx0XHRvdXRbMV0gPSBheTAgKiBidzAgKyBhdzAgKiBieTAgKyBhejAgKiBieDAgLSBheDAgKiBiejBcclxuXHRcdG91dFsyXSA9IGF6MCAqIGJ3MCArIGF3MCAqIGJ6MCArIGF4MCAqIGJ5MCAtIGF5MCAqIGJ4MFxyXG5cdFx0b3V0WzNdID0gYXcwICogYncwIC0gYXgwICogYngwIC0gYXkwICogYnkwIC0gYXowICogYnowXHJcblx0XHRvdXRbNF0gPVxyXG5cdFx0XHRheDAgKiBidzEgKyBhdzAgKiBieDEgKyBheTAgKiBiejEgLSBhejAgKiBieTEgKyBheDEgKiBidzAgKyBhdzEgKiBieDAgKyBheTEgKiBiejAgLSBhejEgKiBieTBcclxuXHRcdG91dFs1XSA9XHJcblx0XHRcdGF5MCAqIGJ3MSArIGF3MCAqIGJ5MSArIGF6MCAqIGJ4MSAtIGF4MCAqIGJ6MSArIGF5MSAqIGJ3MCArIGF3MSAqIGJ5MCArIGF6MSAqIGJ4MCAtIGF4MSAqIGJ6MFxyXG5cdFx0b3V0WzZdID1cclxuXHRcdFx0YXowICogYncxICsgYXcwICogYnoxICsgYXgwICogYnkxIC0gYXkwICogYngxICsgYXoxICogYncwICsgYXcxICogYnowICsgYXgxICogYnkwIC0gYXkxICogYngwXHJcblx0XHRvdXRbN10gPVxyXG5cdFx0XHRhdzAgKiBidzEgLSBheDAgKiBieDEgLSBheTAgKiBieTEgLSBhejAgKiBiejEgKyBhdzEgKiBidzAgLSBheDEgKiBieDAgLSBheTEgKiBieTAgLSBhejEgKiBiejBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBxdWF0Mi5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQ3ID0gbXVsdGlwbHkkN1xyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyBhIGR1YWwgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdCB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgZHVhbCBxdWF0IGJ5XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUkNyhvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRvdXRbNF0gPSBhWzRdICogYlxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIGJcclxuXHRcdG91dFs2XSA9IGFbNl0gKiBiXHJcblx0XHRvdXRbN10gPSBhWzddICogYlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gZHVhbCBxdWF0J3MgKFRoZSBkb3QgcHJvZHVjdCBvZiB0aGUgcmVhbCBwYXJ0cylcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRvdCQzID0gZG90JDJcclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIGR1YWwgcXVhdHMnc1xyXG5cdCAqIE5PVEU6IFRoZSByZXN1bHRpbmcgZHVhbCBxdWF0ZXJuaW9ucyB3b24ndCBhbHdheXMgYmUgbm9ybWFsaXplZCAoVGhlIGVycm9yIGlzIG1vc3Qgbm90aWNlYWJsZSB3aGVuIHQgPSAwLjUpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVycCQzKG91dCwgYSwgYiwgdCkge1xyXG5cdFx0dmFyIG10ID0gMSAtIHRcclxuXHRcdGlmIChkb3QkMyhhLCBiKSA8IDApIHQgPSAtdFxyXG5cdFx0b3V0WzBdID0gYVswXSAqIG10ICsgYlswXSAqIHRcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBtdCArIGJbMV0gKiB0XHJcblx0XHRvdXRbMl0gPSBhWzJdICogbXQgKyBiWzJdICogdFxyXG5cdFx0b3V0WzNdID0gYVszXSAqIG10ICsgYlszXSAqIHRcclxuXHRcdG91dFs0XSA9IGFbNF0gKiBtdCArIGJbNF0gKiB0XHJcblx0XHRvdXRbNV0gPSBhWzVdICogbXQgKyBiWzVdICogdFxyXG5cdFx0b3V0WzZdID0gYVs2XSAqIG10ICsgYls2XSAqIHRcclxuXHRcdG91dFs3XSA9IGFbN10gKiBtdCArIGJbN10gKiB0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBkdWFsIHF1YXQuIElmIHRoZXkgYXJlIG5vcm1hbGl6ZWQsIGNvbmp1Z2F0ZSBpcyBjaGVhcGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVydCQ1KG91dCwgYSkge1xyXG5cdFx0dmFyIHNxbGVuID0gc3F1YXJlZExlbmd0aCQzKGEpXHJcblx0XHRvdXRbMF0gPSAtYVswXSAvIHNxbGVuXHJcblx0XHRvdXRbMV0gPSAtYVsxXSAvIHNxbGVuXHJcblx0XHRvdXRbMl0gPSAtYVsyXSAvIHNxbGVuXHJcblx0XHRvdXRbM10gPSBhWzNdIC8gc3FsZW5cclxuXHRcdG91dFs0XSA9IC1hWzRdIC8gc3FsZW5cclxuXHRcdG91dFs1XSA9IC1hWzVdIC8gc3FsZW5cclxuXHRcdG91dFs2XSA9IC1hWzZdIC8gc3FsZW5cclxuXHRcdG91dFs3XSA9IGFbN10gLyBzcWxlblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBjb25qdWdhdGUgb2YgYSBkdWFsIHF1YXRcclxuXHQgKiBJZiB0aGUgZHVhbCBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdDIuaW52ZXJzZSBhbmQgcHJvZHVjZXMgdGhlIHNhbWUgcmVzdWx0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29uanVnYXRlJDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAtYVswXVxyXG5cdFx0b3V0WzFdID0gLWFbMV1cclxuXHRcdG91dFsyXSA9IC1hWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSAtYVs0XVxyXG5cdFx0b3V0WzVdID0gLWFbNV1cclxuXHRcdG91dFs2XSA9IC1hWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIGR1YWwgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXQgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW5ndGgkMyA9IGxlbmd0aCQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBxdWF0Mi5sZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW4kMyA9IGxlbmd0aCQzXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBkdWFsIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0IHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxdWFyZWRMZW5ndGgkMyA9IHNxdWFyZWRMZW5ndGgkMlxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdDIuc3F1YXJlZExlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckxlbiQzID0gc3F1YXJlZExlbmd0aCQzXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIGEgZHVhbCBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdGVybmlvbiB0byBub3JtYWxpemVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBub3JtYWxpemUkMyhvdXQsIGEpIHtcclxuXHRcdHZhciBtYWduaXR1ZGUgPSBzcXVhcmVkTGVuZ3RoJDMoYSlcclxuXHJcblx0XHRpZiAobWFnbml0dWRlID4gMCkge1xyXG5cdFx0XHRtYWduaXR1ZGUgPSBNYXRoLnNxcnQobWFnbml0dWRlKVxyXG5cdFx0XHR2YXIgYTAgPSBhWzBdIC8gbWFnbml0dWRlXHJcblx0XHRcdHZhciBhMSA9IGFbMV0gLyBtYWduaXR1ZGVcclxuXHRcdFx0dmFyIGEyID0gYVsyXSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR2YXIgYTMgPSBhWzNdIC8gbWFnbml0dWRlXHJcblx0XHRcdHZhciBiMCA9IGFbNF1cclxuXHRcdFx0dmFyIGIxID0gYVs1XVxyXG5cdFx0XHR2YXIgYjIgPSBhWzZdXHJcblx0XHRcdHZhciBiMyA9IGFbN11cclxuXHRcdFx0dmFyIGFfZG90X2IgPSBhMCAqIGIwICsgYTEgKiBiMSArIGEyICogYjIgKyBhMyAqIGIzXHJcblx0XHRcdG91dFswXSA9IGEwXHJcblx0XHRcdG91dFsxXSA9IGExXHJcblx0XHRcdG91dFsyXSA9IGEyXHJcblx0XHRcdG91dFszXSA9IGEzXHJcblx0XHRcdG91dFs0XSA9IChiMCAtIGEwICogYV9kb3RfYikgLyBtYWduaXR1ZGVcclxuXHRcdFx0b3V0WzVdID0gKGIxIC0gYTEgKiBhX2RvdF9iKSAvIG1hZ25pdHVkZVxyXG5cdFx0XHRvdXRbNl0gPSAoYjIgLSBhMiAqIGFfZG90X2IpIC8gbWFnbml0dWRlXHJcblx0XHRcdG91dFs3XSA9IChiMyAtIGEzICogYV9kb3RfYikgLyBtYWduaXR1ZGVcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBkdWFsIHF1YXRlbmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXRlcm5pb24gdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkdWFsIHF1YXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDcoYSkge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0J3F1YXQyKCcgK1xyXG5cdFx0XHRhWzBdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbMV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsyXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzNdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs1XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzZdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbN10gK1xyXG5cdFx0XHQnKSdcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZHVhbCBxdWF0ZXJuaW9ucyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBkdWFsIHF1YXRlcm5pb24uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIGR1YWwgcXVhdGVybmlvbi5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSBpZiB0aGUgZHVhbCBxdWF0ZXJuaW9ucyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkNyhhLCBiKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRhWzBdID09PSBiWzBdICYmXHJcblx0XHRcdGFbMV0gPT09IGJbMV0gJiZcclxuXHRcdFx0YVsyXSA9PT0gYlsyXSAmJlxyXG5cdFx0XHRhWzNdID09PSBiWzNdICYmXHJcblx0XHRcdGFbNF0gPT09IGJbNF0gJiZcclxuXHRcdFx0YVs1XSA9PT0gYls1XSAmJlxyXG5cdFx0XHRhWzZdID09PSBiWzZdICYmXHJcblx0XHRcdGFbN10gPT09IGJbN11cclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZHVhbCBxdWF0ZXJuaW9ucyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBkdWFsIHF1YXQuXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIGR1YWwgcXVhdC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSBpZiB0aGUgZHVhbCBxdWF0cyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDgoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV0sXHJcblx0XHRcdGE2ID0gYVs2XSxcclxuXHRcdFx0YTcgPSBhWzddXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdLFxyXG5cdFx0XHRiNCA9IGJbNF0sXHJcblx0XHRcdGI1ID0gYls1XSxcclxuXHRcdFx0YjYgPSBiWzZdLFxyXG5cdFx0XHRiNyA9IGJbN11cclxuXHRcdHJldHVybiAoXHJcblx0XHRcdE1hdGguYWJzKGEwIC0gYjApIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMSAtIGIxKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTIgLSBiMikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcblx0XHRcdE1hdGguYWJzKGEzIC0gYjMpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNCAtIGI0KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTUgLSBiNSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE2IC0gYjYpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNyAtIGI3KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSlcclxuXHRcdClcclxuXHR9XHJcblxyXG5cdHZhciBxdWF0MiA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQ3LFxyXG5cdFx0Y2xvbmU6IGNsb25lJDcsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDcsXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvblZhbHVlczogZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25WYWx1ZXMsXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvbjogZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24kMSxcclxuXHRcdGZyb21UcmFuc2xhdGlvbjogZnJvbVRyYW5zbGF0aW9uJDMsXHJcblx0XHRmcm9tUm90YXRpb246IGZyb21Sb3RhdGlvbiQ0LFxyXG5cdFx0ZnJvbU1hdDQ6IGZyb21NYXQ0JDEsXHJcblx0XHRjb3B5OiBjb3B5JDcsXHJcblx0XHRpZGVudGl0eTogaWRlbnRpdHkkNSxcclxuXHRcdHNldDogc2V0JDcsXHJcblx0XHRnZXRSZWFsOiBnZXRSZWFsLFxyXG5cdFx0Z2V0RHVhbDogZ2V0RHVhbCxcclxuXHRcdHNldFJlYWw6IHNldFJlYWwsXHJcblx0XHRzZXREdWFsOiBzZXREdWFsLFxyXG5cdFx0Z2V0VHJhbnNsYXRpb246IGdldFRyYW5zbGF0aW9uJDEsXHJcblx0XHR0cmFuc2xhdGU6IHRyYW5zbGF0ZSQzLFxyXG5cdFx0cm90YXRlWDogcm90YXRlWCQzLFxyXG5cdFx0cm90YXRlWTogcm90YXRlWSQzLFxyXG5cdFx0cm90YXRlWjogcm90YXRlWiQzLFxyXG5cdFx0cm90YXRlQnlRdWF0QXBwZW5kOiByb3RhdGVCeVF1YXRBcHBlbmQsXHJcblx0XHRyb3RhdGVCeVF1YXRQcmVwZW5kOiByb3RhdGVCeVF1YXRQcmVwZW5kLFxyXG5cdFx0cm90YXRlQXJvdW5kQXhpczogcm90YXRlQXJvdW5kQXhpcyxcclxuXHRcdGFkZDogYWRkJDcsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkNyxcclxuXHRcdG11bDogbXVsJDcsXHJcblx0XHRzY2FsZTogc2NhbGUkNyxcclxuXHRcdGRvdDogZG90JDMsXHJcblx0XHRsZXJwOiBsZXJwJDMsXHJcblx0XHRpbnZlcnQ6IGludmVydCQ1LFxyXG5cdFx0Y29uanVnYXRlOiBjb25qdWdhdGUkMSxcclxuXHRcdGxlbmd0aDogbGVuZ3RoJDMsXHJcblx0XHRsZW46IGxlbiQzLFxyXG5cdFx0c3F1YXJlZExlbmd0aDogc3F1YXJlZExlbmd0aCQzLFxyXG5cdFx0c3FyTGVuOiBzcXJMZW4kMyxcclxuXHRcdG5vcm1hbGl6ZTogbm9ybWFsaXplJDMsXHJcblx0XHRzdHI6IHN0ciQ3LFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDcsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQ4LFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIDIgRGltZW5zaW9uYWwgVmVjdG9yXHJcblx0ICogQG1vZHVsZSB2ZWMyXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzJcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDgoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMilcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzBdID0gMFxyXG5cdFx0XHRvdXRbMV0gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDgoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDIpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkOCh4LCB5KSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMilcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkOChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMiB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldCQ4KG91dCwgeCwgeSkge1xyXG5cdFx0b3V0WzBdID0geFxyXG5cdFx0b3V0WzFdID0geVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRkJDgob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkNihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkOChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBEaXZpZGVzIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGl2aWRlJDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC8gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAvIGJbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNlaWxcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNlaWwkMihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguY2VpbChhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gZmxvb3JcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZsb29yJDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtaW4kMihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWF4JDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byByb3VuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm91bmQkMihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGgucm91bmQoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIGEgdmVjMiBieSBhIHNjYWxhciBudW1iZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUkOChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byB2ZWMyJ3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGVBbmRBZGQkMihvdXQsIGEsIGIsIHNjYWxlKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGlzdGFuY2UkMihhLCBiKSB7XHJcblx0XHR2YXIgeCA9IGJbMF0gLSBhWzBdLFxyXG5cdFx0XHR5ID0gYlsxXSAtIGFbMV1cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSlcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlJDIoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXSxcclxuXHRcdFx0eSA9IGJbMV0gLSBhWzFdXHJcblx0XHRyZXR1cm4geCAqIHggKyB5ICogeVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsZW5ndGgkNChhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdXHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgkNChhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdXHJcblx0XHRyZXR1cm4geCAqIHggKyB5ICogeVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbmVnYXRlJDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAtYVswXVxyXG5cdFx0b3V0WzFdID0gLWFbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBpbnZlcnRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVyc2UkMihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IDEuMCAvIGFbMF1cclxuXHRcdG91dFsxXSA9IDEuMCAvIGFbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbm9ybWFsaXplJDQob3V0LCBhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdXHJcblx0XHR2YXIgbGVuID0geCAqIHggKyB5ICogeVxyXG5cclxuXHRcdGlmIChsZW4gPiAwKSB7XHJcblx0XHRcdC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XHJcblx0XHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKVxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IGFbMF0gKiBsZW5cclxuXHRcdG91dFsxXSA9IGFbMV0gKiBsZW5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZG90JDQoYSwgYikge1xyXG5cdFx0cmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xyXG5cdCAqIE5vdGUgdGhhdCB0aGUgY3Jvc3MgcHJvZHVjdCBtdXN0IGJ5IGRlZmluaXRpb24gcHJvZHVjZSBhIDNEIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcm9zcyQxKG91dCwgYSwgYikge1xyXG5cdFx0dmFyIHogPSBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdXHJcblx0XHRvdXRbMF0gPSBvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsZXJwJDQob3V0LCBhLCBiLCB0KSB7XHJcblx0XHR2YXIgYXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV1cclxuXHRcdG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpXHJcblx0XHRvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcmFuZG9tJDMob3V0LCBzY2FsZSkge1xyXG5cdFx0c2NhbGUgPSBzY2FsZSB8fCAxLjBcclxuXHRcdHZhciByID0gUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJXHJcblx0XHRvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQyfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0MihvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV1cclxuXHRcdG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHlcclxuXHRcdG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MmRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQyZH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDJkKG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0b3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF1cclxuXHRcdG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHkgKyBtWzVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDNcclxuXHQgKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzJDEob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdXHJcblx0XHRvdXRbMF0gPSBtWzBdICogeCArIG1bM10gKiB5ICsgbVs2XVxyXG5cdFx0b3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0NFxyXG5cdCAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzAnXHJcblx0ICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0NCQyKG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdXHJcblx0XHR2YXIgeSA9IGFbMV1cclxuXHRcdG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzEyXVxyXG5cdFx0b3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bMTNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZSBhIDJEIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IFRoZSByZWNlaXZpbmcgdmVjMlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgdmVjMiBwb2ludCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZSQ0KG91dCwgYSwgYiwgYykge1xyXG5cdFx0Ly9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG5cdFx0dmFyIHAwID0gYVswXSAtIGJbMF0sXHJcblx0XHRcdHAxID0gYVsxXSAtIGJbMV0sXHJcblx0XHRcdHNpbkMgPSBNYXRoLnNpbihjKSxcclxuXHRcdFx0Y29zQyA9IE1hdGguY29zKGMpIC8vcGVyZm9ybSByb3RhdGlvbiBhbmQgdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBwMCAqIGNvc0MgLSBwMSAqIHNpbkMgKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBwMCAqIHNpbkMgKyBwMSAqIGNvc0MgKyBiWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gMkQgdmVjdG9yc1xyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhbmdsZSQxKGEsIGIpIHtcclxuXHRcdHZhciB4MSA9IGFbMF0sXHJcblx0XHRcdHkxID0gYVsxXSxcclxuXHRcdFx0eDIgPSBiWzBdLFxyXG5cdFx0XHR5MiA9IGJbMV1cclxuXHRcdHZhciBsZW4xID0geDEgKiB4MSArIHkxICogeTFcclxuXHJcblx0XHRpZiAobGVuMSA+IDApIHtcclxuXHRcdFx0Ly9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cclxuXHRcdFx0bGVuMSA9IDEgLyBNYXRoLnNxcnQobGVuMSlcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbGVuMiA9IHgyICogeDIgKyB5MiAqIHkyXHJcblxyXG5cdFx0aWYgKGxlbjIgPiAwKSB7XHJcblx0XHRcdC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XHJcblx0XHRcdGxlbjIgPSAxIC8gTWF0aC5zcXJ0KGxlbjIpXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGNvc2luZSA9ICh4MSAqIHgyICsgeTEgKiB5MikgKiBsZW4xICogbGVuMlxyXG5cclxuXHRcdGlmIChjb3NpbmUgPiAxLjApIHtcclxuXHRcdFx0cmV0dXJuIDBcclxuXHRcdH0gZWxzZSBpZiAoY29zaW5lIDwgLTEuMCkge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5QSVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpXHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDgoYSkge1xyXG5cdFx0cmV0dXJuICd2ZWMyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnKSdcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBleGFjdGx5IGhhdmUgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGV4YWN0RXF1YWxzJDgoYSwgYikge1xyXG5cdFx0cmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDkoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV1cclxuXHRcdHJldHVybiAoXHJcblx0XHRcdE1hdGguYWJzKGEwIC0gYjApIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMSAtIGIxKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmxlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbiQ0ID0gbGVuZ3RoJDRcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3VidHJhY3R9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzdWIkNiA9IHN1YnRyYWN0JDZcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkOCA9IG11bHRpcGx5JDhcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGl2aWRlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZGl2JDIgPSBkaXZpZGUkMlxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXN0YW5jZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpc3QkMiA9IGRpc3RhbmNlJDJcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZERpc3RhbmNlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyRGlzdCQyID0gc3F1YXJlZERpc3RhbmNlJDJcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZExlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckxlbiQ0ID0gc3F1YXJlZExlbmd0aCQ0XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzJzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzIuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzJzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cclxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IGFcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGZvckVhY2gkMiA9IChmdW5jdGlvbigpIHtcclxuXHRcdHZhciB2ZWMgPSBjcmVhdGUkOCgpXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XHJcblx0XHRcdHZhciBpLCBsXHJcblxyXG5cdFx0XHRpZiAoIXN0cmlkZSkge1xyXG5cdFx0XHRcdHN0cmlkZSA9IDJcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCFvZmZzZXQpIHtcclxuXHRcdFx0XHRvZmZzZXQgPSAwXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChjb3VudCkge1xyXG5cdFx0XHRcdGwgPSBNYXRoLm1pbihjb3VudCAqIHN0cmlkZSArIG9mZnNldCwgYS5sZW5ndGgpXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bCA9IGEubGVuZ3RoXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvciAoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XHJcblx0XHRcdFx0dmVjWzBdID0gYVtpXVxyXG5cdFx0XHRcdHZlY1sxXSA9IGFbaSArIDFdXHJcblx0XHRcdFx0Zm4odmVjLCB2ZWMsIGFyZylcclxuXHRcdFx0XHRhW2ldID0gdmVjWzBdXHJcblx0XHRcdFx0YVtpICsgMV0gPSB2ZWNbMV1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGFcclxuXHRcdH1cclxuXHR9KSgpXHJcblxyXG5cdHZhciB2ZWMyID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDgsXHJcblx0XHRjbG9uZTogY2xvbmUkOCxcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkOCxcclxuXHRcdGNvcHk6IGNvcHkkOCxcclxuXHRcdHNldDogc2V0JDgsXHJcblx0XHRhZGQ6IGFkZCQ4LFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0JDYsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkOCxcclxuXHRcdGRpdmlkZTogZGl2aWRlJDIsXHJcblx0XHRjZWlsOiBjZWlsJDIsXHJcblx0XHRmbG9vcjogZmxvb3IkMixcclxuXHRcdG1pbjogbWluJDIsXHJcblx0XHRtYXg6IG1heCQyLFxyXG5cdFx0cm91bmQ6IHJvdW5kJDIsXHJcblx0XHRzY2FsZTogc2NhbGUkOCxcclxuXHRcdHNjYWxlQW5kQWRkOiBzY2FsZUFuZEFkZCQyLFxyXG5cdFx0ZGlzdGFuY2U6IGRpc3RhbmNlJDIsXHJcblx0XHRzcXVhcmVkRGlzdGFuY2U6IHNxdWFyZWREaXN0YW5jZSQyLFxyXG5cdFx0bGVuZ3RoOiBsZW5ndGgkNCxcclxuXHRcdHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGgkNCxcclxuXHRcdG5lZ2F0ZTogbmVnYXRlJDIsXHJcblx0XHRpbnZlcnNlOiBpbnZlcnNlJDIsXHJcblx0XHRub3JtYWxpemU6IG5vcm1hbGl6ZSQ0LFxyXG5cdFx0ZG90OiBkb3QkNCxcclxuXHRcdGNyb3NzOiBjcm9zcyQxLFxyXG5cdFx0bGVycDogbGVycCQ0LFxyXG5cdFx0cmFuZG9tOiByYW5kb20kMyxcclxuXHRcdHRyYW5zZm9ybU1hdDI6IHRyYW5zZm9ybU1hdDIsXHJcblx0XHR0cmFuc2Zvcm1NYXQyZDogdHJhbnNmb3JtTWF0MmQsXHJcblx0XHR0cmFuc2Zvcm1NYXQzOiB0cmFuc2Zvcm1NYXQzJDEsXHJcblx0XHR0cmFuc2Zvcm1NYXQ0OiB0cmFuc2Zvcm1NYXQ0JDIsXHJcblx0XHRyb3RhdGU6IHJvdGF0ZSQ0LFxyXG5cdFx0YW5nbGU6IGFuZ2xlJDEsXHJcblx0XHRzdHI6IHN0ciQ4LFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDgsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQ5LFxyXG5cdFx0bGVuOiBsZW4kNCxcclxuXHRcdHN1Yjogc3ViJDYsXHJcblx0XHRtdWw6IG11bCQ4LFxyXG5cdFx0ZGl2OiBkaXYkMixcclxuXHRcdGRpc3Q6IGRpc3QkMixcclxuXHRcdHNxckRpc3Q6IHNxckRpc3QkMixcclxuXHRcdHNxckxlbjogc3FyTGVuJDQsXHJcblx0XHRmb3JFYWNoOiBmb3JFYWNoJDIsXHJcblx0fSlcclxuXHJcblx0ZXhwb3J0cy5nbE1hdHJpeCA9IGNvbW1vblxyXG5cdGV4cG9ydHMubWF0MiA9IG1hdDJcclxuXHRleHBvcnRzLm1hdDJkID0gbWF0MmRcclxuXHRleHBvcnRzLm1hdDMgPSBtYXQzXHJcblx0ZXhwb3J0cy5tYXQ0ID0gbWF0NFxyXG5cdGV4cG9ydHMucXVhdCA9IHF1YXRcclxuXHRleHBvcnRzLnF1YXQyID0gcXVhdDJcclxuXHRleHBvcnRzLnZlYzIgPSB2ZWMyXHJcblx0ZXhwb3J0cy52ZWMzID0gdmVjM1xyXG5cdGV4cG9ydHMudmVjNCA9IHZlYzRcclxuXHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KVxyXG59KVxyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgMjAxMiwgR3JlZ2cgVGF2YXJlcy5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICpcclxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XHJcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcclxuICogbWV0OlxyXG4gKlxyXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxyXG4gKiBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXHJcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcclxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxyXG4gKiBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlXHJcbiAqIGRpc3RyaWJ1dGlvbi5cclxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xyXG4gKiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbVxyXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxyXG4gKlxyXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXHJcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcclxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXHJcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXHJcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxyXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXHJcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxyXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcclxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxyXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcclxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuICovXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHByb2dyYW0sIGF0dGFjaGVzIHNoYWRlcnMsIGJpbmRzIGF0dHJpYiBsb2NhdGlvbnMsIGxpbmtzIHRoZVxyXG4gKiBwcm9ncmFtIGFuZCBjYWxscyB1c2VQcm9ncmFtLlxyXG4gKiBAcGFyYW0ge1dlYkdMU2hhZGVyW119IHNoYWRlcnMgVGhlIHNoYWRlcnMgdG8gYXR0YWNoXHJcbiAqIEBwYXJhbSB7c3RyaW5nW119IFtvcHRfYXR0cmlic10gQW4gYXJyYXkgb2YgYXR0cmlicyBuYW1lcy5cclxuICogTG9jYXRpb25zIHdpbGwgYmUgYXNzaWduZWQgYnkgaW5kZXggaWYgbm90IHBhc3NlZCBpblxyXG4gKiBAcGFyYW0ge251bWJlcltdfSBbb3B0X2xvY2F0aW9uc10gVGhlIGxvY2F0aW9ucyBmb3IgdGhlLlxyXG4gKiBBIHBhcmFsbGVsIGFycmF5IHRvIG9wdF9hdHRyaWJzIGxldHRpbmcgeW91IGFzc2lnbiBsb2NhdGlvbnMuXHJcbiAqIEBwYXJhbSB7bW9kdWxlOndlYmdsLXV0aWxzLkVycm9yQ2FsbGJhY2t9IG9wdF9lcnJvckNhbGxiYWNrIGNhbGxiYWNrIGZvciBlcnJvcnMuXHJcbiAqIEJ5IGRlZmF1bHQgaXQganVzdCBwcmludHMgYW4gZXJyb3IgdG8gdGhlIGNvbnNvbGUgb24gZXJyb3IuXHJcbiAqIElmIHlvdSB3YW50IHNvbWV0aGluZyBlbHNlIHBhc3MgYW4gY2FsbGJhY2suIEl0J3MgcGFzc2VkIGFuIGVycm9yIG1lc3NhZ2UuXHJcbiAqIEBtZW1iZXJPZiBtb2R1bGU6d2ViZ2wtdXRpbHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm9ncmFtKFxyXG5cdGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQsXHJcblx0c2hhZGVyczogV2ViR0xTaGFkZXJbXSxcclxuXHRvcHRfYXR0cmlicz86IHN0cmluZ1tdLFxyXG5cdG9wdF9sb2NhdGlvbnM/OiBudW1iZXJbXSxcclxuXHRvcHRfZXJyb3JDYWxsYmFjaz86IGFueSxcclxuKTogV2ViR0xQcm9ncmFtIHtcclxuXHRjb25zdCBlcnJGbiA9IG9wdF9lcnJvckNhbGxiYWNrIHx8IGNvbnNvbGUuZXJyb3JcclxuXHRjb25zdCBwcm9ncmFtOiBXZWJHTFByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKClcclxuXHJcblx0c2hhZGVycy5mb3JFYWNoKChzaGFkZXIpID0+IGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBzaGFkZXIpKVxyXG5cclxuXHRpZiAob3B0X2F0dHJpYnMpIHtcclxuXHRcdG9wdF9hdHRyaWJzLmZvckVhY2goKGF0dHJpYiwgbmR4KSA9PlxyXG5cdFx0XHRnbC5iaW5kQXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgb3B0X2xvY2F0aW9ucyA/IG9wdF9sb2NhdGlvbnNbbmR4XSA6IG5keCwgYXR0cmliKSxcclxuXHRcdClcclxuXHR9XHJcblxyXG5cdGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pXHJcblxyXG5cdC8vIENoZWNrIHRoZSBsaW5rIHN0YXR1c1xyXG5cdGNvbnN0IGxpbmtlZCA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpXHJcblx0aWYgKCFsaW5rZWQpIHtcclxuXHRcdC8vIHNvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggdGhlIGxpbmtcclxuXHRcdGNvbnN0IGxhc3RFcnJvciA9IGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pXHJcblx0XHRlcnJGbignRXJyb3IgaW4gcHJvZ3JhbSBsaW5raW5nOicgKyBsYXN0RXJyb3IpXHJcblxyXG5cdFx0Z2wuZGVsZXRlUHJvZ3JhbShwcm9ncmFtKVxyXG5cdFx0cmV0dXJuIG51bGxcclxuXHR9XHJcblx0cmV0dXJuIHByb2dyYW1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc2l6ZSBhIGNhbnZhcyB0byBtYXRjaCB0aGUgc2l6ZSBpdHMgZGlzcGxheWVkLlxyXG4gKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXMgVGhlIGNhbnZhcyB0byByZXNpemUuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbXVsdGlwbGllcl0gYW1vdW50IHRvIG11bHRpcGx5IGJ5LlxyXG4gKiAgICBQYXNzIGluIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIGZvciBuYXRpdmUgcGl4ZWxzLlxyXG4gKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBjYW52YXMgd2FzIHJlc2l6ZWQuXHJcbiAqIEBtZW1iZXJPZiBtb2R1bGU6d2ViZ2wtdXRpbHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZXNpemVDYW52YXNUb0Rpc3BsYXlTaXplKFxyXG5cdGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXHJcblx0bXVsdGlwbGllcjogbnVtYmVyID0gMSxcclxuKTogYm9vbGVhbiB7XHJcblx0Y29uc3Qgd2lkdGggPSAoY2FudmFzLmNsaWVudFdpZHRoICogbXVsdGlwbGllcikgfCAwXHJcblx0Y29uc3QgaGVpZ2h0ID0gKGNhbnZhcy5jbGllbnRIZWlnaHQgKiBtdWx0aXBsaWVyKSB8IDBcclxuXHRpZiAoY2FudmFzLndpZHRoICE9PSB3aWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBoZWlnaHQpIHtcclxuXHRcdGNhbnZhcy53aWR0aCA9IHdpZHRoXHJcblx0XHRjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XHJcblx0XHRyZXR1cm4gdHJ1ZVxyXG5cdH1cclxuXHRyZXR1cm4gZmFsc2VcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc2l6ZSBhIGNhbnZhcyB0byBtYXRjaCB0aGUgc2l6ZSBpdHMgZGlzcGxheWVkLlxyXG4gKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXMgVGhlIGNhbnZhcyB0byByZXNpemUuXHJcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNhbnZhcyB3YXMgcmVzaXplZC5cclxuICogQG1lbWJlck9mIG1vZHVsZTp3ZWJnbC11dGlsc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZUNhbnZhc1RvU3F1YXJlKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBib29sZWFuIHtcclxuXHRjb25zdCBzdHlsZXMgPSBnZXRDb21wdXRlZFN0eWxlKGNhbnZhcylcclxuXHRjb25zdCB3aWR0aCA9IHBhcnNlRmxvYXQoc3R5bGVzLndpZHRoKVxyXG5cdGNvbnN0IGhlaWdodCA9IHBhcnNlRmxvYXQoc3R5bGVzLmhlaWdodClcclxuXHJcblx0aWYgKGNhbnZhcy53aWR0aCAhPT0gd2lkdGggfHwgY2FudmFzLmhlaWdodCAhPT0gaGVpZ2h0KSB7XHJcblx0XHRjYW52YXMud2lkdGggPSB3aWR0aFxyXG5cdFx0Y2FudmFzLmhlaWdodCA9IHdpZHRoXHJcblx0XHRyZXR1cm4gdHJ1ZVxyXG5cdH1cclxuXHRyZXR1cm4gZmFsc2VcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNoYWRlcihcclxuXHRnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0LFxyXG5cdHR5cGU6IHN0cmluZyxcclxuXHRyZXNvbHZlOiAodmFsdWU6IFdlYkdMU2hhZGVyIHwgUHJvbWlzZUxpa2U8e30+KSA9PiB2b2lkLFxyXG5cdHJlamVjdDogKHJlYXNvbjogRXJyb3IpID0+IHZvaWQsXHJcbikge1xyXG5cdGZ1bmN0aW9uIGhhbmRsZVNoYWRlcihkYXRhOiBzdHJpbmcpOiBXZWJHTFNoYWRlciB7XHJcblx0XHRsZXQgc2hhZGVyOiBXZWJHTFNoYWRlclxyXG5cdFx0aWYgKHR5cGUgPT09ICdmcmFnbWVudC1zaGFkZXInKSB7XHJcblx0XHRcdHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpXHJcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09ICd2ZXJ0ZXgtc2hhZGVyJykge1xyXG5cdFx0XHRzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUilcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0Z2wuc2hhZGVyU291cmNlKHNoYWRlciwgZGF0YSlcclxuXHRcdGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKVxyXG5cclxuXHRcdHJldHVybiBzaGFkZXJcclxuXHR9XHJcblxyXG5cdGZldGNoKGBodHRwOi8vbG9jYWxob3N0OjEzMzcvYXNzZXRzL3NoYWRlcnMvJHt0eXBlfS5nbHNsYClcclxuXHRcdC50aGVuKChyZXNwKSA9PiByZXNwLnRleHQoKSlcclxuXHRcdC50aGVuKChkYXRhOiBzdHJpbmcpID0+IGhhbmRsZVNoYWRlcihkYXRhKSlcclxuXHRcdC50aGVuKChzaGFkZXI6IFdlYkdMU2hhZGVyKSA9PiByZXNvbHZlKHNoYWRlcikpXHJcblx0XHQuY2F0Y2goKGVycjogRXJyb3IpID0+IHJlamVjdChlcnIpKVxyXG5cclxuXHQvLyBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG5cdC8vIFx0YWxlcnQoZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpKVxyXG5cdC8vIFx0cmV0dXJuIG51bGxcclxuXHQvLyB9XHJcbn1cclxuIl19
