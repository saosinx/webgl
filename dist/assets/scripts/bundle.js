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
var lightDirection = webgl_matrix_1.vec3.fromValues(0.5, 3.0, 4.0);
webgl_matrix_1.vec3.normalize(lightDirection, lightDirection);

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
  attribs.aNormal = gl.getAttribLocation(gl.program, 'a_Normal');
  attribs.aColor = gl.getAttribLocation(gl.program, 'a_Color');
  uniforms.uMvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  uniforms.uLightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  uniforms.uLightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  uniforms.uHeight = gl.getUniformLocation(gl.program, 'u_Height');
  uniforms.uWidth = gl.getUniformLocation(gl.program, 'u_Width');
};

var initTextures = function initTextures() {
  return true;
};

var initBuffer = function initBuffer() {
  // prettier-ignore
  var vertices = new Float32Array([1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0]);
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribs.aPosition); // prettier-ignore

  var colors = new Float32Array([1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);
  var colorsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribs.aColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribs.aColor); // prettier-ignore

  var normals = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0]);
  var normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribs.aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribs.aNormal); // prettier-ignore

  var indices = new Uint8Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23]);
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
  gl.uniform3f(uniforms.uLightColor, 1.0, 1.0, 1.0);
  gl.uniform3fv(uniforms.uLightDirection, lightDirection);
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
  }).then(function (indices) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9pbmRleC50cyIsInNyYy9zY3JpcHRzL3dlYmdsLWdvb2dsZS11dGlscy50cyIsInNyYy9zY3JpcHRzL3dlYmdsLW1hdHJpeC5qcyIsInNyYy9zY3JpcHRzL3dlYmdsLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQ0EsSUFBQSxvQkFBQSxHQUFBLE9BQUEsQ0FBQSxzQkFBQSxDQUFBOztBQUNBLElBQUEsY0FBQSxHQUFBLE9BQUEsQ0FBQSxnQkFBQSxDQUFBOztBQUNBLElBQUEsYUFBQSxHQUFBLE9BQUEsQ0FBQSxlQUFBLENBQUE7O0FBTUEsSUFBSSxFQUFKO0FBRUEsSUFBTSxPQUFPLEdBQVEsRUFBckI7QUFDQSxJQUFNLFFBQVEsR0FBUSxFQUF0QjtBQUVBLElBQU0sVUFBVSxHQUFHLGNBQUEsQ0FBQSxJQUFBLENBQUssUUFBTCxDQUFjLGNBQUEsQ0FBQSxJQUFBLENBQUssTUFBTCxFQUFkLENBQW5CO0FBQ0EsSUFBTSxXQUFXLEdBQUcsY0FBQSxDQUFBLElBQUEsQ0FBSyxRQUFMLENBQWMsY0FBQSxDQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWQsQ0FBcEI7QUFDQSxJQUFNLGVBQWUsR0FBRyxjQUFBLENBQUEsSUFBQSxDQUFLLFFBQUwsQ0FBYyxjQUFBLENBQUEsSUFBQSxDQUFLLE1BQUwsRUFBZCxDQUF4QjtBQUNBLElBQU0saUJBQWlCLEdBQUcsY0FBQSxDQUFBLElBQUEsQ0FBSyxRQUFMLENBQWMsY0FBQSxDQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWQsQ0FBMUI7QUFDQSxJQUFNLFNBQVMsR0FBUSxjQUFBLENBQUEsSUFBQSxDQUFLLFFBQUwsQ0FBYyxjQUFBLENBQUEsSUFBQSxDQUFLLE1BQUwsRUFBZCxDQUF2QjtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUssV0FBTCxDQUFpQixpQkFBakIsRUFBb0Msb0JBQUEsQ0FB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QUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDMUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFB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Q0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0RSxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLElBQUksQ0FBQyxDQUFDO1FBQ2QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDeEUsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLE9BQU8sQ0FDTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FB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QUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUc7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUN2QyxJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7T0FXRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDckMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFFM0IsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFBO1NBQ1g7UUFFRCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ3BDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQztRQUN2QixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDL0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDL0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM1QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7UUFPSTtJQUVKLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O1FBT0k7SUFFSixTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDM0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQy9CLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRztRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNwQixDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7O09BVUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxDQUFDO1FBQ2YsT0FBTyxDQUNOLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FDM0YsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsTUFBTSxDQUFDLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLENBQUMsQ0FDRixDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUs7UUFDL0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixPQUFPLENBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDeEUsQ0FBQTtJQUNGLENBQUM7SUFDRDs7O09BR0c7SUFFSCxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUE7SUFDdEI7OztPQUdHO0lBRUgsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFBO0lBRXRCLElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3ZDLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsVUFBVTtRQUNwQixVQUFVLEVBQUUsWUFBWTtRQUN4QixHQUFHLEVBQUUsS0FBSztRQUNWLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFdBQVcsRUFBRSxhQUFhO1FBQzFCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsU0FBUyxFQUFFLFNBQVM7UUFDcEIsWUFBWSxFQUFFLGNBQWM7UUFDNUIsV0FBVyxFQUFFLGFBQWE7UUFDMUIsZUFBZSxFQUFFLGVBQWU7UUFDaEMsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsTUFBTTtRQUNaLEdBQUcsRUFBRSxLQUFLO1FBQ1YsUUFBUSxFQUFFLFVBQVU7UUFDcEIsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxvQkFBb0IsRUFBRSxzQkFBc0I7UUFDNUMsV0FBVyxFQUFFLGFBQWE7UUFDMUIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsR0FBRyxFQUFFLEtBQUs7UUFDVixHQUFHLEVBQUUsS0FBSztLQUNWLENBQUMsQ0FBQTtJQUVGOzs7T0FHRztJQUVIOzs7O09BSUc7SUFFSCxTQUFTLFFBQVE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFM0IsSUFBSSxVQUFVLElBQUksWUFBWSxFQUFFO1lBQy9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNWO1FBRUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2QsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxDQUFDO1FBQ2pCLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFFSCxTQUFTLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7UUFDaEUsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7Ozs7O09BY0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1FBQzlELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxQix3RkFBd0Y7UUFDeEYsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtTQUNaO2FBQU07WUFDTixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMs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RyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxPQUFPLENBQ04sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDOUYsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDN0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoQyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzVCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ2pCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O1FBT0k7SUFFSixTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxjQUFjLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDL0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDcEIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztRQU1JO0lBRUosU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQSxDQUFDLDRCQUE0QjtRQUU1RCxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUUvRSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUE7U0FDWDtRQUVELEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7UUFD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QUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSztRQUMvQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2IsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLE9BQU8sQ0FDTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVB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LEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7T0FLRztJQUVILFNBQVMsT0FBTyxDQUFDLENBQUM7UUFDakIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFFSCxTQUFTLFlBQVksQ0FDcEIsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRztRQUVILElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BcUJHO0lBRUgsU0FBUyxLQUFLLENBQ2IsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUc7UUFFSCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxQix3RkFBd0Y7UUFDeEYsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFBO1NBQ2I7YUFBTTtZQUNOLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZjtRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBLENBQUMsNEJBQTRCO1FBRTVELElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBRS9FLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQTtTQUNYO1FBRUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FDN0IsQ0FBQTtRQUNELEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUM5RixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUNWLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUNWLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQzdCLENBQUE7UUFDRCxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ04sR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDOUYsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FDVixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUM3QixDQUFBO1FBQ0QsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNOLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzlGLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMvQixJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDL0IsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQy9CLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQSxDQUFDLDRCQUE0QjtRQUU1RCxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO0lBQzdFLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQSxDQUFDLG1EQUFtRDtRQUVoRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNsRCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDbEQsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ25ELEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUNuRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUN0QixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUN0QixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUV0QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2hELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDaEQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNqRCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ2pEO2FBQU07WUFDTixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzdDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDN0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUM3QyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQzdDO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7UUFPSTtJQUVKLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSTtRQUNsQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ2QsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQzFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWCxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUN0QixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUN0QixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUN0QixJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFBO1FBQ2pCLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUE7UUFDakIsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQTtRQUVqQixJQUFJLEdBQUcsR0FBRyxPQUFPLEVBQUU7WUFDbEIsT0FBTyxJQUFJLENBQUE7U0FDWDtRQUVELEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ2IsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtRQUNSLENBQUMsSUFBSSxHQUFHLENBQUE7UUFDUixDQUFDLElBQUksR0FBRyxDQUFBO1FBQ1IsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUEsQ0FBQyxnREFBZ0Q7UUFFNUQsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN2QixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQyxrREFBa0Q7UUFFdEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDMUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUMzQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFFM0MsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2Qsb0VBQW9FO1lBQ3BFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZjtRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUVmLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUNkLGdFQUFnRTtZQUNoRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtTQUNmLENBQUMsOENBQThDO1FBRWhELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMzQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzNCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDZixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFZixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7WUFDZCxnRUFBZ0U7WUFDaEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZixDQUFDLDhDQUE4QztRQUVoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDM0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRWQsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2Qsb0VBQW9FO1lBQ3BFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2YsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNmLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1NBQ2YsQ0FBQyw4Q0FBOEM7UUFFaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENB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QUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUVILFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQzlCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLDhDQUE4QztRQUVwRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDOUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsOENBQThDO1FBRXBFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFH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QUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksV0FBVyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25DLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxTQUFTLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQSxDQUFDLDhCQUE4QjtRQUVwRixJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7WUFDbEIsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFBO1lBQzFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQTtZQUMxRSxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUE7U0FDMUU7YUFBTTtZQUNOLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDNUQsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM1RCxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzVEO1FBRUQsdUJBQXVCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQTtRQUM1QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQy9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2hCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7T0FTRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQzNCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDckQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUNyRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ3JELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDNUIsdUhBQXVIO1FBQ3ZILElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVULElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNkLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7WUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDOUI7YUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUMvQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtZQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDOUI7YUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDNUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtZQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzlCO2FBQU07WUFDTixDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7U0FDakI7UUFFRCxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7OztPQWdCRztJQUVILFNBQVMsNEJBQTRCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNqRCxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUM5QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BbUJHO0lBRUgsU0FBUyxrQ0FBa0MsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxRCxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDekIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ3pELEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN6RCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDMUQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFH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LEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDeEIsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUN4QixFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ3hCLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFFNUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDTixFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ04sRUFBRSxHQUFHLENBQUMsQ0FBQTtTQUNOO2FBQU07WUFDTixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtZQUNiLEVBQUUsSUFBSSxHQUFHLENBQUE7WUFDVCxFQUFFLElBQUksR0FBRyxDQUFBO1lBQ1QsRUFBRSxJQUFJLEdBQUcsQ0FBQTtTQUNUO1FBRUQsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUN0QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3RCLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDdEIsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUU1QyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNOLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDTixFQUFFLEdBQUcsQ0FBQyxDQUFBO1NBQ047YUFBTTtZQUNOLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ2IsRUFBRSxJQUFJLEdBQUcsQ0FBQTtZQUNULEVBQUUsSUFBSSxHQUFHLENBQUE7WUFDVCxFQUFFLElBQUksR0FBRyxDQUFBO1NBQ1Q7UUFFRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDOUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDYixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ1gsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDWCxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxFQUFFLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDeEIsRUFBRSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQ3JCLEVBQUUsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3RCLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBRXJDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNaLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUN4QixFQUFFLElBQUksR0FBRyxDQUFBO1lBQ1QsRUFBRSxJQUFJLEdBQUcsQ0FBQTtZQUNULEVBQUUsSUFBSSxHQUFHLENBQUE7U0FDVDtRQUVELElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFDM0IsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFDeEIsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUN6QixHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFFakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ1osR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3hCLEVBQUUsSUFBSSxHQUFHLENBQUE7WUFDVCxFQUFFLElBQUksR0FBRyxDQUFBO1lBQ1QsRUFBRSxJQUFJLEdBQUcsQ0FBQTtTQUNUO1FBRUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQTtRQUNkLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7UUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO1FBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxLQUFLLENBQUMsQ0FBQztRQUNmLE9BQU8sQ0FDTixPQUFPO1lBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ0wsSUFBSTtZQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDTCxJQUFJO1lBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNMLElBQUk7WUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ0wsSUFBSTtZQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDTCxJQUFJO1lBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNMLEdBQUcsQ0FDSCxDQUFBO0lBQ0YsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxNQUFNLENBQUMsQ0FBQztRQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ25CLENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN2QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSztRQUMvQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDNUIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQy9CLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUMvQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDL0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ2YsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDWixPQUFPLENBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FB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Q0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FB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T0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtRQUMxRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtRQUMxRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtRQUMxRSxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSztRQUN6QixLQUFLLEdBQUcsS0FBSyxJQUFJLEdBQUcsQ0FBQTtRQUNwQixJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQTtRQUNoQyxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzVCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDM0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUNsQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3JELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FB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QUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUE7UUFDdkIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUNULENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQywrQkFBK0I7UUFFdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxrQkFBa0I7UUFFckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQywrQkFBK0I7UUFFOUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUNULENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQywrQkFBK0I7UUFFdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxrQkFBa0I7UUFFckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQywrQkFBK0I7UUFFOUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUNULENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQywrQkFBK0I7UUFFdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxrQkFBa0I7UUFFckMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlDLENBQUMsQ0FBQyxD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QUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDL0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7O09BU0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSztRQUN0QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FB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LENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNyQyxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUV2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDWixHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDeEI7UUFFRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2hDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2pDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMzQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFD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LENBQUM7UUFDMUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3hFLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixPQUFPLENBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUs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Q0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQzdCLEdBQUcsSUFBSSxHQUFHLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNyQixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsR0FBRyxJQUFJLEdBQUcsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ3JCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRztRQUM3QixHQUFHLElBQUksR0FBRyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDckIsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUMxQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7Ozs7T0FRRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNSLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFCLGNBQWM7UUFDZCx3REFBd0Q7UUFDeEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFBLENBQUMsY0FBYztRQUV0RCxLQUFLLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxF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QUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ25CLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1lBQ25FLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFBO1lBQ3BCLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFBO1lBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1NBQzlDO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7OztPQVNHO0lBRUgsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM5QixJQUFJLFNBQVMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3ZDLENBQUMsSUFBSSxTQUFTLENBQUE7UUFDZCxDQUFDLElBQUksU0FBUyxDQUFBO1FBQ2QsQ0FBQyxJQUFJLFNBQVMsQ0FBQTtRQUNkLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNwQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDcEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ3BDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFB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QUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7OztPQUtHO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRztRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7UUFD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SCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDN0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUNoQixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFDaEIsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQ2hCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7UUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1FBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2hELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2pELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDNUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDdEIsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDNUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDdEIsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDN0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUMzQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFDM0MsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDNUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDdEIsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDWCxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUM5QyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDOUMsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUc7UUFDMUMsMEJBQTBCO1FBQzFCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLEVBQUU7WUFDNUIsT0FBTyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3JCO1FBRUQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3JGLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2YsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNyQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUE7UUFDbkMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBO1FBQ25DLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtRQUNuQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3RCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ2xELElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzlDLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7OztPQVFHO0lBRUgsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNWLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDdEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDdEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDdEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDdEQsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5RixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDOUYsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNMLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUM5RixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7O09BR0c7SUFFSCxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUE7SUFDdEI7Ozs7Ozs7O09BUUc7SUFFSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQTtJQUNqQjs7Ozs7Ozs7O09BU0c7SUFFSCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzNCLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM3QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDN0IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxLQUFLLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ3JCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUVILElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQTtJQUN2Qjs7O09BR0c7SUFFSCxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUE7SUFDcEI7Ozs7OztPQU1HO0lBRUgsSUFBSSxlQUFlLEdBQUcsZUFBZSxDQUFBO0lBQ3JDOzs7T0FHRztJQUVILElBQUksUUFBUSxHQUFHLGVBQWUsQ0FBQTtJQUM5Qjs7Ozs7OztPQU9HO0lBRUgsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRWxDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtZQUNsQixTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUNoQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFBO1lBQ3pCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUE7WUFDekIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQTtZQUN6QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFBO1lBQ3pCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLElBQUksT0FBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7WUFDbkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtZQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7WUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtZQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFBO1lBQ3hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFBO1lBQ3hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFBO1lBQ3hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFBO1NBQ3hDO1FBRUQsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxDQUFDO1FBQ2YsT0FBTyxDQUNOLFFBQVE7WUFDUixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUk7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSTtZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixHQUFHLENBQ0gsQ0FBQTtJQUNGLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFFSCxTQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLENBQUE7SUFDRixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNaLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDVixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1osRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDVCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNULEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNWLE9BQU8sQ0FDTixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9B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Q0FBQyxDQUFDLENBQUE7UUFDYixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2IsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixPQUFPLEdBQUcsQ0FBQTtJQUNYLENBQUM7SUFDRDs7Ozs7OztPQU9HO0lBRUgsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BCLE9BQU8sR0FBRyxDQUFBO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBRUgsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsT0FBTyxHQUFHLENBQUE7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUVILFNBQVMs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K0IsQ0F3Qi9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaENELE9BQUEsQ0FBQSxZQUFBLEdBQUEsWUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBiZXppZXIgZnJvbSAnLi9iZXppZXItZWFzaW5nJ1xyXG5pbXBvcnQgV2ViR0xVdGlscywgeyBhZGRUZXh0dXJlLCBkZWdUb1JhZCB9IGZyb20gJy4vd2ViZ2wtZ29vZ2xlLXV0aWxzJ1xyXG5pbXBvcnQgeyBtYXQ0LCB2ZWMzIH0gZnJvbSAnLi93ZWJnbC1tYXRyaXgnXHJcbmltcG9ydCB7IGNyZWF0ZVByb2dyYW0sIGNyZWF0ZVNoYWRlciwgcmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZSB9IGZyb20gJy4vd2ViZ2wtdXRpbHMnXHJcblxyXG5pbnRlcmZhY2UgSVdlYkdMUmVuZGVyaW5nQ29udGV4dEV4dGVuZGVkIGV4dGVuZHMgV2ViR0xSZW5kZXJpbmdDb250ZXh0IHtcclxuXHRwcm9ncmFtOiBXZWJHTFByb2dyYW1cclxufVxyXG5cclxubGV0IGdsOiBJV2ViR0xSZW5kZXJpbmdDb250ZXh0RXh0ZW5kZWRcclxuXHJcbmNvbnN0IGF0dHJpYnM6IGFueSA9IHt9XHJcbmNvbnN0IHVuaWZvcm1zOiBhbnkgPSB7fVxyXG5cclxuY29uc3Qgdmlld01hdHJpeCA9IG1hdDQuaWRlbnRpdHkobWF0NC5jcmVhdGUoKSlcclxuY29uc3QgbW9kZWxNYXRyaXggPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbmNvbnN0IG1vZGVsVmlld01hdHJpeCA9IG1hdDQuaWRlbnRpdHkobWF0NC5jcmVhdGUoKSlcclxuY29uc3QgcGVyc3BlY3RpdmVNYXRyaXggPSBtYXQ0LmlkZW50aXR5KG1hdDQuY3JlYXRlKCkpXHJcbmNvbnN0IG12cE1hdHJpeDogYW55ID0gbWF0NC5pZGVudGl0eShtYXQ0LmNyZWF0ZSgpKVxyXG5tYXQ0LnBlcnNwZWN0aXZlKHBlcnNwZWN0aXZlTWF0cml4LCBkZWdUb1JhZCg2MCksIDEsIDEsIDEwMClcclxuXHJcbmNvbnN0IGxpZ2h0RGlyZWN0aW9uOiBhbnkgPSB2ZWMzLmZyb21WYWx1ZXMoMC41LCAzLjAsIDQuMClcclxudmVjMy5ub3JtYWxpemUobGlnaHREaXJlY3Rpb24sIGxpZ2h0RGlyZWN0aW9uKVxyXG5cclxuY29uc3QgJCA9IGZ1bmN0aW9uKHNlbGVjdG9yOiBzdHJpbmcsIHFzPzogYm9vbGVhbik6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCB7XHJcblx0aWYgKCFxcykgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKVxyXG5cdHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxyXG59XHJcblxyXG5pbnRlcmZhY2UgSVNjZW5lIHtcclxuXHRtb2RlbFNjYWxlOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRtb2RlbFJvdGF0ZVg6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdG1vZGVsUm90YXRlWToge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0bW9kZWxSb3RhdGVaOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRtb2RlbFRyYW5zbGF0ZVg6IHtcclxuXHRcdHJlYWRvbmx5IGVsZW06IEhUTUxFbGVtZW50XHJcblx0XHR2YWx1ZTogbnVtYmVyXHJcblx0fVxyXG5cdG1vZGVsVHJhbnNsYXRlWToge1xyXG5cdFx0cmVhZG9ubHkgZWxlbTogSFRNTEVsZW1lbnRcclxuXHRcdHZhbHVlOiBudW1iZXJcclxuXHR9XHJcblx0bW9kZWxUcmFuc2xhdGVaOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRjYW1lcmFYOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRjYW1lcmFZOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRjYW1lcmFaOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxuXHRba2V5OiBzdHJpbmddOiB7XHJcblx0XHRyZWFkb25seSBlbGVtOiBIVE1MRWxlbWVudFxyXG5cdFx0dmFsdWU6IG51bWJlclxyXG5cdH1cclxufVxyXG5cclxuY29uc3Qgc2NlbmU6IElTY2VuZSA9IHtcclxuXHRtb2RlbFNjYWxlOiB7XHJcblx0XHRlbGVtOiAkKCdtb2RlbFNjYWxlJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdG1vZGVsUm90YXRlWDoge1xyXG5cdFx0ZWxlbTogJCgnbW9kZWxSb3RhdGVYJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdG1vZGVsUm90YXRlWToge1xyXG5cdFx0ZWxlbTogJCgnbW9kZWxSb3RhdGVZJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdG1vZGVsUm90YXRlWjoge1xyXG5cdFx0ZWxlbTogJCgnbW9kZWxSb3RhdGVaJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdG1vZGVsVHJhbnNsYXRlWDoge1xyXG5cdFx0ZWxlbTogJCgnbW9kZWxUcmFuc2xhdGVYJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdG1vZGVsVHJhbnNsYXRlWToge1xyXG5cdFx0ZWxlbTogJCgnbW9kZWxUcmFuc2xhdGVZJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdG1vZGVsVHJhbnNsYXRlWjoge1xyXG5cdFx0ZWxlbTogJCgnbW9kZWxUcmFuc2xhdGVaJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG5cdGNhbWVyYVg6IHtcclxuXHRcdGVsZW06ICQoJ2NhbWVyYVgnKSBhcyBIVE1MRWxlbWVudCxcclxuXHRcdHZhbHVlOiAwLFxyXG5cdH0sXHJcblx0Y2FtZXJhWToge1xyXG5cdFx0ZWxlbTogJCgnY2FtZXJhWScpIGFzIEhUTUxFbGVtZW50LFxyXG5cdFx0dmFsdWU6IDAsXHJcblx0fSxcclxuXHRjYW1lcmFaOiB7XHJcblx0XHRlbGVtOiAkKCdjYW1lcmFaJykgYXMgSFRNTEVsZW1lbnQsXHJcblx0XHR2YWx1ZTogMCxcclxuXHR9LFxyXG59XHJcblxyXG5jb25zdCBmcHNDb3VudGVyID0gJCgnZnBzLWNvdW50ZXInKVxyXG5jb25zdCBmcmFtZUNvdW50ZXIgPSAkKCdmcmFtZS1jb3VudGVyJylcclxuY29uc3QgdGltZUNvdW50ZXIgPSAkKCd0aW1lLWNvdW50ZXInKVxyXG5cclxuY29uc3QgaW5pdFNoYWRlcnMgPSBmdW5jdGlvbihyZXNvbHZlOiAoKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IEVycm9yKSA9PiB2b2lkKSB7XHJcblx0Y29uc3QgZlNoYWRlcjogV2ViR0xTaGFkZXIgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+XHJcblx0XHRjcmVhdGVTaGFkZXIoZ2wsICdmcmFnbWVudC1zaGFkZXInLCByZXMsIHJlailcclxuXHQpXHJcblx0Y29uc3QgdlNoYWRlcjogV2ViR0xTaGFkZXIgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+XHJcblx0XHRjcmVhdGVTaGFkZXIoZ2wsICd2ZXJ0ZXgtc2hhZGVyJywgcmVzLCByZWopXHJcblx0KVxyXG5cclxuXHRQcm9taXNlLmFsbChbZlNoYWRlciwgdlNoYWRlcl0pLnRoZW4oKHNoYWRlcnMpID0+IHtcclxuXHRcdGdsLnByb2dyYW0gPSBjcmVhdGVQcm9ncmFtKGdsLCBzaGFkZXJzKVxyXG5cdFx0Z2wudXNlUHJvZ3JhbShnbC5wcm9ncmFtKVxyXG5cclxuXHRcdHJlc29sdmUoKVxyXG5cdH0pXHJcbn1cclxuXHJcbmNvbnN0IGluaXRWYXJpYWJsZXMgPSBmdW5jdGlvbigpIHtcclxuXHRhdHRyaWJzLmFQb3NpdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKGdsLnByb2dyYW0sICdhX1Bvc2l0aW9uJylcclxuXHRhdHRyaWJzLmFOb3JtYWwgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihnbC5wcm9ncmFtLCAnYV9Ob3JtYWwnKVxyXG5cdGF0dHJpYnMuYUNvbG9yID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24oZ2wucHJvZ3JhbSwgJ2FfQ29sb3InKVxyXG5cclxuXHR1bmlmb3Jtcy51TXZwTWF0cml4ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGdsLnByb2dyYW0sICd1X012cE1hdHJpeCcpXHJcblx0dW5pZm9ybXMudUxpZ2h0Q29sb3IgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZ2wucHJvZ3JhbSwgJ3VfTGlnaHRDb2xvcicpXHJcblx0dW5pZm9ybXMudUxpZ2h0RGlyZWN0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGdsLnByb2dyYW0sICd1X0xpZ2h0RGlyZWN0aW9uJylcclxuXHR1bmlmb3Jtcy51SGVpZ2h0ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGdsLnByb2dyYW0sICd1X0hlaWdodCcpXHJcblx0dW5pZm9ybXMudVdpZHRoID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGdsLnByb2dyYW0sICd1X1dpZHRoJylcclxufVxyXG5cclxuY29uc3QgaW5pdFRleHR1cmVzID0gZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRydWVcclxufVxyXG5cclxuY29uc3QgaW5pdEJ1ZmZlciA9IGZ1bmN0aW9uKCk6IG51bWJlciB7XHJcblx0Ly8gcHJldHRpZXItaWdub3JlXHJcblx0Y29uc3QgdmVydGljZXM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG5cdFx0MS4wLCAxLjAsIDEuMCwgICAgLTEuMCwgMS4wLCAxLjAsICAgIC0xLjAsIC0xLjAsIDEuMCwgICAxLjAsIC0xLjAsIDEuMCxcclxuXHRcdDEuMCwgMS4wLCAxLjAsICAgICAxLjAsIC0xLjAsIDEuMCwgICAgMS4wLCAtMS4wLCAtMS4wLCAgMS4wLCAxLjAsIC0xLjAsXHJcblx0XHQxLjAsIDEuMCwgMS4wLCAgICAgMS4wLCAxLjAsIC0xLjAsICAgLTEuMCwgMS4wLCAtMS4wLCAgLTEuMCwgMS4wLCAxLjAsXHJcblx0XHQtMS4wLCAtMS4wLCAxLjAsICAtMS4wLCAxLjAsIDEuMCwgICAgLTEuMCwgMS4wLCAtMS4wLCAgLTEuMCwgLTEuMCwgLTEuMCxcclxuXHRcdC0xLjAsIC0xLjAsIDEuMCwgIC0xLjAsIC0xLjAsIC0xLjAsICAgMS4wLCAtMS4wLCAtMS4wLCAgMS4wLCAtMS4wLCAxLjAsXHJcblx0XHQxLjAsIC0xLjAsIC0xLjAsICAtMS4wLCAtMS4wLCAtMS4wLCAgLTEuMCwgMS4wLCAtMS4wLCAgIDEuMCwgMS4wLCAtMS4wLFxyXG5cdF0pXHJcblxyXG5cdGNvbnN0IHZlcnRleEJ1ZmZlcjogV2ViR0xCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKVxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpXHJcblx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHZlcnRpY2VzLCBnbC5TVEFUSUNfRFJBVylcclxuXHJcblx0Z2wudmVydGV4QXR0cmliUG9pbnRlcihhdHRyaWJzLmFQb3NpdGlvbiwgMywgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKVxyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGF0dHJpYnMuYVBvc2l0aW9uKVxyXG5cclxuXHQvLyBwcmV0dGllci1pZ25vcmVcclxuXHRjb25zdCBjb2xvcnM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG5cdFx0MS4wLCAwLjAsIDAuMCwgIDEuMCwgMC4wLCAwLjAsICAxLjAsIDAuMCwgMC4wLCAgMS4wLCAwLjAsIDAuMCxcclxuXHRcdDEuMCwgMC4wLCAwLjAsICAxLjAsIDAuMCwgMC4wLCAgMS4wLCAwLjAsIDAuMCwgIDEuMCwgMC4wLCAwLjAsXHJcblx0XHQxLjAsIDAuMCwgMC4wLCAgMS4wLCAwLjAsIDAuMCwgIDEuMCwgMC4wLCAwLjAsICAxLjAsIDAuMCwgMC4wLFxyXG5cdFx0MS4wLCAwLjAsIDAuMCwgIDEuMCwgMC4wLCAwLjAsICAxLjAsIDAuMCwgMC4wLCAgMS4wLCAwLjAsIDAuMCxcclxuXHRcdDEuMCwgMC4wLCAwLjAsICAxLjAsIDAuMCwgMC4wLCAgMS4wLCAwLjAsIDAuMCwgIDEuMCwgMC4wLCAwLjAsXHJcblx0XHQxLjAsIDAuMCwgMC4wLCAgMS4wLCAwLjAsIDAuMCwgIDEuMCwgMC4wLCAwLjAsICAxLjAsIDAuMCwgMC4wLFxyXG5cdF0pXHJcblxyXG5cdGNvbnN0IGNvbG9yc0J1ZmZlcjogV2ViR0xCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKVxyXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBjb2xvcnNCdWZmZXIpXHJcblx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGNvbG9ycywgZ2wuU1RBVElDX0RSQVcpXHJcblxyXG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoYXR0cmlicy5hQ29sb3IsIDMsIGdsLkZMT0FULCBmYWxzZSwgMCwgMClcclxuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhdHRyaWJzLmFDb2xvcilcclxuXHJcblx0Ly8gcHJldHRpZXItaWdub3JlXHJcblx0Y29uc3Qgbm9ybWFsczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcblx0XHQwLjAsIDAuMCwgMS4wLCAgIDAuMCwgMC4wLCAxLjAsICAgMC4wLCAwLjAsIDEuMCwgXHQgMC4wLCAwLjAsIDEuMCxcclxuXHRcdDEuMCwgMC4wLCAwLjAsICAgMS4wLCAwLjAsIDAuMCwgICAxLjAsIDAuMCwgMC4wLCBcdCAxLjAsIDAuMCwgMC4wLFxyXG5cdFx0MC4wLCAxLjAsIDAuMCwgICAwLjAsIDEuMCwgMC4wLCAgIDAuMCwgMS4wLCAwLjAsIFx0IDAuMCwgMS4wLCAwLjAsXHJcblx0XHQtMS4wLCAwLjAsIDAuMCwgLTEuMCwgMC4wLCAwLjAsICAtMS4wLCAwLjAsIDAuMCwgIC0xLjAsIDAuMCwgMC4wLFxyXG5cdFx0MC4wLCAtMS4wLCAwLjAsICAwLjAsIC0xLjAsIDAuMCwgIDAuMCwgLTEuMCwgMC4wLCAgMC4wLCAtMS4wLCAwLjAsXHJcblx0XHQwLjAsIDAuMCwgLTEuMCwgIDAuMCwgMC4wLCAtMS4wLCAgMC4wLCAwLjAsIC0xLjAsICAwLjAsIDAuMCwgLTEuMCxcclxuXHRdKVxyXG5cclxuXHRjb25zdCBub3JtYWxzQnVmZmVyOiBXZWJHTEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG5vcm1hbHNCdWZmZXIpXHJcblx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5vcm1hbHMsIGdsLlNUQVRJQ19EUkFXKVxyXG5cclxuXHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dHJpYnMuYU5vcm1hbCwgMywgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKVxyXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGF0dHJpYnMuYU5vcm1hbClcclxuXHJcblx0Ly8gcHJldHRpZXItaWdub3JlXHJcblx0Y29uc3QgaW5kaWNlczogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KFtcclxuXHRcdDAsIDEsIDIsICAgIDAsIDIsIDMsXHJcblx0XHQ0LCA1LCA2LCAgICA0LCA2LCA3LFxyXG5cdFx0OCwgOSwgMTAsICAgOCwgMTAsIDExLFxyXG5cdFx0MTIsIDEzLCAxNCwgMTIsIDE0LCAxNSxcclxuXHRcdDE2LCAxNywgMTgsIDE2LCAxOCwgMTksXHJcblx0XHQyMCwgMjEsIDIyLCAyMCwgMjIsIDIzLFxyXG5cdF0pXHJcblxyXG5cdGNvbnN0IGluZGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpXHJcblx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhCdWZmZXIpXHJcblx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlcywgZ2wuU1RBVElDX0RSQVcpXHJcblxyXG5cdHJldHVybiBpbmRpY2VzLmxlbmd0aFxyXG59XHJcblxyXG5jb25zdCBkcmF3U2NlbmUgPSBmdW5jdGlvbigpOiB2b2lkIHtcclxuXHRnbC52aWV3cG9ydCgwLCAwLCBnbC5kcmF3aW5nQnVmZmVyV2lkdGgsIGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQpXHJcblxyXG5cdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKVxyXG5cclxuXHRjb25zdCBjYW1lcmEgPSB2ZWMzLmZyb21WYWx1ZXMoc2NlbmUuY2FtZXJhWC52YWx1ZSwgc2NlbmUuY2FtZXJhWS52YWx1ZSwgc2NlbmUuY2FtZXJhWi52YWx1ZSlcclxuXHRjb25zdCBjZW50ZXIgPSB2ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMClcclxuXHRjb25zdCB1cCA9IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKVxyXG5cclxuXHRtYXQ0Lmxvb2tBdCh2aWV3TWF0cml4LCBjYW1lcmEsIGNlbnRlciwgdXApXHJcblxyXG5cdG1hdDQuaWRlbnRpdHkobW9kZWxNYXRyaXgpXHJcblx0bWF0NC50cmFuc2xhdGUoXHJcblx0XHRtb2RlbE1hdHJpeCxcclxuXHRcdG1vZGVsTWF0cml4LFxyXG5cdFx0dmVjMy5mcm9tVmFsdWVzKFxyXG5cdFx0XHRzY2VuZS5tb2RlbFRyYW5zbGF0ZVgudmFsdWUsXHJcblx0XHRcdHNjZW5lLm1vZGVsVHJhbnNsYXRlWS52YWx1ZSxcclxuXHRcdFx0c2NlbmUubW9kZWxUcmFuc2xhdGVaLnZhbHVlXHJcblx0XHQpXHJcblx0KVxyXG5cdG1hdDQucm90YXRlWChtb2RlbE1hdHJpeCwgbW9kZWxNYXRyaXgsIGRlZ1RvUmFkKHNjZW5lLm1vZGVsUm90YXRlWC52YWx1ZSkpXHJcblx0bWF0NC5yb3RhdGVZKG1vZGVsTWF0cml4LCBtb2RlbE1hdHJpeCwgZGVnVG9SYWQoc2NlbmUubW9kZWxSb3RhdGVZLnZhbHVlKSlcclxuXHRtYXQ0LnJvdGF0ZVoobW9kZWxNYXRyaXgsIG1vZGVsTWF0cml4LCBkZWdUb1JhZChzY2VuZS5tb2RlbFJvdGF0ZVoudmFsdWUpKVxyXG5cdG1hdDQuc2NhbGUoXHJcblx0XHRtb2RlbE1hdHJpeCxcclxuXHRcdG1vZGVsTWF0cml4LFxyXG5cdFx0dmVjMy5mcm9tVmFsdWVzKHNjZW5lLm1vZGVsU2NhbGUudmFsdWUsIHNjZW5lLm1vZGVsU2NhbGUudmFsdWUsIHNjZW5lLm1vZGVsU2NhbGUudmFsdWUpXHJcblx0KVxyXG5cdG1hdDQubXVsKG1vZGVsVmlld01hdHJpeCwgdmlld01hdHJpeCwgbW9kZWxNYXRyaXgpXHJcblx0bWF0NC5tdWwobXZwTWF0cml4LCBwZXJzcGVjdGl2ZU1hdHJpeCwgbW9kZWxWaWV3TWF0cml4KVxyXG5cclxuXHRnbC51bmlmb3JtTWF0cml4NGZ2KHVuaWZvcm1zLnVNdnBNYXRyaXgsIGZhbHNlLCBtdnBNYXRyaXgpXHJcblx0Z2wudW5pZm9ybTNmKHVuaWZvcm1zLnVMaWdodENvbG9yLCAxLjAsIDEuMCwgMS4wKVxyXG5cdGdsLnVuaWZvcm0zZnYodW5pZm9ybXMudUxpZ2h0RGlyZWN0aW9uLCBsaWdodERpcmVjdGlvbilcclxuXHJcblx0Z2wudW5pZm9ybTFmKHVuaWZvcm1zLnVXaWR0aCwgZ2wuZHJhd2luZ0J1ZmZlcldpZHRoKVxyXG5cdGdsLnVuaWZvcm0xZih1bmlmb3Jtcy51SGVpZ2h0LCBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0KVxyXG5cclxuXHRnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCAzNiwgZ2wuVU5TSUdORURfQllURSwgMClcclxufVxyXG5cclxubGV0IGxhc3RUaW1lOiBudW1iZXIgPSAwXHJcbmxldCBmcmFtZXM6IG51bWJlciA9IDBcclxubGV0IGZwczogbnVtYmVyXHJcbmNvbnN0IHJlbmRlciA9IGZ1bmN0aW9uKHRpbWU6IERPTUhpZ2hSZXNUaW1lU3RhbXAgPSAwKSB7XHJcblx0ZnBzID0gMTAwMCAvICh0aW1lIC0gbGFzdFRpbWUpXHJcblx0ZnBzQ291bnRlci50ZXh0Q29udGVudCA9IGZwcy50b0ZpeGVkKDApXHJcblx0ZnJhbWVDb3VudGVyLnRleHRDb250ZW50ID0gKytmcmFtZXMgKyAnJ1xyXG5cdHRpbWVDb3VudGVyLnRleHRDb250ZW50ID0gKHRpbWUgLyAxMDAwKS50b0ZpeGVkKDIpXHJcblx0bGFzdFRpbWUgPSB0aW1lXHJcblx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpXHJcblx0ZHJhd1NjZW5lKClcclxufVxyXG5cclxuY29uc3Qgd2ViR0xTdGFydCA9IGZ1bmN0aW9uKCk6IHZvaWQge1xyXG5cdGNvbnN0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSAkKCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudFxyXG5cclxuXHRjb25zdCBwb3dlclByZWZlcmVuY2U6IHN0cmluZyA9ICdkZWZhdWx0JyB8fCAnaGlnaC1wZXJmb3JtYW5jZScgfHwgJ2xvdy1wb3dlcidcclxuXHRnbCA9IFdlYkdMVXRpbHMuc2V0dXBXZWJHTChjYW52YXMsIHtcclxuXHRcdGFscGhhOiB0cnVlLFxyXG5cdFx0ZGVwdGg6IHRydWUsXHJcblx0XHRwb3dlclByZWZlcmVuY2UsXHJcblx0fSkgYXMgSVdlYkdMUmVuZGVyaW5nQ29udGV4dEV4dGVuZGVkXHJcblxyXG5cdGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKVxyXG5cdGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKVxyXG5cclxuXHRyZXNpemVDYW52YXNUb0Rpc3BsYXlTaXplKGdsLmNhbnZhcylcclxuXHJcblx0Y29uc3QgcHJvbWlzZVNoYWRlcjogUHJvbWlzZTx7fT4gPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IGluaXRTaGFkZXJzKHJlcywgcmVqKSlcclxuXHRwcm9taXNlU2hhZGVyXHJcblx0XHQudGhlbigoKSA9PiBpbml0VmFyaWFibGVzKCkpXHJcblx0XHQudGhlbigoKSA9PiBpbml0VGV4dHVyZXMoKSlcclxuXHRcdC50aGVuKCgpID0+IGluaXRCdWZmZXIoKSlcclxuXHRcdC50aGVuKChpbmRpY2VzOiBudW1iZXIpID0+IHJlbmRlcigpKVxyXG5cdFx0LmNhdGNoKChlcnJvcjogRXJyb3IpID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKVxyXG59XHJcblxyXG4vLyBUT0RPIFNtb290aCBhbmltYXRpb25cclxuLy8gY29uc3QgYW5pbWF0ZSA9IGZ1bmN0aW9uKGR1cmF0aW9uOiBudW1iZXIsIGZyb206IG51bWJlciwgdG86IG51bWJlcik6IHZvaWQge1xyXG4vLyBcdGNvbnN0IGVhc2luZyA9IGJlemllcigwLjIxNSwgMC42MSwgMC4zNTUsIDEuMClcclxuLy8gXHRjb25zdCBpdGVyYXRpb25zOiBudW1iZXIgPSA2MCAvIChkdXJhdGlvbiAvIDEwMDApXHJcbi8vIFx0Y29uc3Qgc3RlcDogbnVtYmVyID0gMSAvIGl0ZXJhdGlvbnNcclxuXHJcbi8vIFx0Zm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8PSBpdGVyYXRpb25zOyBpICs9IDEpIHtcclxuLy8gXHRcdCh0byAtIGZyb20pICogZWFzaW5nKHN0ZXAgKiBpKSArIGZyb21cclxuLy8gXHR9XHJcbi8vIH1cclxuXHJcbmNvbnN0IHVwZGF0ZUluZm9iYXIgPSBmdW5jdGlvbihlbGVtOiBIVE1MRWxlbWVudCk6IHZvaWQge1xyXG5cdGVsZW0uaW5uZXJIVE1MID0gc2NlbmVbZWxlbS5pZF0udmFsdWUudG9GaXhlZCgyKVxyXG59XHJcblxyXG5jb25zdCBzZXRDYW52YXNDb250cm9scyA9IGZ1bmN0aW9uKCk6IHZvaWQge1xyXG5cdGxldCBpc1JvdGF0YWJsZTogYm9vbGVhbiA9IGZhbHNlXHJcblxyXG5cdGdsLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZTogTW91c2VFdmVudCkgPT4gKGlzUm90YXRhYmxlID0gdHJ1ZSkpXHJcblx0Z2wuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZTogTW91c2VFdmVudCkgPT4gKGlzUm90YXRhYmxlID0gZmFsc2UpKVxyXG5cdGdsLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZTogTW91c2VFdmVudCkgPT4ge1xyXG5cdFx0aWYgKCFpc1JvdGF0YWJsZSkgcmV0dXJuIGZhbHNlXHJcblxyXG5cdFx0aWYgKGUuc2hpZnRLZXkpIHtcclxuXHRcdFx0c2NlbmUubW9kZWxUcmFuc2xhdGVYLnZhbHVlICs9IDEwICogKGUubW92ZW1lbnRYIC8gZ2wuZHJhd2luZ0J1ZmZlcldpZHRoKVxyXG5cdFx0XHRzY2VuZS5tb2RlbFRyYW5zbGF0ZVkudmFsdWUgLT0gMTAgKiAoZS5tb3ZlbWVudFkgLyBnbC5kcmF3aW5nQnVmZmVyV2lkdGgpXHJcblxyXG5cdFx0XHR1cGRhdGVJbmZvYmFyKHNjZW5lLm1vZGVsVHJhbnNsYXRlWC5lbGVtKVxyXG5cdFx0XHR1cGRhdGVJbmZvYmFyKHNjZW5lLm1vZGVsVHJhbnNsYXRlWS5lbGVtKVxyXG5cclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cdFx0c2NlbmUubW9kZWxSb3RhdGVYLnZhbHVlICs9IGUubW92ZW1lbnRZIC8gM1xyXG5cdFx0c2NlbmUubW9kZWxSb3RhdGVZLnZhbHVlICs9IGUubW92ZW1lbnRYIC8gM1xyXG5cclxuXHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUubW9kZWxSb3RhdGVYLmVsZW0pXHJcblx0XHR1cGRhdGVJbmZvYmFyKHNjZW5lLm1vZGVsUm90YXRlWS5lbGVtKVxyXG5cdH0pXHJcblxyXG5cdGdsLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIChlOiBXaGVlbEV2ZW50KSA9PiB7XHJcblx0XHRsZXQgZGlyZWN0aW9uOiBudW1iZXIgPSBlLmRlbHRhWSA8IDAgPyAtMC4xNSA6IDAuMTVcclxuXHRcdGlmIChlLnNoaWZ0S2V5KSBkaXJlY3Rpb24gKj0gM1xyXG5cdFx0c2NlbmUuY2FtZXJhWi52YWx1ZSArPSBkaXJlY3Rpb25cclxuXHRcdHVwZGF0ZUluZm9iYXIoc2NlbmUuY2FtZXJhWi5lbGVtKVxyXG5cdH0pXHJcbn1cclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpOiB2b2lkIHtcclxuXHRmb3IgKGNvbnN0IGtleSBpbiBzY2VuZSkge1xyXG5cdFx0aWYgKHNjZW5lLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuXHRcdFx0c2NlbmVba2V5XS52YWx1ZSA9ICtwYXJzZUZsb2F0KHNjZW5lW2tleV0uZWxlbS5pbm5lckhUTUwpXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR3ZWJHTFN0YXJ0KClcclxuXHRzZXRDYW52YXNDb250cm9scygpXHJcbn1cclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoZTogRXZlbnQpID0+IHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoZ2wuY2FudmFzKSlcclxuIiwiLypcclxuICogQ29weXJpZ2h0IDIwMTAsIEdvb2dsZSBJbmMuXHJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxyXG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXHJcbiAqIG1ldDpcclxuICpcclxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcclxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXHJcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxyXG4gKiBkaXN0cmlidXRpb24uXHJcbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR29vZ2xlIEluYy4gbm9yIHRoZSBuYW1lcyBvZiBpdHNcclxuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cclxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cclxuICpcclxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xyXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXHJcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxyXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxyXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcclxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxyXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcclxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXHJcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcclxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXHJcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcbiAqXHJcbiAqIE1vZGlmaWVkIGJ5IEFsZXggR2FybmVhdSAtIEZlYiAyLCAyMDEyIC0gZ3NraW5uZXIuY29tIGluYy5cclxuICovXHJcblxyXG4vKipcclxuICogQGZpbGVvdmVydmlldyBUaGlzIGZpbGUgY29udGFpbnMgZnVuY3Rpb25zIGV2ZXJ5IHdlYmdsIHByb2dyYW0gd2lsbCBuZWVkXHJcbiAqIGEgdmVyc2lvbiBvZiBvbmUgd2F5IG9yIGFub3RoZXIuXHJcbiAqXHJcbiAqIEluc3RlYWQgb2Ygc2V0dGluZyB1cCBhIGNvbnRleHQgbWFudWFsbHkgaXQgaXMgcmVjb21tZW5kZWQgdG9cclxuICogdXNlLiBUaGlzIHdpbGwgY2hlY2sgZm9yIHN1Y2Nlc3Mgb3IgZmFpbHVyZS4gT24gZmFpbHVyZSBpdFxyXG4gKiB3aWxsIGF0dGVtcHQgdG8gcHJlc2VudCBhbiBhcHByb3JpYXRlIG1lc3NhZ2UgdG8gdGhlIHVzZXIuXHJcbiAqXHJcbiAqICAgICAgIGdsID0gV2ViR0xVdGlscy5zZXR1cFdlYkdMKGNhbnZhcyk7XHJcbiAqXHJcbiAqIEZvciBhbmltYXRlZCBXZWJHTCBhcHBzIHVzZSBvZiBzZXRUaW1lb3V0IG9yIHNldEludGVydmFsIGFyZVxyXG4gKiBkaXNjb3VyYWdlZC4gSXQgaXMgcmVjb21tZW5kZWQgeW91IHN0cnVjdHVyZSB5b3VyIHJlbmRlcmluZ1xyXG4gKiBsb29wIGxpa2UgdGhpcy5cclxuICpcclxuICogICAgICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gKiAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lKHJlbmRlciwgY2FudmFzKTtcclxuICpcclxuICogICAgICAgICAvLyBkbyByZW5kZXJpbmdcclxuICogICAgICAgICAuLi5cclxuICogICAgICAgfVxyXG4gKiAgICAgICByZW5kZXIoKTtcclxuICpcclxuICogVGhpcyB3aWxsIGNhbGwgeW91ciByZW5kZXJpbmcgZnVuY3Rpb24gdXAgdG8gdGhlIHJlZnJlc2ggcmF0ZVxyXG4gKiBvZiB5b3VyIGRpc3BsYXkgYnV0IHdpbGwgc3RvcCByZW5kZXJpbmcgaWYgeW91ciBhcHAgaXMgbm90XHJcbiAqIHZpc2libGUuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uRnJvbU1hdHJpeChtYXRyaXg6IG51bWJlcltdKTogeyB4OiBudW1iZXI7IHk6IG51bWJlcjsgejogbnVtYmVyIH0ge1xyXG5cdHJldHVybiB7IHg6IG1hdHJpeFsxMl0sIHk6IG1hdHJpeFsxM10sIHo6IG1hdHJpeFsxNF0gfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um90YXRpb25Gcm9tTWF0cml4KG1hdHJpeDogbnVtYmVyW10pIHtcclxuXHRyZXR1cm4geyB4OiBNYXRoLmFzaW4obWF0cml4WzZdKSwgeTogTWF0aC5hc2luKG1hdHJpeFs4XSksIHo6IE1hdGguYXNpbihtYXRyaXhbMV0pIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZ1RvUmFkKGRlZ3JlZXM6IG51bWJlciB8IHN0cmluZyk6IG51bWJlciB7XHJcblx0cmV0dXJuIChwYXJzZUZsb2F0KGRlZ3JlZXMgYXMgc3RyaW5nKSAqIE1hdGguUEkpIC8gMTgwXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50KTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHtcclxuXHRyZXR1cm4geyB4OiBldmVudC5vZmZzZXRYLCB5OiBldmVudC5vZmZzZXRZIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVGcm9tTW91c2UoXHJcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRtb3VzZTogTW91c2VFdmVudCxcclxuXHRncmlkU2l6ZTogbnVtYmVyLFxyXG5cdEdSSURfV0lEVEg6IG51bWJlcixcclxuXHRHUklEX0hFSUdIVDogbnVtYmVyXHJcbik6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwge1xyXG5cdC8vIFdlJ3JlIGdldHRpbmcgaXQgaW4gdGhpcyBmb3JtYXQ6IGxlZnQ9MCwgcmlnaHQ9Z3JpZFNpemUuIFNhbWUgd2l0aCB0b3AgYW5kIGJvdHRvbS5cclxuXHQvLyBGaXJzdCwgbGV0J3Mgc2VlIHdoYXQgdGhlIGdyaWQgbG9va3MgbGlrZSBjb21wYXJlZCB0byB0aGUgY2FudmFzLlxyXG5cdC8vIEl0cyBib3JkZXJzIHdpbGwgYWx3YXlzIGJlIHRvdWNoaW5nIHdoaWNoZXZlciBwYXJ0J3MgdGhpbm5lcjogdGhlIHdpZHRoIG9yIHRoZSBoZWlnaHQuXHJcblxyXG5cdGNvbnN0IG1pZGRsZUNhbnZhczogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9ID0geyB4OiBjYW52YXMud2lkdGggLyAyLCB5OiBjYW52YXMuaGVpZ2h0IC8gMiB9XHJcblxyXG5cdGNvbnN0IHBvczogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9ID0ge1xyXG5cdFx0eDogKGdyaWRTaXplICogKG1vdXNlLnggLSAobWlkZGxlQ2FudmFzLnggLSBHUklEX1dJRFRIICogMC41KSkpIC8gR1JJRF9XSURUSCxcclxuXHRcdHk6IChncmlkU2l6ZSAqIChtb3VzZS55IC0gKG1pZGRsZUNhbnZhcy55IC0gR1JJRF9IRUlHSFQgKiAwLjUpKSkgLyBHUklEX0hFSUdIVCxcclxuXHR9XHJcblxyXG5cdGlmIChwb3MueCA+PSAwICYmIHBvcy54IDw9IGdyaWRTaXplICYmIHBvcy55ID49IDAgJiYgcG9zLnkgPD0gZ3JpZFNpemUpIHtcclxuXHRcdGNvbnN0IGl0ZW0gPSB7IHg6IHBvcy54IHwgMCwgeTogcG9zLnkgfCAwIH1cclxuXHRcdHJldHVybiBpdGVtXHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBudWxsXHJcblx0fVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb29yZGluYXRlRnJvbU1vdXNlKFxyXG5cdGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXHJcblx0bW91c2U6IE1vdXNlRXZlbnQsXHJcblx0Z3JpZFNpemU6IG51bWJlcixcclxuXHRHUklEX1dJRFRIOiBudW1iZXIsXHJcblx0R1JJRF9IRUlHSFQ6IG51bWJlclxyXG4pOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0ge1xyXG5cdC8vIFdlJ3JlIGdldHRpbmcgaXQgaW4gdGhpcyBmb3JtYXQ6IGxlZnQ9MCwgcmlnaHQ9Z3JpZFNpemUuIFNhbWUgd2l0aCB0b3AgYW5kIGJvdHRvbS5cclxuXHQvLyBGaXJzdCwgbGV0J3Mgc2VlIHdoYXQgdGhlIGdyaWQgbG9va3MgbGlrZSBjb21wYXJlZCB0byB0aGUgY2FudmFzLlxyXG5cdC8vIEl0cyBib3JkZXJzIHdpbGwgYWx3YXlzIGJlIHRvdWNoaW5nIHdoaWNoZXZlciBwYXJ0J3MgdGhpbm5lcjogdGhlIHdpZHRoIG9yIHRoZSBoZWlnaHQuXHJcblxyXG5cdGNvbnN0IG1pZGRsZUNhbnZhczogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9ID0geyB4OiBjYW52YXMud2lkdGgsIHk6IGNhbnZhcy5oZWlnaHQgfVxyXG5cclxuXHRjb25zdCBwb3M6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSA9IHtcclxuXHRcdHg6IChncmlkU2l6ZSAqIChtb3VzZS54IC0gKG1pZGRsZUNhbnZhcy54IC0gR1JJRF9XSURUSCAqIDAuNSkpKSAvIEdSSURfV0lEVEgsXHJcblx0XHR5OiAoZ3JpZFNpemUgKiAobW91c2UueSAtIChtaWRkbGVDYW52YXMueSAtIEdSSURfSEVJR0hUICogMC41KSkpIC8gR1JJRF9IRUlHSFQsXHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcG9zXHJcbn1cclxuXHJcbi8qXHJcbiAqIFdoZW4gYW4gaW1hZ2UgaXMgbG9hZGVkLCB0aGlzIHdpbGwgc3RvcmUgaXQgaW4gdGhlIHNoYWRlciB0byBiZSB1c2VkIGJ5IHRoZSBzYW1wbGVyIHJlZmVyZW5jZXMuXHJcbiAqIEZvciBleGFtcGxlLCB0byB1c2UgdGhlIHRleHR1cmUgc3RvcmVkIGF0IFRFWFRVUkUwLCB5b3Ugc2V0IHRoZSBzYW1wbGVyIHRvIDAuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRleHR1cmUoXHJcblx0Z2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCxcclxuXHRpbWFnZVVSTDogc3RyaW5nLFxyXG5cdGdsVGV4dHVyZTogR0xlbnVtXHJcbik6IFdlYkdMVGV4dHVyZSB7XHJcblx0ZnVuY3Rpb24gaXNQb3dlck9mMih2YWx1ZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0XHRpZiAoKHZhbHVlICYgKHZhbHVlIC0gMSkpID09PSAwKSB7XHJcblx0XHRcdHJldHVybiB0cnVlXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpbnRlcmZhY2UgSVdlYkdMVGV4dHVyZUV4dGVuZGVkIGV4dGVuZHMgV2ViR0xUZXh0dXJlIHtcclxuXHRcdGltYWdlPzogSFRNTEltYWdlRWxlbWVudFxyXG5cdH1cclxuXHJcblx0Y29uc3QgdGV4dHVyZTogSVdlYkdMVGV4dHVyZUV4dGVuZGVkID0gZ2wuY3JlYXRlVGV4dHVyZSgpXHJcblx0dGV4dHVyZS5pbWFnZSA9IG5ldyBJbWFnZSgpXHJcblx0dGV4dHVyZS5pbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpOiB2b2lkIHtcclxuXHRcdGdsLmFjdGl2ZVRleHR1cmUoZ2xUZXh0dXJlKVxyXG5cdFx0Z2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgMSlcclxuXHRcdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpXHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKVxyXG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUilcclxuXHRcdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgdGV4dHVyZS5pbWFnZSlcclxuXHJcblx0XHQvLyBUaGlzIGNsYW1wcyBpbWFnZXMgd2hvc2UgZGltZW5zaW9ucyBhcmUgbm90IGEgcG93ZXIgb2YgMiwgbGV0dGluZyB5b3UgdXNlIGltYWdlcyBvZiBhbnkgc2l6ZS5cclxuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpXHJcblx0XHRnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKVxyXG5cdH1cclxuXHJcblx0dGV4dHVyZS5pbWFnZS5zcmMgPSBpbWFnZVVSTFxyXG5cdHJldHVybiB0ZXh0dXJlXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlYXNlKGZyb206IG51bWJlciwgdG86IG51bWJlciwgZWFzaW5lc3M6IG51bWJlcik6IG51bWJlciB7XHJcblx0aWYgKGVhc2luZXNzID4gMSkge1xyXG5cdFx0ZWFzaW5lc3MgPSAxIC8gZWFzaW5lc3NcclxuXHR9XHJcblx0cmV0dXJuICh0byAtIGZyb20pICogZWFzaW5lc3NcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlBbGVydE1hdHJpeChtYXRyaXg6IG51bWJlcltdKTogdm9pZCB7XHJcblx0bGV0IHRlc3RTdHJpbmc6IHN0cmluZyA9ICcnXHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMCwgbDogbnVtYmVyID0gbWF0cml4Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG5cdFx0aWYgKGkgJSA0ID09PSAwICYmIGkgPiAwKSB7XHJcblx0XHRcdHRlc3RTdHJpbmcgKz0gJ1xcbidcclxuXHRcdH1cclxuXHRcdHRlc3RTdHJpbmcgKz0gbWF0cml4W2ldICsgJywgJ1xyXG5cdH1cclxuXHR0ZXN0U3RyaW5nICs9ICcnXHJcblx0YWxlcnQodGVzdFN0cmluZylcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZFZlY3RvcnModmVjMTogbnVtYmVyW10sIHZlYzI6IG51bWJlcltdKTogbnVtYmVyW10ge1xyXG5cdGZvciAobGV0IGk6IG51bWJlciA9IDAsIGw6IG51bWJlciA9IHZlYzEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHRpZiAodmVjMltpXSkge1xyXG5cdFx0XHR2ZWMxW2ldICs9IHZlYzJbaV1cclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIHZlYzFcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3RWZWN0b3JzKHZlYzE6IG51bWJlcltdLCB2ZWMyOiBudW1iZXJbXSk6IG51bWJlcltdIHtcclxuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAwLCBsOiBudW1iZXIgPSB2ZWMxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG5cdFx0aWYgKHZlYzJbaV0pIHtcclxuXHRcdFx0dmVjMVtpXSAtPSB2ZWMyW2ldXHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiB2ZWMxXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlVmVjdG9yKHZlYzogbnVtYmVyW10pOiBudW1iZXJbXSB7XHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMCwgbDogbnVtYmVyID0gdmVjLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG5cdFx0dmVjW2ldID0gMSAtIE1hdGguYWJzKHZlY1tpXSlcclxuXHR9XHJcblx0cmV0dXJuIHZlY1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWxlcnRNYXQ0KG1hdDogbnVtYmVyW10pOiB2b2lkIHtcclxuXHRsZXQgc3RyaW5nOiBzdHJpbmcgPSAnWydcclxuXHJcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IDQ7IGkrKykge1xyXG5cdFx0Zm9yIChsZXQgajogbnVtYmVyID0gMDsgaiA8IDQ7IGorKykge1xyXG5cdFx0XHRzdHJpbmcgKz0gTWF0aC5yb3VuZChtYXRbaSAqIDQgKyBqXSkudG9TdHJpbmcoKSArICcsIFxcdCdcclxuXHRcdH1cclxuXHRcdHN0cmluZyArPSAnXFxuJ1xyXG5cdH1cclxuXHRzdHJpbmcgKz0gJ10nXHJcblx0YWxlcnQoc3RyaW5nKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRmxvYXQzMkNvbmNhdChvcmlnaW5hbDogbnVtYmVyW10sIGFkZGl0aW9uOiBudW1iZXJbXSk6IEZsb2F0MzJBcnJheSB8IG51bWJlcltdIHtcclxuXHRpZiAoIW9yaWdpbmFsKSB7XHJcblx0XHRyZXR1cm4gYWRkaXRpb25cclxuXHR9XHJcblxyXG5cdGNvbnN0IGxlbmd0aDogbnVtYmVyID0gb3JpZ2luYWwubGVuZ3RoXHJcblx0Y29uc3QgdG90YWxMZW5ndGg6IG51bWJlciA9IGxlbmd0aCArIGFkZGl0aW9uLmxlbmd0aFxyXG5cclxuXHRjb25zdCByZXN1bHQgPSBuZXcgRmxvYXQzMkFycmF5KHRvdGFsTGVuZ3RoKVxyXG5cclxuXHRyZXN1bHQuc2V0KG9yaWdpbmFsKVxyXG5cdHJlc3VsdC5zZXQoYWRkaXRpb24sIGxlbmd0aClcclxuXHJcblx0cmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5sZXQgdG90YWxUaW1lUGFzc2VkOiBudW1iZXIgPSAwXHJcbmxldCBsYXN0VGltZVBhc3NlZDogbnVtYmVyID0gMFxyXG5leHBvcnQgZnVuY3Rpb24gQ29uc29sZVRpbWVQYXNzZWQobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcblx0dG90YWxUaW1lUGFzc2VkID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuXHRjb25zb2xlLmxvZyhtZXNzYWdlICsgJzogJyArICh0b3RhbFRpbWVQYXNzZWQgLSBsYXN0VGltZVBhc3NlZCkpXHJcblx0bGFzdFRpbWVQYXNzZWQgPSB0b3RhbFRpbWVQYXNzZWRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVhc2VOb3JtYWxWZWModmVjOiBudW1iZXJbXSk6IG51bWJlcltdIHtcclxuXHR2ZWNbMF0gKz0gKDEgLSB2ZWNbMF0pIC8gMlxyXG5cdHZlY1sxXSArPSAoMSAtIHZlY1sxXSkgLyAyXHJcblx0dmVjWzJdICs9ICgxIC0gdmVjWzJdKSAvIDJcclxuXHJcblx0cmV0dXJuIHZlY1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCZXR3ZWVuVmVjKG1pbjogbnVtYmVyW10sIHJhbmdlOiBudW1iZXJbXSk6IG51bWJlcltdIHtcclxuXHRjb25zdCB2ZWM6IG51bWJlcltdID0gWzAsIDAsIDBdXHJcblx0dmVjWzBdID0gTWF0aC5yYW5kb20oKSAqIHJhbmdlWzBdICsgbWluWzBdXHJcblx0dmVjWzFdID0gTWF0aC5yYW5kb20oKSAqIHJhbmdlWzFdICsgbWluWzFdXHJcblx0dmVjWzJdID0gTWF0aC5yYW5kb20oKSAqIHJhbmdlWzJdICsgbWluWzJdXHJcblxyXG5cdHJldHVybiB2ZWNcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZSh2ZWM6IG51bWJlcltdKTogbnVtYmVyW10ge1xyXG5cdGxldCBpOiBudW1iZXIgPSAwXHJcblx0bGV0IHRvdGFsOiBudW1iZXIgPSAwXHJcblx0Y29uc3QgbDogbnVtYmVyID0gdmVjLmxlbmd0aFxyXG5cdGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuXHRcdHRvdGFsICs9IHZlY1tpXVxyXG5cdH1cclxuXHRmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XHJcblx0XHR2ZWNbaV0gLz0gdG90YWxcclxuXHR9XHJcblx0cmV0dXJuIHZlY1xyXG59XHJcblxyXG5jb25zdCBXZWJHTFV0aWxzID0gKGZ1bmN0aW9uKCk6IHtcclxuXHRzZXR1cFdlYkdMOiAoXHJcblx0XHRjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG5cdFx0b3B0X2F0dHJpYnM/OiBvYmplY3QsXHJcblx0XHRvcHRfb25FcnJvcj86IGFueVxyXG5cdCkgPT4gQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgV2ViR0xSZW5kZXJpbmdDb250ZXh0IHwgbnVsbFxyXG5cdGNyZWF0ZTNEQ29udGV4dDogKFxyXG5cdFx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRcdG9wdF9hdHRyaWJzPzogb2JqZWN0XHJcblx0KSA9PiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBXZWJHTFJlbmRlcmluZ0NvbnRleHQgfCBudWxsXHJcbn0ge1xyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgdGhlIEhUTE0gZm9yIGEgZmFpbHVyZSBtZXNzYWdlXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGNhbnZhc0NvbnRhaW5lcklkIGlkIG9mIGNvbnRhaW5lciBvZiB0aFxyXG5cdCAqICAgICAgICBjYW52YXMuXHJcblx0ICogQHJldHVybiB7c3RyaW5nfSBUaGUgaHRtbC5cclxuXHQgKi9cclxuXHRjb25zdCBtYWtlRmFpbEhUTUwgPSBmdW5jdGlvbihtc2c6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQnJyArXHJcblx0XHRcdCc8dGFibGUgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjOENFOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiPjx0cj4nICtcclxuXHRcdFx0Jzx0ZCBhbGlnbj1cImNlbnRlclwiPicgK1xyXG5cdFx0XHQnPGRpdiBzdHlsZT1cImRpc3BsYXk6IHRhYmxlLWNlbGw7IHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XCI+JyArXHJcblx0XHRcdCc8ZGl2IHN0eWxlPVwiXCI+JyArXHJcblx0XHRcdG1zZyArXHJcblx0XHRcdCc8L2Rpdj4nICtcclxuXHRcdFx0JzwvZGl2PicgK1xyXG5cdFx0XHQnPC90ZD48L3RyPjwvdGFibGU+J1xyXG5cdFx0KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWVzYXNnZSBmb3IgZ2V0dGluZyBhIHdlYmdsIGJyb3dzZXJcclxuXHQgKiBAdHlwZSB7c3RyaW5nfVxyXG5cdCAqL1xyXG5cdGNvbnN0IEdFVF9BX1dFQkdMX0JST1dTRVI6IHN0cmluZyA9XHJcblx0XHQnJyArXHJcblx0XHQnVGhpcyBwYWdlIHJlcXVpcmVzIGEgYnJvd3NlciB0aGF0IHN1cHBvcnRzIFdlYkdMLjxici8+JyArXHJcblx0XHQnPGEgaHJlZj1cImh0dHA6Ly9nZXQud2ViZ2wub3JnXCI+Q2xpY2sgaGVyZSB0byB1cGdyYWRlIHlvdXIgYnJvd3Nlci48L2E+J1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXNhc2dlIGZvciBuZWVkIGJldHRlciBoYXJkd2FyZVxyXG5cdCAqIEB0eXBlIHtzdHJpbmd9XHJcblx0ICovXHJcblx0Y29uc3QgT1RIRVJfUFJPQkxFTTogc3RyaW5nID0gYEl0IGRvZXNuJ3QgYXBwZWFyIHlvdXIgY29tcHV0ZXIgY2FuIHN1cHBvcnQgV2ViR0wuPGJyLz5cclxuXHRcdDxhIGhyZWY9XCJodHRwOi8vZ2V0LndlYmdsLm9yZy90cm91Ymxlc2hvb3RpbmcvXCI+Q2xpY2sgaGVyZSBmb3IgbW9yZSBpbmZvcm1hdGlvbi48L2E+YFxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgd2ViZ2wgY29udGV4dC4gSWYgY3JlYXRpb24gZmFpbHMgaXQgd2lsbFxyXG5cdCAqIGNoYW5nZSB0aGUgY29udGVudHMgb2YgdGhlIGNvbnRhaW5lciBvZiB0aGUgPGNhbnZhcz5cclxuXHQgKiB0YWcgdG8gYW4gZXJyb3IgbWVzc2FnZSB3aXRoIHRoZSBjb3JyZWN0IGxpbmtzIGZvciBXZWJHTC5cclxuXHQgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXMuIFRoZSBjYW52YXMgZWxlbWVudCB0byBjcmVhdGUgYVxyXG5cdCAqICAgICBjb250ZXh0IGZyb20uXHJcblx0ICogQHBhcmFtIHtXZWJHTENvbnRleHRDcmVhdGlvbkF0dGlyYnV0ZXN9IG9wdF9hdHRyaWJzIEFueVxyXG5cdCAqICAgICBjcmVhdGlvbiBhdHRyaWJ1dGVzIHlvdSB3YW50IHRvIHBhc3MgaW4uXHJcblx0ICogQHBhcmFtIHtmdW5jdGlvbjoobXNnKX0gb3B0X29uRXJyb3IgQW4gZnVuY3Rpb24gdG8gY2FsbFxyXG5cdCAqICAgICBpZiB0aGVyZSBpcyBhbiBlcnJvciBkdXJpbmcgY3JlYXRpb24uXHJcblx0ICogQHJldHVybiB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBUaGUgY3JlYXRlZCBjb250ZXh0LlxyXG5cdCAqL1xyXG5cdGNvbnN0IHNldHVwV2ViR0wgPSBmdW5jdGlvbihcclxuXHRcdGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXHJcblx0XHRvcHRfYXR0cmlicz86IG9iamVjdCxcclxuXHRcdG9wdF9vbkVycm9yPzogYW55XHJcblx0KTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgV2ViR0xSZW5kZXJpbmdDb250ZXh0IHwgbnVsbCB7XHJcblx0XHRmdW5jdGlvbiBoYW5kbGVDcmVhdGlvbkVycm9yKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHRcdGNvbnN0IGNvbnRhaW5lcjogTm9kZSA9IGNhbnZhcy5wYXJlbnROb2RlXHJcblx0XHRcdGlmIChjb250YWluZXIpIHtcclxuXHRcdFx0XHRsZXQgc3RyOiBzdHJpbmcgPSAod2luZG93IGFzIGFueSkuV2ViR0xSZW5kZXJpbmdDb250ZXh0XHJcblx0XHRcdFx0XHQ/IE9USEVSX1BST0JMRU1cclxuXHRcdFx0XHRcdDogR0VUX0FfV0VCR0xfQlJPV1NFUlxyXG5cdFx0XHRcdGlmIChtc2cpIHtcclxuXHRcdFx0XHRcdHN0ciArPSAnPGJyLz48YnIvPlN0YXR1czogJyArIG1zZ1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjb250YWluZXIudGV4dENvbnRlbnQgPSBtYWtlRmFpbEhUTUwoc3RyKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0b3B0X29uRXJyb3IgPSBvcHRfb25FcnJvciB8fCBoYW5kbGVDcmVhdGlvbkVycm9yXHJcblxyXG5cdFx0aWYgKGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKSB7XHJcblx0XHRcdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxyXG5cdFx0XHRcdCd3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yJyxcclxuXHRcdFx0XHQoZXZlbnQ6IFdlYkdMQ29udGV4dEV2ZW50KTogdm9pZCA9PiBvcHRfb25FcnJvcihldmVudC5zdGF0dXNNZXNzYWdlKVxyXG5cdFx0XHQpXHJcblx0XHR9XHJcblx0XHRjb25zdCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBXZWJHTFJlbmRlcmluZ0NvbnRleHQgfCBudWxsID0gY3JlYXRlM0RDb250ZXh0KFxyXG5cdFx0XHRjYW52YXMsXHJcblx0XHRcdG9wdF9hdHRyaWJzXHJcblx0XHQpXHJcblx0XHRpZiAoIWNvbnRleHQpIHtcclxuXHRcdFx0aWYgKCEod2luZG93IGFzIGFueSkuV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB7XHJcblx0XHRcdFx0b3B0X29uRXJyb3IoJycpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBjb250ZXh0XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgd2ViZ2wgY29udGV4dC5cclxuXHQgKiBAcGFyYW0geyFDYW52YXN9IGNhbnZhcyBUaGUgY2FudmFzIHRhZyB0byBnZXQgY29udGV4dFxyXG5cdCAqICAgICBmcm9tLiBJZiBvbmUgaXMgbm90IHBhc3NlZCBpbiBvbmUgd2lsbCBiZSBjcmVhdGVkLlxyXG5cdCAqIEByZXR1cm4geyFXZWJHTENvbnRleHR9IFRoZSBjcmVhdGVkIGNvbnRleHQuXHJcblx0ICovXHJcblx0Y29uc3QgY3JlYXRlM0RDb250ZXh0ID0gZnVuY3Rpb24oXHJcblx0XHRjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxyXG5cdFx0b3B0X2F0dHJpYnM/OiBvYmplY3RcclxuXHQpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBXZWJHTFJlbmRlcmluZ0NvbnRleHQgfCBudWxsIHtcclxuXHRcdGNvbnN0IG5hbWVzOiBzdHJpbmdbXSA9IFsnd2ViZ2wnLCAnZXhwZXJpbWVudGFsLXdlYmdsJywgJ3dlYmtpdC0zZCcsICdtb3otd2ViZ2wnXVxyXG5cdFx0bGV0IGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IG51bGwgPSBudWxsXHJcblx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQobmFtZSwgb3B0X2F0dHJpYnMpXHJcblx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGNvbnRleHQpIHtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY29udGV4dFxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHsgc2V0dXBXZWJHTCwgY3JlYXRlM0RDb250ZXh0IH1cclxufSkoKVxyXG5cclxud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gKFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0KHdpbmRvdyBhcyBhbnkpLm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuXHRcdCh3aW5kb3cgYXMgYW55KS5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0ZnVuY3Rpb24oY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuXHRcdFx0d2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyAxNSlcclxuXHRcdH1cclxuXHQpXHJcbn0pKClcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdlYkdMVXRpbHNcclxuIiwiLyohXHJcbkBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXHJcbkBhdXRob3IgQnJhbmRvbiBKb25lc1xyXG5AYXV0aG9yIENvbGluIE1hY0tlbnppZSBJVlxyXG5AdmVyc2lvbiAzLjAuMFxyXG5cclxuQ29weXJpZ2h0IChjKSAyMDE1LTIwMTksIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi5cclxuXHJcblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cclxuVEhFIFNPRlRXQVJFLlxyXG5cclxuKi9cclxuOyhmdW5jdGlvbihnbG9iYWwsIGZhY3RvcnkpIHtcclxuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCdcclxuXHRcdD8gZmFjdG9yeShleHBvcnRzKVxyXG5cdFx0OiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWRcclxuXHRcdD8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KVxyXG5cdFx0OiBmYWN0b3J5KChnbG9iYWwuZ2xNYXRyaXggPSB7fSkpXHJcbn0pKHRoaXMsIGZ1bmN0aW9uKGV4cG9ydHMpIHtcclxuXHQndXNlIHN0cmljdCdcclxuXHJcblx0LyoqXHJcblx0ICogQ29tbW9uIHV0aWxpdGllc1xyXG5cdCAqIEBtb2R1bGUgZ2xNYXRyaXhcclxuXHQgKi9cclxuXHQvLyBDb25maWd1cmF0aW9uIENvbnN0YW50c1xyXG5cdHZhciBFUFNJTE9OID0gMC4wMDAwMDFcclxuXHR2YXIgQVJSQVlfVFlQRSA9IHR5cGVvZiBGbG9hdDMyQXJyYXkgIT09ICd1bmRlZmluZWQnID8gRmxvYXQzMkFycmF5IDogQXJyYXlcclxuXHR2YXIgUkFORE9NID0gTWF0aC5yYW5kb21cclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSB0eXBlIG9mIGFycmF5IHVzZWQgd2hlbiBjcmVhdGluZyBuZXcgdmVjdG9ycyBhbmQgbWF0cmljZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXRNYXRyaXhBcnJheVR5cGUodHlwZSkge1xyXG5cdFx0QVJSQVlfVFlQRSA9IHR5cGVcclxuXHR9XHJcblx0dmFyIGRlZ3JlZSA9IE1hdGguUEkgLyAxODBcclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IERlZ3JlZSBUbyBSYWRpYW5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBhIEFuZ2xlIGluIERlZ3JlZXNcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdG9SYWRpYW4oYSkge1xyXG5cdFx0cmV0dXJuIGEgKiBkZWdyZWVcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVGVzdHMgd2hldGhlciBvciBub3QgdGhlIGFyZ3VtZW50cyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgdmFsdWUsIHdpdGhpbiBhbiBhYnNvbHV0ZVxyXG5cdCAqIG9yIHJlbGF0aXZlIHRvbGVyYW5jZSBvZiBnbE1hdHJpeC5FUFNJTE9OIChhbiBhYnNvbHV0ZSB0b2xlcmFuY2UgaXMgdXNlZCBmb3IgdmFsdWVzIGxlc3NcclxuXHQgKiB0aGFuIG9yIGVxdWFsIHRvIDEuMCwgYW5kIGEgcmVsYXRpdmUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIGxhcmdlciB2YWx1ZXMpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYSBUaGUgZmlyc3QgbnVtYmVyIHRvIHRlc3QuXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCBudW1iZXIgdG8gdGVzdC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbnVtYmVycyBhcmUgYXBwcm94aW1hdGVseSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xyXG5cdFx0cmV0dXJuIE1hdGguYWJzKGEgLSBiKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhKSwgTWF0aC5hYnMoYikpXHJcblx0fVxyXG5cclxuXHR2YXIgY29tbW9uID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdEVQU0lMT046IEVQU0lMT04sXHJcblx0XHRnZXQgQVJSQVlfVFlQRSgpIHtcclxuXHRcdFx0cmV0dXJuIEFSUkFZX1RZUEVcclxuXHRcdH0sXHJcblx0XHRSQU5ET006IFJBTkRPTSxcclxuXHRcdHNldE1hdHJpeEFycmF5VHlwZTogc2V0TWF0cml4QXJyYXlUeXBlLFxyXG5cdFx0dG9SYWRpYW46IHRvUmFkaWFuLFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogMngyIE1hdHJpeFxyXG5cdCAqIEBtb2R1bGUgbWF0MlxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBhIG5ldyAyeDIgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg0KVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMV0gPSAwXHJcblx0XHRcdG91dFsyXSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgbWF0MiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBhIG1hdHJpeCB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBhIG5ldyAyeDIgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lKGEpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg0KVxyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MiB0byBhbm90aGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29weShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IGEgbWF0MiB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIG5ldyBtYXQyIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXQgQSBuZXcgMngyIG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzKG0wMCwgbTAxLCBtMTAsIG0xMSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblx0XHRvdXRbMF0gPSBtMDBcclxuXHRcdG91dFsxXSA9IG0wMVxyXG5cdFx0b3V0WzJdID0gbTEwXHJcblx0XHRvdXRbM10gPSBtMTFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0MiB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMylcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMTAsIG0xMSkge1xyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0xMFxyXG5cdFx0b3V0WzNdID0gbTExXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcclxuXHRcdC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGVcclxuXHRcdC8vIHNvbWUgdmFsdWVzXHJcblx0XHRpZiAob3V0ID09PSBhKSB7XHJcblx0XHRcdHZhciBhMSA9IGFbMV1cclxuXHRcdFx0b3V0WzFdID0gYVsyXVxyXG5cdFx0XHRvdXRbMl0gPSBhMVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0XHRvdXRbMV0gPSBhWzJdXHJcblx0XHRcdG91dFsyXSA9IGFbMV1cclxuXHRcdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogSW52ZXJ0cyBhIG1hdDJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuXHJcblx0XHR2YXIgZGV0ID0gYTAgKiBhMyAtIGEyICogYTFcclxuXHJcblx0XHRpZiAoIWRldCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGRldCA9IDEuMCAvIGRldFxyXG5cdFx0b3V0WzBdID0gYTMgKiBkZXRcclxuXHRcdG91dFsxXSA9IC1hMSAqIGRldFxyXG5cdFx0b3V0WzJdID0gLWEyICogZGV0XHJcblx0XHRvdXRbM10gPSBhMCAqIGRldFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xyXG5cdFx0Ly8gQ2FjaGluZyB0aGlzIHZhbHVlIGlzIG5lc3NlY2FyeSBpZiBvdXQgPT0gYVxyXG5cdFx0dmFyIGEwID0gYVswXVxyXG5cdFx0b3V0WzBdID0gYVszXVxyXG5cdFx0b3V0WzFdID0gLWFbMV1cclxuXHRcdG91dFsyXSA9IC1hWzJdXHJcblx0XHRvdXRbM10gPSBhMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGV0ZXJtaW5hbnQoYSkge1xyXG5cdFx0cmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsyXSAqIGFbMV1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gbWF0MidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0b3V0WzBdID0gYTAgKiBiMCArIGEyICogYjFcclxuXHRcdG91dFsxXSA9IGExICogYjAgKyBhMyAqIGIxXHJcblx0XHRvdXRbMl0gPSBhMCAqIGIyICsgYTIgKiBiM1xyXG5cdFx0b3V0WzNdID0gYTEgKiBiMiArIGEzICogYjNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdDIgYnkgdGhlIGdpdmVuIGFuZ2xlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM11cclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBhMCAqIGMgKyBhMiAqIHNcclxuXHRcdG91dFsxXSA9IGExICogYyArIGEzICogc1xyXG5cdFx0b3V0WzJdID0gYTAgKiAtcyArIGEyICogY1xyXG5cdFx0b3V0WzNdID0gYTEgKiAtcyArIGEzICogY1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTY2FsZXMgdGhlIG1hdDIgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM11cclxuXHRcdHZhciB2MCA9IHZbMF0sXHJcblx0XHRcdHYxID0gdlsxXVxyXG5cdFx0b3V0WzBdID0gYTAgKiB2MFxyXG5cdFx0b3V0WzFdID0gYTEgKiB2MFxyXG5cdFx0b3V0WzJdID0gYTIgKiB2MVxyXG5cdFx0b3V0WzNdID0gYTMgKiB2MVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDIuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDIucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IG91dCBtYXQyIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvbihvdXQsIHJhZCkge1xyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpXHJcblx0XHR2YXIgYyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGNcclxuXHRcdG91dFsxXSA9IHNcclxuXHRcdG91dFsyXSA9IC1zXHJcblx0XHRvdXRbM10gPSBjXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0Mi5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0Mi5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgbWF0MiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVNjYWxpbmcob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSB2WzBdXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSB2WzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0cihhKSB7XHJcblx0XHRyZXR1cm4gJ21hdDIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSdcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb2IoYSkge1xyXG5cdFx0cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSlcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBMLCBEIGFuZCBVIG1hdHJpY2VzIChMb3dlciB0cmlhbmd1bGFyLCBEaWFnb25hbCBhbmQgVXBwZXIgdHJpYW5ndWxhcikgYnkgZmFjdG9yaXppbmcgdGhlIGlucHV0IG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gTCB0aGUgbG93ZXIgdHJpYW5ndWxhciBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IEQgdGhlIGRpYWdvbmFsIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gVSB0aGUgdXBwZXIgdHJpYW5ndWxhciBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGlucHV0IG1hdHJpeCB0byBmYWN0b3JpemVcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gTERVKEwsIEQsIFUsIGEpIHtcclxuXHRcdExbMl0gPSBhWzJdIC8gYVswXVxyXG5cdFx0VVswXSA9IGFbMF1cclxuXHRcdFVbMV0gPSBhWzFdXHJcblx0XHRVWzNdID0gYVszXSAtIExbMl0gKiBVWzFdXHJcblx0XHRyZXR1cm4gW0wsIEQsIFVdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLSBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQxKGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM11cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM11cclxuXHRcdHJldHVybiAoXHJcblx0XHRcdE1hdGguYWJzKGEwIC0gYjApIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMSAtIGIxKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTIgLSBiMikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXHJcblx0XHRcdE1hdGguYWJzKGEzIC0gYjMpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XHJcblx0ICogQHJldHVybnMge21hdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDIncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7bWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGVcclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQyLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsID0gbXVsdGlwbHlcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIuc3VidHJhY3R9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzdWIgPSBzdWJ0cmFjdFxyXG5cclxuXHR2YXIgbWF0MiA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSxcclxuXHRcdGNsb25lOiBjbG9uZSxcclxuXHRcdGNvcHk6IGNvcHksXHJcblx0XHRpZGVudGl0eTogaWRlbnRpdHksXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzLFxyXG5cdFx0c2V0OiBzZXQsXHJcblx0XHR0cmFuc3Bvc2U6IHRyYW5zcG9zZSxcclxuXHRcdGludmVydDogaW52ZXJ0LFxyXG5cdFx0YWRqb2ludDogYWRqb2ludCxcclxuXHRcdGRldGVybWluYW50OiBkZXRlcm1pbmFudCxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSxcclxuXHRcdHJvdGF0ZTogcm90YXRlLFxyXG5cdFx0c2NhbGU6IHNjYWxlLFxyXG5cdFx0ZnJvbVJvdGF0aW9uOiBmcm9tUm90YXRpb24sXHJcblx0XHRmcm9tU2NhbGluZzogZnJvbVNjYWxpbmcsXHJcblx0XHRzdHI6IHN0cixcclxuXHRcdGZyb2I6IGZyb2IsXHJcblx0XHRMRFU6IExEVSxcclxuXHRcdGFkZDogYWRkLFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0LFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzLFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkMSxcclxuXHRcdG11bHRpcGx5U2NhbGFyOiBtdWx0aXBseVNjYWxhcixcclxuXHRcdG11bHRpcGx5U2NhbGFyQW5kQWRkOiBtdWx0aXBseVNjYWxhckFuZEFkZCxcclxuXHRcdG11bDogbXVsLFxyXG5cdFx0c3ViOiBzdWIsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogMngzIE1hdHJpeFxyXG5cdCAqIEBtb2R1bGUgbWF0MmRcclxuXHQgKlxyXG5cdCAqIEBkZXNjcmlwdGlvblxyXG5cdCAqIEEgbWF0MmQgY29udGFpbnMgc2l4IGVsZW1lbnRzIGRlZmluZWQgYXM6XHJcblx0ICogPHByZT5cclxuXHQgKiBbYSwgYywgdHgsXHJcblx0ICogIGIsIGQsIHR5XVxyXG5cdCAqIDwvcHJlPlxyXG5cdCAqIFRoaXMgaXMgYSBzaG9ydCBmb3JtIGZvciB0aGUgM3gzIG1hdHJpeDpcclxuXHQgKiA8cHJlPlxyXG5cdCAqIFthLCBjLCB0eCxcclxuXHQgKiAgYiwgZCwgdHksXHJcblx0ICogIDAsIDAsIDFdXHJcblx0ICogPC9wcmU+XHJcblx0ICogVGhlIGxhc3Qgcm93IGlzIGlnbm9yZWQgc28gdGhlIGFycmF5IGlzIHNob3J0ZXIgYW5kIG9wZXJhdGlvbnMgYXJlIGZhc3Rlci5cclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQxKCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDYpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0XHRvdXRbNF0gPSAwXHJcblx0XHRcdG91dFs1XSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgbWF0MmQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIGNsb25lXHJcblx0ICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDEoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDYpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyZCB0byBhbm90aGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29weSQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gYVs0XVxyXG5cdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBtYXQyZCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQxKG91dCkge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBuZXcgbWF0MmQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYSBDb21wb25lbnQgQSAoaW5kZXggMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBDb21wb25lbnQgQiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYyBDb21wb25lbnQgQyAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gZCBDb21wb25lbnQgRCAoaW5kZXggMylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdHggQ29tcG9uZW50IFRYIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0eSBDb21wb25lbnQgVFkgKGluZGV4IDUpXHJcblx0ICogQHJldHVybnMge21hdDJkfSBBIG5ldyBtYXQyZFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDEoYSwgYiwgYywgZCwgdHgsIHR5KSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNilcclxuXHRcdG91dFswXSA9IGFcclxuXHRcdG91dFsxXSA9IGJcclxuXHRcdG91dFsyXSA9IGNcclxuXHRcdG91dFszXSA9IGRcclxuXHRcdG91dFs0XSA9IHR4XHJcblx0XHRvdXRbNV0gPSB0eVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQyZCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYSBDb21wb25lbnQgQSAoaW5kZXggMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBDb21wb25lbnQgQiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYyBDb21wb25lbnQgQyAoaW5kZXggMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gZCBDb21wb25lbnQgRCAoaW5kZXggMylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdHggQ29tcG9uZW50IFRYIChpbmRleCA0KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0eSBDb21wb25lbnQgVFkgKGluZGV4IDUpXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0JDEob3V0LCBhLCBiLCBjLCBkLCB0eCwgdHkpIHtcclxuXHRcdG91dFswXSA9IGFcclxuXHRcdG91dFsxXSA9IGJcclxuXHRcdG91dFsyXSA9IGNcclxuXHRcdG91dFszXSA9IGRcclxuXHRcdG91dFs0XSA9IHR4XHJcblx0XHRvdXRbNV0gPSB0eVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBJbnZlcnRzIGEgbWF0MmRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQkMShvdXQsIGEpIHtcclxuXHRcdHZhciBhYSA9IGFbMF0sXHJcblx0XHRcdGFiID0gYVsxXSxcclxuXHRcdFx0YWMgPSBhWzJdLFxyXG5cdFx0XHRhZCA9IGFbM11cclxuXHRcdHZhciBhdHggPSBhWzRdLFxyXG5cdFx0XHRhdHkgPSBhWzVdXHJcblx0XHR2YXIgZGV0ID0gYWEgKiBhZCAtIGFiICogYWNcclxuXHJcblx0XHRpZiAoIWRldCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cclxuXHRcdGRldCA9IDEuMCAvIGRldFxyXG5cdFx0b3V0WzBdID0gYWQgKiBkZXRcclxuXHRcdG91dFsxXSA9IC1hYiAqIGRldFxyXG5cdFx0b3V0WzJdID0gLWFjICogZGV0XHJcblx0XHRvdXRbM10gPSBhYSAqIGRldFxyXG5cdFx0b3V0WzRdID0gKGFjICogYXR5IC0gYWQgKiBhdHgpICogZGV0XHJcblx0XHRvdXRbNV0gPSAoYWIgKiBhdHggLSBhYSAqIGF0eSkgKiBkZXRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGV0ZXJtaW5hbnQkMShhKSB7XHJcblx0XHRyZXR1cm4gYVswXSAqIGFbM10gLSBhWzFdICogYVsyXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBtYXQyZCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQxKG91dCwgYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV1cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM10sXHJcblx0XHRcdGI0ID0gYls0XSxcclxuXHRcdFx0YjUgPSBiWzVdXHJcblx0XHRvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMVxyXG5cdFx0b3V0WzFdID0gYTEgKiBiMCArIGEzICogYjFcclxuXHRcdG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzXHJcblx0XHRvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiM1xyXG5cdFx0b3V0WzRdID0gYTAgKiBiNCArIGEyICogYjUgKyBhNFxyXG5cdFx0b3V0WzVdID0gYTEgKiBiNCArIGEzICogYjUgKyBhNVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgbWF0MmQgYnkgdGhlIGdpdmVuIGFuZ2xlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGUkMShvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV1cclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBhMCAqIGMgKyBhMiAqIHNcclxuXHRcdG91dFsxXSA9IGExICogYyArIGEzICogc1xyXG5cdFx0b3V0WzJdID0gYTAgKiAtcyArIGEyICogY1xyXG5cdFx0b3V0WzNdID0gYTEgKiAtcyArIGEzICogY1xyXG5cdFx0b3V0WzRdID0gYTRcclxuXHRcdG91dFs1XSA9IGE1XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQxKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXSxcclxuXHRcdFx0YTQgPSBhWzRdLFxyXG5cdFx0XHRhNSA9IGFbNV1cclxuXHRcdHZhciB2MCA9IHZbMF0sXHJcblx0XHRcdHYxID0gdlsxXVxyXG5cdFx0b3V0WzBdID0gYTAgKiB2MFxyXG5cdFx0b3V0WzFdID0gYTEgKiB2MFxyXG5cdFx0b3V0WzJdID0gYTIgKiB2MVxyXG5cdFx0b3V0WzNdID0gYTMgKiB2MVxyXG5cdFx0b3V0WzRdID0gYTRcclxuXHRcdG91dFs1XSA9IGE1XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zbGF0ZXMgdGhlIG1hdDJkIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHRyYW5zbGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdXHJcblx0XHR2YXIgdjAgPSB2WzBdLFxyXG5cdFx0XHR2MSA9IHZbMV1cclxuXHRcdG91dFswXSA9IGEwXHJcblx0XHRvdXRbMV0gPSBhMVxyXG5cdFx0b3V0WzJdID0gYTJcclxuXHRcdG91dFszXSA9IGEzXHJcblx0XHRvdXRbNF0gPSBhMCAqIHYwICsgYTIgKiB2MSArIGE0XHJcblx0XHRvdXRbNV0gPSBhMSAqIHYwICsgYTMgKiB2MSArIGE1XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0MmQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDJkLnJvdGF0ZShkZXN0LCBkZXN0LCByYWQpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IG1hdDJkIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb24kMShvdXQsIHJhZCkge1xyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQpLFxyXG5cdFx0XHRjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gY1xyXG5cdFx0b3V0WzFdID0gc1xyXG5cdFx0b3V0WzJdID0gLXNcclxuXHRcdG91dFszXSA9IGNcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQyZC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0MmQuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCBtYXQyZCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21TY2FsaW5nJDEob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSB2WzBdXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSB2WzFdXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDJkLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQyZC50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCBtYXQyZCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24ob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRvdXRbNF0gPSB2WzBdXHJcblx0XHRvdXRbNV0gPSB2WzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDEoYSkge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0J21hdDJkKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcpJ1xyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0MmRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9iJDEoYSkge1xyXG5cdFx0cmV0dXJuIE1hdGguc3FydChcclxuXHRcdFx0TWF0aC5wb3coYVswXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzJdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVszXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzVdLCAyKSArXHJcblx0XHRcdFx0MVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQyZCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0MmR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkMShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDEob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdIC0gYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSAtIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gLSBiWzVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQyZH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyJDEob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRvdXRbM10gPSBhWzNdICogYlxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIGJcclxuXHRcdG91dFs1XSA9IGFbNV0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDJkJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge21hdDJkfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQkMShvdXQsIGEsIGIsIHNjYWxlKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXSAqIHNjYWxlXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XSAqIHNjYWxlXHJcblx0XHRvdXRbNV0gPSBhWzVdICsgYls1XSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0MmR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDJkfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkMShhLCBiKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRhWzBdID09PSBiWzBdICYmXHJcblx0XHRcdGFbMV0gPT09IGJbMV0gJiZcclxuXHRcdFx0YVsyXSA9PT0gYlsyXSAmJlxyXG5cdFx0XHRhWzNdID09PSBiWzNdICYmXHJcblx0XHRcdGFbNF0gPT09IGJbNF0gJiZcclxuXHRcdFx0YVs1XSA9PT0gYls1XVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQyZH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQyKGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdLFxyXG5cdFx0XHRiNCA9IGJbNF0sXHJcblx0XHRcdGI1ID0gYls1XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE0IC0gYjQpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNSAtIGI1KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQyZC5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQxID0gbXVsdGlwbHkkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0MmQuc3VidHJhY3R9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzdWIkMSA9IHN1YnRyYWN0JDFcclxuXHJcblx0dmFyIG1hdDJkID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDEsXHJcblx0XHRjbG9uZTogY2xvbmUkMSxcclxuXHRcdGNvcHk6IGNvcHkkMSxcclxuXHRcdGlkZW50aXR5OiBpZGVudGl0eSQxLFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQxLFxyXG5cdFx0c2V0OiBzZXQkMSxcclxuXHRcdGludmVydDogaW52ZXJ0JDEsXHJcblx0XHRkZXRlcm1pbmFudDogZGV0ZXJtaW5hbnQkMSxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQxLFxyXG5cdFx0cm90YXRlOiByb3RhdGUkMSxcclxuXHRcdHNjYWxlOiBzY2FsZSQxLFxyXG5cdFx0dHJhbnNsYXRlOiB0cmFuc2xhdGUsXHJcblx0XHRmcm9tUm90YXRpb246IGZyb21Sb3RhdGlvbiQxLFxyXG5cdFx0ZnJvbVNjYWxpbmc6IGZyb21TY2FsaW5nJDEsXHJcblx0XHRmcm9tVHJhbnNsYXRpb246IGZyb21UcmFuc2xhdGlvbixcclxuXHRcdHN0cjogc3RyJDEsXHJcblx0XHRmcm9iOiBmcm9iJDEsXHJcblx0XHRhZGQ6IGFkZCQxLFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0JDEsXHJcblx0XHRtdWx0aXBseVNjYWxhcjogbXVsdGlwbHlTY2FsYXIkMSxcclxuXHRcdG11bHRpcGx5U2NhbGFyQW5kQWRkOiBtdWx0aXBseVNjYWxhckFuZEFkZCQxLFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDEsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQyLFxyXG5cdFx0bXVsOiBtdWwkMSxcclxuXHRcdHN1Yjogc3ViJDEsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogM3gzIE1hdHJpeFxyXG5cdCAqIEBtb2R1bGUgbWF0M1xyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZSQyKCkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDkpXHJcblxyXG5cdFx0aWYgKEFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0XHRvdXRbM10gPSAwXHJcblx0XHRcdG91dFs1XSA9IDBcclxuXHRcdFx0b3V0WzZdID0gMFxyXG5cdFx0XHRvdXRbN10gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzRdID0gMVxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3BpZXMgdGhlIHVwcGVyLWxlZnQgM3gzIHZhbHVlcyBpbnRvIHRoZSBnaXZlbiBtYXQzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyAzeDMgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhICAgdGhlIHNvdXJjZSA0eDQgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tTWF0NChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdG91dFszXSA9IGFbNF1cclxuXHRcdG91dFs0XSA9IGFbNV1cclxuXHRcdG91dFs1XSA9IGFbNl1cclxuXHRcdG91dFs2XSA9IGFbOF1cclxuXHRcdG91dFs3XSA9IGFbOV1cclxuXHRcdG91dFs4XSA9IGFbMTBdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDIoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDkpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDIob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIG5ldyBtYXQzIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXHJcblx0ICogQHJldHVybnMge21hdDN9IEEgbmV3IG1hdDNcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyQyKG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg5KVxyXG5cdFx0b3V0WzBdID0gbTAwXHJcblx0XHRvdXRbMV0gPSBtMDFcclxuXHRcdG91dFsyXSA9IG0wMlxyXG5cdFx0b3V0WzNdID0gbTEwXHJcblx0XHRvdXRbNF0gPSBtMTFcclxuXHRcdG91dFs1XSA9IG0xMlxyXG5cdFx0b3V0WzZdID0gbTIwXHJcblx0XHRvdXRbN10gPSBtMjFcclxuXHRcdG91dFs4XSA9IG0yMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkMihvdXQsIG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcclxuXHRcdG91dFswXSA9IG0wMFxyXG5cdFx0b3V0WzFdID0gbTAxXHJcblx0XHRvdXRbMl0gPSBtMDJcclxuXHRcdG91dFszXSA9IG0xMFxyXG5cdFx0b3V0WzRdID0gbTExXHJcblx0XHRvdXRbNV0gPSBtMTJcclxuXHRcdG91dFs2XSA9IG0yMFxyXG5cdFx0b3V0WzddID0gbTIxXHJcblx0XHRvdXRbOF0gPSBtMjJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkkMihvdXQpIHtcclxuXHRcdG91dFswXSA9IDFcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDFcclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNwb3NlJDEob3V0LCBhKSB7XHJcblx0XHQvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXHJcblx0XHRpZiAob3V0ID09PSBhKSB7XHJcblx0XHRcdHZhciBhMDEgPSBhWzFdLFxyXG5cdFx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdFx0YTEyID0gYVs1XVxyXG5cdFx0XHRvdXRbMV0gPSBhWzNdXHJcblx0XHRcdG91dFsyXSA9IGFbNl1cclxuXHRcdFx0b3V0WzNdID0gYTAxXHJcblx0XHRcdG91dFs1XSA9IGFbN11cclxuXHRcdFx0b3V0WzZdID0gYTAyXHJcblx0XHRcdG91dFs3XSA9IGExMlxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0XHRvdXRbMV0gPSBhWzNdXHJcblx0XHRcdG91dFsyXSA9IGFbNl1cclxuXHRcdFx0b3V0WzNdID0gYVsxXVxyXG5cdFx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRcdG91dFs1XSA9IGFbN11cclxuXHRcdFx0b3V0WzZdID0gYVsyXVxyXG5cdFx0XHRvdXRbN10gPSBhWzVdXHJcblx0XHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEludmVydHMgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJ0JDIob3V0LCBhKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXVxyXG5cdFx0dmFyIGExMCA9IGFbM10sXHJcblx0XHRcdGExMSA9IGFbNF0sXHJcblx0XHRcdGExMiA9IGFbNV1cclxuXHRcdHZhciBhMjAgPSBhWzZdLFxyXG5cdFx0XHRhMjEgPSBhWzddLFxyXG5cdFx0XHRhMjIgPSBhWzhdXHJcblx0XHR2YXIgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxXHJcblx0XHR2YXIgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMFxyXG5cdFx0dmFyIGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMCAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblxyXG5cdFx0dmFyIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMVxyXG5cclxuXHRcdGlmICghZGV0KSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0ZGV0ID0gMS4wIC8gZGV0XHJcblx0XHRvdXRbMF0gPSBiMDEgKiBkZXRcclxuXHRcdG91dFsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldFxyXG5cdFx0b3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXRcclxuXHRcdG91dFszXSA9IGIxMSAqIGRldFxyXG5cdFx0b3V0WzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXRcclxuXHRcdG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldFxyXG5cdFx0b3V0WzZdID0gYjIxICogZGV0XHJcblx0XHRvdXRbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXRcclxuXHRcdG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0M1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkam9pbnQkMShvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTEwID0gYVszXSxcclxuXHRcdFx0YTExID0gYVs0XSxcclxuXHRcdFx0YTEyID0gYVs1XVxyXG5cdFx0dmFyIGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF1cclxuXHRcdG91dFswXSA9IGExMSAqIGEyMiAtIGExMiAqIGEyMVxyXG5cdFx0b3V0WzFdID0gYTAyICogYTIxIC0gYTAxICogYTIyXHJcblx0XHRvdXRbMl0gPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTFcclxuXHRcdG91dFszXSA9IGExMiAqIGEyMCAtIGExMCAqIGEyMlxyXG5cdFx0b3V0WzRdID0gYTAwICogYTIyIC0gYTAyICogYTIwXHJcblx0XHRvdXRbNV0gPSBhMDIgKiBhMTAgLSBhMDAgKiBhMTJcclxuXHRcdG91dFs2XSA9IGExMCAqIGEyMSAtIGExMSAqIGEyMFxyXG5cdFx0b3V0WzddID0gYTAxICogYTIwIC0gYTAwICogYTIxXHJcblx0XHRvdXRbOF0gPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRldGVybWluYW50JDIoYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl1cclxuXHRcdHZhciBhMTAgPSBhWzNdLFxyXG5cdFx0XHRhMTEgPSBhWzRdLFxyXG5cdFx0XHRhMTIgPSBhWzVdXHJcblx0XHR2YXIgYTIwID0gYVs2XSxcclxuXHRcdFx0YTIxID0gYVs3XSxcclxuXHRcdFx0YTIyID0gYVs4XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0YTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBtYXQzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkMihvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTEwID0gYVszXSxcclxuXHRcdFx0YTExID0gYVs0XSxcclxuXHRcdFx0YTEyID0gYVs1XVxyXG5cdFx0dmFyIGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF1cclxuXHRcdHZhciBiMDAgPSBiWzBdLFxyXG5cdFx0XHRiMDEgPSBiWzFdLFxyXG5cdFx0XHRiMDIgPSBiWzJdXHJcblx0XHR2YXIgYjEwID0gYlszXSxcclxuXHRcdFx0YjExID0gYls0XSxcclxuXHRcdFx0YjEyID0gYls1XVxyXG5cdFx0dmFyIGIyMCA9IGJbNl0sXHJcblx0XHRcdGIyMSA9IGJbN10sXHJcblx0XHRcdGIyMiA9IGJbOF1cclxuXHRcdG91dFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMFxyXG5cdFx0b3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxXHJcblx0XHRvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjJcclxuXHRcdG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMFxyXG5cdFx0b3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxXHJcblx0XHRvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjJcclxuXHRcdG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMFxyXG5cdFx0b3V0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxXHJcblx0XHRvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNsYXRlIGEgbWF0MyBieSB0aGUgZ2l2ZW4gdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2xhdGUkMShvdXQsIGEsIHYpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMTAgPSBhWzNdLFxyXG5cdFx0XHRhMTEgPSBhWzRdLFxyXG5cdFx0XHRhMTIgPSBhWzVdLFxyXG5cdFx0XHRhMjAgPSBhWzZdLFxyXG5cdFx0XHRhMjEgPSBhWzddLFxyXG5cdFx0XHRhMjIgPSBhWzhdLFxyXG5cdFx0XHR4ID0gdlswXSxcclxuXHRcdFx0eSA9IHZbMV1cclxuXHRcdG91dFswXSA9IGEwMFxyXG5cdFx0b3V0WzFdID0gYTAxXHJcblx0XHRvdXRbMl0gPSBhMDJcclxuXHRcdG91dFszXSA9IGExMFxyXG5cdFx0b3V0WzRdID0gYTExXHJcblx0XHRvdXRbNV0gPSBhMTJcclxuXHRcdG91dFs2XSA9IHggKiBhMDAgKyB5ICogYTEwICsgYTIwXHJcblx0XHRvdXRbN10gPSB4ICogYTAxICsgeSAqIGExMSArIGEyMVxyXG5cdFx0b3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGUkMihvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGExMCA9IGFbM10sXHJcblx0XHRcdGExMSA9IGFbNF0sXHJcblx0XHRcdGExMiA9IGFbNV0sXHJcblx0XHRcdGEyMCA9IGFbNl0sXHJcblx0XHRcdGEyMSA9IGFbN10sXHJcblx0XHRcdGEyMiA9IGFbOF0sXHJcblx0XHRcdHMgPSBNYXRoLnNpbihyYWQpLFxyXG5cdFx0XHRjID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTBcclxuXHRcdG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExXHJcblx0XHRvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMlxyXG5cdFx0b3V0WzNdID0gYyAqIGExMCAtIHMgKiBhMDBcclxuXHRcdG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxXHJcblx0XHRvdXRbNV0gPSBjICogYTEyIC0gcyAqIGEwMlxyXG5cdFx0b3V0WzZdID0gYTIwXHJcblx0XHRvdXRbN10gPSBhMjFcclxuXHRcdG91dFs4XSA9IGEyMlxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTY2FsZXMgdGhlIG1hdDMgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICoqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQyKG91dCwgYSwgdikge1xyXG5cdFx0dmFyIHggPSB2WzBdLFxyXG5cdFx0XHR5ID0gdlsxXVxyXG5cdFx0b3V0WzBdID0geCAqIGFbMF1cclxuXHRcdG91dFsxXSA9IHggKiBhWzFdXHJcblx0XHRvdXRbMl0gPSB4ICogYVsyXVxyXG5cdFx0b3V0WzNdID0geSAqIGFbM11cclxuXHRcdG91dFs0XSA9IHkgKiBhWzRdXHJcblx0XHRvdXRbNV0gPSB5ICogYVs1XVxyXG5cdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cclxuXHQgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuXHQgKlxyXG5cdCAqICAgICBtYXQzLmlkZW50aXR5KGRlc3QpO1xyXG5cdCAqICAgICBtYXQzLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbiQxKG91dCwgdikge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMVxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gdlswXVxyXG5cdFx0b3V0WzddID0gdlsxXVxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDMucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvbiQyKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBjXHJcblx0XHRvdXRbMV0gPSBzXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAtc1xyXG5cdFx0b3V0WzRdID0gY1xyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDMuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IHYgU2NhbGluZyB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21TY2FsaW5nJDIob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSB2WzBdXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSB2WzFdXHJcblx0XHRvdXRbNV0gPSAwXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcGllcyB0aGUgdmFsdWVzIGZyb20gYSBtYXQyZCBpbnRvIGEgbWF0M1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gY29weVxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKiovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21NYXQyZChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IGFbMl1cclxuXHRcdG91dFs0XSA9IGFbM11cclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdG91dFs2XSA9IGFbNF1cclxuXHRcdG91dFs3XSA9IGFbNV1cclxuXHRcdG91dFs4XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyBhIDN4MyBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcclxuXHRcdHZhciB4ID0gcVswXSxcclxuXHRcdFx0eSA9IHFbMV0sXHJcblx0XHRcdHogPSBxWzJdLFxyXG5cdFx0XHR3ID0gcVszXVxyXG5cdFx0dmFyIHgyID0geCArIHhcclxuXHRcdHZhciB5MiA9IHkgKyB5XHJcblx0XHR2YXIgejIgPSB6ICsgelxyXG5cdFx0dmFyIHh4ID0geCAqIHgyXHJcblx0XHR2YXIgeXggPSB5ICogeDJcclxuXHRcdHZhciB5eSA9IHkgKiB5MlxyXG5cdFx0dmFyIHp4ID0geiAqIHgyXHJcblx0XHR2YXIgenkgPSB6ICogeTJcclxuXHRcdHZhciB6eiA9IHogKiB6MlxyXG5cdFx0dmFyIHd4ID0gdyAqIHgyXHJcblx0XHR2YXIgd3kgPSB3ICogeTJcclxuXHRcdHZhciB3eiA9IHcgKiB6MlxyXG5cdFx0b3V0WzBdID0gMSAtIHl5IC0genpcclxuXHRcdG91dFszXSA9IHl4IC0gd3pcclxuXHRcdG91dFs2XSA9IHp4ICsgd3lcclxuXHRcdG91dFsxXSA9IHl4ICsgd3pcclxuXHRcdG91dFs0XSA9IDEgLSB4eCAtIHp6XHJcblx0XHRvdXRbN10gPSB6eSAtIHd4XHJcblx0XHRvdXRbMl0gPSB6eCAtIHd5XHJcblx0XHRvdXRbNV0gPSB6eSArIHd4XHJcblx0XHRvdXRbOF0gPSAxIC0geHggLSB5eVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIGEgM3gzIG5vcm1hbCBtYXRyaXggKHRyYW5zcG9zZSBpbnZlcnNlKSBmcm9tIHRoZSA0eDQgbWF0cml4XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIE1hdDQgdG8gZGVyaXZlIHRoZSBub3JtYWwgbWF0cml4IGZyb21cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbm9ybWFsRnJvbU1hdDQob3V0LCBhKSB7XHJcblx0XHR2YXIgYTAwID0gYVswXSxcclxuXHRcdFx0YTAxID0gYVsxXSxcclxuXHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0YTAzID0gYVszXVxyXG5cdFx0dmFyIGExMCA9IGFbNF0sXHJcblx0XHRcdGExMSA9IGFbNV0sXHJcblx0XHRcdGExMiA9IGFbNl0sXHJcblx0XHRcdGExMyA9IGFbN11cclxuXHRcdHZhciBhMjAgPSBhWzhdLFxyXG5cdFx0XHRhMjEgPSBhWzldLFxyXG5cdFx0XHRhMjIgPSBhWzEwXSxcclxuXHRcdFx0YTIzID0gYVsxMV1cclxuXHRcdHZhciBhMzAgPSBhWzEyXSxcclxuXHRcdFx0YTMxID0gYVsxM10sXHJcblx0XHRcdGEzMiA9IGFbMTRdLFxyXG5cdFx0XHRhMzMgPSBhWzE1XVxyXG5cdFx0dmFyIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMFxyXG5cdFx0dmFyIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMFxyXG5cdFx0dmFyIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMFxyXG5cdFx0dmFyIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMVxyXG5cdFx0dmFyIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMVxyXG5cdFx0dmFyIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMlxyXG5cdFx0dmFyIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMFxyXG5cdFx0dmFyIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMFxyXG5cdFx0dmFyIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMFxyXG5cdFx0dmFyIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMVxyXG5cdFx0dmFyIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMVxyXG5cdFx0dmFyIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMiAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XHJcblxyXG5cdFx0dmFyIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNlxyXG5cclxuXHRcdGlmICghZGV0KSB7XHJcblx0XHRcdHJldHVybiBudWxsXHJcblx0XHR9XHJcblxyXG5cdFx0ZGV0ID0gMS4wIC8gZGV0XHJcblx0XHRvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldFxyXG5cdFx0b3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXRcclxuXHRcdG91dFsyXSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0XHJcblx0XHRvdXRbM10gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldFxyXG5cdFx0b3V0WzRdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXRcclxuXHRcdG91dFs1XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0XHJcblx0XHRvdXRbNl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldFxyXG5cdFx0b3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXRcclxuXHRcdG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIDJEIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB5b3VyIGdsIGNvbnRleHRcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBnbCBjb250ZXh0XHJcblx0ICogQHJldHVybnMge21hdDN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBwcm9qZWN0aW9uKG91dCwgd2lkdGgsIGhlaWdodCkge1xyXG5cdFx0b3V0WzBdID0gMiAvIHdpZHRoXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAtMiAvIGhlaWdodFxyXG5cdFx0b3V0WzVdID0gMFxyXG5cdFx0b3V0WzZdID0gLTFcclxuXHRcdG91dFs3XSA9IDFcclxuXHRcdG91dFs4XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDIoYSkge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0J21hdDMoJyArXHJcblx0XHRcdGFbMF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzJdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbM10gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs0XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzVdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs3XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzhdICtcclxuXHRcdFx0JyknXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9iJDIoYSkge1xyXG5cdFx0cmV0dXJuIE1hdGguc3FydChcclxuXHRcdFx0TWF0aC5wb3coYVswXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzJdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVszXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzVdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs2XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbN10sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzhdLCAyKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRkJDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdICsgYls2XVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN11cclxuXHRcdG91dFs4XSA9IGFbOF0gKyBiWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdIC0gYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSAtIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gLSBiWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdIC0gYls2XVxyXG5cdFx0b3V0WzddID0gYVs3XSAtIGJbN11cclxuXHRcdG91dFs4XSA9IGFbOF0gLSBiWzhdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyJDIob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRvdXRbM10gPSBhWzNdICogYlxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIGJcclxuXHRcdG91dFs1XSA9IGFbNV0gKiBiXHJcblx0XHRvdXRbNl0gPSBhWzZdICogYlxyXG5cdFx0b3V0WzddID0gYVs3XSAqIGJcclxuXHRcdG91dFs4XSA9IGFbOF0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDMncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7bWF0M30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkJDIob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF0gKiBzY2FsZVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV0gKiBzY2FsZVxyXG5cdFx0b3V0WzZdID0gYVs2XSArIGJbNl0gKiBzY2FsZVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN10gKiBzY2FsZVxyXG5cdFx0b3V0WzhdID0gYVs4XSArIGJbOF0gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDN9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQyKGEsIGIpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdGFbMF0gPT09IGJbMF0gJiZcclxuXHRcdFx0YVsxXSA9PT0gYlsxXSAmJlxyXG5cdFx0XHRhWzJdID09PSBiWzJdICYmXHJcblx0XHRcdGFbM10gPT09IGJbM10gJiZcclxuXHRcdFx0YVs0XSA9PT0gYls0XSAmJlxyXG5cdFx0XHRhWzVdID09PSBiWzVdICYmXHJcblx0XHRcdGFbNl0gPT09IGJbNl0gJiZcclxuXHRcdFx0YVs3XSA9PT0gYls3XSAmJlxyXG5cdFx0XHRhWzhdID09PSBiWzhdXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxyXG5cdCAqIEBwYXJhbSB7bWF0M30gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQzKGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdLFxyXG5cdFx0XHRhMyA9IGFbM10sXHJcblx0XHRcdGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdLFxyXG5cdFx0XHRhNiA9IGFbNl0sXHJcblx0XHRcdGE3ID0gYVs3XSxcclxuXHRcdFx0YTggPSBhWzhdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXSxcclxuXHRcdFx0YjMgPSBiWzNdLFxyXG5cdFx0XHRiNCA9IGJbNF0sXHJcblx0XHRcdGI1ID0gYls1XSxcclxuXHRcdFx0YjYgPSBiWzZdLFxyXG5cdFx0XHRiNyA9IGJbN10sXHJcblx0XHRcdGI4ID0gYls4XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE0IC0gYjQpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNSAtIGI1KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTYgLSBiNikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXHJcblx0XHRcdE1hdGguYWJzKGE3IC0gYjcpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhOCAtIGI4KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDIgPSBtdWx0aXBseSQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBtYXQzLnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViJDIgPSBzdWJ0cmFjdCQyXHJcblxyXG5cdHZhciBtYXQzID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDIsXHJcblx0XHRmcm9tTWF0NDogZnJvbU1hdDQsXHJcblx0XHRjbG9uZTogY2xvbmUkMixcclxuXHRcdGNvcHk6IGNvcHkkMixcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkMixcclxuXHRcdHNldDogc2V0JDIsXHJcblx0XHRpZGVudGl0eTogaWRlbnRpdHkkMixcclxuXHRcdHRyYW5zcG9zZTogdHJhbnNwb3NlJDEsXHJcblx0XHRpbnZlcnQ6IGludmVydCQyLFxyXG5cdFx0YWRqb2ludDogYWRqb2ludCQxLFxyXG5cdFx0ZGV0ZXJtaW5hbnQ6IGRldGVybWluYW50JDIsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkMixcclxuXHRcdHRyYW5zbGF0ZTogdHJhbnNsYXRlJDEsXHJcblx0XHRyb3RhdGU6IHJvdGF0ZSQyLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDIsXHJcblx0XHRmcm9tVHJhbnNsYXRpb246IGZyb21UcmFuc2xhdGlvbiQxLFxyXG5cdFx0ZnJvbVJvdGF0aW9uOiBmcm9tUm90YXRpb24kMixcclxuXHRcdGZyb21TY2FsaW5nOiBmcm9tU2NhbGluZyQyLFxyXG5cdFx0ZnJvbU1hdDJkOiBmcm9tTWF0MmQsXHJcblx0XHRmcm9tUXVhdDogZnJvbVF1YXQsXHJcblx0XHRub3JtYWxGcm9tTWF0NDogbm9ybWFsRnJvbU1hdDQsXHJcblx0XHRwcm9qZWN0aW9uOiBwcm9qZWN0aW9uLFxyXG5cdFx0c3RyOiBzdHIkMixcclxuXHRcdGZyb2I6IGZyb2IkMixcclxuXHRcdGFkZDogYWRkJDIsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkMixcclxuXHRcdG11bHRpcGx5U2NhbGFyOiBtdWx0aXBseVNjYWxhciQyLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXJBbmRBZGQ6IG11bHRpcGx5U2NhbGFyQW5kQWRkJDIsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkMixcclxuXHRcdGVxdWFsczogZXF1YWxzJDMsXHJcblx0XHRtdWw6IG11bCQyLFxyXG5cdFx0c3ViOiBzdWIkMixcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiA0eDQgTWF0cml4PGJyPkZvcm1hdDogY29sdW1uLW1ham9yLCB3aGVuIHR5cGVkIG91dCBpdCBsb29rcyBsaWtlIHJvdy1tYWpvcjxicj5UaGUgbWF0cmljZXMgYXJlIGJlaW5nIHBvc3QgbXVsdGlwbGllZC5cclxuXHQgKiBAbW9kdWxlIG1hdDRcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkMygpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgxNilcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzFdID0gMFxyXG5cdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdG91dFszXSA9IDBcclxuXHRcdFx0b3V0WzRdID0gMFxyXG5cdFx0XHRvdXRbNl0gPSAwXHJcblx0XHRcdG91dFs3XSA9IDBcclxuXHRcdFx0b3V0WzhdID0gMFxyXG5cdFx0XHRvdXRbOV0gPSAwXHJcblx0XHRcdG91dFsxMV0gPSAwXHJcblx0XHRcdG91dFsxMl0gPSAwXHJcblx0XHRcdG91dFsxM10gPSAwXHJcblx0XHRcdG91dFsxNF0gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzVdID0gMVxyXG5cdFx0b3V0WzEwXSA9IDFcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgbWF0NCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDMoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDE2KVxyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gYVs0XVxyXG5cdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0b3V0WzldID0gYVs5XVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdXHJcblx0XHRvdXRbMTFdID0gYVsxMV1cclxuXHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdXHJcblx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29weSQzKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0b3V0WzNdID0gYVszXVxyXG5cdFx0b3V0WzRdID0gYVs0XVxyXG5cdFx0b3V0WzVdID0gYVs1XVxyXG5cdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0b3V0WzddID0gYVs3XVxyXG5cdFx0b3V0WzhdID0gYVs4XVxyXG5cdFx0b3V0WzldID0gYVs5XVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdXHJcblx0XHRvdXRbMTFdID0gYVsxMV1cclxuXHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdXHJcblx0XHRvdXRbMTRdID0gYVsxNF1cclxuXHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBuZXcgbWF0NCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDMgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA1KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA4KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggOSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjMgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTEpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMCBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAxMilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzIgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTQpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMyBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxNSlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gQSBuZXcgbWF0NFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDMoXHJcblx0XHRtMDAsXHJcblx0XHRtMDEsXHJcblx0XHRtMDIsXHJcblx0XHRtMDMsXHJcblx0XHRtMTAsXHJcblx0XHRtMTEsXHJcblx0XHRtMTIsXHJcblx0XHRtMTMsXHJcblx0XHRtMjAsXHJcblx0XHRtMjEsXHJcblx0XHRtMjIsXHJcblx0XHRtMjMsXHJcblx0XHRtMzAsXHJcblx0XHRtMzEsXHJcblx0XHRtMzIsXHJcblx0XHRtMzNcclxuXHQpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgxNilcclxuXHRcdG91dFswXSA9IG0wMFxyXG5cdFx0b3V0WzFdID0gbTAxXHJcblx0XHRvdXRbMl0gPSBtMDJcclxuXHRcdG91dFszXSA9IG0wM1xyXG5cdFx0b3V0WzRdID0gbTEwXHJcblx0XHRvdXRbNV0gPSBtMTFcclxuXHRcdG91dFs2XSA9IG0xMlxyXG5cdFx0b3V0WzddID0gbTEzXHJcblx0XHRvdXRbOF0gPSBtMjBcclxuXHRcdG91dFs5XSA9IG0yMVxyXG5cdFx0b3V0WzEwXSA9IG0yMlxyXG5cdFx0b3V0WzExXSA9IG0yM1xyXG5cdFx0b3V0WzEyXSA9IG0zMFxyXG5cdFx0b3V0WzEzXSA9IG0zMVxyXG5cdFx0b3V0WzE0XSA9IG0zMlxyXG5cdFx0b3V0WzE1XSA9IG0zM1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQ0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0wMyBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAzKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA2KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMTMgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggNylcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA5KVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTApXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMwIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDAgcG9zaXRpb24gKGluZGV4IDEyKVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBtMzEgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMTMpXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbTMzIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDMgcG9zaXRpb24gKGluZGV4IDE1KVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0JDMoXHJcblx0XHRvdXQsXHJcblx0XHRtMDAsXHJcblx0XHRtMDEsXHJcblx0XHRtMDIsXHJcblx0XHRtMDMsXHJcblx0XHRtMTAsXHJcblx0XHRtMTEsXHJcblx0XHRtMTIsXHJcblx0XHRtMTMsXHJcblx0XHRtMjAsXHJcblx0XHRtMjEsXHJcblx0XHRtMjIsXHJcblx0XHRtMjMsXHJcblx0XHRtMzAsXHJcblx0XHRtMzEsXHJcblx0XHRtMzIsXHJcblx0XHRtMzNcclxuXHQpIHtcclxuXHRcdG91dFswXSA9IG0wMFxyXG5cdFx0b3V0WzFdID0gbTAxXHJcblx0XHRvdXRbMl0gPSBtMDJcclxuXHRcdG91dFszXSA9IG0wM1xyXG5cdFx0b3V0WzRdID0gbTEwXHJcblx0XHRvdXRbNV0gPSBtMTFcclxuXHRcdG91dFs2XSA9IG0xMlxyXG5cdFx0b3V0WzddID0gbTEzXHJcblx0XHRvdXRbOF0gPSBtMjBcclxuXHRcdG91dFs5XSA9IG0yMVxyXG5cdFx0b3V0WzEwXSA9IG0yMlxyXG5cdFx0b3V0WzExXSA9IG0yM1xyXG5cdFx0b3V0WzEyXSA9IG0zMFxyXG5cdFx0b3V0WzEzXSA9IG0zMVxyXG5cdFx0b3V0WzE0XSA9IG0zMlxyXG5cdFx0b3V0WzE1XSA9IG0zM1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpZGVudGl0eSQzKG91dCkge1xyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gMVxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzEwXSA9IDFcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc3Bvc2UkMihvdXQsIGEpIHtcclxuXHRcdC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcclxuXHRcdGlmIChvdXQgPT09IGEpIHtcclxuXHRcdFx0dmFyIGEwMSA9IGFbMV0sXHJcblx0XHRcdFx0YTAyID0gYVsyXSxcclxuXHRcdFx0XHRhMDMgPSBhWzNdXHJcblx0XHRcdHZhciBhMTIgPSBhWzZdLFxyXG5cdFx0XHRcdGExMyA9IGFbN11cclxuXHRcdFx0dmFyIGEyMyA9IGFbMTFdXHJcblx0XHRcdG91dFsxXSA9IGFbNF1cclxuXHRcdFx0b3V0WzJdID0gYVs4XVxyXG5cdFx0XHRvdXRbM10gPSBhWzEyXVxyXG5cdFx0XHRvdXRbNF0gPSBhMDFcclxuXHRcdFx0b3V0WzZdID0gYVs5XVxyXG5cdFx0XHRvdXRbN10gPSBhWzEzXVxyXG5cdFx0XHRvdXRbOF0gPSBhMDJcclxuXHRcdFx0b3V0WzldID0gYTEyXHJcblx0XHRcdG91dFsxMV0gPSBhWzE0XVxyXG5cdFx0XHRvdXRbMTJdID0gYTAzXHJcblx0XHRcdG91dFsxM10gPSBhMTNcclxuXHRcdFx0b3V0WzE0XSA9IGEyM1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0XHRvdXRbMV0gPSBhWzRdXHJcblx0XHRcdG91dFsyXSA9IGFbOF1cclxuXHRcdFx0b3V0WzNdID0gYVsxMl1cclxuXHRcdFx0b3V0WzRdID0gYVsxXVxyXG5cdFx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRcdG91dFs2XSA9IGFbOV1cclxuXHRcdFx0b3V0WzddID0gYVsxM11cclxuXHRcdFx0b3V0WzhdID0gYVsyXVxyXG5cdFx0XHRvdXRbOV0gPSBhWzZdXHJcblx0XHRcdG91dFsxMF0gPSBhWzEwXVxyXG5cdFx0XHRvdXRbMTFdID0gYVsxNF1cclxuXHRcdFx0b3V0WzEyXSA9IGFbM11cclxuXHRcdFx0b3V0WzEzXSA9IGFbN11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTFdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogSW52ZXJ0cyBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnZlcnQkMyhvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XSxcclxuXHRcdFx0YTExID0gYVs1XSxcclxuXHRcdFx0YTEyID0gYVs2XSxcclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF0sXHJcblx0XHRcdGEyMSA9IGFbOV0sXHJcblx0XHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0dmFyIGEzMCA9IGFbMTJdLFxyXG5cdFx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdFx0YTMyID0gYVsxNF0sXHJcblx0XHRcdGEzMyA9IGFbMTVdXHJcblx0XHR2YXIgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwXHJcblx0XHR2YXIgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwXHJcblx0XHR2YXIgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwXHJcblx0XHR2YXIgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExXHJcblx0XHR2YXIgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExXHJcblx0XHR2YXIgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyXHJcblx0XHR2YXIgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwXHJcblx0XHR2YXIgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwXHJcblx0XHR2YXIgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwXHJcblx0XHR2YXIgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxXHJcblx0XHR2YXIgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxXHJcblx0XHR2YXIgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcclxuXHJcblx0XHR2YXIgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2XHJcblxyXG5cdFx0aWYgKCFkZXQpIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRkZXQgPSAxLjAgLyBkZXRcclxuXHRcdG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0XHJcblx0XHRvdXRbMV0gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldFxyXG5cdFx0b3V0WzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXRcclxuXHRcdG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0XHJcblx0XHRvdXRbNF0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldFxyXG5cdFx0b3V0WzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXRcclxuXHRcdG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0XHJcblx0XHRvdXRbN10gPSAoYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxKSAqIGRldFxyXG5cdFx0b3V0WzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXRcclxuXHRcdG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0XHJcblx0XHRvdXRbMTBdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXRcclxuXHRcdG91dFsxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldFxyXG5cdFx0b3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0XHJcblx0XHRvdXRbMTNdID0gKGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNikgKiBkZXRcclxuXHRcdG91dFsxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldFxyXG5cdFx0b3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0NFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFkam9pbnQkMihvdXQsIGEpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XSxcclxuXHRcdFx0YTExID0gYVs1XSxcclxuXHRcdFx0YTEyID0gYVs2XSxcclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF0sXHJcblx0XHRcdGEyMSA9IGFbOV0sXHJcblx0XHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0dmFyIGEzMCA9IGFbMTJdLFxyXG5cdFx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdFx0YTMyID0gYVsxNF0sXHJcblx0XHRcdGEzMyA9IGFbMTVdXHJcblx0XHRvdXRbMF0gPVxyXG5cdFx0XHRhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMilcclxuXHRcdG91dFsxXSA9IC0oXHJcblx0XHRcdGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC1cclxuXHRcdFx0YTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgK1xyXG5cdFx0XHRhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzJdID1cclxuXHRcdFx0YTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpXHJcblx0XHRvdXRbM10gPSAtKFxyXG5cdFx0XHRhMDEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtXHJcblx0XHRcdGExMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICtcclxuXHRcdFx0YTIxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMilcclxuXHRcdClcclxuXHRcdG91dFs0XSA9IC0oXHJcblx0XHRcdGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC1cclxuXHRcdFx0YTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgK1xyXG5cdFx0XHRhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKVxyXG5cdFx0KVxyXG5cdFx0b3V0WzVdID1cclxuXHRcdFx0YTAwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpXHJcblx0XHRvdXRbNl0gPSAtKFxyXG5cdFx0XHRhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtXHJcblx0XHRcdGExMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICtcclxuXHRcdFx0YTMwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMilcclxuXHRcdClcclxuXHRcdG91dFs3XSA9XHJcblx0XHRcdGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKVxyXG5cdFx0b3V0WzhdID1cclxuXHRcdFx0YTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpXHJcblx0XHRvdXRbOV0gPSAtKFxyXG5cdFx0XHRhMDAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtXHJcblx0XHRcdGEyMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICtcclxuXHRcdFx0YTMwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSlcclxuXHRcdClcclxuXHRcdG91dFsxMF0gPVxyXG5cdFx0XHRhMDAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSlcclxuXHRcdG91dFsxMV0gPSAtKFxyXG5cdFx0XHRhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtXHJcblx0XHRcdGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICtcclxuXHRcdFx0YTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSlcclxuXHRcdClcclxuXHRcdG91dFsxMl0gPSAtKFxyXG5cdFx0XHRhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtXHJcblx0XHRcdGEyMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpICtcclxuXHRcdFx0YTMwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSlcclxuXHRcdClcclxuXHRcdG91dFsxM10gPVxyXG5cdFx0XHRhMDAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSlcclxuXHRcdG91dFsxNF0gPSAtKFxyXG5cdFx0XHRhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtXHJcblx0XHRcdGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICtcclxuXHRcdFx0YTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSlcclxuXHRcdClcclxuXHRcdG91dFsxNV0gPVxyXG5cdFx0XHRhMDAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGRldGVybWluYW50JDMoYSkge1xyXG5cdFx0dmFyIGEwMCA9IGFbMF0sXHJcblx0XHRcdGEwMSA9IGFbMV0sXHJcblx0XHRcdGEwMiA9IGFbMl0sXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdHZhciBhMTAgPSBhWzRdLFxyXG5cdFx0XHRhMTEgPSBhWzVdLFxyXG5cdFx0XHRhMTIgPSBhWzZdLFxyXG5cdFx0XHRhMTMgPSBhWzddXHJcblx0XHR2YXIgYTIwID0gYVs4XSxcclxuXHRcdFx0YTIxID0gYVs5XSxcclxuXHRcdFx0YTIyID0gYVsxMF0sXHJcblx0XHRcdGEyMyA9IGFbMTFdXHJcblx0XHR2YXIgYTMwID0gYVsxMl0sXHJcblx0XHRcdGEzMSA9IGFbMTNdLFxyXG5cdFx0XHRhMzIgPSBhWzE0XSxcclxuXHRcdFx0YTMzID0gYVsxNV1cclxuXHRcdHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTBcclxuXHRcdHZhciBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTBcclxuXHRcdHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTBcclxuXHRcdHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTFcclxuXHRcdHZhciBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTFcclxuXHRcdHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTJcclxuXHRcdHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzBcclxuXHRcdHZhciBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzBcclxuXHRcdHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzBcclxuXHRcdHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzFcclxuXHRcdHZhciBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzFcclxuXHRcdHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxyXG5cclxuXHRcdHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDZcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gbWF0NHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkMyhvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBhMDAgPSBhWzBdLFxyXG5cdFx0XHRhMDEgPSBhWzFdLFxyXG5cdFx0XHRhMDIgPSBhWzJdLFxyXG5cdFx0XHRhMDMgPSBhWzNdXHJcblx0XHR2YXIgYTEwID0gYVs0XSxcclxuXHRcdFx0YTExID0gYVs1XSxcclxuXHRcdFx0YTEyID0gYVs2XSxcclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF0sXHJcblx0XHRcdGEyMSA9IGFbOV0sXHJcblx0XHRcdGEyMiA9IGFbMTBdLFxyXG5cdFx0XHRhMjMgPSBhWzExXVxyXG5cdFx0dmFyIGEzMCA9IGFbMTJdLFxyXG5cdFx0XHRhMzEgPSBhWzEzXSxcclxuXHRcdFx0YTMyID0gYVsxNF0sXHJcblx0XHRcdGEzMyA9IGFbMTVdIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxyXG5cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM11cclxuXHRcdG91dFswXSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwXHJcblx0XHRvdXRbMV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMVxyXG5cdFx0b3V0WzJdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzJcclxuXHRcdG91dFszXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzXHJcblx0XHRiMCA9IGJbNF1cclxuXHRcdGIxID0gYls1XVxyXG5cdFx0YjIgPSBiWzZdXHJcblx0XHRiMyA9IGJbN11cclxuXHRcdG91dFs0XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwXHJcblx0XHRvdXRbNV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMVxyXG5cdFx0b3V0WzZdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzJcclxuXHRcdG91dFs3XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzXHJcblx0XHRiMCA9IGJbOF1cclxuXHRcdGIxID0gYls5XVxyXG5cdFx0YjIgPSBiWzEwXVxyXG5cdFx0YjMgPSBiWzExXVxyXG5cdFx0b3V0WzhdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzBcclxuXHRcdG91dFs5XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxXHJcblx0XHRvdXRbMTBdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzJcclxuXHRcdG91dFsxMV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzM1xyXG5cdFx0YjAgPSBiWzEyXVxyXG5cdFx0YjEgPSBiWzEzXVxyXG5cdFx0YjIgPSBiWzE0XVxyXG5cdFx0YjMgPSBiWzE1XVxyXG5cdFx0b3V0WzEyXSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwXHJcblx0XHRvdXRbMTNdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzFcclxuXHRcdG91dFsxNF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMlxyXG5cdFx0b3V0WzE1XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNsYXRlJDIob3V0LCBhLCB2KSB7XHJcblx0XHR2YXIgeCA9IHZbMF0sXHJcblx0XHRcdHkgPSB2WzFdLFxyXG5cdFx0XHR6ID0gdlsyXVxyXG5cdFx0dmFyIGEwMCwgYTAxLCBhMDIsIGEwM1xyXG5cdFx0dmFyIGExMCwgYTExLCBhMTIsIGExM1xyXG5cdFx0dmFyIGEyMCwgYTIxLCBhMjIsIGEyM1xyXG5cclxuXHRcdGlmIChhID09PSBvdXQpIHtcclxuXHRcdFx0b3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdXHJcblx0XHRcdG91dFsxM10gPSBhWzFdICogeCArIGFbNV0gKiB5ICsgYVs5XSAqIHogKyBhWzEzXVxyXG5cdFx0XHRvdXRbMTRdID0gYVsyXSAqIHggKyBhWzZdICogeSArIGFbMTBdICogeiArIGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGEwMCA9IGFbMF1cclxuXHRcdFx0YTAxID0gYVsxXVxyXG5cdFx0XHRhMDIgPSBhWzJdXHJcblx0XHRcdGEwMyA9IGFbM11cclxuXHRcdFx0YTEwID0gYVs0XVxyXG5cdFx0XHRhMTEgPSBhWzVdXHJcblx0XHRcdGExMiA9IGFbNl1cclxuXHRcdFx0YTEzID0gYVs3XVxyXG5cdFx0XHRhMjAgPSBhWzhdXHJcblx0XHRcdGEyMSA9IGFbOV1cclxuXHRcdFx0YTIyID0gYVsxMF1cclxuXHRcdFx0YTIzID0gYVsxMV1cclxuXHRcdFx0b3V0WzBdID0gYTAwXHJcblx0XHRcdG91dFsxXSA9IGEwMVxyXG5cdFx0XHRvdXRbMl0gPSBhMDJcclxuXHRcdFx0b3V0WzNdID0gYTAzXHJcblx0XHRcdG91dFs0XSA9IGExMFxyXG5cdFx0XHRvdXRbNV0gPSBhMTFcclxuXHRcdFx0b3V0WzZdID0gYTEyXHJcblx0XHRcdG91dFs3XSA9IGExM1xyXG5cdFx0XHRvdXRbOF0gPSBhMjBcclxuXHRcdFx0b3V0WzldID0gYTIxXHJcblx0XHRcdG91dFsxMF0gPSBhMjJcclxuXHRcdFx0b3V0WzExXSA9IGEyM1xyXG5cdFx0XHRvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl1cclxuXHRcdFx0b3V0WzEzXSA9IGEwMSAqIHggKyBhMTEgKiB5ICsgYTIxICogeiArIGFbMTNdXHJcblx0XHRcdG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XVxyXG5cdFx0XHRvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyB0aGUgbWF0NCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMyBub3QgdXNpbmcgdmVjdG9yaXphdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdiB0aGUgdmVjMyB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUkMyhvdXQsIGEsIHYpIHtcclxuXHRcdHZhciB4ID0gdlswXSxcclxuXHRcdFx0eSA9IHZbMV0sXHJcblx0XHRcdHogPSB2WzJdXHJcblx0XHRvdXRbMF0gPSBhWzBdICogeFxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIHhcclxuXHRcdG91dFsyXSA9IGFbMl0gKiB4XHJcblx0XHRvdXRbM10gPSBhWzNdICogeFxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIHlcclxuXHRcdG91dFs1XSA9IGFbNV0gKiB5XHJcblx0XHRvdXRbNl0gPSBhWzZdICogeVxyXG5cdFx0b3V0WzddID0gYVs3XSAqIHlcclxuXHRcdG91dFs4XSA9IGFbOF0gKiB6XHJcblx0XHRvdXRbOV0gPSBhWzldICogelxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdICogelxyXG5cdFx0b3V0WzExXSA9IGFbMTFdICogelxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdXHJcblx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdG91dFsxNF0gPSBhWzE0XVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlJDMob3V0LCBhLCByYWQsIGF4aXMpIHtcclxuXHRcdHZhciB4ID0gYXhpc1swXSxcclxuXHRcdFx0eSA9IGF4aXNbMV0sXHJcblx0XHRcdHogPSBheGlzWzJdXHJcblx0XHR2YXIgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHRcdHZhciBzLCBjLCB0XHJcblx0XHR2YXIgYTAwLCBhMDEsIGEwMiwgYTAzXHJcblx0XHR2YXIgYTEwLCBhMTEsIGExMiwgYTEzXHJcblx0XHR2YXIgYTIwLCBhMjEsIGEyMiwgYTIzXHJcblx0XHR2YXIgYjAwLCBiMDEsIGIwMlxyXG5cdFx0dmFyIGIxMCwgYjExLCBiMTJcclxuXHRcdHZhciBiMjAsIGIyMSwgYjIyXHJcblxyXG5cdFx0aWYgKGxlbiA8IEVQU0lMT04pIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRsZW4gPSAxIC8gbGVuXHJcblx0XHR4ICo9IGxlblxyXG5cdFx0eSAqPSBsZW5cclxuXHRcdHogKj0gbGVuXHJcblx0XHRzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0YyA9IE1hdGguY29zKHJhZClcclxuXHRcdHQgPSAxIC0gY1xyXG5cdFx0YTAwID0gYVswXVxyXG5cdFx0YTAxID0gYVsxXVxyXG5cdFx0YTAyID0gYVsyXVxyXG5cdFx0YTAzID0gYVszXVxyXG5cdFx0YTEwID0gYVs0XVxyXG5cdFx0YTExID0gYVs1XVxyXG5cdFx0YTEyID0gYVs2XVxyXG5cdFx0YTEzID0gYVs3XVxyXG5cdFx0YTIwID0gYVs4XVxyXG5cdFx0YTIxID0gYVs5XVxyXG5cdFx0YTIyID0gYVsxMF1cclxuXHRcdGEyMyA9IGFbMTFdIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxyXG5cclxuXHRcdGIwMCA9IHggKiB4ICogdCArIGNcclxuXHRcdGIwMSA9IHkgKiB4ICogdCArIHogKiBzXHJcblx0XHRiMDIgPSB6ICogeCAqIHQgLSB5ICogc1xyXG5cdFx0YjEwID0geCAqIHkgKiB0IC0geiAqIHNcclxuXHRcdGIxMSA9IHkgKiB5ICogdCArIGNcclxuXHRcdGIxMiA9IHogKiB5ICogdCArIHggKiBzXHJcblx0XHRiMjAgPSB4ICogeiAqIHQgKyB5ICogc1xyXG5cdFx0YjIxID0geSAqIHogKiB0IC0geCAqIHNcclxuXHRcdGIyMiA9IHogKiB6ICogdCArIGMgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDJcclxuXHRcdG91dFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMlxyXG5cdFx0b3V0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyXHJcblx0XHRvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDJcclxuXHRcdG91dFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMlxyXG5cdFx0b3V0WzVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyXHJcblx0XHRvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTJcclxuXHRcdG91dFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMlxyXG5cdFx0b3V0WzhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyXHJcblx0XHRvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjJcclxuXHRcdG91dFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjJcclxuXHRcdG91dFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjJcclxuXHJcblx0XHRpZiAoYSAhPT0gb3V0KSB7XHJcblx0XHRcdC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XHJcblx0XHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHR2YXIgYTEwID0gYVs0XVxyXG5cdFx0dmFyIGExMSA9IGFbNV1cclxuXHRcdHZhciBhMTIgPSBhWzZdXHJcblx0XHR2YXIgYTEzID0gYVs3XVxyXG5cdFx0dmFyIGEyMCA9IGFbOF1cclxuXHRcdHZhciBhMjEgPSBhWzldXHJcblx0XHR2YXIgYTIyID0gYVsxMF1cclxuXHRcdHZhciBhMjMgPSBhWzExXVxyXG5cclxuXHRcdGlmIChhICE9PSBvdXQpIHtcclxuXHRcdFx0Ly8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xyXG5cdFx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdFx0b3V0WzJdID0gYVsyXVxyXG5cdFx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzRdID0gYTEwICogYyArIGEyMCAqIHNcclxuXHRcdG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzXHJcblx0XHRvdXRbNl0gPSBhMTIgKiBjICsgYTIyICogc1xyXG5cdFx0b3V0WzddID0gYTEzICogYyArIGEyMyAqIHNcclxuXHRcdG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzXHJcblx0XHRvdXRbOV0gPSBhMjEgKiBjIC0gYTExICogc1xyXG5cdFx0b3V0WzEwXSA9IGEyMiAqIGMgLSBhMTIgKiBzXHJcblx0XHRvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHR2YXIgYTAwID0gYVswXVxyXG5cdFx0dmFyIGEwMSA9IGFbMV1cclxuXHRcdHZhciBhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTAzID0gYVszXVxyXG5cdFx0dmFyIGEyMCA9IGFbOF1cclxuXHRcdHZhciBhMjEgPSBhWzldXHJcblx0XHR2YXIgYTIyID0gYVsxMF1cclxuXHRcdHZhciBhMjMgPSBhWzExXVxyXG5cclxuXHRcdGlmIChhICE9PSBvdXQpIHtcclxuXHRcdFx0Ly8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xyXG5cdFx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRcdG91dFs1XSA9IGFbNV1cclxuXHRcdFx0b3V0WzZdID0gYVs2XVxyXG5cdFx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHNcclxuXHRcdG91dFsxXSA9IGEwMSAqIGMgLSBhMjEgKiBzXHJcblx0XHRvdXRbMl0gPSBhMDIgKiBjIC0gYTIyICogc1xyXG5cdFx0b3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHNcclxuXHRcdG91dFs4XSA9IGEwMCAqIHMgKyBhMjAgKiBjXHJcblx0XHRvdXRbOV0gPSBhMDEgKiBzICsgYTIxICogY1xyXG5cdFx0b3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjXHJcblx0XHRvdXRbMTFdID0gYTAzICogcyArIGEyMyAqIGNcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGMgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHR2YXIgYTAwID0gYVswXVxyXG5cdFx0dmFyIGEwMSA9IGFbMV1cclxuXHRcdHZhciBhMDIgPSBhWzJdXHJcblx0XHR2YXIgYTAzID0gYVszXVxyXG5cdFx0dmFyIGExMCA9IGFbNF1cclxuXHRcdHZhciBhMTEgPSBhWzVdXHJcblx0XHR2YXIgYTEyID0gYVs2XVxyXG5cdFx0dmFyIGExMyA9IGFbN11cclxuXHJcblx0XHRpZiAoYSAhPT0gb3V0KSB7XHJcblx0XHRcdC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XHJcblx0XHRcdG91dFs4XSA9IGFbOF1cclxuXHRcdFx0b3V0WzldID0gYVs5XVxyXG5cdFx0XHRvdXRbMTBdID0gYVsxMF1cclxuXHRcdFx0b3V0WzExXSA9IGFbMTFdXHJcblx0XHRcdG91dFsxMl0gPSBhWzEyXVxyXG5cdFx0XHRvdXRbMTNdID0gYVsxM11cclxuXHRcdFx0b3V0WzE0XSA9IGFbMTRdXHJcblx0XHRcdG91dFsxNV0gPSBhWzE1XVxyXG5cdFx0fSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gYTAwICogYyArIGExMCAqIHNcclxuXHRcdG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzXHJcblx0XHRvdXRbMl0gPSBhMDIgKiBjICsgYTEyICogc1xyXG5cdFx0b3V0WzNdID0gYTAzICogYyArIGExMyAqIHNcclxuXHRcdG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzXHJcblx0XHRvdXRbNV0gPSBhMTEgKiBjIC0gYTAxICogc1xyXG5cdFx0b3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHNcclxuXHRcdG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uJDIob3V0LCB2KSB7XHJcblx0XHRvdXRbMF0gPSAxXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAxXHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAwXHJcblx0XHRvdXRbMTBdID0gMVxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSB2WzBdXHJcblx0XHRvdXRbMTNdID0gdlsxXVxyXG5cdFx0b3V0WzE0XSA9IHZbMl1cclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdiBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVNjYWxpbmckMyhvdXQsIHYpIHtcclxuXHRcdG91dFswXSA9IHZbMF1cclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IHZbMV1cclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDBcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSB2WzJdXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGUgYXJvdW5kIGEgZ2l2ZW4gYXhpc1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQucm90YXRlKGRlc3QsIGRlc3QsIHJhZCwgYXhpcyk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uJDMob3V0LCByYWQsIGF4aXMpIHtcclxuXHRcdHZhciB4ID0gYXhpc1swXSxcclxuXHRcdFx0eSA9IGF4aXNbMV0sXHJcblx0XHRcdHogPSBheGlzWzJdXHJcblx0XHR2YXIgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHRcdHZhciBzLCBjLCB0XHJcblxyXG5cdFx0aWYgKGxlbiA8IEVQU0lMT04pIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRsZW4gPSAxIC8gbGVuXHJcblx0XHR4ICo9IGxlblxyXG5cdFx0eSAqPSBsZW5cclxuXHRcdHogKj0gbGVuXHJcblx0XHRzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0YyA9IE1hdGguY29zKHJhZClcclxuXHRcdHQgPSAxIC0gYyAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG5cclxuXHRcdG91dFswXSA9IHggKiB4ICogdCArIGNcclxuXHRcdG91dFsxXSA9IHkgKiB4ICogdCArIHogKiBzXHJcblx0XHRvdXRbMl0gPSB6ICogeCAqIHQgLSB5ICogc1xyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0geCAqIHkgKiB0IC0geiAqIHNcclxuXHRcdG91dFs1XSA9IHkgKiB5ICogdCArIGNcclxuXHRcdG91dFs2XSA9IHogKiB5ICogdCArIHggKiBzXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSB4ICogeiAqIHQgKyB5ICogc1xyXG5cdFx0b3V0WzldID0geSAqIHogKiB0IC0geCAqIHNcclxuXHRcdG91dFsxMF0gPSB6ICogeiAqIHQgKyBjXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQucm90YXRlWChkZXN0LCBkZXN0LCByYWQpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tWFJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gMVxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gY1xyXG5cdFx0b3V0WzZdID0gc1xyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gLXNcclxuXHRcdG91dFsxMF0gPSBjXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQucm90YXRlWShkZXN0LCBkZXN0LCByYWQpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tWVJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gY1xyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gLXNcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDFcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IHNcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSBjXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQucm90YXRlWihkZXN0LCBkZXN0LCByYWQpO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tWlJvdGF0aW9uKG91dCwgcmFkKSB7XHJcblx0XHR2YXIgcyA9IE1hdGguc2luKHJhZClcclxuXHRcdHZhciBjID0gTWF0aC5jb3MocmFkKSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gY1xyXG5cdFx0b3V0WzFdID0gc1xyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gLXNcclxuXHRcdG91dFs1XSA9IGNcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IDBcclxuXHRcdG91dFs5XSA9IDBcclxuXHRcdG91dFsxMF0gPSAxXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IDBcclxuXHRcdG91dFsxM10gPSAwXHJcblx0XHRvdXRbMTRdID0gMFxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuXHQgKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG5cdCAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBxLCB2KSB7XHJcblx0XHQvLyBRdWF0ZXJuaW9uIG1hdGhcclxuXHRcdHZhciB4ID0gcVswXSxcclxuXHRcdFx0eSA9IHFbMV0sXHJcblx0XHRcdHogPSBxWzJdLFxyXG5cdFx0XHR3ID0gcVszXVxyXG5cdFx0dmFyIHgyID0geCArIHhcclxuXHRcdHZhciB5MiA9IHkgKyB5XHJcblx0XHR2YXIgejIgPSB6ICsgelxyXG5cdFx0dmFyIHh4ID0geCAqIHgyXHJcblx0XHR2YXIgeHkgPSB4ICogeTJcclxuXHRcdHZhciB4eiA9IHggKiB6MlxyXG5cdFx0dmFyIHl5ID0geSAqIHkyXHJcblx0XHR2YXIgeXogPSB5ICogejJcclxuXHRcdHZhciB6eiA9IHogKiB6MlxyXG5cdFx0dmFyIHd4ID0gdyAqIHgyXHJcblx0XHR2YXIgd3kgPSB3ICogeTJcclxuXHRcdHZhciB3eiA9IHcgKiB6MlxyXG5cdFx0b3V0WzBdID0gMSAtICh5eSArIHp6KVxyXG5cdFx0b3V0WzFdID0geHkgKyB3elxyXG5cdFx0b3V0WzJdID0geHogLSB3eVxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0geHkgLSB3elxyXG5cdFx0b3V0WzVdID0gMSAtICh4eCArIHp6KVxyXG5cdFx0b3V0WzZdID0geXogKyB3eFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0geHogKyB3eVxyXG5cdFx0b3V0WzldID0geXogLSB3eFxyXG5cdFx0b3V0WzEwXSA9IDEgLSAoeHggKyB5eSlcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gdlswXVxyXG5cdFx0b3V0WzEzXSA9IHZbMV1cclxuXHRcdG91dFsxNF0gPSB2WzJdXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IG1hdDQgZnJvbSBhIGR1YWwgcXVhdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IE1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge21hdDR9IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVF1YXQyKG91dCwgYSkge1xyXG5cdFx0dmFyIHRyYW5zbGF0aW9uID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHRcdHZhciBieCA9IC1hWzBdLFxyXG5cdFx0XHRieSA9IC1hWzFdLFxyXG5cdFx0XHRieiA9IC1hWzJdLFxyXG5cdFx0XHRidyA9IGFbM10sXHJcblx0XHRcdGF4ID0gYVs0XSxcclxuXHRcdFx0YXkgPSBhWzVdLFxyXG5cdFx0XHRheiA9IGFbNl0sXHJcblx0XHRcdGF3ID0gYVs3XVxyXG5cdFx0dmFyIG1hZ25pdHVkZSA9IGJ4ICogYnggKyBieSAqIGJ5ICsgYnogKiBieiArIGJ3ICogYncgLy9Pbmx5IHNjYWxlIGlmIGl0IG1ha2VzIHNlbnNlXHJcblxyXG5cdFx0aWYgKG1hZ25pdHVkZSA+IDApIHtcclxuXHRcdFx0dHJhbnNsYXRpb25bMF0gPSAoKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMikgLyBtYWduaXR1ZGVcclxuXHRcdFx0dHJhbnNsYXRpb25bMV0gPSAoKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMikgLyBtYWduaXR1ZGVcclxuXHRcdFx0dHJhbnNsYXRpb25bMl0gPSAoKGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngpICogMikgLyBtYWduaXR1ZGVcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMlxyXG5cdFx0XHR0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDJcclxuXHRcdFx0dHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyXHJcblx0XHR9XHJcblxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBhLCB0cmFuc2xhdGlvbilcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXHJcblx0ICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcclxuXHQgKiAgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3JcclxuXHQgKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cclxuXHQgKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgdHJhbnNsYXRpb24gY29tcG9uZW50XHJcblx0ICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcclxuXHQgKiBAcmV0dXJuIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24ob3V0LCBtYXQpIHtcclxuXHRcdG91dFswXSA9IG1hdFsxMl1cclxuXHRcdG91dFsxXSA9IG1hdFsxM11cclxuXHRcdG91dFsyXSA9IG1hdFsxNF1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cclxuXHQgKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVcclxuXHQgKiAgd2l0aCBhIG5vcm1hbGl6ZWQgUXVhdGVybmlvbiBwYXJhbXRlciwgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlXHJcblx0ICogIHRoZSBzYW1lIGFzIHRoZSBzY2FsaW5nIHZlY3RvclxyXG5cdCAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxyXG5cdCAqIEBwYXJhbSAge3ZlYzN9IG91dCBWZWN0b3IgdG8gcmVjZWl2ZSBzY2FsaW5nIGZhY3RvciBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG5cdCAqIEByZXR1cm4ge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBnZXRTY2FsaW5nKG91dCwgbWF0KSB7XHJcblx0XHR2YXIgbTExID0gbWF0WzBdXHJcblx0XHR2YXIgbTEyID0gbWF0WzFdXHJcblx0XHR2YXIgbTEzID0gbWF0WzJdXHJcblx0XHR2YXIgbTIxID0gbWF0WzRdXHJcblx0XHR2YXIgbTIyID0gbWF0WzVdXHJcblx0XHR2YXIgbTIzID0gbWF0WzZdXHJcblx0XHR2YXIgbTMxID0gbWF0WzhdXHJcblx0XHR2YXIgbTMyID0gbWF0WzldXHJcblx0XHR2YXIgbTMzID0gbWF0WzEwXVxyXG5cdFx0b3V0WzBdID0gTWF0aC5zcXJ0KG0xMSAqIG0xMSArIG0xMiAqIG0xMiArIG0xMyAqIG0xMylcclxuXHRcdG91dFsxXSA9IE1hdGguc3FydChtMjEgKiBtMjEgKyBtMjIgKiBtMjIgKyBtMjMgKiBtMjMpXHJcblx0XHRvdXRbMl0gPSBNYXRoLnNxcnQobTMxICogbTMxICsgbTMyICogbTMyICsgbTMzICogbTMzKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uYWwgY29tcG9uZW50XHJcblx0ICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXHJcblx0ICogIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLCB0aGUgcmV0dXJuZWQgcXVhdGVybmlvbiB3aWxsIGJlIHRoZVxyXG5cdCAqICBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIG9yaWdpbmFsbHkgc3VwcGxpZWQuXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXHJcblx0ICogQHJldHVybiB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGdldFJvdGF0aW9uKG91dCwgbWF0KSB7XHJcblx0XHQvLyBBbGdvcml0aG0gdGFrZW4gZnJvbSBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9nZW9tZXRyeS9yb3RhdGlvbnMvY29udmVyc2lvbnMvbWF0cml4VG9RdWF0ZXJuaW9uL2luZGV4Lmh0bVxyXG5cdFx0dmFyIHRyYWNlID0gbWF0WzBdICsgbWF0WzVdICsgbWF0WzEwXVxyXG5cdFx0dmFyIFMgPSAwXHJcblxyXG5cdFx0aWYgKHRyYWNlID4gMCkge1xyXG5cdFx0XHRTID0gTWF0aC5zcXJ0KHRyYWNlICsgMS4wKSAqIDJcclxuXHRcdFx0b3V0WzNdID0gMC4yNSAqIFNcclxuXHRcdFx0b3V0WzBdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTXHJcblx0XHRcdG91dFsxXSA9IChtYXRbOF0gLSBtYXRbMl0pIC8gU1xyXG5cdFx0XHRvdXRbMl0gPSAobWF0WzFdIC0gbWF0WzRdKSAvIFNcclxuXHRcdH0gZWxzZSBpZiAobWF0WzBdID4gbWF0WzVdICYmIG1hdFswXSA+IG1hdFsxMF0pIHtcclxuXHRcdFx0UyA9IE1hdGguc3FydCgxLjAgKyBtYXRbMF0gLSBtYXRbNV0gLSBtYXRbMTBdKSAqIDJcclxuXHRcdFx0b3V0WzNdID0gKG1hdFs2XSAtIG1hdFs5XSkgLyBTXHJcblx0XHRcdG91dFswXSA9IDAuMjUgKiBTXHJcblx0XHRcdG91dFsxXSA9IChtYXRbMV0gKyBtYXRbNF0pIC8gU1xyXG5cdFx0XHRvdXRbMl0gPSAobWF0WzhdICsgbWF0WzJdKSAvIFNcclxuXHRcdH0gZWxzZSBpZiAobWF0WzVdID4gbWF0WzEwXSkge1xyXG5cdFx0XHRTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFs1XSAtIG1hdFswXSAtIG1hdFsxMF0pICogMlxyXG5cdFx0XHRvdXRbM10gPSAobWF0WzhdIC0gbWF0WzJdKSAvIFNcclxuXHRcdFx0b3V0WzBdID0gKG1hdFsxXSArIG1hdFs0XSkgLyBTXHJcblx0XHRcdG91dFsxXSA9IDAuMjUgKiBTXHJcblx0XHRcdG91dFsyXSA9IChtYXRbNl0gKyBtYXRbOV0pIC8gU1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0UyA9IE1hdGguc3FydCgxLjAgKyBtYXRbMTBdIC0gbWF0WzBdIC0gbWF0WzVdKSAqIDJcclxuXHRcdFx0b3V0WzNdID0gKG1hdFsxXSAtIG1hdFs0XSkgLyBTXHJcblx0XHRcdG91dFswXSA9IChtYXRbOF0gKyBtYXRbMl0pIC8gU1xyXG5cdFx0XHRvdXRbMV0gPSAobWF0WzZdICsgbWF0WzldKSAvIFNcclxuXHRcdFx0b3V0WzJdID0gMC4yNSAqIFNcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlXHJcblx0ICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcblx0ICpcclxuXHQgKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuXHQgKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuXHQgKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xyXG5cdCAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XHJcblx0ICogICAgIG1hdDQuc2NhbGUoZGVzdCwgc2NhbGUpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShvdXQsIHEsIHYsIHMpIHtcclxuXHRcdC8vIFF1YXRlcm5pb24gbWF0aFxyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB4eSA9IHggKiB5MlxyXG5cdFx0dmFyIHh6ID0geCAqIHoyXHJcblx0XHR2YXIgeXkgPSB5ICogeTJcclxuXHRcdHZhciB5eiA9IHkgKiB6MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHR2YXIgc3ggPSBzWzBdXHJcblx0XHR2YXIgc3kgPSBzWzFdXHJcblx0XHR2YXIgc3ogPSBzWzJdXHJcblx0XHRvdXRbMF0gPSAoMSAtICh5eSArIHp6KSkgKiBzeFxyXG5cdFx0b3V0WzFdID0gKHh5ICsgd3opICogc3hcclxuXHRcdG91dFsyXSA9ICh4eiAtIHd5KSAqIHN4XHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAoeHkgLSB3eikgKiBzeVxyXG5cdFx0b3V0WzVdID0gKDEgLSAoeHggKyB6eikpICogc3lcclxuXHRcdG91dFs2XSA9ICh5eiArIHd4KSAqIHN5XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAoeHogKyB3eSkgKiBzelxyXG5cdFx0b3V0WzldID0gKHl6IC0gd3gpICogc3pcclxuXHRcdG91dFsxMF0gPSAoMSAtICh4eCArIHl5KSkgKiBzelxyXG5cdFx0b3V0WzExXSA9IDBcclxuXHRcdG91dFsxMl0gPSB2WzBdXHJcblx0XHRvdXRbMTNdID0gdlsxXVxyXG5cdFx0b3V0WzE0XSA9IHZbMl1cclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlLCByb3RhdGluZyBhbmQgc2NhbGluZyBhcm91bmQgdGhlIGdpdmVuIG9yaWdpblxyXG5cdCAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG5cdCAqXHJcblx0ICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcblx0ICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XHJcblx0ICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG9yaWdpbik7XHJcblx0ICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcclxuXHQgKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xyXG5cdCAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xyXG5cdCAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxyXG5cdCAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBuZWdhdGl2ZU9yaWdpbik7XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gbyBUaGUgb3JpZ2luIHZlY3RvciBhcm91bmQgd2hpY2ggdG8gc2NhbGUgYW5kIHJvdGF0ZVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZU9yaWdpbihvdXQsIHEsIHYsIHMsIG8pIHtcclxuXHRcdC8vIFF1YXRlcm5pb24gbWF0aFxyXG5cdFx0dmFyIHggPSBxWzBdLFxyXG5cdFx0XHR5ID0gcVsxXSxcclxuXHRcdFx0eiA9IHFbMl0sXHJcblx0XHRcdHcgPSBxWzNdXHJcblx0XHR2YXIgeDIgPSB4ICsgeFxyXG5cdFx0dmFyIHkyID0geSArIHlcclxuXHRcdHZhciB6MiA9IHogKyB6XHJcblx0XHR2YXIgeHggPSB4ICogeDJcclxuXHRcdHZhciB4eSA9IHggKiB5MlxyXG5cdFx0dmFyIHh6ID0geCAqIHoyXHJcblx0XHR2YXIgeXkgPSB5ICogeTJcclxuXHRcdHZhciB5eiA9IHkgKiB6MlxyXG5cdFx0dmFyIHp6ID0geiAqIHoyXHJcblx0XHR2YXIgd3ggPSB3ICogeDJcclxuXHRcdHZhciB3eSA9IHcgKiB5MlxyXG5cdFx0dmFyIHd6ID0gdyAqIHoyXHJcblx0XHR2YXIgc3ggPSBzWzBdXHJcblx0XHR2YXIgc3kgPSBzWzFdXHJcblx0XHR2YXIgc3ogPSBzWzJdXHJcblx0XHR2YXIgb3ggPSBvWzBdXHJcblx0XHR2YXIgb3kgPSBvWzFdXHJcblx0XHR2YXIgb3ogPSBvWzJdXHJcblx0XHR2YXIgb3V0MCA9ICgxIC0gKHl5ICsgenopKSAqIHN4XHJcblx0XHR2YXIgb3V0MSA9ICh4eSArIHd6KSAqIHN4XHJcblx0XHR2YXIgb3V0MiA9ICh4eiAtIHd5KSAqIHN4XHJcblx0XHR2YXIgb3V0NCA9ICh4eSAtIHd6KSAqIHN5XHJcblx0XHR2YXIgb3V0NSA9ICgxIC0gKHh4ICsgenopKSAqIHN5XHJcblx0XHR2YXIgb3V0NiA9ICh5eiArIHd4KSAqIHN5XHJcblx0XHR2YXIgb3V0OCA9ICh4eiArIHd5KSAqIHN6XHJcblx0XHR2YXIgb3V0OSA9ICh5eiAtIHd4KSAqIHN6XHJcblx0XHR2YXIgb3V0MTAgPSAoMSAtICh4eCArIHl5KSkgKiBzelxyXG5cdFx0b3V0WzBdID0gb3V0MFxyXG5cdFx0b3V0WzFdID0gb3V0MVxyXG5cdFx0b3V0WzJdID0gb3V0MlxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gb3V0NFxyXG5cdFx0b3V0WzVdID0gb3V0NVxyXG5cdFx0b3V0WzZdID0gb3V0NlxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gb3V0OFxyXG5cdFx0b3V0WzldID0gb3V0OVxyXG5cdFx0b3V0WzEwXSA9IG91dDEwXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IHZbMF0gKyBveCAtIChvdXQwICogb3ggKyBvdXQ0ICogb3kgKyBvdXQ4ICogb3opXHJcblx0XHRvdXRbMTNdID0gdlsxXSArIG95IC0gKG91dDEgKiBveCArIG91dDUgKiBveSArIG91dDkgKiBveilcclxuXHRcdG91dFsxNF0gPSB2WzJdICsgb3ogLSAob3V0MiAqIG94ICsgb3V0NiAqIG95ICsgb3V0MTAgKiBveilcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgYSA0eDQgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVF1YXQkMShvdXQsIHEpIHtcclxuXHRcdHZhciB4ID0gcVswXSxcclxuXHRcdFx0eSA9IHFbMV0sXHJcblx0XHRcdHogPSBxWzJdLFxyXG5cdFx0XHR3ID0gcVszXVxyXG5cdFx0dmFyIHgyID0geCArIHhcclxuXHRcdHZhciB5MiA9IHkgKyB5XHJcblx0XHR2YXIgejIgPSB6ICsgelxyXG5cdFx0dmFyIHh4ID0geCAqIHgyXHJcblx0XHR2YXIgeXggPSB5ICogeDJcclxuXHRcdHZhciB5eSA9IHkgKiB5MlxyXG5cdFx0dmFyIHp4ID0geiAqIHgyXHJcblx0XHR2YXIgenkgPSB6ICogeTJcclxuXHRcdHZhciB6eiA9IHogKiB6MlxyXG5cdFx0dmFyIHd4ID0gdyAqIHgyXHJcblx0XHR2YXIgd3kgPSB3ICogeTJcclxuXHRcdHZhciB3eiA9IHcgKiB6MlxyXG5cdFx0b3V0WzBdID0gMSAtIHl5IC0genpcclxuXHRcdG91dFsxXSA9IHl4ICsgd3pcclxuXHRcdG91dFsyXSA9IHp4IC0gd3lcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IHl4IC0gd3pcclxuXHRcdG91dFs1XSA9IDEgLSB4eCAtIHp6XHJcblx0XHRvdXRbNl0gPSB6eSArIHd4XHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSB6eCArIHd5XHJcblx0XHRvdXRbOV0gPSB6eSAtIHd4XHJcblx0XHRvdXRbMTBdID0gMSAtIHh4IC0geXlcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNF0gPSAwXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSBmcnVzdHVtIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJ1c3R1bShvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XHJcblx0XHR2YXIgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdClcclxuXHRcdHZhciB0YiA9IDEgLyAodG9wIC0gYm90dG9tKVxyXG5cdFx0dmFyIG5mID0gMSAvIChuZWFyIC0gZmFyKVxyXG5cdFx0b3V0WzBdID0gbmVhciAqIDIgKiBybFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gbmVhciAqIDIgKiB0YlxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gKHJpZ2h0ICsgbGVmdCkgKiBybFxyXG5cdFx0b3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YlxyXG5cdFx0b3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mXHJcblx0XHRvdXRbMTFdID0gLTFcclxuXHRcdG91dFsxMl0gPSAwXHJcblx0XHRvdXRbMTNdID0gMFxyXG5cdFx0b3V0WzE0XSA9IGZhciAqIG5lYXIgKiAyICogbmZcclxuXHRcdG91dFsxNV0gPSAwXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kcy5cclxuXHQgKiBQYXNzaW5nIG51bGwvdW5kZWZpbmVkL25vIHZhbHVlIGZvciBmYXIgd2lsbCBnZW5lcmF0ZSBpbmZpbml0ZSBwcm9qZWN0aW9uIG1hdHJpeC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bSwgY2FuIGJlIG51bGwgb3IgSW5maW5pdHlcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHBlcnNwZWN0aXZlKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcclxuXHRcdHZhciBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxyXG5cdFx0XHRuZlxyXG5cdFx0b3V0WzBdID0gZiAvIGFzcGVjdFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0gMFxyXG5cdFx0b3V0WzVdID0gZlxyXG5cdFx0b3V0WzZdID0gMFxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0gMFxyXG5cdFx0b3V0WzldID0gMFxyXG5cdFx0b3V0WzExXSA9IC0xXHJcblx0XHRvdXRbMTJdID0gMFxyXG5cdFx0b3V0WzEzXSA9IDBcclxuXHRcdG91dFsxNV0gPSAwXHJcblxyXG5cdFx0aWYgKGZhciAhPSBudWxsICYmIGZhciAhPT0gSW5maW5pdHkpIHtcclxuXHRcdFx0bmYgPSAxIC8gKG5lYXIgLSBmYXIpXHJcblx0XHRcdG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZlxyXG5cdFx0XHRvdXRbMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZlxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3V0WzEwXSA9IC0xXHJcblx0XHRcdG91dFsxNF0gPSAtMiAqIG5lYXJcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGZpZWxkIG9mIHZpZXcuXHJcblx0ICogVGhpcyBpcyBwcmltYXJpbHkgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHByb2plY3Rpb24gbWF0cmljZXMgdG8gYmUgdXNlZFxyXG5cdCAqIHdpdGggdGhlIHN0aWxsIGV4cGVyaWVtZW50YWwgV2ViVlIgQVBJLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBmb3YgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGZvbGxvd2luZyB2YWx1ZXM6IHVwRGVncmVlcywgZG93bkRlZ3JlZXMsIGxlZnREZWdyZWVzLCByaWdodERlZ3JlZXNcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3KG91dCwgZm92LCBuZWFyLCBmYXIpIHtcclxuXHRcdHZhciB1cFRhbiA9IE1hdGgudGFuKChmb3YudXBEZWdyZWVzICogTWF0aC5QSSkgLyAxODAuMClcclxuXHRcdHZhciBkb3duVGFuID0gTWF0aC50YW4oKGZvdi5kb3duRGVncmVlcyAqIE1hdGguUEkpIC8gMTgwLjApXHJcblx0XHR2YXIgbGVmdFRhbiA9IE1hdGgudGFuKChmb3YubGVmdERlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MC4wKVxyXG5cdFx0dmFyIHJpZ2h0VGFuID0gTWF0aC50YW4oKGZvdi5yaWdodERlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MC4wKVxyXG5cdFx0dmFyIHhTY2FsZSA9IDIuMCAvIChsZWZ0VGFuICsgcmlnaHRUYW4pXHJcblx0XHR2YXIgeVNjYWxlID0gMi4wIC8gKHVwVGFuICsgZG93blRhbilcclxuXHRcdG91dFswXSA9IHhTY2FsZVxyXG5cdFx0b3V0WzFdID0gMC4wXHJcblx0XHRvdXRbMl0gPSAwLjBcclxuXHRcdG91dFszXSA9IDAuMFxyXG5cdFx0b3V0WzRdID0gMC4wXHJcblx0XHRvdXRbNV0gPSB5U2NhbGVcclxuXHRcdG91dFs2XSA9IDAuMFxyXG5cdFx0b3V0WzddID0gMC4wXHJcblx0XHRvdXRbOF0gPSAtKChsZWZ0VGFuIC0gcmlnaHRUYW4pICogeFNjYWxlICogMC41KVxyXG5cdFx0b3V0WzldID0gKHVwVGFuIC0gZG93blRhbikgKiB5U2NhbGUgKiAwLjVcclxuXHRcdG91dFsxMF0gPSBmYXIgLyAobmVhciAtIGZhcilcclxuXHRcdG91dFsxMV0gPSAtMS4wXHJcblx0XHRvdXRbMTJdID0gMC4wXHJcblx0XHRvdXRbMTNdID0gMC4wXHJcblx0XHRvdXRbMTRdID0gKGZhciAqIG5lYXIpIC8gKG5lYXIgLSBmYXIpXHJcblx0XHRvdXRbMTVdID0gMC4wXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIG9ydGhvZ29uYWwgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG9ydGhvKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcclxuXHRcdHZhciBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KVxyXG5cdFx0dmFyIGJ0ID0gMSAvIChib3R0b20gLSB0b3ApXHJcblx0XHR2YXIgbmYgPSAxIC8gKG5lYXIgLSBmYXIpXHJcblx0XHRvdXRbMF0gPSAtMiAqIGxyXHJcblx0XHRvdXRbMV0gPSAwXHJcblx0XHRvdXRbMl0gPSAwXHJcblx0XHRvdXRbM10gPSAwXHJcblx0XHRvdXRbNF0gPSAwXHJcblx0XHRvdXRbNV0gPSAtMiAqIGJ0XHJcblx0XHRvdXRbNl0gPSAwXHJcblx0XHRvdXRbN10gPSAwXHJcblx0XHRvdXRbOF0gPSAwXHJcblx0XHRvdXRbOV0gPSAwXHJcblx0XHRvdXRbMTBdID0gMiAqIG5mXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IChsZWZ0ICsgcmlnaHQpICogbHJcclxuXHRcdG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0XHJcblx0XHRvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmZcclxuXHRcdG91dFsxNV0gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIGxvb2stYXQgbWF0cml4IHdpdGggdGhlIGdpdmVuIGV5ZSBwb3NpdGlvbiwgZm9jYWwgcG9pbnQsIGFuZCB1cCBheGlzLlxyXG5cdCAqIElmIHlvdSB3YW50IGEgbWF0cml4IHRoYXQgYWN0dWFsbHkgbWFrZXMgYW4gb2JqZWN0IGxvb2sgYXQgYW5vdGhlciBvYmplY3QsIHlvdSBzaG91bGQgdXNlIHRhcmdldFRvIGluc3RlYWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbG9va0F0KG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XHJcblx0XHR2YXIgeDAsIHgxLCB4MiwgeTAsIHkxLCB5MiwgejAsIHoxLCB6MiwgbGVuXHJcblx0XHR2YXIgZXlleCA9IGV5ZVswXVxyXG5cdFx0dmFyIGV5ZXkgPSBleWVbMV1cclxuXHRcdHZhciBleWV6ID0gZXllWzJdXHJcblx0XHR2YXIgdXB4ID0gdXBbMF1cclxuXHRcdHZhciB1cHkgPSB1cFsxXVxyXG5cdFx0dmFyIHVweiA9IHVwWzJdXHJcblx0XHR2YXIgY2VudGVyeCA9IGNlbnRlclswXVxyXG5cdFx0dmFyIGNlbnRlcnkgPSBjZW50ZXJbMV1cclxuXHRcdHZhciBjZW50ZXJ6ID0gY2VudGVyWzJdXHJcblxyXG5cdFx0aWYgKFxyXG5cdFx0XHRNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBFUFNJTE9OICYmXHJcblx0XHRcdE1hdGguYWJzKGV5ZXkgLSBjZW50ZXJ5KSA8IEVQU0lMT04gJiZcclxuXHRcdFx0TWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgRVBTSUxPTlxyXG5cdFx0KSB7XHJcblx0XHRcdHJldHVybiBpZGVudGl0eSQzKG91dClcclxuXHRcdH1cclxuXHJcblx0XHR6MCA9IGV5ZXggLSBjZW50ZXJ4XHJcblx0XHR6MSA9IGV5ZXkgLSBjZW50ZXJ5XHJcblx0XHR6MiA9IGV5ZXogLSBjZW50ZXJ6XHJcblx0XHRsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6MilcclxuXHRcdHowICo9IGxlblxyXG5cdFx0ejEgKj0gbGVuXHJcblx0XHR6MiAqPSBsZW5cclxuXHRcdHgwID0gdXB5ICogejIgLSB1cHogKiB6MVxyXG5cdFx0eDEgPSB1cHogKiB6MCAtIHVweCAqIHoyXHJcblx0XHR4MiA9IHVweCAqIHoxIC0gdXB5ICogejBcclxuXHRcdGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpXHJcblxyXG5cdFx0aWYgKCFsZW4pIHtcclxuXHRcdFx0eDAgPSAwXHJcblx0XHRcdHgxID0gMFxyXG5cdFx0XHR4MiA9IDBcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGxlbiA9IDEgLyBsZW5cclxuXHRcdFx0eDAgKj0gbGVuXHJcblx0XHRcdHgxICo9IGxlblxyXG5cdFx0XHR4MiAqPSBsZW5cclxuXHRcdH1cclxuXHJcblx0XHR5MCA9IHoxICogeDIgLSB6MiAqIHgxXHJcblx0XHR5MSA9IHoyICogeDAgLSB6MCAqIHgyXHJcblx0XHR5MiA9IHowICogeDEgLSB6MSAqIHgwXHJcblx0XHRsZW4gPSBNYXRoLnNxcnQoeTAgKiB5MCArIHkxICogeTEgKyB5MiAqIHkyKVxyXG5cclxuXHRcdGlmICghbGVuKSB7XHJcblx0XHRcdHkwID0gMFxyXG5cdFx0XHR5MSA9IDBcclxuXHRcdFx0eTIgPSAwXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRsZW4gPSAxIC8gbGVuXHJcblx0XHRcdHkwICo9IGxlblxyXG5cdFx0XHR5MSAqPSBsZW5cclxuXHRcdFx0eTIgKj0gbGVuXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0geDBcclxuXHRcdG91dFsxXSA9IHkwXHJcblx0XHRvdXRbMl0gPSB6MFxyXG5cdFx0b3V0WzNdID0gMFxyXG5cdFx0b3V0WzRdID0geDFcclxuXHRcdG91dFs1XSA9IHkxXHJcblx0XHRvdXRbNl0gPSB6MVxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0b3V0WzhdID0geDJcclxuXHRcdG91dFs5XSA9IHkyXHJcblx0XHRvdXRbMTBdID0gejJcclxuXHRcdG91dFsxMV0gPSAwXHJcblx0XHRvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopXHJcblx0XHRvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopXHJcblx0XHRvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopXHJcblx0XHRvdXRbMTVdID0gMVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSBtYXRyaXggdGhhdCBtYWtlcyBzb21ldGhpbmcgbG9vayBhdCBzb21ldGhpbmcgZWxzZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0YXJnZXRUbyhvdXQsIGV5ZSwgdGFyZ2V0LCB1cCkge1xyXG5cdFx0dmFyIGV5ZXggPSBleWVbMF0sXHJcblx0XHRcdGV5ZXkgPSBleWVbMV0sXHJcblx0XHRcdGV5ZXogPSBleWVbMl0sXHJcblx0XHRcdHVweCA9IHVwWzBdLFxyXG5cdFx0XHR1cHkgPSB1cFsxXSxcclxuXHRcdFx0dXB6ID0gdXBbMl1cclxuXHRcdHZhciB6MCA9IGV5ZXggLSB0YXJnZXRbMF0sXHJcblx0XHRcdHoxID0gZXlleSAtIHRhcmdldFsxXSxcclxuXHRcdFx0ejIgPSBleWV6IC0gdGFyZ2V0WzJdXHJcblx0XHR2YXIgbGVuID0gejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyXHJcblxyXG5cdFx0aWYgKGxlbiA+IDApIHtcclxuXHRcdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pXHJcblx0XHRcdHowICo9IGxlblxyXG5cdFx0XHR6MSAqPSBsZW5cclxuXHRcdFx0ejIgKj0gbGVuXHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcclxuXHRcdFx0eDEgPSB1cHogKiB6MCAtIHVweCAqIHoyLFxyXG5cdFx0XHR4MiA9IHVweCAqIHoxIC0gdXB5ICogejBcclxuXHRcdGxlbiA9IHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4MlxyXG5cclxuXHRcdGlmIChsZW4gPiAwKSB7XHJcblx0XHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKVxyXG5cdFx0XHR4MCAqPSBsZW5cclxuXHRcdFx0eDEgKj0gbGVuXHJcblx0XHRcdHgyICo9IGxlblxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IHgwXHJcblx0XHRvdXRbMV0gPSB4MVxyXG5cdFx0b3V0WzJdID0geDJcclxuXHRcdG91dFszXSA9IDBcclxuXHRcdG91dFs0XSA9IHoxICogeDIgLSB6MiAqIHgxXHJcblx0XHRvdXRbNV0gPSB6MiAqIHgwIC0gejAgKiB4MlxyXG5cdFx0b3V0WzZdID0gejAgKiB4MSAtIHoxICogeDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdG91dFs4XSA9IHowXHJcblx0XHRvdXRbOV0gPSB6MVxyXG5cdFx0b3V0WzEwXSA9IHoyXHJcblx0XHRvdXRbMTFdID0gMFxyXG5cdFx0b3V0WzEyXSA9IGV5ZXhcclxuXHRcdG91dFsxM10gPSBleWV5XHJcblx0XHRvdXRbMTRdID0gZXllelxyXG5cdFx0b3V0WzE1XSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDMoYSkge1xyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0J21hdDQoJyArXHJcblx0XHRcdGFbMF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzJdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbM10gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs0XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzVdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs3XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzhdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbOV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxMF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxMV0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxMl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxM10gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxNF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxNV0gK1xyXG5cdFx0XHQnKSdcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb2IkMyhhKSB7XHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KFxyXG5cdFx0XHRNYXRoLnBvdyhhWzBdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMl0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzNdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs0XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbNV0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzZdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVs3XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbOF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzldLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxMF0sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzExXSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMTJdLCAyKSArXHJcblx0XHRcdFx0TWF0aC5wb3coYVsxM10sIDIpICtcclxuXHRcdFx0XHRNYXRoLnBvdyhhWzE0XSwgMikgK1xyXG5cdFx0XHRcdE1hdGgucG93KGFbMTVdLCAyKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBtYXQ0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gYWRkJDMob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdICsgYlszXVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF1cclxuXHRcdG91dFs1XSA9IGFbNV0gKyBiWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdICsgYls2XVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN11cclxuXHRcdG91dFs4XSA9IGFbOF0gKyBiWzhdXHJcblx0XHRvdXRbOV0gPSBhWzldICsgYls5XVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdICsgYlsxMF1cclxuXHRcdG91dFsxMV0gPSBhWzExXSArIGJbMTFdXHJcblx0XHRvdXRbMTJdID0gYVsxMl0gKyBiWzEyXVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdICsgYlsxM11cclxuXHRcdG91dFsxNF0gPSBhWzE0XSArIGJbMTRdXHJcblx0XHRvdXRbMTVdID0gYVsxNV0gKyBiWzE1XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge21hdDR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdWJ0cmFjdCQzKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAtIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdIC0gYlsyXVxyXG5cdFx0b3V0WzNdID0gYVszXSAtIGJbM11cclxuXHRcdG91dFs0XSA9IGFbNF0gLSBiWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdIC0gYls1XVxyXG5cdFx0b3V0WzZdID0gYVs2XSAtIGJbNl1cclxuXHRcdG91dFs3XSA9IGFbN10gLSBiWzddXHJcblx0XHRvdXRbOF0gPSBhWzhdIC0gYls4XVxyXG5cdFx0b3V0WzldID0gYVs5XSAtIGJbOV1cclxuXHRcdG91dFsxMF0gPSBhWzEwXSAtIGJbMTBdXHJcblx0XHRvdXRbMTFdID0gYVsxMV0gLSBiWzExXVxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdIC0gYlsxMl1cclxuXHRcdG91dFsxM10gPSBhWzEzXSAtIGJbMTNdXHJcblx0XHRvdXRbMTRdID0gYVsxNF0gLSBiWzE0XVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdIC0gYlsxNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG5cdCAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIkMyhvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRvdXRbNF0gPSBhWzRdICogYlxyXG5cdFx0b3V0WzVdID0gYVs1XSAqIGJcclxuXHRcdG91dFs2XSA9IGFbNl0gKiBiXHJcblx0XHRvdXRbN10gPSBhWzddICogYlxyXG5cdFx0b3V0WzhdID0gYVs4XSAqIGJcclxuXHRcdG91dFs5XSA9IGFbOV0gKiBiXHJcblx0XHRvdXRbMTBdID0gYVsxMF0gKiBiXHJcblx0XHRvdXRbMTFdID0gYVsxMV0gKiBiXHJcblx0XHRvdXRbMTJdID0gYVsxMl0gKiBiXHJcblx0XHRvdXRbMTNdID0gYVsxM10gKiBiXHJcblx0XHRvdXRbMTRdID0gYVsxNF0gKiBiXHJcblx0XHRvdXRbMTVdID0gYVsxNV0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIG1hdDQncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcclxuXHQgKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkJDMob3V0LCBhLCBiLCBzY2FsZSkge1xyXG5cdFx0b3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZVxyXG5cdFx0b3V0WzRdID0gYVs0XSArIGJbNF0gKiBzY2FsZVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV0gKiBzY2FsZVxyXG5cdFx0b3V0WzZdID0gYVs2XSArIGJbNl0gKiBzY2FsZVxyXG5cdFx0b3V0WzddID0gYVs3XSArIGJbN10gKiBzY2FsZVxyXG5cdFx0b3V0WzhdID0gYVs4XSArIGJbOF0gKiBzY2FsZVxyXG5cdFx0b3V0WzldID0gYVs5XSArIGJbOV0gKiBzY2FsZVxyXG5cdFx0b3V0WzEwXSA9IGFbMTBdICsgYlsxMF0gKiBzY2FsZVxyXG5cdFx0b3V0WzExXSA9IGFbMTFdICsgYlsxMV0gKiBzY2FsZVxyXG5cdFx0b3V0WzEyXSA9IGFbMTJdICsgYlsxMl0gKiBzY2FsZVxyXG5cdFx0b3V0WzEzXSA9IGFbMTNdICsgYlsxM10gKiBzY2FsZVxyXG5cdFx0b3V0WzE0XSA9IGFbMTRdICsgYlsxNF0gKiBzY2FsZVxyXG5cdFx0b3V0WzE1XSA9IGFbMTVdICsgYlsxNV0gKiBzY2FsZVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuXHQgKiBAcGFyYW0ge21hdDR9IGIgVGhlIHNlY29uZCBtYXRyaXguXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQzKGEsIGIpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdGFbMF0gPT09IGJbMF0gJiZcclxuXHRcdFx0YVsxXSA9PT0gYlsxXSAmJlxyXG5cdFx0XHRhWzJdID09PSBiWzJdICYmXHJcblx0XHRcdGFbM10gPT09IGJbM10gJiZcclxuXHRcdFx0YVs0XSA9PT0gYls0XSAmJlxyXG5cdFx0XHRhWzVdID09PSBiWzVdICYmXHJcblx0XHRcdGFbNl0gPT09IGJbNl0gJiZcclxuXHRcdFx0YVs3XSA9PT0gYls3XSAmJlxyXG5cdFx0XHRhWzhdID09PSBiWzhdICYmXHJcblx0XHRcdGFbOV0gPT09IGJbOV0gJiZcclxuXHRcdFx0YVsxMF0gPT09IGJbMTBdICYmXHJcblx0XHRcdGFbMTFdID09PSBiWzExXSAmJlxyXG5cdFx0XHRhWzEyXSA9PT0gYlsxMl0gJiZcclxuXHRcdFx0YVsxM10gPT09IGJbMTNdICYmXHJcblx0XHRcdGFbMTRdID09PSBiWzE0XSAmJlxyXG5cdFx0XHRhWzE1XSA9PT0gYlsxNV1cclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcblx0ICogQHBhcmFtIHttYXQ0fSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDQoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIGE0ID0gYVs0XSxcclxuXHRcdFx0YTUgPSBhWzVdLFxyXG5cdFx0XHRhNiA9IGFbNl0sXHJcblx0XHRcdGE3ID0gYVs3XVxyXG5cdFx0dmFyIGE4ID0gYVs4XSxcclxuXHRcdFx0YTkgPSBhWzldLFxyXG5cdFx0XHRhMTAgPSBhWzEwXSxcclxuXHRcdFx0YTExID0gYVsxMV1cclxuXHRcdHZhciBhMTIgPSBhWzEyXSxcclxuXHRcdFx0YTEzID0gYVsxM10sXHJcblx0XHRcdGExNCA9IGFbMTRdLFxyXG5cdFx0XHRhMTUgPSBhWzE1XVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0dmFyIGI0ID0gYls0XSxcclxuXHRcdFx0YjUgPSBiWzVdLFxyXG5cdFx0XHRiNiA9IGJbNl0sXHJcblx0XHRcdGI3ID0gYls3XVxyXG5cdFx0dmFyIGI4ID0gYls4XSxcclxuXHRcdFx0YjkgPSBiWzldLFxyXG5cdFx0XHRiMTAgPSBiWzEwXSxcclxuXHRcdFx0YjExID0gYlsxMV1cclxuXHRcdHZhciBiMTIgPSBiWzEyXSxcclxuXHRcdFx0YjEzID0gYlsxM10sXHJcblx0XHRcdGIxNCA9IGJbMTRdLFxyXG5cdFx0XHRiMTUgPSBiWzE1XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE0IC0gYjQpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNSAtIGI1KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTYgLSBiNikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXHJcblx0XHRcdE1hdGguYWJzKGE3IC0gYjcpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhOCAtIGI4KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTkgLSBiOSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTkpLCBNYXRoLmFicyhiOSkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExMCAtIGIxMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEwKSwgTWF0aC5hYnMoYjEwKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTExIC0gYjExKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTEpLCBNYXRoLmFicyhiMTEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMTIgLSBiMTIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMiksIE1hdGguYWJzKGIxMikpICYmXHJcblx0XHRcdE1hdGguYWJzKGExMyAtIGIxMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEzKSwgTWF0aC5hYnMoYjEzKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTE0IC0gYjE0KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTQpLCBNYXRoLmFicyhiMTQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMTUgLSBiMTUpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExNSksIE1hdGguYWJzKGIxNSkpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQzID0gbXVsdGlwbHkkM1xyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQzID0gc3VidHJhY3QkM1xyXG5cclxuXHR2YXIgbWF0NCA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQzLFxyXG5cdFx0Y2xvbmU6IGNsb25lJDMsXHJcblx0XHRjb3B5OiBjb3B5JDMsXHJcblx0XHRmcm9tVmFsdWVzOiBmcm9tVmFsdWVzJDMsXHJcblx0XHRzZXQ6IHNldCQzLFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5JDMsXHJcblx0XHR0cmFuc3Bvc2U6IHRyYW5zcG9zZSQyLFxyXG5cdFx0aW52ZXJ0OiBpbnZlcnQkMyxcclxuXHRcdGFkam9pbnQ6IGFkam9pbnQkMixcclxuXHRcdGRldGVybWluYW50OiBkZXRlcm1pbmFudCQzLFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDMsXHJcblx0XHR0cmFuc2xhdGU6IHRyYW5zbGF0ZSQyLFxyXG5cdFx0c2NhbGU6IHNjYWxlJDMsXHJcblx0XHRyb3RhdGU6IHJvdGF0ZSQzLFxyXG5cdFx0cm90YXRlWDogcm90YXRlWCxcclxuXHRcdHJvdGF0ZVk6IHJvdGF0ZVksXHJcblx0XHRyb3RhdGVaOiByb3RhdGVaLFxyXG5cdFx0ZnJvbVRyYW5zbGF0aW9uOiBmcm9tVHJhbnNsYXRpb24kMixcclxuXHRcdGZyb21TY2FsaW5nOiBmcm9tU2NhbGluZyQzLFxyXG5cdFx0ZnJvbVJvdGF0aW9uOiBmcm9tUm90YXRpb24kMyxcclxuXHRcdGZyb21YUm90YXRpb246IGZyb21YUm90YXRpb24sXHJcblx0XHRmcm9tWVJvdGF0aW9uOiBmcm9tWVJvdGF0aW9uLFxyXG5cdFx0ZnJvbVpSb3RhdGlvbjogZnJvbVpSb3RhdGlvbixcclxuXHRcdGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uOiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcclxuXHRcdGZyb21RdWF0MjogZnJvbVF1YXQyLFxyXG5cdFx0Z2V0VHJhbnNsYXRpb246IGdldFRyYW5zbGF0aW9uLFxyXG5cdFx0Z2V0U2NhbGluZzogZ2V0U2NhbGluZyxcclxuXHRcdGdldFJvdGF0aW9uOiBnZXRSb3RhdGlvbixcclxuXHRcdGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGU6IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUsXHJcblx0XHRmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luOiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luLFxyXG5cdFx0ZnJvbVF1YXQ6IGZyb21RdWF0JDEsXHJcblx0XHRmcnVzdHVtOiBmcnVzdHVtLFxyXG5cdFx0cGVyc3BlY3RpdmU6IHBlcnNwZWN0aXZlLFxyXG5cdFx0cGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXc6IHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3LFxyXG5cdFx0b3J0aG86IG9ydGhvLFxyXG5cdFx0bG9va0F0OiBsb29rQXQsXHJcblx0XHR0YXJnZXRUbzogdGFyZ2V0VG8sXHJcblx0XHRzdHI6IHN0ciQzLFxyXG5cdFx0ZnJvYjogZnJvYiQzLFxyXG5cdFx0YWRkOiBhZGQkMyxcclxuXHRcdHN1YnRyYWN0OiBzdWJ0cmFjdCQzLFxyXG5cdFx0bXVsdGlwbHlTY2FsYXI6IG11bHRpcGx5U2NhbGFyJDMsXHJcblx0XHRtdWx0aXBseVNjYWxhckFuZEFkZDogbXVsdGlwbHlTY2FsYXJBbmRBZGQkMyxcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQzLFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkNCxcclxuXHRcdG11bDogbXVsJDMsXHJcblx0XHRzdWI6IHN1YiQzLFxyXG5cdH0pXHJcblxyXG5cdC8qKlxyXG5cdCAqIDMgRGltZW5zaW9uYWwgVmVjdG9yXHJcblx0ICogQG1vZHVsZSB2ZWMzXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDQoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzBdID0gMFxyXG5cdFx0XHRvdXRbMV0gPSAwXHJcblx0XHRcdG91dFsyXSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkNChhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVuZ3RoKGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkNCh4LCB5LCB6KSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMylcclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNvcHkkNChvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdG91dFsyXSA9IGFbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0JDQob3V0LCB4LCB5LCB6KSB7XHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkNChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3VidHJhY3QkNChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAtIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTXVsdGlwbGllcyB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG11bHRpcGx5JDQob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIERpdmlkZXMgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC8gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAvIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLyBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjZWlsXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGguY2VpbChhWzJdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGZsb29yXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguZmxvb3IoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMydzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byByb3VuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm91bmQob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLnJvdW5kKGFbMl0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjYWxlJDQob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICogYlxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGJcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzMncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlXHJcblx0XHRvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xyXG5cdFx0dmFyIHggPSBiWzBdIC0gYVswXVxyXG5cdFx0dmFyIHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0dmFyIHogPSBiWzJdIC0gYVsyXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XHJcblx0XHR2YXIgeCA9IGJbMF0gLSBhWzBdXHJcblx0XHR2YXIgeSA9IGJbMV0gLSBhWzFdXHJcblx0XHR2YXIgeiA9IGJbMl0gLSBhWzJdXHJcblx0XHRyZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdXHJcblx0XHR2YXIgeSA9IGFbMV1cclxuXHRcdHZhciB6ID0gYVsyXVxyXG5cdFx0cmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogelxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gLWFbMF1cclxuXHRcdG91dFsxXSA9IC1hWzFdXHJcblx0XHRvdXRbMl0gPSAtYVsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGludmVydFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IDEuMCAvIGFbMF1cclxuXHRcdG91dFsxXSA9IDEuMCAvIGFbMV1cclxuXHRcdG91dFsyXSA9IDEuMCAvIGFbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIGEgdmVjM1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdXHJcblx0XHR2YXIgeSA9IGFbMV1cclxuXHRcdHZhciB6ID0gYVsyXVxyXG5cdFx0dmFyIGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogelxyXG5cclxuXHRcdGlmIChsZW4gPiAwKSB7XHJcblx0XHRcdC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XHJcblx0XHRcdGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKVxyXG5cdFx0fVxyXG5cclxuXHRcdG91dFswXSA9IGFbMF0gKiBsZW5cclxuXHRcdG91dFsxXSA9IGFbMV0gKiBsZW5cclxuXHRcdG91dFsyXSA9IGFbMl0gKiBsZW5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZG90KGEsIGIpIHtcclxuXHRcdHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdXHJcblx0XHR2YXIgYnggPSBiWzBdLFxyXG5cdFx0XHRieSA9IGJbMV0sXHJcblx0XHRcdGJ6ID0gYlsyXVxyXG5cdFx0b3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnlcclxuXHRcdG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6XHJcblx0XHRvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcclxuXHRcdHZhciBheCA9IGFbMF1cclxuXHRcdHZhciBheSA9IGFbMV1cclxuXHRcdHZhciBheiA9IGFbMl1cclxuXHRcdG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpXHJcblx0XHRvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KVxyXG5cdFx0b3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheilcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBoZXJtaXRlIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gZCB0aGUgZm91cnRoIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBoZXJtaXRlKG91dCwgYSwgYiwgYywgZCwgdCkge1xyXG5cdFx0dmFyIGZhY3RvclRpbWVzMiA9IHQgKiB0XHJcblx0XHR2YXIgZmFjdG9yMSA9IGZhY3RvclRpbWVzMiAqICgyICogdCAtIDMpICsgMVxyXG5cdFx0dmFyIGZhY3RvcjIgPSBmYWN0b3JUaW1lczIgKiAodCAtIDIpICsgdFxyXG5cdFx0dmFyIGZhY3RvcjMgPSBmYWN0b3JUaW1lczIgKiAodCAtIDEpXHJcblx0XHR2YXIgZmFjdG9yNCA9IGZhY3RvclRpbWVzMiAqICgzIC0gMiAqIHQpXHJcblx0XHRvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNFxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjRcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgYmV6aWVyIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjM30gZCB0aGUgZm91cnRoIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBiZXppZXIob3V0LCBhLCBiLCBjLCBkLCB0KSB7XHJcblx0XHR2YXIgaW52ZXJzZUZhY3RvciA9IDEgLSB0XHJcblx0XHR2YXIgaW52ZXJzZUZhY3RvclRpbWVzVHdvID0gaW52ZXJzZUZhY3RvciAqIGludmVyc2VGYWN0b3JcclxuXHRcdHZhciBmYWN0b3JUaW1lczIgPSB0ICogdFxyXG5cdFx0dmFyIGZhY3RvcjEgPSBpbnZlcnNlRmFjdG9yVGltZXNUd28gKiBpbnZlcnNlRmFjdG9yXHJcblx0XHR2YXIgZmFjdG9yMiA9IDMgKiB0ICogaW52ZXJzZUZhY3RvclRpbWVzVHdvXHJcblx0XHR2YXIgZmFjdG9yMyA9IDMgKiBmYWN0b3JUaW1lczIgKiBpbnZlcnNlRmFjdG9yXHJcblx0XHR2YXIgZmFjdG9yNCA9IGZhY3RvclRpbWVzMiAqIHRcclxuXHRcdG91dFswXSA9IGFbMF0gKiBmYWN0b3IxICsgYlswXSAqIGZhY3RvcjIgKyBjWzBdICogZmFjdG9yMyArIGRbMF0gKiBmYWN0b3I0XHJcblx0XHRvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNFxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGZhY3RvcjEgKyBiWzJdICogZmFjdG9yMiArIGNbMl0gKiBmYWN0b3IzICsgZFsyXSAqIGZhY3RvcjRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJhbmRvbShvdXQsIHNjYWxlKSB7XHJcblx0XHRzY2FsZSA9IHNjYWxlIHx8IDEuMFxyXG5cdFx0dmFyIHIgPSBSQU5ET00oKSAqIDIuMCAqIE1hdGguUElcclxuXHRcdHZhciB6ID0gUkFORE9NKCkgKiAyLjAgLSAxLjBcclxuXHRcdHZhciB6U2NhbGUgPSBNYXRoLnNxcnQoMS4wIC0geiAqIHopICogc2NhbGVcclxuXHRcdG91dFswXSA9IE1hdGguY29zKHIpICogelNjYWxlXHJcblx0XHRvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHpTY2FsZVxyXG5cdFx0b3V0WzJdID0geiAqIHNjYWxlXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXHJcblx0ICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV0sXHJcblx0XHRcdHogPSBhWzJdXHJcblx0XHR2YXIgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XVxyXG5cdFx0dyA9IHcgfHwgMS4wXHJcblx0XHRvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gd1xyXG5cdFx0b3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHdcclxuXHRcdG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gd1xyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge21hdDN9IG0gdGhlIDN4MyBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdLFxyXG5cdFx0XHR6ID0gYVsyXVxyXG5cdFx0b3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdXHJcblx0XHRvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN11cclxuXHRcdG91dFsyXSA9IHggKiBtWzJdICsgeSAqIG1bNV0gKyB6ICogbVs4XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XHJcblx0ICogQ2FuIGFsc28gYmUgdXNlZCBmb3IgZHVhbCBxdWF0ZXJuaW9ucy4gKE11bHRpcGx5IGl0IHdpdGggdGhlIHJlYWwgcGFydClcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQob3V0LCBhLCBxKSB7XHJcblx0XHQvLyBiZW5jaG1hcmtzOiBodHRwczovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnMtZml4ZWRcclxuXHRcdHZhciBxeCA9IHFbMF0sXHJcblx0XHRcdHF5ID0gcVsxXSxcclxuXHRcdFx0cXogPSBxWzJdLFxyXG5cdFx0XHRxdyA9IHFbM11cclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV0sXHJcblx0XHRcdHogPSBhWzJdIC8vIHZhciBxdmVjID0gW3F4LCBxeSwgcXpdO1xyXG5cdFx0Ly8gdmFyIHV2ID0gdmVjMy5jcm9zcyhbXSwgcXZlYywgYSk7XHJcblxyXG5cdFx0dmFyIHV2eCA9IHF5ICogeiAtIHF6ICogeSxcclxuXHRcdFx0dXZ5ID0gcXogKiB4IC0gcXggKiB6LFxyXG5cdFx0XHR1dnogPSBxeCAqIHkgLSBxeSAqIHggLy8gdmFyIHV1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIHV2KTtcclxuXHJcblx0XHR2YXIgdXV2eCA9IHF5ICogdXZ6IC0gcXogKiB1dnksXHJcblx0XHRcdHV1dnkgPSBxeiAqIHV2eCAtIHF4ICogdXZ6LFxyXG5cdFx0XHR1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eCAvLyB2ZWMzLnNjYWxlKHV2LCB1diwgMiAqIHcpO1xyXG5cclxuXHRcdHZhciB3MiA9IHF3ICogMlxyXG5cdFx0dXZ4ICo9IHcyXHJcblx0XHR1dnkgKj0gdzJcclxuXHRcdHV2eiAqPSB3MiAvLyB2ZWMzLnNjYWxlKHV1diwgdXV2LCAyKTtcclxuXHJcblx0XHR1dXZ4ICo9IDJcclxuXHRcdHV1dnkgKj0gMlxyXG5cdFx0dXV2eiAqPSAyIC8vIHJldHVybiB2ZWMzLmFkZChvdXQsIGEsIHZlYzMuYWRkKG91dCwgdXYsIHV1dikpO1xyXG5cclxuXHRcdG91dFswXSA9IHggKyB1dnggKyB1dXZ4XHJcblx0XHRvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eVxyXG5cdFx0b3V0WzJdID0geiArIHV2eiArIHV1dnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeC1heGlzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxyXG5cdCAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWCQxKG91dCwgYSwgYiwgYykge1xyXG5cdFx0dmFyIHAgPSBbXSxcclxuXHRcdFx0ciA9IFtdIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cclxuXHJcblx0XHRwWzBdID0gYVswXSAtIGJbMF1cclxuXHRcdHBbMV0gPSBhWzFdIC0gYlsxXVxyXG5cdFx0cFsyXSA9IGFbMl0gLSBiWzJdIC8vcGVyZm9ybSByb3RhdGlvblxyXG5cclxuXHRcdHJbMF0gPSBwWzBdXHJcblx0XHRyWzFdID0gcFsxXSAqIE1hdGguY29zKGMpIC0gcFsyXSAqIE1hdGguc2luKGMpXHJcblx0XHRyWzJdID0gcFsxXSAqIE1hdGguc2luKGMpICsgcFsyXSAqIE1hdGguY29zKGMpIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cclxuXHJcblx0XHRvdXRbMF0gPSByWzBdICsgYlswXVxyXG5cdFx0b3V0WzFdID0gclsxXSArIGJbMV1cclxuXHRcdG91dFsyXSA9IHJbMl0gKyBiWzJdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHktYXhpc1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVkkMShvdXQsIGEsIGIsIGMpIHtcclxuXHRcdHZhciBwID0gW10sXHJcblx0XHRcdHIgPSBbXSAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcblxyXG5cdFx0cFswXSA9IGFbMF0gLSBiWzBdXHJcblx0XHRwWzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdHBbMl0gPSBhWzJdIC0gYlsyXSAvL3BlcmZvcm0gcm90YXRpb25cclxuXHJcblx0XHRyWzBdID0gcFsyXSAqIE1hdGguc2luKGMpICsgcFswXSAqIE1hdGguY29zKGMpXHJcblx0XHRyWzFdID0gcFsxXVxyXG5cdFx0clsyXSA9IHBbMl0gKiBNYXRoLmNvcyhjKSAtIHBbMF0gKiBNYXRoLnNpbihjKSAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXHJcblxyXG5cdFx0b3V0WzBdID0gclswXSArIGJbMF1cclxuXHRcdG91dFsxXSA9IHJbMV0gKyBiWzFdXHJcblx0XHRvdXRbMl0gPSByWzJdICsgYlsyXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB6LWF4aXNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXHJcblx0ICogQHJldHVybnMge3ZlYzN9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVaJDEob3V0LCBhLCBiLCBjKSB7XHJcblx0XHR2YXIgcCA9IFtdLFxyXG5cdFx0XHRyID0gW10gLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxyXG5cclxuXHRcdHBbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0cFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRwWzJdID0gYVsyXSAtIGJbMl0gLy9wZXJmb3JtIHJvdGF0aW9uXHJcblxyXG5cdFx0clswXSA9IHBbMF0gKiBNYXRoLmNvcyhjKSAtIHBbMV0gKiBNYXRoLnNpbihjKVxyXG5cdFx0clsxXSA9IHBbMF0gKiBNYXRoLnNpbihjKSArIHBbMV0gKiBNYXRoLmNvcyhjKVxyXG5cdFx0clsyXSA9IHBbMl0gLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxyXG5cclxuXHRcdG91dFswXSA9IHJbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSByWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gclsyXSArIGJbMl1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAzRCB2ZWN0b3JzXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFuZ2xlKGEsIGIpIHtcclxuXHRcdHZhciB0ZW1wQSA9IGZyb21WYWx1ZXMkNChhWzBdLCBhWzFdLCBhWzJdKVxyXG5cdFx0dmFyIHRlbXBCID0gZnJvbVZhbHVlcyQ0KGJbMF0sIGJbMV0sIGJbMl0pXHJcblx0XHRub3JtYWxpemUodGVtcEEsIHRlbXBBKVxyXG5cdFx0bm9ybWFsaXplKHRlbXBCLCB0ZW1wQilcclxuXHRcdHZhciBjb3NpbmUgPSBkb3QodGVtcEEsIHRlbXBCKVxyXG5cclxuXHRcdGlmIChjb3NpbmUgPiAxLjApIHtcclxuXHRcdFx0cmV0dXJuIDBcclxuXHRcdH0gZWxzZSBpZiAoY29zaW5lIDwgLTEuMCkge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5QSVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpXHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gemVyb1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHplcm8ob3V0KSB7XHJcblx0XHRvdXRbMF0gPSAwLjBcclxuXHRcdG91dFsxXSA9IDAuMFxyXG5cdFx0b3V0WzJdID0gMC4wXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcblx0ICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3RyJDQoYSkge1xyXG5cdFx0cmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkNChhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGVxdWFscyQ1KGEsIGIpIHtcclxuXHRcdHZhciBhMCA9IGFbMF0sXHJcblx0XHRcdGExID0gYVsxXSxcclxuXHRcdFx0YTIgPSBhWzJdXHJcblx0XHR2YXIgYjAgPSBiWzBdLFxyXG5cdFx0XHRiMSA9IGJbMV0sXHJcblx0XHRcdGIyID0gYlsyXVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSlcclxuXHRcdClcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3ViJDQgPSBzdWJ0cmFjdCQ0XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDQgPSBtdWx0aXBseSQ0XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpdmlkZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpdiA9IGRpdmlkZVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXN0YW5jZX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRpc3QgPSBkaXN0YW5jZVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkRGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJEaXN0ID0gc3F1YXJlZERpc3RhbmNlXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmxlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbiA9IGxlbmd0aFxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyTGVuID0gc3F1YXJlZExlbmd0aFxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMzcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMzLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcblx0ICogQHJldHVybnMge0FycmF5fSBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBmb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHZlYyA9IGNyZWF0ZSQ0KClcclxuXHRcdHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcclxuXHRcdFx0dmFyIGksIGxcclxuXHJcblx0XHRcdGlmICghc3RyaWRlKSB7XHJcblx0XHRcdFx0c3RyaWRlID0gM1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIW9mZnNldCkge1xyXG5cdFx0XHRcdG9mZnNldCA9IDBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGNvdW50KSB7XHJcblx0XHRcdFx0bCA9IE1hdGgubWluKGNvdW50ICogc3RyaWRlICsgb2Zmc2V0LCBhLmxlbmd0aClcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsID0gYS5sZW5ndGhcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yIChpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcclxuXHRcdFx0XHR2ZWNbMF0gPSBhW2ldXHJcblx0XHRcdFx0dmVjWzFdID0gYVtpICsgMV1cclxuXHRcdFx0XHR2ZWNbMl0gPSBhW2kgKyAyXVxyXG5cdFx0XHRcdGZuKHZlYywgdmVjLCBhcmcpXHJcblx0XHRcdFx0YVtpXSA9IHZlY1swXVxyXG5cdFx0XHRcdGFbaSArIDFdID0gdmVjWzFdXHJcblx0XHRcdFx0YVtpICsgMl0gPSB2ZWNbMl1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGFcclxuXHRcdH1cclxuXHR9KSgpXHJcblxyXG5cdHZhciB2ZWMzID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDQsXHJcblx0XHRjbG9uZTogY2xvbmUkNCxcclxuXHRcdGxlbmd0aDogbGVuZ3RoLFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQ0LFxyXG5cdFx0Y29weTogY29weSQ0LFxyXG5cdFx0c2V0OiBzZXQkNCxcclxuXHRcdGFkZDogYWRkJDQsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkNCxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQ0LFxyXG5cdFx0ZGl2aWRlOiBkaXZpZGUsXHJcblx0XHRjZWlsOiBjZWlsLFxyXG5cdFx0Zmxvb3I6IGZsb29yLFxyXG5cdFx0bWluOiBtaW4sXHJcblx0XHRtYXg6IG1heCxcclxuXHRcdHJvdW5kOiByb3VuZCxcclxuXHRcdHNjYWxlOiBzY2FsZSQ0LFxyXG5cdFx0c2NhbGVBbmRBZGQ6IHNjYWxlQW5kQWRkLFxyXG5cdFx0ZGlzdGFuY2U6IGRpc3RhbmNlLFxyXG5cdFx0c3F1YXJlZERpc3RhbmNlOiBzcXVhcmVkRGlzdGFuY2UsXHJcblx0XHRzcXVhcmVkTGVuZ3RoOiBzcXVhcmVkTGVuZ3RoLFxyXG5cdFx0bmVnYXRlOiBuZWdhdGUsXHJcblx0XHRpbnZlcnNlOiBpbnZlcnNlLFxyXG5cdFx0bm9ybWFsaXplOiBub3JtYWxpemUsXHJcblx0XHRkb3Q6IGRvdCxcclxuXHRcdGNyb3NzOiBjcm9zcyxcclxuXHRcdGxlcnA6IGxlcnAsXHJcblx0XHRoZXJtaXRlOiBoZXJtaXRlLFxyXG5cdFx0YmV6aWVyOiBiZXppZXIsXHJcblx0XHRyYW5kb206IHJhbmRvbSxcclxuXHRcdHRyYW5zZm9ybU1hdDQ6IHRyYW5zZm9ybU1hdDQsXHJcblx0XHR0cmFuc2Zvcm1NYXQzOiB0cmFuc2Zvcm1NYXQzLFxyXG5cdFx0dHJhbnNmb3JtUXVhdDogdHJhbnNmb3JtUXVhdCxcclxuXHRcdHJvdGF0ZVg6IHJvdGF0ZVgkMSxcclxuXHRcdHJvdGF0ZVk6IHJvdGF0ZVkkMSxcclxuXHRcdHJvdGF0ZVo6IHJvdGF0ZVokMSxcclxuXHRcdGFuZ2xlOiBhbmdsZSxcclxuXHRcdHplcm86IHplcm8sXHJcblx0XHRzdHI6IHN0ciQ0LFxyXG5cdFx0ZXhhY3RFcXVhbHM6IGV4YWN0RXF1YWxzJDQsXHJcblx0XHRlcXVhbHM6IGVxdWFscyQ1LFxyXG5cdFx0c3ViOiBzdWIkNCxcclxuXHRcdG11bDogbXVsJDQsXHJcblx0XHRkaXY6IGRpdixcclxuXHRcdGRpc3Q6IGRpc3QsXHJcblx0XHRzcXJEaXN0OiBzcXJEaXN0LFxyXG5cdFx0bGVuOiBsZW4sXHJcblx0XHRzcXJMZW46IHNxckxlbixcclxuXHRcdGZvckVhY2g6IGZvckVhY2gsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogNCBEaW1lbnNpb25hbCBWZWN0b3JcclxuXHQgKiBAbW9kdWxlIHZlYzRcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjNFxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkNSgpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSg0KVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMF0gPSAwXHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0b3V0WzJdID0gMFxyXG5cdFx0XHRvdXRbM10gPSAwXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lJDUoYSkge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tVmFsdWVzJDUoeCwgeSwgeiwgdykge1xyXG5cdFx0dmFyIG91dCA9IG5ldyBBUlJBWV9UWVBFKDQpXHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRvdXRbM10gPSB3XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWM0IHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBzb3VyY2UgdmVjdG9yXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDUob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzQgdG8gdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0JDUob3V0LCB4LCB5LCB6LCB3KSB7XHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRvdXRbMl0gPSB6XHJcblx0XHRvdXRbM10gPSB3XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkNShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN1YnRyYWN0JDUob3V0LCBhLCBiKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdIC0gYlswXVxyXG5cdFx0b3V0WzFdID0gYVsxXSAtIGJbMV1cclxuXHRcdG91dFsyXSA9IGFbMl0gLSBiWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdIC0gYlszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byB2ZWM0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkNShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKiBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIERpdmlkZXMgdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXZpZGUkMShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC8gYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSAvIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gLyBiWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjZWlsXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjZWlsJDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguY2VpbChhWzFdKVxyXG5cdFx0b3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pXHJcblx0XHRvdXRbM10gPSBNYXRoLmNlaWwoYVszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBmbG9vclxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZmxvb3IkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguZmxvb3IoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSlcclxuXHRcdG91dFszXSA9IE1hdGguZmxvb3IoYVszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1pbiQxKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKVxyXG5cdFx0b3V0WzNdID0gTWF0aC5taW4oYVszXSwgYlszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1heCQxKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pXHJcblx0XHRvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKVxyXG5cdFx0b3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byByb3VuZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm91bmQkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGgucm91bmQoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSlcclxuXHRcdG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSlcclxuXHRcdG91dFszXSA9IE1hdGgucm91bmQoYVszXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NhbGUkNShvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKiBiXHJcblx0XHRvdXRbMV0gPSBhWzFdICogYlxyXG5cdFx0b3V0WzJdID0gYVsyXSAqIGJcclxuXHRcdG91dFszXSA9IGFbM10gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzQncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZUFuZEFkZCQxKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGVcclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXN0YW5jZSQxKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF1cclxuXHRcdHZhciB5ID0gYlsxXSAtIGFbMV1cclxuXHRcdHZhciB6ID0gYlsyXSAtIGFbMl1cclxuXHRcdHZhciB3ID0gYlszXSAtIGFbM11cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHcpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZSQxKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF1cclxuXHRcdHZhciB5ID0gYlsxXSAtIGFbMV1cclxuXHRcdHZhciB6ID0gYlsyXSAtIGFbMl1cclxuXHRcdHZhciB3ID0gYlszXSAtIGFbM11cclxuXHRcdHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogd1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsZW5ndGgkMShhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF1cclxuXHRcdHZhciB5ID0gYVsxXVxyXG5cdFx0dmFyIHogPSBhWzJdXHJcblx0XHR2YXIgdyA9IGFbM11cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHcpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgkMShhKSB7XHJcblx0XHR2YXIgeCA9IGFbMF1cclxuXHRcdHZhciB5ID0gYVsxXVxyXG5cdFx0dmFyIHogPSBhWzJdXHJcblx0XHR2YXIgdyA9IGFbM11cclxuXHRcdHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogd1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbmVnYXRlJDEob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAtYVswXVxyXG5cdFx0b3V0WzFdID0gLWFbMV1cclxuXHRcdG91dFsyXSA9IC1hWzJdXHJcblx0XHRvdXRbM10gPSAtYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGludmVydFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJzZSQxKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gMS4wIC8gYVswXVxyXG5cdFx0b3V0WzFdID0gMS4wIC8gYVsxXVxyXG5cdFx0b3V0WzJdID0gMS4wIC8gYVsyXVxyXG5cdFx0b3V0WzNdID0gMS4wIC8gYVszXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSB2ZWM0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBub3JtYWxpemUkMShvdXQsIGEpIHtcclxuXHRcdHZhciB4ID0gYVswXVxyXG5cdFx0dmFyIHkgPSBhWzFdXHJcblx0XHR2YXIgeiA9IGFbMl1cclxuXHRcdHZhciB3ID0gYVszXVxyXG5cdFx0dmFyIGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3XHJcblxyXG5cdFx0aWYgKGxlbiA+IDApIHtcclxuXHRcdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0geCAqIGxlblxyXG5cdFx0b3V0WzFdID0geSAqIGxlblxyXG5cdFx0b3V0WzJdID0geiAqIGxlblxyXG5cdFx0b3V0WzNdID0gdyAqIGxlblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkb3QkMShhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM11cclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgY3Jvc3MtcHJvZHVjdCBvZiB0aHJlZSB2ZWN0b3JzIGluIGEgNC1kaW1lbnNpb25hbCBzcGFjZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSByZXN1bHQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IFUgdGhlIGZpcnN0IHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gViB0aGUgc2Vjb25kIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gVyB0aGUgdGhpcmQgdmVjdG9yXHJcblx0ICogQHJldHVybnMge3ZlYzR9IHJlc3VsdFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcm9zcyQxKG91dCwgdSwgdiwgdykge1xyXG5cdFx0dmFyIEEgPSB2WzBdICogd1sxXSAtIHZbMV0gKiB3WzBdLFxyXG5cdFx0XHRCID0gdlswXSAqIHdbMl0gLSB2WzJdICogd1swXSxcclxuXHRcdFx0QyA9IHZbMF0gKiB3WzNdIC0gdlszXSAqIHdbMF0sXHJcblx0XHRcdEQgPSB2WzFdICogd1syXSAtIHZbMl0gKiB3WzFdLFxyXG5cdFx0XHRFID0gdlsxXSAqIHdbM10gLSB2WzNdICogd1sxXSxcclxuXHRcdFx0RiA9IHZbMl0gKiB3WzNdIC0gdlszXSAqIHdbMl1cclxuXHRcdHZhciBHID0gdVswXVxyXG5cdFx0dmFyIEggPSB1WzFdXHJcblx0XHR2YXIgSSA9IHVbMl1cclxuXHRcdHZhciBKID0gdVszXVxyXG5cdFx0b3V0WzBdID0gSCAqIEYgLSBJICogRSArIEogKiBEXHJcblx0XHRvdXRbMV0gPSAtKEcgKiBGKSArIEkgKiBDIC0gSiAqIEJcclxuXHRcdG91dFsyXSA9IEcgKiBFIC0gSCAqIEMgKyBKICogQVxyXG5cdFx0b3V0WzNdID0gLShHICogRCkgKyBIICogQiAtIEkgKiBBXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjNCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcblx0ICogQHJldHVybnMge3ZlYzR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsZXJwJDEob3V0LCBhLCBiLCB0KSB7XHJcblx0XHR2YXIgYXggPSBhWzBdXHJcblx0XHR2YXIgYXkgPSBhWzFdXHJcblx0XHR2YXIgYXogPSBhWzJdXHJcblx0XHR2YXIgYXcgPSBhWzNdXHJcblx0XHRvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KVxyXG5cdFx0b3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSlcclxuXHRcdG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopXHJcblx0XHRvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcmFuZG9tJDEob3V0LCBzY2FsZSkge1xyXG5cdFx0c2NhbGUgPSBzY2FsZSB8fCAxLjAgLy8gTWFyc2FnbGlhLCBHZW9yZ2UuIENob29zaW5nIGEgUG9pbnQgZnJvbSB0aGUgU3VyZmFjZSBvZiBhXHJcblx0XHQvLyBTcGhlcmUuIEFubi4gTWF0aC4gU3RhdGlzdC4gNDMgKDE5NzIpLCBuby4gMiwgNjQ1LS02NDYuXHJcblx0XHQvLyBodHRwOi8vcHJvamVjdGV1Y2xpZC5vcmcvZXVjbGlkLmFvbXMvMTE3NzY5MjY0NDtcclxuXHJcblx0XHR2YXIgdjEsIHYyLCB2MywgdjRcclxuXHRcdHZhciBzMSwgczJcclxuXHJcblx0XHRkbyB7XHJcblx0XHRcdHYxID0gUkFORE9NKCkgKiAyIC0gMVxyXG5cdFx0XHR2MiA9IFJBTkRPTSgpICogMiAtIDFcclxuXHRcdFx0czEgPSB2MSAqIHYxICsgdjIgKiB2MlxyXG5cdFx0fSB3aGlsZSAoczEgPj0gMSlcclxuXHJcblx0XHRkbyB7XHJcblx0XHRcdHYzID0gUkFORE9NKCkgKiAyIC0gMVxyXG5cdFx0XHR2NCA9IFJBTkRPTSgpICogMiAtIDFcclxuXHRcdFx0czIgPSB2MyAqIHYzICsgdjQgKiB2NFxyXG5cdFx0fSB3aGlsZSAoczIgPj0gMSlcclxuXHJcblx0XHR2YXIgZCA9IE1hdGguc3FydCgoMSAtIHMxKSAvIHMyKVxyXG5cdFx0b3V0WzBdID0gc2NhbGUgKiB2MVxyXG5cdFx0b3V0WzFdID0gc2NhbGUgKiB2MlxyXG5cdFx0b3V0WzJdID0gc2NhbGUgKiB2MyAqIGRcclxuXHRcdG91dFszXSA9IHNjYWxlICogdjQgKiBkXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIG1hdDQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQkMShvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV0sXHJcblx0XHRcdHogPSBhWzJdLFxyXG5cdFx0XHR3ID0gYVszXVxyXG5cdFx0b3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0gKiB3XHJcblx0XHRvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSAqIHdcclxuXHRcdG91dFsyXSA9IG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSAqIHdcclxuXHRcdG91dFszXSA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XSAqIHdcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtUXVhdCQxKG91dCwgYSwgcSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXSxcclxuXHRcdFx0eiA9IGFbMl1cclxuXHRcdHZhciBxeCA9IHFbMF0sXHJcblx0XHRcdHF5ID0gcVsxXSxcclxuXHRcdFx0cXogPSBxWzJdLFxyXG5cdFx0XHRxdyA9IHFbM10gLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcclxuXHJcblx0XHR2YXIgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHlcclxuXHRcdHZhciBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogelxyXG5cdFx0dmFyIGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4XHJcblx0XHR2YXIgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6IC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcclxuXHJcblx0XHRvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5XHJcblx0XHRvdXRbMV0gPSBpeSAqIHF3ICsgaXcgKiAtcXkgKyBpeiAqIC1xeCAtIGl4ICogLXF6XHJcblx0XHRvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4XHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzQgdG8gemVyb1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcmV0dXJucyB7dmVjNH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHplcm8kMShvdXQpIHtcclxuXHRcdG91dFswXSA9IDAuMFxyXG5cdFx0b3V0WzFdID0gMC4wXHJcblx0XHRvdXRbMl0gPSAwLjBcclxuXHRcdG91dFszXSA9IDAuMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHN0ciQ1KGEpIHtcclxuXHRcdHJldHVybiAndmVjNCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkNShhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXF1YWxzJDYoYSwgYikge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIGIwID0gYlswXSxcclxuXHRcdFx0YjEgPSBiWzFdLFxyXG5cdFx0XHRiMiA9IGJbMl0sXHJcblx0XHRcdGIzID0gYlszXVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpXHJcblx0XHQpXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQ1ID0gc3VidHJhY3QkNVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQ1ID0gbXVsdGlwbHkkNVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXZpZGV9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkaXYkMSA9IGRpdmlkZSQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZGlzdCQxID0gZGlzdGFuY2UkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkRGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJEaXN0JDEgPSBzcXVhcmVkRGlzdGFuY2UkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5sZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW4kMSA9IGxlbmd0aCQxXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWRMZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJMZW4kMSA9IHNxdWFyZWRMZW5ndGgkMVxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWM0cyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXHJcblx0ICogQHJldHVybnMge0FycmF5fSBhXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBmb3JFYWNoJDEgPSAoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdmVjID0gY3JlYXRlJDUoKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xyXG5cdFx0XHR2YXIgaSwgbFxyXG5cclxuXHRcdFx0aWYgKCFzdHJpZGUpIHtcclxuXHRcdFx0XHRzdHJpZGUgPSA0XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICghb2Zmc2V0KSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gMFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoY291bnQpIHtcclxuXHRcdFx0XHRsID0gTWF0aC5taW4oY291bnQgKiBzdHJpZGUgKyBvZmZzZXQsIGEubGVuZ3RoKVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGwgPSBhLmxlbmd0aFxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xyXG5cdFx0XHRcdHZlY1swXSA9IGFbaV1cclxuXHRcdFx0XHR2ZWNbMV0gPSBhW2kgKyAxXVxyXG5cdFx0XHRcdHZlY1syXSA9IGFbaSArIDJdXHJcblx0XHRcdFx0dmVjWzNdID0gYVtpICsgM11cclxuXHRcdFx0XHRmbih2ZWMsIHZlYywgYXJnKVxyXG5cdFx0XHRcdGFbaV0gPSB2ZWNbMF1cclxuXHRcdFx0XHRhW2kgKyAxXSA9IHZlY1sxXVxyXG5cdFx0XHRcdGFbaSArIDJdID0gdmVjWzJdXHJcblx0XHRcdFx0YVtpICsgM10gPSB2ZWNbM11cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGFcclxuXHRcdH1cclxuXHR9KSgpXHJcblxyXG5cdHZhciB2ZWM0ID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDUsXHJcblx0XHRjbG9uZTogY2xvbmUkNSxcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkNSxcclxuXHRcdGNvcHk6IGNvcHkkNSxcclxuXHRcdHNldDogc2V0JDUsXHJcblx0XHRhZGQ6IGFkZCQ1LFxyXG5cdFx0c3VidHJhY3Q6IHN1YnRyYWN0JDUsXHJcblx0XHRtdWx0aXBseTogbXVsdGlwbHkkNSxcclxuXHRcdGRpdmlkZTogZGl2aWRlJDEsXHJcblx0XHRjZWlsOiBjZWlsJDEsXHJcblx0XHRmbG9vcjogZmxvb3IkMSxcclxuXHRcdG1pbjogbWluJDEsXHJcblx0XHRtYXg6IG1heCQxLFxyXG5cdFx0cm91bmQ6IHJvdW5kJDEsXHJcblx0XHRzY2FsZTogc2NhbGUkNSxcclxuXHRcdHNjYWxlQW5kQWRkOiBzY2FsZUFuZEFkZCQxLFxyXG5cdFx0ZGlzdGFuY2U6IGRpc3RhbmNlJDEsXHJcblx0XHRzcXVhcmVkRGlzdGFuY2U6IHNxdWFyZWREaXN0YW5jZSQxLFxyXG5cdFx0bGVuZ3RoOiBsZW5ndGgkMSxcclxuXHRcdHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGgkMSxcclxuXHRcdG5lZ2F0ZTogbmVnYXRlJDEsXHJcblx0XHRpbnZlcnNlOiBpbnZlcnNlJDEsXHJcblx0XHRub3JtYWxpemU6IG5vcm1hbGl6ZSQxLFxyXG5cdFx0ZG90OiBkb3QkMSxcclxuXHRcdGNyb3NzOiBjcm9zcyQxLFxyXG5cdFx0bGVycDogbGVycCQxLFxyXG5cdFx0cmFuZG9tOiByYW5kb20kMSxcclxuXHRcdHRyYW5zZm9ybU1hdDQ6IHRyYW5zZm9ybU1hdDQkMSxcclxuXHRcdHRyYW5zZm9ybVF1YXQ6IHRyYW5zZm9ybVF1YXQkMSxcclxuXHRcdHplcm86IHplcm8kMSxcclxuXHRcdHN0cjogc3RyJDUsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkNSxcclxuXHRcdGVxdWFsczogZXF1YWxzJDYsXHJcblx0XHRzdWI6IHN1YiQ1LFxyXG5cdFx0bXVsOiBtdWwkNSxcclxuXHRcdGRpdjogZGl2JDEsXHJcblx0XHRkaXN0OiBkaXN0JDEsXHJcblx0XHRzcXJEaXN0OiBzcXJEaXN0JDEsXHJcblx0XHRsZW46IGxlbiQxLFxyXG5cdFx0c3FyTGVuOiBzcXJMZW4kMSxcclxuXHRcdGZvckVhY2g6IGZvckVhY2gkMSxcclxuXHR9KVxyXG5cclxuXHQvKipcclxuXHQgKiBRdWF0ZXJuaW9uXHJcblx0ICogQG1vZHVsZSBxdWF0XHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgcXVhdFxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDYoKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoNClcclxuXHJcblx0XHRpZiAoQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcclxuXHRcdFx0b3V0WzBdID0gMFxyXG5cdFx0XHRvdXRbMV0gPSAwXHJcblx0XHRcdG91dFsyXSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRvdXRbM10gPSAxXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkkNChvdXQpIHtcclxuXHRcdG91dFswXSA9IDBcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0cyBhIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYW5kIHJvdGF0aW9uIGF4aXMsXHJcblx0ICogdGhlbiByZXR1cm5zIGl0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0QXhpc0FuZ2xlKG91dCwgYXhpcywgcmFkKSB7XHJcblx0XHRyYWQgPSByYWQgKiAwLjVcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0b3V0WzBdID0gcyAqIGF4aXNbMF1cclxuXHRcdG91dFsxXSA9IHMgKiBheGlzWzFdXHJcblx0XHRvdXRbMl0gPSBzICogYXhpc1syXVxyXG5cdFx0b3V0WzNdID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBHZXRzIHRoZSByb3RhdGlvbiBheGlzIGFuZCBhbmdsZSBmb3IgYSBnaXZlblxyXG5cdCAqICBxdWF0ZXJuaW9uLiBJZiBhIHF1YXRlcm5pb24gaXMgY3JlYXRlZCB3aXRoXHJcblx0ICogIHNldEF4aXNBbmdsZSwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gdGhlIHNhbWVcclxuXHQgKiAgdmFsdWVzIGFzIHByb3ZpZGllZCBpbiB0aGUgb3JpZ2luYWwgcGFyYW1ldGVyIGxpc3RcclxuXHQgKiAgT1IgZnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdmFsdWVzLlxyXG5cdCAqIEV4YW1wbGU6IFRoZSBxdWF0ZXJuaW9uIGZvcm1lZCBieSBheGlzIFswLCAwLCAxXSBhbmRcclxuXHQgKiAgYW5nbGUgLTkwIGlzIHRoZSBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIGZvcm1lZCBieVxyXG5cdCAqICBbMCwgMCwgMV0gYW5kIDI3MC4gVGhpcyBtZXRob2QgZmF2b3JzIHRoZSBsYXR0ZXIuXHJcblx0ICogQHBhcmFtICB7dmVjM30gb3V0X2F4aXMgIFZlY3RvciByZWNlaXZpbmcgdGhlIGF4aXMgb2Ygcm90YXRpb25cclxuXHQgKiBAcGFyYW0gIHtxdWF0fSBxICAgICBRdWF0ZXJuaW9uIHRvIGJlIGRlY29tcG9zZWRcclxuXHQgKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBBbmdsZSwgaW4gcmFkaWFucywgb2YgdGhlIHJvdGF0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGdldEF4aXNBbmdsZShvdXRfYXhpcywgcSkge1xyXG5cdFx0dmFyIHJhZCA9IE1hdGguYWNvcyhxWzNdKSAqIDIuMFxyXG5cdFx0dmFyIHMgPSBNYXRoLnNpbihyYWQgLyAyLjApXHJcblxyXG5cdFx0aWYgKHMgPiBFUFNJTE9OKSB7XHJcblx0XHRcdG91dF9heGlzWzBdID0gcVswXSAvIHNcclxuXHRcdFx0b3V0X2F4aXNbMV0gPSBxWzFdIC8gc1xyXG5cdFx0XHRvdXRfYXhpc1syXSA9IHFbMl0gLyBzXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBJZiBzIGlzIHplcm8sIHJldHVybiBhbnkgYXhpcyAobm8gcm90YXRpb24gLSBheGlzIGRvZXMgbm90IG1hdHRlcilcclxuXHRcdFx0b3V0X2F4aXNbMF0gPSAxXHJcblx0XHRcdG91dF9heGlzWzFdID0gMFxyXG5cdFx0XHRvdXRfYXhpc1syXSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcmFkXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIHF1YXQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkNihvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdLFxyXG5cdFx0XHRhdyA9IGFbM11cclxuXHRcdHZhciBieCA9IGJbMF0sXHJcblx0XHRcdGJ5ID0gYlsxXSxcclxuXHRcdFx0YnogPSBiWzJdLFxyXG5cdFx0XHRidyA9IGJbM11cclxuXHRcdG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnlcclxuXHRcdG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnpcclxuXHRcdG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYnhcclxuXHRcdG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBYIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVgkMihvdXQsIGEsIHJhZCkge1xyXG5cdFx0cmFkICo9IDAuNVxyXG5cdFx0dmFyIGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0dmFyIGJ4ID0gTWF0aC5zaW4ocmFkKSxcclxuXHRcdFx0YncgPSBNYXRoLmNvcyhyYWQpXHJcblx0XHRvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieFxyXG5cdFx0b3V0WzFdID0gYXkgKiBidyArIGF6ICogYnhcclxuXHRcdG91dFsyXSA9IGF6ICogYncgLSBheSAqIGJ4XHJcblx0XHRvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFkgYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWSQyKG91dCwgYSwgcmFkKSB7XHJcblx0XHRyYWQgKj0gMC41XHJcblx0XHR2YXIgYXggPSBhWzBdLFxyXG5cdFx0XHRheSA9IGFbMV0sXHJcblx0XHRcdGF6ID0gYVsyXSxcclxuXHRcdFx0YXcgPSBhWzNdXHJcblx0XHR2YXIgYnkgPSBNYXRoLnNpbihyYWQpLFxyXG5cdFx0XHRidyA9IE1hdGguY29zKHJhZClcclxuXHRcdG91dFswXSA9IGF4ICogYncgLSBheiAqIGJ5XHJcblx0XHRvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieVxyXG5cdFx0b3V0WzJdID0gYXogKiBidyArIGF4ICogYnlcclxuXHRcdG91dFszXSA9IGF3ICogYncgLSBheSAqIGJ5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWiBheGlzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVaJDIob3V0LCBhLCByYWQpIHtcclxuXHRcdHJhZCAqPSAwLjVcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdLFxyXG5cdFx0XHRhdyA9IGFbM11cclxuXHRcdHZhciBieiA9IE1hdGguc2luKHJhZCksXHJcblx0XHRcdGJ3ID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0b3V0WzBdID0gYXggKiBidyArIGF5ICogYnpcclxuXHRcdG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6XHJcblx0XHRvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBielxyXG5cdFx0b3V0WzNdID0gYXcgKiBidyAtIGF6ICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgVyBjb21wb25lbnQgb2YgYSBxdWF0IGZyb20gdGhlIFgsIFksIGFuZCBaIGNvbXBvbmVudHMuXHJcblx0ICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cclxuXHQgKiBBbnkgZXhpc3RpbmcgVyBjb21wb25lbnQgd2lsbCBiZSBpZ25vcmVkLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIFcgY29tcG9uZW50IG9mXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjYWxjdWxhdGVXKG91dCwgYSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXSxcclxuXHRcdFx0eiA9IGFbMl1cclxuXHRcdG91dFswXSA9IHhcclxuXHRcdG91dFsxXSA9IHlcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdG91dFszXSA9IE1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2xlcnAob3V0LCBhLCBiLCB0KSB7XHJcblx0XHQvLyBiZW5jaG1hcmtzOlxyXG5cdFx0Ly8gICAgaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi1zbGVycC1pbXBsZW1lbnRhdGlvbnNcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXSxcclxuXHRcdFx0YXogPSBhWzJdLFxyXG5cdFx0XHRhdyA9IGFbM11cclxuXHRcdHZhciBieCA9IGJbMF0sXHJcblx0XHRcdGJ5ID0gYlsxXSxcclxuXHRcdFx0YnogPSBiWzJdLFxyXG5cdFx0XHRidyA9IGJbM11cclxuXHRcdHZhciBvbWVnYSwgY29zb20sIHNpbm9tLCBzY2FsZTAsIHNjYWxlMSAvLyBjYWxjIGNvc2luZVxyXG5cclxuXHRcdGNvc29tID0gYXggKiBieCArIGF5ICogYnkgKyBheiAqIGJ6ICsgYXcgKiBidyAvLyBhZGp1c3Qgc2lnbnMgKGlmIG5lY2Vzc2FyeSlcclxuXHJcblx0XHRpZiAoY29zb20gPCAwLjApIHtcclxuXHRcdFx0Y29zb20gPSAtY29zb21cclxuXHRcdFx0YnggPSAtYnhcclxuXHRcdFx0YnkgPSAtYnlcclxuXHRcdFx0YnogPSAtYnpcclxuXHRcdFx0YncgPSAtYndcclxuXHRcdH0gLy8gY2FsY3VsYXRlIGNvZWZmaWNpZW50c1xyXG5cclxuXHRcdGlmICgxLjAgLSBjb3NvbSA+IEVQU0lMT04pIHtcclxuXHRcdFx0Ly8gc3RhbmRhcmQgY2FzZSAoc2xlcnApXHJcblx0XHRcdG9tZWdhID0gTWF0aC5hY29zKGNvc29tKVxyXG5cdFx0XHRzaW5vbSA9IE1hdGguc2luKG9tZWdhKVxyXG5cdFx0XHRzY2FsZTAgPSBNYXRoLnNpbigoMS4wIC0gdCkgKiBvbWVnYSkgLyBzaW5vbVxyXG5cdFx0XHRzY2FsZTEgPSBNYXRoLnNpbih0ICogb21lZ2EpIC8gc2lub21cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIFwiZnJvbVwiIGFuZCBcInRvXCIgcXVhdGVybmlvbnMgYXJlIHZlcnkgY2xvc2VcclxuXHRcdFx0Ly8gIC4uLiBzbyB3ZSBjYW4gZG8gYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxyXG5cdFx0XHRzY2FsZTAgPSAxLjAgLSB0XHJcblx0XHRcdHNjYWxlMSA9IHRcclxuXHRcdH0gLy8gY2FsY3VsYXRlIGZpbmFsIHZhbHVlc1xyXG5cclxuXHRcdG91dFswXSA9IHNjYWxlMCAqIGF4ICsgc2NhbGUxICogYnhcclxuXHRcdG91dFsxXSA9IHNjYWxlMCAqIGF5ICsgc2NhbGUxICogYnlcclxuXHRcdG91dFsyXSA9IHNjYWxlMCAqIGF6ICsgc2NhbGUxICogYnpcclxuXHRcdG91dFszXSA9IHNjYWxlMCAqIGF3ICsgc2NhbGUxICogYndcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGVzIGEgcmFuZG9tIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcmFuZG9tJDIob3V0KSB7XHJcblx0XHQvLyBJbXBsZW1lbnRhdGlvbiBvZiBodHRwOi8vcGxhbm5pbmcuY3MudWl1Yy5lZHUvbm9kZTE5OC5odG1sXHJcblx0XHQvLyBUT0RPOiBDYWxsaW5nIHJhbmRvbSAzIHRpbWVzIGlzIHByb2JhYmx5IG5vdCB0aGUgZmFzdGVzdCBzb2x1dGlvblxyXG5cdFx0dmFyIHUxID0gUkFORE9NKClcclxuXHRcdHZhciB1MiA9IFJBTkRPTSgpXHJcblx0XHR2YXIgdTMgPSBSQU5ET00oKVxyXG5cdFx0dmFyIHNxcnQxTWludXNVMSA9IE1hdGguc3FydCgxIC0gdTEpXHJcblx0XHR2YXIgc3FydFUxID0gTWF0aC5zcXJ0KHUxKVxyXG5cdFx0b3V0WzBdID0gc3FydDFNaW51c1UxICogTWF0aC5zaW4oMi4wICogTWF0aC5QSSAqIHUyKVxyXG5cdFx0b3V0WzFdID0gc3FydDFNaW51c1UxICogTWF0aC5jb3MoMi4wICogTWF0aC5QSSAqIHUyKVxyXG5cdFx0b3V0WzJdID0gc3FydFUxICogTWF0aC5zaW4oMi4wICogTWF0aC5QSSAqIHUzKVxyXG5cdFx0b3V0WzNdID0gc3FydFUxICogTWF0aC5jb3MoMi4wICogTWF0aC5QSSAqIHUzKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGludmVydCQ0KG91dCwgYSkge1xyXG5cdFx0dmFyIGEwID0gYVswXSxcclxuXHRcdFx0YTEgPSBhWzFdLFxyXG5cdFx0XHRhMiA9IGFbMl0sXHJcblx0XHRcdGEzID0gYVszXVxyXG5cdFx0dmFyIGRvdCQkMSA9IGEwICogYTAgKyBhMSAqIGExICsgYTIgKiBhMiArIGEzICogYTNcclxuXHRcdHZhciBpbnZEb3QgPSBkb3QkJDEgPyAxLjAgLyBkb3QkJDEgOiAwIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXHJcblxyXG5cdFx0b3V0WzBdID0gLWEwICogaW52RG90XHJcblx0XHRvdXRbMV0gPSAtYTEgKiBpbnZEb3RcclxuXHRcdG91dFsyXSA9IC1hMiAqIGludkRvdFxyXG5cdFx0b3V0WzNdID0gYTMgKiBpbnZEb3RcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxyXG5cdCAqIElmIHRoZSBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdC5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb25qdWdhdGUob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSAtYVswXVxyXG5cdFx0b3V0WzFdID0gLWFbMV1cclxuXHRcdG91dFsyXSA9IC1hWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIDN4MyByb3RhdGlvbiBtYXRyaXguXHJcblx0ICpcclxuXHQgKiBOT1RFOiBUaGUgcmVzdWx0YW50IHF1YXRlcm5pb24gaXMgbm90IG5vcm1hbGl6ZWQsIHNvIHlvdSBzaG91bGQgYmUgc3VyZVxyXG5cdCAqIHRvIHJlbm9ybWFsaXplIHRoZSBxdWF0ZXJuaW9uIHlvdXJzZWxmIHdoZXJlIG5lY2Vzc2FyeS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7bWF0M30gbSByb3RhdGlvbiBtYXRyaXhcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21NYXQzKG91dCwgbSkge1xyXG5cdFx0Ly8gQWxnb3JpdGhtIGluIEtlbiBTaG9lbWFrZSdzIGFydGljbGUgaW4gMTk4NyBTSUdHUkFQSCBjb3Vyc2Ugbm90ZXNcclxuXHRcdC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxyXG5cdFx0dmFyIGZUcmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XVxyXG5cdFx0dmFyIGZSb290XHJcblxyXG5cdFx0aWYgKGZUcmFjZSA+IDAuMCkge1xyXG5cdFx0XHQvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXHJcblx0XHRcdGZSb290ID0gTWF0aC5zcXJ0KGZUcmFjZSArIDEuMCkgLy8gMndcclxuXHJcblx0XHRcdG91dFszXSA9IDAuNSAqIGZSb290XHJcblx0XHRcdGZSb290ID0gMC41IC8gZlJvb3QgLy8gMS8oNHcpXHJcblxyXG5cdFx0XHRvdXRbMF0gPSAobVs1XSAtIG1bN10pICogZlJvb3RcclxuXHRcdFx0b3V0WzFdID0gKG1bNl0gLSBtWzJdKSAqIGZSb290XHJcblx0XHRcdG91dFsyXSA9IChtWzFdIC0gbVszXSkgKiBmUm9vdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gfHd8IDw9IDEvMlxyXG5cdFx0XHR2YXIgaSA9IDBcclxuXHRcdFx0aWYgKG1bNF0gPiBtWzBdKSBpID0gMVxyXG5cdFx0XHRpZiAobVs4XSA+IG1baSAqIDMgKyBpXSkgaSA9IDJcclxuXHRcdFx0dmFyIGogPSAoaSArIDEpICUgM1xyXG5cdFx0XHR2YXIgayA9IChpICsgMikgJSAzXHJcblx0XHRcdGZSb290ID0gTWF0aC5zcXJ0KG1baSAqIDMgKyBpXSAtIG1baiAqIDMgKyBqXSAtIG1bayAqIDMgKyBrXSArIDEuMClcclxuXHRcdFx0b3V0W2ldID0gMC41ICogZlJvb3RcclxuXHRcdFx0ZlJvb3QgPSAwLjUgLyBmUm9vdFxyXG5cdFx0XHRvdXRbM10gPSAobVtqICogMyArIGtdIC0gbVtrICogMyArIGpdKSAqIGZSb290XHJcblx0XHRcdG91dFtqXSA9IChtW2ogKiAzICsgaV0gKyBtW2kgKiAzICsgal0pICogZlJvb3RcclxuXHRcdFx0b3V0W2tdID0gKG1bayAqIDMgKyBpXSArIG1baSAqIDMgKyBrXSkgKiBmUm9vdFxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gZXVsZXIgYW5nbGUgeCwgeSwgei5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7eH0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBYIGF4aXMgaW4gZGVncmVlcy5cclxuXHQgKiBAcGFyYW0ge3l9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWSBheGlzIGluIGRlZ3JlZXMuXHJcblx0ICogQHBhcmFtIHt6fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFogYXhpcyBpbiBkZWdyZWVzLlxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbUV1bGVyKG91dCwgeCwgeSwgeikge1xyXG5cdFx0dmFyIGhhbGZUb1JhZCA9ICgwLjUgKiBNYXRoLlBJKSAvIDE4MC4wXHJcblx0XHR4ICo9IGhhbGZUb1JhZFxyXG5cdFx0eSAqPSBoYWxmVG9SYWRcclxuXHRcdHogKj0gaGFsZlRvUmFkXHJcblx0XHR2YXIgc3ggPSBNYXRoLnNpbih4KVxyXG5cdFx0dmFyIGN4ID0gTWF0aC5jb3MoeClcclxuXHRcdHZhciBzeSA9IE1hdGguc2luKHkpXHJcblx0XHR2YXIgY3kgPSBNYXRoLmNvcyh5KVxyXG5cdFx0dmFyIHN6ID0gTWF0aC5zaW4oeilcclxuXHRcdHZhciBjeiA9IE1hdGguY29zKHopXHJcblx0XHRvdXRbMF0gPSBzeCAqIGN5ICogY3ogLSBjeCAqIHN5ICogc3pcclxuXHRcdG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzelxyXG5cdFx0b3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6XHJcblx0XHRvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3pcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHF1YXRlbmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkNihhKSB7XHJcblx0XHRyZXR1cm4gJ3F1YXQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSdcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgcXVhdGVybmlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gY2xvbmVcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgY2xvbmUkNiA9IGNsb25lJDVcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBmcm9tVmFsdWVzJDYgPSBmcm9tVmFsdWVzJDVcclxuXHQvKipcclxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgcXVhdCB0byBhbm90aGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHNvdXJjZSBxdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgY29weSQ2ID0gY29weSQ1XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNldCQ2ID0gc2V0JDVcclxuXHQvKipcclxuXHQgKiBBZGRzIHR3byBxdWF0J3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBhZGQkNiA9IGFkZCQ1XHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDYgPSBtdWx0aXBseSQ2XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIGEgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNjYWxlJDYgPSBzY2FsZSQ1XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHF1YXQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGRvdCQyID0gZG90JDFcclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZXJwJDIgPSBsZXJwJDFcclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuZ3RoJDIgPSBsZW5ndGgkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5sZW5ndGh9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBsZW4kMiA9IGxlbmd0aCQyXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNxdWFyZWRMZW5ndGgkMiA9IHNxdWFyZWRMZW5ndGgkMVxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5zcXVhcmVkTGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyTGVuJDIgPSBzcXVhcmVkTGVuZ3RoJDJcclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBub3JtYWxpemVcclxuXHQgKiBAcmV0dXJucyB7cXVhdH0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBub3JtYWxpemUkMiA9IG5vcm1hbGl6ZSQxXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcXVhdGVybmlvbnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0fSBhIFRoZSBmaXJzdCBxdWF0ZXJuaW9uLlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiBUaGUgc2Vjb25kIHF1YXRlcm5pb24uXHJcblx0ICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcblx0ICovXHJcblxyXG5cdHZhciBleGFjdEVxdWFscyQ2ID0gZXhhY3RFcXVhbHMkNVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHF1YXRlcm5pb25zIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0dmFyIGVxdWFscyQ3ID0gZXF1YWxzJDZcclxuXHQvKipcclxuXHQgKiBTZXRzIGEgcXVhdGVybmlvbiB0byByZXByZXNlbnQgdGhlIHNob3J0ZXN0IHJvdGF0aW9uIGZyb20gb25lXHJcblx0ICogdmVjdG9yIHRvIGFub3RoZXIuXHJcblx0ICpcclxuXHQgKiBCb3RoIHZlY3RvcnMgYXJlIGFzc3VtZWQgdG8gYmUgdW5pdCBsZW5ndGguXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb24uXHJcblx0ICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBpbml0aWFsIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjM30gYiB0aGUgZGVzdGluYXRpb24gdmVjdG9yXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHR2YXIgcm90YXRpb25UbyA9IChmdW5jdGlvbigpIHtcclxuXHRcdHZhciB0bXB2ZWMzID0gY3JlYXRlJDQoKVxyXG5cdFx0dmFyIHhVbml0VmVjMyA9IGZyb21WYWx1ZXMkNCgxLCAwLCAwKVxyXG5cdFx0dmFyIHlVbml0VmVjMyA9IGZyb21WYWx1ZXMkNCgwLCAxLCAwKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG91dCwgYSwgYikge1xyXG5cdFx0XHR2YXIgZG90JCQxID0gZG90KGEsIGIpXHJcblxyXG5cdFx0XHRpZiAoZG90JCQxIDwgLTAuOTk5OTk5KSB7XHJcblx0XHRcdFx0Y3Jvc3ModG1wdmVjMywgeFVuaXRWZWMzLCBhKVxyXG5cdFx0XHRcdGlmIChsZW4odG1wdmVjMykgPCAwLjAwMDAwMSkgY3Jvc3ModG1wdmVjMywgeVVuaXRWZWMzLCBhKVxyXG5cdFx0XHRcdG5vcm1hbGl6ZSh0bXB2ZWMzLCB0bXB2ZWMzKVxyXG5cdFx0XHRcdHNldEF4aXNBbmdsZShvdXQsIHRtcHZlYzMsIE1hdGguUEkpXHJcblx0XHRcdFx0cmV0dXJuIG91dFxyXG5cdFx0XHR9IGVsc2UgaWYgKGRvdCQkMSA+IDAuOTk5OTk5KSB7XHJcblx0XHRcdFx0b3V0WzBdID0gMFxyXG5cdFx0XHRcdG91dFsxXSA9IDBcclxuXHRcdFx0XHRvdXRbMl0gPSAwXHJcblx0XHRcdFx0b3V0WzNdID0gMVxyXG5cdFx0XHRcdHJldHVybiBvdXRcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjcm9zcyh0bXB2ZWMzLCBhLCBiKVxyXG5cdFx0XHRcdG91dFswXSA9IHRtcHZlYzNbMF1cclxuXHRcdFx0XHRvdXRbMV0gPSB0bXB2ZWMzWzFdXHJcblx0XHRcdFx0b3V0WzJdID0gdG1wdmVjM1syXVxyXG5cdFx0XHRcdG91dFszXSA9IDEgKyBkb3QkJDFcclxuXHRcdFx0XHRyZXR1cm4gbm9ybWFsaXplJDIob3V0LCBvdXQpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KSgpXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGMgdGhlIHRoaXJkIG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xyXG5cdCAqIEByZXR1cm5zIHtxdWF0fSBvdXRcclxuXHQgKi9cclxuXHJcblx0dmFyIHNxbGVycCA9IChmdW5jdGlvbigpIHtcclxuXHRcdHZhciB0ZW1wMSA9IGNyZWF0ZSQ2KClcclxuXHRcdHZhciB0ZW1wMiA9IGNyZWF0ZSQ2KClcclxuXHRcdHJldHVybiBmdW5jdGlvbihvdXQsIGEsIGIsIGMsIGQsIHQpIHtcclxuXHRcdFx0c2xlcnAodGVtcDEsIGEsIGQsIHQpXHJcblx0XHRcdHNsZXJwKHRlbXAyLCBiLCBjLCB0KVxyXG5cdFx0XHRzbGVycChvdXQsIHRlbXAxLCB0ZW1wMiwgMiAqIHQgKiAoMSAtIHQpKVxyXG5cdFx0XHRyZXR1cm4gb3V0XHJcblx0XHR9XHJcblx0fSkoKVxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHNwZWNpZmllZCBxdWF0ZXJuaW9uIHdpdGggdmFsdWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuXHJcblx0ICogYXhlcy4gRWFjaCBheGlzIGlzIGEgdmVjMyBhbmQgaXMgZXhwZWN0ZWQgdG8gYmUgdW5pdCBsZW5ndGggYW5kXHJcblx0ICogcGVycGVuZGljdWxhciB0byBhbGwgb3RoZXIgc3BlY2lmaWVkIGF4ZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHZpZXcgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSB2aWV3aW5nIGRpcmVjdGlvblxyXG5cdCAqIEBwYXJhbSB7dmVjM30gcmlnaHQgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwicmlnaHRcIiBkaXJlY3Rpb25cclxuXHQgKiBAcGFyYW0ge3ZlYzN9IHVwICAgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhbCBcInVwXCIgZGlyZWN0aW9uXHJcblx0ICogQHJldHVybnMge3F1YXR9IG91dFxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc2V0QXhlcyA9IChmdW5jdGlvbigpIHtcclxuXHRcdHZhciBtYXRyID0gY3JlYXRlJDIoKVxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG91dCwgdmlldywgcmlnaHQsIHVwKSB7XHJcblx0XHRcdG1hdHJbMF0gPSByaWdodFswXVxyXG5cdFx0XHRtYXRyWzNdID0gcmlnaHRbMV1cclxuXHRcdFx0bWF0cls2XSA9IHJpZ2h0WzJdXHJcblx0XHRcdG1hdHJbMV0gPSB1cFswXVxyXG5cdFx0XHRtYXRyWzRdID0gdXBbMV1cclxuXHRcdFx0bWF0cls3XSA9IHVwWzJdXHJcblx0XHRcdG1hdHJbMl0gPSAtdmlld1swXVxyXG5cdFx0XHRtYXRyWzVdID0gLXZpZXdbMV1cclxuXHRcdFx0bWF0cls4XSA9IC12aWV3WzJdXHJcblx0XHRcdHJldHVybiBub3JtYWxpemUkMihvdXQsIGZyb21NYXQzKG91dCwgbWF0cikpXHJcblx0XHR9XHJcblx0fSkoKVxyXG5cclxuXHR2YXIgcXVhdCA9IC8qI19fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSQ2LFxyXG5cdFx0aWRlbnRpdHk6IGlkZW50aXR5JDQsXHJcblx0XHRzZXRBeGlzQW5nbGU6IHNldEF4aXNBbmdsZSxcclxuXHRcdGdldEF4aXNBbmdsZTogZ2V0QXhpc0FuZ2xlLFxyXG5cdFx0bXVsdGlwbHk6IG11bHRpcGx5JDYsXHJcblx0XHRyb3RhdGVYOiByb3RhdGVYJDIsXHJcblx0XHRyb3RhdGVZOiByb3RhdGVZJDIsXHJcblx0XHRyb3RhdGVaOiByb3RhdGVaJDIsXHJcblx0XHRjYWxjdWxhdGVXOiBjYWxjdWxhdGVXLFxyXG5cdFx0c2xlcnA6IHNsZXJwLFxyXG5cdFx0cmFuZG9tOiByYW5kb20kMixcclxuXHRcdGludmVydDogaW52ZXJ0JDQsXHJcblx0XHRjb25qdWdhdGU6IGNvbmp1Z2F0ZSxcclxuXHRcdGZyb21NYXQzOiBmcm9tTWF0MyxcclxuXHRcdGZyb21FdWxlcjogZnJvbUV1bGVyLFxyXG5cdFx0c3RyOiBzdHIkNixcclxuXHRcdGNsb25lOiBjbG9uZSQ2LFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQ2LFxyXG5cdFx0Y29weTogY29weSQ2LFxyXG5cdFx0c2V0OiBzZXQkNixcclxuXHRcdGFkZDogYWRkJDYsXHJcblx0XHRtdWw6IG11bCQ2LFxyXG5cdFx0c2NhbGU6IHNjYWxlJDYsXHJcblx0XHRkb3Q6IGRvdCQyLFxyXG5cdFx0bGVycDogbGVycCQyLFxyXG5cdFx0bGVuZ3RoOiBsZW5ndGgkMixcclxuXHRcdGxlbjogbGVuJDIsXHJcblx0XHRzcXVhcmVkTGVuZ3RoOiBzcXVhcmVkTGVuZ3RoJDIsXHJcblx0XHRzcXJMZW46IHNxckxlbiQyLFxyXG5cdFx0bm9ybWFsaXplOiBub3JtYWxpemUkMixcclxuXHRcdGV4YWN0RXF1YWxzOiBleGFjdEVxdWFscyQ2LFxyXG5cdFx0ZXF1YWxzOiBlcXVhbHMkNyxcclxuXHRcdHJvdGF0aW9uVG86IHJvdGF0aW9uVG8sXHJcblx0XHRzcWxlcnA6IHNxbGVycCxcclxuXHRcdHNldEF4ZXM6IHNldEF4ZXMsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogRHVhbCBRdWF0ZXJuaW9uPGJyPlxyXG5cdCAqIEZvcm1hdDogW3JlYWwsIGR1YWxdPGJyPlxyXG5cdCAqIFF1YXRlcm5pb24gZm9ybWF0OiBYWVpXPGJyPlxyXG5cdCAqIE1ha2Ugc3VyZSB0byBoYXZlIG5vcm1hbGl6ZWQgZHVhbCBxdWF0ZXJuaW9ucywgb3RoZXJ3aXNlIHRoZSBmdW5jdGlvbnMgbWF5IG5vdCB3b3JrIGFzIGludGVuZGVkLjxicj5cclxuXHQgKiBAbW9kdWxlIHF1YXQyXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgZHVhbCBxdWF0XHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IGEgbmV3IGR1YWwgcXVhdGVybmlvbiBbcmVhbCAtPiByb3RhdGlvbiwgZHVhbCAtPiB0cmFuc2xhdGlvbl1cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY3JlYXRlJDcoKSB7XHJcblx0XHR2YXIgZHEgPSBuZXcgQVJSQVlfVFlQRSg4KVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRkcVswXSA9IDBcclxuXHRcdFx0ZHFbMV0gPSAwXHJcblx0XHRcdGRxWzJdID0gMFxyXG5cdFx0XHRkcVs0XSA9IDBcclxuXHRcdFx0ZHFbNV0gPSAwXHJcblx0XHRcdGRxWzZdID0gMFxyXG5cdFx0XHRkcVs3XSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRkcVszXSA9IDFcclxuXHRcdHJldHVybiBkcVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdGVybmlvbiB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gbmV3IGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjbG9uZSQ3KGEpIHtcclxuXHRcdHZhciBkcSA9IG5ldyBBUlJBWV9UWVBFKDgpXHJcblx0XHRkcVswXSA9IGFbMF1cclxuXHRcdGRxWzFdID0gYVsxXVxyXG5cdFx0ZHFbMl0gPSBhWzJdXHJcblx0XHRkcVszXSA9IGFbM11cclxuXHRcdGRxWzRdID0gYVs0XVxyXG5cdFx0ZHFbNV0gPSBhWzVdXHJcblx0XHRkcVs2XSA9IGFbNl1cclxuXHRcdGRxWzddID0gYVs3XVxyXG5cdFx0cmV0dXJuIGRxXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgZHVhbCBxdWF0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHgxIFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkxIFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcxIFcgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHgyIFggY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkyIFkgY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHoyIFogY29tcG9uZW50XHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHcyIFcgY29tcG9uZW50XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBuZXcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21WYWx1ZXMkNyh4MSwgeTEsIHoxLCB3MSwgeDIsIHkyLCB6MiwgdzIpIHtcclxuXHRcdHZhciBkcSA9IG5ldyBBUlJBWV9UWVBFKDgpXHJcblx0XHRkcVswXSA9IHgxXHJcblx0XHRkcVsxXSA9IHkxXHJcblx0XHRkcVsyXSA9IHoxXHJcblx0XHRkcVszXSA9IHcxXHJcblx0XHRkcVs0XSA9IHgyXHJcblx0XHRkcVs1XSA9IHkyXHJcblx0XHRkcVs2XSA9IHoyXHJcblx0XHRkcVs3XSA9IHcyXHJcblx0XHRyZXR1cm4gZHFcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBkdWFsIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gdmFsdWVzIChxdWF0IGFuZCB0cmFuc2xhdGlvbilcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4MSBYIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB6MSBaIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB3MSBXIGNvbXBvbmVudFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudCAodHJhbnNsYXRpb24pXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHkyIFkgY29tcG9uZW50ICh0cmFuc2xhdGlvbilcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gejIgWiBjb21wb25lbnQgKHRyYW5zbGF0aW9uKVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gbmV3IGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblZhbHVlcyh4MSwgeTEsIHoxLCB3MSwgeDIsIHkyLCB6Mikge1xyXG5cdFx0dmFyIGRxID0gbmV3IEFSUkFZX1RZUEUoOClcclxuXHRcdGRxWzBdID0geDFcclxuXHRcdGRxWzFdID0geTFcclxuXHRcdGRxWzJdID0gejFcclxuXHRcdGRxWzNdID0gdzFcclxuXHRcdHZhciBheCA9IHgyICogMC41LFxyXG5cdFx0XHRheSA9IHkyICogMC41LFxyXG5cdFx0XHRheiA9IHoyICogMC41XHJcblx0XHRkcVs0XSA9IGF4ICogdzEgKyBheSAqIHoxIC0gYXogKiB5MVxyXG5cdFx0ZHFbNV0gPSBheSAqIHcxICsgYXogKiB4MSAtIGF4ICogejFcclxuXHRcdGRxWzZdID0gYXogKiB3MSArIGF4ICogeTEgLSBheSAqIHgxXHJcblx0XHRkcVs3XSA9IC1heCAqIHgxIC0gYXkgKiB5MSAtIGF6ICogejFcclxuXHRcdHJldHVybiBkcVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgZHVhbCBxdWF0IGZyb20gYSBxdWF0ZXJuaW9uIGFuZCBhIHRyYW5zbGF0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7dmVjM30gdCB0cmFubGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uJDEob3V0LCBxLCB0KSB7XHJcblx0XHR2YXIgYXggPSB0WzBdICogMC41LFxyXG5cdFx0XHRheSA9IHRbMV0gKiAwLjUsXHJcblx0XHRcdGF6ID0gdFsyXSAqIDAuNSxcclxuXHRcdFx0YnggPSBxWzBdLFxyXG5cdFx0XHRieSA9IHFbMV0sXHJcblx0XHRcdGJ6ID0gcVsyXSxcclxuXHRcdFx0YncgPSBxWzNdXHJcblx0XHRvdXRbMF0gPSBieFxyXG5cdFx0b3V0WzFdID0gYnlcclxuXHRcdG91dFsyXSA9IGJ6XHJcblx0XHRvdXRbM10gPSBid1xyXG5cdFx0b3V0WzRdID0gYXggKiBidyArIGF5ICogYnogLSBheiAqIGJ5XHJcblx0XHRvdXRbNV0gPSBheSAqIGJ3ICsgYXogKiBieCAtIGF4ICogYnpcclxuXHRcdG91dFs2XSA9IGF6ICogYncgKyBheCAqIGJ5IC0gYXkgKiBieFxyXG5cdFx0b3V0WzddID0gLWF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgZHVhbCBxdWF0IGZyb20gYSB0cmFuc2xhdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQHBhcmFtIHt2ZWMzfSB0IHRyYW5zbGF0aW9uIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbiQzKG91dCwgdCkge1xyXG5cdFx0b3V0WzBdID0gMFxyXG5cdFx0b3V0WzFdID0gMFxyXG5cdFx0b3V0WzJdID0gMFxyXG5cdFx0b3V0WzNdID0gMVxyXG5cdFx0b3V0WzRdID0gdFswXSAqIDAuNVxyXG5cdFx0b3V0WzVdID0gdFsxXSAqIDAuNVxyXG5cdFx0b3V0WzZdID0gdFsyXSAqIDAuNVxyXG5cdFx0b3V0WzddID0gMFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgZHVhbCBxdWF0IGZyb20gYSBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgdGhlIHF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmcm9tUm90YXRpb24kNChvdXQsIHEpIHtcclxuXHRcdG91dFswXSA9IHFbMF1cclxuXHRcdG91dFsxXSA9IHFbMV1cclxuXHRcdG91dFsyXSA9IHFbMl1cclxuXHRcdG91dFszXSA9IHFbM11cclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBkdWFsIHF1YXQgZnJvbSBhIG1hdHJpeCAoNHg0KVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZyb21NYXQ0JDEob3V0LCBhKSB7XHJcblx0XHQvL1RPRE8gT3B0aW1pemUgdGhpc1xyXG5cdFx0dmFyIG91dGVyID0gY3JlYXRlJDYoKVxyXG5cdFx0Z2V0Um90YXRpb24ob3V0ZXIsIGEpXHJcblx0XHR2YXIgdCA9IG5ldyBBUlJBWV9UWVBFKDMpXHJcblx0XHRnZXRUcmFuc2xhdGlvbih0LCBhKVxyXG5cdFx0ZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24kMShvdXQsIG91dGVyLCB0KVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgZHVhbCBxdWF0IHRvIGFub3RoZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIHNvdXJjZSBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb3B5JDcob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdXHJcblx0XHRvdXRbMl0gPSBhWzJdXHJcblx0XHRvdXRbM10gPSBhWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdXHJcblx0XHRvdXRbNV0gPSBhWzVdXHJcblx0XHRvdXRbNl0gPSBhWzZdXHJcblx0XHRvdXRbN10gPSBhWzddXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCBhIGR1YWwgcXVhdCB0byB0aGUgaWRlbnRpdHkgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkkNShvdXQpIHtcclxuXHRcdG91dFswXSA9IDBcclxuXHRcdG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IDBcclxuXHRcdG91dFszXSA9IDFcclxuXHRcdG91dFs0XSA9IDBcclxuXHRcdG91dFs1XSA9IDBcclxuXHRcdG91dFs2XSA9IDBcclxuXHRcdG91dFs3XSA9IDBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgZHVhbCBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge051bWJlcn0geDEgWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTEgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gejEgWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdzEgVyBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geDIgWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gejIgWiBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gdzIgVyBjb21wb25lbnRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXQkNyhvdXQsIHgxLCB5MSwgejEsIHcxLCB4MiwgeTIsIHoyLCB3Mikge1xyXG5cdFx0b3V0WzBdID0geDFcclxuXHRcdG91dFsxXSA9IHkxXHJcblx0XHRvdXRbMl0gPSB6MVxyXG5cdFx0b3V0WzNdID0gdzFcclxuXHRcdG91dFs0XSA9IHgyXHJcblx0XHRvdXRbNV0gPSB5MlxyXG5cdFx0b3V0WzZdID0gejJcclxuXHRcdG91dFs3XSA9IHcyXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIHJlYWwgcGFydCBvZiBhIGR1YWwgcXVhdFxyXG5cdCAqIEBwYXJhbSAge3F1YXR9IG91dCByZWFsIHBhcnRcclxuXHQgKiBAcGFyYW0gIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cclxuXHQgKiBAcmV0dXJuIHtxdWF0fSByZWFsIHBhcnRcclxuXHQgKi9cclxuXHJcblx0dmFyIGdldFJlYWwgPSBjb3B5JDZcclxuXHQvKipcclxuXHQgKiBHZXRzIHRoZSBkdWFsIHBhcnQgb2YgYSBkdWFsIHF1YXRcclxuXHQgKiBAcGFyYW0gIHtxdWF0fSBvdXQgZHVhbCBwYXJ0XHJcblx0ICogQHBhcmFtICB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uXHJcblx0ICogQHJldHVybiB7cXVhdH0gZHVhbCBwYXJ0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGdldER1YWwob3V0LCBhKSB7XHJcblx0XHRvdXRbMF0gPSBhWzRdXHJcblx0XHRvdXRbMV0gPSBhWzVdXHJcblx0XHRvdXRbMl0gPSBhWzZdXHJcblx0XHRvdXRbM10gPSBhWzddXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgcmVhbCBjb21wb25lbnQgb2YgYSBkdWFsIHF1YXQgdG8gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXR9IHEgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcmVhbCBwYXJ0XHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHNldFJlYWwgPSBjb3B5JDZcclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGR1YWwgY29tcG9uZW50IG9mIGEgZHVhbCBxdWF0IHRvIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0fSBxIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIGR1YWwgcGFydFxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNldER1YWwob3V0LCBxKSB7XHJcblx0XHRvdXRbNF0gPSBxWzBdXHJcblx0XHRvdXRbNV0gPSBxWzFdXHJcblx0XHRvdXRbNl0gPSBxWzJdXHJcblx0XHRvdXRbN10gPSBxWzNdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIHRyYW5zbGF0aW9uIG9mIGEgbm9ybWFsaXplZCBkdWFsIHF1YXRcclxuXHQgKiBAcGFyYW0gIHt2ZWMzfSBvdXQgdHJhbnNsYXRpb25cclxuXHQgKiBAcGFyYW0gIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb24gdG8gYmUgZGVjb21wb3NlZFxyXG5cdCAqIEByZXR1cm4ge3ZlYzN9IHRyYW5zbGF0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uJDEob3V0LCBhKSB7XHJcblx0XHR2YXIgYXggPSBhWzRdLFxyXG5cdFx0XHRheSA9IGFbNV0sXHJcblx0XHRcdGF6ID0gYVs2XSxcclxuXHRcdFx0YXcgPSBhWzddLFxyXG5cdFx0XHRieCA9IC1hWzBdLFxyXG5cdFx0XHRieSA9IC1hWzFdLFxyXG5cdFx0XHRieiA9IC1hWzJdLFxyXG5cdFx0XHRidyA9IGFbM11cclxuXHRcdG91dFswXSA9IChheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5KSAqIDJcclxuXHRcdG91dFsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDJcclxuXHRcdG91dFsyXSA9IChheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4KSAqIDJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNsYXRlcyBhIGR1YWwgcXVhdCBieSB0aGUgZ2l2ZW4gdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gdHJhbnNsYXRlXHJcblx0ICogQHBhcmFtIHt2ZWMzfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2xhdGUkMyhvdXQsIGEsIHYpIHtcclxuXHRcdHZhciBheDEgPSBhWzBdLFxyXG5cdFx0XHRheTEgPSBhWzFdLFxyXG5cdFx0XHRhejEgPSBhWzJdLFxyXG5cdFx0XHRhdzEgPSBhWzNdLFxyXG5cdFx0XHRieDEgPSB2WzBdICogMC41LFxyXG5cdFx0XHRieTEgPSB2WzFdICogMC41LFxyXG5cdFx0XHRiejEgPSB2WzJdICogMC41LFxyXG5cdFx0XHRheDIgPSBhWzRdLFxyXG5cdFx0XHRheTIgPSBhWzVdLFxyXG5cdFx0XHRhejIgPSBhWzZdLFxyXG5cdFx0XHRhdzIgPSBhWzddXHJcblx0XHRvdXRbMF0gPSBheDFcclxuXHRcdG91dFsxXSA9IGF5MVxyXG5cdFx0b3V0WzJdID0gYXoxXHJcblx0XHRvdXRbM10gPSBhdzFcclxuXHRcdG91dFs0XSA9IGF3MSAqIGJ4MSArIGF5MSAqIGJ6MSAtIGF6MSAqIGJ5MSArIGF4MlxyXG5cdFx0b3V0WzVdID0gYXcxICogYnkxICsgYXoxICogYngxIC0gYXgxICogYnoxICsgYXkyXHJcblx0XHRvdXRbNl0gPSBhdzEgKiBiejEgKyBheDEgKiBieTEgLSBheTEgKiBieDEgKyBhejJcclxuXHRcdG91dFs3XSA9IC1heDEgKiBieDEgLSBheTEgKiBieTEgLSBhejEgKiBiejEgKyBhdzJcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgdGhlIFggYXhpc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWQgaG93IGZhciBzaG91bGQgdGhlIHJvdGF0aW9uIGJlXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlWCQzKG91dCwgYSwgcmFkKSB7XHJcblx0XHR2YXIgYnggPSAtYVswXSxcclxuXHRcdFx0YnkgPSAtYVsxXSxcclxuXHRcdFx0YnogPSAtYVsyXSxcclxuXHRcdFx0YncgPSBhWzNdLFxyXG5cdFx0XHRheCA9IGFbNF0sXHJcblx0XHRcdGF5ID0gYVs1XSxcclxuXHRcdFx0YXogPSBhWzZdLFxyXG5cdFx0XHRhdyA9IGFbN10sXHJcblx0XHRcdGF4MSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnksXHJcblx0XHRcdGF5MSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnosXHJcblx0XHRcdGF6MSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngsXHJcblx0XHRcdGF3MSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYnpcclxuXHRcdHJvdGF0ZVgkMihvdXQsIGEsIHJhZClcclxuXHRcdGJ4ID0gb3V0WzBdXHJcblx0XHRieSA9IG91dFsxXVxyXG5cdFx0YnogPSBvdXRbMl1cclxuXHRcdGJ3ID0gb3V0WzNdXHJcblx0XHRvdXRbNF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieVxyXG5cdFx0b3V0WzVdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYnpcclxuXHRcdG91dFs2XSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4XHJcblx0XHRvdXRbN10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBielxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCB0aGUgWSBheGlzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZCBob3cgZmFyIHNob3VsZCB0aGUgcm90YXRpb24gYmVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVZJDMob3V0LCBhLCByYWQpIHtcclxuXHRcdHZhciBieCA9IC1hWzBdLFxyXG5cdFx0XHRieSA9IC1hWzFdLFxyXG5cdFx0XHRieiA9IC1hWzJdLFxyXG5cdFx0XHRidyA9IGFbM10sXHJcblx0XHRcdGF4ID0gYVs0XSxcclxuXHRcdFx0YXkgPSBhWzVdLFxyXG5cdFx0XHRheiA9IGFbNl0sXHJcblx0XHRcdGF3ID0gYVs3XSxcclxuXHRcdFx0YXgxID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSxcclxuXHRcdFx0YXkxID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieixcclxuXHRcdFx0YXoxID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCxcclxuXHRcdFx0YXcxID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBielxyXG5cdFx0cm90YXRlWSQyKG91dCwgYSwgcmFkKVxyXG5cdFx0YnggPSBvdXRbMF1cclxuXHRcdGJ5ID0gb3V0WzFdXHJcblx0XHRieiA9IG91dFsyXVxyXG5cdFx0YncgPSBvdXRbM11cclxuXHRcdG91dFs0XSA9IGF4MSAqIGJ3ICsgYXcxICogYnggKyBheTEgKiBieiAtIGF6MSAqIGJ5XHJcblx0XHRvdXRbNV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBielxyXG5cdFx0b3V0WzZdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYnhcclxuXHRcdG91dFs3XSA9IGF3MSAqIGJ3IC0gYXgxICogYnggLSBheTEgKiBieSAtIGF6MSAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYXJvdW5kIHRoZSBaIGF4aXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmFkIGhvdyBmYXIgc2hvdWxkIHRoZSByb3RhdGlvbiBiZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZVokMyhvdXQsIGEsIHJhZCkge1xyXG5cdFx0dmFyIGJ4ID0gLWFbMF0sXHJcblx0XHRcdGJ5ID0gLWFbMV0sXHJcblx0XHRcdGJ6ID0gLWFbMl0sXHJcblx0XHRcdGJ3ID0gYVszXSxcclxuXHRcdFx0YXggPSBhWzRdLFxyXG5cdFx0XHRheSA9IGFbNV0sXHJcblx0XHRcdGF6ID0gYVs2XSxcclxuXHRcdFx0YXcgPSBhWzddLFxyXG5cdFx0XHRheDEgPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5LFxyXG5cdFx0XHRheTEgPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6LFxyXG5cdFx0XHRhejEgPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4LFxyXG5cdFx0XHRhdzEgPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6XHJcblx0XHRyb3RhdGVaJDIob3V0LCBhLCByYWQpXHJcblx0XHRieCA9IG91dFswXVxyXG5cdFx0YnkgPSBvdXRbMV1cclxuXHRcdGJ6ID0gb3V0WzJdXHJcblx0XHRidyA9IG91dFszXVxyXG5cdFx0b3V0WzRdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnlcclxuXHRcdG91dFs1XSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6XHJcblx0XHRvdXRbNl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieFxyXG5cdFx0b3V0WzddID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIGR1YWwgcXVhdCBieSBhIGdpdmVuIHF1YXRlcm5pb24gKGEgKiBxKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHJvdGF0ZSBieVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHJvdGF0ZUJ5UXVhdEFwcGVuZChvdXQsIGEsIHEpIHtcclxuXHRcdHZhciBxeCA9IHFbMF0sXHJcblx0XHRcdHF5ID0gcVsxXSxcclxuXHRcdFx0cXogPSBxWzJdLFxyXG5cdFx0XHRxdyA9IHFbM10sXHJcblx0XHRcdGF4ID0gYVswXSxcclxuXHRcdFx0YXkgPSBhWzFdLFxyXG5cdFx0XHRheiA9IGFbMl0sXHJcblx0XHRcdGF3ID0gYVszXVxyXG5cdFx0b3V0WzBdID0gYXggKiBxdyArIGF3ICogcXggKyBheSAqIHF6IC0gYXogKiBxeVxyXG5cdFx0b3V0WzFdID0gYXkgKiBxdyArIGF3ICogcXkgKyBheiAqIHF4IC0gYXggKiBxelxyXG5cdFx0b3V0WzJdID0gYXogKiBxdyArIGF3ICogcXogKyBheCAqIHF5IC0gYXkgKiBxeFxyXG5cdFx0b3V0WzNdID0gYXcgKiBxdyAtIGF4ICogcXggLSBheSAqIHF5IC0gYXogKiBxelxyXG5cdFx0YXggPSBhWzRdXHJcblx0XHRheSA9IGFbNV1cclxuXHRcdGF6ID0gYVs2XVxyXG5cdFx0YXcgPSBhWzddXHJcblx0XHRvdXRbNF0gPSBheCAqIHF3ICsgYXcgKiBxeCArIGF5ICogcXogLSBheiAqIHF5XHJcblx0XHRvdXRbNV0gPSBheSAqIHF3ICsgYXcgKiBxeSArIGF6ICogcXggLSBheCAqIHF6XHJcblx0XHRvdXRbNl0gPSBheiAqIHF3ICsgYXcgKiBxeiArIGF4ICogcXkgLSBheSAqIHF4XHJcblx0XHRvdXRbN10gPSBhdyAqIHF3IC0gYXggKiBxeCAtIGF5ICogcXkgLSBheiAqIHF6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYnkgYSBnaXZlbiBxdWF0ZXJuaW9uIChxICogYSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHJvdGF0ZSBieVxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3RhdGVCeVF1YXRQcmVwZW5kKG91dCwgcSwgYSkge1xyXG5cdFx0dmFyIHF4ID0gcVswXSxcclxuXHRcdFx0cXkgPSBxWzFdLFxyXG5cdFx0XHRxeiA9IHFbMl0sXHJcblx0XHRcdHF3ID0gcVszXSxcclxuXHRcdFx0YnggPSBhWzBdLFxyXG5cdFx0XHRieSA9IGFbMV0sXHJcblx0XHRcdGJ6ID0gYVsyXSxcclxuXHRcdFx0YncgPSBhWzNdXHJcblx0XHRvdXRbMF0gPSBxeCAqIGJ3ICsgcXcgKiBieCArIHF5ICogYnogLSBxeiAqIGJ5XHJcblx0XHRvdXRbMV0gPSBxeSAqIGJ3ICsgcXcgKiBieSArIHF6ICogYnggLSBxeCAqIGJ6XHJcblx0XHRvdXRbMl0gPSBxeiAqIGJ3ICsgcXcgKiBieiArIHF4ICogYnkgLSBxeSAqIGJ4XHJcblx0XHRvdXRbM10gPSBxdyAqIGJ3IC0gcXggKiBieCAtIHF5ICogYnkgLSBxeiAqIGJ6XHJcblx0XHRieCA9IGFbNF1cclxuXHRcdGJ5ID0gYVs1XVxyXG5cdFx0YnogPSBhWzZdXHJcblx0XHRidyA9IGFbN11cclxuXHRcdG91dFs0XSA9IHF4ICogYncgKyBxdyAqIGJ4ICsgcXkgKiBieiAtIHF6ICogYnlcclxuXHRcdG91dFs1XSA9IHF5ICogYncgKyBxdyAqIGJ5ICsgcXogKiBieCAtIHF4ICogYnpcclxuXHRcdG91dFs2XSA9IHF6ICogYncgKyBxdyAqIGJ6ICsgcXggKiBieSAtIHF5ICogYnhcclxuXHRcdG91dFs3XSA9IHF3ICogYncgLSBxeCAqIGJ4IC0gcXkgKiBieSAtIHF6ICogYnpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgYSBnaXZlbiBheGlzLiBEb2VzIHRoZSBub3JtYWxpc2F0aW9uIGF1dG9tYXRpY2FsbHlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByYWQgaG93IGZhciB0aGUgcm90YXRpb24gc2hvdWxkIGJlXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlQXJvdW5kQXhpcyhvdXQsIGEsIGF4aXMsIHJhZCkge1xyXG5cdFx0Ly9TcGVjaWFsIGNhc2UgZm9yIHJhZCA9IDBcclxuXHRcdGlmIChNYXRoLmFicyhyYWQpIDwgRVBTSUxPTikge1xyXG5cdFx0XHRyZXR1cm4gY29weSQ3KG91dCwgYSlcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgYXhpc0xlbmd0aCA9IE1hdGguc3FydChheGlzWzBdICogYXhpc1swXSArIGF4aXNbMV0gKiBheGlzWzFdICsgYXhpc1syXSAqIGF4aXNbMl0pXHJcblx0XHRyYWQgPSByYWQgKiAwLjVcclxuXHRcdHZhciBzID0gTWF0aC5zaW4ocmFkKVxyXG5cdFx0dmFyIGJ4ID0gKHMgKiBheGlzWzBdKSAvIGF4aXNMZW5ndGhcclxuXHRcdHZhciBieSA9IChzICogYXhpc1sxXSkgLyBheGlzTGVuZ3RoXHJcblx0XHR2YXIgYnogPSAocyAqIGF4aXNbMl0pIC8gYXhpc0xlbmd0aFxyXG5cdFx0dmFyIGJ3ID0gTWF0aC5jb3MocmFkKVxyXG5cdFx0dmFyIGF4MSA9IGFbMF0sXHJcblx0XHRcdGF5MSA9IGFbMV0sXHJcblx0XHRcdGF6MSA9IGFbMl0sXHJcblx0XHRcdGF3MSA9IGFbM11cclxuXHRcdG91dFswXSA9IGF4MSAqIGJ3ICsgYXcxICogYnggKyBheTEgKiBieiAtIGF6MSAqIGJ5XHJcblx0XHRvdXRbMV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBielxyXG5cdFx0b3V0WzJdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYnhcclxuXHRcdG91dFszXSA9IGF3MSAqIGJ3IC0gYXgxICogYnggLSBheTEgKiBieSAtIGF6MSAqIGJ6XHJcblx0XHR2YXIgYXggPSBhWzRdLFxyXG5cdFx0XHRheSA9IGFbNV0sXHJcblx0XHRcdGF6ID0gYVs2XSxcclxuXHRcdFx0YXcgPSBhWzddXHJcblx0XHRvdXRbNF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5XHJcblx0XHRvdXRbNV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6XHJcblx0XHRvdXRbNl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4XHJcblx0XHRvdXRbN10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIGR1YWwgcXVhdCdzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkNyhvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0b3V0WzJdID0gYVsyXSArIGJbMl1cclxuXHRcdG91dFszXSA9IGFbM10gKyBiWzNdXHJcblx0XHRvdXRbNF0gPSBhWzRdICsgYls0XVxyXG5cdFx0b3V0WzVdID0gYVs1XSArIGJbNV1cclxuXHRcdG91dFs2XSA9IGFbNl0gKyBiWzZdXHJcblx0XHRvdXRbN10gPSBhWzddICsgYls3XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNdWx0aXBsaWVzIHR3byBkdWFsIHF1YXQnc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbXVsdGlwbHkkNyhvdXQsIGEsIGIpIHtcclxuXHRcdHZhciBheDAgPSBhWzBdLFxyXG5cdFx0XHRheTAgPSBhWzFdLFxyXG5cdFx0XHRhejAgPSBhWzJdLFxyXG5cdFx0XHRhdzAgPSBhWzNdLFxyXG5cdFx0XHRieDEgPSBiWzRdLFxyXG5cdFx0XHRieTEgPSBiWzVdLFxyXG5cdFx0XHRiejEgPSBiWzZdLFxyXG5cdFx0XHRidzEgPSBiWzddLFxyXG5cdFx0XHRheDEgPSBhWzRdLFxyXG5cdFx0XHRheTEgPSBhWzVdLFxyXG5cdFx0XHRhejEgPSBhWzZdLFxyXG5cdFx0XHRhdzEgPSBhWzddLFxyXG5cdFx0XHRieDAgPSBiWzBdLFxyXG5cdFx0XHRieTAgPSBiWzFdLFxyXG5cdFx0XHRiejAgPSBiWzJdLFxyXG5cdFx0XHRidzAgPSBiWzNdXHJcblx0XHRvdXRbMF0gPSBheDAgKiBidzAgKyBhdzAgKiBieDAgKyBheTAgKiBiejAgLSBhejAgKiBieTBcclxuXHRcdG91dFsxXSA9IGF5MCAqIGJ3MCArIGF3MCAqIGJ5MCArIGF6MCAqIGJ4MCAtIGF4MCAqIGJ6MFxyXG5cdFx0b3V0WzJdID0gYXowICogYncwICsgYXcwICogYnowICsgYXgwICogYnkwIC0gYXkwICogYngwXHJcblx0XHRvdXRbM10gPSBhdzAgKiBidzAgLSBheDAgKiBieDAgLSBheTAgKiBieTAgLSBhejAgKiBiejBcclxuXHRcdG91dFs0XSA9XHJcblx0XHRcdGF4MCAqIGJ3MSArIGF3MCAqIGJ4MSArIGF5MCAqIGJ6MSAtIGF6MCAqIGJ5MSArIGF4MSAqIGJ3MCArIGF3MSAqIGJ4MCArIGF5MSAqIGJ6MCAtIGF6MSAqIGJ5MFxyXG5cdFx0b3V0WzVdID1cclxuXHRcdFx0YXkwICogYncxICsgYXcwICogYnkxICsgYXowICogYngxIC0gYXgwICogYnoxICsgYXkxICogYncwICsgYXcxICogYnkwICsgYXoxICogYngwIC0gYXgxICogYnowXHJcblx0XHRvdXRbNl0gPVxyXG5cdFx0XHRhejAgKiBidzEgKyBhdzAgKiBiejEgKyBheDAgKiBieTEgLSBheTAgKiBieDEgKyBhejEgKiBidzAgKyBhdzEgKiBiejAgKyBheDEgKiBieTAgLSBheTEgKiBieDBcclxuXHRcdG91dFs3XSA9XHJcblx0XHRcdGF3MCAqIGJ3MSAtIGF4MCAqIGJ4MSAtIGF5MCAqIGJ5MSAtIGF6MCAqIGJ6MSArIGF3MSAqIGJ3MCAtIGF4MSAqIGJ4MCAtIGF5MSAqIGJ5MCAtIGF6MSAqIGJ6MFxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQyLm11bHRpcGx5fVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbXVsJDcgPSBtdWx0aXBseSQ3XHJcblx0LyoqXHJcblx0ICogU2NhbGVzIGEgZHVhbCBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0XHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZHVhbCBxdWF0IHRvIHNjYWxlXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBkdWFsIHF1YXQgYnlcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQ3KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRvdXRbMl0gPSBhWzJdICogYlxyXG5cdFx0b3V0WzNdID0gYVszXSAqIGJcclxuXHRcdG91dFs0XSA9IGFbNF0gKiBiXHJcblx0XHRvdXRbNV0gPSBhWzVdICogYlxyXG5cdFx0b3V0WzZdID0gYVs2XSAqIGJcclxuXHRcdG91dFs3XSA9IGFbN10gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBkdWFsIHF1YXQncyAoVGhlIGRvdCBwcm9kdWN0IG9mIHRoZSByZWFsIHBhcnRzKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZG90JDMgPSBkb3QkMlxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gZHVhbCBxdWF0cydzXHJcblx0ICogTk9URTogVGhlIHJlc3VsdGluZyBkdWFsIHF1YXRlcm5pb25zIHdvbid0IGFsd2F5cyBiZSBub3JtYWxpemVkIChUaGUgZXJyb3IgaXMgbW9zdCBub3RpY2VhYmxlIHdoZW4gdCA9IDAuNSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdFxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBsZXJwJDMob3V0LCBhLCBiLCB0KSB7XHJcblx0XHR2YXIgbXQgPSAxIC0gdFxyXG5cdFx0aWYgKGRvdCQzKGEsIGIpIDwgMCkgdCA9IC10XHJcblx0XHRvdXRbMF0gPSBhWzBdICogbXQgKyBiWzBdICogdFxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIG10ICsgYlsxXSAqIHRcclxuXHRcdG91dFsyXSA9IGFbMl0gKiBtdCArIGJbMl0gKiB0XHJcblx0XHRvdXRbM10gPSBhWzNdICogbXQgKyBiWzNdICogdFxyXG5cdFx0b3V0WzRdID0gYVs0XSAqIG10ICsgYls0XSAqIHRcclxuXHRcdG91dFs1XSA9IGFbNV0gKiBtdCArIGJbNV0gKiB0XHJcblx0XHRvdXRbNl0gPSBhWzZdICogbXQgKyBiWzZdICogdFxyXG5cdFx0b3V0WzddID0gYVs3XSAqIG10ICsgYls3XSAqIHRcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIGR1YWwgcXVhdC4gSWYgdGhleSBhcmUgbm9ybWFsaXplZCwgY29uanVnYXRlIGlzIGNoZWFwZXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXHJcblx0ICogQHJldHVybnMge3F1YXQyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJ0JDUob3V0LCBhKSB7XHJcblx0XHR2YXIgc3FsZW4gPSBzcXVhcmVkTGVuZ3RoJDMoYSlcclxuXHRcdG91dFswXSA9IC1hWzBdIC8gc3FsZW5cclxuXHRcdG91dFsxXSA9IC1hWzFdIC8gc3FsZW5cclxuXHRcdG91dFsyXSA9IC1hWzJdIC8gc3FsZW5cclxuXHRcdG91dFszXSA9IGFbM10gLyBzcWxlblxyXG5cdFx0b3V0WzRdID0gLWFbNF0gLyBzcWxlblxyXG5cdFx0b3V0WzVdID0gLWFbNV0gLyBzcWxlblxyXG5cdFx0b3V0WzZdID0gLWFbNl0gLyBzcWxlblxyXG5cdFx0b3V0WzddID0gYVs3XSAvIHNxbGVuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIGR1YWwgcXVhdFxyXG5cdCAqIElmIHRoZSBkdWFsIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0Mi5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcclxuXHQgKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb25qdWdhdGUkMShvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IC1hWzBdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0b3V0WzJdID0gLWFbMl1cclxuXHRcdG91dFszXSA9IGFbM11cclxuXHRcdG91dFs0XSA9IC1hWzRdXHJcblx0XHRvdXRbNV0gPSAtYVs1XVxyXG5cdFx0b3V0WzZdID0gLWFbNl1cclxuXHRcdG91dFs3XSA9IGFbN11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgZHVhbCBxdWF0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbmd0aCQzID0gbGVuZ3RoJDJcclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQyLmxlbmd0aH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIGxlbiQzID0gbGVuZ3RoJDNcclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIGR1YWwgcXVhdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtxdWF0Mn0gYSBkdWFsIHF1YXQgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXHJcblx0ICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3F1YXJlZExlbmd0aCQzID0gc3F1YXJlZExlbmd0aCQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayBxdWF0Mi5zcXVhcmVkTGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyTGVuJDMgPSBzcXVhcmVkTGVuZ3RoJDNcclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSBkdWFsIHF1YXRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxyXG5cdCAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZSQzKG91dCwgYSkge1xyXG5cdFx0dmFyIG1hZ25pdHVkZSA9IHNxdWFyZWRMZW5ndGgkMyhhKVxyXG5cclxuXHRcdGlmIChtYWduaXR1ZGUgPiAwKSB7XHJcblx0XHRcdG1hZ25pdHVkZSA9IE1hdGguc3FydChtYWduaXR1ZGUpXHJcblx0XHRcdHZhciBhMCA9IGFbMF0gLyBtYWduaXR1ZGVcclxuXHRcdFx0dmFyIGExID0gYVsxXSAvIG1hZ25pdHVkZVxyXG5cdFx0XHR2YXIgYTIgPSBhWzJdIC8gbWFnbml0dWRlXHJcblx0XHRcdHZhciBhMyA9IGFbM10gLyBtYWduaXR1ZGVcclxuXHRcdFx0dmFyIGIwID0gYVs0XVxyXG5cdFx0XHR2YXIgYjEgPSBhWzVdXHJcblx0XHRcdHZhciBiMiA9IGFbNl1cclxuXHRcdFx0dmFyIGIzID0gYVs3XVxyXG5cdFx0XHR2YXIgYV9kb3RfYiA9IGEwICogYjAgKyBhMSAqIGIxICsgYTIgKiBiMiArIGEzICogYjNcclxuXHRcdFx0b3V0WzBdID0gYTBcclxuXHRcdFx0b3V0WzFdID0gYTFcclxuXHRcdFx0b3V0WzJdID0gYTJcclxuXHRcdFx0b3V0WzNdID0gYTNcclxuXHRcdFx0b3V0WzRdID0gKGIwIC0gYTAgKiBhX2RvdF9iKSAvIG1hZ25pdHVkZVxyXG5cdFx0XHRvdXRbNV0gPSAoYjEgLSBhMSAqIGFfZG90X2IpIC8gbWFnbml0dWRlXHJcblx0XHRcdG91dFs2XSA9IChiMiAtIGEyICogYV9kb3RfYikgLyBtYWduaXR1ZGVcclxuXHRcdFx0b3V0WzddID0gKGIzIC0gYTMgKiBhX2RvdF9iKSAvIG1hZ25pdHVkZVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIGR1YWwgcXVhdGVuaW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBhIGR1YWwgcXVhdGVybmlvbiB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGR1YWwgcXVhdFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkNyhhKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHQncXVhdDIoJyArXHJcblx0XHRcdGFbMF0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVsxXSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzJdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbM10gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs0XSArXHJcblx0XHRcdCcsICcgK1xyXG5cdFx0XHRhWzVdICtcclxuXHRcdFx0JywgJyArXHJcblx0XHRcdGFbNl0gK1xyXG5cdFx0XHQnLCAnICtcclxuXHRcdFx0YVs3XSArXHJcblx0XHRcdCcpJ1xyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBkdWFsIHF1YXRlcm5pb25zIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IGR1YWwgcXVhdGVybmlvbi5cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgZHVhbCBxdWF0ZXJuaW9uLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSB0cnVlIGlmIHRoZSBkdWFsIHF1YXRlcm5pb25zIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBleGFjdEVxdWFscyQ3KGEsIGIpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdGFbMF0gPT09IGJbMF0gJiZcclxuXHRcdFx0YVsxXSA9PT0gYlsxXSAmJlxyXG5cdFx0XHRhWzJdID09PSBiWzJdICYmXHJcblx0XHRcdGFbM10gPT09IGJbM10gJiZcclxuXHRcdFx0YVs0XSA9PT0gYls0XSAmJlxyXG5cdFx0XHRhWzVdID09PSBiWzVdICYmXHJcblx0XHRcdGFbNl0gPT09IGJbNl0gJiZcclxuXHRcdFx0YVs3XSA9PT0gYls3XVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBkdWFsIHF1YXRlcm5pb25zIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7cXVhdDJ9IGEgdGhlIGZpcnN0IGR1YWwgcXVhdC5cclxuXHQgKiBAcGFyYW0ge3F1YXQyfSBiIHRoZSBzZWNvbmQgZHVhbCBxdWF0LlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSB0cnVlIGlmIHRoZSBkdWFsIHF1YXRzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBlcXVhbHMkOChhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV0sXHJcblx0XHRcdGEyID0gYVsyXSxcclxuXHRcdFx0YTMgPSBhWzNdLFxyXG5cdFx0XHRhNCA9IGFbNF0sXHJcblx0XHRcdGE1ID0gYVs1XSxcclxuXHRcdFx0YTYgPSBhWzZdLFxyXG5cdFx0XHRhNyA9IGFbN11cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXSxcclxuXHRcdFx0YjIgPSBiWzJdLFxyXG5cdFx0XHRiMyA9IGJbM10sXHJcblx0XHRcdGI0ID0gYls0XSxcclxuXHRcdFx0YjUgPSBiWzVdLFxyXG5cdFx0XHRiNiA9IGJbNl0sXHJcblx0XHRcdGI3ID0gYls3XVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhMiAtIGIyKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTMgLSBiMykgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmXHJcblx0XHRcdE1hdGguYWJzKGE0IC0gYjQpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJlxyXG5cdFx0XHRNYXRoLmFicyhhNSAtIGI1KSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiZcclxuXHRcdFx0TWF0aC5hYnMoYTYgLSBiNikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmXHJcblx0XHRcdE1hdGguYWJzKGE3IC0gYjcpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHJcblx0dmFyIHF1YXQyID0gLyojX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlJDcsXHJcblx0XHRjbG9uZTogY2xvbmUkNyxcclxuXHRcdGZyb21WYWx1ZXM6IGZyb21WYWx1ZXMkNyxcclxuXHRcdGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uVmFsdWVzOiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblZhbHVlcyxcclxuXHRcdGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uOiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbiQxLFxyXG5cdFx0ZnJvbVRyYW5zbGF0aW9uOiBmcm9tVHJhbnNsYXRpb24kMyxcclxuXHRcdGZyb21Sb3RhdGlvbjogZnJvbVJvdGF0aW9uJDQsXHJcblx0XHRmcm9tTWF0NDogZnJvbU1hdDQkMSxcclxuXHRcdGNvcHk6IGNvcHkkNyxcclxuXHRcdGlkZW50aXR5OiBpZGVudGl0eSQ1LFxyXG5cdFx0c2V0OiBzZXQkNyxcclxuXHRcdGdldFJlYWw6IGdldFJlYWwsXHJcblx0XHRnZXREdWFsOiBnZXREdWFsLFxyXG5cdFx0c2V0UmVhbDogc2V0UmVhbCxcclxuXHRcdHNldER1YWw6IHNldER1YWwsXHJcblx0XHRnZXRUcmFuc2xhdGlvbjogZ2V0VHJhbnNsYXRpb24kMSxcclxuXHRcdHRyYW5zbGF0ZTogdHJhbnNsYXRlJDMsXHJcblx0XHRyb3RhdGVYOiByb3RhdGVYJDMsXHJcblx0XHRyb3RhdGVZOiByb3RhdGVZJDMsXHJcblx0XHRyb3RhdGVaOiByb3RhdGVaJDMsXHJcblx0XHRyb3RhdGVCeVF1YXRBcHBlbmQ6IHJvdGF0ZUJ5UXVhdEFwcGVuZCxcclxuXHRcdHJvdGF0ZUJ5UXVhdFByZXBlbmQ6IHJvdGF0ZUJ5UXVhdFByZXBlbmQsXHJcblx0XHRyb3RhdGVBcm91bmRBeGlzOiByb3RhdGVBcm91bmRBeGlzLFxyXG5cdFx0YWRkOiBhZGQkNyxcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQ3LFxyXG5cdFx0bXVsOiBtdWwkNyxcclxuXHRcdHNjYWxlOiBzY2FsZSQ3LFxyXG5cdFx0ZG90OiBkb3QkMyxcclxuXHRcdGxlcnA6IGxlcnAkMyxcclxuXHRcdGludmVydDogaW52ZXJ0JDUsXHJcblx0XHRjb25qdWdhdGU6IGNvbmp1Z2F0ZSQxLFxyXG5cdFx0bGVuZ3RoOiBsZW5ndGgkMyxcclxuXHRcdGxlbjogbGVuJDMsXHJcblx0XHRzcXVhcmVkTGVuZ3RoOiBzcXVhcmVkTGVuZ3RoJDMsXHJcblx0XHRzcXJMZW46IHNxckxlbiQzLFxyXG5cdFx0bm9ybWFsaXplOiBub3JtYWxpemUkMyxcclxuXHRcdHN0cjogc3RyJDcsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkNyxcclxuXHRcdGVxdWFsczogZXF1YWxzJDgsXHJcblx0fSlcclxuXHJcblx0LyoqXHJcblx0ICogMiBEaW1lbnNpb25hbCBWZWN0b3JcclxuXHQgKiBAbW9kdWxlIHZlYzJcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMlxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjcmVhdGUkOCgpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgyKVxyXG5cclxuXHRcdGlmIChBUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xyXG5cdFx0XHRvdXRbMF0gPSAwXHJcblx0XHRcdG91dFsxXSA9IDBcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjbG9uZVxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2xvbmUkOChhKSB7XHJcblx0XHR2YXIgb3V0ID0gbmV3IEFSUkFZX1RZUEUoMilcclxuXHRcdG91dFswXSA9IGFbMF1cclxuXHRcdG91dFsxXSA9IGFbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZnJvbVZhbHVlcyQ4KHgsIHkpIHtcclxuXHRcdHZhciBvdXQgPSBuZXcgQVJSQVlfVFlQRSgyKVxyXG5cdFx0b3V0WzBdID0geFxyXG5cdFx0b3V0WzFdID0geVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMiB0byBhbm90aGVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgc291cmNlIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29weSQ4KG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gYVswXVxyXG5cdFx0b3V0WzFdID0gYVsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuXHQgKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2V0JDgob3V0LCB4LCB5KSB7XHJcblx0XHRvdXRbMF0gPSB4XHJcblx0XHRvdXRbMV0gPSB5XHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhZGQkOChvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdICsgYlsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdWJ0cmFjdCQ2KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAtIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gLSBiWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE11bHRpcGxpZXMgdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtdWx0aXBseSQ4KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJbMF1cclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiWzFdXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIERpdmlkZXMgdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXZpZGUkMihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gLyBiWzBdXHJcblx0XHRvdXRbMV0gPSBhWzFdIC8gYlsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2VpbFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY2VpbCQyKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBmbG9vclxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZmxvb3IkMihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IE1hdGguZmxvb3IoYVswXSlcclxuXHRcdG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSlcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1pbiQyKG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSlcclxuXHRcdG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtYXgkMihvdXQsIGEsIGIpIHtcclxuXHRcdG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pXHJcblx0XHRvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIHJvdW5kXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByb3VuZCQyKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKVxyXG5cdFx0b3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZSQ4KG91dCwgYSwgYikge1xyXG5cdFx0b3V0WzBdID0gYVswXSAqIGJcclxuXHRcdG91dFsxXSA9IGFbMV0gKiBiXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdHdvIHZlYzIncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY2FsZUFuZEFkZCQyKG91dCwgYSwgYiwgc2NhbGUpIHtcclxuXHRcdG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGVcclxuXHRcdG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkaXN0YW5jZSQyKGEsIGIpIHtcclxuXHRcdHZhciB4ID0gYlswXSAtIGFbMF0sXHJcblx0XHRcdHkgPSBiWzFdIC0gYVsxXVxyXG5cdFx0cmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UkMihhLCBiKSB7XHJcblx0XHR2YXIgeCA9IGJbMF0gLSBhWzBdLFxyXG5cdFx0XHR5ID0gYlsxXSAtIGFbMV1cclxuXHRcdHJldHVybiB4ICogeCArIHkgKiB5XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlbmd0aCQ0KGEpIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV1cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSlcclxuXHR9XHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc3F1YXJlZExlbmd0aCQ0KGEpIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV1cclxuXHRcdHJldHVybiB4ICogeCArIHkgKiB5XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBuZWdhdGUkMihvdXQsIGEpIHtcclxuXHRcdG91dFswXSA9IC1hWzBdXHJcblx0XHRvdXRbMV0gPSAtYVsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGludmVydFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW52ZXJzZSQyKG91dCwgYSkge1xyXG5cdFx0b3V0WzBdID0gMS4wIC8gYVswXVxyXG5cdFx0b3V0WzFdID0gMS4wIC8gYVsxXVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSB2ZWMyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBub3JtYWxpemUkNChvdXQsIGEpIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV1cclxuXHRcdHZhciBsZW4gPSB4ICogeCArIHkgKiB5XHJcblxyXG5cdFx0aWYgKGxlbiA+IDApIHtcclxuXHRcdFx0Ly9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cclxuXHRcdFx0bGVuID0gMSAvIE1hdGguc3FydChsZW4pXHJcblx0XHR9XHJcblxyXG5cdFx0b3V0WzBdID0gYVswXSAqIGxlblxyXG5cdFx0b3V0WzFdID0gYVsxXSAqIGxlblxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMidzXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcblx0ICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBkb3QkNChhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMidzXHJcblx0ICogTm90ZSB0aGF0IHRoZSBjcm9zcyBwcm9kdWN0IG11c3QgYnkgZGVmaW5pdGlvbiBwcm9kdWNlIGEgM0QgdmVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuXHQgKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNyb3NzJDIob3V0LCBhLCBiKSB7XHJcblx0XHR2YXIgeiA9IGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF1cclxuXHRcdG91dFswXSA9IG91dFsxXSA9IDBcclxuXHRcdG91dFsyXSA9IHpcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMyJ3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGxlcnAkNChvdXQsIGEsIGIsIHQpIHtcclxuXHRcdHZhciBheCA9IGFbMF0sXHJcblx0XHRcdGF5ID0gYVsxXVxyXG5cdFx0b3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheClcclxuXHRcdG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpXHJcblx0XHRyZXR1cm4gb3V0XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByYW5kb20kMyhvdXQsIHNjYWxlKSB7XHJcblx0XHRzY2FsZSA9IHNjYWxlIHx8IDEuMFxyXG5cdFx0dmFyIHIgPSBSQU5ET00oKSAqIDIuMCAqIE1hdGguUElcclxuXHRcdG91dFswXSA9IE1hdGguY29zKHIpICogc2NhbGVcclxuXHRcdG91dFsxXSA9IE1hdGguc2luKHIpICogc2NhbGVcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge21hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyKG91dCwgYSwgbSkge1xyXG5cdFx0dmFyIHggPSBhWzBdLFxyXG5cdFx0XHR5ID0gYVsxXVxyXG5cdFx0b3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeVxyXG5cdFx0b3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge21hdDJkfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gdHJhbnNmb3JtTWF0MmQob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF0sXHJcblx0XHRcdHkgPSBhWzFdXHJcblx0XHRvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5ICsgbVs0XVxyXG5cdFx0b3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xyXG5cdCAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG5cdCAqIEBwYXJhbSB7bWF0M30gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcclxuXHQgKiBAcmV0dXJucyB7dmVjMn0gb3V0XHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMkMShvdXQsIGEsIG0pIHtcclxuXHRcdHZhciB4ID0gYVswXSxcclxuXHRcdFx0eSA9IGFbMV1cclxuXHRcdG91dFswXSA9IG1bMF0gKiB4ICsgbVszXSAqIHkgKyBtWzZdXHJcblx0XHRvdXRbMV0gPSBtWzFdICogeCArIG1bNF0gKiB5ICsgbVs3XVxyXG5cdFx0cmV0dXJuIG91dFxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQ0XHJcblx0ICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMCdcclxuXHQgKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuXHQgKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcblx0ICogQHJldHVybnMge3ZlYzJ9IG91dFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0JDIob3V0LCBhLCBtKSB7XHJcblx0XHR2YXIgeCA9IGFbMF1cclxuXHRcdHZhciB5ID0gYVsxXVxyXG5cdFx0b3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdXHJcblx0XHRvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVsxM11cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUm90YXRlIGEgMkQgdmVjdG9yXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMyXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIFRoZSB2ZWMyIHBvaW50IHRvIHJvdGF0ZVxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcm90YXRlJDQob3V0LCBhLCBiLCBjKSB7XHJcblx0XHQvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXHJcblx0XHR2YXIgcDAgPSBhWzBdIC0gYlswXSxcclxuXHRcdFx0cDEgPSBhWzFdIC0gYlsxXSxcclxuXHRcdFx0c2luQyA9IE1hdGguc2luKGMpLFxyXG5cdFx0XHRjb3NDID0gTWF0aC5jb3MoYykgLy9wZXJmb3JtIHJvdGF0aW9uIGFuZCB0cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxyXG5cclxuXHRcdG91dFswXSA9IHAwICogY29zQyAtIHAxICogc2luQyArIGJbMF1cclxuXHRcdG91dFsxXSA9IHAwICogc2luQyArIHAxICogY29zQyArIGJbMV1cclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAyRCB2ZWN0b3JzXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCBvcGVyYW5kXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGFuZ2xlJDEoYSwgYikge1xyXG5cdFx0dmFyIHgxID0gYVswXSxcclxuXHRcdFx0eTEgPSBhWzFdLFxyXG5cdFx0XHR4MiA9IGJbMF0sXHJcblx0XHRcdHkyID0gYlsxXVxyXG5cdFx0dmFyIGxlbjEgPSB4MSAqIHgxICsgeTEgKiB5MVxyXG5cclxuXHRcdGlmIChsZW4xID4gMCkge1xyXG5cdFx0XHQvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xyXG5cdFx0XHRsZW4xID0gMSAvIE1hdGguc3FydChsZW4xKVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBsZW4yID0geDIgKiB4MiArIHkyICogeTJcclxuXHJcblx0XHRpZiAobGVuMiA+IDApIHtcclxuXHRcdFx0Ly9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cclxuXHRcdFx0bGVuMiA9IDEgLyBNYXRoLnNxcnQobGVuMilcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgY29zaW5lID0gKHgxICogeDIgKyB5MSAqIHkyKSAqIGxlbjEgKiBsZW4yXHJcblxyXG5cdFx0aWYgKGNvc2luZSA+IDEuMCkge1xyXG5cdFx0XHRyZXR1cm4gMFxyXG5cdFx0fSBlbHNlIGlmIChjb3NpbmUgPCAtMS4wKSB7XHJcblx0XHRcdHJldHVybiBNYXRoLlBJXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5hY29zKGNvc2luZSlcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMiB0byB6ZXJvXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG5cdCAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gemVybyQyKG91dCkge1xyXG5cdFx0b3V0WzBdID0gMC4wXHJcblx0XHRvdXRbMV0gPSAwLjBcclxuXHRcdHJldHVybiBvdXRcclxuXHR9XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdHIkOChhKSB7XHJcblx0XHRyZXR1cm4gJ3ZlYzIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcpJ1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGV4YWN0bHkgaGF2ZSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG5cdCAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gZXhhY3RFcXVhbHMkOChhLCBiKSB7XHJcblx0XHRyZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcblx0ICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxyXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBlcXVhbHMkOShhLCBiKSB7XHJcblx0XHR2YXIgYTAgPSBhWzBdLFxyXG5cdFx0XHRhMSA9IGFbMV1cclxuXHRcdHZhciBiMCA9IGJbMF0sXHJcblx0XHRcdGIxID0gYlsxXVxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0TWF0aC5hYnMoYTAgLSBiMCkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXHJcblx0XHRcdE1hdGguYWJzKGExIC0gYjEpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKVxyXG5cdFx0KVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgbGVuJDQgPSBsZW5ndGgkNFxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zdWJ0cmFjdH1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIHN1YiQ2ID0gc3VidHJhY3QkNlxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5tdWx0aXBseX1cclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKi9cclxuXHJcblx0dmFyIG11bCQ4ID0gbXVsdGlwbHkkOFxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXZpZGV9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBkaXYkMiA9IGRpdmlkZSQyXHJcblx0LyoqXHJcblx0ICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpc3RhbmNlfVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZGlzdCQyID0gZGlzdGFuY2UkMlxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkRGlzdGFuY2V9XHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICovXHJcblxyXG5cdHZhciBzcXJEaXN0JDIgPSBzcXVhcmVkRGlzdGFuY2UkMlxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkTGVuZ3RofVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgc3FyTGVuJDQgPSBzcXVhcmVkTGVuZ3RoJDRcclxuXHQvKipcclxuXHQgKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjMnMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMi4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XHJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxyXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gYVxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqL1xyXG5cclxuXHR2YXIgZm9yRWFjaCQyID0gKGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHZlYyA9IGNyZWF0ZSQ4KClcclxuXHRcdHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcclxuXHRcdFx0dmFyIGksIGxcclxuXHJcblx0XHRcdGlmICghc3RyaWRlKSB7XHJcblx0XHRcdFx0c3RyaWRlID0gMlxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIW9mZnNldCkge1xyXG5cdFx0XHRcdG9mZnNldCA9IDBcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGNvdW50KSB7XHJcblx0XHRcdFx0bCA9IE1hdGgubWluKGNvdW50ICogc3RyaWRlICsgb2Zmc2V0LCBhLmxlbmd0aClcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsID0gYS5sZW5ndGhcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yIChpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcclxuXHRcdFx0XHR2ZWNbMF0gPSBhW2ldXHJcblx0XHRcdFx0dmVjWzFdID0gYVtpICsgMV1cclxuXHRcdFx0XHRmbih2ZWMsIHZlYywgYXJnKVxyXG5cdFx0XHRcdGFbaV0gPSB2ZWNbMF1cclxuXHRcdFx0XHRhW2kgKyAxXSA9IHZlY1sxXVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYVxyXG5cdFx0fVxyXG5cdH0pKClcclxuXHJcblx0dmFyIHZlYzIgPSAvKiNfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xyXG5cdFx0Y3JlYXRlOiBjcmVhdGUkOCxcclxuXHRcdGNsb25lOiBjbG9uZSQ4LFxyXG5cdFx0ZnJvbVZhbHVlczogZnJvbVZhbHVlcyQ4LFxyXG5cdFx0Y29weTogY29weSQ4LFxyXG5cdFx0c2V0OiBzZXQkOCxcclxuXHRcdGFkZDogYWRkJDgsXHJcblx0XHRzdWJ0cmFjdDogc3VidHJhY3QkNixcclxuXHRcdG11bHRpcGx5OiBtdWx0aXBseSQ4LFxyXG5cdFx0ZGl2aWRlOiBkaXZpZGUkMixcclxuXHRcdGNlaWw6IGNlaWwkMixcclxuXHRcdGZsb29yOiBmbG9vciQyLFxyXG5cdFx0bWluOiBtaW4kMixcclxuXHRcdG1heDogbWF4JDIsXHJcblx0XHRyb3VuZDogcm91bmQkMixcclxuXHRcdHNjYWxlOiBzY2FsZSQ4LFxyXG5cdFx0c2NhbGVBbmRBZGQ6IHNjYWxlQW5kQWRkJDIsXHJcblx0XHRkaXN0YW5jZTogZGlzdGFuY2UkMixcclxuXHRcdHNxdWFyZWREaXN0YW5jZTogc3F1YXJlZERpc3RhbmNlJDIsXHJcblx0XHRsZW5ndGg6IGxlbmd0aCQ0LFxyXG5cdFx0c3F1YXJlZExlbmd0aDogc3F1YXJlZExlbmd0aCQ0LFxyXG5cdFx0bmVnYXRlOiBuZWdhdGUkMixcclxuXHRcdGludmVyc2U6IGludmVyc2UkMixcclxuXHRcdG5vcm1hbGl6ZTogbm9ybWFsaXplJDQsXHJcblx0XHRkb3Q6IGRvdCQ0LFxyXG5cdFx0Y3Jvc3M6IGNyb3NzJDIsXHJcblx0XHRsZXJwOiBsZXJwJDQsXHJcblx0XHRyYW5kb206IHJhbmRvbSQzLFxyXG5cdFx0dHJhbnNmb3JtTWF0MjogdHJhbnNmb3JtTWF0MixcclxuXHRcdHRyYW5zZm9ybU1hdDJkOiB0cmFuc2Zvcm1NYXQyZCxcclxuXHRcdHRyYW5zZm9ybU1hdDM6IHRyYW5zZm9ybU1hdDMkMSxcclxuXHRcdHRyYW5zZm9ybU1hdDQ6IHRyYW5zZm9ybU1hdDQkMixcclxuXHRcdHJvdGF0ZTogcm90YXRlJDQsXHJcblx0XHRhbmdsZTogYW5nbGUkMSxcclxuXHRcdHplcm86IHplcm8kMixcclxuXHRcdHN0cjogc3RyJDgsXHJcblx0XHRleGFjdEVxdWFsczogZXhhY3RFcXVhbHMkOCxcclxuXHRcdGVxdWFsczogZXF1YWxzJDksXHJcblx0XHRsZW46IGxlbiQ0LFxyXG5cdFx0c3ViOiBzdWIkNixcclxuXHRcdG11bDogbXVsJDgsXHJcblx0XHRkaXY6IGRpdiQyLFxyXG5cdFx0ZGlzdDogZGlzdCQyLFxyXG5cdFx0c3FyRGlzdDogc3FyRGlzdCQyLFxyXG5cdFx0c3FyTGVuOiBzcXJMZW4kNCxcclxuXHRcdGZvckVhY2g6IGZvckVhY2gkMixcclxuXHR9KVxyXG5cclxuXHRleHBvcnRzLmdsTWF0cml4ID0gY29tbW9uXHJcblx0ZXhwb3J0cy5tYXQyID0gbWF0MlxyXG5cdGV4cG9ydHMubWF0MmQgPSBtYXQyZFxyXG5cdGV4cG9ydHMubWF0MyA9IG1hdDNcclxuXHRleHBvcnRzLm1hdDQgPSBtYXQ0XHJcblx0ZXhwb3J0cy5xdWF0ID0gcXVhdFxyXG5cdGV4cG9ydHMucXVhdDIgPSBxdWF0MlxyXG5cdGV4cG9ydHMudmVjMiA9IHZlYzJcclxuXHRleHBvcnRzLnZlYzMgPSB2ZWMzXHJcblx0ZXhwb3J0cy52ZWM0ID0gdmVjNFxyXG5cclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pXHJcbn0pXHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAyMDEyLCBHcmVnZyBUYXZhcmVzLlxyXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKlxyXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcclxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxyXG4gKiBtZXQ6XHJcbiAqXHJcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XHJcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxyXG4gKiBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyXHJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcclxuICogZGlzdHJpYnV0aW9uLlxyXG4gKiAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdyZWdnIFRhdmFyZXMuIG5vciB0aGUgbmFtZXMgb2YgaGlzXHJcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXHJcbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXHJcbiAqXHJcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcclxuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxyXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcclxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcclxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXHJcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcclxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXHJcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxyXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXHJcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxyXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgcHJvZ3JhbSwgYXR0YWNoZXMgc2hhZGVycywgYmluZHMgYXR0cmliIGxvY2F0aW9ucywgbGlua3MgdGhlXHJcbiAqIHByb2dyYW0gYW5kIGNhbGxzIHVzZVByb2dyYW0uXHJcbiAqIEBwYXJhbSB7V2ViR0xTaGFkZXJbXX0gc2hhZGVycyBUaGUgc2hhZGVycyB0byBhdHRhY2hcclxuICogQHBhcmFtIHtzdHJpbmdbXX0gW29wdF9hdHRyaWJzXSBBbiBhcnJheSBvZiBhdHRyaWJzIG5hbWVzLlxyXG4gKiBMb2NhdGlvbnMgd2lsbCBiZSBhc3NpZ25lZCBieSBpbmRleCBpZiBub3QgcGFzc2VkIGluXHJcbiAqIEBwYXJhbSB7bnVtYmVyW119IFtvcHRfbG9jYXRpb25zXSBUaGUgbG9jYXRpb25zIGZvciB0aGUuXHJcbiAqIEEgcGFyYWxsZWwgYXJyYXkgdG8gb3B0X2F0dHJpYnMgbGV0dGluZyB5b3UgYXNzaWduIGxvY2F0aW9ucy5cclxuICogQHBhcmFtIHttb2R1bGU6d2ViZ2wtdXRpbHMuRXJyb3JDYWxsYmFja30gb3B0X2Vycm9yQ2FsbGJhY2sgY2FsbGJhY2sgZm9yIGVycm9ycy5cclxuICogQnkgZGVmYXVsdCBpdCBqdXN0IHByaW50cyBhbiBlcnJvciB0byB0aGUgY29uc29sZSBvbiBlcnJvci5cclxuICogSWYgeW91IHdhbnQgc29tZXRoaW5nIGVsc2UgcGFzcyBhbiBjYWxsYmFjay4gSXQncyBwYXNzZWQgYW4gZXJyb3IgbWVzc2FnZS5cclxuICogQG1lbWJlck9mIG1vZHVsZTp3ZWJnbC11dGlsc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oXHJcblx0Z2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCxcclxuXHRzaGFkZXJzOiBXZWJHTFNoYWRlcltdLFxyXG5cdG9wdF9hdHRyaWJzPzogc3RyaW5nW10sXHJcblx0b3B0X2xvY2F0aW9ucz86IG51bWJlcltdLFxyXG5cdG9wdF9lcnJvckNhbGxiYWNrPzogYW55XHJcbik6IFdlYkdMUHJvZ3JhbSB8IG51bGwge1xyXG5cdGNvbnN0IGVyckZuOiAoZXJyb3JNZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQgfCBDb25zb2xlID0gb3B0X2Vycm9yQ2FsbGJhY2sgfHwgY29uc29sZS5lcnJvclxyXG5cdGNvbnN0IHByb2dyYW06IFdlYkdMUHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKVxyXG5cclxuXHRzaGFkZXJzLmZvckVhY2goKHNoYWRlcik6IHZvaWQgPT4gZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHNoYWRlcikpXHJcblxyXG5cdGlmIChvcHRfYXR0cmlicykge1xyXG5cdFx0b3B0X2F0dHJpYnMuZm9yRWFjaChcclxuXHRcdFx0KGF0dHJpYiwgbmR4KTogdm9pZCA9PlxyXG5cdFx0XHRcdGdsLmJpbmRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBvcHRfbG9jYXRpb25zID8gb3B0X2xvY2F0aW9uc1tuZHhdIDogbmR4LCBhdHRyaWIpXHJcblx0XHQpXHJcblx0fVxyXG5cclxuXHRnbC5saW5rUHJvZ3JhbShwcm9ncmFtKVxyXG5cclxuXHQvLyBDaGVjayB0aGUgbGluayBzdGF0dXNcclxuXHRjb25zdCBsaW5rZWQ6IGFueSA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpXHJcblx0aWYgKCFsaW5rZWQpIHtcclxuXHRcdC8vIHNvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggdGhlIGxpbmtcclxuXHRcdGNvbnN0IGxhc3RFcnJvcjogc3RyaW5nID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSlcclxuXHRcdGVyckZuKCdFcnJvciBpbiBwcm9ncmFtIGxpbmtpbmc6JyArIGxhc3RFcnJvcilcclxuXHJcblx0XHRnbC5kZWxldGVQcm9ncmFtKHByb2dyYW0pXHJcblx0XHRyZXR1cm4gbnVsbFxyXG5cdH1cclxuXHRyZXR1cm4gcHJvZ3JhbVxyXG59XHJcblxyXG4vKipcclxuICogUmVzaXplIGEgY2FudmFzIHRvIG1hdGNoIHRoZSBzaXplIGl0cyBkaXNwbGF5ZWQuXHJcbiAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhcyBUaGUgY2FudmFzIHRvIHJlc2l6ZS5cclxuICogQHBhcmFtIHtudW1iZXJ9IFttdWx0aXBsaWVyXSBhbW91bnQgdG8gbXVsdGlwbHkgYnkuXHJcbiAqICAgIFBhc3MgaW4gd2luZG93LmRldmljZVBpeGVsUmF0aW8gZm9yIG5hdGl2ZSBwaXhlbHMuXHJcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNhbnZhcyB3YXMgcmVzaXplZC5cclxuICogQG1lbWJlck9mIG1vZHVsZTp3ZWJnbC11dGlsc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoXHJcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcclxuXHRtdWx0aXBsaWVyOiBudW1iZXIgPSAxXHJcbik6IGJvb2xlYW4ge1xyXG5cdGNvbnN0IHdpZHRoID0gKGNhbnZhcy5jbGllbnRXaWR0aCAqIG11bHRpcGxpZXIpIHwgMFxyXG5cdGNvbnN0IGhlaWdodCA9IChjYW52YXMuY2xpZW50SGVpZ2h0ICogbXVsdGlwbGllcikgfCAwXHJcblx0aWYgKGNhbnZhcy53aWR0aCAhPT0gd2lkdGggfHwgY2FudmFzLmhlaWdodCAhPT0gaGVpZ2h0KSB7XHJcblx0XHRjYW52YXMud2lkdGggPSB3aWR0aFxyXG5cdFx0Y2FudmFzLmhlaWdodCA9IGhlaWdodFxyXG5cdFx0cmV0dXJuIHRydWVcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXNpemUgYSBjYW52YXMgdG8gbWF0Y2ggdGhlIHNpemUgaXRzIGRpc3BsYXllZC5cclxuICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzIFRoZSBjYW52YXMgdG8gcmVzaXplLlxyXG4gKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBjYW52YXMgd2FzIHJlc2l6ZWQuXHJcbiAqIEBtZW1iZXJPZiBtb2R1bGU6d2ViZ2wtdXRpbHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZXNpemVDYW52YXNUb1NxdWFyZShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogYm9vbGVhbiB7XHJcblx0Y29uc3Qgc3R5bGVzOiBDU1NTdHlsZURlY2xhcmF0aW9uID0gZ2V0Q29tcHV0ZWRTdHlsZShjYW52YXMpXHJcblx0Y29uc3Qgd2lkdGg6IG51bWJlciA9IHBhcnNlRmxvYXQoc3R5bGVzLndpZHRoKVxyXG5cdGNvbnN0IGhlaWdodDogbnVtYmVyID0gcGFyc2VGbG9hdChzdHlsZXMuaGVpZ2h0KVxyXG5cclxuXHRpZiAoY2FudmFzLndpZHRoICE9PSB3aWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBoZWlnaHQpIHtcclxuXHRcdGNhbnZhcy53aWR0aCA9IHdpZHRoXHJcblx0XHRjYW52YXMuaGVpZ2h0ID0gd2lkdGhcclxuXHRcdHJldHVybiB0cnVlXHJcblx0fVxyXG5cdHJldHVybiBmYWxzZVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2hhZGVyKFxyXG5cdGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQsXHJcblx0dHlwZTogc3RyaW5nLFxyXG5cdHJlc29sdmU6ICh2YWx1ZTogV2ViR0xTaGFkZXIgfCBQcm9taXNlTGlrZTx7fT4pID0+IHZvaWQsXHJcblx0cmVqZWN0OiAocmVhc29uOiBFcnJvcikgPT4gdm9pZFxyXG4pOiB2b2lkIHtcclxuXHRmdW5jdGlvbiBoYW5kbGVTaGFkZXIoZGF0YTogc3RyaW5nKTogV2ViR0xTaGFkZXIgfCBudWxsIHtcclxuXHRcdGxldCBzaGFkZXI6IFdlYkdMU2hhZGVyXHJcblx0XHRpZiAodHlwZSA9PT0gJ2ZyYWdtZW50LXNoYWRlcicpIHtcclxuXHRcdFx0c2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUilcclxuXHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gJ3ZlcnRleC1zaGFkZXInKSB7XHJcblx0XHRcdHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdH1cclxuXHJcblx0XHRnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBkYXRhKVxyXG5cdFx0Z2wuY29tcGlsZVNoYWRlcihzaGFkZXIpXHJcblxyXG5cdFx0cmV0dXJuIHNoYWRlclxyXG5cdH1cclxuXHJcblx0ZmV0Y2goYGh0dHA6Ly9sb2NhbGhvc3Q6MTMzNy9hc3NldHMvc2hhZGVycy8ke3R5cGV9Lmdsc2xgKVxyXG5cdFx0LnRoZW4oKHJlc3A6IFJlc3BvbnNlKSA9PiByZXNwLnRleHQoKSlcclxuXHRcdC50aGVuKChkYXRhOiBzdHJpbmcpID0+IGhhbmRsZVNoYWRlcihkYXRhKSlcclxuXHRcdC50aGVuKChzaGFkZXI6IFdlYkdMU2hhZGVyKSA9PiByZXNvbHZlKHNoYWRlcikpXHJcblx0XHQuY2F0Y2goKGVycjogRXJyb3IpID0+IHJlamVjdChlcnIpKVxyXG5cclxuXHQvLyBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG5cdC8vIFx0YWxlcnQoZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpKVxyXG5cdC8vIFx0cmV0dXJuIG51bGxcclxuXHQvLyB9XHJcbn1cclxuIl19
