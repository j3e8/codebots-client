const ComputerBots = [
  {
    botName: 'Sitting Duck',
    botScript: `class SittingDuck extends Bot {}`,
  },
  {
    botName: 'Turn and Shoot',
    botScript: `class RotateAndFire extends Bot {
      init() {
        this.setColor(Bot.BLUE);
      }

      start() {
        this.rotateAndFire();
      }

      rotateAndFire() {
        Promise.all([
          this.reload(),
          this.rotateBarrel(30)
        ])
        .then(() => this.fire())
        .then(() => this.rotateAndFire())
      }
    }`,
  },
  {
    botName: 'Fire',
    botScript: `class Fire extends Bot {
      init(id, name) {
        this.setColor(Bot.GRAY);
      }

      start() {
        this.reloadAndFire();
      }

      reloadAndFire() {
        this.reload()
          .then(() => this.fire())
          .then(() => this.reloadAndFire())
          .catch((err) => this.log(err));
      }
    }`
  },
  {
    botName: 'Random Bot',
    botScript: `class RandomBot extends Bot {

      init(id, name) {
        this.setColor(Bot.RED);
      }

      start() {
        this.move()
        this.rotate()
        this.spitFire()
      }

      async spitFire(){
        await this.reload()
        await this.fire()
        this.spitFire()
      }

      async rotate(){
        await this.rotateTo(Math.random()*360)
        this.rotate()
      }

      async move(){
        await this.forward(20)
        this.move()
      }
    }`
  },
];

module.exports = ComputerBots;
