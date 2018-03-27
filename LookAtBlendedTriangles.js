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
  // 获得全局变量
  const mvpMatrixLocation = gl.getUniformLocation(program, 'u_mvpMatrix')
  
  // 三个三角形
  const triangles = new Float32Array([
    0.0,  0.5,  -0.4,  0.4,  1.0,  0.4,  0.4, // The back green one
   -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,  0.4,
    0.5, -0.5,  -0.4,  1.0,  0.4,  0.4,  0.4, 
   
    0.5,  0.4,  -0.2,  1.0,  0.4,  0.4,  0.4, // The middle yerrow one
   -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,  0.4,
    0.0, -0.6,  -0.2,  1.0,  1.0,  0.4,  0.4, 

    0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  0.4,  // The front blue one 
   -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,  0.4,
    0.5, -0.5,   0.0,  1.0,  0.4,  0.4,  0.4, 
  ])

  const fsize = triangles.BYTES_PER_ELEMENT

  const viewMatrix = new Matrix4()
  const projMatrix = new Matrix4()
  projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW)

  // 连接坐标和颜色缓冲
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, fsize * 7, 0)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, fsize * 7, fsize * 3)
  gl.enableVertexAttribArray(colorLocation)

  // 设置画布颜色
  gl.clearColor(0,0,0,1)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  // 指定混合方法
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA)

  const state = {
    eye: [0.20, 0.25, 0.25]
  }

  const draw = () => {
    const { eye } = state
    viewMatrix.setLookAt(eye[0], eye[1], eye[2], 0, 0, 0, 0, 1, 0)
    const mvpMatrix = new Matrix4()
    mvpMatrix.set(projMatrix).multiply(viewMatrix)
    gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.drawArrays(gl.TRIANGLES, 0, triangles.length / 7)
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      state.eye[0] = state.eye[0] + 0.01
    } else if (e.key === 'ArrowLeft') {
      state.eye[0] = state.eye[0] - 0.01
    } else return
    draw()
  })

  draw()
}