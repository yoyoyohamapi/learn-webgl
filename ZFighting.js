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
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
  
  // 两个深度一样的三角形
  const triangles = new Float32Array([
    0.0,  2.5,  -5.0,  0.4,  1.0,  0.4, // The green triangle
    -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4,
    2.5, -2.5,  -5.0,  1.0,  0.4,  0.4, 

    0.0,  3.0,  -5.0,  1.0,  0.4,  0.4, // The yellow triagle
    -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
    3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, 
  ])

  const fsize = triangles.BYTES_PER_ELEMENT

  
  // 开启缓冲并向缓冲注入数据
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW)

    
  // 开启隐藏面消除和多边形偏移
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.POLYGON_OFFSET_FILL)

  // 清除画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  
  // 设置位置和颜色
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, fsize * 6, 0)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, fsize * 6, fsize * 3)
  gl.enableVertexAttribArray(colorLocation)

  // 设置视角投影矩阵
  const viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100)
  viewProjMatrix.lookAt(3.06, 2.5, 10.0, 0, 0, -2, 0, 1, 0)
  gl.uniformMatrix4fv(matrixLocation, false, viewProjMatrix.elements)

  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.polygonOffset(1.0, 1.0)
  gl.drawArrays(gl.TRIANGLES, 3, 3)
}