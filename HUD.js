function main() {
  const webglCanvas = document.querySelector('#webgl')
  const hudCanvas = document.querySelector('#hud')
  const ctx = hudCanvas.getContext('2d')
  const gl = webglCanvas.getContext('webgl')
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

  // 立方体数据

  const vertices = new Float32Array([   // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ])

  const colors = new Float32Array([   // Colors
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v0-v1-v2-v3 front
    0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v0-v5-v6-v1 up
    0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v1-v6-v7-v2 left
    0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
  ])

  const indices = new Uint8Array([   // Indices of the vertices
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // right
      8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ])

  // 初始化 buffer
  initArrayBuffer(gl, positionLocation, vertices, 3, gl.FLOAT)
  initArrayBuffer(gl, colorLocation, colors, 3, gl.FLOAT)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  // 初始化矩阵
  const mvpMatrix = new Matrix4()
  const viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(30.0, webglCanvas.width / webglCanvas.height, 1.0, 100.0)
  viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
  
  const state = {
    last: null,
    angle: 0.0
  }
  const ANGLE_STEP = 20.0

  const draw = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    mvpMatrix.set(viewProjMatrix)
    mvpMatrix.rotate(state.angle, 1, 0, 0)
    mvpMatrix.rotate(state.angle, 0, 1, 0)
    mvpMatrix.rotate(state.angle, 0, 0, 1)
    gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
  }

  const tick = now => {
    if (!state.last) {
      state.last = now
    }
    const elapsed = now - state.last
    state.last = now
    state.angle = (state.angle + ANGLE_STEP * (elapsed / 1000.0)) % 360
    draw()
    requestAnimationFrame(tick)
  }

  hudCanvas.addEventListener('mousedown', () => {
    ctx.clearRect(0, 0, 400, 400)
    // 绘制三角形
    ctx.beginPath()
    ctx.moveTo(120, 10)
    ctx.lineTo(200, 150)
    ctx.lineTo(40, 150)
    ctx.closePath()
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
    ctx.stroke()
    // 绘制文本
    ctx.font = '18px "Times New Roman"'
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'
    ctx.fillText('HUD: Head Up Display', 40, 180)
    ctx.fillText('Triangle is drawn by Canvas 2D API.', 40, 200)
  })

  gl.clearColor(0, 0, 0, 1)
  gl.enable(gl.DEPTH_TEST)

  requestAnimationFrame(tick)
}

function initArrayBuffer(gl, location, data, num, type) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  gl.vertexAttribPointer(location, num, type, false, 0, 0)
  gl.enableVertexAttribArray(location)
}