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
  const normalLocation = gl.getAttribLocation(program, 'a_normal')

  // 获得全局变量
  const mvpMatrixLocation = gl.getUniformLocation(program, 'u_mvpMatrix')
  const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix')
  const lightDirectionLocation = gl.getUniformLocation(program, 'u_lightDirection')
  const lightColorLocation = gl.getUniformLocation(program, 'u_lightColor')

  const vertices = new Float32Array([   // Coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);


 const colors = new Float32Array([    // Colors
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
  ]);


 const normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ])

  const indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ])

  
  // 初始化各个属性缓冲
  initArrayBuffer(gl, positionLocation, vertices, 3, gl.FLOAT)
  initArrayBuffer(gl, colorLocation, colors, 3, gl.FLOAT)
  initArrayBuffer(gl, normalLocation, normals, 3, gl.FLOAT)

  // 初始化顶点缓冲
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  // 设置光照方向
  const lightDirection = new Vector3([0.5, 3.0, 4.0])
  lightDirection.normalize()     
  gl.uniform3fv(lightDirectionLocation, lightDirection.elements)

  // 设置光照颜色
  gl.uniform3f(lightColorLocation, 1.0, 1.0, 1.0)
  
  // 初始化视图矩阵
  const vpMatrix = new Matrix4()
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100)
  vpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)

  const modelMatrix = new Matrix4()
  const normalMatrix = new Matrix4()
  const mvpMatrix = new Matrix4()

  gl.clearColor(0, 0, 0, 1)
  gl.enable(gl.DEPTH_TEST)

  const createTick = () => {
    let timeStart = null
    let currentAngle = 0
    const tick =  now => {
      if (!timeStart) {
        timeStart = now
      }
      const elapsed = now - timeStart
      // 每秒旋转 30°
      const angle = (elapsed * 30.0 / 1000.0) % 360
      modelMatrix.setRotate(angle, 0, 1, 0)
      mvpMatrix.set(vpMatrix).multiply(modelMatrix)
      gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements)

      // 设置法向量矩阵
      normalMatrix.setInverseOf(modelMatrix)
      normalMatrix.transpose()
      gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix.elements)
      
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)

      requestAnimationFrame(tick)
    }
    return tick
  }

  const tick = createTick()

  requestAnimationFrame(tick)
}

function initArrayBuffer(gl, location, data, num, type) {
  const buffer = gl.createBuffer(location)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  gl.vertexAttribPointer(location, num, type, false, 0, 0)
  gl.enableVertexAttribArray(location)
}