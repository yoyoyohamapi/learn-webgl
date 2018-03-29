function main() {
  const OFFSCREEN_WIDTH = 2048
  const OFFSCREEN_HEIGHT = 2048
  const LIGHT_X = 0
  const LIGHT_Y = 7
  const LIGHT_Z = 2
  const ANGLE_STEP = 40.0

  const state = {
    last: null,
    angle: 0
  }

  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  const shadowProgram = {
    program: createProgramFromScripts(gl, '#vertex-shader-shadow', '#fragment-shader-shadow'),
  }

  const drawProgram = {
    program: createProgramFromScripts(gl, '#vertex-shader', '#fragment-shader'),
  }

  // 获得属性
  Object.assign(shadowProgram, {
    positionLocation: gl.getAttribLocation(shadowProgram.program, 'a_position'),
    mvpMatrixLocation: gl.getUniformLocation(shadowProgram.program, 'u_mvpMatrix')
  })

  Object.assign(drawProgram, {
    positionLocation: gl.getAttribLocation(drawProgram.program, 'a_position'),
    colorLocation: gl.getAttribLocation(drawProgram.program, 'a_color'),
    mvpMatrixLocation: gl.getUniformLocation(drawProgram.program, 'u_mvpMatrix'),
    mvpMatrixFromLightLocation: gl.getUniformLocation(drawProgram.program, 'u_mvpMatrixFromLight'),
    samplerLocation: gl.getUniformLocation(drawProgram.program, 'u_sampler')
  })
  
  const initArrayBuffer = data => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    return buffer
  }
 
  const initElementArrayBuffer = data => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)
    return buffer
  }

  const initFrameBufferObject = () => {
    const fbo = gl.createFramebuffer()

    const texture = gl.createTexture()
    fbo.texture = texture

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    // 创建渲染缓冲区对象并为其设置宽高
    const depthBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT)

    // 绑定纹理和渲染缓冲区到帧缓冲区对象
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

    const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
      console.log('Frame buffer object is incomplete: ' + e.toString())
      return
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)

    return fbo
  }

  const enabeAttribArray = (location, num, type, buffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(location, num, type, false, 0, 0)
    gl.enableVertexAttribArray(location)
  }

  const fbo = initFrameBufferObject()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, fbo.texture)

  gl.clearColor(0, 0, 0, 1)
  gl.enable(gl.DEPTH_TEST)

  // 三角形数据
  const triangle = {
    vertices: new Float32Array([-0.8, 3.5, 0.0,  0.8, 3.5, 0.0,  0.0, 3.5, 1.8]),
    colors: new Float32Array([1.0, 0.5, 0.0,  1.0, 0.5, 0.0,  1.0, 0.0, 0.0]),    
    indices: new Uint8Array([0, 1, 2])
  }

  // 平面数据
  const plane = {
    vertices: new Float32Array([
      3.0, -1.7, 2.5,  -3.0, -1.7, 2.5,  -3.0, -1.7, -2.5,   3.0, -1.7, -2.5    // v0-v1-v2-v3
    ]),
    colors: new Float32Array([
      1.0, 1.0, 1.0,    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,   1.0, 1.0, 1.0
    ]),
    indices: new Uint8Array([0, 1, 2,   0, 2, 3])
  }

  const modelMatrix = new Matrix4()
  const mvpMatrix = new Matrix4()
  const viewProjMatrix = new Matrix4()
  const viewProjMatrixFromLight = new Matrix4()
  viewProjMatrixFromLight.setPerspective(70.0, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 1.0, 100.0)
  viewProjMatrixFromLight.lookAt(LIGHT_X, LIGHT_Y, LIGHT_Z, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
  viewProjMatrix.setPerspective(45, canvas.width/canvas.height, 1.0, 100.0)
  viewProjMatrix.lookAt(0.0, 7.0, 9.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

  const mvpMatrixFromLightTriagnle = new Matrix4()
  const mvpMatrixFromLightPlane = new Matrix4()

  Object.assign(triangle, {
    positionBuffer: initArrayBuffer(triangle.vertices),
    colorBuffer: initArrayBuffer(triangle.colors),
    indexBuffer: initElementArrayBuffer(triangle.indices)
  })

  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

  Object.assign(plane, {
    positionBuffer: initArrayBuffer(plane.vertices),
    colorBuffer: initArrayBuffer(plane.colors),
    indexBuffer: initElementArrayBuffer(plane.indices)
  })

  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

  const drawTriangle = (program, viewProjMatrix) => {
    modelMatrix.setRotate(state.angle, 0, 1, 0)
    draw(program, triangle, viewProjMatrix)
  }

  const drawPlane = (program, viewProjMatrix) => {
    modelMatrix.setRotate(-45, 0, 1, 1)
    draw(program, plane, viewProjMatrix)
  }

  const draw = (program, graph, viewProjMatrix) => {
    enabeAttribArray(program.positionLocation, 3, gl.FLOAT, graph.positionBuffer)
    if (program.hasOwnProperty('colorLocation')) {
      enabeAttribArray(program.colorLocation, 3, gl.FLOAT, graph.colorBuffer)
    }
    mvpMatrix.set(viewProjMatrix)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(program.mvpMatrixLocation, false, mvpMatrix.elements)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, graph.indexBuffer)

    gl.drawElements(gl.TRIANGLES, graph.indices.length, gl.UNSIGNED_BYTE, 0)
  }

  const tick = now => {
    if (!state.last) {
      state.last = now
    }
    const elapsed = now - state.last
    state.last = now
    state.angle = (state.angle + (elapsed * ANGLE_STEP) / 1000) % 360

    // 使用帧缓冲区获得阴影
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(shadowProgram.program)

    // 绘制三角形及平面区域，以产生一个阴影
    drawTriangle(shadowProgram, viewProjMatrixFromLight)
    mvpMatrixFromLightTriagnle.set(mvpMatrix)
    drawPlane(shadowProgram, viewProjMatrixFromLight)
    mvpMatrixFromLightPlane.set(mvpMatrix)

    // 使用颜色缓冲区进行绘制
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.useProgram(drawProgram.program)
    gl.uniform1i(drawProgram.samplerLocation, 0)
    gl.uniformMatrix4fv(drawProgram.mvpMatrixFromLightLocation, false, mvpMatrixFromLightTriagnle.elements)
    drawTriangle(drawProgram, viewProjMatrix)
    gl.uniformMatrix4fv(drawProgram.mvpMatrixFromLightLocation, false, mvpMatrixFromLightPlane.elements)
    drawPlane(drawProgram, viewProjMatrix)

    requestAnimationFrame(tick) 
  }

  requestAnimationFrame(tick)
}