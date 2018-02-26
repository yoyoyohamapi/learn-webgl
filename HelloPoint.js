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
  const colorLocation = gl.getUniformLocation(program, 'u_color')

  // 创建缓冲
  const positionBuffer = gl.createBuffer(positionLocation)

  // 设置背景色
  gl.clearColor(0, 0, 0, 1)
  // 清空颜色缓冲区，以清除画布
  gl.clear(gl.COLOR_BUFFER_BIT)
  
  // 设置像素颜色
  gl.uniform4f(colorLocation, 1.0, 0.0, 0.0, 1.0)

  function createClickHandler() {
    const points = []
    return e => {
      gl.clear(gl.COLOR_BUFFER_BIT)
      const { clientX, clientY, target } = e
      const { height, width } = canvas
      const { top, left } = target.getBoundingClientRect()
      const x = ((clientX - left) - width/2)/(width/2)
      const y = -((clientY - top) - height/2)/(height/2)
      
      points.push(x)
      points.push(y)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(positionLocation)
      gl.drawArrays(gl.POINTS, 0, points.length / 2)

      // points.push({x, y})
      // points.forEach(point => {
      //   gl.vertexAttrib3f(positionLocation, point.x, point.y, 0, 0)
      //   gl.drawArrays(gl.POINTS, 0, 1)
      // })
    }
  }
  // 绑定 canvas 的鼠标点击事件
  canvas.onmousedown = createClickHandler()
}