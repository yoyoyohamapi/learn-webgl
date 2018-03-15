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

  // 获得全局变量
  const mvpMatrixLocation = gl.getUniformLocation(program, 'u_mvpMatrix')
  const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix')

  // 设置各个关节顶点
  const vertices = new Float32Array([
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
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

  // 初始化 array buffer
  initArrayBuffer(gl, positionLocation, vertices, 3, gl.FLOAT)
  initArrayBuffer(gl, normalLocation, normals, 3, gl.FLOAT)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  // 初始化 element array buffer
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  // 初始化矩阵
  const mvpMatrix = new Matrix4()
  const normalMatrix = new Matrix4()
  let modelMatrix = new Matrix4()
  const viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0)
  viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

  // 设置状态量
  const ANGLE_STEP = 30.0
  let arm1Angle = 0.0
  let joint1Angle = 0.0
  let joint2Angle = 0.0
  let joint3Angle = 0.0

  // 设置按键监听
  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowUp':
        if (joint1Angle < 135.0) joint1Angle += ANGLE_STEP
        break
      case 'ArrowDown':
        if (joint1Angle > -135.0) joint1Angle -= ANGLE_STEP
        break
      case 'ArrowLeft':
        arm1Angle = (arm1Angle + ANGLE_STEP) % 360
        break
      case 'ArrowRight':
        arm1Angle = (arm1Angle - ANGLE_STEP) % 360
        break
      case 'c':
        if (joint3Angle > -60.0)  joint3Angle = (joint3Angle - ANGLE_STEP) % 360;
        break
      case 'v':
        if (joint3Angle < 60.0)  joint3Angle = (joint3Angle + ANGLE_STEP) % 360;
        break
      case 'x':
        joint2Angle = (joint2Angle - ANGLE_STEP) % 360
        break
      case 'z':
        joint2Angle = (joint2Angle + ANGLE_STEP) % 360
        break
    }
    draw()
  })

  const draw = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // 绘制底座
    const baseHeight = 2.0
    modelMatrix.setTranslate(0.0, -12.0, 0.0)
    drawBox(10.0, baseHeight, 10.0)

    // 绘制 arm1
    const arm1Length = 10.0
    // 移动到底座上开始绘制
    modelMatrix.translate(0.0, baseHeight, 0.0)
    // arm1 绕着 y 轴进行转动
    modelMatrix.rotate(arm1Angle, 0.0, 1.0, 0.0)
    drawBox(3.0, arm1Length, 3.0)

    // 绘制 arm2
    const arm2Length = 10.0
    modelMatrix.translate(0.0, arm1Length, 0.0)
    modelMatrix.rotate(joint1Angle, 0.0, 0.0, 1.0)
    drawBox(4.0, arm2Length, 4.0)

    // 绘制 palm
    const palmLength = 2.0
    modelMatrix.translate(0.0, arm2Length, 0.0)
    modelMatrix.rotate(joint2Angle, 0.0, 1.0, 0.0)
    drawBox(2.0, palmLength, 6.0)

    // 绘制两根手指
    modelMatrix.translate(0.0, palmLength, 0.0)

    pushMatrix(modelMatrix)
    modelMatrix.translate(0.0, 0.0, 2.0)
    modelMatrix.rotate(joint3Angle, 1.0, 0.0, 0.0)
    drawBox(1.0, 2.0, 1.0)
    modelMatrix = popMatrix()

    modelMatrix.translate(0.0, 0.0, -2.0)
    modelMatrix.rotate(joint3Angle, 1.0, 0.0, 0.0)
    drawBox(1.0, 2.0, 1.0)
  }

  const drawBox = (width, height, depth) => {
    pushMatrix(modelMatrix)
    modelMatrix.scale(width, height, depth)
    mvpMatrix.set(viewProjMatrix)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements)

    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()
    gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix.elements)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)

    // 恢复 model matrix
    modelMatrix = popMatrix()
  }

  const matrixStack = []
  const pushMatrix = matrix => {
    matrixStack.push(new Matrix4(matrix))
  } 
  const popMatrix = () => matrixStack.pop()

  // 进行第一次绘制
  gl.clearColor(0,0,0,1)
  gl.enable(gl.DEPTH_TEST)
  draw()
}

function initArrayBuffer(gl, location, data, num, type) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  gl.vertexAttribPointer(location, num, type, false, 0, 0)
  gl.enableVertexAttribArray(location)
}