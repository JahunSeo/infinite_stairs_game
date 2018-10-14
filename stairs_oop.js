class BackGround {
  constructor(ctx) {
    this.ctx = ctx
    this.body = new Image()
    this.body.src = "images/bg.png"
    this.x = 0
    this.y = 0
  }
  show() {
    this.ctx.drawImage(this.body, this.x, this.y)
  }
}

class Bird {
  constructor(ctx) {
    this.ctx = ctx
    this.body = new Image()
    this.body.src = "images/bird.png"
    this.dir = -1
    this.x = 100
    this.y = 270
    this.width = 40
    this.height = 30
  }
  show() {
    // save the unrotated context of the canvas so we can restore it later
    // the alternative is to untranslate & unrotate after drawing
    this.ctx.save()
    // flip the canvas to the specified direction
    this.ctx.scale(this.dir, 1)
    // draw the image
    // since the context is rotated, the image will be scaled also
    let flippedX =
      this.dir === 1 ? this.dir * this.x : this.dir * this.x - this.body.width

    this.ctx.drawImage(this.body, flippedX, this.y, this.width, this.height)
    // we’re done with the scaling so restore the unrotated context
    this.ctx.restore()
  }
  changeDirection() {
    this.dir = this.dir === 1 ? -1 : 1
  }
  isOnStone(stone) {
    let condX = this.x === stone.x
    let condY =
      this.y + this.height >= stone.y &&
      this.y + this.height <= stone.y + stone.height
    return condX && condY
  }
  fall() {
    this.y += 3
  }
  isOffScreen() {
    return this.y > 400 // canvas.height
  }
}

class Stone {
  constructor(ctx, x, y) {
    this.ctx = ctx
    // this.body = new Image()
    // this.body.src = "images/pipeSouth.png"
    this.x = x
    this.y = y
    this.width = 40
    this.height = 20
  }
  show() {
    // this.ctx.drawImage(this.body, this.x, this.y, this.width, this.height)
    this.ctx.fillStyle = "brown"
    this.ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.beginPath()
    ctx.lineWidth = "2"
    ctx.strokeStyle = "black"
    ctx.rect(this.x, this.y, this.width, this.height)
    ctx.stroke()
  }
  goDown(dir) {
    this.x += -1 * dir * this.width
    this.y += this.height
  }
  isOffScreen() {
    return this.y > 400 // canvas.height
  }
  nextStone(array) {
    let dir = Math.random() < 0.5 ? -1 : 1
    return new Stone(this.ctx, this.x - dir * this.width, this.y - this.height)
  }
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////

const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

// const startBtn = document.getElementById("start")
// startBtn.addEventListener("click", e => {
//   setup()
// })

let gameOn = false
let bg
let bird
let stones

function setup() {
  console.log("setup game!")
  gameOn = true
  bg = new BackGround(ctx)
  bird = new Bird(ctx)
  stones = []
  stones[0] = new Stone(ctx, 100, 300)
  stones[1] = new Stone(ctx, 60, 280)

  for (let i = 0; i < 400 / 20; i++) {
    stones.push(stones[stones.length - 1].nextStone(stones))
  }
}

// function draw() {
//   bg.show()
//   for (let stone of stones) {
//     stone.show()
//   }
//   if (!gameOn && !bird.isOffScreen()) {
//     bird.fall()
//   }
//   if (!gameOn && bird.isOffScreen()) {
//     setup()
//   }
//   bird.show()
//   requestAnimationFrame(draw)
// }

function drawPlay() {
  bg.show()
  for (let stone of stones) {
    stone.show()
  }
  bird.show()
  if (!gameOn && !bird.isOffScreen()) {
    requestAnimationFrame(drawGameOver)
  } else {
    requestAnimationFrame(drawPlay)
  }
}

function drawGameOver() {
  bg.show()
  for (let stone of stones) {
    stone.show()
  }
  bird.fall()
  bird.show()
  if (!gameOn && bird.isOffScreen()) {
    setup()
    requestAnimationFrame(drawPlay)
  } else {
    requestAnimationFrame(drawGameOver)
  }
}

document.addEventListener("keydown", e => {
  if (gameOn) {
    switch (event.keyCode) {
      case 38: // up
        upAndCheck()
        break
      case 32: // spacebar
        turnUpAndCheck()
        break
    }
  }
})

function upAndCheck() {
  let safe = false
  for (let i = stones.length - 1; i >= 0; i--) {
    stones[i].goDown(bird.dir)
    if (bird.isOnStone(stones[i])) {
      safe = true
    }
    if (stones[i].isOffScreen()) {
      stones.splice(i, 1)
    }
  }
  if (!safe) {
    gameOn = false
    console.log("gameover")
  }

  stones.push(stones[stones.length - 1].nextStone(stones))
}

function turnUpAndCheck() {
  bird.changeDirection()
  upAndCheck()
}

setup()
drawPlay()
