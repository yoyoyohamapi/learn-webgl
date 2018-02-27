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
  const matrixLocation = gl.getUniformLocation(program, 'u_projMatrix')

  // 三角形
  const triangles = new Float32Array([
     0.0,  0.6,  -0.4,  0.4,  1.0,  0.4,
    -0.5, -0.4,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.4,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4,
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0,
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
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

  // 新建投影矩阵
  const projMatrix = new Matrix4()

  const $info = document.querySelector('#info')

  // 设置画布颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  const getValidFloat = value => Math.round(value * 100) / 100
  const draw = (near, far) => {
    projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, near, far)
    gl.uniformMatrix4fv(matrixLocation, false, projMatrix.elements)
    gl.clear(gl.COLOR_BUFFER_BIT)
    info.textContent = `near:${getValidFloat(near)} far:${getValidFloat(far)}`
    gl.drawArrays(gl.TRIANGLES, 0, 3*3)
  }

  const step = 0.01
  let near = 0.0
  let far = 1.0

  document.onkeydown = e => {
    // 上下调节 far
    // 左右调节 near
    if (e.keyCode === 39) {
      near += step
    } else if (e.keyCode === 37) {
      near -= step
    } else if (e.keyCode === 38) {
      far += step
    } else if (e.keyCode === 40) {
      far -= step
    } else {
      return
    }

    draw(near, far)
  }

  draw(near, far)
}
