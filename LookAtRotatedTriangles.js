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
  // 获得全局变量的位置
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')

  // 三个三角形
  const triangles = new Float32Array([
    0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // 绿色靠后的三角形
    -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
    0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
  
    0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // 中间的黄色三角形
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
    0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

    0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // 最前面的三角形
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
    0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  ])

  const fsize = triangles.BYTES_PER_ELEMENT
  
  // 创建缓存，并向缓存中注入数据
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW)

  // 设置旋转矩阵
  const rotateMatrix = new Matrix4()
  rotateMatrix.setRotate(-10, 0, 0, 1) // 绕着 z 轴旋转 -10°

  // 设置视角矩阵
  const viewMatrix = new Matrix4()
  viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0)

  const matrix = viewMatrix.multiply(rotateMatrix)
  
  // 设置变换矩阵
  gl.uniformMatrix4fv(matrixLocation, false, matrix.elements)
  
  // 设置坐标和颜色
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, fsize * 6, 0)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, fsize * 6, fsize * 3)
  gl.enableVertexAttribArray(colorLocation)

  // 进行绘制
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0,3 * 3)
}