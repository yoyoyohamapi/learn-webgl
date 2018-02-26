// 顶点着色器
const VSHADER_SOURCE = `
  void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // 顶点坐标
    gl_PointSize = 10.0; // 顶点大小
  }
`

// 片元着色器
const FSHADER_SOURCE = `
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 设置颜色
  }
`

function main() {
  const canvas = document.getElementById(('webgl'))

  const gl = getWebGLContext(canvas)
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }

  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.')
    return
  }

  // 设置 canvas 背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 清空 <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 使用着色器绘制一个点
  gl.drawArrays(gl.POINTS, 0, 1)
}
