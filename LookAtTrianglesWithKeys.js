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

  // 新建视图矩阵
  const viewMatrix = new Matrix4()

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

  // 创建缓存并向缓存中注入数据
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW)

  // 设置坐标和颜色
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, fsize * 6, 0)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, fsize * 6, fsize * 3)
  gl.enableVertexAttribArray(colorLocation)

  // 设置画布颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  const time = {
    start: null
  }

  const draw = dist => {
    // 设置视角矩阵
    viewMatrix.setLookAt(0.20, 0.25, dist, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(matrixLocation, false, viewMatrix.elements)
    // 清除画布并进行绘制
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3 * 3)
  }

  const step = 0.01

  let dist = 0.20

  // 设置z
  document.onkeydown = e => {
    if (e.keyCode === 39) {
      dist += step
    } else if (e.keyCode === 37) {
      dist -= step
    } else {
      return
    }
    draw(dist)
  }

  // 进行第一次绘制
  draw(dist)
}