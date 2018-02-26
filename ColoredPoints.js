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
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      // 颜色
      gl_FragColor = u_FragColor;
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
  const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const points = []
  const colors = []
  canvas.onmousedown = e => {
    const { clientX, clientY, target } = e
    const { height, width } = canvas
    const { top, left } = target.getBoundingClientRect()
    const x = ((clientX - left) - width/2)/(width/2)
    const y = -((clientY - top) - height/2)/(height/2)
    points.push({x, y})

    if (x > 0.0 && y >= 0.0) {
      // 第一象限
      colors.push({
        r: 1.0,
        g: 0.0,
        b: 0.0,
        alpha: 1.0
      })
    } else if (x < 0.0 && y < 0.0) {
      // 第三象限
      colors.push({
        r: 0.0,
        g: 1.0,
        b: 0.0,
        alpha: 1.0
      })
    } else {
      // 其他
      colors.push({
        r: 1.0,
        g: 1.0,
        b: 1.0,
        alpha: 1.0
      })
    }

    gl.clear(gl.COLOR_BUFFER_BIT)
    points.forEach((point, index) => {
      const color = colors[index]
      gl.vertexAttrib3f(a_Position, point.x, point.y, 0, 0)
      gl.uniform4f(u_FragColor, color.r, color.g, color.b, color.alpha)
      gl.drawArrays(gl.POINTS, 0, 1)
    })
  }
}
