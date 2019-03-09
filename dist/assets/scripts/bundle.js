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
  fps = 1000 / (time - lastTime);
  fpsCounter.textContent = fps.toFixed(0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9pbmRleC50cyIsInNyYy9zY3JpcHRzL3dlYmdsLWdvb2dsZS11dGlscy50cyIsInNyYy9zY3JpcHRzL3dlYmdsLW1hdHJpeC5qcyIsInNyYy9zY3JpcHRzL3dlYmdsLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUEsSUFBQSxvQkFBQSxHQUFBLE9BQUEsQ0FBQSxzQkFBQSxDQUFBOztBQUNBLElBQUEsY0FBQSxHQUFBLE9BQUEsQ0FBQSxnQkFBQSxDQUFBOztBQUNBLElBQUEsYUFBQSxHQUFBLE9BQUEsQ0FBQSxlQUFBLENBQUE7O0FBRUEsSUFBSSxFQUFKO0FBRUEsSUFBTSxPQUFPLEdBQVEsRUFBckI7QUFDQSxJQUFNLFFBQVEsR0FBUSxFQUF0QjtBQUVBLElBQU0sVUFBVSxHQUFHLGNBQUEsQ0FBQSxJQUFBLENBQUssUUFBTCxDQUFjLGNBQUEsQ0FBQSxJQUFBLENBQUssTUFBTCxFQUFkLENBQW5CO0FBQ0EsSUFBTSxXQUFXLEdBQUcsY0FBQSxDQUFBLElBQUEsQ0FBSyxRQUFMLENBQWMsY0FBQSxDQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWQsQ0FBcEI7QUFDQSxJQUFNLGVBQWUsR0FBRyxjQUFBLENBQUEsSUFBQSxDQUFLLFFBQUwsQ0FBYyxjQUFBLENBQUEsSUFBQSxDQUFLLE1BQUwsRUFBZCxDQUF4QjtBQUNBLElBQU0saUJBQWlCLEdBQUcsY0FBQSxDQUFBLElBQUEsQ0FBSyxRQUFMLENBQWMsY0FBQSxDQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWQsQ0FBMUI7QUFDQSxJQUFNLFNBQVMsR0FBRyxjQUFBLENBQUEsSUFBQSxDQUFLLFFBQUwsQ0FBYyxjQUFBLENBQUEsSUFBQSxDQUFLLE1BQUwsRUFBZCxDQUFsQjtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUssV0FBTCxDQUFpQixpQkFBakIsRUFBb0Msb0JBQUEsQ0FB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QUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4RSxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxDQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FB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QUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ3ZDLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7OztPQVdHO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUNyQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUUzQixJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUE7U0FDWDtRQUVELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNwQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDcEMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMx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RUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDL0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDL0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ3BCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtR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QUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSztRQUMvQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxD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Q2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsT0FBTyxDQUFDLENBQUM7UUFDakIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUVILFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztRQUNoRSxJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7UUFDOUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLHdGQUF3RjtRQUN4RixJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7WUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1NBQ1o7YUFBTTtZQUNOLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNiO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQSxDQUFDLDRCQUE0QjtRQUU1RCxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUUzQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUE7U0FDWDtRQUVELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDdkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ3RDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUN0QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUN2QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUN2QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDdEMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLE9BQU8sQ0FDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM5RixDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2hDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDNUIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDakIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7UUFPSTtJQUVKLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRztRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNwQixDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O1FBTUk7SUFFSixTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBLENBQUMsNEJBQTRCO1FBRTVELElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBRS9FLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQTtTQUNYO1FBRUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNO1FBQ3JDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxDQUFDO1FBQ2YsT0FBTyxDQUNOLE9BQU87WUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLEdBQUcsQ0FDSCxDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxNQUFNLENBQUMsQ0FBQztRQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDbEIsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLO1FBQy9DLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FDTixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxDQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENB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Q1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNYO1FBRUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxPQUFPLENBQUMsQ0FBQztRQUNqQixJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW9CRztJQUVILFNBQVMsWUFBWSxDQUNwQixHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHO1FBRUgsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FxQkc7SUFFSCxTQUFTLEtBQUssQ0FDYixHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRztRQUVILEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUc7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLHdGQUF3RjtRQUN4RixJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7WUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7U0FDYjthQUFNO1lBQ04sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUNmO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNkLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUEsQ0FBQyw0QkFBNEI7UUFFNUQsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFFL0UsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFBO1NBQ1g7UUFFRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ25ELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNOLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQ1YsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQ1YsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUNWLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ04sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBLENBQUMsNEJBQTRCO1FBRTVELE9BQU8sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDN0UsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNkLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBLENBQUMsbURBQW1EO1FBRWhFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbkQsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ25ELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFBO1FBQ3RCLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFBO1FBQ3RCLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFBO1FBRXRCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDaEQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNoRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2pELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDakQ7YUFBTTtZQUNOLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDN0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUM3QyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzdDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDN0M7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztRQU9JO0lBRUosU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMs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QUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkIsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLGtEQUFrRDtRQUV0RSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzNDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUUzQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDZCxvRUFBb0U7WUFDcEUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUNmO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRWYsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2QsZ0VBQWdFO1lBQ2hFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxF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R0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMzQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzNCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFZCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDZCxvRUFBb0U7WUFDcEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZixDQUFDLDhDQUE4QztRQUVoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7O09BV0c7SUFFSCxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUk7UUFDckMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNkLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUMxQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRVgsSUFBSSxHQUFHLEdBQUcsT0FBTyxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFBO1NBQ1g7UUFFRCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLENBQUMsSUFBSSxHQUFHLENBQUE7UUFDUixDQUFDLElBQUksR0FBRyxDQUFBO1FBQ1IsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtRQUNSLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsa0RBQWtEO1FBRTVELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDOUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsOENBQThDO1FBRXBFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRztRQUM5QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQyw4Q0FBOEM7UUFFcEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQzlCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLDhDQUE4QztRQUVwRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUVILFNBQVMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3pDLGtCQUFrQjtRQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxXQUFXLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLFNBQVMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBLENBQUMsOEJBQThCO1FBRXBGLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtZQUNsQixXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUE7WUFDMUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFBO1lBQzFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQTtTQUMxRTthQUFNO1lBQ04sV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM1RCxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcs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QyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUM5QjthQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQy9DLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFBO1lBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUM5QjthQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUM1QixDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFBO1lBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDOUI7YUFBTTtZQUNOLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtTQUNqQjtRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7Ozs7O09BZ0JHO0lBRUgsU0FBUyw0QkFBNEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2pELGtCQUFrQjtRQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FtQkc7SUFFSCxTQUFTLGtDQUFrQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFELGtCQUFrQjtRQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUMvQixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUMvQixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDekQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ3pELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxFQUFFLENB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QUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDNUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUMzQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDN0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7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QUFJLEVBQUUsR0FBRztRQUN0RCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUE7UUFDM0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUM3QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdB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QUUsR0FBRyxFQUFFLENBQUE7UUFDdEIsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUN0QixHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBRTVDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ04sRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNOLEVBQUUsR0FBRyxDQUFDLENBQUE7U0FDTjthQUFNO1lBQ04sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDYixFQUFFLElBQUksR0FBRyxDQUFBO1lBQ1QsRUFBRSxJQUFJLEdBQUcsQ0FBQTtZQUNULEVBQUUsSUFBSSxHQUFHLENBQUE7U0FDVDtRQUVELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDOUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNoQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNiLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDWCxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUNYLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWixJQUFJLEVBQUUsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUN4QixFQUFFLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDckIsRUFBRSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFFckMsSUFB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QUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLO1FBQy9DLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMvQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FDZixDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLE9BQU8sQ0FDTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1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QUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxD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QUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDN0IsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRS9CLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNa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QyxHQUFHLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBO1FBQ2hDLElBQUksQ0FBQyxHQUFHLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDNUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ2xCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDL0MsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN0RCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENB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LENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLCtCQUErQjtRQUU5RSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxFQUFFLEVBQ1QsQ0FBQyxHQUFHLEVBQUUsQ0FBQSxDQUFDLCtCQUErQjtRQUV2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLGtCQUFrQjtRQUVyQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLCtCQUErQjtRQUU5RSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxFQUFFLEVBQ1QsQ0FBQyxHQUFHLEVBQUUsQ0FBQSxDQUFDLCtCQUErQjtRQUV2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLGtCQUFrQjtRQUVyQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQywrQkFBK0I7UUFFM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNsQixJQUFJLEtBQUssR0FBRyxZQUFZLENB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QUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09B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QUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3JDLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7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QyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyx1QkFBdUI7UUFFbEMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDakMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDakMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDakMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQSxDQUFDLGtDQUFrQztRQUVyRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQTtRQUNqRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQTtRQUNqRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxD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USxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNmLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDZixRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQ2Y7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsR0FBRyxJQUFJLEdBQUcsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ3JCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM3QixHQUFHLElBQUksR0FBRyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDckIsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzdCLEdBQUcsSUFBSSxHQUFHLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNyQixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FB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QUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1NBQzlCO2FBQU07WUFDTixhQUFhO1lBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1QsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3RCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbkIsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUE7WUFDbkUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUE7WUFDcEIsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUE7WUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7WUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7WUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7U0FDOUM7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7O09BU0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzlCLElBQUksU0FBUyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDdkMsQ0FBQyxJQUFJLFNBQVMsQ0FBQTtRQUNkLENBQUMsSUFBSSxTQUFTLENBQUE7UUFDZCxDQUFDLElBQUksU0FBUyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxLQUFLLENBQUMsQ0FBQztRQUNmLE9BQU8sT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7SUFDdEUsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQTtJQUNyQjs7Ozs7Ozs7O09BU0c7SUFFSCxJQUFJLFlBQVksR0FBRyxZQUFZLENBQUE7SUFDL0I7Ozs7Ozs7T0FPRztJQUVILElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQTtJQUNuQjs7Ozs7Ozs7OztPQVVHO0lBRUgsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ2pCOzs7Ozs7OztPQVFHO0lBRUgsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ2pCOzs7T0FHRztJQUVILElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQTtJQUN0Qjs7Ozs7Ozs7T0FRRztJQUVILElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQTtJQUNyQjs7Ozs7OztPQU9HO0lBRUgsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ2pCOzs7Ozs7Ozs7T0FTRztJQUVILElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQTtJQUNuQjs7Ozs7T0FLRztJQUVILElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQTtJQUN2Qjs7O09BR0c7SUFFSCxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUE7SUFDcEI7Ozs7OztPQU1HO0lBRUgsSUFBSSxlQUFlLEdBQUcsZUFBZSxDQUFBO0lBQ3JDOzs7T0FHRztJQUVILElBQUksUUFBUSxHQUFHLGVBQWUsQ0FBQTtJQUM5Qjs7Ozs7OztPQU9HO0lBRUgsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFBO0lBQzdCOzs7Ozs7T0FNRztJQUVILElBQUksYUFBYSxHQUFHLGFBQWEsQ0FBQTtJQUNqQzs7Ozs7O09BTUc7SUFFSCxJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDdkI7Ozs7Ozs7Ozs7T0FVRztJQUVILElBQUksVUFBVSxHQUFHLENBQUM7UUFDakIsSUFBSSxPQUFPLEdBQUcsUUFBUSxFQUFFLENBQUE7UUFDeEIsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDckMsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDckMsT0FBTyxVQUFTLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUN4QixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBRXRCLElBQUksTUFBTSxHQUFHLENBQUMsUUFBUSxFQUFFO2dCQUN2QixLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFDNUIsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsUUFBUTtvQkFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFDekQsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtnQkFDM0IsWUFBWSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUNuQyxPQUFPLEdBQUcsQ0FBQTthQUNWO2lCQUFNLElBQUksTUFBTSxHQUFHLFFBQVEsRUFBRTtnQkFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDVixPQUFPLEdBQUcsQ0FBQTthQUNWO2lCQUFNO2dCQUNOLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO2dCQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtnQkFDbkIsT0FBTyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO2FBQzVCO1FBQ0YsQ0FBQyxDQUFBO0lBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUNKOzs7Ozs7Ozs7O09BVUc7SUFFSCxJQUFJLE1BQU0sR0FBRyxDQUFDO1FBQ2IsSUFBSSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUE7UUFDdEIsSUFBSSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUE7UUFDdEIsT0FBTyxVQUFTLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNqQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDckIsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ3JCLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDekMsT0FBTyxHQUFHLENBQUE7UUFDWCxDQUFDLENBQUE7SUFDRixDQUFDLENBQUMsRUFBRSxDQUFBO0lBQ0o7Ozs7Ozs7OztPQVNHO0lBRUgsSUFBSSxPQUFPLEdBQUcsQ0FBQztRQUNkLElBQUksSUFBSSxHQUFHLFFBQVEsRUFBRSxDQUFBO1FBQ3JCLE9BQU8sVUFBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNsQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDZixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2YsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNmLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNsQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xCLE9BQU8sV0FBVyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDN0MsQ0FBQyxDQUFBO0lBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUVKLElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3RDLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFlBQVksRUFBRSxZQUFZO1FBQzFCLFlBQVksRUFBRSxZQUFZO1FBQzFCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFVBQVUsRUFBRSxVQUFVO1FBQ3RCLEtBQUssRUFBRSxLQUFLO1FBQ1osTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsU0FBUyxFQUFFLFNBQVM7UUFDcEIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsU0FBUyxFQUFFLFNBQVM7UUFDcEIsR0FBRyxFQUFFLEtBQUs7UUFDVixLQUFLLEVBQUUsT0FBTztRQUNkLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLElBQUksRUFBRSxNQUFNO1FBQ1osR0FBRyxFQUFFLEtBQUs7UUFDVixHQUFHLEVBQUUsS0FBSztRQUNWLEdBQUcsRUFBRSxLQUFLO1FBQ1YsS0FBSyxFQUFFLE9BQU87UUFDZCxHQUFHLEVBQUUsS0FBSztRQUNWLElBQUksRUFBRSxNQUFNO1FBQ1osTUFBTSxFQUFFLFFBQVE7UUFDaEIsR0FBRyxFQUFFLEtBQUs7UUFDVixhQUFhLEVBQUUsZUFBZTtRQUM5QixNQUFNLEVBQUUsUUFBUTtRQUNoQixTQUFTLEVBQUUsV0FBVztRQUN0QixXQUFXLEVBQUUsYUFBYTtRQUMxQixNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsVUFBVTtRQUN0QixNQUFNLEVBQUUsTUFBTTtRQUNkLE9BQU8sRUFBRSxPQUFPO0tBQ2hCLENBQUMsQ0FBQTtJQUVGOzs7Ozs7T0FNRztJQUVIOzs7O09BSUc7SUFFSCxTQUFTLFFBQVE7UUFDaEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFMUIsSUFBSSxVQUFVLElBQUksWUFBWSxFQUFFO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNULEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNULEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDVDtRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVCxPQUFPLEVBQUUsQ0FBQTtJQUNWLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE9BQU8sQ0FBQyxDQUFDO1FBQ2pCLElBQUksRUFBRSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osT0FBTyxFQUFFLENBQUE7SUFDVixDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUVILFNBQVMsWUFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ25ELElBQUksRUFBRSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDVixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNWLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDVixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNWLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDVixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsT0FBTyxFQUFFLENBQUE7SUFDVixDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7OztPQVlHO0lBRUgsU0FBUyw2QkFBNkIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ2hFLElBQUksRUFBRSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDVixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1YsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNWLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUNoQixFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFDYixFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNuQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDbkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ25DLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BDLE9BQU8sRUFBRSxDQUFBO0lBQ1YsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyx5QkFBeUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDM0MsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFDbEIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQ2YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQ2YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNyQyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QixvQkFBb0I7UUFDcEIsSUFBSSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUE7UUFDdEIsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLHlCQUF5QixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDeEMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7O09BY0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDakQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQTtJQUNwQjs7Ozs7T0FLRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFBO0lBQ3BCOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQy9CLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNwRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3BELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQ2hCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUNoQixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFDaEIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2hELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDakQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM3QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM1QyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN0QixFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM3QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM1QyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN0QixFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM3QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM1QyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN0QixFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3BDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNyQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRztRQUMxQywwQkFBMEI7UUFDMUIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFBRTtZQUM1QixPQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FDckI7UUFFRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckYsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtRQUNuQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUE7UUFDbkMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBO1FBQ25DLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDbEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUN0RCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUN0RCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUN0RCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUN0RCxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlGLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7T0FHRztJQUVILElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQTtJQUN0Qjs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ2pCOzs7Ozs7Ozs7T0FTRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDM0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLEtBQUssR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FB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QUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxDQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcs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UCxFQUdFLElBSEYsQ0FHTyxVQUFDLE1BQUQ7QUFBQSxXQUF5QixPQUFPLENBQUMsTUFBRCxDQUFoQztBQUFBLEdBSFAsRUFJRSxLQUpGLENBSVEsVUFBQyxHQUFEO0FBQUEsV0FBZ0IsTUFBTSxDQUFDLEdBQUQsQ0FBdEI7QUFBQSxHQUpSLEVBbEIrQixDQXdCL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFoQ0QsT0FBQSxDQUFBLFlBQUEsR0FBQSxZQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IFdlYkdMVXRpbHMsIHsgYWRkVGV4dHVyZSwgZGVnVG9SYWQgfSBmcm9tICcuL3dlYmdsLWdvb2dsZS11dGlscydcclxuaW1wb3J0IHsgbWF0NCwgdmVjMyB9IGZyb20gJy4vd2ViZ2wtbWF0cml4J1xyXG5pbXBvcnQgeyBjcmVhdGVQcm9ncmFtLCBjcmVhdGVTaGFkZXIsIHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUgfSBmcm9tICcuL3dlYmdsLXV0aWxzJ1xyXG5cclxubGV0IGdsOiBhbnlcclxuXHJcbmNvbnN0IGF0dHJpYnM6IGFueSA9IHt9XHJcbmNvbnN0IHVuaWZvcm1zOiBhbnkgPSB7fVxyXG5cclxuY29uc3Qgdmlld01hdHJpeCA9IG1hdDQuaWRlbnRpdHkobWF0NC5jcmVhdGUoKSlcclxuY29uc3QgbW9kZWxNYXRyaXggPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbmNvbnN0IG1vZGVsVmlld01hdHJpeCA9IG1hdDQuaWRlbnRpdHkobWF0NC5jcmVhdGUoKSlcclxuY29uc3QgcGVyc3BlY3RpdmVNYXRyaXggPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbmNvbnN0IG12cE1hdHJpeCA9IG1hdDQuaWRlbnRpdHkobWF0NC5jcmVhdGUoKSlcclxubWF0NC5wZXJzcGVjdGl2ZShwZXJzcGVjdGl2ZU1hdHJpeCwgZGVnVG9SYWQoNjApLCAxLCAxLCAxMDApXHJcblxyXG5jb25zdCAkID0gZnVuY3Rpb24oc2VsZWN0b3I6IHN0cmluZywgcXM/OiBib29sZWFuKTogSFRNTEVsZW1lbnQge1xyXG5cdGlmICghcXMpIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcilcclxuXHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcclxufVxyXG5cclxuaW50ZXJmYWNlIElTY2VuZSB7XHJcblx0bW9kZWxTY2FsZToge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0bW9kZWxSb3RhdGVYOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRtb2RlbFJvdGF0ZVk6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdG1vZGVsUm90YXRlWjoge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0bW9kZWxUcmFuc2xhdGVYOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRtb2RlbFRyYW5zbGF0ZVk6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdG1vZGVsVHJhbnNsYXRlWjoge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0Y2FtZXJhWDoge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0Y2FtZXJhWToge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0Y2FtZXJhWjoge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0W2tleTogc3RyaW5nXToge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcbn1cclxuXHJcbmNvbnN0IHNjZW5lOiBJU2NlbmUgPSB7XHJcblx0bW9kZWxTY2FsZToge1xyXG5cdFx0ZWxlbTogJCgnbW9kZWxTY2FsZScpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFJvdGF0ZVg6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsUm90YXRlWCcpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFJvdGF0ZVk6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsUm90YXRlWScpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFJvdGF0ZVo6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsUm90YXRlWicpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFRyYW5zbGF0ZVg6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsVHJhbnNsYXRlWCcpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFRyYW5zbGF0ZVk6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsVHJhbnNsYXRlWScpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRtb2RlbFRyYW5zbGF0ZVo6IHtcclxuXHRcdGVsZW06ICQoJ21vZGVsVHJhbnNsYXRlWicpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRjYW1lcmFYOiB7XHJcblx0XHRlbGVtOiAkKCdjYW1lcmFYJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdGNhbWVyYVk6IHtcclxuXHRcdGVsZW06ICQoJ2NhbWVyYVknKSBhcyBIVE1MRWxlbWVudCxcclxuXHRcdHZhbHVlOiAwLFxyXG5cdH0sXHJcblx0Y2FtZXJhWjoge1xyXG5cdFx0ZWxlbTogJCgnY2FtZXJhWicpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxufVxyXG5cclxuY29uc3QgZnBzQ291bnRlciA9ICQoJ2Zwcy1jb3VudGVyJylcclxuY29uc3QgZnJhbWVDb3VudGVyID0gJCgnZnJhbWUtY291bnRlcicpXHJcbmNvbnN0IHRpbWVDb3VudGVyID0gJCgndGltZS1jb3VudGVyJylcclxuXHJcbmNvbnN0IGluaXRTaGFkZXJzID0gZnVuY3Rpb24ocmVzb2x2ZTogKCkgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiBFcnJvcikgPT4gdm9pZCkge1xyXG5cdGNvbnN0IGZTaGFkZXI6IFdlYkdMU2hhZGVyID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PlxyXG5cdFx0Y3JlYXRlU2hhZGVyKGdsLCAnZnJhZ21lbnQtc2hhZGVyJywgcmVzLCByZWopXHJcblx0KVxyXG5cdGNvbnN0IHZTaGFkZXI6IFdlYkdMU2hhZGVyID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PlxyXG5cdFx0Y3JlYXRlU2hhZGVyKGdsLCAndmVydGV4LXNoYWRlcicsIHJlcywgcmVqKVxyXG5cdClcclxuXHJcblx0UHJvbWlzZS5hbGwoW2ZTaGFkZXIsIHZTaGFkZXJdKS50aGVuKChzaGFkZXJzKSA9PiB7XHJcblx0XHRnbC5wcm9ncmFtID0gY3JlYXRlUHJvZ3JhbShnbCwgc2hhZGVycylcclxuXHRcdGdsLnVzZVByb2dyYW0oZ2wucHJvZ3JhbSlcclxuXHJcblx0XHRyZXNvbHZlKClcclxuXHR9KVxyXG59XHJcblxyXG5jb25zdCBpbml0VmFyaWFibGVzID0gZnVuY3Rpb24oKSB7XHJcblx0YXR0cmlicy5hUG9zaXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihnbC5wcm9ncmFtLCAnYV9Qb3NpdGlvbicpXHJcblx0YXR0cmlicy5hQ29sb3IgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihnbC5wcm9ncmFtLCAnYV9Db2xvcicpXHJcblxyXG5cdHVuaWZvcm1zLnVXaWR0aCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihnbC5wcm9ncmFtLCAndV9XaWR0aCcpXHJcblx0dW5pZm9ybXMudUhlaWdodCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihnbC5wcm9ncmFtLCAndV9IZWlnaHQnKVxyXG5cdHVuaWZvcm1zLnVNdnBNYXRyaXggPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZ2wucHJvZ3JhbSwgJ3VfTXZwTWF0cml4JylcclxufVxyXG5cclxuY29uc3QgaW5pdFRleHR1cmVzID0gZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRydWVcclxufVxyXG4vLyBwcmV0dGllci1pZ25vcmVcclxuY29uc3QgaW5pdEJ1ZmZlciA9IGZ1bmN0aW9uKCk6IG51bWJlciB7XHJcblx0Y29uc3QgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuXHRcdDEuMCwgMS4wLCAxLjAsIDEuMCwgMS4wLCAxLjAsXHJcblx0XHQtMS4wLCAxLjAsIDEuMCwgMS4wLCAwLjAsIDEuMCxcclxuXHRcdC0xLjAsIC0xLjAsIDEuMCwgMS4wLCAwLjAsIDAuMCxcclxuXHRcdDEuMCwgLTEuMCwgMS4wLCAxLjAsIDEuMCwgMC4wLFxyXG5cdFx0MS4wLCAtMS4wLCAtMS4wLCAwLjAsIDEuMCwgMC4wLFxyXG5cdFx0MS4wLCAxLjAsIC0xLjAsIDAuMCwgMS4wLCAxLjAsXHJcblx0XHQtMS4wLCAxLjAsIC0xLjAsIDAuMCwgMC4wLCAxLjAsXHJcblx0XHQtMS4wLCAtMS4wLCAtMS4wLCAwLjAsIDAuMCwgMC4wLFxyXG5cdF0pXHJcblxyXG5cdGNvbnN0IEZTSVpFID0gdmVydGljZXMuQllURVNfUEVSX0VMRU1FTlRcclxuXHJcblx0Y29uc3QgdmVydGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcilcclxuXHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdmVydGljZXMsIGdsLlNUQVRJQ19EUkFXKVxyXG5cclxuXHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dHJpYnMuYVBvc2l0aW9uLCAzLCBnbC5GTE9BVCwgZmFsc2UsIEZTSVpFICogNiwgMClcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhdHRyaWJzLmFQb3NpdGlvbilcclxuXHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcihhdHRyaWJzLmFDb2xvciwgMywgZ2wuRkxPQVQsIGZhbHNlLCBGU0laRSAqIDYsIEZTSVpFICogMylcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhdHRyaWJzLmFDb2xvcilcclxuXHJcblx0Y29uc3QgaW5kaWNlcyA9IG5ldyBVaW50OEFycmF5KFtcclxuXHRcdDAsIDEsIDIsIDAsIDIsIDMsXHJcblx0XHQwLCAzLCA0LCAwLCA0LCA1LFxyXG5cdFx0MCwgNSwgNiwgMCwgNiwgMSxcclxuXHRcdDEsIDYsIDcsIDEsIDcsIDIsXHJcblx0XHQ3LCA0LCAzLCA3LCAzLCAyLFxyXG5cdFx0NCwgNywgNiwgNCwgNiwgNSxcclxuXHRdKVxyXG5cclxuXHRjb25zdCBpbmRleEJ1ZmZlcjogV2ViR0xCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKVxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGV4QnVmZmVyKVxyXG5cdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXMsIGdsLlNUQVRJQ19EUkFXKVxyXG5cclxuXHRyZXR1cm4gaW5kaWNlcy5sZW5ndGhcclxufVxyXG5cclxuY29uc3QgZHJhd1NjZW5lID0gZnVuY3Rpb24oKSB7XHJcblx0Z2wudmlld3BvcnQoMCwgMCwgZ2wuZHJhd2luZ0J1ZmZlcldpZHRoLCBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0KVxyXG5cclxuXHRnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVClcclxuXHJcblx0Y29uc3QgY2FtZXJhID0gdmVjMy5mcm9tVmFsdWVzKHNjZW5lLmNhbWVyYVgudmFsdWUsIHNjZW5lLmNhbWVyYVkudmFsdWUsIHNjZW5lLmNhbWVyYVoudmFsdWUpXHJcblx0Y29uc3QgY2VudGVyID0gdmVjMy5mcm9tVmFsdWVzKDAsIDAsIDApXHJcblx0Y29uc3QgdXAgPSB2ZWMzLmZyb21WYWx1ZXMoMCwgMSwgMClcclxuXHJcblx0bWF0NC5sb29rQXQodmlld01hdHJpeCwgY2FtZXJhLCBjZW50ZXIsIHVwKVxyXG5cclxuXHRtYXQ0LmlkZW50aXR5KG1vZGVsTWF0cml4KVxyXG5cdG1hdDQudHJhbnNsYXRlKFxyXG5cdFx0bW9kZWxNYXRyaXgsXHJcblx0XHRtb2RlbE1hdHJpeCxcclxuXHRcdHZlYzMuZnJvbVZhbHVlcyhcclxuXHRcdFx0c2NlbmUubW9kZWxUcmFuc2xhdGVYLnZhbHVlLFxyXG5cdFx0XHRzY2VuZS5tb2RlbFRyYW5zbGF0ZVkudmFsdWUsXHJcblx0XHRcdHNjZW5lLm1vZGVsVHJhbnNsYXRlWi52YWx1ZVxyXG5cdFx0KVxyXG5cdClcclxuXHRtYXQ0LnJvdGF0ZVgobW9kZWxNYXRyaXgsIG1vZGVsTWF0cml4LCBkZWdUb1JhZChzY2VuZS5tb2RlbFJvdGF0ZVgudmFsdWUpKVxyXG5cdG1hdDQucm90YXRlWShtb2RlbE1hdHJpeCwgbW9kZWxNYXRyaXgsIGRlZ1RvUmFkKHNjZW5lLm1vZGVsUm90YXRlWS52YWx1ZSkpXHJcblx0bWF0NC5yb3RhdGVaKG1vZGVsTWF0cml4LCBtb2RlbE1hdHJpeCwgZGVnVG9SYWQoc2NlbmUubW9kZWxSb3RhdGVaLnZhbHVlKSlcclxuXHRtYXQ0LnNjYWxlKFxyXG5cdFx0bW9kZWxNYXRyaXgsXHJcblx0XHRtb2RlbE1hdHJpeCxcclxuXHRcdHZlYzMuZnJvbVZhbHVlcyhzY2VuZS5tb2RlbFNjYWxlLnZhbHVlLCBzY2VuZS5tb2RlbFNjYWxlLnZhbHVlLCBzY2VuZS5tb2RlbFNjYWxlLnZhbHVlKVxyXG5cdClcclxuXHRtYXQ0Lm11bChtb2RlbFZpZXdNYXRyaXgsIHZpZXdNYXRyaXgsIG1vZGVsTWF0cml4KVxyXG5cdG1hdDQubXVsKG12cE1hdHJpeCwgcGVyc3BlY3RpdmVNYXRyaXgsIG1vZGVsVmlld01hdHJpeClcclxuXHJcblx0Z2wudW5pZm9ybU1hdHJpeDRmdih1bmlmb3Jtcy51TXZwTWF0cml4LCBmYWxzZSwgbXZwTWF0cml4KVxyXG5cclxuXHRnbC51bmlmb3JtMWYodW5pZm9ybXMudVdpZHRoLCBnbC5kcmF3aW5nQnVmZmVyV2lkdGgpXHJcblx0Z2wudW5pZm9ybTFmKHVuaWZvcm1zLnVIZWlnaHQsIGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQpXHJcblxyXG5cdGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIDM2LCBnbC5VTlNJR05FRF9CWVRFLCAwKVxyXG59XHJcblxyXG5sZXQgbGFzdFRpbWU6IG51bWJlciA9IDBcclxubGV0IGZyYW1lczogbnVtYmVyID0gMFxyXG5sZXQgZnBzOiBudW1iZXJcclxuY29uc3QgcmVuZGVyID0gZnVuY3Rpb24odGltZTogRE9NSGlnaFJlc1RpbWVTdGFtcCA9IDApIHtcclxuXHRmcHMgPSAxMDAwIC8gKHRpbWUgLSBsYXN0VGltZSlcclxuXHRmcHNDb3VudGVyLnRleHRDb250ZW50ID0gZnBzLnRvRml4ZWQoMClcclxuXHRmcmFtZUNvdW50ZXIudGV4dENvbnRlbnQgPSArK2ZyYW1lcyArICcnXHJcblx0dGltZUNvdW50ZXIudGV4dENvbnRlbnQgPSAodGltZSAvIDEwMDApLnRvRml4ZWQoMilcclxuXHRsYXN0VGltZSA9IHRpbWVcclxuXHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcilcclxuXHRkcmF3U2NlbmUoKVxyXG59XHJcblxyXG5jb25zdCB3ZWJHTFN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcblx0Y29uc3QgY2FudmFzOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJylcclxuXHJcblx0Y29uc3QgcG93ZXJQcmVmZXJlbmNlID0gJ2RlZmF1bHQnIHx8ICdoaWdoLXBlcmZvcm1hbmNlJyB8fCAnbG93LXBvd2VyJ1xyXG5cdGdsID0gV2ViR0xVdGlscy5zZXR1cFdlYkdMKGNhbnZhcywge1xyXG5cdFx0YWxwaGE6IHRydWUsXHJcblx0XHRkZXB0aDogdHJ1ZSxcclxuXHRcdHBvd2VyUHJlZmVyZW5jZSxcclxuXHR9KVxyXG5cclxuXHRnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMClcclxuXHRnbC5lbmFibGUoZ2wuREVQVEhfVEVTVClcclxuXHJcblx0cmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShnbC5jYW52YXMpXHJcblxyXG5cdGNvbnN0IHByb21pc2VTaGFkZXIgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IGluaXRTaGFkZXJzKHJlcywgcmVqKSlcclxuXHRwcm9taXNlU2hhZGVyXHJcblx0XHQudGhlbigoKSA9PiBpbml0VmFyaWFibGVzKCkpXHJcblx0XHQudGhlbigoKSA9PiBpbml0VGV4dHVyZXMoKSlcclxuXHRcdC50aGVuKCgpID0+IGluaXRCdWZmZXIoKSlcclxuXHRcdC50aGVuKChpbmRpY2VzKSA9PiByZW5kZXIoKSlcclxuXHRcdC5jYXRjaCgoZXJyb3I6IEVycm9yKSA9PiBjb25zb2xlLmVycm9yKGVycm9yKSlcclxufVxyXG5cclxuY29uc3QgdXBkYXRlSW5mb2JhciA9IGZ1bmN0aW9uKGVsZW06IEhUTUxFbGVtZW50KSB7XHJcblx0ZWxlbS5pbm5lckhUTUwgPSBzY2VuZVtlbGVtLmlkXS52YWx1ZS50b0ZpeGVkKDIpXHJcbn1cclxuXHJcbmNvbnN0IHNldENhbnZhc0NvbnRyb2xzID0gZnVuY3Rpb24oKTogdm9pZCB7XHJcblx0bGV0IGlzUm90YXRhYmxlID0gZmFsc2VcclxuXHJcblx0Z2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlOiBNb3VzZUV2ZW50KSA9PiAoaXNSb3RhdGFibGUgPSB0cnVlKSlcclxuXHRnbC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChlOiBNb3VzZUV2ZW50KSA9PiAoaXNSb3RhdGFibGUgPSBmYWxzZSkpXHJcblx0Z2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcblx0XHRpZiAoIWlzUm90YXRhYmxlKSByZXR1cm4gZmFsc2VcclxuXHJcblx0XHRpZiAoZS5zaGlmdEtleSkge1xyXG5cdFx0XHRzY2VuZS5tb2RlbFRyYW5zbGF0ZVgudmFsdWUgKz0gMTAgKiAoZS5tb3ZlbWVudFggLyBnbC5kcmF3aW5nQnVmZmVyV2lkdGgpXHJcblx0XHRcdHNjZW5lLm1vZGVsVHJhbnNsYXRlWS52YWx1ZSAtPSAxMCAqIChlLm1vdmVtZW50WSAvIGdsLmRyYXdpbmdCdWZmZXJXaWR0aClcclxuXHJcblx0XHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUubW9kZWxUcmFuc2xhdGVYLmVsZW0pXHJcblx0XHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUubW9kZWxUcmFuc2xhdGVZLmVsZW0pXHJcblxyXG5cdFx0XHRyZXR1cm5cclxuXHRcdH1cclxuXHJcblx0XHRzY2VuZS5tb2RlbFJvdGF0ZVgudmFsdWUgKz0gZS5tb3ZlbWVudFkgLyAzXHJcblx0XHRzY2VuZS5tb2RlbFJvdGF0ZVkudmFsdWUgKz0gZS5tb3ZlbWVudFggLyAzXHJcblxyXG5cdFx0dXBkYXRlSW5mb2JhcihzY2VuZS5tb2RlbFJvdGF0ZVguZWxlbSlcclxuXHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUubW9kZWxSb3RhdGVZLmVsZW0pXHJcblx0fSlcclxuXHJcblx0Z2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgKGU6IFdoZWVsRXZlbnQpID0+IHtcclxuXHRcdGxldCBkaXJlY3Rpb24gPSBlLmRlbHRhWSA8IDAgPyAtMC4xNSA6IDAuMTVcclxuXHRcdGlmIChlLnNoaWZ0S2V5KSBkaXJlY3Rpb24gKj0gM1xyXG5cdFx0c2NlbmUuY2FtZXJhWi52YWx1ZSArPSBkaXJlY3Rpb25cclxuXHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUuY2FtZXJhWi5lbGVtKVxyXG5cdH0pXHJcbn1cclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHRmb3IgKGNvbnN0IGtleSBpbiBzY2VuZSkge1xyXG5cdFx0aWYgKHNjZW5lLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuXHRcdFx0c2NlbmVba2V5XS52YWx1ZSA9ICtwYXJzZUZsb2F0KHNjZW5lW2tleV0uZWxlbS5pbm5lckhUTUwpXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR3ZWJHTFN0YXJ0KClcclxuXHRzZXRDYW52YXNDb250cm9scygpXHJcbn1cclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoZTogRXZlbnQpID0+IHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoZ2wuY2FudmFzKSlcclxuIiwiLypcclxuICogQ29weXJpZ2h0IDIwMTAsIEdvb2dsZSBJbmMuXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxyXG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXHJcbiAqIG1ldDpcclxuICpcclxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcclxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXHJcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxyXG4gKiBkaXN0cmlidXRpb24uXHJcbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR29vZ2xlIEluYy4gbm9yIHRoZSBuYW1lcyBvZiBpdHNcclxuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cclxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xyXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXHJcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxyXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxyXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcclxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxyXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcclxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXHJcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcclxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXHJcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcbiAqXHJcbiAqIE1vZGlmaWVkIGJ5IEFsZXggR2FybmVhdSAtIEZlYiAyLCAyMDEyIC0gZ3NraW5uZXIuY29tIGluYy5cclxuICovXHJcblxyXG4vKipcclxuICogQGZpbGVvdmVydmlldyBUaGlzIGZpbGUgY29udGFpbnMgZnVuY3Rpb25zIGV2ZXJ5IHdlYmdsIHByb2dyYW0gd2lsbCBuZWVkXHJcbiAqIGEgdmVyc2lvbiBvZiBvbmUgd2F5IG9yIGFub3RoZXIuXHJcbiAqXHJcbiAqIEluc3RlYWQgb2Ygc2V0dGluZyB1cCBhIGNvbnRleHQgbWFudWFsbHkgaXQgaXMgcmVjb21tZW5kZWQgdG9cclxuICogdXNlLiBUaGlzIHdpbGwgY2hlY2sgZm9yIHN1Y2Nlc3Mgb3IgZmFpbHVyZS4gT24gZmFpbHVyZSBpdFxyXG4gKiB3aWxsIGF0dGVtcHQgdG8gcHJlc2VudCBhbiBhcHByb3JpYXRlIG1lc3NhZ2UgdG8gdGhlIHVzZXIuXHJcbiAqXHJcbiAqICAgICAgIGdsID0gV2ViR0xVdGlscy5zZXR1cFdlYkdMKGNhbnZhcyk7XHJcbiAqXHJcbiAqIEZvciBhbmltYXRlZCBXZWJHTCBhcHBzIHVzZSBvZiBzZXRUaW1lb3V0IG9yIHNldEludGVydmFsIGFyZVxyXG4gKiBkaXNjb3VyYWdlZC4gSXQgaXMgcmVjb21tZW5kZWQgeW91IHN0cnVjdHVyZSB5b3VyIHJlbmRlcmluZ1xyXG4gKiBsb29wIGxpa2UgdGhpcy5cclxuICpcclxuICogICAgICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gKiAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lKHJlbmRlciwgY2FudmFzKTtcclxuICpcclxuICogICAgICAgICAvLyBkbyByZW5kZXJpbmdcclxuICogICAgICAgICAuLi5cclxuICogICAgICAgfVxyXG4gKiAgICAgICByZW5kZXIoKTtcclxuICpcclxuICogVGhpcyB3aWxsIGNhbGwgeW91ciByZW5kZXJpbmcgZnVuY3Rpb24gdXAgdG8gdGhlIHJlZnJlc2ggcmF0ZVxyXG4gKiBvZiB5b3VyIGRpc3BsYXkgYnV0IHdpbGwgc3RvcCByZW5kZXJpbmcgaWYgeW91ciBhcHAgaXMgbm90XHJcbiAqIHZpc2libGUuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uRnJvbU1hdHJpeChtYXRyaXg6IG51bWJlcltdKSB7XHJcblx0cmV0dXJuIHsgeDogbWF0cml4WzEyXSwgeTogbWF0cml4WzEzXSwgejogbWF0cml4WzE0XSB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3RhdGlvbkZyb21NYXRyaXgobWF0cml4OiBudW1iZXJbXSkge1xyXG5cdHJldHVybiB7IHg6IE1hdGguYXNpbihtYXRyaXhbNl0pLCB5OiBNYXRoLmFzaW4obWF0cml4WzhdKSwgejogTWF0aC5hc2luKG1hdHJpeFsxXSkgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVnVG9SYWQoZGVncmVlczogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyIHtcclxuXHRyZXR1cm4gKHBhcnNlRmxvYXQoZGVncmVlcyBhcyBzdHJpbmcpICogTWF0aC5QSSkgLyAxODBcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQpIHtcclxuXHRyZXR1cm4geyB4OiBldmVudC5vZmZzZXRYLCB5OiBldmVudC5vZmZzZXRZIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVGcm9tTW91c2UoXHJcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRtb3VzZTogTW91c2VFdmVudCxcclxuXHRncmlkU2l6ZTogbnVtYmVyLFxyXG5cdEdSSURfV0lEVEg6IG51bWJlcixcclxuXHRHUklEX0hFSUdIVDogbnVtYmVyXHJcbikge1xyXG5cdC8vIFdlJ3JlIGdldHRpbmcgaXQgaW4gdGhpcyBmb3JtYXQ6IGxlZnQ9MCwgcmlnaHQ9Z3JpZFNpemUuIFNhbWUgd2l0aCB0b3AgYW5kIGJvdHRvbS5cclxuXHQvLyBGaXJzdCwgbGV0J3Mgc2VlIHdoYXQgdGhlIGdyaWQgbG9va3MgbGlrZSBjb21wYXJlZCB0byB0aGUgY2FudmFzLlxyXG5cdC8vIEl0cyBib3JkZXJzIHdpbGwgYWx3YXlzIGJlIHRvdWNoaW5nIHdoaWNoZXZlciBwYXJ0J3MgdGhpbm5lcjogdGhlIHdpZHRoIG9yIHRoZSBoZWlnaHQuXHJcblxyXG5cdGNvbnN0IG1pZGRsZUNhbnZhcyA9IHsgeDogY2FudmFzLndpZHRoIC8gMiwgeTogY2FudmFzLmhlaWdodCAvIDIgfVxyXG5cclxuXHRjb25zdCBwb3MgPSB7XHJcblx0XHR4OiAoZ3JpZFNpemUgKiAobW91c2UueCAtIChtaWRkbGVDYW52YXMueCAtIEdSSURfV0lEVEggKiAwLjUpKSkgLyBHUklEX1dJRFRILFxyXG5cdFx0eTogKGdyaWRTaXplICogKG1vdXNlLnkgLSAobWlkZGxlQ2FudmFzLnkgLSBHUklEX0hFSUdIVCAqIDAuNSkpKSAvIEdSSURfSEVJR0hULFxyXG5cdH1cclxuXHJcblx0aWYgKHBvcy54ID49IDAgJiYgcG9zLnggPD0gZ3JpZFNpemUgJiYgcG9zLnkgPj0gMCAmJiBwb3MueSA8PSBncmlkU2l6ZSkge1xyXG5cdFx0Y29uc3QgaXRlbSA9IHsgeDogcG9zLnggfCAwLCB5OiBwb3MueSB8IDAgfVxyXG5cdFx0cmV0dXJuIGl0ZW1cclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIG51bGxcclxuXHR9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvb3JkaW5hdGVGcm9tTW91c2UoXHJcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRtb3VzZTogTW91c2VFdmVudCxcclxuXHRncmlkU2l6ZTogbnVtYmVyLFxyXG5cdEdSSURfV0lEVEg6IG51bWJlcixcclxuXHRHUklEX0hFSUdIVDogbnVtYmVyXHJcbikge1xyXG5cdC8vIFdlJ3JlIGdldHRpbmcgaXQgaW4gdGhpcyBmb3JtYXQ6IGxlZnQ9MCwgcmlnaHQ9Z3JpZFNpemUuIFNhbWUgd2l0aCB0b3AgYW5kIGJvdHRvbS5cclxuXHQvLyBGaXJzdCwgbGV0J3Mgc2VlIHdoYXQgdGhlIGdyaWQgbG9va3MgbGlrZSBjb21wYXJlZCB0byB0aGUgY2FudmFzLlxyXG5cdC8vIEl0cyBib3JkZXJzIHdpbGwgYWx3YXlzIGJlIHRvdWNoaW5nIHdoaWNoZXZlciBwYXJ0J3MgdGhpbm5lcjogdGhlIHdpZHRoIG9yIHRoZSBoZWlnaHQuXHJcblxyXG5cdGNvbnN0IG1pZGRsZUNhbnZhcyA9IHsgeDogY2FudmFzLndpZHRoLCB5OiBjYW52YXMuaGVpZ2h0IH1cclxuXHJcblx0Y29uc3QgcG9zID0ge1xyXG5cdFx0eDogKGdyaWRTaXplICogKG1vdXNlLnggLSAobWlkZGxlQ2FudmFzLnggLSBHUklEX1dJRFRIICogMC41KSkpIC8gR1JJRF9XSURUSCxcclxuXHRcdHk6IChncmlkU2l6ZSAqIChtb3VzZS55IC0gKG1pZGRsZUNhbnZhcy55IC0gR1JJRF9IRUlHSFQgKiAwLjUpKSkgLyBHUklEX0hFSUdIVCxcclxuXHR9XHJcblxyXG5cdHJldHVybiBwb3NcclxufVxyXG5cclxuLypcclxuICogV2hlbiBhbiBpbWFnZSBpcyBsb2FkZWQsIHRoaXMgd2lsbCBzdG9yZSBpdCBpbiB0aGUgc2hhZGVyIHRvIGJlIHVzZWQgYnkgdGhlIHNhbXBsZXIgcmVmZXJlbmNlcy5cclxuICogRm9yIGV4YW1wbGUsIHRvIHVzZSB0aGUgdGV4dHVyZSBzdG9yZWQgYXQgVEVYVFVSRTAsIHlvdSBzZXQgdGhlIHNhbXBsZXIgdG8gMC5cclxuICovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkVGV4dHVyZShnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0LCBpbWFnZVVSTDogc3RyaW5nLCBnbFRleHR1cmU6IEdMZW51bSkge1xyXG5cdGZ1bmN0aW9uIGlzUG93ZXJPZjIodmFsdWU6IG51bWJlcik6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKCh2YWx1ZSAmICh2YWx1ZSAtIDEpKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y29uc3QgdGV4dHVyZTogYW55ID0gZ2wuY3JlYXRlVGV4dHVyZSgpXHJcblx0dGV4dHVyZS5pbWFnZSA9IG5ldyBJbWFnZSgpXHJcblx0dGV4dHVyZS5pbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdGdsLmFjdGl2ZVRleHR1cmUoZ2xUZXh0dXJlKVxyXG5cdFx0Z2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgMSlcclxuXHRcdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpXHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKVxyXG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUilcclxuXHRcdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgdGhpcylcclxuXHJcblx0XHQvLyBUaGlzIGNsYW1wcyBpbWFnZXMgd2hvc2UgZGltZW5zaW9ucyBhcmUgbm90IGEgcG93ZXIgb2YgMiwgbGV0dGluZyB5b3UgdXNlIGltYWdlcyBvZiBhbnkgc2l6ZS5cclxuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpXHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKVxyXG5cdH1cclxuXHJcblx0dGV4dHVyZS5pbWFnZS5zcmMgPSBpbWFnZVVSTFxyXG5cdHJldHVybiB0ZXh0dXJlXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlYXNlKGZyb206IG51bWJlciwgdG86IG51bWJlciwgZWFzaW5lc3M6IG51bWJlcikge1xyXG5cdGlmIChlYXNpbmVzcyA+IDEpIHtcclxuXHRcdGVhc2luZXNzID0gMSAvIGVhc2luZXNzXHJcblx0fVxyXG5cdHJldHVybiAodG8gLSBmcm9tKSAqIGVhc2luZXNzXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5QWxlcnRNYXRyaXgobWF0cml4OiBudW1iZXJbXSkge1xyXG5cdGxldCB0ZXN0U3RyaW5nID0gJydcclxuXHRmb3IgKGxldCBpID0gMCwgbCA9IG1hdHJpeC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuXHRcdGlmIChpICUgNCA9PT0gMCAmJiBpID4gMCkge1xyXG5cdFx0XHR0ZXN0U3RyaW5nICs9ICdcXG4nXHJcblx0XHR9XHJcblx0XHR0ZXN0U3RyaW5nICs9IG1hdHJpeFtpXSArICcsICdcclxuXHR9XHJcblx0dGVzdFN0cmluZyArPSAnJ1xyXG5cdGFsZXJ0KHRlc3RTdHJpbmcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRWZWN0b3JzKHZlYzE6IG51bWJlcltdLCB2ZWMyOiBudW1iZXJbXSkge1xyXG5cdGZvciAobGV0IGkgPSAwLCBsID0gdmVjMS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuXHRcdGlmICh2ZWMyW2ldKSB7XHJcblx0XHRcdHZlYzFbaV0gKz0gdmVjMltpXVxyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gdmVjMVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdFZlY3RvcnModmVjMTogbnVtYmVyW10sIHZlYzI6IG51bWJlcltdKSB7XHJcblx0Zm9yIChsZXQgaSA9IDAsIGwgPSB2ZWMxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG5cdFx0aWYgKHZlYzJbaV0pIHtcclxuXHRcdFx0dmVjMVtpXSAtPSB2ZWMyW2ldXHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiB2ZWMxXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlVmVjdG9yKHZlYzogbnVtYmVyW10pIHtcclxuXHRmb3IgKGxldCBpID0gMCwgbCA9IHZlYy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuXHRcdHZlY1tpXSA9IDEgLSBNYXRoLmFicyh2ZWNbaV0pXHJcblx0fVxyXG5cdHJldHVybiB2ZWNcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFsZXJ0TWF0NChtYXQ6IG51bWJlcltdKSB7XHJcblx0bGV0IHN0cmluZyA9ICdbJ1xyXG5cclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG5cdFx0Zm9yIChsZXQgaiA9IDA7IGogPCA0OyBqKyspIHtcclxuXHRcdFx0c3RyaW5nICs9IE1hdGgucm91bmQobWF0W2kgKiA0ICsgal0pLnRvU3RyaW5nKCkgKyAnLCBcXHQnXHJcblx0XHR9XHJcblx0XHRzdHJpbmcgKz0gJ1xcbidcclxuXHR9XHJcblx0c3RyaW5nICs9ICddJ1xyXG5cdGFsZXJ0KHN0cmluZylcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEZsb2F0MzJDb25jYXQob3JpZ2luYWw6IG51bWJlcltdLCBhZGRpdGlvbjogbnVtYmVyW10pIHtcclxuXHRpZiAoIW9yaWdpbmFsKSB7XHJcblx0XHRyZXR1cm4gYWRkaXRpb25cclxuXHR9XHJcblxyXG5cdGNvbnN0IGxlbmd0aCA9IG9yaWdpbmFsLmxlbmd0aFxyXG5cdGNvbnN0IHRvdGFsTGVuZ3RoID0gbGVuZ3RoICsgYWRkaXRpb24ubGVuZ3RoXHJcblxyXG5cdGNvbnN0IHJlc3VsdCA9IG5ldyBGbG9hdDMyQXJyYXkodG90YWxMZW5ndGgpXHJcblxyXG5cdHJlc3VsdC5zZXQob3JpZ2luYWwpXHJcblx0cmVzdWx0LnNldChhZGRpdGlvbiwgbGVuZ3RoKVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmxldCB0b3RhbFRpbWVQYXNzZWQgPSAwXHJcbmxldCBsYXN0VGltZVBhc3NlZCA9IDBcclxuZXhwb3J0IGZ1bmN0aW9uIENvbnNvbGVUaW1lUGFzc2VkKG1lc3NhZ2U6IHN0cmluZykge1xyXG5cdHRvdGFsVGltZVBhc3NlZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcblx0Y29uc29sZS5sb2cobWVzc2FnZSArICc6ICcgKyAodG90YWxUaW1lUGFzc2VkIC0gbGFzdFRpbWVQYXNzZWQpKVxyXG5cdGxhc3RUaW1lUGFzc2VkID0gdG90YWxUaW1lUGFzc2VkXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlYXNlTm9ybWFsVmVjKHZlYzogbnVtYmVyW10pIHtcclxuXHR2ZWNbMF0gKz0gKDEgLSB2ZWNbMF0pIC8gMlxyXG5cdHZlY1sxXSArPSAoMSAtIHZlY1sxXSkgLyAyXHJcblx0dmVjWzJdICs9ICgxIC0gdmVjWzJdKSAvIDJcclxuXHJcblx0cmV0dXJuIHZlY1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCZXR3ZWVuVmVjKG1pbjogbnVtYmVyW10sIHJhbmdlOiBudW1iZXJbXSkge1xyXG5cdGNvbnN0IHZlYzogbnVtYmVyW10gPSBbMCwgMCwgMF1cclxuXHR2ZWNbMF0gPSBNYXRoLnJhbmRvbSgpICogcmFuZ2VbMF0gKyBtaW5bMF1cclxuXHR2ZWNbMV0gPSBNYXRoLnJhbmRvbSgpICogcmFuZ2VbMV0gKyBtaW5bMV1cclxuXHR2ZWNbMl0gPSBNYXRoLnJhbmRvbSgpICogcmFuZ2VbMl0gKyBtaW5bMl1cclxuXHJcblx0cmV0dXJuIHZlY1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHZlYzogbnVtYmVyW10pIHtcclxuXHRsZXQgaSA9IDBcclxuXHRsZXQgdG90YWwgPSAwXHJcblx0Y29uc3QgbCA9IHZlYy5sZW5ndGhcclxuXHRmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XHJcblx0XHR0b3RhbCArPSB2ZWNbaV1cclxuXHR9XHJcblx0Zm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG5cdFx0dmVjW2ldIC89IHRvdGFsXHJcblx0fVxyXG5cdHJldHVybiB2ZWNcclxufVxyXG5cclxuY29uc3QgV2ViR0xVdGlscyA9IChmdW5jdGlvbigpIHtcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIHRoZSBIVExNIGZvciBhIGZhaWx1cmUgbWVzc2FnZVxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBjYW52YXNDb250YWluZXJJZCBpZCBvZiBjb250YWluZXIgb2YgdGhcclxuXHQgKiAgICAgICAgY2FudmFzLlxyXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGh0bWwuXHJcblx0ICovXHJcblx0Y29uc3QgbWFrZUZhaWxIVE1MID0gZnVuY3Rpb24obXNnOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0JycgK1xyXG5cdFx0XHQnPHRhYmxlIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogIzhDRTsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTtcIj48dHI+JyArXHJcblx0XHRcdCc8dGQgYWxpZ249XCJjZW50ZXJcIj4nICtcclxuXHRcdFx0JzxkaXYgc3R5bGU9XCJkaXNwbGF5OiB0YWJsZS1jZWxsOyB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1wiPicgK1xyXG5cdFx0XHQnPGRpdiBzdHlsZT1cIlwiPicgK1xyXG5cdFx0XHRtc2cgK1xyXG5cdFx0XHQnPC9kaXY+JyArXHJcblx0XHRcdCc8L2Rpdj4nICtcclxuXHRcdFx0JzwvdGQ+PC90cj48L3RhYmxlPidcclxuXHRcdClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lc2FzZ2UgZm9yIGdldHRpbmcgYSB3ZWJnbCBicm93c2VyXHJcblx0ICogQHR5cGUge3N0cmluZ31cclxuXHQgKi9cclxuXHRjb25zdCBHRVRfQV9XRUJHTF9CUk9XU0VSOiBzdHJpbmcgPVxyXG5cdFx0JycgK1xyXG5cdFx0J1RoaXMgcGFnZSByZXF1aXJlcyBhIGJyb3dzZXIgdGhhdCBzdXBwb3J0cyBXZWJHTC48YnIvPicgK1xyXG5cdFx0JzxhIGhyZWY9XCJodHRwOi8vZ2V0LndlYmdsLm9yZ1wiPkNsaWNrIGhlcmUgdG8gdXBncmFkZSB5b3VyIGJyb3dzZXIuPC9hPidcclxuXHJcblx0LyoqXHJcblx0ICogTWVzYXNnZSBmb3IgbmVlZCBiZXR0ZXIgaGFyZHdhcmVcclxuXHQgKiBAdHlwZSB7c3RyaW5nfVxyXG5cdCAqL1xyXG5cdGNvbnN0IE9USEVSX1BST0JMRU06IHN0cmluZyA9IGBJdCBkb2Vzbid0IGFwcGVhciB5b3VyIGNvbXB1dGVyIGNhbiBzdXBwb3J0IFdlYkdMLjxici8+XHJcblx0XHQ8YSBocmVmPVwiaHR0cDovL2dldC53ZWJnbC5vcmcvdHJvdWJsZXNob290aW5nL1wiPkNsaWNrIGhlcmUgZm9yIG1vcmUgaW5mb3JtYXRpb24uPC9hPmBcclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIHdlYmdsIGNvbnRleHQuIElmIGNyZWF0aW9uIGZhaWxzIGl0IHdpbGxcclxuXHQgKiBjaGFuZ2UgdGhlIGNvbnRlbnRzIG9mIHRoZSBjb250YWluZXIgb2YgdGhlIDxjYW52YXM+XHJcblx0ICogdGFnIHRvIGFuIGVycm9yIG1lc3NhZ2Ugd2l0aCB0aGUgY29ycmVjdCBsaW5rcyBmb3IgV2ViR0wuXHJcblx0ICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzLiBUaGUgY2FudmFzIGVsZW1lbnQgdG8gY3JlYXRlIGFcclxuXHQgKiAgICAgY29udGV4dCBmcm9tLlxyXG5cdCAqIEBwYXJhbSB7V2ViR0xDb250ZXh0Q3JlYXRpb25BdHRpcmJ1dGVzfSBvcHRfYXR0cmlicyBBbnlcclxuXHQgKiAgICAgY3JlYXRpb24gYXR0cmlidXRlcyB5b3Ugd2FudCB0byBwYXNzIGluLlxyXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb246KG1zZyl9IG9wdF9vbkVycm9yIEFuIGZ1bmN0aW9uIHRvIGNhbGxcclxuXHQgKiAgICAgaWYgdGhlcmUgaXMgYW4gZXJyb3IgZHVyaW5nIGNyZWF0aW9uLlxyXG5cdCAqIEByZXR1cm4ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gVGhlIGNyZWF0ZWQgY29udGV4dC5cclxuXHQgKi9cclxuXHRjb25zdCBzZXR1cFdlYkdMID0gZnVuY3Rpb24oXHJcblx0XHRjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG5cdFx0b3B0X2F0dHJpYnM/OiBvYmplY3QsXHJcblx0XHRvcHRfb25FcnJvcj86IGFueVxyXG5cdCk6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XHJcblx0XHRmdW5jdGlvbiBoYW5kbGVDcmVhdGlvbkVycm9yKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdGNvbnN0IGNvbnRhaW5lcjogTm9kZSA9IGNhbnZhcy5wYXJlbnROb2RlXHJcblx0XHRcdGlmIChjb250YWluZXIpIHtcclxuXHRcdFx0XHRsZXQgc3RyID0gKHdpbmRvdyBhcyBhbnkpLldlYkdMUmVuZGVyaW5nQ29udGV4dCA/IE9USEVSX1BST0JMRU0gOiBHRVRfQV9XRUJHTF9CUk9XU0VSXHJcblx0XHRcdFx0aWYgKG1zZykge1xyXG5cdFx0XHRcdFx0c3RyICs9ICc8YnIvPjxici8+U3RhdHVzOiAnICsgbXNnXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNvbnRhaW5lci50ZXh0Q29udGVudCA9IG1ha2VGYWlsSFRNTChzdHIpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRvcHRfb25FcnJvciA9IG9wdF9vbkVycm9yIHx8IGhhbmRsZUNyZWF0aW9uRXJyb3JcclxuXHJcblx0XHRpZiAoY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmdsY29udGV4dGNyZWF0aW9uZXJyb3InLCAoZXZlbnQ6IFdlYkdMQ29udGV4dEV2ZW50KSA9PlxyXG5cdFx0XHRcdG9wdF9vbkVycm9yKGV2ZW50LnN0YXR1c01lc3NhZ2UpXHJcblx0XHRcdClcclxuXHRcdH1cclxuXHRcdGNvbnN0IGNvbnRleHQgPSBjcmVhdGUzRENvbnRleHQoY2FudmFzLCBvcHRfYXR0cmlicylcclxuXHRcdGlmICghY29udGV4dCkge1xyXG5cdFx0XHRpZiAoISh3aW5kb3cgYXMgYW55KS5XZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcclxuXHRcdFx0XHRvcHRfb25FcnJvcignJylcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNvbnRleHRcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSB3ZWJnbCBjb250ZXh0LlxyXG5cdCAqIEBwYXJhbSB7IUNhbnZhc30gY2FudmFzIFRoZSBjYW52YXMgdGFnIHRvIGdldCBjb250ZXh0XHJcblx0ICogICAgIGZyb20uIElmIG9uZSBpcyBub3QgcGFzc2VkIGluIG9uZSB3aWxsIGJlIGNyZWF0ZWQuXHJcblx0ICogQHJldHVybiB7IVdlYkdMQ29udGV4dH0gVGhlIGNyZWF0ZWQgY29udGV4dC5cclxuXHQgKi9cclxuXHRjb25zdCBjcmVhdGUzRENvbnRleHQgPSBmdW5jdGlvbihcclxuXHRcdGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXHJcblx0XHRvcHRfYXR0cmlicz86IG9iamVjdFxyXG5cdCk6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XHJcblx0XHRjb25zdCBuYW1lcyA9IFsnd2ViZ2wnLCAnZXhwZXJpbWVudGFsLXdlYmdsJywgJ3dlYmtpdC0zZCcsICdtb3otd2ViZ2wnXVxyXG5cdFx0bGV0IGNvbnRleHQgPSBudWxsXHJcblx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQobmFtZSwgb3B0X2F0dHJpYnMpXHJcblx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGNvbnRleHQpIHtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY29udGV4dFxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHsgc2V0dXBXZWJHTCwgY3JlYXRlM0RDb250ZXh0IH1cclxufSkoKVxyXG5cclxud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gKFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuXHRcdCh3aW5kb3cgYXMgYW55KS5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0ZnVuY3Rpb24oY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcclxuXHRcdFx0d2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyAxNSlcclxuXHRcdH1cclxuXHQpXHJcbn0pKClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdlYkdMVXRpbHNcclxuIiwiLyohXHJcbkBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXHJcbkBhdXRob3IgQnJhbmRvbiBKb25lc1xyXG5AYXV0aG9yIENvbGluIE1hY0tlbnppZSBJVlxyXG5AdmVyc2lvbiAzLjAuMC0wXHJcblxyXG5Db3B5cmlnaHQgKGMpIDIwMTUtMjAxOCwgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLlxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXHJcbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxyXG5USEUgU09GVFdBUkUuXHJcblxyXG4qL1xyXG47KGZ1bmN0aW9uKGdsb2JhbCwgZmFjdG9yeSkge1xyXG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJ1xyXG5cdFx0PyBmYWN0b3J5KGV4cG9ydHMpXHJcblx0XHQ6IHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZFxyXG5cdFx0PyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpXHJcblx0XHQ6IGZhY3RvcnkoKGdsb2JhbC5nbE1hdHJpeCA9IHt9KSlcclxufSkodGhpcywgZnVuY3Rpb24oZXhwb3J0cykge1xyXG5cdCd1c2Ugc3RyaWN0J1xyXG5cclxuXHQvKipcclxuXHQgKiBDb21tb24gdXRpbGl0aWVzXHJcblx0ICogQG1vZHVsZSBnbE1hdHJpeFxyXG5cdCAqL1xyXG5cdC8vIENvbmZpZ3VyYXRpb24gQ29uc3RhbnRzXHJcblx0dmFyIEVQU0lMT04gPSAwLjAwMDAwMVxyXG5cdHZhciBBUlJBWV9UWVBFID0gdHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBGbG9hdDMyQXJyYXkgOiBBcnJheVxyXG5cdHZhciBSQU5ET00gPSBNYXRoLnJhbmRvbVxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtUeXBlfSB0eXBlIEFycmF5IHR5cGUsIHN1Y2ggYXMgRmxvYXQzMkFycmF5IG9yIEFycmF5XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldE1hdHJpeEFycmF5VHlwZSh0eXBlKSB7XHJcblx0XHRBUlJBWV9UWVBFID0gdHlwZVxyXG5cdH1cclxuXHR2YXIgZGVncmVlID0gTWF0aC5QSSAvIDE4MFxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgRGVncmVlIFRvIFJhZGlhblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGEgQW5nbGUgaW4gRGVncmVlc1xyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0b1JhZGlhbihhKSB7XHJcblx0XHRyZXR1cm4gYSAqIGRlZ3JlZVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnRzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSB2YWx1ZSwgd2l0aGluIGFuIGFic29sdXRlXHJcblx0ICogb3IgcmVsYXRpdmUgdG9sZXJhbmNlIG9mIGdsTWF0cml4LkVQU0lMT04gKGFuIGFic29sdXRlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciB2YWx1ZXMgbGVzc1xyXG5cdCAqIHRoYW4gb3IgZXF1YWwgdG8gMS4wLCBhbmQgYSByZWxhdGl2ZSB0b2xlcmFuY2UgaXMgdXNlZCBmb3IgbGFyZ2VyIHZhbHVlcylcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBhIFRoZSBmaXJzdCBudW1iZXIgdG8gdGVzdC5cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBUaGUgc2Vjb25kIG51bWJlciB0byB0ZXN0LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBudW1iZXJzIGFyZSBhcHByb3hpbWF0ZWx5IGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEpLCBNYXRoLmFicyhiKSlcclxuXHR9XHJcblxyXG5cdHZhciBjb21tb24gPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0RVBTSUxPTjogRVBTSUxPTixcclxuXHRcdGdldCBBUlJBWV9UWVBFKCkge1xyXG5cdFx0XHRyZXR1cm4gQVJSQVlfVFlQRVxyXG5cdFx0fSxcclxuXHRcdFJBTkRPTTogUkFORE9NLFxyXG5cdFx0c2V0TWF0cml4QXJyYXlUeXBlOiBzZXRNYXRyaXhBcnJheVR5cGUsXHJcblx0XHR0b1JhZGlhbjogdG9SYWRpYW4sXHJcblx0XHRlcXVhbHM6IGVxdWFscyxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAyeDIgTWF0cml4XHJcblx0ICogQG1vZHVsZSBtYXQyXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MlxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlKCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBtYXQyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgbWF0cml4IHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBtYXQyIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgbmV3IG1hdDIgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dCBBIG5ldyAyeDIgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMobTAwLCBtMDEsIG0xMCwgbTExKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHRcdG91dFswXSA9IG0wMFxyXG5cdFx0b3V0WzFdID0gbTAxXHJcblx0XHRvdXRbMl0gPSBtMTBcclxuXHRcdG91dFszXSA9IG0xMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0xMCwgbTExKSB7XHJcblx0XHRvdXRbMF0gPSBtMDBcclxuXHRcdG91dFsxXSA9IG0wMVxyXG5cdFx0b3V0WzJdID0gbTEwXHJcblx0XHRvdXRbM10gPSBtMTFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xyXG5cdFx0Ly8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZVxyXG5cdFx0Ly8gc29tZSB2YWx1ZXNcclxuXHRcdGlmIChvdXQgPT09IGEpIHtcclxuXHRcdFx0dmFyIGExID0gYVsxXVxyXG5cdFx0XHRvdXRbMV0gPSBhWzJdXHJcblx0XHRcdG91dFsyXSA9IGExXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRcdG91dFsxXSA9IGFbMl1cclxuXHRcdFx0b3V0WzJdID0gYVsxXVxyXG5cdFx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBJbnZlcnRzIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10gLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG5cclxuXHRcdHZhciBkZXQgPSBhMCAqIGEzIC0gYTIgKiBhMVxyXG5cclxuXHRcdGlmICghZGV0KSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0ZGV0ID0gMS4wIC8gZGV0XHJcblx0XHRvdXRbMF0gPSBhMyAqIGRldFxyXG5cdFx0b3V0WzFdID0gLWExICogZGV0XHJcblx0XHRvdXRbMl0gPSAtYTIgKiBkZXRcclxuXHRcdG91dFszXSA9IGEwICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkam9pbnQob3V0LCBhKSB7XHJcblx0XHQvLyBDYWNoaW5nIHRoaXMgdmFsdWUgaXMgbmVzc2VjYXJ5IGlmIG91dCA9PSBhXHJcblx0XHR2YXIgYTAgPSBhWzBdXHJcblx0XHRvdXRbMF0gPSBhWzNdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0b3V0WzJdID0gLWFbMl1cclxuXHRcdG91dFszXSA9IGEwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XHJcblx0XHRyZXR1cm4gYVswXSAqIGFbM10gLSBhWzJdICogYVsxXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBtYXQyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdXHJcblx0XHRvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMVxyXG5cdFx0b3V0WzFdID0gYTEgKiBiMCArIGEzICogYjFcclxuXHRcdG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzXHJcblx0XHRvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiM1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0MiBieSB0aGUgZ2l2ZW4gYW5nbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGEwICogYyArIGEyICogc1xyXG5cdFx0b3V0WzFdID0gYTEgKiBjICsgYTMgKiBzXHJcblx0XHRvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjXHJcblx0XHRvdXRbM10gPSBhMSAqIC1zICsgYTMgKiBjXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyB0aGUgbWF0MiBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIHYwID0gdlswXSxcclxuXHRcdFx0djEgPSB2WzFdXHJcblx0XHRvdXRbMF0gPSBhMCAqIHYwXHJcblx0XHRvdXRbMV0gPSBhMSAqIHYwXHJcblx0XHRvdXRbMl0gPSBhMiAqIHYxXHJcblx0XHRvdXRbM10gPSBhMyAqIHYxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0Mi5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0Mi5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IG1hdDIgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gY1xyXG5cdFx0b3V0WzFdID0gc1xyXG5cdFx0b3V0WzJdID0gLXNcclxuXHRcdG91dFszXSA9IGNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQyLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQyLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCBtYXQyIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IHZbMF1cclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IHZbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyKGEpIHtcclxuXHRcdHJldHVybiAnbWF0MignICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvYihhKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpKVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIEwsIEQgYW5kIFUgbWF0cmljZXMgKExvd2VyIHRyaWFuZ3VsYXIsIERpYWdvbmFsIGFuZCBVcHBlciB0cmlhbmd1bGFyKSBieSBmYWN0b3JpemluZyB0aGUgaW5wdXQgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBMIHRoZSBsb3dlciB0cmlhbmd1bGFyIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gRCB0aGUgZGlhZ29uYWwgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBVIHRoZSB1cHBlciB0cmlhbmd1bGFyIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgaW5wdXQgbWF0cml4IHRvIGZhY3Rvcml6ZVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBMRFUoTCwgRCwgVSwgYSkge1xyXG5cdFx0TFsyXSA9IGFbMl0gLyBhWzBdXHJcblx0XHRVWzBdID0gYVswXVxyXG5cdFx0VVsxXSA9IGFbMV1cclxuXHRcdFVbM10gPSBhWzNdIC0gTFsyXSAqIFVbMV1cclxuXHRcdHJldHVybiBbTCwgRCwgVV1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0MidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAtIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC0gYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAtIGJbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xyXG5cdFx0cmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM11cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQyfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDEoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0MidzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwgPSBtdWx0aXBseVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0Mi5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiA9IHN1YnRyYWN0XHJcblxyXG5cdHZhciBtYXQyID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlLFxyXG5cdFx0Y2xvbmU6IGNsb25lLFxyXG5cdFx0Y29weTogY29weSxcclxuXHRcdGlkZW50aXR5OiBpZGVudGl0eSxcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMsXHJcblx0XHRzZXQ6IHNldCxcclxuXHRcdHRyYW5zcG9zZTogdHJhbnNwb3NlLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQsXHJcblx0XHRhZGpvaW50OiBhZGpvaW50LFxyXG5cdFx0ZGV0ZXJtaW5hbnQ6IGRldGVybWluYW50LFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5LFxyXG5cdFx0cm90YXRlOiByb3RhdGUsXHJcblx0XHRzY2FsZTogc2NhbGUsXHJcblx0XHRmcm9tUm90YXRpb246IGZyb21Sb3RhdGlvbixcclxuXHRcdGZyb21TY2FsaW5nOiBmcm9tU2NhbGluZyxcclxuXHRcdHN0cjogc3RyLFxyXG5cdFx0ZnJvYjogZnJvYixcclxuXHRcdExEVTogTERVLFxyXG5cdFx0YWRkOiBhZGQsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQxLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXI6IG11bHRpcGx5U2NhbGFyLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXJBbmRBZGQ6IG11bHRpcGx5U2NhbGFyQW5kQWRkLFxyXG5cdFx0bXVsOiBtdWwsXHJcblx0XHRzdWI6IHN1YixcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAyeDMgTWF0cml4XHJcblx0ICogQG1vZHVsZSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQGRlc2NyaXB0aW9uXHJcblx0ICogQSBtYXQyZCBjb250YWlucyBzaXggZWxlbWVudHMgZGVmaW5lZCBhczpcclxuXHQgKiA8cHJlPlxyXG5cdCAqIFthLCBjLCB0eCxcclxuXHQgKiAgYiwgZCwgdHldXHJcblx0ICogPC9wcmU+XHJcblx0ICogVGhpcyBpcyBhIHNob3J0IGZvcm0gZm9yIHRoZSAzeDMgbWF0cml4OlxyXG5cdCAqIDxwcmU+XHJcblx0ICogW2EsIGMsIHR4LFxyXG5cdCAqICBiLCBkLCB0eSxcclxuXHQgKiAgMCwgMCwgMV1cclxuXHQgKiA8L3ByZT5cclxuXHQgKiBUaGUgbGFzdCByb3cgaXMgaWdub3JlZCBzbyB0aGUgYXJyYXkgaXMgc2hvcnRlciBhbmQgb3BlcmF0aW9ucyBhcmUgZmFzdGVyLlxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDEoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNilcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdG91dFs0XSA9IDBcclxuXHRcdFx0b3V0WzVdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBtYXQyZCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkMShhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNilcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDJkIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCBhIG1hdDJkIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGlkZW50aXR5JDEob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIG5ldyBtYXQyZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBhIENvbXBvbmVudCBBIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIENvbXBvbmVudCBCIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIENvbXBvbmVudCBDIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkIENvbXBvbmVudCBEIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0eCBDb21wb25lbnQgVFggKGluZGV4IDQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHR5IENvbXBvbmVudCBUWSAoaW5kZXggNSlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IEEgbmV3IG1hdDJkXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkMShhLCBiLCBjLCBkLCB0eCwgdHkpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg2KVxyXG5cdFx0b3V0WzBdID0gYVxyXG5cdFx0b3V0WzFdID0gYlxyXG5cdFx0b3V0WzJdID0gY1xyXG5cdFx0b3V0WzNdID0gZFxyXG5cdFx0b3V0WzRdID0gdHhcclxuXHRcdG91dFs1XSA9IHR5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDJkIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBhIENvbXBvbmVudCBBIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIENvbXBvbmVudCBCIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIENvbXBvbmVudCBDIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkIENvbXBvbmVudCBEIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0eCBDb21wb25lbnQgVFggKGluZGV4IDQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHR5IENvbXBvbmVudCBUWSAoaW5kZXggNSlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkMShvdXQsIGEsIGIsIGMsIGQsIHR4LCB0eSkge1xyXG5cdFx0b3V0WzBdID0gYVxyXG5cdFx0b3V0WzFdID0gYlxyXG5cdFx0b3V0WzJdID0gY1xyXG5cdFx0b3V0WzNdID0gZFxyXG5cdFx0b3V0WzRdID0gdHhcclxuXHRcdG91dFs1XSA9IHR5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEludmVydHMgYSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVydCQxKG91dCwgYSkge1xyXG5cdFx0dmFyIGFhID0gYVswXSxcclxuXHRcdFx0YWIgPSBhWzFdLFxyXG5cdFx0XHRhYyA9IGFbMl0sXHJcblx0XHRcdGFkID0gYVszXVxyXG5cdFx0dmFyIGF0eCA9IGFbNF0sXHJcblx0XHRcdGF0eSA9IGFbNV1cclxuXHRcdHZhciBkZXQgPSBhYSAqIGFkIC0gYWIgKiBhY1xyXG5cclxuXHRcdGlmICghZGV0KSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0ZGV0ID0gMS4wIC8gZGV0XHJcblx0XHRvdXRbMF0gPSBhZCAqIGRldFxyXG5cdFx0b3V0WzFdID0gLWFiICogZGV0XHJcblx0XHRvdXRbMl0gPSAtYWMgKiBkZXRcclxuXHRcdG91dFszXSA9IGFhICogZGV0XHJcblx0XHRvdXRbNF0gPSAoYWMgKiBhdHkgLSBhZCAqIGF0eCkgKiBkZXRcclxuXHRcdG91dFs1XSA9IChhYiAqIGF0eCAtIGFhICogYXR5KSAqIGRldFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkZXRlcm1pbmFudCQxKGEpIHtcclxuXHRcdHJldHVybiBhWzBdICogYVszXSAtIGFbMV0gKiBhWzJdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIG1hdDJkJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5JDEob3V0LCBhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXSxcclxuXHRcdFx0YjQgPSBiWzRdLFxyXG5cdFx0XHRiNSA9IGJbNV1cclxuXHRcdG91dFswXSA9IGEwICogYjAgKyBhMiAqIGIxXHJcblx0XHRvdXRbMV0gPSBhMSAqIGIwICsgYTMgKiBiMVxyXG5cdFx0b3V0WzJdID0gYTAgKiBiMiArIGEyICogYjNcclxuXHRcdG91dFszXSA9IGExICogYjIgKyBhMyAqIGIzXHJcblx0XHRvdXRbNF0gPSBhMCAqIGI0ICsgYTIgKiBiNSArIGE0XHJcblx0XHRvdXRbNV0gPSBhMSAqIGI0ICsgYTMgKiBiNSArIGE1XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBtYXQyZCBieSB0aGUgZ2l2ZW4gYW5nbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZSQxKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XVxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGEwICogYyArIGEyICogc1xyXG5cdFx0b3V0WzFdID0gYTEgKiBjICsgYTMgKiBzXHJcblx0XHRvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjXHJcblx0XHRvdXRbM10gPSBhMSAqIC1zICsgYTMgKiBjXHJcblx0XHRvdXRbNF0gPSBhNFxyXG5cdFx0b3V0WzVdID0gYTVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDEob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XVxyXG5cdFx0dmFyIHYwID0gdlswXSxcclxuXHRcdFx0djEgPSB2WzFdXHJcblx0XHRvdXRbMF0gPSBhMCAqIHYwXHJcblx0XHRvdXRbMV0gPSBhMSAqIHYwXHJcblx0XHRvdXRbMl0gPSBhMiAqIHYxXHJcblx0XHRvdXRbM10gPSBhMyAqIHYxXHJcblx0XHRvdXRbNF0gPSBhNFxyXG5cdFx0b3V0WzVdID0gYTVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNsYXRlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gdHJhbnNsYXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV1cclxuXHRcdHZhciB2MCA9IHZbMF0sXHJcblx0XHRcdHYxID0gdlsxXVxyXG5cdFx0b3V0WzBdID0gYTBcclxuXHRcdG91dFsxXSA9IGExXHJcblx0XHRvdXRbMl0gPSBhMlxyXG5cdFx0b3V0WzNdID0gYTNcclxuXHRcdG91dFs0XSA9IGEwICogdjAgKyBhMiAqIHYxICsgYTRcclxuXHRcdG91dFs1XSA9IGExICogdjAgKyBhMyAqIHYxICsgYTVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGVcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQyZC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0MmQucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgbWF0MmQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvbiQxKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSBzXHJcblx0XHRvdXRbMl0gPSAtc1xyXG5cdFx0b3V0WzNdID0gY1xyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDJkLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQyZC5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IG1hdDJkIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVNjYWxpbmckMShvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IHZbMF1cclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IHZbMV1cclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHRyYW5zbGF0aW9uXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0MmQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDJkLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IG1hdDJkIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdG91dFs0XSA9IHZbMF1cclxuXHRcdG91dFs1XSA9IHZbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkMShhKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQnbWF0MmQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnLCAnICsgYVs0XSArICcsICcgKyBhWzVdICsgJyknXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb2IkMShhKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KFxyXG5cdFx0XHRNYXRoLnBvdyhhWzBdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzNdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs0XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNV0sIDIpICtcclxuXHRcdFx0XHQxLFxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQyZCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkMShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDEob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdIC0gYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSAtIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gLSBiWzVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyJDEob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRvdXRbM10gPSBhWzNdICogYlxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIGJcclxuXHRcdG91dFs1XSA9IGFbNV0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDJkJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQkMShvdXQsIGEsIGIsIHNjYWxlKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXSAqIHNjYWxlXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XSAqIHNjYWxlXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkMShhLCBiKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRhWzBdID09PSBiWzBdICYmXHJcblx0XHRcdGFbMV0gPT09IGJbMV0gJiZcclxuXHRcdFx0YVsyXSA9PT0gYlsyXSAmJlxyXG5cdFx0XHRhWzNdID09PSBiWzNdICYmXHJcblx0XHRcdGFbNF0gPT09IGJbNF0gJiZcclxuXHRcdFx0YVs1XSA9PT0gYls1XVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQyKGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdLFxyXG5cdFx0XHRiNCA9IGJbNF0sXHJcblx0XHRcdGI1ID0gYls1XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE0IC0gYjQpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNSAtIGI1KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQyZC5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQxID0gbXVsdGlwbHkkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0MmQuc3VidHJhY3R9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzdWIkMSA9IHN1YnRyYWN0JDFcclxuXHJcblx0dmFyIG1hdDJkID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDEsXHJcblx0XHRjbG9uZTogY2xvbmUkMSxcclxuXHRcdGNvcHk6IGNvcHkkMSxcclxuXHRcdGlkZW50aXR5OiBpZGVudGl0eSQxLFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQxLFxyXG5cdFx0c2V0OiBzZXQkMSxcclxuXHRcdGludmVydDogaW52ZXJ0JDEsXHJcblx0XHRkZXRlcm1pbmFudDogZGV0ZXJtaW5hbnQkMSxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQxLFxyXG5cdFx0cm90YXRlOiByb3RhdGUkMSxcclxuXHRcdHNjYWxlOiBzY2FsZSQxLFxyXG5cdFx0dHJhbnNsYXRlOiB0cmFuc2xhdGUsXHJcblx0XHRmcm9tUm90YXRpb246IGZyb21Sb3RhdGlvbiQxLFxyXG5cdFx0ZnJvbVNjYWxpbmc6IGZyb21TY2FsaW5nJDEsXHJcblx0XHRmcm9tVHJhbnNsYXRpb246IGZyb21UcmFuc2xhdGlvbixcclxuXHRcdHN0cjogc3RyJDEsXHJcblx0XHRmcm9iOiBmcm9iJDEsXHJcblx0XHRhZGQ6IGFkZCQxLFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0JDEsXHJcblx0XHRtdWx0aXBseVNjYWxhcjogbXVsdGlwbHlTY2FsYXIkMSxcclxuXHRcdG11bHRpcGx5U2NhbGFyQW5kQWRkOiBtdWx0aXBseVNjYWxhckFuZEFkZCQxLFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDEsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQyLFxyXG5cdFx0bXVsOiBtdWwkMSxcclxuXHRcdHN1Yjogc3ViJDEsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogM3gzIE1hdHJpeFxyXG5cdCAqIEBtb2R1bGUgbWF0M1xyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQyKCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDkpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0XHRvdXRbM10gPSAwXHJcblx0XHRcdG91dFs1XSA9IDBcclxuXHRcdFx0b3V0WzZdID0gMFxyXG5cdFx0XHRvdXRbN10gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzRdID0gMVxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3BpZXMgdGhlIHVwcGVyLWxlZnQgM3gzIHZhbHVlcyBpbnRvIHRoZSBnaXZlbiBtYXQzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyAzeDMgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhICAgdGhlIHNvdXJjZSA0eDQgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tTWF0NChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbNF1cclxuXHRcdG91dFs0XSA9IGFbNV1cclxuXHRcdG91dFs1XSA9IGFbNl1cclxuXHRcdG91dFs2XSA9IGFbOF1cclxuXHRcdG91dFs3XSA9IGFbOV1cclxuXHRcdG91dFs4XSA9IGFbMTBdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDIoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDkpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIG5ldyBtYXQzIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXHJcblx0ICogQHJldHVybnMge21hdDN9IEEgbmV3IG1hdDNcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyQyKG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg5KVxyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0wMlxyXG5cdFx0b3V0WzNdID0gbTEwXHJcblx0XHRvdXRbNF0gPSBtMTFcclxuXHRcdG91dFs1XSA9IG0xMlxyXG5cdFx0b3V0WzZdID0gbTIwXHJcblx0XHRvdXRbN10gPSBtMjFcclxuXHRcdG91dFs4XSA9IG0yMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkMihvdXQsIG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcclxuXHRcdG91dFswXSA9IG0wMFxyXG5cdFx0b3V0WzFdID0gbTAxXHJcblx0XHRvdXRbMl0gPSBtMDJcclxuXHRcdG91dFszXSA9IG0xMFxyXG5cdFx0b3V0WzRdID0gbTExXHJcblx0XHRvdXRbNV0gPSBtMTJcclxuXHRcdG91dFs2XSA9IG0yMFxyXG5cdFx0b3V0WzddID0gbTIxXHJcblx0XHRvdXRbOF0gPSBtMjJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkkMihvdXQpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDFcclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNwb3NlJDEob3V0LCBhKSB7XHJcblx0XHQvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXHJcblx0XHRpZiAob3V0ID09PSBhKSB7XHJcblx0XHRcdHZhciBhMDEgPSBhWzFdLFxyXG5cdFx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdFx0YTEyID0gYVs1XVxyXG5cdFx0XHRvdXRbMV0gPSBhWzNdXHJcblx0XHRcdG91dFsyXSA9IGFbNl1cclxuXHRcdFx0b3V0WzNdID0gYTAxXHJcblx0XHRcdG91dFs1XSA9IGFbN11cclxuXHRcdFx0b3V0WzZdID0gYTAyXHJcblx0XHRcdG91dFs3XSA9IGExMlxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0XHRvdXRbMV0gPSBhWzNdXHJcblx0XHRcdG91dFsyXSA9IGFbNl1cclxuXHRcdFx0b3V0WzNdID0gYVsxXVxyXG5cdFx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRcdG91dFs1XSA9IGFbN11cclxuXHRcdFx0b3V0WzZdID0gYVsyXVxyXG5cdFx0XHRvdXRbN10gPSBhWzVdXHJcblx0XHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEludmVydHMgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJ0JDIob3V0LCBhKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXVxyXG5cdFx0dmFyIGExMCA9IGFbM10sXHJcblx0XHRcdGExMSA9IGFbNF0sXHJcblx0XHRcdGExMiA9IGFbNV1cclxuXHRcdHZhciBhMjAgPSBhWzZdLFxyXG5cdFx0XHRhMjEgPSBhWzddLFxyXG5cdFx0XHRhMjIgPSBhWzhdXHJcblx0XHR2YXIgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxXHJcblx0XHR2YXIgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMFxyXG5cdFx0dmFyIGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMCAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblxyXG5cdFx0dmFyIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMVxyXG5cclxuXHRcdGlmICghZGV0KSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0ZGV0ID0gMS4wIC8gZGV0XHJcblx0XHRvdXRbMF0gPSBiMDEgKiBkZXRcclxuXHRcdG91dFsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldFxyXG5cdFx0b3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXRcclxuXHRcdG91dFszXSA9IGIxMSAqIGRldFxyXG5cdFx0b3V0WzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXRcclxuXHRcdG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldFxyXG5cdFx0b3V0WzZdID0gYjIxICogZGV0XHJcblx0XHRvdXRbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXRcclxuXHRcdG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0M1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkam9pbnQkMShvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTEwID0gYVszXSxcclxuXHRcdFx0YTExID0gYVs0XSxcclxuXHRcdFx0YTEyID0gYVs1XVxyXG5cdFx0dmFyIGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF1cclxuXHRcdG91dFswXSA9IGExMSAqIGEyMiAtIGExMiAqIGEyMVxyXG5cdFx0b3V0WzFdID0gYTAyICogYTIxIC0gYTAxICogYTIyXHJcblx0XHRvdXRbMl0gPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTFcclxuXHRcdG91dFszXSA9IGExMiAqIGEyMCAtIGExMCAqIGEyMlxyXG5cdFx0b3V0WzRdID0gYTAwICogYTIyIC0gYTAyICogYTIwXHJcblx0XHRvdXRbNV0gPSBhMDIgKiBhMTAgLSBhMDAgKiBhMTJcclxuXHRcdG91dFs2XSA9IGExMCAqIGEyMSAtIGExMSAqIGEyMFxyXG5cdFx0b3V0WzddID0gYTAxICogYTIwIC0gYTAwICogYTIxXHJcblx0XHRvdXRbOF0gPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRldGVybWluYW50JDIoYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMTAgPSBhWzNdLFxyXG5cdFx0XHRhMTEgPSBhWzRdLFxyXG5cdFx0XHRhMTIgPSBhWzVdXHJcblx0XHR2YXIgYTIwID0gYVs2XSxcclxuXHRcdFx0YTIxID0gYVs3XSxcclxuXHRcdFx0YTIyID0gYVs4XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0YTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBtYXQzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkMihvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTEwID0gYVszXSxcclxuXHRcdFx0YTExID0gYVs0XSxcclxuXHRcdFx0YTEyID0gYVs1XVxyXG5cdFx0dmFyIGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF1cclxuXHRcdHZhciBiMDAgPSBiWzBdLFxyXG5cdFx0XHRiMDEgPSBiWzFdLFxyXG5cdFx0XHRiMDIgPSBiWzJdXHJcblx0XHR2YXIgYjEwID0gYlszXSxcclxuXHRcdFx0YjExID0gYls0XSxcclxuXHRcdFx0YjEyID0gYls1XVxyXG5cdFx0dmFyIGIyMCA9IGJbNl0sXHJcblx0XHRcdGIyMSA9IGJbN10sXHJcblx0XHRcdGIyMiA9IGJbOF1cclxuXHRcdG91dFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMFxyXG5cdFx0b3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxXHJcblx0XHRvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjJcclxuXHRcdG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMFxyXG5cdFx0b3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxXHJcblx0XHRvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjJcclxuXHRcdG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMFxyXG5cdFx0b3V0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxXHJcblx0XHRvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNsYXRlIGEgbWF0MyBieSB0aGUgZ2l2ZW4gdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2xhdGUkMShvdXQsIGEsIHYpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMTAgPSBhWzNdLFxyXG5cdFx0XHRhMTEgPSBhWzRdLFxyXG5cdFx0XHRhMTIgPSBhWzVdLFxyXG5cdFx0XHRhMjAgPSBhWzZdLFxyXG5cdFx0XHRhMjEgPSBhWzddLFxyXG5cdFx0XHRhMjIgPSBhWzhdLFxyXG5cdFx0XHR4ID0gdlswXSxcclxuXHRcdFx0eSA9IHZbMV1cclxuXHRcdG91dFswXSA9IGEwMFxyXG5cdFx0b3V0WzFdID0gYTAxXHJcblx0XHRvdXRbMl0gPSBhMDJcclxuXHRcdG91dFszXSA9IGExMFxyXG5cdFx0b3V0WzRdID0gYTExXHJcblx0XHRvdXRbNV0gPSBhMTJcclxuXHRcdG91dFs2XSA9IHggKiBhMDAgKyB5ICogYTEwICsgYTIwXHJcblx0XHRvdXRbN10gPSB4ICogYTAxICsgeSAqIGExMSArIGEyMVxyXG5cdFx0b3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGUkMihvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGExMCA9IGFbM10sXHJcblx0XHRcdGExMSA9IGFbNF0sXHJcblx0XHRcdGExMiA9IGFbNV0sXHJcblx0XHRcdGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF0sXHJcblx0XHRcdHMgPSBNYXRoLnNpbihyYWQpLFxyXG5cdFx0XHRjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTBcclxuXHRcdG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExXHJcblx0XHRvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMlxyXG5cdFx0b3V0WzNdID0gYyAqIGExMCAtIHMgKiBhMDBcclxuXHRcdG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxXHJcblx0XHRvdXRbNV0gPSBjICogYTEyIC0gcyAqIGEwMlxyXG5cdFx0b3V0WzZdID0gYTIwXHJcblx0XHRvdXRbN10gPSBhMjFcclxuXHRcdG91dFs4XSA9IGEyMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTY2FsZXMgdGhlIG1hdDMgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQyKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIHggPSB2WzBdLFxyXG5cdFx0XHR5ID0gdlsxXVxyXG5cdFx0b3V0WzBdID0geCAqIGFbMF1cclxuXHRcdG91dFsxXSA9IHggKiBhWzFdXHJcblx0XHRvdXRbMl0gPSB4ICogYVsyXVxyXG5cdFx0b3V0WzNdID0geSAqIGFbM11cclxuXHRcdG91dFs0XSA9IHkgKiBhWzRdXHJcblx0XHRvdXRbNV0gPSB5ICogYVs1XVxyXG5cdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQzLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQzLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbiQxKG91dCwgdikge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMVxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gdlswXVxyXG5cdFx0b3V0WzddID0gdlsxXVxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDMucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvbiQyKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSBzXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAtc1xyXG5cdFx0b3V0WzRdID0gY1xyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDMuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgU2NhbGluZyB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21TY2FsaW5nJDIob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSB2WzBdXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSB2WzFdXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcGllcyB0aGUgdmFsdWVzIGZyb20gYSBtYXQyZCBpbnRvIGEgbWF0M1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gY29weVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21NYXQyZChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IGFbMl1cclxuXHRcdG91dFs0XSA9IGFbM11cclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdG91dFs2XSA9IGFbNF1cclxuXHRcdG91dFs3XSA9IGFbNV1cclxuXHRcdG91dFs4XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyBhIDN4MyBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcclxuXHRcdHZhciB4ID0gcVswXSxcclxuXHRcdFx0eSA9IHFbMV0sXHJcblx0XHRcdHogPSBxWzJdLFxyXG5cdFx0XHR3ID0gcVszXVxyXG5cdFx0dmFyIHgyID0geCArIHhcclxuXHRcdHZhciB5MiA9IHkgKyB5XHJcblx0XHR2YXIgejIgPSB6ICsgelxyXG5cdFx0dmFyIHh4ID0geCAqIHgyXHJcblx0XHR2YXIgeXggPSB5ICogeDJcclxuXHRcdHZhciB5eSA9IHkgKiB5MlxyXG5cdFx0dmFyIHp4ID0geiAqIHgyXHJcblx0XHR2YXIgenkgPSB6ICogeTJcclxuXHRcdHZhciB6eiA9IHogKiB6MlxyXG5cdFx0dmFyIHd4ID0gdyAqIHgyXHJcblx0XHR2YXIgd3kgPSB3ICogeTJcclxuXHRcdHZhciB3eiA9IHcgKiB6MlxyXG5cdFx0b3V0WzBdID0gMSAtIHl5IC0genpcclxuXHRcdG91dFszXSA9IHl4IC0gd3pcclxuXHRcdG91dFs2XSA9IHp4ICsgd3lcclxuXHRcdG91dFsxXSA9IHl4ICsgd3pcclxuXHRcdG91dFs0XSA9IDEgLSB4eCAtIHp6XHJcblx0XHRvdXRbN10gPSB6eSAtIHd4XHJcblx0XHRvdXRbMl0gPSB6eCAtIHd5XHJcblx0XHRvdXRbNV0gPSB6eSArIHd4XHJcblx0XHRvdXRbOF0gPSAxIC0geHggLSB5eVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIGEgM3gzIG5vcm1hbCBtYXRyaXggKHRyYW5zcG9zZSBpbnZlcnNlKSBmcm9tIHRoZSA0eDQgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIE1hdDQgdG8gZGVyaXZlIHRoZSBub3JtYWwgbWF0cml4IGZyb21cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbm9ybWFsRnJvbU1hdDQob3V0LCBhKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0YTAzID0gYVszXVxyXG5cdFx0dmFyIGExMCA9IGFbNF0sXHJcblx0XHRcdGExMSA9IGFbNV0sXHJcblx0XHRcdGExMiA9IGFbNl0sXHJcblx0XHRcdGExMyA9IGFbN11cclxuXHRcdHZhciBhMjAgPSBhWzhdLFxyXG5cdFx0XHRhMjEgPSBhWzldLFxyXG5cdFx0XHRhMjIgPSBhWzEwXSxcclxuXHRcdFx0YTIzID0gYVsxMV1cclxuXHRcdHZhciBhMzAgPSBhWzEyXSxcclxuXHRcdFx0YTMxID0gYVsxM10sXHJcblx0XHRcdGEzMiA9IGFbMTRdLFxyXG5cdFx0XHRhMzMgPSBhWzE1XVxyXG5cdFx0dmFyIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMFxyXG5cdFx0dmFyIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMFxyXG5cdFx0dmFyIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMFxyXG5cdFx0dmFyIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMVxyXG5cdFx0dmFyIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMVxyXG5cdFx0dmFyIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMlxyXG5cdFx0dmFyIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMFxyXG5cdFx0dmFyIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMFxyXG5cdFx0dmFyIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMFxyXG5cdFx0dmFyIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMVxyXG5cdFx0dmFyIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMVxyXG5cdFx0dmFyIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMiAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblxyXG5cdFx0dmFyIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNlxyXG5cclxuXHRcdGlmICghZGV0KSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0ZGV0ID0gMS4wIC8gZGV0XHJcblx0XHRvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldFxyXG5cdFx0b3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXRcclxuXHRcdG91dFsyXSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0XHJcblx0XHRvdXRbM10gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldFxyXG5cdFx0b3V0WzRdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXRcclxuXHRcdG91dFs1XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0XHJcblx0XHRvdXRbNl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldFxyXG5cdFx0b3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXRcclxuXHRcdG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIDJEIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB5b3VyIGdsIGNvbnRleHRcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBnbCBjb250ZXh0XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBwcm9qZWN0aW9uKG91dCwgd2lkdGgsIGhlaWdodCkge1xyXG5cdFx0b3V0WzBdID0gMiAvIHdpZHRoXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAtMiAvIGhlaWdodFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gLTFcclxuXHRcdG91dFs3XSA9IDFcclxuXHRcdG91dFs4XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDIoYSkge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0J21hdDMoJyArXHJcblx0XHRcdGFbMF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzJdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbM10gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs0XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzVdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs3XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzhdICtcclxuXHRcdFx0JyknXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9iJDIoYSkge1xyXG5cdFx0cmV0dXJuIE1hdGguc3FydChcclxuXHRcdFx0TWF0aC5wb3coYVswXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzJdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVszXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzVdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs2XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbN10sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzhdLCAyKSxcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0MydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XVxyXG5cdFx0b3V0WzZdID0gYVs2XSArIGJbNl1cclxuXHRcdG91dFs3XSA9IGFbN10gKyBiWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdICsgYls4XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdWJ0cmFjdCQyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAtIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC0gYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAtIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gLSBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdIC0gYls1XVxyXG5cdFx0b3V0WzZdID0gYVs2XSAtIGJbNl1cclxuXHRcdG91dFs3XSA9IGFbN10gLSBiWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdIC0gYls4XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseVNjYWxhciQyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJcclxuXHRcdG91dFs0XSA9IGFbNF0gKiBiXHJcblx0XHRvdXRbNV0gPSBhWzVdICogYlxyXG5cdFx0b3V0WzZdID0gYVs2XSAqIGJcclxuXHRcdG91dFs3XSA9IGFbN10gKiBiXHJcblx0XHRvdXRbOF0gPSBhWzhdICogYlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQzJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZCQyKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGVcclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGVcclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdICogc2NhbGVcclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdICogc2NhbGVcclxuXHRcdG91dFs2XSA9IGFbNl0gKyBiWzZdICogc2NhbGVcclxuXHRcdG91dFs3XSA9IGFbN10gKyBiWzddICogc2NhbGVcclxuXHRcdG91dFs4XSA9IGFbOF0gKyBiWzhdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkMihhLCBiKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRhWzBdID09PSBiWzBdICYmXHJcblx0XHRcdGFbMV0gPT09IGJbMV0gJiZcclxuXHRcdFx0YVsyXSA9PT0gYlsyXSAmJlxyXG5cdFx0XHRhWzNdID09PSBiWzNdICYmXHJcblx0XHRcdGFbNF0gPT09IGJbNF0gJiZcclxuXHRcdFx0YVs1XSA9PT0gYls1XSAmJlxyXG5cdFx0XHRhWzZdID09PSBiWzZdICYmXHJcblx0XHRcdGFbN10gPT09IGJbN10gJiZcclxuXHRcdFx0YVs4XSA9PT0gYls4XVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBlcXVhbHMkMyhhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XSxcclxuXHRcdFx0YTYgPSBhWzZdLFxyXG5cdFx0XHRhNyA9IGFbN10sXHJcblx0XHRcdGE4ID0gYVs4XVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXSxcclxuXHRcdFx0YjQgPSBiWzRdLFxyXG5cdFx0XHRiNSA9IGJbNV0sXHJcblx0XHRcdGI2ID0gYls2XSxcclxuXHRcdFx0YjcgPSBiWzddLFxyXG5cdFx0XHRiOCA9IGJbOF1cclxuXHRcdHJldHVybiAoXHJcblx0XHRcdE1hdGguYWJzKGEwIC0gYjApIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMSAtIGIxKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTIgLSBiMikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcblx0XHRcdE1hdGguYWJzKGEzIC0gYjMpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNCAtIGI0KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTUgLSBiNSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE2IC0gYjYpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNyAtIGI3KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTggLSBiOCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTgpLCBNYXRoLmFicyhiOCkpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQyID0gbXVsdGlwbHkkMlxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQyID0gc3VidHJhY3QkMlxyXG5cclxuXHR2YXIgbWF0MyA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQyLFxyXG5cdFx0ZnJvbU1hdDQ6IGZyb21NYXQ0LFxyXG5cdFx0Y2xvbmU6IGNsb25lJDIsXHJcblx0XHRjb3B5OiBjb3B5JDIsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDIsXHJcblx0XHRzZXQ6IHNldCQyLFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5JDIsXHJcblx0XHR0cmFuc3Bvc2U6IHRyYW5zcG9zZSQxLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkMixcclxuXHRcdGFkam9pbnQ6IGFkam9pbnQkMSxcclxuXHRcdGRldGVybWluYW50OiBkZXRlcm1pbmFudCQyLFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDIsXHJcblx0XHR0cmFuc2xhdGU6IHRyYW5zbGF0ZSQxLFxyXG5cdFx0cm90YXRlOiByb3RhdGUkMixcclxuXHRcdHNjYWxlOiBzY2FsZSQyLFxyXG5cdFx0ZnJvbVRyYW5zbGF0aW9uOiBmcm9tVHJhbnNsYXRpb24kMSxcclxuXHRcdGZyb21Sb3RhdGlvbjogZnJvbVJvdGF0aW9uJDIsXHJcblx0XHRmcm9tU2NhbGluZzogZnJvbVNjYWxpbmckMixcclxuXHRcdGZyb21NYXQyZDogZnJvbU1hdDJkLFxyXG5cdFx0ZnJvbVF1YXQ6IGZyb21RdWF0LFxyXG5cdFx0bm9ybWFsRnJvbU1hdDQ6IG5vcm1hbEZyb21NYXQ0LFxyXG5cdFx0cHJvamVjdGlvbjogcHJvamVjdGlvbixcclxuXHRcdHN0cjogc3RyJDIsXHJcblx0XHRmcm9iOiBmcm9iJDIsXHJcblx0XHRhZGQ6IGFkZCQyLFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0JDIsXHJcblx0XHRtdWx0aXBseVNjYWxhcjogbXVsdGlwbHlTY2FsYXIkMixcclxuXHRcdG11bHRpcGx5U2NhbGFyQW5kQWRkOiBtdWx0aXBseVNjYWxhckFuZEFkZCQyLFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDIsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQzLFxyXG5cdFx0bXVsOiBtdWwkMixcclxuXHRcdHN1Yjogc3ViJDIsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogNHg0IE1hdHJpeDxicj5Gb3JtYXQ6IGNvbHVtbi1tYWpvciwgd2hlbiB0eXBlZCBvdXQgaXQgbG9va3MgbGlrZSByb3ctbWFqb3I8YnI+VGhlIG1hdHJpY2VzIGFyZSBiZWluZyBwb3N0IG11bHRpcGxpZWQuXHJcblx0ICogQG1vZHVsZSBtYXQ0XHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0NFxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDMoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMTYpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0XHRvdXRbM10gPSAwXHJcblx0XHRcdG91dFs0XSA9IDBcclxuXHRcdFx0b3V0WzZdID0gMFxyXG5cdFx0XHRvdXRbN10gPSAwXHJcblx0XHRcdG91dFs4XSA9IDBcclxuXHRcdFx0b3V0WzldID0gMFxyXG5cdFx0XHRvdXRbMTFdID0gMFxyXG5cdFx0XHRvdXRbMTJdID0gMFxyXG5cdFx0XHRvdXRbMTNdID0gMFxyXG5cdFx0XHRvdXRbMTRdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFs1XSA9IDFcclxuXHRcdG91dFsxMF0gPSAxXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IG1hdDQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjbG9uZSQzKGEpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgxNilcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdG91dFs2XSA9IGFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdG91dFs5XSA9IGFbOV1cclxuXHRcdG91dFsxMF0gPSBhWzEwXVxyXG5cdFx0b3V0WzExXSA9IGFbMTFdXHJcblx0XHRvdXRbMTJdID0gYVsxMl1cclxuXHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRvdXRbMTVdID0gYVsxNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkMyhvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdG91dFs2XSA9IGFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdG91dFs5XSA9IGFbOV1cclxuXHRcdG91dFsxMF0gPSBhWzEwXVxyXG5cdFx0b3V0WzExXSA9IGFbMTFdXHJcblx0XHRvdXRbMTJdID0gYVsxMl1cclxuXHRcdG91dFsxM10gPSBhWzEzXVxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRvdXRbMTVdID0gYVsxNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgbmV3IG1hdDQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMyBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAzIHBvc2l0aW9uIChpbmRleCA3KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggOClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIzIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDMgcG9zaXRpb24gKGluZGV4IDExKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMSBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxMylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMyIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDIgcG9zaXRpb24gKGluZGV4IDE0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXHJcblx0ICogQHJldHVybnMge21hdDR9IEEgbmV3IG1hdDRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyQzKFxyXG5cdFx0bTAwLFxyXG5cdFx0bTAxLFxyXG5cdFx0bTAyLFxyXG5cdFx0bTAzLFxyXG5cdFx0bTEwLFxyXG5cdFx0bTExLFxyXG5cdFx0bTEyLFxyXG5cdFx0bTEzLFxyXG5cdFx0bTIwLFxyXG5cdFx0bTIxLFxyXG5cdFx0bTIyLFxyXG5cdFx0bTIzLFxyXG5cdFx0bTMwLFxyXG5cdFx0bTMxLFxyXG5cdFx0bTMyLFxyXG5cdFx0bTMzLFxyXG5cdCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDE2KVxyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0wMlxyXG5cdFx0b3V0WzNdID0gbTAzXHJcblx0XHRvdXRbNF0gPSBtMTBcclxuXHRcdG91dFs1XSA9IG0xMVxyXG5cdFx0b3V0WzZdID0gbTEyXHJcblx0XHRvdXRbN10gPSBtMTNcclxuXHRcdG91dFs4XSA9IG0yMFxyXG5cdFx0b3V0WzldID0gbTIxXHJcblx0XHRvdXRbMTBdID0gbTIyXHJcblx0XHRvdXRbMTFdID0gbTIzXHJcblx0XHRvdXRbMTJdID0gbTMwXHJcblx0XHRvdXRbMTNdID0gbTMxXHJcblx0XHRvdXRbMTRdID0gbTMyXHJcblx0XHRvdXRbMTVdID0gbTMzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMyBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAzIHBvc2l0aW9uIChpbmRleCA3KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggOClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIzIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDMgcG9zaXRpb24gKGluZGV4IDExKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMSBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxMylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMyIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDIgcG9zaXRpb24gKGluZGV4IDE0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkMyhcclxuXHRcdG91dCxcclxuXHRcdG0wMCxcclxuXHRcdG0wMSxcclxuXHRcdG0wMixcclxuXHRcdG0wMyxcclxuXHRcdG0xMCxcclxuXHRcdG0xMSxcclxuXHRcdG0xMixcclxuXHRcdG0xMyxcclxuXHRcdG0yMCxcclxuXHRcdG0yMSxcclxuXHRcdG0yMixcclxuXHRcdG0yMyxcclxuXHRcdG0zMCxcclxuXHRcdG0zMSxcclxuXHRcdG0zMixcclxuXHRcdG0zMyxcclxuXHQpIHtcclxuXHRcdG91dFswXSA9IG0wMFxyXG5cdFx0b3V0WzFdID0gbTAxXHJcblx0XHRvdXRbMl0gPSBtMDJcclxuXHRcdG91dFszXSA9IG0wM1xyXG5cdFx0b3V0WzRdID0gbTEwXHJcblx0XHRvdXRbNV0gPSBtMTFcclxuXHRcdG91dFs2XSA9IG0xMlxyXG5cdFx0b3V0WzddID0gbTEzXHJcblx0XHRvdXRbOF0gPSBtMjBcclxuXHRcdG91dFs5XSA9IG0yMVxyXG5cdFx0b3V0WzEwXSA9IG0yMlxyXG5cdFx0b3V0WzExXSA9IG0yM1xyXG5cdFx0b3V0WzEyXSA9IG0zMFxyXG5cdFx0b3V0WzEzXSA9IG0zMVxyXG5cdFx0b3V0WzE0XSA9IG0zMlxyXG5cdFx0b3V0WzE1XSA9IG0zM1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQzKG91dCkge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMVxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzEwXSA9IDFcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc3Bvc2UkMihvdXQsIGEpIHtcclxuXHRcdC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcclxuXHRcdGlmIChvdXQgPT09IGEpIHtcclxuXHRcdFx0dmFyIGEwMSA9IGFbMV0sXHJcblx0XHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0XHRhMDMgPSBhWzNdXHJcblx0XHRcdHZhciBhMTIgPSBhWzZdLFxyXG5cdFx0XHRcdGExMyA9IGFbN11cclxuXHRcdFx0dmFyIGEyMyA9IGFbMTFdXHJcblx0XHRcdG91dFsxXSA9IGFbNF1cclxuXHRcdFx0b3V0WzJdID0gYVs4XVxyXG5cdFx0XHRvdXRbM10gPSBhWzEyXVxyXG5cdFx0XHRvdXRbNF0gPSBhMDFcclxuXHRcdFx0b3V0WzZdID0gYVs5XVxyXG5cdFx0XHRvdXRbN10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbOF0gPSBhMDJcclxuXHRcdFx0b3V0WzldID0gYTEyXHJcblx0XHRcdG91dFsxMV0gPSBhWzE0XVxyXG5cdFx0XHRvdXRbMTJdID0gYTAzXHJcblx0XHRcdG91dFsxM10gPSBhMTNcclxuXHRcdFx0b3V0WzE0XSA9IGEyM1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0XHRvdXRbMV0gPSBhWzRdXHJcblx0XHRcdG91dFsyXSA9IGFbOF1cclxuXHRcdFx0b3V0WzNdID0gYVsxMl1cclxuXHRcdFx0b3V0WzRdID0gYVsxXVxyXG5cdFx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRcdG91dFs2XSA9IGFbOV1cclxuXHRcdFx0b3V0WzddID0gYVsxM11cclxuXHRcdFx0b3V0WzhdID0gYVsyXVxyXG5cdFx0XHRvdXRbOV0gPSBhWzZdXHJcblx0XHRcdG91dFsxMF0gPSBhWzEwXVxyXG5cdFx0XHRvdXRbMTFdID0gYVsxNF1cclxuXHRcdFx0b3V0WzEyXSA9IGFbM11cclxuXHRcdFx0b3V0WzEzXSA9IGFbN11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTFdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogSW52ZXJ0cyBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQkMyhvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XSxcclxuXHRcdFx0YTExID0gYVs1XSxcclxuXHRcdFx0YTEyID0gYVs2XSxcclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF0sXHJcblx0XHRcdGEyMSA9IGFbOV0sXHJcblx0XHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0dmFyIGEzMCA9IGFbMTJdLFxyXG5cdFx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdFx0YTMyID0gYVsxNF0sXHJcblx0XHRcdGEzMyA9IGFbMTVdXHJcblx0XHR2YXIgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwXHJcblx0XHR2YXIgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwXHJcblx0XHR2YXIgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwXHJcblx0XHR2YXIgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExXHJcblx0XHR2YXIgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExXHJcblx0XHR2YXIgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyXHJcblx0XHR2YXIgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwXHJcblx0XHR2YXIgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwXHJcblx0XHR2YXIgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwXHJcblx0XHR2YXIgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxXHJcblx0XHR2YXIgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxXHJcblx0XHR2YXIgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuXHJcblx0XHR2YXIgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2XHJcblxyXG5cdFx0aWYgKCFkZXQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRkZXQgPSAxLjAgLyBkZXRcclxuXHRcdG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0XHJcblx0XHRvdXRbMV0gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldFxyXG5cdFx0b3V0WzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXRcclxuXHRcdG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0XHJcblx0XHRvdXRbNF0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldFxyXG5cdFx0b3V0WzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXRcclxuXHRcdG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0XHJcblx0XHRvdXRbN10gPSAoYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxKSAqIGRldFxyXG5cdFx0b3V0WzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXRcclxuXHRcdG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0XHJcblx0XHRvdXRbMTBdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXRcclxuXHRcdG91dFsxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldFxyXG5cdFx0b3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0XHJcblx0XHRvdXRbMTNdID0gKGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNikgKiBkZXRcclxuXHRcdG91dFsxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldFxyXG5cdFx0b3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkam9pbnQkMihvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XSxcclxuXHRcdFx0YTExID0gYVs1XSxcclxuXHRcdFx0YTEyID0gYVs2XSxcclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF0sXHJcblx0XHRcdGEyMSA9IGFbOV0sXHJcblx0XHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0dmFyIGEzMCA9IGFbMTJdLFxyXG5cdFx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdFx0YTMyID0gYVsxNF0sXHJcblx0XHRcdGEzMyA9IGFbMTVdXHJcblx0XHRvdXRbMF0gPVxyXG5cdFx0XHRhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMilcclxuXHRcdG91dFsxXSA9IC0oXHJcblx0XHRcdGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC1cclxuXHRcdFx0YTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgK1xyXG5cdFx0XHRhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzJdID1cclxuXHRcdFx0YTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpXHJcblx0XHRvdXRbM10gPSAtKFxyXG5cdFx0XHRhMDEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtXHJcblx0XHRcdGExMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICtcclxuXHRcdFx0YTIxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMilcclxuXHRcdClcclxuXHRcdG91dFs0XSA9IC0oXHJcblx0XHRcdGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC1cclxuXHRcdFx0YTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgK1xyXG5cdFx0XHRhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzVdID1cclxuXHRcdFx0YTAwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpXHJcblx0XHRvdXRbNl0gPSAtKFxyXG5cdFx0XHRhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtXHJcblx0XHRcdGExMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICtcclxuXHRcdFx0YTMwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMilcclxuXHRcdClcclxuXHRcdG91dFs3XSA9XHJcblx0XHRcdGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKVxyXG5cdFx0b3V0WzhdID1cclxuXHRcdFx0YTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpXHJcblx0XHRvdXRbOV0gPSAtKFxyXG5cdFx0XHRhMDAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtXHJcblx0XHRcdGEyMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICtcclxuXHRcdFx0YTMwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSlcclxuXHRcdClcclxuXHRcdG91dFsxMF0gPVxyXG5cdFx0XHRhMDAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSlcclxuXHRcdG91dFsxMV0gPSAtKFxyXG5cdFx0XHRhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtXHJcblx0XHRcdGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICtcclxuXHRcdFx0YTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSlcclxuXHRcdClcclxuXHRcdG91dFsxMl0gPSAtKFxyXG5cdFx0XHRhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtXHJcblx0XHRcdGEyMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpICtcclxuXHRcdFx0YTMwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSlcclxuXHRcdClcclxuXHRcdG91dFsxM10gPVxyXG5cdFx0XHRhMDAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSlcclxuXHRcdG91dFsxNF0gPSAtKFxyXG5cdFx0XHRhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtXHJcblx0XHRcdGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICtcclxuXHRcdFx0YTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSlcclxuXHRcdClcclxuXHRcdG91dFsxNV0gPVxyXG5cdFx0XHRhMDAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRldGVybWluYW50JDMoYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdHZhciBhMTAgPSBhWzRdLFxyXG5cdFx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0XHRhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XSxcclxuXHRcdFx0YTIxID0gYVs5XSxcclxuXHRcdFx0YTIyID0gYVsxMF0sXHJcblx0XHRcdGEyMyA9IGFbMTFdXHJcblx0XHR2YXIgYTMwID0gYVsxMl0sXHJcblx0XHRcdGEzMSA9IGFbMTNdLFxyXG5cdFx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdFx0YTMzID0gYVsxNV1cclxuXHRcdHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTBcclxuXHRcdHZhciBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTBcclxuXHRcdHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTBcclxuXHRcdHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTFcclxuXHRcdHZhciBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTFcclxuXHRcdHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTJcclxuXHRcdHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzBcclxuXHRcdHZhciBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzBcclxuXHRcdHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzBcclxuXHRcdHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzFcclxuXHRcdHZhciBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzFcclxuXHRcdHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG5cclxuXHRcdHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDZcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gbWF0NHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkMyhvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XSxcclxuXHRcdFx0YTExID0gYVs1XSxcclxuXHRcdFx0YTEyID0gYVs2XSxcclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF0sXHJcblx0XHRcdGEyMSA9IGFbOV0sXHJcblx0XHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0dmFyIGEzMCA9IGFbMTJdLFxyXG5cdFx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdFx0YTMyID0gYVsxNF0sXHJcblx0XHRcdGEzMyA9IGFbMTVdIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxyXG5cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM11cclxuXHRcdG91dFswXSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwXHJcblx0XHRvdXRbMV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMVxyXG5cdFx0b3V0WzJdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzJcclxuXHRcdG91dFszXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzXHJcblx0XHRiMCA9IGJbNF1cclxuXHRcdGIxID0gYls1XVxyXG5cdFx0YjIgPSBiWzZdXHJcblx0XHRiMyA9IGJbN11cclxuXHRcdG91dFs0XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwXHJcblx0XHRvdXRbNV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMVxyXG5cdFx0b3V0WzZdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzJcclxuXHRcdG91dFs3XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzXHJcblx0XHRiMCA9IGJbOF1cclxuXHRcdGIxID0gYls5XVxyXG5cdFx0YjIgPSBiWzEwXVxyXG5cdFx0YjMgPSBiWzExXVxyXG5cdFx0b3V0WzhdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzBcclxuXHRcdG91dFs5XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxXHJcblx0XHRvdXRbMTBdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzJcclxuXHRcdG91dFsxMV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzM1xyXG5cdFx0YjAgPSBiWzEyXVxyXG5cdFx0YjEgPSBiWzEzXVxyXG5cdFx0YjIgPSBiWzE0XVxyXG5cdFx0YjMgPSBiWzE1XVxyXG5cdFx0b3V0WzEyXSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwXHJcblx0XHRvdXRbMTNdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzFcclxuXHRcdG91dFsxNF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMlxyXG5cdFx0b3V0WzE1XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNsYXRlJDIob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgeCA9IHZbMF0sXHJcblx0XHRcdHkgPSB2WzFdLFxyXG5cdFx0XHR6ID0gdlsyXVxyXG5cdFx0dmFyIGEwMCwgYTAxLCBhMDIsIGEwM1xyXG5cdFx0dmFyIGExMCwgYTExLCBhMTIsIGExM1xyXG5cdFx0dmFyIGEyMCwgYTIxLCBhMjIsIGEyM1xyXG5cclxuXHRcdGlmIChhID09PSBvdXQpIHtcclxuXHRcdFx0b3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzFdICogeCArIGFbNV0gKiB5ICsgYVs5XSAqIHogKyBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsyXSAqIHggKyBhWzZdICogeSArIGFbMTBdICogeiArIGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGEwMCA9IGFbMF1cclxuXHRcdFx0YTAxID0gYVsxXVxyXG5cdFx0XHRhMDIgPSBhWzJdXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdFx0YTEwID0gYVs0XVxyXG5cdFx0XHRhMTEgPSBhWzVdXHJcblx0XHRcdGExMiA9IGFbNl1cclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0XHRhMjAgPSBhWzhdXHJcblx0XHRcdGEyMSA9IGFbOV1cclxuXHRcdFx0YTIyID0gYVsxMF1cclxuXHRcdFx0YTIzID0gYVsxMV1cclxuXHRcdFx0b3V0WzBdID0gYTAwXHJcblx0XHRcdG91dFsxXSA9IGEwMVxyXG5cdFx0XHRvdXRbMl0gPSBhMDJcclxuXHRcdFx0b3V0WzNdID0gYTAzXHJcblx0XHRcdG91dFs0XSA9IGExMFxyXG5cdFx0XHRvdXRbNV0gPSBhMTFcclxuXHRcdFx0b3V0WzZdID0gYTEyXHJcblx0XHRcdG91dFs3XSA9IGExM1xyXG5cdFx0XHRvdXRbOF0gPSBhMjBcclxuXHRcdFx0b3V0WzldID0gYTIxXHJcblx0XHRcdG91dFsxMF0gPSBhMjJcclxuXHRcdFx0b3V0WzExXSA9IGEyM1xyXG5cdFx0XHRvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl1cclxuXHRcdFx0b3V0WzEzXSA9IGEwMSAqIHggKyBhMTEgKiB5ICsgYTIxICogeiArIGFbMTNdXHJcblx0XHRcdG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XVxyXG5cdFx0XHRvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyB0aGUgbWF0NCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMyBub3QgdXNpbmcgdmVjdG9yaXphdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdiB0aGUgdmVjMyB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUkMyhvdXQsIGEsIHYpIHtcclxuXHRcdHZhciB4ID0gdlswXSxcclxuXHRcdFx0eSA9IHZbMV0sXHJcblx0XHRcdHogPSB2WzJdXHJcblx0XHRvdXRbMF0gPSBhWzBdICogeFxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIHhcclxuXHRcdG91dFsyXSA9IGFbMl0gKiB4XHJcblx0XHRvdXRbM10gPSBhWzNdICogeFxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIHlcclxuXHRcdG91dFs1XSA9IGFbNV0gKiB5XHJcblx0XHRvdXRbNl0gPSBhWzZdICogeVxyXG5cdFx0b3V0WzddID0gYVs3XSAqIHlcclxuXHRcdG91dFs4XSA9IGFbOF0gKiB6XHJcblx0XHRvdXRbOV0gPSBhWzldICogelxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdICogelxyXG5cdFx0b3V0WzExXSA9IGFbMTFdICogelxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdG91dFsxNF0gPSBhWzE0XVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlJDMob3V0LCBhLCByYWQsIGF4aXMpIHtcclxuXHRcdHZhciB4ID0gYXhpc1swXSxcclxuXHRcdFx0eSA9IGF4aXNbMV0sXHJcblx0XHRcdHogPSBheGlzWzJdXHJcblx0XHR2YXIgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHRcdHZhciBzLCBjLCB0XHJcblx0XHR2YXIgYTAwLCBhMDEsIGEwMiwgYTAzXHJcblx0XHR2YXIgYTEwLCBhMTEsIGExMiwgYTEzXHJcblx0XHR2YXIgYTIwLCBhMjEsIGEyMiwgYTIzXHJcblx0XHR2YXIgYjAwLCBiMDEsIGIwMlxyXG5cdFx0dmFyIGIxMCwgYjExLCBiMTJcclxuXHRcdHZhciBiMjAsIGIyMSwgYjIyXHJcblxyXG5cdFx0aWYgKGxlbiA8IEVQU0lMT04pIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRsZW4gPSAxIC8gbGVuXHJcblx0XHR4ICo9IGxlblxyXG5cdFx0eSAqPSBsZW5cclxuXHRcdHogKj0gbGVuXHJcblx0XHRzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0YyA9IE1hdGguY29zKHJhZClcclxuXHRcdHQgPSAxIC0gY1xyXG5cdFx0YTAwID0gYVswXVxyXG5cdFx0YTAxID0gYVsxXVxyXG5cdFx0YTAyID0gYVsyXVxyXG5cdFx0YTAzID0gYVszXVxyXG5cdFx0YTEwID0gYVs0XVxyXG5cdFx0YTExID0gYVs1XVxyXG5cdFx0YTEyID0gYVs2XVxyXG5cdFx0YTEzID0gYVs3XVxyXG5cdFx0YTIwID0gYVs4XVxyXG5cdFx0YTIxID0gYVs5XVxyXG5cdFx0YTIyID0gYVsxMF1cclxuXHRcdGEyMyA9IGFbMTFdIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxyXG5cclxuXHRcdGIwMCA9IHggKiB4ICogdCArIGNcclxuXHRcdGIwMSA9IHkgKiB4ICogdCArIHogKiBzXHJcblx0XHRiMDIgPSB6ICogeCAqIHQgLSB5ICogc1xyXG5cdFx0YjEwID0geCAqIHkgKiB0IC0geiAqIHNcclxuXHRcdGIxMSA9IHkgKiB5ICogdCArIGNcclxuXHRcdGIxMiA9IHogKiB5ICogdCArIHggKiBzXHJcblx0XHRiMjAgPSB4ICogeiAqIHQgKyB5ICogc1xyXG5cdFx0YjIxID0geSAqIHogKiB0IC0geCAqIHNcclxuXHRcdGIyMiA9IHogKiB6ICogdCArIGMgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDJcclxuXHRcdG91dFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMlxyXG5cdFx0b3V0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyXHJcblx0XHRvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDJcclxuXHRcdG91dFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMlxyXG5cdFx0b3V0WzVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyXHJcblx0XHRvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTJcclxuXHRcdG91dFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMlxyXG5cdFx0b3V0WzhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyXHJcblx0XHRvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjJcclxuXHRcdG91dFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjJcclxuXHRcdG91dFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjJcclxuXHJcblx0XHRpZiAoYSAhPT0gb3V0KSB7XHJcblx0XHRcdC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XHJcblx0XHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHR2YXIgYTEwID0gYVs0XVxyXG5cdFx0dmFyIGExMSA9IGFbNV1cclxuXHRcdHZhciBhMTIgPSBhWzZdXHJcblx0XHR2YXIgYTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF1cclxuXHRcdHZhciBhMjEgPSBhWzldXHJcblx0XHR2YXIgYTIyID0gYVsxMF1cclxuXHRcdHZhciBhMjMgPSBhWzExXVxyXG5cclxuXHRcdGlmIChhICE9PSBvdXQpIHtcclxuXHRcdFx0Ly8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xyXG5cdFx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzRdID0gYTEwICogYyArIGEyMCAqIHNcclxuXHRcdG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzXHJcblx0XHRvdXRbNl0gPSBhMTIgKiBjICsgYTIyICogc1xyXG5cdFx0b3V0WzddID0gYTEzICogYyArIGEyMyAqIHNcclxuXHRcdG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzXHJcblx0XHRvdXRbOV0gPSBhMjEgKiBjIC0gYTExICogc1xyXG5cdFx0b3V0WzEwXSA9IGEyMiAqIGMgLSBhMTIgKiBzXHJcblx0XHRvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHR2YXIgYTAwID0gYVswXVxyXG5cdFx0dmFyIGEwMSA9IGFbMV1cclxuXHRcdHZhciBhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTAzID0gYVszXVxyXG5cdFx0dmFyIGEyMCA9IGFbOF1cclxuXHRcdHZhciBhMjEgPSBhWzldXHJcblx0XHR2YXIgYTIyID0gYVsxMF1cclxuXHRcdHZhciBhMjMgPSBhWzExXVxyXG5cclxuXHRcdGlmIChhICE9PSBvdXQpIHtcclxuXHRcdFx0Ly8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xyXG5cdFx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHNcclxuXHRcdG91dFsxXSA9IGEwMSAqIGMgLSBhMjEgKiBzXHJcblx0XHRvdXRbMl0gPSBhMDIgKiBjIC0gYTIyICogc1xyXG5cdFx0b3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHNcclxuXHRcdG91dFs4XSA9IGEwMCAqIHMgKyBhMjAgKiBjXHJcblx0XHRvdXRbOV0gPSBhMDEgKiBzICsgYTIxICogY1xyXG5cdFx0b3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjXHJcblx0XHRvdXRbMTFdID0gYTAzICogcyArIGEyMyAqIGNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHR2YXIgYTAwID0gYVswXVxyXG5cdFx0dmFyIGEwMSA9IGFbMV1cclxuXHRcdHZhciBhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTAzID0gYVszXVxyXG5cdFx0dmFyIGExMCA9IGFbNF1cclxuXHRcdHZhciBhMTEgPSBhWzVdXHJcblx0XHR2YXIgYTEyID0gYVs2XVxyXG5cdFx0dmFyIGExMyA9IGFbN11cclxuXHJcblx0XHRpZiAoYSAhPT0gb3V0KSB7XHJcblx0XHRcdC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XHJcblx0XHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdFx0b3V0WzldID0gYVs5XVxyXG5cdFx0XHRvdXRbMTBdID0gYVsxMF1cclxuXHRcdFx0b3V0WzExXSA9IGFbMTFdXHJcblx0XHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gYTAwICogYyArIGExMCAqIHNcclxuXHRcdG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzXHJcblx0XHRvdXRbMl0gPSBhMDIgKiBjICsgYTEyICogc1xyXG5cdFx0b3V0WzNdID0gYTAzICogYyArIGExMyAqIHNcclxuXHRcdG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzXHJcblx0XHRvdXRbNV0gPSBhMTEgKiBjIC0gYTAxICogc1xyXG5cdFx0b3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHNcclxuXHRcdG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uJDIob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAxXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAwXHJcblx0XHRvdXRbMTBdID0gMVxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSB2WzBdXHJcblx0XHRvdXRbMTNdID0gdlsxXVxyXG5cdFx0b3V0WzE0XSA9IHZbMl1cclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdiBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVNjYWxpbmckMyhvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IHZbMF1cclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IHZbMV1cclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDBcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSB2WzJdXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGUgYXJvdW5kIGEgZ2l2ZW4gYXhpc1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQucm90YXRlKGRlc3QsIGRlc3QsIHJhZCwgYXhpcyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uJDMob3V0LCByYWQsIGF4aXMpIHtcclxuXHRcdHZhciB4ID0gYXhpc1swXSxcclxuXHRcdFx0eSA9IGF4aXNbMV0sXHJcblx0XHRcdHogPSBheGlzWzJdXHJcblx0XHR2YXIgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHRcdHZhciBzLCBjLCB0XHJcblxyXG5cdFx0aWYgKGxlbiA8IEVQU0lMT04pIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRsZW4gPSAxIC8gbGVuXHJcblx0XHR4ICo9IGxlblxyXG5cdFx0eSAqPSBsZW5cclxuXHRcdHogKj0gbGVuXHJcblx0XHRzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0YyA9IE1hdGguY29zKHJhZClcclxuXHRcdHQgPSAxIC0gYyAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG5cclxuXHRcdG91dFswXSA9IHggKiB4ICogdCArIGNcclxuXHRcdG91dFsxXSA9IHkgKiB4ICogdCArIHogKiBzXHJcblx0XHRvdXRbMl0gPSB6ICogeCAqIHQgLSB5ICogc1xyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0geCAqIHkgKiB0IC0geiAqIHNcclxuXHRcdG91dFs1XSA9IHkgKiB5ICogdCArIGNcclxuXHRcdG91dFs2XSA9IHogKiB5ICogdCArIHggKiBzXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSB4ICogeiAqIHQgKyB5ICogc1xyXG5cdFx0b3V0WzldID0geSAqIHogKiB0IC0geCAqIHNcclxuXHRcdG91dFsxMF0gPSB6ICogeiAqIHQgKyBjXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQucm90YXRlWChkZXN0LCBkZXN0LCByYWQpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tWFJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gY1xyXG5cdFx0b3V0WzZdID0gc1xyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gLXNcclxuXHRcdG91dFsxMF0gPSBjXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQucm90YXRlWShkZXN0LCBkZXN0LCByYWQpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tWVJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gY1xyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gLXNcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDFcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IHNcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSBjXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQucm90YXRlWihkZXN0LCBkZXN0LCByYWQpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tWlJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gY1xyXG5cdFx0b3V0WzFdID0gc1xyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gLXNcclxuXHRcdG91dFs1XSA9IGNcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDBcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSAxXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuXHQgKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG5cdCAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBxLCB2KSB7XHJcblx0XHQvLyBRdWF0ZXJuaW9uIG1hdGhcclxuXHRcdHZhciB4ID0gcVswXSxcclxuXHRcdFx0eSA9IHFbMV0sXHJcblx0XHRcdHogPSBxWzJdLFxyXG5cdFx0XHR3ID0gcVszXVxyXG5cdFx0dmFyIHgyID0geCArIHhcclxuXHRcdHZhciB5MiA9IHkgKyB5XHJcblx0XHR2YXIgejIgPSB6ICsgelxyXG5cdFx0dmFyIHh4ID0geCAqIHgyXHJcblx0XHR2YXIgeHkgPSB4ICogeTJcclxuXHRcdHZhciB4eiA9IHggKiB6MlxyXG5cdFx0dmFyIHl5ID0geSAqIHkyXHJcblx0XHR2YXIgeXogPSB5ICogejJcclxuXHRcdHZhciB6eiA9IHogKiB6MlxyXG5cdFx0dmFyIHd4ID0gdyAqIHgyXHJcblx0XHR2YXIgd3kgPSB3ICogeTJcclxuXHRcdHZhciB3eiA9IHcgKiB6MlxyXG5cdFx0b3V0WzBdID0gMSAtICh5eSArIHp6KVxyXG5cdFx0b3V0WzFdID0geHkgKyB3elxyXG5cdFx0b3V0WzJdID0geHogLSB3eVxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0geHkgLSB3elxyXG5cdFx0b3V0WzVdID0gMSAtICh4eCArIHp6KVxyXG5cdFx0b3V0WzZdID0geXogKyB3eFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0geHogKyB3eVxyXG5cdFx0b3V0WzldID0geXogLSB3eFxyXG5cdFx0b3V0WzEwXSA9IDEgLSAoeHggKyB5eSlcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gdlswXVxyXG5cdFx0b3V0WzEzXSA9IHZbMV1cclxuXHRcdG91dFsxNF0gPSB2WzJdXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IG1hdDQgZnJvbSBhIGR1YWwgcXVhdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IE1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge21hdDR9IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVF1YXQyKG91dCwgYSkge1xyXG5cdFx0dmFyIHRyYW5zbGF0aW9uID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHRcdHZhciBieCA9IC1hWzBdLFxyXG5cdFx0XHRieSA9IC1hWzFdLFxyXG5cdFx0XHRieiA9IC1hWzJdLFxyXG5cdFx0XHRidyA9IGFbM10sXHJcblx0XHRcdGF4ID0gYVs0XSxcclxuXHRcdFx0YXkgPSBhWzVdLFxyXG5cdFx0XHRheiA9IGFbNl0sXHJcblx0XHRcdGF3ID0gYVs3XVxyXG5cdFx0dmFyIG1hZ25pdHVkZSA9IGJ4ICogYnggKyBieSAqIGJ5ICsgYnogKiBieiArIGJ3ICogYncgLy9Pbmx5IHNjYWxlIGlmIGl0IG1ha2VzIHNlbnNlXHJcblxyXG5cdFx0aWYgKG1hZ25pdHVkZSA+IDApIHtcclxuXHRcdFx0dHJhbnNsYXRpb25bMF0gPSAoKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMikgLyBtYWduaXR1ZGVcclxuXHRcdFx0dHJhbnNsYXRpb25bMV0gPSAoKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMikgLyBtYWduaXR1ZGVcclxuXHRcdFx0dHJhbnNsYXRpb25bMl0gPSAoKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMikgLyBtYWduaXR1ZGVcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMlxyXG5cdFx0XHR0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDJcclxuXHRcdFx0dHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyXHJcblx0XHR9XHJcblxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBhLCB0cmFuc2xhdGlvbilcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXHJcblx0ICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcclxuXHQgKiAgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3JcclxuXHQgKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cclxuXHQgKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgdHJhbnNsYXRpb24gY29tcG9uZW50XHJcblx0ICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcclxuXHQgKiBAcmV0dXJuIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24ob3V0LCBtYXQpIHtcclxuXHRcdG91dFswXSA9IG1hdFsxMl1cclxuXHRcdG91dFsxXSA9IG1hdFsxM11cclxuXHRcdG91dFsyXSA9IG1hdFsxNF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cclxuXHQgKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVcclxuXHQgKiAgd2l0aCBhIG5vcm1hbGl6ZWQgUXVhdGVybmlvbiBwYXJhbXRlciwgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlXHJcblx0ICogIHRoZSBzYW1lIGFzIHRoZSBzY2FsaW5nIHZlY3RvclxyXG5cdCAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxyXG5cdCAqIEBwYXJhbSAge3ZlYzN9IG91dCBWZWN0b3IgdG8gcmVjZWl2ZSBzY2FsaW5nIGZhY3RvciBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG5cdCAqIEByZXR1cm4ge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBnZXRTY2FsaW5nKG91dCwgbWF0KSB7XHJcblx0XHR2YXIgbTExID0gbWF0WzBdXHJcblx0XHR2YXIgbTEyID0gbWF0WzFdXHJcblx0XHR2YXIgbTEzID0gbWF0WzJdXHJcblx0XHR2YXIgbTIxID0gbWF0WzRdXHJcblx0XHR2YXIgbTIyID0gbWF0WzVdXHJcblx0XHR2YXIgbTIzID0gbWF0WzZdXHJcblx0XHR2YXIgbTMxID0gbWF0WzhdXHJcblx0XHR2YXIgbTMyID0gbWF0WzldXHJcblx0XHR2YXIgbTMzID0gbWF0WzEwXVxyXG5cdFx0b3V0WzBdID0gTWF0aC5zcXJ0KG0xMSAqIG0xMSArIG0xMiAqIG0xMiArIG0xMyAqIG0xMylcclxuXHRcdG91dFsxXSA9IE1hdGguc3FydChtMjEgKiBtMjEgKyBtMjIgKiBtMjIgKyBtMjMgKiBtMjMpXHJcblx0XHRvdXRbMl0gPSBNYXRoLnNxcnQobTMxICogbTMxICsgbTMyICogbTMyICsgbTMzICogbTMzKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uYWwgY29tcG9uZW50XHJcblx0ICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXHJcblx0ICogIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLCB0aGUgcmV0dXJuZWQgcXVhdGVybmlvbiB3aWxsIGJlIHRoZVxyXG5cdCAqICBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIG9yaWdpbmFsbHkgc3VwcGxpZWQuXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXHJcblx0ICogQHJldHVybiB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGdldFJvdGF0aW9uKG91dCwgbWF0KSB7XHJcblx0XHQvLyBBbGdvcml0aG0gdGFrZW4gZnJvbSBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9nZW9tZXRyeS9yb3RhdGlvbnMvY29udmVyc2lvbnMvbWF0cml4VG9RdWF0ZXJuaW9uL2luZGV4Lmh0bVxyXG5cdFx0dmFyIHRyYWNlID0gbWF0WzBdICsgbWF0WzVdICsgbWF0WzEwXVxyXG5cdFx0dmFyIFMgPSAwXHJcblxyXG5cdFx0aWYgKHRyYWNlID4gMCkge1xyXG5cdFx0XHRTID0gTWF0aC5zcXJ0KHRyYWNlICsgMS4wKSAqIDJcclxuXHRcdFx0b3V0WzNdID0gMC4yNSAqIFNcclxuXHRcdFx0b3V0WzBdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTXHJcblx0XHRcdG91dFsxXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gU1xyXG5cdFx0XHRvdXRbMl0gPSAobWF0WzFdIC0gbWF0WzRdKSAvIFNcclxuXHRcdH0gZWxzZSBpZiAobWF0WzBdID4gbWF0WzVdICYmIG1hdFswXSA+IG1hdFsxMF0pIHtcclxuXHRcdFx0UyA9IE1hdGguc3FydCgxLjAgKyBtYXRbMF0gLSBtYXRbNV0gLSBtYXRbMTBdKSAqIDJcclxuXHRcdFx0b3V0WzNdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTXHJcblx0XHRcdG91dFswXSA9IDAuMjUgKiBTXHJcblx0XHRcdG91dFsxXSA9IChtYXRbMV0gKyBtYXRbNF0pIC8gU1xyXG5cdFx0XHRvdXRbMl0gPSAobWF0WzhdICsgbWF0WzJdKSAvIFNcclxuXHRcdH0gZWxzZSBpZiAobWF0WzVdID4gbWF0WzEwXSkge1xyXG5cdFx0XHRTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFs1XSAtIG1hdFswXSAtIG1hdFsxMF0pICogMlxyXG5cdFx0XHRvdXRbM10gPSAobWF0WzhdIC0gbWF0WzJdKSAvIFNcclxuXHRcdFx0b3V0WzBdID0gKG1hdFsxXSArIG1hdFs0XSkgLyBTXHJcblx0XHRcdG91dFsxXSA9IDAuMjUgKiBTXHJcblx0XHRcdG91dFsyXSA9IChtYXRbNl0gKyBtYXRbOV0pIC8gU1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0UyA9IE1hdGguc3FydCgxLjAgKyBtYXRbMTBdIC0gbWF0WzBdIC0gbWF0WzVdKSAqIDJcclxuXHRcdFx0b3V0WzNdID0gKG1hdFsxXSAtIG1hdFs0XSkgLyBTXHJcblx0XHRcdG91dFswXSA9IChtYXRbOF0gKyBtYXRbMl0pIC8gU1xyXG5cdFx0XHRvdXRbMV0gPSAobWF0WzZdICsgbWF0WzldKSAvIFNcclxuXHRcdFx0b3V0WzJdID0gMC4yNSAqIFNcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuXHQgKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG5cdCAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQuc2NhbGUoZGVzdCwgc2NhbGUpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShvdXQsIHEsIHYsIHMpIHtcclxuXHRcdC8vIFF1YXRlcm5pb24gbWF0aFxyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB4eSA9IHggKiB5MlxyXG5cdFx0dmFyIHh6ID0geCAqIHoyXHJcblx0XHR2YXIgeXkgPSB5ICogeTJcclxuXHRcdHZhciB5eiA9IHkgKiB6MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHR2YXIgc3ggPSBzWzBdXHJcblx0XHR2YXIgc3kgPSBzWzFdXHJcblx0XHR2YXIgc3ogPSBzWzJdXHJcblx0XHRvdXRbMF0gPSAoMSAtICh5eSArIHp6KSkgKiBzeFxyXG5cdFx0b3V0WzFdID0gKHh5ICsgd3opICogc3hcclxuXHRcdG91dFsyXSA9ICh4eiAtIHd5KSAqIHN4XHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAoeHkgLSB3eikgKiBzeVxyXG5cdFx0b3V0WzVdID0gKDEgLSAoeHggKyB6eikpICogc3lcclxuXHRcdG91dFs2XSA9ICh5eiArIHd4KSAqIHN5XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAoeHogKyB3eSkgKiBzelxyXG5cdFx0b3V0WzldID0gKHl6IC0gd3gpICogc3pcclxuXHRcdG91dFsxMF0gPSAoMSAtICh4eCArIHl5KSkgKiBzelxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSB2WzBdXHJcblx0XHRvdXRbMTNdID0gdlsxXVxyXG5cdFx0b3V0WzE0XSA9IHZbMl1cclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlLCByb3RhdGluZyBhbmQgc2NhbGluZyBhcm91bmQgdGhlIGdpdmVuIG9yaWdpblxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XHJcblx0ICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG9yaWdpbik7XHJcblx0ICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcclxuXHQgKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xyXG5cdCAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xyXG5cdCAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxyXG5cdCAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBuZWdhdGl2ZU9yaWdpbik7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gbyBUaGUgb3JpZ2luIHZlY3RvciBhcm91bmQgd2hpY2ggdG8gc2NhbGUgYW5kIHJvdGF0ZVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZU9yaWdpbihvdXQsIHEsIHYsIHMsIG8pIHtcclxuXHRcdC8vIFF1YXRlcm5pb24gbWF0aFxyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB4eSA9IHggKiB5MlxyXG5cdFx0dmFyIHh6ID0geCAqIHoyXHJcblx0XHR2YXIgeXkgPSB5ICogeTJcclxuXHRcdHZhciB5eiA9IHkgKiB6MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHR2YXIgc3ggPSBzWzBdXHJcblx0XHR2YXIgc3kgPSBzWzFdXHJcblx0XHR2YXIgc3ogPSBzWzJdXHJcblx0XHR2YXIgb3ggPSBvWzBdXHJcblx0XHR2YXIgb3kgPSBvWzFdXHJcblx0XHR2YXIgb3ogPSBvWzJdXHJcblx0XHR2YXIgb3V0MCA9ICgxIC0gKHl5ICsgenopKSAqIHN4XHJcblx0XHR2YXIgb3V0MSA9ICh4eSArIHd6KSAqIHN4XHJcblx0XHR2YXIgb3V0MiA9ICh4eiAtIHd5KSAqIHN4XHJcblx0XHR2YXIgb3V0NCA9ICh4eSAtIHd6KSAqIHN5XHJcblx0XHR2YXIgb3V0NSA9ICgxIC0gKHh4ICsgenopKSAqIHN5XHJcblx0XHR2YXIgb3V0NiA9ICh5eiArIHd4KSAqIHN5XHJcblx0XHR2YXIgb3V0OCA9ICh4eiArIHd5KSAqIHN6XHJcblx0XHR2YXIgb3V0OSA9ICh5eiAtIHd4KSAqIHN6XHJcblx0XHR2YXIgb3V0MTAgPSAoMSAtICh4eCArIHl5KSkgKiBzelxyXG5cdFx0b3V0WzBdID0gb3V0MFxyXG5cdFx0b3V0WzFdID0gb3V0MVxyXG5cdFx0b3V0WzJdID0gb3V0MlxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gb3V0NFxyXG5cdFx0b3V0WzVdID0gb3V0NVxyXG5cdFx0b3V0WzZdID0gb3V0NlxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gb3V0OFxyXG5cdFx0b3V0WzldID0gb3V0OVxyXG5cdFx0b3V0WzEwXSA9IG91dDEwXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IHZbMF0gKyBveCAtIChvdXQwICogb3ggKyBvdXQ0ICogb3kgKyBvdXQ4ICogb3opXHJcblx0XHRvdXRbMTNdID0gdlsxXSArIG95IC0gKG91dDEgKiBveCArIG91dDUgKiBveSArIG91dDkgKiBveilcclxuXHRcdG91dFsxNF0gPSB2WzJdICsgb3ogLSAob3V0MiAqIG94ICsgb3V0NiAqIG95ICsgb3V0MTAgKiBveilcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgYSA0eDQgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVF1YXQkMShvdXQsIHEpIHtcclxuXHRcdHZhciB4ID0gcVswXSxcclxuXHRcdFx0eSA9IHFbMV0sXHJcblx0XHRcdHogPSBxWzJdLFxyXG5cdFx0XHR3ID0gcVszXVxyXG5cdFx0dmFyIHgyID0geCArIHhcclxuXHRcdHZhciB5MiA9IHkgKyB5XHJcblx0XHR2YXIgejIgPSB6ICsgelxyXG5cdFx0dmFyIHh4ID0geCAqIHgyXHJcblx0XHR2YXIgeXggPSB5ICogeDJcclxuXHRcdHZhciB5eSA9IHkgKiB5MlxyXG5cdFx0dmFyIHp4ID0geiAqIHgyXHJcblx0XHR2YXIgenkgPSB6ICogeTJcclxuXHRcdHZhciB6eiA9IHogKiB6MlxyXG5cdFx0dmFyIHd4ID0gdyAqIHgyXHJcblx0XHR2YXIgd3kgPSB3ICogeTJcclxuXHRcdHZhciB3eiA9IHcgKiB6MlxyXG5cdFx0b3V0WzBdID0gMSAtIHl5IC0genpcclxuXHRcdG91dFsxXSA9IHl4ICsgd3pcclxuXHRcdG91dFsyXSA9IHp4IC0gd3lcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IHl4IC0gd3pcclxuXHRcdG91dFs1XSA9IDEgLSB4eCAtIHp6XHJcblx0XHRvdXRbNl0gPSB6eSArIHd4XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSB6eCArIHd5XHJcblx0XHRvdXRbOV0gPSB6eSAtIHd4XHJcblx0XHRvdXRbMTBdID0gMSAtIHh4IC0geXlcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSBmcnVzdHVtIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJ1c3R1bShvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XHJcblx0XHR2YXIgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdClcclxuXHRcdHZhciB0YiA9IDEgLyAodG9wIC0gYm90dG9tKVxyXG5cdFx0dmFyIG5mID0gMSAvIChuZWFyIC0gZmFyKVxyXG5cdFx0b3V0WzBdID0gbmVhciAqIDIgKiBybFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gbmVhciAqIDIgKiB0YlxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gKHJpZ2h0ICsgbGVmdCkgKiBybFxyXG5cdFx0b3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YlxyXG5cdFx0b3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mXHJcblx0XHRvdXRbMTFdID0gLTFcclxuXHRcdG91dFsxMl0gPSAwXHJcblx0XHRvdXRbMTNdID0gMFxyXG5cdFx0b3V0WzE0XSA9IGZhciAqIG5lYXIgKiAyICogbmZcclxuXHRcdG91dFsxNV0gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kcy5cclxuXHQgKiBQYXNzaW5nIG51bGwvdW5kZWZpbmVkL25vIHZhbHVlIGZvciBmYXIgd2lsbCBnZW5lcmF0ZSBpbmZpbml0ZSBwcm9qZWN0aW9uIG1hdHJpeC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bSwgY2FuIGJlIG51bGwgb3IgSW5maW5pdHlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHBlcnNwZWN0aXZlKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcclxuXHRcdHZhciBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxyXG5cdFx0XHRuZlxyXG5cdFx0b3V0WzBdID0gZiAvIGFzcGVjdFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gZlxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzExXSA9IC0xXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNV0gPSAwXHJcblxyXG5cdFx0aWYgKGZhciAhPSBudWxsICYmIGZhciAhPT0gSW5maW5pdHkpIHtcclxuXHRcdFx0bmYgPSAxIC8gKG5lYXIgLSBmYXIpXHJcblx0XHRcdG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZlxyXG5cdFx0XHRvdXRbMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZlxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3V0WzEwXSA9IC0xXHJcblx0XHRcdG91dFsxNF0gPSAtMiAqIG5lYXJcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGZpZWxkIG9mIHZpZXcuXHJcblx0ICogVGhpcyBpcyBwcmltYXJpbHkgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHByb2plY3Rpb24gbWF0cmljZXMgdG8gYmUgdXNlZFxyXG5cdCAqIHdpdGggdGhlIHN0aWxsIGV4cGVyaWVtZW50YWwgV2ViVlIgQVBJLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBmb3YgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGZvbGxvd2luZyB2YWx1ZXM6IHVwRGVncmVlcywgZG93bkRlZ3JlZXMsIGxlZnREZWdyZWVzLCByaWdodERlZ3JlZXNcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3KG91dCwgZm92LCBuZWFyLCBmYXIpIHtcclxuXHRcdHZhciB1cFRhbiA9IE1hdGgudGFuKChmb3YudXBEZWdyZWVzICogTWF0aC5QSSkgLyAxODAuMClcclxuXHRcdHZhciBkb3duVGFuID0gTWF0aC50YW4oKGZvdi5kb3duRGVncmVlcyAqIE1hdGguUEkpIC8gMTgwLjApXHJcblx0XHR2YXIgbGVmdFRhbiA9IE1hdGgudGFuKChmb3YubGVmdERlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MC4wKVxyXG5cdFx0dmFyIHJpZ2h0VGFuID0gTWF0aC50YW4oKGZvdi5yaWdodERlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MC4wKVxyXG5cdFx0dmFyIHhTY2FsZSA9IDIuMCAvIChsZWZ0VGFuICsgcmlnaHRUYW4pXHJcblx0XHR2YXIgeVNjYWxlID0gMi4wIC8gKHVwVGFuICsgZG93blRhbilcclxuXHRcdG91dFswXSA9IHhTY2FsZVxyXG5cdFx0b3V0WzFdID0gMC4wXHJcblx0XHRvdXRbMl0gPSAwLjBcclxuXHRcdG91dFszXSA9IDAuMFxyXG5cdFx0b3V0WzRdID0gMC4wXHJcblx0XHRvdXRbNV0gPSB5U2NhbGVcclxuXHRcdG91dFs2XSA9IDAuMFxyXG5cdFx0b3V0WzddID0gMC4wXHJcblx0XHRvdXRbOF0gPSAtKChsZWZ0VGFuIC0gcmlnaHRUYW4pICogeFNjYWxlICogMC41KVxyXG5cdFx0b3V0WzldID0gKHVwVGFuIC0gZG93blRhbikgKiB5U2NhbGUgKiAwLjVcclxuXHRcdG91dFsxMF0gPSBmYXIgLyAobmVhciAtIGZhcilcclxuXHRcdG91dFsxMV0gPSAtMS4wXHJcblx0XHRvdXRbMTJdID0gMC4wXHJcblx0XHRvdXRbMTNdID0gMC4wXHJcblx0XHRvdXRbMTRdID0gKGZhciAqIG5lYXIpIC8gKG5lYXIgLSBmYXIpXHJcblx0XHRvdXRbMTVdID0gMC4wXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIG9ydGhvZ29uYWwgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG9ydGhvKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcclxuXHRcdHZhciBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KVxyXG5cdFx0dmFyIGJ0ID0gMSAvIChib3R0b20gLSB0b3ApXHJcblx0XHR2YXIgbmYgPSAxIC8gKG5lYXIgLSBmYXIpXHJcblx0XHRvdXRbMF0gPSAtMiAqIGxyXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAtMiAqIGJ0XHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAwXHJcblx0XHRvdXRbMTBdID0gMiAqIG5mXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IChsZWZ0ICsgcmlnaHQpICogbHJcclxuXHRcdG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0XHJcblx0XHRvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmZcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIGxvb2stYXQgbWF0cml4IHdpdGggdGhlIGdpdmVuIGV5ZSBwb3NpdGlvbiwgZm9jYWwgcG9pbnQsIGFuZCB1cCBheGlzLlxyXG5cdCAqIElmIHlvdSB3YW50IGEgbWF0cml4IHRoYXQgYWN0dWFsbHkgbWFrZXMgYW4gb2JqZWN0IGxvb2sgYXQgYW5vdGhlciBvYmplY3QsIHlvdSBzaG91bGQgdXNlIHRhcmdldFRvIGluc3RlYWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbG9va0F0KG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XHJcblx0XHR2YXIgeDAsIHgxLCB4MiwgeTAsIHkxLCB5MiwgejAsIHoxLCB6MiwgbGVuXHJcblx0XHR2YXIgZXlleCA9IGV5ZVswXVxyXG5cdFx0dmFyIGV5ZXkgPSBleWVbMV1cclxuXHRcdHZhciBleWV6ID0gZXllWzJdXHJcblx0XHR2YXIgdXB4ID0gdXBbMF1cclxuXHRcdHZhciB1cHkgPSB1cFsxXVxyXG5cdFx0dmFyIHVweiA9IHVwWzJdXHJcblx0XHR2YXIgY2VudGVyeCA9IGNlbnRlclswXVxyXG5cdFx0dmFyIGNlbnRlcnkgPSBjZW50ZXJbMV1cclxuXHRcdHZhciBjZW50ZXJ6ID0gY2VudGVyWzJdXHJcblxyXG5cdFx0aWYgKFxyXG5cdFx0XHRNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBFUFNJTE9OICYmXHJcblx0XHRcdE1hdGguYWJzKGV5ZXkgLSBjZW50ZXJ5KSA8IEVQU0lMT04gJiZcclxuXHRcdFx0TWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgRVBTSUxPTlxyXG5cdFx0KSB7XHJcblx0XHRcdHJldHVybiBpZGVudGl0eSQzKG91dClcclxuXHRcdH1cclxuXHJcblx0XHR6MCA9IGV5ZXggLSBjZW50ZXJ4XHJcblx0XHR6MSA9IGV5ZXkgLSBjZW50ZXJ5XHJcblx0XHR6MiA9IGV5ZXogLSBjZW50ZXJ6XHJcblx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6MilcclxuXHRcdHowICo9IGxlblxyXG5cdFx0ejEgKj0gbGVuXHJcblx0XHR6MiAqPSBsZW5cclxuXHRcdHgwID0gdXB5ICogejIgLSB1cHogKiB6MVxyXG5cdFx0eDEgPSB1cHogKiB6MCAtIHVweCAqIHoyXHJcblx0XHR4MiA9IHVweCAqIHoxIC0gdXB5ICogejBcclxuXHRcdGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpXHJcblxyXG5cdFx0aWYgKCFsZW4pIHtcclxuXHRcdFx0eDAgPSAwXHJcblx0XHRcdHgxID0gMFxyXG5cdFx0XHR4MiA9IDBcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGxlbiA9IDEgLyBsZW5cclxuXHRcdFx0eDAgKj0gbGVuXHJcblx0XHRcdHgxICo9IGxlblxyXG5cdFx0XHR4MiAqPSBsZW5cclxuXHRcdH1cclxuXHJcblx0XHR5MCA9IHoxICogeDIgLSB6MiAqIHgxXHJcblx0XHR5MSA9IHoyICogeDAgLSB6MCAqIHgyXHJcblx0XHR5MiA9IHowICogeDEgLSB6MSAqIHgwXHJcblx0XHRsZW4gPSBNYXRoLnNxcnQoeTAgKiB5MCArIHkxICogeTEgKyB5MiAqIHkyKVxyXG5cclxuXHRcdGlmICghbGVuKSB7XHJcblx0XHRcdHkwID0gMFxyXG5cdFx0XHR5MSA9IDBcclxuXHRcdFx0eTIgPSAwXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRsZW4gPSAxIC8gbGVuXHJcblx0XHRcdHkwICo9IGxlblxyXG5cdFx0XHR5MSAqPSBsZW5cclxuXHRcdFx0eTIgKj0gbGVuXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0geDBcclxuXHRcdG91dFsxXSA9IHkwXHJcblx0XHRvdXRbMl0gPSB6MFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0geDFcclxuXHRcdG91dFs1XSA9IHkxXHJcblx0XHRvdXRbNl0gPSB6MVxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0geDJcclxuXHRcdG91dFs5XSA9IHkyXHJcblx0XHRvdXRbMTBdID0gejJcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopXHJcblx0XHRvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopXHJcblx0XHRvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSBtYXRyaXggdGhhdCBtYWtlcyBzb21ldGhpbmcgbG9vayBhdCBzb21ldGhpbmcgZWxzZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0YXJnZXRUbyhvdXQsIGV5ZSwgdGFyZ2V0LCB1cCkge1xyXG5cdFx0dmFyIGV5ZXggPSBleWVbMF0sXHJcblx0XHRcdGV5ZXkgPSBleWVbMV0sXHJcblx0XHRcdGV5ZXogPSBleWVbMl0sXHJcblx0XHRcdHVweCA9IHVwWzBdLFxyXG5cdFx0XHR1cHkgPSB1cFsxXSxcclxuXHRcdFx0dXB6ID0gdXBbMl1cclxuXHRcdHZhciB6MCA9IGV5ZXggLSB0YXJnZXRbMF0sXHJcblx0XHRcdHoxID0gZXlleSAtIHRhcmdldFsxXSxcclxuXHRcdFx0ejIgPSBleWV6IC0gdGFyZ2V0WzJdXHJcblx0XHR2YXIgbGVuID0gejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyXHJcblxyXG5cdFx0aWYgKGxlbiA+IDApIHtcclxuXHRcdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pXHJcblx0XHRcdHowICo9IGxlblxyXG5cdFx0XHR6MSAqPSBsZW5cclxuXHRcdFx0ejIgKj0gbGVuXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcclxuXHRcdFx0eDEgPSB1cHogKiB6MCAtIHVweCAqIHoyLFxyXG5cdFx0XHR4MiA9IHVweCAqIHoxIC0gdXB5ICogejBcclxuXHRcdGxlbiA9IHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4MlxyXG5cclxuXHRcdGlmIChsZW4gPiAwKSB7XHJcblx0XHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKVxyXG5cdFx0XHR4MCAqPSBsZW5cclxuXHRcdFx0eDEgKj0gbGVuXHJcblx0XHRcdHgyICo9IGxlblxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IHgwXHJcblx0XHRvdXRbMV0gPSB4MVxyXG5cdFx0b3V0WzJdID0geDJcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IHoxICogeDIgLSB6MiAqIHgxXHJcblx0XHRvdXRbNV0gPSB6MiAqIHgwIC0gejAgKiB4MlxyXG5cdFx0b3V0WzZdID0gejAgKiB4MSAtIHoxICogeDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IHowXHJcblx0XHRvdXRbOV0gPSB6MVxyXG5cdFx0b3V0WzEwXSA9IHoyXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IGV5ZXhcclxuXHRcdG91dFsxM10gPSBleWV5XHJcblx0XHRvdXRbMTRdID0gZXllelxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDMoYSkge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0J21hdDQoJyArXHJcblx0XHRcdGFbMF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzJdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbM10gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs0XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzVdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs3XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzhdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbOV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxMF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxMV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxMl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxM10gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxNF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxNV0gK1xyXG5cdFx0XHQnKSdcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb2IkMyhhKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KFxyXG5cdFx0XHRNYXRoLnBvdyhhWzBdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzNdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs0XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzZdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs3XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbOF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzldLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxMF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzExXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMTJdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxM10sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzE0XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMTVdLCAyKSxcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gbWF0NCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQzKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XVxyXG5cdFx0b3V0WzZdID0gYVs2XSArIGJbNl1cclxuXHRcdG91dFs3XSA9IGFbN10gKyBiWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdICsgYls4XVxyXG5cdFx0b3V0WzldID0gYVs5XSArIGJbOV1cclxuXHRcdG91dFsxMF0gPSBhWzEwXSArIGJbMTBdXHJcblx0XHRvdXRbMTFdID0gYVsxMV0gKyBiWzExXVxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdICsgYlsxMl1cclxuXHRcdG91dFsxM10gPSBhWzEzXSArIGJbMTNdXHJcblx0XHRvdXRbMTRdID0gYVsxNF0gKyBiWzE0XVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdICsgYlsxNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkMyhvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLSBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdIC0gYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSAtIGJbNV1cclxuXHRcdG91dFs2XSA9IGFbNl0gLSBiWzZdXHJcblx0XHRvdXRbN10gPSBhWzddIC0gYls3XVxyXG5cdFx0b3V0WzhdID0gYVs4XSAtIGJbOF1cclxuXHRcdG91dFs5XSA9IGFbOV0gLSBiWzldXHJcblx0XHRvdXRbMTBdID0gYVsxMF0gLSBiWzEwXVxyXG5cdFx0b3V0WzExXSA9IGFbMTFdIC0gYlsxMV1cclxuXHRcdG91dFsxMl0gPSBhWzEyXSAtIGJbMTJdXHJcblx0XHRvdXRbMTNdID0gYVsxM10gLSBiWzEzXVxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdIC0gYlsxNF1cclxuXHRcdG91dFsxNV0gPSBhWzE1XSAtIGJbMTVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyJDMob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRvdXRbM10gPSBhWzNdICogYlxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIGJcclxuXHRcdG91dFs1XSA9IGFbNV0gKiBiXHJcblx0XHRvdXRbNl0gPSBhWzZdICogYlxyXG5cdFx0b3V0WzddID0gYVs3XSAqIGJcclxuXHRcdG91dFs4XSA9IGFbOF0gKiBiXHJcblx0XHRvdXRbOV0gPSBhWzldICogYlxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdICogYlxyXG5cdFx0b3V0WzExXSA9IGFbMTFdICogYlxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdICogYlxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdICogYlxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdICogYlxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdICogYlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQ0J3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZCQzKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGVcclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGVcclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdICogc2NhbGVcclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdICogc2NhbGVcclxuXHRcdG91dFs2XSA9IGFbNl0gKyBiWzZdICogc2NhbGVcclxuXHRcdG91dFs3XSA9IGFbN10gKyBiWzddICogc2NhbGVcclxuXHRcdG91dFs4XSA9IGFbOF0gKyBiWzhdICogc2NhbGVcclxuXHRcdG91dFs5XSA9IGFbOV0gKyBiWzldICogc2NhbGVcclxuXHRcdG91dFsxMF0gPSBhWzEwXSArIGJbMTBdICogc2NhbGVcclxuXHRcdG91dFsxMV0gPSBhWzExXSArIGJbMTFdICogc2NhbGVcclxuXHRcdG91dFsxMl0gPSBhWzEyXSArIGJbMTJdICogc2NhbGVcclxuXHRcdG91dFsxM10gPSBhWzEzXSArIGJbMTNdICogc2NhbGVcclxuXHRcdG91dFsxNF0gPSBhWzE0XSArIGJbMTRdICogc2NhbGVcclxuXHRcdG91dFsxNV0gPSBhWzE1XSArIGJbMTVdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkMyhhLCBiKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRhWzBdID09PSBiWzBdICYmXHJcblx0XHRcdGFbMV0gPT09IGJbMV0gJiZcclxuXHRcdFx0YVsyXSA9PT0gYlsyXSAmJlxyXG5cdFx0XHRhWzNdID09PSBiWzNdICYmXHJcblx0XHRcdGFbNF0gPT09IGJbNF0gJiZcclxuXHRcdFx0YVs1XSA9PT0gYls1XSAmJlxyXG5cdFx0XHRhWzZdID09PSBiWzZdICYmXHJcblx0XHRcdGFbN10gPT09IGJbN10gJiZcclxuXHRcdFx0YVs4XSA9PT0gYls4XSAmJlxyXG5cdFx0XHRhWzldID09PSBiWzldICYmXHJcblx0XHRcdGFbMTBdID09PSBiWzEwXSAmJlxyXG5cdFx0XHRhWzExXSA9PT0gYlsxMV0gJiZcclxuXHRcdFx0YVsxMl0gPT09IGJbMTJdICYmXHJcblx0XHRcdGFbMTNdID09PSBiWzEzXSAmJlxyXG5cdFx0XHRhWzE0XSA9PT0gYlsxNF0gJiZcclxuXHRcdFx0YVsxNV0gPT09IGJbMTVdXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQ0KGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM11cclxuXHRcdHZhciBhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XSxcclxuXHRcdFx0YTYgPSBhWzZdLFxyXG5cdFx0XHRhNyA9IGFbN11cclxuXHRcdHZhciBhOCA9IGFbOF0sXHJcblx0XHRcdGE5ID0gYVs5XSxcclxuXHRcdFx0YTEwID0gYVsxMF0sXHJcblx0XHRcdGExMSA9IGFbMTFdXHJcblx0XHR2YXIgYTEyID0gYVsxMl0sXHJcblx0XHRcdGExMyA9IGFbMTNdLFxyXG5cdFx0XHRhMTQgPSBhWzE0XSxcclxuXHRcdFx0YTE1ID0gYVsxNV1cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM11cclxuXHRcdHZhciBiNCA9IGJbNF0sXHJcblx0XHRcdGI1ID0gYls1XSxcclxuXHRcdFx0YjYgPSBiWzZdLFxyXG5cdFx0XHRiNyA9IGJbN11cclxuXHRcdHZhciBiOCA9IGJbOF0sXHJcblx0XHRcdGI5ID0gYls5XSxcclxuXHRcdFx0YjEwID0gYlsxMF0sXHJcblx0XHRcdGIxMSA9IGJbMTFdXHJcblx0XHR2YXIgYjEyID0gYlsxMl0sXHJcblx0XHRcdGIxMyA9IGJbMTNdLFxyXG5cdFx0XHRiMTQgPSBiWzE0XSxcclxuXHRcdFx0YjE1ID0gYlsxNV1cclxuXHRcdHJldHVybiAoXHJcblx0XHRcdE1hdGguYWJzKGEwIC0gYjApIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMSAtIGIxKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTIgLSBiMikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcblx0XHRcdE1hdGguYWJzKGEzIC0gYjMpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNCAtIGI0KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTUgLSBiNSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE2IC0gYjYpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNyAtIGI3KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTggLSBiOCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTgpLCBNYXRoLmFicyhiOCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE5IC0gYjkpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE5KSwgTWF0aC5hYnMoYjkpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMTAgLSBiMTApIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMCksIE1hdGguYWJzKGIxMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExMSAtIGIxMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTExKSwgTWF0aC5hYnMoYjExKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEyIC0gYjEyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTIpLCBNYXRoLmFicyhiMTIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMTMgLSBiMTMpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMyksIE1hdGguYWJzKGIxMykpICYmXHJcblx0XHRcdE1hdGguYWJzKGExNCAtIGIxNCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTE0KSwgTWF0aC5hYnMoYjE0KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTE1IC0gYjE1KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTUpLCBNYXRoLmFicyhiMTUpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDQubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkMyA9IG11bHRpcGx5JDNcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDQuc3VidHJhY3R9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzdWIkMyA9IHN1YnRyYWN0JDNcclxuXHJcblx0dmFyIG1hdDQgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkMyxcclxuXHRcdGNsb25lOiBjbG9uZSQzLFxyXG5cdFx0Y29weTogY29weSQzLFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQzLFxyXG5cdFx0c2V0OiBzZXQkMyxcclxuXHRcdGlkZW50aXR5OiBpZGVudGl0eSQzLFxyXG5cdFx0dHJhbnNwb3NlOiB0cmFuc3Bvc2UkMixcclxuXHRcdGludmVydDogaW52ZXJ0JDMsXHJcblx0XHRhZGpvaW50OiBhZGpvaW50JDIsXHJcblx0XHRkZXRlcm1pbmFudDogZGV0ZXJtaW5hbnQkMyxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQzLFxyXG5cdFx0dHJhbnNsYXRlOiB0cmFuc2xhdGUkMixcclxuXHRcdHNjYWxlOiBzY2FsZSQzLFxyXG5cdFx0cm90YXRlOiByb3RhdGUkMyxcclxuXHRcdHJvdGF0ZVg6IHJvdGF0ZVgsXHJcblx0XHRyb3RhdGVZOiByb3RhdGVZLFxyXG5cdFx0cm90YXRlWjogcm90YXRlWixcclxuXHRcdGZyb21UcmFuc2xhdGlvbjogZnJvbVRyYW5zbGF0aW9uJDIsXHJcblx0XHRmcm9tU2NhbGluZzogZnJvbVNjYWxpbmckMyxcclxuXHRcdGZyb21Sb3RhdGlvbjogZnJvbVJvdGF0aW9uJDMsXHJcblx0XHRmcm9tWFJvdGF0aW9uOiBmcm9tWFJvdGF0aW9uLFxyXG5cdFx0ZnJvbVlSb3RhdGlvbjogZnJvbVlSb3RhdGlvbixcclxuXHRcdGZyb21aUm90YXRpb246IGZyb21aUm90YXRpb24sXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvbjogZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sXHJcblx0XHRmcm9tUXVhdDI6IGZyb21RdWF0MixcclxuXHRcdGdldFRyYW5zbGF0aW9uOiBnZXRUcmFuc2xhdGlvbixcclxuXHRcdGdldFNjYWxpbmc6IGdldFNjYWxpbmcsXHJcblx0XHRnZXRSb3RhdGlvbjogZ2V0Um90YXRpb24sXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlOiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlLFxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZU9yaWdpbjogZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZU9yaWdpbixcclxuXHRcdGZyb21RdWF0OiBmcm9tUXVhdCQxLFxyXG5cdFx0ZnJ1c3R1bTogZnJ1c3R1bSxcclxuXHRcdHBlcnNwZWN0aXZlOiBwZXJzcGVjdGl2ZSxcclxuXHRcdHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3OiBwZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldyxcclxuXHRcdG9ydGhvOiBvcnRobyxcclxuXHRcdGxvb2tBdDogbG9va0F0LFxyXG5cdFx0dGFyZ2V0VG86IHRhcmdldFRvLFxyXG5cdFx0c3RyOiBzdHIkMyxcclxuXHRcdGZyb2I6IGZyb2IkMyxcclxuXHRcdGFkZDogYWRkJDMsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkMyxcclxuXHRcdG11bHRpcGx5U2NhbGFyOiBtdWx0aXBseVNjYWxhciQzLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXJBbmRBZGQ6IG11bHRpcGx5U2NhbGFyQW5kQWRkJDMsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkMyxcclxuXHRcdGVxdWFsczogZXF1YWxzJDQsXHJcblx0XHRtdWw6IG11bCQzLFxyXG5cdFx0c3ViOiBzdWIkMyxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAzIERpbWVuc2lvbmFsIFZlY3RvclxyXG5cdCAqIEBtb2R1bGUgdmVjM1xyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQ0KCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDMpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFswXSA9IDBcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDQoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDMpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlbmd0aChhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF1cclxuXHRcdHZhciB5ID0gYVsxXVxyXG5cdFx0dmFyIHogPSBhWzJdXHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDQoeCwgeSwgeikge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDMpXHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDQob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldCQ0KG91dCwgeCwgeSwgeikge1xyXG5cdFx0b3V0WzBdID0geFxyXG5cdFx0b3V0WzFdID0geVxyXG5cdFx0b3V0WzJdID0gelxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRkJDQob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDQob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQ0KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBEaXZpZGVzIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAvIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC8gYlsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2VpbFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguY2VpbChhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBmbG9vclxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLmZsb29yKGFbMl0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcm91bmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdW5kKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQ0KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byB2ZWMzJ3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF1cclxuXHRcdHZhciB5ID0gYlsxXSAtIGFbMV1cclxuXHRcdHZhciB6ID0gYlsyXSAtIGFbMl1cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXVxyXG5cdFx0dmFyIHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0dmFyIHogPSBiWzJdIC0gYVsyXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogelxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHpcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBuZWdhdGVcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IC1hWzBdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0b3V0WzJdID0gLWFbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBpbnZlcnRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAxLjAgLyBhWzBdXHJcblx0XHRvdXRbMV0gPSAxLjAgLyBhWzFdXHJcblx0XHRvdXRbMl0gPSAxLjAgLyBhWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHZhciBsZW4gPSB4ICogeCArIHkgKiB5ICsgeiAqIHpcclxuXHJcblx0XHRpZiAobGVuID4gMCkge1xyXG5cdFx0XHQvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG5cdFx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSBhWzBdICogbGVuXHJcblx0XHRvdXRbMV0gPSBhWzFdICogbGVuXHJcblx0XHRvdXRbMl0gPSBhWzJdICogbGVuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRvdChhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XHJcblx0XHR2YXIgYXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXVxyXG5cdFx0dmFyIGJ4ID0gYlswXSxcclxuXHRcdFx0YnkgPSBiWzFdLFxyXG5cdFx0XHRieiA9IGJbMl1cclxuXHRcdG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5XHJcblx0XHRvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBielxyXG5cdFx0b3V0WzJdID0gYXggKiBieSAtIGF5ICogYnhcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XHJcblx0XHR2YXIgYXggPSBhWzBdXHJcblx0XHR2YXIgYXkgPSBhWzFdXHJcblx0XHR2YXIgYXogPSBhWzJdXHJcblx0XHRvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KVxyXG5cdFx0b3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSlcclxuXHRcdG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgaGVybWl0ZSBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaGVybWl0ZShvdXQsIGEsIGIsIGMsIGQsIHQpIHtcclxuXHRcdHZhciBmYWN0b3JUaW1lczIgPSB0ICogdFxyXG5cdFx0dmFyIGZhY3RvcjEgPSBmYWN0b3JUaW1lczIgKiAoMiAqIHQgLSAzKSArIDFcclxuXHRcdHZhciBmYWN0b3IyID0gZmFjdG9yVGltZXMyICogKHQgLSAyKSArIHRcclxuXHRcdHZhciBmYWN0b3IzID0gZmFjdG9yVGltZXMyICogKHQgLSAxKVxyXG5cdFx0dmFyIGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiAoMyAtIDIgKiB0KVxyXG5cdFx0b3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjRcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0XHJcblx0XHRvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGJlemllciBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYmV6aWVyKG91dCwgYSwgYiwgYywgZCwgdCkge1xyXG5cdFx0dmFyIGludmVyc2VGYWN0b3IgPSAxIC0gdFxyXG5cdFx0dmFyIGludmVyc2VGYWN0b3JUaW1lc1R3byA9IGludmVyc2VGYWN0b3IgKiBpbnZlcnNlRmFjdG9yXHJcblx0XHR2YXIgZmFjdG9yVGltZXMyID0gdCAqIHRcclxuXHRcdHZhciBmYWN0b3IxID0gaW52ZXJzZUZhY3RvclRpbWVzVHdvICogaW52ZXJzZUZhY3RvclxyXG5cdFx0dmFyIGZhY3RvcjIgPSAzICogdCAqIGludmVyc2VGYWN0b3JUaW1lc1R3b1xyXG5cdFx0dmFyIGZhY3RvcjMgPSAzICogZmFjdG9yVGltZXMyICogaW52ZXJzZUZhY3RvclxyXG5cdFx0dmFyIGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiB0XHJcblx0XHRvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNFxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjRcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xyXG5cdFx0c2NhbGUgPSBzY2FsZSB8fCAxLjBcclxuXHRcdHZhciByID0gUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJXHJcblx0XHR2YXIgeiA9IFJBTkRPTSgpICogMi4wIC0gMS4wXHJcblx0XHR2YXIgelNjYWxlID0gTWF0aC5zcXJ0KDEuMCAtIHogKiB6KSAqIHNjYWxlXHJcblx0XHRvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHpTY2FsZVxyXG5cdFx0b3V0WzFdID0gTWF0aC5zaW4ocikgKiB6U2NhbGVcclxuXHRcdG91dFsyXSA9IHogKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQ0LlxyXG5cdCAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXVxyXG5cdFx0dmFyIHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV1cclxuXHRcdHcgPSB3IHx8IDEuMFxyXG5cdFx0b3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdKSAvIHdcclxuXHRcdG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSkgLyB3XHJcblx0XHRvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdKSAvIHdcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0My5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQzfSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXSxcclxuXHRcdFx0eiA9IGFbMl1cclxuXHRcdG91dFswXSA9IHggKiBtWzBdICsgeSAqIG1bM10gKyB6ICogbVs2XVxyXG5cdFx0b3V0WzFdID0geCAqIG1bMV0gKyB5ICogbVs0XSArIHogKiBtWzddXHJcblx0XHRvdXRbMl0gPSB4ICogbVsyXSArIHkgKiBtWzVdICsgeiAqIG1bOF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgcXVhdFxyXG5cdCAqIENhbiBhbHNvIGJlIHVzZWQgZm9yIGR1YWwgcXVhdGVybmlvbnMuIChNdWx0aXBseSBpdCB3aXRoIHRoZSByZWFsIHBhcnQpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xyXG5cdFx0Ly8gYmVuY2htYXJrczogaHR0cHM6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tdHJhbnNmb3JtLXZlYzMtaW1wbGVtZW50YXRpb25zLWZpeGVkXHJcblx0XHR2YXIgcXggPSBxWzBdLFxyXG5cdFx0XHRxeSA9IHFbMV0sXHJcblx0XHRcdHF6ID0gcVsyXSxcclxuXHRcdFx0cXcgPSBxWzNdXHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXSAvLyB2YXIgcXZlYyA9IFtxeCwgcXksIHF6XTtcclxuXHRcdC8vIHZhciB1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIGEpO1xyXG5cclxuXHRcdHZhciB1dnggPSBxeSAqIHogLSBxeiAqIHksXHJcblx0XHRcdHV2eSA9IHF6ICogeCAtIHF4ICogeixcclxuXHRcdFx0dXZ6ID0gcXggKiB5IC0gcXkgKiB4IC8vIHZhciB1dXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCB1dik7XHJcblxyXG5cdFx0dmFyIHV1dnggPSBxeSAqIHV2eiAtIHF6ICogdXZ5LFxyXG5cdFx0XHR1dXZ5ID0gcXogKiB1dnggLSBxeCAqIHV2eixcclxuXHRcdFx0dXV2eiA9IHF4ICogdXZ5IC0gcXkgKiB1dnggLy8gdmVjMy5zY2FsZSh1diwgdXYsIDIgKiB3KTtcclxuXHJcblx0XHR2YXIgdzIgPSBxdyAqIDJcclxuXHRcdHV2eCAqPSB3MlxyXG5cdFx0dXZ5ICo9IHcyXHJcblx0XHR1dnogKj0gdzIgLy8gdmVjMy5zY2FsZSh1dXYsIHV1diwgMik7XHJcblxyXG5cdFx0dXV2eCAqPSAyXHJcblx0XHR1dXZ5ICo9IDJcclxuXHRcdHV1dnogKj0gMiAvLyByZXR1cm4gdmVjMy5hZGQob3V0LCBhLCB2ZWMzLmFkZChvdXQsIHV2LCB1dXYpKTtcclxuXHJcblx0XHRvdXRbMF0gPSB4ICsgdXZ4ICsgdXV2eFxyXG5cdFx0b3V0WzFdID0geSArIHV2eSArIHV1dnlcclxuXHRcdG91dFsyXSA9IHogKyB1dnogKyB1dXZ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHgtYXhpc1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVgkMShvdXQsIGEsIGIsIGMpIHtcclxuXHRcdHZhciBwID0gW10sXHJcblx0XHRcdHIgPSBbXSAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcblxyXG5cdFx0cFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRwWzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdHBbMl0gPSBhWzJdIC0gYlsyXSAvL3BlcmZvcm0gcm90YXRpb25cclxuXHJcblx0XHRyWzBdID0gcFswXVxyXG5cdFx0clsxXSA9IHBbMV0gKiBNYXRoLmNvcyhjKSAtIHBbMl0gKiBNYXRoLnNpbihjKVxyXG5cdFx0clsyXSA9IHBbMV0gKiBNYXRoLnNpbihjKSArIHBbMl0gKiBNYXRoLmNvcyhjKSAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gclswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IHJbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSByWzJdICsgYlsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB5LWF4aXNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVZJDEob3V0LCBhLCBiLCBjKSB7XHJcblx0XHR2YXIgcCA9IFtdLFxyXG5cdFx0XHRyID0gW10gLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG5cclxuXHRcdHBbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0cFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRwWzJdID0gYVsyXSAtIGJbMl0gLy9wZXJmb3JtIHJvdGF0aW9uXHJcblxyXG5cdFx0clswXSA9IHBbMl0gKiBNYXRoLnNpbihjKSArIHBbMF0gKiBNYXRoLmNvcyhjKVxyXG5cdFx0clsxXSA9IHBbMV1cclxuXHRcdHJbMl0gPSBwWzJdICogTWF0aC5jb3MoYykgLSBwWzBdICogTWF0aC5zaW4oYykgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxyXG5cclxuXHRcdG91dFswXSA9IHJbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSByWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gclsyXSArIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgei1heGlzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWiQxKG91dCwgYSwgYiwgYykge1xyXG5cdFx0dmFyIHAgPSBbXSxcclxuXHRcdFx0ciA9IFtdIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cclxuXHJcblx0XHRwWzBdID0gYVswXSAtIGJbMF1cclxuXHRcdHBbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0cFsyXSA9IGFbMl0gLSBiWzJdIC8vcGVyZm9ybSByb3RhdGlvblxyXG5cclxuXHRcdHJbMF0gPSBwWzBdICogTWF0aC5jb3MoYykgLSBwWzFdICogTWF0aC5zaW4oYylcclxuXHRcdHJbMV0gPSBwWzBdICogTWF0aC5zaW4oYykgKyBwWzFdICogTWF0aC5jb3MoYylcclxuXHRcdHJbMl0gPSBwWzJdIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSByWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gclsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IHJbMl0gKyBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gM0QgdmVjdG9yc1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhbmdsZShhLCBiKSB7XHJcblx0XHR2YXIgdGVtcEEgPSBmcm9tVmFsdWVzJDQoYVswXSwgYVsxXSwgYVsyXSlcclxuXHRcdHZhciB0ZW1wQiA9IGZyb21WYWx1ZXMkNChiWzBdLCBiWzFdLCBiWzJdKVxyXG5cdFx0bm9ybWFsaXplKHRlbXBBLCB0ZW1wQSlcclxuXHRcdG5vcm1hbGl6ZSh0ZW1wQiwgdGVtcEIpXHJcblx0XHR2YXIgY29zaW5lID0gZG90KHRlbXBBLCB0ZW1wQilcclxuXHJcblx0XHRpZiAoY29zaW5lID4gMS4wKSB7XHJcblx0XHRcdHJldHVybiAwXHJcblx0XHR9IGVsc2UgaWYgKGNvc2luZSA8IC0xLjApIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguUElcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmFjb3MoY29zaW5lKVxyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ0KGEpIHtcclxuXHRcdHJldHVybiAndmVjMygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnKSdcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGV4YWN0RXF1YWxzJDQoYSwgYikge1xyXG5cdFx0cmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBlcXVhbHMkNShhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl1cclxuXHRcdHJldHVybiAoXHJcblx0XHRcdE1hdGguYWJzKGEwIC0gYjApIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMSAtIGIxKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTIgLSBiMikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQ0ID0gc3VidHJhY3QkNFxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQ0ID0gbXVsdGlwbHkkNFxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXZpZGV9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkaXYgPSBkaXZpZGVcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkaXN0ID0gZGlzdGFuY2VcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5sZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW4gPSBsZW5ndGhcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZExlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckxlbiA9IHNxdWFyZWRMZW5ndGhcclxuXHQvKipcclxuXHQgKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjM3MgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XHJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxyXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gYVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcclxuXHRcdHZhciB2ZWMgPSBjcmVhdGUkNCgpXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XHJcblx0XHRcdHZhciBpLCBsXHJcblxyXG5cdFx0XHRpZiAoIXN0cmlkZSkge1xyXG5cdFx0XHRcdHN0cmlkZSA9IDNcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCFvZmZzZXQpIHtcclxuXHRcdFx0XHRvZmZzZXQgPSAwXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChjb3VudCkge1xyXG5cdFx0XHRcdGwgPSBNYXRoLm1pbihjb3VudCAqIHN0cmlkZSArIG9mZnNldCwgYS5sZW5ndGgpXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bCA9IGEubGVuZ3RoXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvciAoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XHJcblx0XHRcdFx0dmVjWzBdID0gYVtpXVxyXG5cdFx0XHRcdHZlY1sxXSA9IGFbaSArIDFdXHJcblx0XHRcdFx0dmVjWzJdID0gYVtpICsgMl1cclxuXHRcdFx0XHRmbih2ZWMsIHZlYywgYXJnKVxyXG5cdFx0XHRcdGFbaV0gPSB2ZWNbMF1cclxuXHRcdFx0XHRhW2kgKyAxXSA9IHZlY1sxXVxyXG5cdFx0XHRcdGFbaSArIDJdID0gdmVjWzJdXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhXHJcblx0XHR9XHJcblx0fSkoKVxyXG5cclxuXHR2YXIgdmVjMyA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQ0LFxyXG5cdFx0Y2xvbmU6IGNsb25lJDQsXHJcblx0XHRsZW5ndGg6IGxlbmd0aCxcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkNCxcclxuXHRcdGNvcHk6IGNvcHkkNCxcclxuXHRcdHNldDogc2V0JDQsXHJcblx0XHRhZGQ6IGFkZCQ0LFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0JDQsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkNCxcclxuXHRcdGRpdmlkZTogZGl2aWRlLFxyXG5cdFx0Y2VpbDogY2VpbCxcclxuXHRcdGZsb29yOiBmbG9vcixcclxuXHRcdG1pbjogbWluLFxyXG5cdFx0bWF4OiBtYXgsXHJcblx0XHRyb3VuZDogcm91bmQsXHJcblx0XHRzY2FsZTogc2NhbGUkNCxcclxuXHRcdHNjYWxlQW5kQWRkOiBzY2FsZUFuZEFkZCxcclxuXHRcdGRpc3RhbmNlOiBkaXN0YW5jZSxcclxuXHRcdHNxdWFyZWREaXN0YW5jZTogc3F1YXJlZERpc3RhbmNlLFxyXG5cdFx0c3F1YXJlZExlbmd0aDogc3F1YXJlZExlbmd0aCxcclxuXHRcdG5lZ2F0ZTogbmVnYXRlLFxyXG5cdFx0aW52ZXJzZTogaW52ZXJzZSxcclxuXHRcdG5vcm1hbGl6ZTogbm9ybWFsaXplLFxyXG5cdFx0ZG90OiBkb3QsXHJcblx0XHRjcm9zczogY3Jvc3MsXHJcblx0XHRsZXJwOiBsZXJwLFxyXG5cdFx0aGVybWl0ZTogaGVybWl0ZSxcclxuXHRcdGJlemllcjogYmV6aWVyLFxyXG5cdFx0cmFuZG9tOiByYW5kb20sXHJcblx0XHR0cmFuc2Zvcm1NYXQ0OiB0cmFuc2Zvcm1NYXQ0LFxyXG5cdFx0dHJhbnNmb3JtTWF0MzogdHJhbnNmb3JtTWF0MyxcclxuXHRcdHRyYW5zZm9ybVF1YXQ6IHRyYW5zZm9ybVF1YXQsXHJcblx0XHRyb3RhdGVYOiByb3RhdGVYJDEsXHJcblx0XHRyb3RhdGVZOiByb3RhdGVZJDEsXHJcblx0XHRyb3RhdGVaOiByb3RhdGVaJDEsXHJcblx0XHRhbmdsZTogYW5nbGUsXHJcblx0XHRzdHI6IHN0ciQ0LFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDQsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQ1LFxyXG5cdFx0c3ViOiBzdWIkNCxcclxuXHRcdG11bDogbXVsJDQsXHJcblx0XHRkaXY6IGRpdixcclxuXHRcdGRpc3Q6IGRpc3QsXHJcblx0XHRzcXJEaXN0OiBzcXJEaXN0LFxyXG5cdFx0bGVuOiBsZW4sXHJcblx0XHRzcXJMZW46IHNxckxlbixcclxuXHRcdGZvckVhY2g6IGZvckVhY2gsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogNCBEaW1lbnNpb25hbCBWZWN0b3JcclxuXHQgKiBAbW9kdWxlIHZlYzRcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjNFxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkNSgpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg0KVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMF0gPSAwXHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0XHRvdXRbM10gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDUoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDUoeCwgeSwgeiwgdykge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRvdXRbM10gPSB3XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWM0IHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBzb3VyY2UgdmVjdG9yXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDUob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0JDUob3V0LCB4LCB5LCB6LCB3KSB7XHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRvdXRbM10gPSB3XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkNShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDUob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdIC0gYlszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkNShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKiBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIERpdmlkZXMgdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXZpZGUkMShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC8gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAvIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLyBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjZWlsXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjZWlsJDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguY2VpbChhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pXHJcblx0XHRvdXRbM10gPSBNYXRoLmNlaWwoYVszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBmbG9vclxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZmxvb3IkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguZmxvb3IoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSlcclxuXHRcdG91dFszXSA9IE1hdGguZmxvb3IoYVszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1pbiQxKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKVxyXG5cdFx0b3V0WzNdID0gTWF0aC5taW4oYVszXSwgYlszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1heCQxKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKVxyXG5cdFx0b3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byByb3VuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm91bmQkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGgucm91bmQoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSlcclxuXHRcdG91dFszXSA9IE1hdGgucm91bmQoYVszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUkNShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzQncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZUFuZEFkZCQxKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGVcclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXN0YW5jZSQxKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF1cclxuXHRcdHZhciB5ID0gYlsxXSAtIGFbMV1cclxuXHRcdHZhciB6ID0gYlsyXSAtIGFbMl1cclxuXHRcdHZhciB3ID0gYlszXSAtIGFbM11cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHcpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZSQxKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF1cclxuXHRcdHZhciB5ID0gYlsxXSAtIGFbMV1cclxuXHRcdHZhciB6ID0gYlsyXSAtIGFbMl1cclxuXHRcdHZhciB3ID0gYlszXSAtIGFbM11cclxuXHRcdHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogd1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsZW5ndGgkMShhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF1cclxuXHRcdHZhciB5ID0gYVsxXVxyXG5cdFx0dmFyIHogPSBhWzJdXHJcblx0XHR2YXIgdyA9IGFbM11cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHcpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgkMShhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF1cclxuXHRcdHZhciB5ID0gYVsxXVxyXG5cdFx0dmFyIHogPSBhWzJdXHJcblx0XHR2YXIgdyA9IGFbM11cclxuXHRcdHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogd1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbmVnYXRlJDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAtYVswXVxyXG5cdFx0b3V0WzFdID0gLWFbMV1cclxuXHRcdG91dFsyXSA9IC1hWzJdXHJcblx0XHRvdXRbM10gPSAtYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGludmVydFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJzZSQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gMS4wIC8gYVswXVxyXG5cdFx0b3V0WzFdID0gMS4wIC8gYVsxXVxyXG5cdFx0b3V0WzJdID0gMS4wIC8gYVsyXVxyXG5cdFx0b3V0WzNdID0gMS4wIC8gYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBub3JtYWxpemUkMShvdXQsIGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHZhciB3ID0gYVszXVxyXG5cdFx0dmFyIGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3XHJcblxyXG5cdFx0aWYgKGxlbiA+IDApIHtcclxuXHRcdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0geCAqIGxlblxyXG5cdFx0b3V0WzFdID0geSAqIGxlblxyXG5cdFx0b3V0WzJdID0geiAqIGxlblxyXG5cdFx0b3V0WzNdID0gdyAqIGxlblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkb3QkMShhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM11cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlcnAkMShvdXQsIGEsIGIsIHQpIHtcclxuXHRcdHZhciBheCA9IGFbMF1cclxuXHRcdHZhciBheSA9IGFbMV1cclxuXHRcdHZhciBheiA9IGFbMl1cclxuXHRcdHZhciBhdyA9IGFbM11cclxuXHRcdG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpXHJcblx0XHRvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KVxyXG5cdFx0b3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheilcclxuXHRcdG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByYW5kb20kMShvdXQsIHNjYWxlKSB7XHJcblx0XHRzY2FsZSA9IHNjYWxlIHx8IDEuMCAvLyBNYXJzYWdsaWEsIEdlb3JnZS4gQ2hvb3NpbmcgYSBQb2ludCBmcm9tIHRoZSBTdXJmYWNlIG9mIGFcclxuXHRcdC8vIFNwaGVyZS4gQW5uLiBNYXRoLiBTdGF0aXN0LiA0MyAoMTk3MiksIG5vLiAyLCA2NDUtLTY0Ni5cclxuXHRcdC8vIGh0dHA6Ly9wcm9qZWN0ZXVjbGlkLm9yZy9ldWNsaWQuYW9tcy8xMTc3NjkyNjQ0O1xyXG5cclxuXHRcdHZhciB2MSwgdjIsIHYzLCB2NFxyXG5cdFx0dmFyIHMxLCBzMlxyXG5cclxuXHRcdGRvIHtcclxuXHRcdFx0djEgPSBSQU5ET00oKSAqIDIgLSAxXHJcblx0XHRcdHYyID0gUkFORE9NKCkgKiAyIC0gMVxyXG5cdFx0XHRzMSA9IHYxICogdjEgKyB2MiAqIHYyXHJcblx0XHR9IHdoaWxlIChzMSA+PSAxKVxyXG5cclxuXHRcdGRvIHtcclxuXHRcdFx0djMgPSBSQU5ET00oKSAqIDIgLSAxXHJcblx0XHRcdHY0ID0gUkFORE9NKCkgKiAyIC0gMVxyXG5cdFx0XHRzMiA9IHYzICogdjMgKyB2NCAqIHY0XHJcblx0XHR9IHdoaWxlIChzMiA+PSAxKVxyXG5cclxuXHRcdHZhciBkID0gTWF0aC5zcXJ0KCgxIC0gczEpIC8gczIpXHJcblx0XHRvdXRbMF0gPSBzY2FsZSAqIHYxXHJcblx0XHRvdXRbMV0gPSBzY2FsZSAqIHYyXHJcblx0XHRvdXRbMl0gPSBzY2FsZSAqIHYzICogZFxyXG5cdFx0b3V0WzNdID0gc2NhbGUgKiB2NCAqIGRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgbWF0NC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0NCQxKG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXSxcclxuXHRcdFx0eiA9IGFbMl0sXHJcblx0XHRcdHcgPSBhWzNdXHJcblx0XHRvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSAqIHdcclxuXHRcdG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogd1xyXG5cdFx0b3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdICogd1xyXG5cdFx0b3V0WzNdID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdICogd1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0JDEob3V0LCBhLCBxKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXVxyXG5cdFx0dmFyIHF4ID0gcVswXSxcclxuXHRcdFx0cXkgPSBxWzFdLFxyXG5cdFx0XHRxeiA9IHFbMl0sXHJcblx0XHRcdHF3ID0gcVszXSAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xyXG5cclxuXHRcdHZhciBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeVxyXG5cdFx0dmFyIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6XHJcblx0XHR2YXIgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHhcclxuXHRcdHZhciBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHogLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxyXG5cclxuXHRcdG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXlcclxuXHRcdG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXpcclxuXHRcdG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXhcclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkNShhKSB7XHJcblx0XHRyZXR1cm4gJ3ZlYzQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSdcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGV4YWN0RXF1YWxzJDUoYSwgYikge1xyXG5cdFx0cmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM11cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQ2KGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM11cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM11cclxuXHRcdHJldHVybiAoXHJcblx0XHRcdE1hdGguYWJzKGEwIC0gYjApIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMSAtIGIxKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTIgLSBiMikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcblx0XHRcdE1hdGguYWJzKGEzIC0gYjMpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3VidHJhY3R9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzdWIkNSA9IHN1YnRyYWN0JDVcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkNSA9IG11bHRpcGx5JDVcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGl2aWRlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZGl2JDEgPSBkaXZpZGUkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXN0YW5jZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpc3QkMSA9IGRpc3RhbmNlJDFcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZERpc3RhbmNlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyRGlzdCQxID0gc3F1YXJlZERpc3RhbmNlJDFcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuJDEgPSBsZW5ndGgkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkTGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyTGVuJDEgPSBzcXVhcmVkTGVuZ3RoJDFcclxuXHQvKipcclxuXHQgKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjNHMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjNC4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjNHMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XHJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxyXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gYVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZm9yRWFjaCQxID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHZlYyA9IGNyZWF0ZSQ1KClcclxuXHRcdHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcclxuXHRcdFx0dmFyIGksIGxcclxuXHJcblx0XHRcdGlmICghc3RyaWRlKSB7XHJcblx0XHRcdFx0c3RyaWRlID0gNFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIW9mZnNldCkge1xyXG5cdFx0XHRcdG9mZnNldCA9IDBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGNvdW50KSB7XHJcblx0XHRcdFx0bCA9IE1hdGgubWluKGNvdW50ICogc3RyaWRlICsgb2Zmc2V0LCBhLmxlbmd0aClcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsID0gYS5sZW5ndGhcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yIChpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcclxuXHRcdFx0XHR2ZWNbMF0gPSBhW2ldXHJcblx0XHRcdFx0dmVjWzFdID0gYVtpICsgMV1cclxuXHRcdFx0XHR2ZWNbMl0gPSBhW2kgKyAyXVxyXG5cdFx0XHRcdHZlY1szXSA9IGFbaSArIDNdXHJcblx0XHRcdFx0Zm4odmVjLCB2ZWMsIGFyZylcclxuXHRcdFx0XHRhW2ldID0gdmVjWzBdXHJcblx0XHRcdFx0YVtpICsgMV0gPSB2ZWNbMV1cclxuXHRcdFx0XHRhW2kgKyAyXSA9IHZlY1syXVxyXG5cdFx0XHRcdGFbaSArIDNdID0gdmVjWzNdXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhXHJcblx0XHR9XHJcblx0fSkoKVxyXG5cclxuXHR2YXIgdmVjNCA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQ1LFxyXG5cdFx0Y2xvbmU6IGNsb25lJDUsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDUsXHJcblx0XHRjb3B5OiBjb3B5JDUsXHJcblx0XHRzZXQ6IHNldCQ1LFxyXG5cdFx0YWRkOiBhZGQkNSxcclxuXHRcdHN1YnRyYWN0OiBzdWJ0cmFjdCQ1LFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDUsXHJcblx0XHRkaXZpZGU6IGRpdmlkZSQxLFxyXG5cdFx0Y2VpbDogY2VpbCQxLFxyXG5cdFx0Zmxvb3I6IGZsb29yJDEsXHJcblx0XHRtaW46IG1pbiQxLFxyXG5cdFx0bWF4OiBtYXgkMSxcclxuXHRcdHJvdW5kOiByb3VuZCQxLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDUsXHJcblx0XHRzY2FsZUFuZEFkZDogc2NhbGVBbmRBZGQkMSxcclxuXHRcdGRpc3RhbmNlOiBkaXN0YW5jZSQxLFxyXG5cdFx0c3F1YXJlZERpc3RhbmNlOiBzcXVhcmVkRGlzdGFuY2UkMSxcclxuXHRcdGxlbmd0aDogbGVuZ3RoJDEsXHJcblx0XHRzcXVhcmVkTGVuZ3RoOiBzcXVhcmVkTGVuZ3RoJDEsXHJcblx0XHRuZWdhdGU6IG5lZ2F0ZSQxLFxyXG5cdFx0aW52ZXJzZTogaW52ZXJzZSQxLFxyXG5cdFx0bm9ybWFsaXplOiBub3JtYWxpemUkMSxcclxuXHRcdGRvdDogZG90JDEsXHJcblx0XHRsZXJwOiBsZXJwJDEsXHJcblx0XHRyYW5kb206IHJhbmRvbSQxLFxyXG5cdFx0dHJhbnNmb3JtTWF0NDogdHJhbnNmb3JtTWF0NCQxLFxyXG5cdFx0dHJhbnNmb3JtUXVhdDogdHJhbnNmb3JtUXVhdCQxLFxyXG5cdFx0c3RyOiBzdHIkNSxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQ1LFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkNixcclxuXHRcdHN1Yjogc3ViJDUsXHJcblx0XHRtdWw6IG11bCQ1LFxyXG5cdFx0ZGl2OiBkaXYkMSxcclxuXHRcdGRpc3Q6IGRpc3QkMSxcclxuXHRcdHNxckRpc3Q6IHNxckRpc3QkMSxcclxuXHRcdGxlbjogbGVuJDEsXHJcblx0XHRzcXJMZW46IHNxckxlbiQxLFxyXG5cdFx0Zm9yRWFjaDogZm9yRWFjaCQxLFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIFF1YXRlcm5pb25cclxuXHQgKiBAbW9kdWxlIHF1YXRcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkNigpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg0KVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMF0gPSAwXHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQ0KG91dCkge1xyXG5cdFx0b3V0WzBdID0gMFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcclxuXHQgKiB0aGVuIHJldHVybnMgaXQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgYXJvdW5kIHdoaWNoIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXRBeGlzQW5nbGUob3V0LCBheGlzLCByYWQpIHtcclxuXHRcdHJhZCA9IHJhZCAqIDAuNVxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHRvdXRbMF0gPSBzICogYXhpc1swXVxyXG5cdFx0b3V0WzFdID0gcyAqIGF4aXNbMV1cclxuXHRcdG91dFsyXSA9IHMgKiBheGlzWzJdXHJcblx0XHRvdXRbM10gPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIHJvdGF0aW9uIGF4aXMgYW5kIGFuZ2xlIGZvciBhIGdpdmVuXHJcblx0ICogIHF1YXRlcm5pb24uIElmIGEgcXVhdGVybmlvbiBpcyBjcmVhdGVkIHdpdGhcclxuXHQgKiAgc2V0QXhpc0FuZ2xlLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgc2FtZVxyXG5cdCAqICB2YWx1ZXMgYXMgcHJvdmlkaWVkIGluIHRoZSBvcmlnaW5hbCBwYXJhbWV0ZXIgbGlzdFxyXG5cdCAqICBPUiBmdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB2YWx1ZXMuXHJcblx0ICogRXhhbXBsZTogVGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5IGF4aXMgWzAsIDAsIDFdIGFuZFxyXG5cdCAqICBhbmdsZSAtOTAgaXMgdGhlIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5XHJcblx0ICogIFswLCAwLCAxXSBhbmQgMjcwLiBUaGlzIG1ldGhvZCBmYXZvcnMgdGhlIGxhdHRlci5cclxuXHQgKiBAcGFyYW0gIHt2ZWMzfSBvdXRfYXhpcyAgVmVjdG9yIHJlY2VpdmluZyB0aGUgYXhpcyBvZiByb3RhdGlvblxyXG5cdCAqIEBwYXJhbSAge3F1YXR9IHEgICAgIFF1YXRlcm5pb24gdG8gYmUgZGVjb21wb3NlZFxyXG5cdCAqIEByZXR1cm4ge051bWJlcn0gICAgIEFuZ2xlLCBpbiByYWRpYW5zLCBvZiB0aGUgcm90YXRpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0QXhpc0FuZ2xlKG91dF9heGlzLCBxKSB7XHJcblx0XHR2YXIgcmFkID0gTWF0aC5hY29zKHFbM10pICogMi4wXHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZCAvIDIuMClcclxuXHJcblx0XHRpZiAocyA+IEVQU0lMT04pIHtcclxuXHRcdFx0b3V0X2F4aXNbMF0gPSBxWzBdIC8gc1xyXG5cdFx0XHRvdXRfYXhpc1sxXSA9IHFbMV0gLyBzXHJcblx0XHRcdG91dF9heGlzWzJdID0gcVsyXSAvIHNcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIElmIHMgaXMgemVybywgcmV0dXJuIGFueSBheGlzIChubyByb3RhdGlvbiAtIGF4aXMgZG9lcyBub3QgbWF0dGVyKVxyXG5cdFx0XHRvdXRfYXhpc1swXSA9IDFcclxuXHRcdFx0b3V0X2F4aXNbMV0gPSAwXHJcblx0XHRcdG91dF9heGlzWzJdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByYWRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQ2KG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0dmFyIGJ4ID0gYlswXSxcclxuXHRcdFx0YnkgPSBiWzFdLFxyXG5cdFx0XHRieiA9IGJbMl0sXHJcblx0XHRcdGJ3ID0gYlszXVxyXG5cdFx0b3V0WzBdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieVxyXG5cdFx0b3V0WzFdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBielxyXG5cdFx0b3V0WzJdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieFxyXG5cdFx0b3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFggYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWCQyKG91dCwgYSwgcmFkKSB7XHJcblx0XHRyYWQgKj0gMC41XHJcblx0XHR2YXIgYXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXSxcclxuXHRcdFx0YXcgPSBhWzNdXHJcblx0XHR2YXIgYnggPSBNYXRoLnNpbihyYWQpLFxyXG5cdFx0XHRidyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4XHJcblx0XHRvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieFxyXG5cdFx0b3V0WzJdID0gYXogKiBidyAtIGF5ICogYnhcclxuXHRcdG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWSBheGlzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVZJDIob3V0LCBhLCByYWQpIHtcclxuXHRcdHJhZCAqPSAwLjVcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdLFxyXG5cdFx0XHRhdyA9IGFbM11cclxuXHRcdHZhciBieSA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGJ3ID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gYXggKiBidyAtIGF6ICogYnlcclxuXHRcdG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5XHJcblx0XHRvdXRbMl0gPSBheiAqIGJ3ICsgYXggKiBieVxyXG5cdFx0b3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVokMihvdXQsIGEsIHJhZCkge1xyXG5cdFx0cmFkICo9IDAuNVxyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0dmFyIGJ6ID0gTWF0aC5zaW4ocmFkKSxcclxuXHRcdFx0YncgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBheCAqIGJ3ICsgYXkgKiBielxyXG5cdFx0b3V0WzFdID0gYXkgKiBidyAtIGF4ICogYnpcclxuXHRcdG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6XHJcblx0XHRvdXRbM10gPSBhdyAqIGJ3IC0gYXogKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBXIGNvbXBvbmVudCBvZiBhIHF1YXQgZnJvbSB0aGUgWCwgWSwgYW5kIFogY29tcG9uZW50cy5cclxuXHQgKiBBc3N1bWVzIHRoYXQgcXVhdGVybmlvbiBpcyAxIHVuaXQgaW4gbGVuZ3RoLlxyXG5cdCAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNhbGN1bGF0ZVcob3V0LCBhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXVxyXG5cdFx0b3V0WzBdID0geFxyXG5cdFx0b3V0WzFdID0geVxyXG5cdFx0b3V0WzJdID0gelxyXG5cdFx0b3V0WzNdID0gTWF0aC5zcXJ0KE1hdGguYWJzKDEuMCAtIHggKiB4IC0geSAqIHkgLSB6ICogeikpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzbGVycChvdXQsIGEsIGIsIHQpIHtcclxuXHRcdC8vIGJlbmNobWFya3M6XHJcblx0XHQvLyAgICBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXNsZXJwLWltcGxlbWVudGF0aW9uc1xyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0dmFyIGJ4ID0gYlswXSxcclxuXHRcdFx0YnkgPSBiWzFdLFxyXG5cdFx0XHRieiA9IGJbMl0sXHJcblx0XHRcdGJ3ID0gYlszXVxyXG5cdFx0dmFyIG9tZWdhLCBjb3NvbSwgc2lub20sIHNjYWxlMCwgc2NhbGUxIC8vIGNhbGMgY29zaW5lXHJcblxyXG5cdFx0Y29zb20gPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3IC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxyXG5cclxuXHRcdGlmIChjb3NvbSA8IDAuMCkge1xyXG5cdFx0XHRjb3NvbSA9IC1jb3NvbVxyXG5cdFx0XHRieCA9IC1ieFxyXG5cdFx0XHRieSA9IC1ieVxyXG5cdFx0XHRieiA9IC1ielxyXG5cdFx0XHRidyA9IC1id1xyXG5cdFx0fSAvLyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXHJcblxyXG5cdFx0aWYgKDEuMCAtIGNvc29tID4gRVBTSUxPTikge1xyXG5cdFx0XHQvLyBzdGFuZGFyZCBjYXNlIChzbGVycClcclxuXHRcdFx0b21lZ2EgPSBNYXRoLmFjb3MoY29zb20pXHJcblx0XHRcdHNpbm9tID0gTWF0aC5zaW4ob21lZ2EpXHJcblx0XHRcdHNjYWxlMCA9IE1hdGguc2luKCgxLjAgLSB0KSAqIG9tZWdhKSAvIHNpbm9tXHJcblx0XHRcdHNjYWxlMSA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gXCJmcm9tXCIgYW5kIFwidG9cIiBxdWF0ZXJuaW9ucyBhcmUgdmVyeSBjbG9zZVxyXG5cdFx0XHQvLyAgLi4uIHNvIHdlIGNhbiBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uXHJcblx0XHRcdHNjYWxlMCA9IDEuMCAtIHRcclxuXHRcdFx0c2NhbGUxID0gdFxyXG5cdFx0fSAvLyBjYWxjdWxhdGUgZmluYWwgdmFsdWVzXHJcblxyXG5cdFx0b3V0WzBdID0gc2NhbGUwICogYXggKyBzY2FsZTEgKiBieFxyXG5cdFx0b3V0WzFdID0gc2NhbGUwICogYXkgKyBzY2FsZTEgKiBieVxyXG5cdFx0b3V0WzJdID0gc2NhbGUwICogYXogKyBzY2FsZTEgKiBielxyXG5cdFx0b3V0WzNdID0gc2NhbGUwICogYXcgKyBzY2FsZTEgKiBid1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSByYW5kb20gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByYW5kb20kMihvdXQpIHtcclxuXHRcdC8vIEltcGxlbWVudGF0aW9uIG9mIGh0dHA6Ly9wbGFubmluZy5jcy51aXVjLmVkdS9ub2RlMTk4Lmh0bWxcclxuXHRcdC8vIFRPRE86IENhbGxpbmcgcmFuZG9tIDMgdGltZXMgaXMgcHJvYmFibHkgbm90IHRoZSBmYXN0ZXN0IHNvbHV0aW9uXHJcblx0XHR2YXIgdTEgPSBSQU5ET00oKVxyXG5cdFx0dmFyIHUyID0gUkFORE9NKClcclxuXHRcdHZhciB1MyA9IFJBTkRPTSgpXHJcblx0XHR2YXIgc3FydDFNaW51c1UxID0gTWF0aC5zcXJ0KDEgLSB1MSlcclxuXHRcdHZhciBzcXJ0VTEgPSBNYXRoLnNxcnQodTEpXHJcblx0XHRvdXRbMF0gPSBzcXJ0MU1pbnVzVTEgKiBNYXRoLnNpbigyLjAgKiBNYXRoLlBJICogdTIpXHJcblx0XHRvdXRbMV0gPSBzcXJ0MU1pbnVzVTEgKiBNYXRoLmNvcygyLjAgKiBNYXRoLlBJICogdTIpXHJcblx0XHRvdXRbMl0gPSBzcXJ0VTEgKiBNYXRoLnNpbigyLjAgKiBNYXRoLlBJICogdTMpXHJcblx0XHRvdXRbM10gPSBzcXJ0VTEgKiBNYXRoLmNvcygyLjAgKiBNYXRoLlBJICogdTMpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJ0JDQob3V0LCBhKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdXHJcblx0XHR2YXIgZG90JCQxID0gYTAgKiBhMCArIGExICogYTEgKyBhMiAqIGEyICsgYTMgKiBhM1xyXG5cdFx0dmFyIGludkRvdCA9IGRvdCQkMSA/IDEuMCAvIGRvdCQkMSA6IDAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcclxuXHJcblx0XHRvdXRbMF0gPSAtYTAgKiBpbnZEb3RcclxuXHRcdG91dFsxXSA9IC1hMSAqIGludkRvdFxyXG5cdFx0b3V0WzJdID0gLWEyICogaW52RG90XHJcblx0XHRvdXRbM10gPSBhMyAqIGludkRvdFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBjb25qdWdhdGUgb2YgYSBxdWF0XHJcblx0ICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IC1hWzBdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0b3V0WzJdID0gLWFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cclxuXHQgKlxyXG5cdCAqIE5PVEU6IFRoZSByZXN1bHRhbnQgcXVhdGVybmlvbiBpcyBub3Qgbm9ybWFsaXplZCwgc28geW91IHNob3VsZCBiZSBzdXJlXHJcblx0ICogdG8gcmVub3JtYWxpemUgdGhlIHF1YXRlcm5pb24geW91cnNlbGYgd2hlcmUgbmVjZXNzYXJ5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHttYXQzfSBtIHJvdGF0aW9uIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbU1hdDMob3V0LCBtKSB7XHJcblx0XHQvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xyXG5cdFx0Ly8gYXJ0aWNsZSBcIlF1YXRlcm5pb24gQ2FsY3VsdXMgYW5kIEZhc3QgQW5pbWF0aW9uXCIuXHJcblx0XHR2YXIgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdXHJcblx0XHR2YXIgZlJvb3RcclxuXHJcblx0XHRpZiAoZlRyYWNlID4gMC4wKSB7XHJcblx0XHRcdC8vIHx3fCA+IDEvMiwgbWF5IGFzIHdlbGwgY2hvb3NlIHcgPiAxLzJcclxuXHRcdFx0ZlJvb3QgPSBNYXRoLnNxcnQoZlRyYWNlICsgMS4wKSAvLyAyd1xyXG5cclxuXHRcdFx0b3V0WzNdID0gMC41ICogZlJvb3RcclxuXHRcdFx0ZlJvb3QgPSAwLjUgLyBmUm9vdCAvLyAxLyg0dylcclxuXHJcblx0XHRcdG91dFswXSA9IChtWzVdIC0gbVs3XSkgKiBmUm9vdFxyXG5cdFx0XHRvdXRbMV0gPSAobVs2XSAtIG1bMl0pICogZlJvb3RcclxuXHRcdFx0b3V0WzJdID0gKG1bMV0gLSBtWzNdKSAqIGZSb290XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB8d3wgPD0gMS8yXHJcblx0XHRcdHZhciBpID0gMFxyXG5cdFx0XHRpZiAobVs0XSA+IG1bMF0pIGkgPSAxXHJcblx0XHRcdGlmIChtWzhdID4gbVtpICogMyArIGldKSBpID0gMlxyXG5cdFx0XHR2YXIgaiA9IChpICsgMSkgJSAzXHJcblx0XHRcdHZhciBrID0gKGkgKyAyKSAlIDNcclxuXHRcdFx0ZlJvb3QgPSBNYXRoLnNxcnQobVtpICogMyArIGldIC0gbVtqICogMyArIGpdIC0gbVtrICogMyArIGtdICsgMS4wKVxyXG5cdFx0XHRvdXRbaV0gPSAwLjUgKiBmUm9vdFxyXG5cdFx0XHRmUm9vdCA9IDAuNSAvIGZSb290XHJcblx0XHRcdG91dFszXSA9IChtW2ogKiAzICsga10gLSBtW2sgKiAzICsgal0pICogZlJvb3RcclxuXHRcdFx0b3V0W2pdID0gKG1baiAqIDMgKyBpXSArIG1baSAqIDMgKyBqXSkgKiBmUm9vdFxyXG5cdFx0XHRvdXRba10gPSAobVtrICogMyArIGldICsgbVtpICogMyArIGtdKSAqIGZSb290XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiBldWxlciBhbmdsZSB4LCB5LCB6LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt4fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFggYXhpcyBpbiBkZWdyZWVzLlxyXG5cdCAqIEBwYXJhbSB7eX0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBZIGF4aXMgaW4gZGVncmVlcy5cclxuXHQgKiBAcGFyYW0ge3p9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWiBheGlzIGluIGRlZ3JlZXMuXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tRXVsZXIob3V0LCB4LCB5LCB6KSB7XHJcblx0XHR2YXIgaGFsZlRvUmFkID0gKDAuNSAqIE1hdGguUEkpIC8gMTgwLjBcclxuXHRcdHggKj0gaGFsZlRvUmFkXHJcblx0XHR5ICo9IGhhbGZUb1JhZFxyXG5cdFx0eiAqPSBoYWxmVG9SYWRcclxuXHRcdHZhciBzeCA9IE1hdGguc2luKHgpXHJcblx0XHR2YXIgY3ggPSBNYXRoLmNvcyh4KVxyXG5cdFx0dmFyIHN5ID0gTWF0aC5zaW4oeSlcclxuXHRcdHZhciBjeSA9IE1hdGguY29zKHkpXHJcblx0XHR2YXIgc3ogPSBNYXRoLnNpbih6KVxyXG5cdFx0dmFyIGN6ID0gTWF0aC5jb3MoeilcclxuXHRcdG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzelxyXG5cdFx0b3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6XHJcblx0XHRvdXRbMl0gPSBjeCAqIGN5ICogc3ogLSBzeCAqIHN5ICogY3pcclxuXHRcdG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzelxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcXVhdGVuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ2KGEpIHtcclxuXHRcdHJldHVybiAncXVhdCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBjbG9uZSQ2ID0gY2xvbmUkNVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGZyb21WYWx1ZXMkNiA9IGZyb21WYWx1ZXMkNVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBjb3B5JDYgPSBjb3B5JDVcclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc2V0JDYgPSBzZXQkNVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHF1YXQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGFkZCQ2ID0gYWRkJDVcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkNiA9IG11bHRpcGx5JDZcclxuXHQvKipcclxuXHQgKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc2NhbGUkNiA9IHNjYWxlJDVcclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZG90JDIgPSBkb3QkMVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlcnAkMiA9IGxlcnAkMVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW5ndGgkMiA9IGxlbmd0aCQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbiQyID0gbGVuZ3RoJDJcclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3F1YXJlZExlbmd0aCQyID0gc3F1YXJlZExlbmd0aCQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBxdWF0LnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4kMiA9IHNxdWFyZWRMZW5ndGgkMlxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG5vcm1hbGl6ZSQyID0gbm9ybWFsaXplJDFcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgVGhlIGZpcnN0IHF1YXRlcm5pb24uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIFRoZSBzZWNvbmQgcXVhdGVybmlvbi5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0dmFyIGV4YWN0RXF1YWxzJDYgPSBleGFjdEVxdWFscyQ1XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcXVhdGVybmlvbnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZXF1YWxzJDcgPSBlcXVhbHMkNlxyXG5cdC8qKlxyXG5cdCAqIFNldHMgYSBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCB0aGUgc2hvcnRlc3Qgcm90YXRpb24gZnJvbSBvbmVcclxuXHQgKiB2ZWN0b3IgdG8gYW5vdGhlci5cclxuXHQgKlxyXG5cdCAqIEJvdGggdmVjdG9ycyBhcmUgYXNzdW1lZCB0byBiZSB1bml0IGxlbmd0aC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvbi5cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGluaXRpYWwgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBkZXN0aW5hdGlvbiB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdHZhciByb3RhdGlvblRvID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHRtcHZlYzMgPSBjcmVhdGUkNCgpXHJcblx0XHR2YXIgeFVuaXRWZWMzID0gZnJvbVZhbHVlcyQ0KDEsIDAsIDApXHJcblx0XHR2YXIgeVVuaXRWZWMzID0gZnJvbVZhbHVlcyQ0KDAsIDEsIDApXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XHJcblx0XHRcdHZhciBkb3QkJDEgPSBkb3QoYSwgYilcclxuXHJcblx0XHRcdGlmIChkb3QkJDEgPCAtMC45OTk5OTkpIHtcclxuXHRcdFx0XHRjcm9zcyh0bXB2ZWMzLCB4VW5pdFZlYzMsIGEpXHJcblx0XHRcdFx0aWYgKGxlbih0bXB2ZWMzKSA8IDAuMDAwMDAxKSBjcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpXHJcblx0XHRcdFx0bm9ybWFsaXplKHRtcHZlYzMsIHRtcHZlYzMpXHJcblx0XHRcdFx0c2V0QXhpc0FuZ2xlKG91dCwgdG1wdmVjMywgTWF0aC5QSSlcclxuXHRcdFx0XHRyZXR1cm4gb3V0XHJcblx0XHRcdH0gZWxzZSBpZiAoZG90JCQxID4gMC45OTk5OTkpIHtcclxuXHRcdFx0XHRvdXRbMF0gPSAwXHJcblx0XHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRcdG91dFsyXSA9IDBcclxuXHRcdFx0XHRvdXRbM10gPSAxXHJcblx0XHRcdFx0cmV0dXJuIG91dFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNyb3NzKHRtcHZlYzMsIGEsIGIpXHJcblx0XHRcdFx0b3V0WzBdID0gdG1wdmVjM1swXVxyXG5cdFx0XHRcdG91dFsxXSA9IHRtcHZlYzNbMV1cclxuXHRcdFx0XHRvdXRbMl0gPSB0bXB2ZWMzWzJdXHJcblx0XHRcdFx0b3V0WzNdID0gMSArIGRvdCQkMVxyXG5cdFx0XHRcdHJldHVybiBub3JtYWxpemUkMihvdXQsIG91dClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pKClcclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gZCB0aGUgZm91cnRoIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FsZXJwID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHRlbXAxID0gY3JlYXRlJDYoKVxyXG5cdFx0dmFyIHRlbXAyID0gY3JlYXRlJDYoKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG91dCwgYSwgYiwgYywgZCwgdCkge1xyXG5cdFx0XHRzbGVycCh0ZW1wMSwgYSwgZCwgdClcclxuXHRcdFx0c2xlcnAodGVtcDIsIGIsIGMsIHQpXHJcblx0XHRcdHNsZXJwKG91dCwgdGVtcDEsIHRlbXAyLCAyICogdCAqICgxIC0gdCkpXHJcblx0XHRcdHJldHVybiBvdXRcclxuXHRcdH1cclxuXHR9KSgpXHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgc3BlY2lmaWVkIHF1YXRlcm5pb24gd2l0aCB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW5cclxuXHQgKiBheGVzLiBFYWNoIGF4aXMgaXMgYSB2ZWMzIGFuZCBpcyBleHBlY3RlZCB0byBiZSB1bml0IGxlbmd0aCBhbmRcclxuXHQgKiBwZXJwZW5kaWN1bGFyIHRvIGFsbCBvdGhlciBzcGVjaWZpZWQgYXhlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdmlldyAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHZpZXdpbmcgZGlyZWN0aW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSByaWdodCB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJyaWdodFwiIGRpcmVjdGlvblxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdXAgICAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwidXBcIiBkaXJlY3Rpb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdHZhciBzZXRBeGVzID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG1hdHIgPSBjcmVhdGUkMigpXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24ob3V0LCB2aWV3LCByaWdodCwgdXApIHtcclxuXHRcdFx0bWF0clswXSA9IHJpZ2h0WzBdXHJcblx0XHRcdG1hdHJbM10gPSByaWdodFsxXVxyXG5cdFx0XHRtYXRyWzZdID0gcmlnaHRbMl1cclxuXHRcdFx0bWF0clsxXSA9IHVwWzBdXHJcblx0XHRcdG1hdHJbNF0gPSB1cFsxXVxyXG5cdFx0XHRtYXRyWzddID0gdXBbMl1cclxuXHRcdFx0bWF0clsyXSA9IC12aWV3WzBdXHJcblx0XHRcdG1hdHJbNV0gPSAtdmlld1sxXVxyXG5cdFx0XHRtYXRyWzhdID0gLXZpZXdbMl1cclxuXHRcdFx0cmV0dXJuIG5vcm1hbGl6ZSQyKG91dCwgZnJvbU1hdDMob3V0LCBtYXRyKSlcclxuXHRcdH1cclxuXHR9KSgpXHJcblxyXG5cdHZhciBxdWF0ID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDYsXHJcblx0XHRpZGVudGl0eTogaWRlbnRpdHkkNCxcclxuXHRcdHNldEF4aXNBbmdsZTogc2V0QXhpc0FuZ2xlLFxyXG5cdFx0Z2V0QXhpc0FuZ2xlOiBnZXRBeGlzQW5nbGUsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkNixcclxuXHRcdHJvdGF0ZVg6IHJvdGF0ZVgkMixcclxuXHRcdHJvdGF0ZVk6IHJvdGF0ZVkkMixcclxuXHRcdHJvdGF0ZVo6IHJvdGF0ZVokMixcclxuXHRcdGNhbGN1bGF0ZVc6IGNhbGN1bGF0ZVcsXHJcblx0XHRzbGVycDogc2xlcnAsXHJcblx0XHRyYW5kb206IHJhbmRvbSQyLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkNCxcclxuXHRcdGNvbmp1Z2F0ZTogY29uanVnYXRlLFxyXG5cdFx0ZnJvbU1hdDM6IGZyb21NYXQzLFxyXG5cdFx0ZnJvbUV1bGVyOiBmcm9tRXVsZXIsXHJcblx0XHRzdHI6IHN0ciQ2LFxyXG5cdFx0Y2xvbmU6IGNsb25lJDYsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDYsXHJcblx0XHRjb3B5OiBjb3B5JDYsXHJcblx0XHRzZXQ6IHNldCQ2LFxyXG5cdFx0YWRkOiBhZGQkNixcclxuXHRcdG11bDogbXVsJDYsXHJcblx0XHRzY2FsZTogc2NhbGUkNixcclxuXHRcdGRvdDogZG90JDIsXHJcblx0XHRsZXJwOiBsZXJwJDIsXHJcblx0XHRsZW5ndGg6IGxlbmd0aCQyLFxyXG5cdFx0bGVuOiBsZW4kMixcclxuXHRcdHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGgkMixcclxuXHRcdHNxckxlbjogc3FyTGVuJDIsXHJcblx0XHRub3JtYWxpemU6IG5vcm1hbGl6ZSQyLFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDYsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQ3LFxyXG5cdFx0cm90YXRpb25Ubzogcm90YXRpb25UbyxcclxuXHRcdHNxbGVycDogc3FsZXJwLFxyXG5cdFx0c2V0QXhlczogc2V0QXhlcyxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiBEdWFsIFF1YXRlcm5pb248YnI+XHJcblx0ICogRm9ybWF0OiBbcmVhbCwgZHVhbF08YnI+XHJcblx0ICogUXVhdGVybmlvbiBmb3JtYXQ6IFhZWlc8YnI+XHJcblx0ICogTWFrZSBzdXJlIHRvIGhhdmUgbm9ybWFsaXplZCBkdWFsIHF1YXRlcm5pb25zLCBvdGhlcndpc2UgdGhlIGZ1bmN0aW9ucyBtYXkgbm90IHdvcmsgYXMgaW50ZW5kZWQuPGJyPlxyXG5cdCAqIEBtb2R1bGUgcXVhdDJcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBkdWFsIHF1YXRcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gYSBuZXcgZHVhbCBxdWF0ZXJuaW9uIFtyZWFsIC0+IHJvdGF0aW9uLCBkdWFsIC0+IHRyYW5zbGF0aW9uXVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkNygpIHtcclxuXHRcdHZhciBkcSA9IG5ldyBBUlJBWV9UWVBFKDgpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdGRxWzBdID0gMFxyXG5cdFx0XHRkcVsxXSA9IDBcclxuXHRcdFx0ZHFbMl0gPSAwXHJcblx0XHRcdGRxWzRdID0gMFxyXG5cdFx0XHRkcVs1XSA9IDBcclxuXHRcdFx0ZHFbNl0gPSAwXHJcblx0XHRcdGRxWzddID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdGRxWzNdID0gMVxyXG5cdFx0cmV0dXJuIGRxXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBuZXcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDcoYSkge1xyXG5cdFx0dmFyIGRxID0gbmV3IEFSUkFZX1RZUEUoOClcclxuXHRcdGRxWzBdID0gYVswXVxyXG5cdFx0ZHFbMV0gPSBhWzFdXHJcblx0XHRkcVsyXSA9IGFbMl1cclxuXHRcdGRxWzNdID0gYVszXVxyXG5cdFx0ZHFbNF0gPSBhWzRdXHJcblx0XHRkcVs1XSA9IGFbNV1cclxuXHRcdGRxWzZdID0gYVs2XVxyXG5cdFx0ZHFbN10gPSBhWzddXHJcblx0XHRyZXR1cm4gZHFcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBkdWFsIHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geDEgWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTEgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gejEgWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdzEgVyBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geDIgWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gejIgWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdzIgVyBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG5ldyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyQ3KHgxLCB5MSwgejEsIHcxLCB4MiwgeTIsIHoyLCB3Mikge1xyXG5cdFx0dmFyIGRxID0gbmV3IEFSUkFZX1RZUEUoOClcclxuXHRcdGRxWzBdID0geDFcclxuXHRcdGRxWzFdID0geTFcclxuXHRcdGRxWzJdID0gejFcclxuXHRcdGRxWzNdID0gdzFcclxuXHRcdGRxWzRdID0geDJcclxuXHRcdGRxWzVdID0geTJcclxuXHRcdGRxWzZdID0gejJcclxuXHRcdGRxWzddID0gdzJcclxuXHRcdHJldHVybiBkcVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGR1YWwgcXVhdCBmcm9tIHRoZSBnaXZlbiB2YWx1ZXMgKHF1YXQgYW5kIHRyYW5zbGF0aW9uKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHgxIFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkxIFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcxIFcgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHgyIFggY29tcG9uZW50ICh0cmFuc2xhdGlvbilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnQgKHRyYW5zbGF0aW9uKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MiBaIGNvbXBvbmVudCAodHJhbnNsYXRpb24pXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBuZXcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uVmFsdWVzKHgxLCB5MSwgejEsIHcxLCB4MiwgeTIsIHoyKSB7XHJcblx0XHR2YXIgZHEgPSBuZXcgQVJSQVlfVFlQRSg4KVxyXG5cdFx0ZHFbMF0gPSB4MVxyXG5cdFx0ZHFbMV0gPSB5MVxyXG5cdFx0ZHFbMl0gPSB6MVxyXG5cdFx0ZHFbM10gPSB3MVxyXG5cdFx0dmFyIGF4ID0geDIgKiAwLjUsXHJcblx0XHRcdGF5ID0geTIgKiAwLjUsXHJcblx0XHRcdGF6ID0gejIgKiAwLjVcclxuXHRcdGRxWzRdID0gYXggKiB3MSArIGF5ICogejEgLSBheiAqIHkxXHJcblx0XHRkcVs1XSA9IGF5ICogdzEgKyBheiAqIHgxIC0gYXggKiB6MVxyXG5cdFx0ZHFbNl0gPSBheiAqIHcxICsgYXggKiB5MSAtIGF5ICogeDFcclxuXHRcdGRxWzddID0gLWF4ICogeDEgLSBheSAqIHkxIC0gYXogKiB6MVxyXG5cdFx0cmV0dXJuIGRxXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHF1YXRlcm5pb24gYW5kIGEgdHJhbnNsYXRpb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB0IHRyYW5sYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24kMShvdXQsIHEsIHQpIHtcclxuXHRcdHZhciBheCA9IHRbMF0gKiAwLjUsXHJcblx0XHRcdGF5ID0gdFsxXSAqIDAuNSxcclxuXHRcdFx0YXogPSB0WzJdICogMC41LFxyXG5cdFx0XHRieCA9IHFbMF0sXHJcblx0XHRcdGJ5ID0gcVsxXSxcclxuXHRcdFx0YnogPSBxWzJdLFxyXG5cdFx0XHRidyA9IHFbM11cclxuXHRcdG91dFswXSA9IGJ4XHJcblx0XHRvdXRbMV0gPSBieVxyXG5cdFx0b3V0WzJdID0gYnpcclxuXHRcdG91dFszXSA9IGJ3XHJcblx0XHRvdXRbNF0gPSBheCAqIGJ3ICsgYXkgKiBieiAtIGF6ICogYnlcclxuXHRcdG91dFs1XSA9IGF5ICogYncgKyBheiAqIGJ4IC0gYXggKiBielxyXG5cdFx0b3V0WzZdID0gYXogKiBidyArIGF4ICogYnkgLSBheSAqIGJ4XHJcblx0XHRvdXRbN10gPSAtYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHRyYW5zbGF0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHQgdHJhbnNsYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uJDMob3V0LCB0KSB7XHJcblx0XHRvdXRbMF0gPSAwXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRvdXRbNF0gPSB0WzBdICogMC41XHJcblx0XHRvdXRbNV0gPSB0WzFdICogMC41XHJcblx0XHRvdXRbNl0gPSB0WzJdICogMC41XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBkdWFsIHF1YXQgZnJvbSBhIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSB0aGUgcXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvbiQ0KG91dCwgcSkge1xyXG5cdFx0b3V0WzBdID0gcVswXVxyXG5cdFx0b3V0WzFdID0gcVsxXVxyXG5cdFx0b3V0WzJdID0gcVsyXVxyXG5cdFx0b3V0WzNdID0gcVszXVxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGR1YWwgcXVhdCBmcm9tIGEgbWF0cml4ICg0eDQpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBkdWFsIHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbU1hdDQkMShvdXQsIGEpIHtcclxuXHRcdC8vVE9ETyBPcHRpbWl6ZSB0aGlzXHJcblx0XHR2YXIgb3V0ZXIgPSBjcmVhdGUkNigpXHJcblx0XHRnZXRSb3RhdGlvbihvdXRlciwgYSlcclxuXHRcdHZhciB0ID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHRcdGdldFRyYW5zbGF0aW9uKHQsIGEpXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvbiQxKG91dCwgb3V0ZXIsIHQpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBkdWFsIHF1YXQgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgc291cmNlIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkNyhvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IGFbNF1cclxuXHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdG91dFs2XSA9IGFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IGEgZHVhbCBxdWF0IHRvIHRoZSBpZGVudGl0eSBkdWFsIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQ1KG91dCkge1xyXG5cdFx0b3V0WzBdID0gMFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBkdWFsIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4MSBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MSBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3MSBXIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5MiBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3MiBXIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldCQ3KG91dCwgeDEsIHkxLCB6MSwgdzEsIHgyLCB5MiwgejIsIHcyKSB7XHJcblx0XHRvdXRbMF0gPSB4MVxyXG5cdFx0b3V0WzFdID0geTFcclxuXHRcdG91dFsyXSA9IHoxXHJcblx0XHRvdXRbM10gPSB3MVxyXG5cdFx0b3V0WzRdID0geDJcclxuXHRcdG91dFs1XSA9IHkyXHJcblx0XHRvdXRbNl0gPSB6MlxyXG5cdFx0b3V0WzddID0gdzJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcmVhbCBwYXJ0IG9mIGEgZHVhbCBxdWF0XHJcblx0ICogQHBhcmFtICB7cXVhdH0gb3V0IHJlYWwgcGFydFxyXG5cdCAqIEBwYXJhbSAge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm4ge3F1YXR9IHJlYWwgcGFydFxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZ2V0UmVhbCA9IGNvcHkkNlxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIGR1YWwgcGFydCBvZiBhIGR1YWwgcXVhdFxyXG5cdCAqIEBwYXJhbSAge3F1YXR9IG91dCBkdWFsIHBhcnRcclxuXHQgKiBAcGFyYW0gIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJuIHtxdWF0fSBkdWFsIHBhcnRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0RHVhbChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbNF1cclxuXHRcdG91dFsxXSA9IGFbNV1cclxuXHRcdG91dFsyXSA9IGFbNl1cclxuXHRcdG91dFszXSA9IGFbN11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSByZWFsIGNvbXBvbmVudCBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByZWFsIHBhcnRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc2V0UmVhbCA9IGNvcHkkNlxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZHVhbCBjb21wb25lbnQgb2YgYSBkdWFsIHF1YXQgdG8gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgZHVhbCBwYXJ0XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0RHVhbChvdXQsIHEpIHtcclxuXHRcdG91dFs0XSA9IHFbMF1cclxuXHRcdG91dFs1XSA9IHFbMV1cclxuXHRcdG91dFs2XSA9IHFbMl1cclxuXHRcdG91dFs3XSA9IHFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgdHJhbnNsYXRpb24gb2YgYSBub3JtYWxpemVkIGR1YWwgcXVhdFxyXG5cdCAqIEBwYXJhbSAge3ZlYzN9IG91dCB0cmFuc2xhdGlvblxyXG5cdCAqIEBwYXJhbSAge3F1YXQyfSBhIER1YWwgUXVhdGVybmlvbiB0byBiZSBkZWNvbXBvc2VkXHJcblx0ICogQHJldHVybiB7dmVjM30gdHJhbnNsYXRpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24kMShvdXQsIGEpIHtcclxuXHRcdHZhciBheCA9IGFbNF0sXHJcblx0XHRcdGF5ID0gYVs1XSxcclxuXHRcdFx0YXogPSBhWzZdLFxyXG5cdFx0XHRhdyA9IGFbN10sXHJcblx0XHRcdGJ4ID0gLWFbMF0sXHJcblx0XHRcdGJ5ID0gLWFbMV0sXHJcblx0XHRcdGJ6ID0gLWFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXVxyXG5cdFx0b3V0WzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMlxyXG5cdFx0b3V0WzFdID0gKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMlxyXG5cdFx0b3V0WzJdID0gKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2xhdGVzIGEgZHVhbCBxdWF0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byB0cmFuc2xhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zbGF0ZSQzKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGF4MSA9IGFbMF0sXHJcblx0XHRcdGF5MSA9IGFbMV0sXHJcblx0XHRcdGF6MSA9IGFbMl0sXHJcblx0XHRcdGF3MSA9IGFbM10sXHJcblx0XHRcdGJ4MSA9IHZbMF0gKiAwLjUsXHJcblx0XHRcdGJ5MSA9IHZbMV0gKiAwLjUsXHJcblx0XHRcdGJ6MSA9IHZbMl0gKiAwLjUsXHJcblx0XHRcdGF4MiA9IGFbNF0sXHJcblx0XHRcdGF5MiA9IGFbNV0sXHJcblx0XHRcdGF6MiA9IGFbNl0sXHJcblx0XHRcdGF3MiA9IGFbN11cclxuXHRcdG91dFswXSA9IGF4MVxyXG5cdFx0b3V0WzFdID0gYXkxXHJcblx0XHRvdXRbMl0gPSBhejFcclxuXHRcdG91dFszXSA9IGF3MVxyXG5cdFx0b3V0WzRdID0gYXcxICogYngxICsgYXkxICogYnoxIC0gYXoxICogYnkxICsgYXgyXHJcblx0XHRvdXRbNV0gPSBhdzEgKiBieTEgKyBhejEgKiBieDEgLSBheDEgKiBiejEgKyBheTJcclxuXHRcdG91dFs2XSA9IGF3MSAqIGJ6MSArIGF4MSAqIGJ5MSAtIGF5MSAqIGJ4MSArIGF6MlxyXG5cdFx0b3V0WzddID0gLWF4MSAqIGJ4MSAtIGF5MSAqIGJ5MSAtIGF6MSAqIGJ6MSArIGF3MlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCB0aGUgWCBheGlzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZCBob3cgZmFyIHNob3VsZCB0aGUgcm90YXRpb24gYmVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVYJDMob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBieCA9IC1hWzBdLFxyXG5cdFx0XHRieSA9IC1hWzFdLFxyXG5cdFx0XHRieiA9IC1hWzJdLFxyXG5cdFx0XHRidyA9IGFbM10sXHJcblx0XHRcdGF4ID0gYVs0XSxcclxuXHRcdFx0YXkgPSBhWzVdLFxyXG5cdFx0XHRheiA9IGFbNl0sXHJcblx0XHRcdGF3ID0gYVs3XSxcclxuXHRcdFx0YXgxID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSxcclxuXHRcdFx0YXkxID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieixcclxuXHRcdFx0YXoxID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCxcclxuXHRcdFx0YXcxID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBielxyXG5cdFx0cm90YXRlWCQyKG91dCwgYSwgcmFkKVxyXG5cdFx0YnggPSBvdXRbMF1cclxuXHRcdGJ5ID0gb3V0WzFdXHJcblx0XHRieiA9IG91dFsyXVxyXG5cdFx0YncgPSBvdXRbM11cclxuXHRcdG91dFs0XSA9IGF4MSAqIGJ3ICsgYXcxICogYnggKyBheTEgKiBieiAtIGF6MSAqIGJ5XHJcblx0XHRvdXRbNV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBielxyXG5cdFx0b3V0WzZdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYnhcclxuXHRcdG91dFs3XSA9IGF3MSAqIGJ3IC0gYXgxICogYnggLSBheTEgKiBieSAtIGF6MSAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYXJvdW5kIHRoZSBZIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmFkIGhvdyBmYXIgc2hvdWxkIHRoZSByb3RhdGlvbiBiZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVkkMyhvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGJ4ID0gLWFbMF0sXHJcblx0XHRcdGJ5ID0gLWFbMV0sXHJcblx0XHRcdGJ6ID0gLWFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXSxcclxuXHRcdFx0YXggPSBhWzRdLFxyXG5cdFx0XHRheSA9IGFbNV0sXHJcblx0XHRcdGF6ID0gYVs2XSxcclxuXHRcdFx0YXcgPSBhWzddLFxyXG5cdFx0XHRheDEgPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5LFxyXG5cdFx0XHRheTEgPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6LFxyXG5cdFx0XHRhejEgPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4LFxyXG5cdFx0XHRhdzEgPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6XHJcblx0XHRyb3RhdGVZJDIob3V0LCBhLCByYWQpXHJcblx0XHRieCA9IG91dFswXVxyXG5cdFx0YnkgPSBvdXRbMV1cclxuXHRcdGJ6ID0gb3V0WzJdXHJcblx0XHRidyA9IG91dFszXVxyXG5cdFx0b3V0WzRdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnlcclxuXHRcdG91dFs1XSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6XHJcblx0XHRvdXRbNl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieFxyXG5cdFx0b3V0WzddID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgdGhlIFogYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWQgaG93IGZhciBzaG91bGQgdGhlIHJvdGF0aW9uIGJlXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWiQzKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYnggPSAtYVswXSxcclxuXHRcdFx0YnkgPSAtYVsxXSxcclxuXHRcdFx0YnogPSAtYVsyXSxcclxuXHRcdFx0YncgPSBhWzNdLFxyXG5cdFx0XHRheCA9IGFbNF0sXHJcblx0XHRcdGF5ID0gYVs1XSxcclxuXHRcdFx0YXogPSBhWzZdLFxyXG5cdFx0XHRhdyA9IGFbN10sXHJcblx0XHRcdGF4MSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnksXHJcblx0XHRcdGF5MSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnosXHJcblx0XHRcdGF6MSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngsXHJcblx0XHRcdGF3MSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYnpcclxuXHRcdHJvdGF0ZVokMihvdXQsIGEsIHJhZClcclxuXHRcdGJ4ID0gb3V0WzBdXHJcblx0XHRieSA9IG91dFsxXVxyXG5cdFx0YnogPSBvdXRbMl1cclxuXHRcdGJ3ID0gb3V0WzNdXHJcblx0XHRvdXRbNF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieVxyXG5cdFx0b3V0WzVdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYnpcclxuXHRcdG91dFs2XSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4XHJcblx0XHRvdXRbN10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGJ5IGEgZ2l2ZW4gcXVhdGVybmlvbiAoYSAqIHEpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gcm90YXRlIGJ5XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlQnlRdWF0QXBwZW5kKG91dCwgYSwgcSkge1xyXG5cdFx0dmFyIHF4ID0gcVswXSxcclxuXHRcdFx0cXkgPSBxWzFdLFxyXG5cdFx0XHRxeiA9IHFbMl0sXHJcblx0XHRcdHF3ID0gcVszXSxcclxuXHRcdFx0YXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXSxcclxuXHRcdFx0YXcgPSBhWzNdXHJcblx0XHRvdXRbMF0gPSBheCAqIHF3ICsgYXcgKiBxeCArIGF5ICogcXogLSBheiAqIHF5XHJcblx0XHRvdXRbMV0gPSBheSAqIHF3ICsgYXcgKiBxeSArIGF6ICogcXggLSBheCAqIHF6XHJcblx0XHRvdXRbMl0gPSBheiAqIHF3ICsgYXcgKiBxeiArIGF4ICogcXkgLSBheSAqIHF4XHJcblx0XHRvdXRbM10gPSBhdyAqIHF3IC0gYXggKiBxeCAtIGF5ICogcXkgLSBheiAqIHF6XHJcblx0XHRheCA9IGFbNF1cclxuXHRcdGF5ID0gYVs1XVxyXG5cdFx0YXogPSBhWzZdXHJcblx0XHRhdyA9IGFbN11cclxuXHRcdG91dFs0XSA9IGF4ICogcXcgKyBhdyAqIHF4ICsgYXkgKiBxeiAtIGF6ICogcXlcclxuXHRcdG91dFs1XSA9IGF5ICogcXcgKyBhdyAqIHF5ICsgYXogKiBxeCAtIGF4ICogcXpcclxuXHRcdG91dFs2XSA9IGF6ICogcXcgKyBhdyAqIHF6ICsgYXggKiBxeSAtIGF5ICogcXhcclxuXHRcdG91dFs3XSA9IGF3ICogcXcgLSBheCAqIHF4IC0gYXkgKiBxeSAtIGF6ICogcXpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIGR1YWwgcXVhdCBieSBhIGdpdmVuIHF1YXRlcm5pb24gKHEgKiBhKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gcm90YXRlIGJ5XHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZUJ5UXVhdFByZXBlbmQob3V0LCBxLCBhKSB7XHJcblx0XHR2YXIgcXggPSBxWzBdLFxyXG5cdFx0XHRxeSA9IHFbMV0sXHJcblx0XHRcdHF6ID0gcVsyXSxcclxuXHRcdFx0cXcgPSBxWzNdLFxyXG5cdFx0XHRieCA9IGFbMF0sXHJcblx0XHRcdGJ5ID0gYVsxXSxcclxuXHRcdFx0YnogPSBhWzJdLFxyXG5cdFx0XHRidyA9IGFbM11cclxuXHRcdG91dFswXSA9IHF4ICogYncgKyBxdyAqIGJ4ICsgcXkgKiBieiAtIHF6ICogYnlcclxuXHRcdG91dFsxXSA9IHF5ICogYncgKyBxdyAqIGJ5ICsgcXogKiBieCAtIHF4ICogYnpcclxuXHRcdG91dFsyXSA9IHF6ICogYncgKyBxdyAqIGJ6ICsgcXggKiBieSAtIHF5ICogYnhcclxuXHRcdG91dFszXSA9IHF3ICogYncgLSBxeCAqIGJ4IC0gcXkgKiBieSAtIHF6ICogYnpcclxuXHRcdGJ4ID0gYVs0XVxyXG5cdFx0YnkgPSBhWzVdXHJcblx0XHRieiA9IGFbNl1cclxuXHRcdGJ3ID0gYVs3XVxyXG5cdFx0b3V0WzRdID0gcXggKiBidyArIHF3ICogYnggKyBxeSAqIGJ6IC0gcXogKiBieVxyXG5cdFx0b3V0WzVdID0gcXkgKiBidyArIHF3ICogYnkgKyBxeiAqIGJ4IC0gcXggKiBielxyXG5cdFx0b3V0WzZdID0gcXogKiBidyArIHF3ICogYnogKyBxeCAqIGJ5IC0gcXkgKiBieFxyXG5cdFx0b3V0WzddID0gcXcgKiBidyAtIHF4ICogYnggLSBxeSAqIGJ5IC0gcXogKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCBhIGdpdmVuIGF4aXMuIERvZXMgdGhlIG5vcm1hbGlzYXRpb24gYXV0b21hdGljYWxseVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCBob3cgZmFyIHRoZSByb3RhdGlvbiBzaG91bGQgYmVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVBcm91bmRBeGlzKG91dCwgYSwgYXhpcywgcmFkKSB7XHJcblx0XHQvL1NwZWNpYWwgY2FzZSBmb3IgcmFkID0gMFxyXG5cdFx0aWYgKE1hdGguYWJzKHJhZCkgPCBFUFNJTE9OKSB7XHJcblx0XHRcdHJldHVybiBjb3B5JDcob3V0LCBhKVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBheGlzTGVuZ3RoID0gTWF0aC5zcXJ0KGF4aXNbMF0gKiBheGlzWzBdICsgYXhpc1sxXSAqIGF4aXNbMV0gKyBheGlzWzJdICogYXhpc1syXSlcclxuXHRcdHJhZCA9IHJhZCAqIDAuNVxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYnggPSAocyAqIGF4aXNbMF0pIC8gYXhpc0xlbmd0aFxyXG5cdFx0dmFyIGJ5ID0gKHMgKiBheGlzWzFdKSAvIGF4aXNMZW5ndGhcclxuXHRcdHZhciBieiA9IChzICogYXhpc1syXSkgLyBheGlzTGVuZ3RoXHJcblx0XHR2YXIgYncgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHR2YXIgYXgxID0gYVswXSxcclxuXHRcdFx0YXkxID0gYVsxXSxcclxuXHRcdFx0YXoxID0gYVsyXSxcclxuXHRcdFx0YXcxID0gYVszXVxyXG5cdFx0b3V0WzBdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnlcclxuXHRcdG91dFsxXSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6XHJcblx0XHRvdXRbMl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieFxyXG5cdFx0b3V0WzNdID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYnpcclxuXHRcdHZhciBheCA9IGFbNF0sXHJcblx0XHRcdGF5ID0gYVs1XSxcclxuXHRcdFx0YXogPSBhWzZdLFxyXG5cdFx0XHRhdyA9IGFbN11cclxuXHRcdG91dFs0XSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnlcclxuXHRcdG91dFs1XSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnpcclxuXHRcdG91dFs2XSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYnhcclxuXHRcdG91dFs3XSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gZHVhbCBxdWF0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQ3KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gKyBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XVxyXG5cdFx0b3V0WzZdID0gYVs2XSArIGJbNl1cclxuXHRcdG91dFs3XSA9IGFbN10gKyBiWzddXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIGR1YWwgcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQ3KG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGF4MCA9IGFbMF0sXHJcblx0XHRcdGF5MCA9IGFbMV0sXHJcblx0XHRcdGF6MCA9IGFbMl0sXHJcblx0XHRcdGF3MCA9IGFbM10sXHJcblx0XHRcdGJ4MSA9IGJbNF0sXHJcblx0XHRcdGJ5MSA9IGJbNV0sXHJcblx0XHRcdGJ6MSA9IGJbNl0sXHJcblx0XHRcdGJ3MSA9IGJbN10sXHJcblx0XHRcdGF4MSA9IGFbNF0sXHJcblx0XHRcdGF5MSA9IGFbNV0sXHJcblx0XHRcdGF6MSA9IGFbNl0sXHJcblx0XHRcdGF3MSA9IGFbN10sXHJcblx0XHRcdGJ4MCA9IGJbMF0sXHJcblx0XHRcdGJ5MCA9IGJbMV0sXHJcblx0XHRcdGJ6MCA9IGJbMl0sXHJcblx0XHRcdGJ3MCA9IGJbM11cclxuXHRcdG91dFswXSA9IGF4MCAqIGJ3MCArIGF3MCAqIGJ4MCArIGF5MCAqIGJ6MCAtIGF6MCAqIGJ5MFxyXG5cdFx0b3V0WzFdID0gYXkwICogYncwICsgYXcwICogYnkwICsgYXowICogYngwIC0gYXgwICogYnowXHJcblx0XHRvdXRbMl0gPSBhejAgKiBidzAgKyBhdzAgKiBiejAgKyBheDAgKiBieTAgLSBheTAgKiBieDBcclxuXHRcdG91dFszXSA9IGF3MCAqIGJ3MCAtIGF4MCAqIGJ4MCAtIGF5MCAqIGJ5MCAtIGF6MCAqIGJ6MFxyXG5cdFx0b3V0WzRdID1cclxuXHRcdFx0YXgwICogYncxICsgYXcwICogYngxICsgYXkwICogYnoxIC0gYXowICogYnkxICsgYXgxICogYncwICsgYXcxICogYngwICsgYXkxICogYnowIC0gYXoxICogYnkwXHJcblx0XHRvdXRbNV0gPVxyXG5cdFx0XHRheTAgKiBidzEgKyBhdzAgKiBieTEgKyBhejAgKiBieDEgLSBheDAgKiBiejEgKyBheTEgKiBidzAgKyBhdzEgKiBieTAgKyBhejEgKiBieDAgLSBheDEgKiBiejBcclxuXHRcdG91dFs2XSA9XHJcblx0XHRcdGF6MCAqIGJ3MSArIGF3MCAqIGJ6MSArIGF4MCAqIGJ5MSAtIGF5MCAqIGJ4MSArIGF6MSAqIGJ3MCArIGF3MSAqIGJ6MCArIGF4MSAqIGJ5MCAtIGF5MSAqIGJ4MFxyXG5cdFx0b3V0WzddID1cclxuXHRcdFx0YXcwICogYncxIC0gYXgwICogYngxIC0gYXkwICogYnkxIC0gYXowICogYnoxICsgYXcxICogYncwIC0gYXgxICogYngwIC0gYXkxICogYnkwIC0gYXoxICogYnowXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdDIubXVsdGlwbHl9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBtdWwkNyA9IG11bHRpcGx5JDdcclxuXHQvKipcclxuXHQgKiBTY2FsZXMgYSBkdWFsIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXQgdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIGR1YWwgcXVhdCBieVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDcob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRvdXRbM10gPSBhWzNdICogYlxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIGJcclxuXHRcdG91dFs1XSA9IGFbNV0gKiBiXHJcblx0XHRvdXRbNl0gPSBhWzZdICogYlxyXG5cdFx0b3V0WzddID0gYVs3XSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIGR1YWwgcXVhdCdzIChUaGUgZG90IHByb2R1Y3Qgb2YgdGhlIHJlYWwgcGFydHMpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkb3QkMyA9IGRvdCQyXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBkdWFsIHF1YXRzJ3NcclxuXHQgKiBOT1RFOiBUaGUgcmVzdWx0aW5nIGR1YWwgcXVhdGVybmlvbnMgd29uJ3QgYWx3YXlzIGJlIG5vcm1hbGl6ZWQgKFRoZSBlcnJvciBpcyBtb3N0IG5vdGljZWFibGUgd2hlbiB0ID0gMC41KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0XHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlcnAkMyhvdXQsIGEsIGIsIHQpIHtcclxuXHRcdHZhciBtdCA9IDEgLSB0XHJcblx0XHRpZiAoZG90JDMoYSwgYikgPCAwKSB0ID0gLXRcclxuXHRcdG91dFswXSA9IGFbMF0gKiBtdCArIGJbMF0gKiB0XHJcblx0XHRvdXRbMV0gPSBhWzFdICogbXQgKyBiWzFdICogdFxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIG10ICsgYlsyXSAqIHRcclxuXHRcdG91dFszXSA9IGFbM10gKiBtdCArIGJbM10gKiB0XHJcblx0XHRvdXRbNF0gPSBhWzRdICogbXQgKyBiWzRdICogdFxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIG10ICsgYls1XSAqIHRcclxuXHRcdG91dFs2XSA9IGFbNl0gKiBtdCArIGJbNl0gKiB0XHJcblx0XHRvdXRbN10gPSBhWzddICogbXQgKyBiWzddICogdFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgZHVhbCBxdWF0LiBJZiB0aGV5IGFyZSBub3JtYWxpemVkLCBjb25qdWdhdGUgaXMgY2hlYXBlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQkNShvdXQsIGEpIHtcclxuXHRcdHZhciBzcWxlbiA9IHNxdWFyZWRMZW5ndGgkMyhhKVxyXG5cdFx0b3V0WzBdID0gLWFbMF0gLyBzcWxlblxyXG5cdFx0b3V0WzFdID0gLWFbMV0gLyBzcWxlblxyXG5cdFx0b3V0WzJdID0gLWFbMl0gLyBzcWxlblxyXG5cdFx0b3V0WzNdID0gYVszXSAvIHNxbGVuXHJcblx0XHRvdXRbNF0gPSAtYVs0XSAvIHNxbGVuXHJcblx0XHRvdXRbNV0gPSAtYVs1XSAvIHNxbGVuXHJcblx0XHRvdXRbNl0gPSAtYVs2XSAvIHNxbGVuXHJcblx0XHRvdXRbN10gPSBhWzddIC8gc3FsZW5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgZHVhbCBxdWF0XHJcblx0ICogSWYgdGhlIGR1YWwgcXVhdGVybmlvbiBpcyBub3JtYWxpemVkLCB0aGlzIGZ1bmN0aW9uIGlzIGZhc3RlciB0aGFuIHF1YXQyLmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHF1YXQgdG8gY2FsY3VsYXRlIGNvbmp1Z2F0ZSBvZlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvbmp1Z2F0ZSQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gLWFbMF1cclxuXHRcdG91dFsxXSA9IC1hWzFdXHJcblx0XHRvdXRbMl0gPSAtYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gLWFbNF1cclxuXHRcdG91dFs1XSA9IC1hWzVdXHJcblx0XHRvdXRbNl0gPSAtYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBkdWFsIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0IHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuZ3RoJDMgPSBsZW5ndGgkMlxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdDIubGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuJDMgPSBsZW5ndGgkM1xyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgZHVhbCBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXVhcmVkTGVuZ3RoJDMgPSBzcXVhcmVkTGVuZ3RoJDJcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQyLnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4kMyA9IHNxdWFyZWRMZW5ndGgkM1xyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIGR1YWwgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbm9ybWFsaXplJDMob3V0LCBhKSB7XHJcblx0XHR2YXIgbWFnbml0dWRlID0gc3F1YXJlZExlbmd0aCQzKGEpXHJcblxyXG5cdFx0aWYgKG1hZ25pdHVkZSA+IDApIHtcclxuXHRcdFx0bWFnbml0dWRlID0gTWF0aC5zcXJ0KG1hZ25pdHVkZSlcclxuXHRcdFx0dmFyIGEwID0gYVswXSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR2YXIgYTEgPSBhWzFdIC8gbWFnbml0dWRlXHJcblx0XHRcdHZhciBhMiA9IGFbMl0gLyBtYWduaXR1ZGVcclxuXHRcdFx0dmFyIGEzID0gYVszXSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR2YXIgYjAgPSBhWzRdXHJcblx0XHRcdHZhciBiMSA9IGFbNV1cclxuXHRcdFx0dmFyIGIyID0gYVs2XVxyXG5cdFx0XHR2YXIgYjMgPSBhWzddXHJcblx0XHRcdHZhciBhX2RvdF9iID0gYTAgKiBiMCArIGExICogYjEgKyBhMiAqIGIyICsgYTMgKiBiM1xyXG5cdFx0XHRvdXRbMF0gPSBhMFxyXG5cdFx0XHRvdXRbMV0gPSBhMVxyXG5cdFx0XHRvdXRbMl0gPSBhMlxyXG5cdFx0XHRvdXRbM10gPSBhM1xyXG5cdFx0XHRvdXRbNF0gPSAoYjAgLSBhMCAqIGFfZG90X2IpIC8gbWFnbml0dWRlXHJcblx0XHRcdG91dFs1XSA9IChiMSAtIGExICogYV9kb3RfYikgLyBtYWduaXR1ZGVcclxuXHRcdFx0b3V0WzZdID0gKGIyIC0gYTIgKiBhX2RvdF9iKSAvIG1hZ25pdHVkZVxyXG5cdFx0XHRvdXRbN10gPSAoYjMgLSBhMyAqIGFfZG90X2IpIC8gbWFnbml0dWRlXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgZHVhbCBxdWF0ZW5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZHVhbCBxdWF0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ3KGEpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdCdxdWF0MignICtcclxuXHRcdFx0YVswXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzFdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbMl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVszXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzRdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs2XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzddICtcclxuXHRcdFx0JyknXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGR1YWwgcXVhdGVybmlvbnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3QgZHVhbCBxdWF0ZXJuaW9uLlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBkdWFsIHF1YXRlcm5pb24uXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgdGhlIGR1YWwgcXVhdGVybmlvbnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGV4YWN0RXF1YWxzJDcoYSwgYikge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0YVswXSA9PT0gYlswXSAmJlxyXG5cdFx0XHRhWzFdID09PSBiWzFdICYmXHJcblx0XHRcdGFbMl0gPT09IGJbMl0gJiZcclxuXHRcdFx0YVszXSA9PT0gYlszXSAmJlxyXG5cdFx0XHRhWzRdID09PSBiWzRdICYmXHJcblx0XHRcdGFbNV0gPT09IGJbNV0gJiZcclxuXHRcdFx0YVs2XSA9PT0gYls2XSAmJlxyXG5cdFx0XHRhWzddID09PSBiWzddXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGR1YWwgcXVhdGVybmlvbnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3QgZHVhbCBxdWF0LlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBkdWFsIHF1YXQuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgdGhlIGR1YWwgcXVhdHMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQ4KGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdLFxyXG5cdFx0XHRhNiA9IGFbNl0sXHJcblx0XHRcdGE3ID0gYVs3XVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXSxcclxuXHRcdFx0YjQgPSBiWzRdLFxyXG5cdFx0XHRiNSA9IGJbNV0sXHJcblx0XHRcdGI2ID0gYls2XSxcclxuXHRcdFx0YjcgPSBiWzddXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMyAtIGIzKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTQgLSBiNCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGE1IC0gYjUpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNiAtIGI2KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTcgLSBiNykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpXHJcblx0XHQpXHJcblx0fVxyXG5cclxuXHR2YXIgcXVhdDIgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkNyxcclxuXHRcdGNsb25lOiBjbG9uZSQ3LFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQ3LFxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25WYWx1ZXM6IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uVmFsdWVzLFxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb246IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uJDEsXHJcblx0XHRmcm9tVHJhbnNsYXRpb246IGZyb21UcmFuc2xhdGlvbiQzLFxyXG5cdFx0ZnJvbVJvdGF0aW9uOiBmcm9tUm90YXRpb24kNCxcclxuXHRcdGZyb21NYXQ0OiBmcm9tTWF0NCQxLFxyXG5cdFx0Y29weTogY29weSQ3LFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5JDUsXHJcblx0XHRzZXQ6IHNldCQ3LFxyXG5cdFx0Z2V0UmVhbDogZ2V0UmVhbCxcclxuXHRcdGdldER1YWw6IGdldER1YWwsXHJcblx0XHRzZXRSZWFsOiBzZXRSZWFsLFxyXG5cdFx0c2V0RHVhbDogc2V0RHVhbCxcclxuXHRcdGdldFRyYW5zbGF0aW9uOiBnZXRUcmFuc2xhdGlvbiQxLFxyXG5cdFx0dHJhbnNsYXRlOiB0cmFuc2xhdGUkMyxcclxuXHRcdHJvdGF0ZVg6IHJvdGF0ZVgkMyxcclxuXHRcdHJvdGF0ZVk6IHJvdGF0ZVkkMyxcclxuXHRcdHJvdGF0ZVo6IHJvdGF0ZVokMyxcclxuXHRcdHJvdGF0ZUJ5UXVhdEFwcGVuZDogcm90YXRlQnlRdWF0QXBwZW5kLFxyXG5cdFx0cm90YXRlQnlRdWF0UHJlcGVuZDogcm90YXRlQnlRdWF0UHJlcGVuZCxcclxuXHRcdHJvdGF0ZUFyb3VuZEF4aXM6IHJvdGF0ZUFyb3VuZEF4aXMsXHJcblx0XHRhZGQ6IGFkZCQ3LFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDcsXHJcblx0XHRtdWw6IG11bCQ3LFxyXG5cdFx0c2NhbGU6IHNjYWxlJDcsXHJcblx0XHRkb3Q6IGRvdCQzLFxyXG5cdFx0bGVycDogbGVycCQzLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkNSxcclxuXHRcdGNvbmp1Z2F0ZTogY29uanVnYXRlJDEsXHJcblx0XHRsZW5ndGg6IGxlbmd0aCQzLFxyXG5cdFx0bGVuOiBsZW4kMyxcclxuXHRcdHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGgkMyxcclxuXHRcdHNxckxlbjogc3FyTGVuJDMsXHJcblx0XHRub3JtYWxpemU6IG5vcm1hbGl6ZSQzLFxyXG5cdFx0c3RyOiBzdHIkNyxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQ3LFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkOCxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiAyIERpbWVuc2lvbmFsIFZlY3RvclxyXG5cdCAqIEBtb2R1bGUgdmVjMlxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQ4KCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDIpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFswXSA9IDBcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjbG9uZSQ4KGEpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgyKVxyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDgoeCwgeSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDIpXHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMyIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBzb3VyY2UgdmVjdG9yXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDgob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkOChvdXQsIHgsIHkpIHtcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkZCQ4KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDYob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5JDgob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogRGl2aWRlcyB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpdmlkZSQyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAvIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLyBiWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjZWlsXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjZWlsJDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguY2VpbChhWzFdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGZsb29yXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmbG9vciQyKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWluJDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1heCQyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gcm91bmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdW5kJDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyBhIHZlYzIgYnkgYSBzY2FsYXIgbnVtYmVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDgob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWRkcyB0d28gdmVjMidzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlQW5kQWRkJDIob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRpc3RhbmNlJDIoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXSxcclxuXHRcdFx0eSA9IGJbMV0gLSBhWzFdXHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZSQyKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF0sXHJcblx0XHRcdHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHlcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVuZ3RoJDQoYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoJDQoYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHlcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5lZ2F0ZSQyKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gLWFbMF1cclxuXHRcdG91dFsxXSA9IC1hWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gaW52ZXJ0XHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnNlJDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAxLjAgLyBhWzBdXHJcblx0XHRvdXRbMV0gPSAxLjAgLyBhWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBub3JtYWxpemVcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZSQ0KG91dCwgYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0dmFyIGxlbiA9IHggKiB4ICsgeSAqIHlcclxuXHJcblx0XHRpZiAobGVuID4gMCkge1xyXG5cdFx0XHQvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG5cdFx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSBhWzBdICogbGVuXHJcblx0XHRvdXRbMV0gPSBhWzFdICogbGVuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRvdCQ0KGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcclxuXHQgKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgbXVzdCBieSBkZWZpbml0aW9uIHByb2R1Y2UgYSAzRCB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3Jvc3MkMShvdXQsIGEsIGIpIHtcclxuXHRcdHZhciB6ID0gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXVxyXG5cdFx0b3V0WzBdID0gb3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gelxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVycCQ0KG91dCwgYSwgYiwgdCkge1xyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdXHJcblx0XHRvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KVxyXG5cdFx0b3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJhbmRvbSQzKG91dCwgc2NhbGUpIHtcclxuXHRcdHNjYWxlID0gc2NhbGUgfHwgMS4wXHJcblx0XHR2YXIgciA9IFJBTkRPTSgpICogMi4wICogTWF0aC5QSVxyXG5cdFx0b3V0WzBdID0gTWF0aC5jb3MocikgKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gTWF0aC5zaW4ocikgKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDIob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdXHJcblx0XHRvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5XHJcblx0XHRvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyZChvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV1cclxuXHRcdG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdXHJcblx0XHRvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5ICsgbVs1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQzXHJcblx0ICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQzfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0MyQxKG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0b3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl1cclxuXHRcdG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDRcclxuXHQgKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xyXG5cdCAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQkMihvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHRvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl1cclxuXHRcdG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGUgYSAyRCB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzJcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIHZlYzIgcG9pbnQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGUkNChvdXQsIGEsIGIsIGMpIHtcclxuXHRcdC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cclxuXHRcdHZhciBwMCA9IGFbMF0gLSBiWzBdLFxyXG5cdFx0XHRwMSA9IGFbMV0gLSBiWzFdLFxyXG5cdFx0XHRzaW5DID0gTWF0aC5zaW4oYyksXHJcblx0XHRcdGNvc0MgPSBNYXRoLmNvcyhjKSAvL3BlcmZvcm0gcm90YXRpb24gYW5kIHRyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gcDAgKiBjb3NDIC0gcDEgKiBzaW5DICsgYlswXVxyXG5cdFx0b3V0WzFdID0gcDAgKiBzaW5DICsgcDEgKiBjb3NDICsgYlsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDJEIHZlY3RvcnNcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYW5nbGUkMShhLCBiKSB7XHJcblx0XHR2YXIgeDEgPSBhWzBdLFxyXG5cdFx0XHR5MSA9IGFbMV0sXHJcblx0XHRcdHgyID0gYlswXSxcclxuXHRcdFx0eTIgPSBiWzFdXHJcblx0XHR2YXIgbGVuMSA9IHgxICogeDEgKyB5MSAqIHkxXHJcblxyXG5cdFx0aWYgKGxlbjEgPiAwKSB7XHJcblx0XHRcdC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XHJcblx0XHRcdGxlbjEgPSAxIC8gTWF0aC5zcXJ0KGxlbjEpXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGxlbjIgPSB4MiAqIHgyICsgeTIgKiB5MlxyXG5cclxuXHRcdGlmIChsZW4yID4gMCkge1xyXG5cdFx0XHQvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG5cdFx0XHRsZW4yID0gMSAvIE1hdGguc3FydChsZW4yKVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjb3NpbmUgPSAoeDEgKiB4MiArIHkxICogeTIpICogbGVuMSAqIGxlbjJcclxuXHJcblx0XHRpZiAoY29zaW5lID4gMS4wKSB7XHJcblx0XHRcdHJldHVybiAwXHJcblx0XHR9IGVsc2UgaWYgKGNvc2luZSA8IC0xLjApIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguUElcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmFjb3MoY29zaW5lKVxyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ4KGEpIHtcclxuXHRcdHJldHVybiAndmVjMignICsgYVswXSArICcsICcgKyBhWzFdICsgJyknXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgZXhhY3RseSBoYXZlIHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQ4KGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQ5KGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5sZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW4kNCA9IGxlbmd0aCQ0XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViJDYgPSBzdWJ0cmFjdCQ2XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDggPSBtdWx0aXBseSQ4XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpdmlkZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpdiQyID0gZGl2aWRlJDJcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkaXN0JDIgPSBkaXN0YW5jZSQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWREaXN0YW5jZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxckRpc3QkMiA9IHNxdWFyZWREaXN0YW5jZSQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4kNCA9IHNxdWFyZWRMZW5ndGgkNFxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMycyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcblx0ICogQHJldHVybnMge0FycmF5fSBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBmb3JFYWNoJDIgPSAoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdmVjID0gY3JlYXRlJDgoKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xyXG5cdFx0XHR2YXIgaSwgbFxyXG5cclxuXHRcdFx0aWYgKCFzdHJpZGUpIHtcclxuXHRcdFx0XHRzdHJpZGUgPSAyXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghb2Zmc2V0KSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gMFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoY291bnQpIHtcclxuXHRcdFx0XHRsID0gTWF0aC5taW4oY291bnQgKiBzdHJpZGUgKyBvZmZzZXQsIGEubGVuZ3RoKVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGwgPSBhLmxlbmd0aFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xyXG5cdFx0XHRcdHZlY1swXSA9IGFbaV1cclxuXHRcdFx0XHR2ZWNbMV0gPSBhW2kgKyAxXVxyXG5cdFx0XHRcdGZuKHZlYywgdmVjLCBhcmcpXHJcblx0XHRcdFx0YVtpXSA9IHZlY1swXVxyXG5cdFx0XHRcdGFbaSArIDFdID0gdmVjWzFdXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhXHJcblx0XHR9XHJcblx0fSkoKVxyXG5cclxuXHR2YXIgdmVjMiA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQ4LFxyXG5cdFx0Y2xvbmU6IGNsb25lJDgsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDgsXHJcblx0XHRjb3B5OiBjb3B5JDgsXHJcblx0XHRzZXQ6IHNldCQ4LFxyXG5cdFx0YWRkOiBhZGQkOCxcclxuXHRcdHN1YnRyYWN0OiBzdWJ0cmFjdCQ2LFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDgsXHJcblx0XHRkaXZpZGU6IGRpdmlkZSQyLFxyXG5cdFx0Y2VpbDogY2VpbCQyLFxyXG5cdFx0Zmxvb3I6IGZsb29yJDIsXHJcblx0XHRtaW46IG1pbiQyLFxyXG5cdFx0bWF4OiBtYXgkMixcclxuXHRcdHJvdW5kOiByb3VuZCQyLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDgsXHJcblx0XHRzY2FsZUFuZEFkZDogc2NhbGVBbmRBZGQkMixcclxuXHRcdGRpc3RhbmNlOiBkaXN0YW5jZSQyLFxyXG5cdFx0c3F1YXJlZERpc3RhbmNlOiBzcXVhcmVkRGlzdGFuY2UkMixcclxuXHRcdGxlbmd0aDogbGVuZ3RoJDQsXHJcblx0XHRzcXVhcmVkTGVuZ3RoOiBzcXVhcmVkTGVuZ3RoJDQsXHJcblx0XHRuZWdhdGU6IG5lZ2F0ZSQyLFxyXG5cdFx0aW52ZXJzZTogaW52ZXJzZSQyLFxyXG5cdFx0bm9ybWFsaXplOiBub3JtYWxpemUkNCxcclxuXHRcdGRvdDogZG90JDQsXHJcblx0XHRjcm9zczogY3Jvc3MkMSxcclxuXHRcdGxlcnA6IGxlcnAkNCxcclxuXHRcdHJhbmRvbTogcmFuZG9tJDMsXHJcblx0XHR0cmFuc2Zvcm1NYXQyOiB0cmFuc2Zvcm1NYXQyLFxyXG5cdFx0dHJhbnNmb3JtTWF0MmQ6IHRyYW5zZm9ybU1hdDJkLFxyXG5cdFx0dHJhbnNmb3JtTWF0MzogdHJhbnNmb3JtTWF0MyQxLFxyXG5cdFx0dHJhbnNmb3JtTWF0NDogdHJhbnNmb3JtTWF0NCQyLFxyXG5cdFx0cm90YXRlOiByb3RhdGUkNCxcclxuXHRcdGFuZ2xlOiBhbmdsZSQxLFxyXG5cdFx0c3RyOiBzdHIkOCxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQ4LFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkOSxcclxuXHRcdGxlbjogbGVuJDQsXHJcblx0XHRzdWI6IHN1YiQ2LFxyXG5cdFx0bXVsOiBtdWwkOCxcclxuXHRcdGRpdjogZGl2JDIsXHJcblx0XHRkaXN0OiBkaXN0JDIsXHJcblx0XHRzcXJEaXN0OiBzcXJEaXN0JDIsXHJcblx0XHRzcXJMZW46IHNxckxlbiQ0LFxyXG5cdFx0Zm9yRWFjaDogZm9yRWFjaCQyLFxyXG5cdH0pXHJcblxyXG5cdGV4cG9ydHMuZ2xNYXRyaXggPSBjb21tb25cclxuXHRleHBvcnRzLm1hdDIgPSBtYXQyXHJcblx0ZXhwb3J0cy5tYXQyZCA9IG1hdDJkXHJcblx0ZXhwb3J0cy5tYXQzID0gbWF0M1xyXG5cdGV4cG9ydHMubWF0NCA9IG1hdDRcclxuXHRleHBvcnRzLnF1YXQgPSBxdWF0XHJcblx0ZXhwb3J0cy5xdWF0MiA9IHF1YXQyXHJcblx0ZXhwb3J0cy52ZWMyID0gdmVjMlxyXG5cdGV4cG9ydHMudmVjMyA9IHZlYzNcclxuXHRleHBvcnRzLnZlYzQgPSB2ZWM0XHJcblxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSlcclxufSlcclxuIiwiLypcclxuICogQ29weXJpZ2h0IDIwMTIsIEdyZWdnIFRhdmFyZXMuXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxyXG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXHJcbiAqIG1ldDpcclxuICpcclxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcclxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXHJcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxyXG4gKiBkaXN0cmlidXRpb24uXHJcbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcclxuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cclxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xyXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXHJcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxyXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxyXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcclxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxyXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcclxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXHJcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcclxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXHJcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBwcm9ncmFtLCBhdHRhY2hlcyBzaGFkZXJzLCBiaW5kcyBhdHRyaWIgbG9jYXRpb25zLCBsaW5rcyB0aGVcclxuICogcHJvZ3JhbSBhbmQgY2FsbHMgdXNlUHJvZ3JhbS5cclxuICogQHBhcmFtIHtXZWJHTFNoYWRlcltdfSBzaGFkZXJzIFRoZSBzaGFkZXJzIHRvIGF0dGFjaFxyXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBbb3B0X2F0dHJpYnNdIEFuIGFycmF5IG9mIGF0dHJpYnMgbmFtZXMuXHJcbiAqIExvY2F0aW9ucyB3aWxsIGJlIGFzc2lnbmVkIGJ5IGluZGV4IGlmIG5vdCBwYXNzZWQgaW5cclxuICogQHBhcmFtIHtudW1iZXJbXX0gW29wdF9sb2NhdGlvbnNdIFRoZSBsb2NhdGlvbnMgZm9yIHRoZS5cclxuICogQSBwYXJhbGxlbCBhcnJheSB0byBvcHRfYXR0cmlicyBsZXR0aW5nIHlvdSBhc3NpZ24gbG9jYXRpb25zLlxyXG4gKiBAcGFyYW0ge21vZHVsZTp3ZWJnbC11dGlscy5FcnJvckNhbGxiYWNrfSBvcHRfZXJyb3JDYWxsYmFjayBjYWxsYmFjayBmb3IgZXJyb3JzLlxyXG4gKiBCeSBkZWZhdWx0IGl0IGp1c3QgcHJpbnRzIGFuIGVycm9yIHRvIHRoZSBjb25zb2xlIG9uIGVycm9yLlxyXG4gKiBJZiB5b3Ugd2FudCBzb21ldGhpbmcgZWxzZSBwYXNzIGFuIGNhbGxiYWNrLiBJdCdzIHBhc3NlZCBhbiBlcnJvciBtZXNzYWdlLlxyXG4gKiBAbWVtYmVyT2YgbW9kdWxlOndlYmdsLXV0aWxzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbShcclxuXHRnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0LFxyXG5cdHNoYWRlcnM6IFdlYkdMU2hhZGVyW10sXHJcblx0b3B0X2F0dHJpYnM/OiBzdHJpbmdbXSxcclxuXHRvcHRfbG9jYXRpb25zPzogbnVtYmVyW10sXHJcblx0b3B0X2Vycm9yQ2FsbGJhY2s/OiBhbnlcclxuKTogV2ViR0xQcm9ncmFtIHtcclxuXHRjb25zdCBlcnJGbiA9IG9wdF9lcnJvckNhbGxiYWNrIHx8IGNvbnNvbGUuZXJyb3JcclxuXHRjb25zdCBwcm9ncmFtOiBXZWJHTFByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKClcclxuXHJcblx0c2hhZGVycy5mb3JFYWNoKChzaGFkZXIpID0+IGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBzaGFkZXIpKVxyXG5cclxuXHRpZiAob3B0X2F0dHJpYnMpIHtcclxuXHRcdG9wdF9hdHRyaWJzLmZvckVhY2goKGF0dHJpYiwgbmR4KSA9PlxyXG5cdFx0XHRnbC5iaW5kQXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgb3B0X2xvY2F0aW9ucyA/IG9wdF9sb2NhdGlvbnNbbmR4XSA6IG5keCwgYXR0cmliKVxyXG5cdFx0KVxyXG5cdH1cclxuXHJcblx0Z2wubGlua1Byb2dyYW0ocHJvZ3JhbSlcclxuXHJcblx0Ly8gQ2hlY2sgdGhlIGxpbmsgc3RhdHVzXHJcblx0Y29uc3QgbGlua2VkID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUylcclxuXHRpZiAoIWxpbmtlZCkge1xyXG5cdFx0Ly8gc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgbGlua1xyXG5cdFx0Y29uc3QgbGFzdEVycm9yID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSlcclxuXHRcdGVyckZuKCdFcnJvciBpbiBwcm9ncmFtIGxpbmtpbmc6JyArIGxhc3RFcnJvcilcclxuXHJcblx0XHRnbC5kZWxldGVQcm9ncmFtKHByb2dyYW0pXHJcblx0XHRyZXR1cm4gbnVsbFxyXG5cdH1cclxuXHRyZXR1cm4gcHJvZ3JhbVxyXG59XHJcblxyXG4vKipcclxuICogUmVzaXplIGEgY2FudmFzIHRvIG1hdGNoIHRoZSBzaXplIGl0cyBkaXNwbGF5ZWQuXHJcbiAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhcyBUaGUgY2FudmFzIHRvIHJlc2l6ZS5cclxuICogQHBhcmFtIHtudW1iZXJ9IFttdWx0aXBsaWVyXSBhbW91bnQgdG8gbXVsdGlwbHkgYnkuXHJcbiAqICAgIFBhc3MgaW4gd2luZG93LmRldmljZVBpeGVsUmF0aW8gZm9yIG5hdGl2ZSBwaXhlbHMuXHJcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNhbnZhcyB3YXMgcmVzaXplZC5cclxuICogQG1lbWJlck9mIG1vZHVsZTp3ZWJnbC11dGlsc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoXHJcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRtdWx0aXBsaWVyOiBudW1iZXIgPSAxXHJcbik6IGJvb2xlYW4ge1xyXG5cdGNvbnN0IHdpZHRoID0gKGNhbnZhcy5jbGllbnRXaWR0aCAqIG11bHRpcGxpZXIpIHwgMFxyXG5cdGNvbnN0IGhlaWdodCA9IChjYW52YXMuY2xpZW50SGVpZ2h0ICogbXVsdGlwbGllcikgfCAwXHJcblx0aWYgKGNhbnZhcy53aWR0aCAhPT0gd2lkdGggfHwgY2FudmFzLmhlaWdodCAhPT0gaGVpZ2h0KSB7XHJcblx0XHRjYW52YXMud2lkdGggPSB3aWR0aFxyXG5cdFx0Y2FudmFzLmhlaWdodCA9IGhlaWdodFxyXG5cdFx0cmV0dXJuIHRydWVcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXNpemUgYSBjYW52YXMgdG8gbWF0Y2ggdGhlIHNpemUgaXRzIGRpc3BsYXllZC5cclxuICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzIFRoZSBjYW52YXMgdG8gcmVzaXplLlxyXG4gKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBjYW52YXMgd2FzIHJlc2l6ZWQuXHJcbiAqIEBtZW1iZXJPZiBtb2R1bGU6d2ViZ2wtdXRpbHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZXNpemVDYW52YXNUb1NxdWFyZShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogYm9vbGVhbiB7XHJcblx0Y29uc3Qgc3R5bGVzID0gZ2V0Q29tcHV0ZWRTdHlsZShjYW52YXMpXHJcblx0Y29uc3Qgd2lkdGggPSBwYXJzZUZsb2F0KHN0eWxlcy53aWR0aClcclxuXHRjb25zdCBoZWlnaHQgPSBwYXJzZUZsb2F0KHN0eWxlcy5oZWlnaHQpXHJcblxyXG5cdGlmIChjYW52YXMud2lkdGggIT09IHdpZHRoIHx8IGNhbnZhcy5oZWlnaHQgIT09IGhlaWdodCkge1xyXG5cdFx0Y2FudmFzLndpZHRoID0gd2lkdGhcclxuXHRcdGNhbnZhcy5oZWlnaHQgPSB3aWR0aFxyXG5cdFx0cmV0dXJuIHRydWVcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaGFkZXIoXHJcblx0Z2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCxcclxuXHR0eXBlOiBzdHJpbmcsXHJcblx0cmVzb2x2ZTogKHZhbHVlOiBXZWJHTFNoYWRlciB8IFByb21pc2VMaWtlPHt9PikgPT4gdm9pZCxcclxuXHRyZWplY3Q6IChyZWFzb246IEVycm9yKSA9PiB2b2lkXHJcbikge1xyXG5cdGZ1bmN0aW9uIGhhbmRsZVNoYWRlcihkYXRhOiBzdHJpbmcpOiBXZWJHTFNoYWRlciB7XHJcblx0XHRsZXQgc2hhZGVyOiBXZWJHTFNoYWRlclxyXG5cdFx0aWYgKHR5cGUgPT09ICdmcmFnbWVudC1zaGFkZXInKSB7XHJcblx0XHRcdHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpXHJcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09ICd2ZXJ0ZXgtc2hhZGVyJykge1xyXG5cdFx0XHRzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUilcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0Z2wuc2hhZGVyU291cmNlKHNoYWRlciwgZGF0YSlcclxuXHRcdGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKVxyXG5cclxuXHRcdHJldHVybiBzaGFkZXJcclxuXHR9XHJcblxyXG5cdGZldGNoKGBodHRwOi8vbG9jYWxob3N0OjEzMzcvYXNzZXRzL3NoYWRlcnMvJHt0eXBlfS5nbHNsYClcclxuXHRcdC50aGVuKChyZXNwKSA9PiByZXNwLnRleHQoKSlcclxuXHRcdC50aGVuKChkYXRhOiBzdHJpbmcpID0+IGhhbmRsZVNoYWRlcihkYXRhKSlcclxuXHRcdC50aGVuKChzaGFkZXI6IFdlYkdMU2hhZGVyKSA9PiByZXNvbHZlKHNoYWRlcikpXHJcblx0XHQuY2F0Y2goKGVycjogRXJyb3IpID0+IHJlamVjdChlcnIpKVxyXG5cclxuXHQvLyBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG5cdC8vIFx0YWxlcnQoZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpKVxyXG5cdC8vIFx0cmV0dXJuIG51bGxcclxuXHQvLyB9XHJcbn1cclxuIl19
