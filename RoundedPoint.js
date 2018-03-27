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

  const vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ])

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(positionLocation)

  gl.clearColor(0, 0, 0, 1.0)

  gl.clear(gl.COLOR_BUFFER_BIT)
  
  gl.drawArrays(gl.POINTS, 0, vertices.length / 2)
}