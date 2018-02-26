function main() {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }
  
  // 初始化 webgl 程序
  const program = createProgramFromScripts(gl, '#vertex-shader', '#fragment-shader')
  gl.useProgram(program)

  // 获得属性
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord')
  
  // 获得全局变量
  const samplerLocation = gl.getUniformLocation(program, 'u_sampler')

  // 配置顶点和纹理坐标
  const positions = new Float32Array([
    -0.5, 0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, -0.5, 1.0, 0.0
  ])

  const n = 4

  const fsize = positions.BYTES_PER_ELEMENT

  // 创建缓冲区，并注入数据
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  // 连接缓冲区和属性
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, fsize * 4, 0)
  gl.enableVertexAttribArray(positionLocation)

  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, fsize * 4, fsize * 2)
  gl.enableVertexAttribArray(texcoordLocation)

  // 初始化纹理
  const texture = gl.createTexture()
  const image = new Image()
  image.onload = function() {
    // 在图片加载完成后加载纹理
    loadTexture(gl, n, texture, samplerLocation, image)
  }
  image.src = './resources/sky.jpg'
  return true
}

function loadTexture(gl, n, texture, samplerLocation, image) {
  // 对图像进行 y 轴反转
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  // 开启 0 号纹理单元
  gl.activeTexture(gl.TEXTURE0)
  // 绑定纹理对象到 gl.TXTURE_2D
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 配置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  // 配置纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

  // 将 0 号纹理传递给着色器
  gl.uniform1i(samplerLocation, 0)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
}