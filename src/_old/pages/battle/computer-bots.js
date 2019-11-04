angular.module('app').service('ComputerBots', function() {
  var ComputerBots = [
    {
      botName: 'Sitting Duck',
      botScript: "class SittingDuck extends Bot { constructor() { super(); } init() { this.setColor(Bot.BLUE); } }"
    },
    {
      botName: 'Turn and Shoot',
      botScript: "class RotateAndFire extends Bot {constructor() {super();} init() {this.setColor(Bot.BLUE);} start() {this.rotateAndFire();} rotateAndFire() {Promise.all([this.reload(),this.rotateBarrel(30)]).then(() => this.fire()).then(() => this.rotateAndFire())} }"
    }
  ];

  return ComputerBots;
});
