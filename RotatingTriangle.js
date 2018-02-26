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
  // 获得全局变量
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix') 
  const colorLocation = gl.getUniformLocation(program, 'u_color')

  // 三角形
  const triangle = [
    -0.5, -0.5,
    0.0, 0.5,
    0.5, -0.5
  ]
  // 颜色
  const color = [1.0, 0.0, 0.0, 1.0]
  // 旋转角度
  const angleStep = 45.0
  // 矩阵
  const matrix = new Matrix4()
  const time = {
    start: null
  }

  // 清空画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 设置位置
  const positionBuffer = gl.createBuffer(positionLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STATIC_DRAW)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(positionLocation)
  // 设置片元着色器颜色
  gl.uniform4f(colorLocation, ...color)
  
  // 每秒旋转 45°
  const tick = now => {
    if (!time.start) {
      time.start = Date.now()
    }
    const elapsed = now - time.start
    const angle = animate(elapsed)
    draw(angle)
    requestAnimationFrame(tick)
  }

  const draw = angle => {
    matrix.setRotate(angle, 0, 0, 1)
    gl.uniformMatrix4fv(matrixLocation, false, matrix.elements)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const animate = elapsed => {
    const angle = (angleStep * elapsed)/1000.0
    return angle % 360
  }

  requestAnimationFrame(tick)
}
