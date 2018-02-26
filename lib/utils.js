function createProgramFromScripts(gl, vertexSelector, fragmentSelector) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSelector)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSelector)
  return createProgram(gl, vertexShader, fragmentShader) 
}

function createShader(gl, type, selector) {
  const shader = gl.createShader(type)
  const source = document.querySelector(selector).text
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }
  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

class Matrix {
  constructor(matrix) {
    this.matrix = matrix
  }

  multiply(matrix) {
    const b = matrix.getMatrix()
    const a = this.getMatrix()
    const newMatrix = [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    ]
    for (let i = 0; i < 4; i++) {
      const ai0 = a[i]
      const ai1=a[i+4]
      const ai2=a[i+8]
      const ai3=a[i+12]
      newMatrix[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3]
      newMatrix[i+4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7]
      newMatrix[i+8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11]
      newMatrix[i+12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15]
    }
    return new Matrix(newMatrix)
  }

  getMatrix() {
    return new Float32Array(this.matrix)
  }

  transpose(matrix) {

  }
  
  inverse(matrix) {

  }
}

const matrixUtils = {
  getTranslateMatrix(tx, ty, tz) {
    return new Matrix([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      tx, ty, tz, 1.0
    ])
  },
  getRotateMatrix(angle) {
    // 角度转换为弧度
    const radian = Math.PI * angle / 180.0
    // 计算正弦、余弦
    const cos = Math.cos(radian)
    const sin = Math.sin(radian)
    return new Matrix([
      cos, sin, 0.0, 0.0,
      -sin, cos, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ])
  },
  getScaleMatrix(sx, sy, sz) {
    return new Matrix([
      sx, 0.0, 0.0, 0.0,
      0.0, sy, 0.0, 0.0,
      0.0, 0.0, sz, 0.0,
      0.0, 0.0, 0.0, 1.0
    ])
  },
  getIdentityMatrix() {
    return new Matrix([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0 
    ])
  }
}