function main() {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  const normalProgram = createProgramFromScripts(gl, '#vertex-shader-normal', '#fragment-shader-normal')
  const texcoordProgram = createProgramFromScripts(gl, '#vertex-shader-texcoord', '#fragment-shader-texcoord')

  // 获得各个着色器程序的属性
  const normalLocation = {
    position: gl.getAttribLocation(normalProgram, 'a_position'),
    mvpMatrix: gl.getUniformLocation(normalProgram, 'u_mvpMatrix'),
    normalMatrix: gl.getUniformLocation(normalProgram, 'u_normalMatrix')
  }

  const texcoordLocation = {
    position: gl.getAttribLocation(texcoordProgram, 'a_position'),
    texcoord: gl.getAttribLocation(texcoordProgram, 'a_texcoord'),
    sampler: gl.getUniformLocation(texcoordProgram, 'u_sampler'),
    mvpMatrix: gl.getUniformLocation(texcoordProgram, 'u_mvpMatrix'),
    normalMatrix: gl.getUniformLocation(texcoordProgram, 'u_normalMatrix')
  }

  // 立方体数据
  const vertices = new Float32Array([   // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ])

  const normals = new Float32Array([   // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
  ])

  const texCoords = new Float32Array([   // Texture coordinates
    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ])

  const indices = new Uint8Array([        // Indices of the vertices
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ])

  const ANGLE_STEP = 20.0
  const state = {
    last: null,
    angle: 0,
    texture: null
  }

  // 初始化纹理
  const initTextures = () => {
    const texture = gl.createTexture()
    const image = new Image()
    image.src = './resources/orange.jpg'
    image.onload = function() {
      // 将图像数据写入为例对象
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) // 进行 Y 轴翻转
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      gl.useProgram(texcoordProgram)
      gl.uniform1i(texcoordLocation.sampler, 0)

      gl.bindTexture(gl.TEXTURE_2D, null)

      state.texture = texture
    }
  }

  // 初始化 array buffer
  const initArrayBuffer = (position, data) => {
    const buffer = gl.createBuffer() 
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return buffer
   
  }

  const enableVertexAttrib = (location, num, type, buffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(location, num, type, false, 0, 0)
    gl.enableVertexAttribArray(location)
  }

  // 初始化
  const normalBuffer = {
    position: initArrayBuffer(normalLocation.position, vertices, 3, gl.FLOAT)
  }
  const texcoordBuffer = {
    position: initArrayBuffer(texcoordLocation.position, vertices, 3, gl.FLOAT),
    texcoord:  initArrayBuffer(texcoordLocation.texcoord, texCoords, 2, gl.FLOAT)
  }
  
  initTextures()

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  const modelMatrix = new Matrix4()
  const normalMatrix = new Matrix4()
  const mvpMatrix = new Matrix4()
  const viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0)
  viewProjMatrix.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
  
  const drawCube = (x, location) => {
    modelMatrix.setTranslate(x, 0.0, 0.0)
    modelMatrix.rotate(20.0, 1.0, 0.0, 0.0)
    modelMatrix.rotate(state.angle, 0.0, 1.0, 0.0)

    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()
    gl.uniformMatrix4fv(location.normalMatrix, false, normalMatrix.elements)

    mvpMatrix.set(viewProjMatrix)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(location.mvpMatrix, false, mvpMatrix.elements)

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
 }

  const drawNormal = () => {
    gl.useProgram(normalProgram)
    enableVertexAttrib(normalLocation.position, 3, gl.FLOAT, normalBuffer.position)
    drawCube(-2.0, normalLocation)
  }
  
  const drawTexcoord = () => {
    gl.useProgram(texcoordProgram)
    enableVertexAttrib(texcoordLocation.position, 3, gl.FLOAT, texcoordBuffer.position)
    enableVertexAttrib(texcoordLocation.texcoord, 2, gl.FLOAT, texcoordBuffer.texcoord)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, state.texture)
    drawCube(2.0, texcoordLocation)
  }


  const tick = now => {
    if (!state.last) {
      state.last = now
    }
    const elapsed = now - state.last
    state.last = now
    state.angle = (state.angle + (elapsed * ANGLE_STEP) / 1000) % 360
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    drawNormal()
    drawTexcoord()
    requestAnimationFrame(tick)
  }

  // 进行首次绘制
  gl.clearColor(0, 0, 0, 1)
  gl.enable(gl.DEPTH_TEST)

  requestAnimationFrame(tick)
}

