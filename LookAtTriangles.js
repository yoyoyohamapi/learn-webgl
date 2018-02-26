function main() {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  // 初始化程序
  const program = createProgramFromScripts(gl, '#vertex-shader', '#fragment-shader')
  gl.useProgram(program)

  // 获得属性
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const colorLocation = gl.getAttribLocation(program, 'a_color')
  // 获得全局变量
  const viewMatrixLocation = gl.getUniformLocation(program, 'u_viewMatrix')
  
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

  // 设置视图矩阵：
  // 视点为原点
  // 观察点为 Z 轴负方向
  // 上方向为 Y 轴正方向
  const viewMatrix = new Matrix4()
  viewMatrix.setLookAt(0.20,0.25,0.25,0,0,0,0,1,0)
  gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix.elements)

  // 设置顶点和颜色
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW)

  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, fsize * 6, 0)
  gl.enableVertexAttribArray(positionLocation)

  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, fsize * 6, fsize * 3)
  gl.enableVertexAttribArray(colorLocation)

  gl.drawArrays(gl.TRIANGLES, 0, 3 * 3)
}
