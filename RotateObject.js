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
  const normalLocation = gl.getAttribLocation(program, 'a_normal')
  // 获得全局属性
  const mvpMatrixLocation = gl.getUniformLocation(program, 'u_mvpMatrix')
  const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix')

  // 定义立方体数据
  const vertices = new Float32Array([   // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ])

  // 法向量
  const normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ])

  // Indices of the vertices
  const indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ])

  // 初始化 buffer
  initArrayBuffer(gl, positionLocation, vertices, 3, gl.FLOAT)
  initArrayBuffer(gl, normalLocation, normals, 3, gl.FLOAT)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  // 新建矩阵
  const viewProjMatrix = new Matrix4()
  const mvpMatrix = new Matrix4()
  const normalMatrix = new Matrix4()

  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0)
  viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

  gl.clearColor(0,0,0,1)
  gl.enable(gl.DEPTH_TEST)

  const draw = angle => {
    mvpMatrix.set(viewProjMatrix)
    const modelMatrix = new Matrix4()
    modelMatrix.rotate(angle[0], 1.0, 0.0, 0.0)
    modelMatrix.rotate(angle[1], 0.0, 1.0, 0.0)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements)
    
    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()
    gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
  }

  // 定义行为
  const mousedown$ = Rx.Observable.fromEvent(canvas, 'mousedown')
  const mouseup$ = Rx.Observable.fromEvent(document, 'mouseup')
  const mousemove$ = Rx.Observable.fromEvent(document, 'mousemove')

  const rotate$ = mousedown$.flatMap(e => {
    let startX = e.clientX
    let startY = e.clientY
    return mousemove$.map(e => {
      const x = e.clientX
      const y = e.clientY
      const factor = 100 / canvas.height
      const dx = factor * (x - startX)
      const dy = factor * (y - startY)
      startX = x 
      startY = y
      return [dx, dy]
    }).takeUntil(mouseup$)
  })

  const angle$ = rotate$
    .scan((angle, [dx, dy]) => {
      const xAngle = Math.max(Math.min(angle[0] + dy, 90.0), -90.0)
      const yAngle = angle[1] + dx
      return [xAngle, yAngle]
    })
    .startWith([0.0, 0.0])

  angle$.subscribe(draw)
}

function initArrayBuffer(gl, location, data, num, type) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  gl.vertexAttribPointer(location, num, type, false, 0, 0)
  gl.enableVertexAttribArray(location)
}

