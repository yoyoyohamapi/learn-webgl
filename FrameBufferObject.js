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
  const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord')
  const mvpMatrixLocation = gl.getUniformLocation(program, 'u_mvpMatrix')
  const samplerLocation = gl.getUniformLocation(program, 'u_sampler')

  // 立方体数据
  const cubeData = {
    vertices : new Float32Array([
      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
      1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
      -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
      -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
      1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]),
  
    // Texture coordinates
    texCoords : new Float32Array([
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
    ]),
  
    // Indices of the vertices
    indices : new Uint8Array([
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // right
      8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ])
  }

  // 平面数据
  const planeData = {
    vertices: new Float32Array([
      1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0    // v0-v1-v2-v3
    ]),

    texCoords: new Float32Array([1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0]),

    indices: new Uint8Array([0, 1, 2,   0, 2, 3])
  }

  const OFFSCREEN_WIDTH = 256
  const OFFSCREEN_HEIGHT = 256
  const ANGLE_STEP = 20.0

  // 初始化 Array Buffer
  const initArrayBuffer = data  => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return buffer
  }

  // 初始化 Elemet Buffer
  const initElementArrayBuffer = data => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    return buffer
  }

  // 初始化纹理
  const initTextures = () => {
    const texture = gl.createTexture()
    const image = new Image()
    
    image.onload = function() {
      // 将图像数据写入纹理对象
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      // 将 0 号纹理单元传给采样器
      gl.uniform1i(samplerLocation, 0)
      gl.bindTexture(gl.TEXTURE_2D, null)
    }

    image.src = './resources/sky_cloud.jpg'
    return texture
  }

  const initFrameBufferObject = () => {
    // 创建帧缓冲对象
    const frameBuffer = gl.createFramebuffer()
    // 创建纹理对象
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    frameBuffer.texture = texture

    // 创建渲染缓冲区对象
    const depthBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT)

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    // 关联帧缓冲区与纹理
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    // 关联缓冲区对象与渲染缓冲区
    // 渲染缓冲区帮助进行深度消除
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

    const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
      console.log(`Frame buffer object is incomplete: ${e.toString}`)
      return
    }

    // 解绑缓冲区
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)

    return frameBuffer
  }

  const enableAttribArray = (location, num, type, buffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(location, num, type, false, 0, 0)
    gl.enableVertexAttribArray(location)
  }

  // 初始化立方体 buffer
  const cubeBuffer = {
    position: initArrayBuffer(cubeData.vertices),
    texcoord: initArrayBuffer(cubeData.texCoords),
    element: initElementArrayBuffer(cubeData.indices)
  }
  
  // 初始化平面的 buffer
  const planeBuffer = {
    position: initArrayBuffer(planeData.vertices),
    texcoord: initArrayBuffer(planeData.texCoords),
    element: initElementArrayBuffer(planeData.indices)
  }

  const texture = initTextures()
  const fbo = initFrameBufferObject()

  const modelMatrix = new Matrix4()
  const mvpMatrix = new Matrix4()
  const viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(30, canvas.width/canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

  const viewProjMatrixFBO = new Matrix4()
  viewProjMatrixFBO.setPerspective(30.0, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 1.0, 100.0);
  viewProjMatrixFBO.lookAt(0.0, 2.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  const state = {
    last: null,
    angle: 0
  }

  const drawTexturedObject = (texture, indices, buffer) => {
    enableAttribArray(positionLocation, 3, gl.FLOAT, buffer.position)
    enableAttribArray(texcoordLocation, 2, gl.FLOAT, buffer.texcoord)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.element)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
  }

  const drawTexturedCube = () => {
    modelMatrix.setRotate(20.0, 1.0, 0.0, 0.0)
    modelMatrix.rotate(state.angle, 0.0, 1.0, 0.0)

    mvpMatrix.set(viewProjMatrixFBO)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements)
    
    drawTexturedObject(texture, cubeData.indices, cubeBuffer)
  }

  const drawTexturedPlane = () => {
    modelMatrix.setTranslate(0, 0, 1)
    modelMatrix.rotate(20.0, 1.0, 0.0, 0.0)
    modelMatrix.rotate(state.angle, 0.0, 1.0, 0.0)
 
    mvpMatrix.set(viewProjMatrix)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements)

    drawTexturedObject(fbo.texture, planeData.indices, planeBuffer)
  }

  const draw = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT)
    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // 绘制带纹理的立方体
    drawTexturedCube()

    // 解绑帧对象缓冲区
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)

    // 绘制纹理表面
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    drawTexturedPlane()
  }

  const tick = now => {
    if (!state.last) {
      state.last = now
    }
    const elapesd = now - state.last
    state.last = now
    state.angle = (state.angle + (ANGLE_STEP * elapesd) / 1000) % 360
    draw()
    requestAnimationFrame(tick)
  }

  // 开始绘制
  gl.enable(gl.DEPTH_TEST)
  
  requestAnimationFrame(tick)
}