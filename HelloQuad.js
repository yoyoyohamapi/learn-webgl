function main() {
  const canvas = document.querySelector('#canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }
  const program = createProgramFromScripts(gl, '#vertex-shader', '#fragment-shader')
  gl.useProgram(program)

  // 获得属性
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const colorLocation = gl.getUniformLocation(program, 'u_color')

  // 矩阵（两个三角形）
  const rectangle = [
    -0.5, 0.5,
    0.5, 0.5,
    0.5, -0.5,
    -0.5, -0.5,
    -0.5, 0.5,
    0.5, -0.5
  ]

  const color = [1.0, 0.0, 0.0, 1.0]
  // 创建缓冲
  const positionBuffer = gl.createBuffer(positionLocation) 
  // 绑定缓冲
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  // 向缓冲中注入数据
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangle), gl.STATIC_DRAW)
  
  // 清除画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 设置片元着色器颜色
  gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3])

  // 连接属性与缓冲
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(positionLocation)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}