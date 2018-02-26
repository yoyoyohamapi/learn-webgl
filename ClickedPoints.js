function main() {
  const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    void main() {
      // 顶点位置
      gl_Position = a_Position;
      // 顶点半径
      gl_PointSize = 10.0;
    }
  `

  const FSHADER_SOURCE = `
    void main() {
      // 颜色
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `

  const canvas = document.getElementById('webgl')

  const gl = getWebGLContext(canvas)

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')


  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const points = []
  canvas.onmousedown = e => {
    const { clientX, clientY, target } = e
    const { height, width } = canvas
    const { top, left } = target.getBoundingClientRect()
    const x = ((clientX - left) - width/2)/(width/2)
    const y = -((clientY - top) - height/2)/(height/2)
    points.push({x, y})

    gl.clear(gl.COLOR_BUFFER_BIT)
    points.forEach(point => {
      gl.vertexAttrib3f(a_Position, point.x, point.y, 0, 0)
      gl.drawArrays(gl.POINTS, 0, 1)
    })
  }
}
