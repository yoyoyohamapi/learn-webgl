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
  const sampler0Location = gl.getUniformLocation(program, 'u_sampler0')
  const sampler1Location = gl.getUniformLocation(program, 'u_sampler1')

  // 顶点坐标与纹理坐标
  const positions = new Float32Array([
    -0.5, 0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, -0.5, 1.0, 0.0
  ])
  const fsize = positions.BYTES_PER_ELEMENT
  const n = 4

  // 创建缓存、向缓存注入数据
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  
  // 连接位置缓存
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, fsize * 4, 0)
  gl.enableVertexAttribArray(positionLocation)
  
  // 连接纹理缓存
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, fsize * 4, fsize * 2)
  gl.enableVertexAttribArray(texcoordLocation)

  // 创建纹理
  const texture0 = gl.createTexture()
  const texture1 = gl.createTexture()

  // 新建图像
  const image0 = new Image()
  const image1 = new Image()
  
  image0.onload = function () {
    loadTexture(gl, n, texture0, sampler0Location, image0, 0)
  }

  image1.onload = function () {
    loadTexture(gl, n, texture1, sampler1Location, image1, 1)
  }

  image0.src = './resources/redflower.jpg'
  image1.src = './resources/circle.gif'
}

function createTextureLoader() {
  let texture0Done = false
  let texture1Done = false
  return function(gl, n, texture, samplerLocation, image, texUnit) {
    // 进行 y 轴翻转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    // 激活纹理
    if (texUnit === 0) {
      gl.activeTexture(gl.TEXTURE0)
      texture0Done = true
    } else if (texUnit === 1) {
      gl.activeTexture(gl.TEXTURE1)
      texture1Done = true
    }
    // 绑定纹理到目标对象
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // 设置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    // 分配纹理单元给取样器
    gl.uniform1i(samplerLocation, texUnit)
    // 绘制矩形
    if (texture0Done && texture1Done) {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
    }
  }
}

const loadTexture = createTextureLoader()