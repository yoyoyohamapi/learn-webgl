function main() {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  const program = createProgramFromScripts(gl, '#vertex-shader', '#fragment-shader')
  gl.useProgram(program)

  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
  const colorLocation = gl.getUniformLocation(program, 'u_color')

  const color = [1.0, 0.0, 0.0, 1.0]
  const triangle = [
    -0.5, 0,
    0, 0.5,
    0, 0
  ]

  // 旋转矩阵
  const rotateMatrix = matrixUtils.getRotateMatrix(-90)
  // 平移矩阵
  const translateMatrix = matrixUtils.getTranslateMatrix(0, -1, 0)
  // 缩放矩阵
  const scaleMatrix = matrixUtils.getScaleMatrix(2, 2, 0)

  // 清除画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 创建缓冲
  const positionBuffer = gl.createBuffer(positionLocation)
  // 绑定缓冲
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  // 向缓冲注入数据
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STATIC_DRAW)
  // 连接缓冲与属性
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  // 开启属性
  gl.enableVertexAttribArray(positionLocation)

  // 设置片元着色器颜色
  gl.uniform4f(colorLocation, ...color)

  // 设置矩阵
  const matrix = translateMatrix.multiply(scaleMatrix).multiply(rotateMatrix)
  gl.uniformMatrix4fv(matrixLocation, false, matrix.getMatrix())

  // 进行绘制
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}
