function main() {
  const canvas = document.querySelector('#canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    return 
  }

  const program = createProgramFromScripts(gl, '#vertex-shader', '#fragment-shader')
  gl.useProgram(program)

  const triangle = [
    -0.5, 0,
    0, 0.5,
    0.5, 0
  ]

  // 获得属性
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  // 获得全局变量
  const colorLocation = gl.getUniformLocation(program, 'u_color')

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const positionBuffer =  gl.createBuffer(positionLocation) 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STATIC_DRAW)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(positionLocation)
  gl.uniform4f(colorLocation, 1.0, 1.0, 0.0, 1.0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}