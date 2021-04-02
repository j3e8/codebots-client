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
    botName: 'Chaser',
    botScript: `function angleBetweenTwoPoints(a, b) {
      const rise = b.y - a.y;
      const run = b.x - a.x;
      let angle = Math.atan(rise/run);
      if (run < 0) {
        angle += Math.PI;
      }
      let degreeAngle = angle / Math.PI * 180;
      if (degreeAngle < 0) {
        degreeAngle += 360;
      }
      return degreeAngle;
    }

    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      });
    }

    class Chaser extends Bot {
      init(id, name) {
        this.id = id;
        this.name = name;
        this.setColor(Bot.PINK);
      }

      start() {
        this.chase();
        this.reloadAndFire();
      }

      async chase() {
        this.log('chase');
        const results = await this.scan();
        const oldTarget = this.target;
        this.target = results.bots.find(b => b.id !== this.id && b.alive);
        if (!oldTarget || oldTarget.id !== this.target.id) {
          this.broadcast(\`Target acquired: \${this.target.name}\`);
        }
        this.log('2');
        const me = results.bots.find(b => b.id === this.id);
        this.log('me', me);
        const angle = angleBetweenTwoPoints(me.location, this.target.location);

        console.log(angle);

        this.rotateTo(angle);
        this.forward(15);
        this.chase();
      }

      async reloadAndFire() {
        await this.reload();
        await this.fire();
        this.reloadAndFire();
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
