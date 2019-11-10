const ComputerBots = [
  {
    botName: 'Sitting Duck',
    botScript: `class SittingDuck extends Bot {
      init() {
        this.setColor(Bot.GREEN);
      }
    }`,
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
];

module.exports = ComputerBots;
