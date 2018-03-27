function main() {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl')

  if (!gl) {
    return
  }

  const program = createProgramFromScripts(gl, '#vertex-shader', '#fragment-shader')
  gl.useProgram(program)

  // 获得属性
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const colorLocation = gl.getAttribLocation(program, 'a_color')
  // 获得全局变量
  const mvpMatrixLocation = gl.getUniformLocation(program, 'u_mvpMatrix')
  const modelMatrixLocation = gl.getUniformLocation(program, 'u_modelMatrix')
  const eyeLocation = gl.getUniformLocation(program, 'u_eye')
  const fogColorLocation = gl.getUniformLocation(program, 'u_fogColor')
  const fogDistLocation = gl.getUniformLocation(program, 'u_fogDist')

  // 立方体数据
  const vertices = new Float32Array([   // Vertex coordinates
    1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
    1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
    1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    // v0-v5-v6-v1 up
   -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
   -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    // v7-v4-v3-v2 down
    1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1     // v4-v7-v6-v5 back
 ]);

  const colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);

  const indices = new Uint8Array([       // Indices of the vertices
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // right
      8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // 初始化 buffer
  initArrayBuffer(gl, positionLocation, vertices, 3, gl.FLOAT)
  initArrayBuffer(gl, colorLocation, colors, 3, gl.FLOAT)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  // 设置雾的颜色
  const fogColor = new Float32Array([0.137, 0.231, 0.423])
  // 设置雾的起点和终点
  const fogDist = new Float32Array([55, 80])
  // 设置视点
  const eye = new Float32Array([25, 65, 35, 1.0])
  
  // 初始化矩阵
  const mvpMatrix = new Matrix4()
  const modelMatrix = new Matrix4()

  modelMatrix.setScale(10, 10, 10)
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 10000)
  mvpMatrix.lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0)
  mvpMatrix.multiply(modelMatrix)

  gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0)
  gl.enable(gl.DEPTH_TEST)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) 

  gl.uniform2fv(fogDistLocation, fogDist)
  gl.uniform3fv(fogColorLocation, fogColor)
  gl.uniform4fv(eyeLocation, eye)
  gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements)
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix.elements)
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
}

function initArrayBuffer(gl, location, data, num, type) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  gl.vertexAttribPointer(location, num, type, false, 0, 0)
  gl.enableVertexAttribArray(location)
}