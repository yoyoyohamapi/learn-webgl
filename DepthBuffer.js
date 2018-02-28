function main() {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  const program = createProgramFromScripts(gl, '#vertex-shader', '#fragment-shader')
  gl.useProgram(program)

  // 获得属性位置
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const colorLocation = gl.getAttribLocation(program, 'a_color')
  // 获得全局变量
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')

  // 三个三角形
  const triangles = new Float32Array([
    0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
    0.5, -1.0,   0.0,  1.0,  0.4,  0.4, 

    0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
    -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
    0.5, -1.0,  -2.0,  1.0,  0.4,  0.4,

    0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
    -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
    0.5, -1.0,  -4.0,  1.0,  0.4,  0.4
  ])

  const fsize = triangles.BYTES_PER_ELEMENT

  // 创建缓冲并向缓冲注入数据
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW)

  // 设置坐标和颜色
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, fsize * 6, 0)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, fsize * 6, fsize * 3)
  gl.enableVertexAttribArray(colorLocation)

  // 设置矩阵
  const translateMatrix = new Matrix4()
  const viewMatrix = new Matrix4()
  const projMatrix = new Matrix4()
  const matrix = new Matrix4()
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0)
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)

  // 开启隐藏面消除
  gl.enable(gl.DEPTH_TEST)

  // 重置画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // 绘制左侧的矩形
  translateMatrix.setTranslate(-0.75, 0, 0)
  matrix.set(projMatrix).multiply(viewMatrix).multiply(translateMatrix)
  gl.uniformMatrix4fv(matrixLocation, false, matrix.elements)
  gl.drawArrays(gl.TRIANGLES, 0, 3 * 3)


  // 绘制右侧的矩形
  translateMatrix.setTranslate(0.75, 0, 0)
  matrix.set(projMatrix).multiply(viewMatrix).multiply(translateMatrix)
  gl.uniformMatrix4fv(matrixLocation, false, matrix.elements)
  gl.drawArrays(gl.TRIANGLES, 0, 3 * 3)
}