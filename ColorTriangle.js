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

  // 三角形的顶点和颜色
  const triangle = new Float32Array([
    0.0, 0.5, 1.0, 0.0, 0.0,
    -0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, -0.5, 0.0, 0.0, 1.0
  ])

  const fsize = triangle.BYTES_PER_ELEMENT

  // 创建缓冲区
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW)

  // 清空缓冲区
  gl.clearColor(0.0, 0.0, 0.0, 1.0) 
  gl.clear(gl.COLOR_BUFFER_BIT)
 
  // 设置坐标
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, fsize * 5, 0)
  gl.enableVertexAttribArray(positionLocation)
  // 设置颜色
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, fsize * 5, fsize * 2)
  gl.enableVertexAttribArray(colorLocation)

  gl.drawArrays(gl.TRIANGLES, 0, 3)
}