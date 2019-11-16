import React from 'react';
import PropTypes from 'prop-types';
import BotImages from '../../helpers/BotImages';
import BulletImages from '../../helpers/BulletImages';

class BattleArena extends React.Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.pxratio = window.devicePixelRatio || 1;
    this.props.socket.on('status', this.onStatusUpdate);
    this.props.socket.on('matchEnded', this.onMatchEnd);
  }

  componentDidMount() {
    this.resizeCanvas();
    this.clearArena();
  }

  componentWillUnmount() {
    this.props.socket.removeListener('matchEnded', this.onMatchEnd);
    this.props.socket.removeListener('status', this.onStatusUpdate);
  }

  onMatchEnd = (msg) => {
    if (msg.results.status === 'canceled') {
      this.clearArena();
    }
  }

  onStatusUpdate = (match) => {
    this.renderCanvas(match);
  }

  render() {
    return (
      <canvas id="arena" ref={ n => this.canvas = n }></canvas>
    );
  }

  resizeCanvas = () => {
    if (!this.canvas || !this.pxratio) {
      return;
    }
    if (this.canvas.parentNode.offsetWidth < this.canvas.parentNode.offsetHeight) {
      this.width = this.canvas.parentNode.offsetWidth;
      this.height = this.width;
      this.canvas.width = this.width * this.pxratio;
      this.canvas.height = this.width;
      this.canvas.style.width = Math.floor(this.width) + "px";
      this.canvas.style.height = Math.floor(this.width) + "px";
      console.log(`width: ${this.width}`);
    }
    else {
      this.height = this.canvas.parentNode.offsetHeight;
      this.width = this.height;
      this.canvas.height = this.height * this.pxratio;
      this.canvas.width = this.height * this.pxratio;
      this.canvas.style.height = Math.floor(this.height) + "px";
      this.canvas.style.width = Math.floor(this.height) + "px";
      console.log(`width: ${this.height}`);
    }
  }

  clearArena = () => {
    if (!this.canvas) {
      return;
    }
    const ctx = this.canvas.getContext("2d");
    ctx.save();
    ctx.scale(this.pxratio, this.pxratio);

    ctx.fillStyle = "#c1b49a";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  renderCanvas = (match) => {
    if (!this.canvas) {
      return;
    }
    const ctx = this.canvas.getContext("2d");
    ctx.save();
    ctx.scale(this.pxratio, this.pxratio);

    this.clearArena();

    const scale = this.width / match.arena.width; // px per m

    match.bots.forEach((bot) => {
      this.renderBot(ctx, bot, scale);
    });

    match.bullets.forEach((bullet) => {
      this.renderBullet(ctx, bullet, scale);
    });

    ctx.restore();
  }

  renderBot = (ctx, bot, scale) => {
    const PAD = 8; // px
    const HP_HEIGHT = 4; // px
    const HP_WIDTH = Math.max(bot.width, bot.height) * scale; // px
    if (!BotImages[bot.color].tank.loaded || !BotImages[bot.color].barrel.loaded || !BotImages.broken.tank.loaded || !BotImages.broken.barrel.loaded) {
      return;
    }
    // tank
    ctx.save();
    ctx.translate(bot.location.x * scale, bot.location.y * scale);
    ctx.rotate(bot.rotation);
      if (bot.alive) {
        ctx.drawImage(BotImages[bot.color].tank.image, -bot.width * scale / 2, -bot.height * scale / 2, bot.width * scale, bot.height * scale);
      }
      else {
        ctx.drawImage(BotImages.broken.tank.image, -bot.width * scale / 2, -bot.height * scale / 2, bot.width * scale, bot.height * scale);
      }
      // barrel
      ctx.save();
      ctx.rotate(bot.barrel.rotation);
      if (bot.alive) {
        ctx.drawImage(BotImages[bot.color].barrel.image, -bot.barrel.width * scale / 2, -bot.barrel.height * scale / 2, bot.barrel.width * scale, bot.barrel.height * scale);
      }
      else {
        ctx.drawImage(BotImages.broken.barrel.image, -bot.barrel.width * scale / 2, -bot.barrel.height * scale / 2, bot.barrel.width * scale, bot.barrel.height * scale);
      }
      ctx.restore();
    ctx.restore();

    // health bar
    ctx.save();
    ctx.translate(bot.location.x * scale, bot.location.y * scale);
    const pctHp = bot.hp / bot.maxHp;
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(-HP_WIDTH / 2, bot.height * scale / 2 + PAD, HP_WIDTH, HP_HEIGHT);
    ctx.fillStyle = "#5F9F53";
    ctx.fillRect(-HP_WIDTH / 2, bot.height * scale / 2 + PAD, HP_WIDTH * pctHp, HP_HEIGHT);
    ctx.restore();

    // name
    ctx.save();
    ctx.translate(bot.location.x * scale, bot.location.y * scale);
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(bot.name, 0, -(bot.height * scale / 2 + PAD));
    ctx.restore();
  }

  renderBullet = (ctx, bullet, scale) => {
    if (!BulletImages.bullet.loaded) {
      return;
    }
    // console.log('renderBullet', bullet.location.x * scale, bullet.location.y * scale, bullet.width * scale, bullet.height * scale);
    ctx.save();
    ctx.translate(bullet.location.x * scale, bullet.location.y * scale);
    ctx.drawImage(BulletImages.bullet.image, -bullet.width * scale / 2, -bullet.height * scale / 2, bullet.width * scale, bullet.height * scale);
    ctx.restore();
  }
}

module.exports = BattleArena;
