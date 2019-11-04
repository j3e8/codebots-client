const BotImages = {};

const colors = ['green','blue','red','gray','tan'];
colors.forEach(function(color) {
  BotImages[color] = {
    tank: {
      image: new Image()
    },
    barrel: {
      image: new Image()
    }
  }

  BotImages[color].tank.image.src = '/www/images/tank-' + color + '.svg';
  BotImages[color].tank.image.onload = function() {
    BotImages[color].tank.loaded = true;
  }

  BotImages[color].barrel.image.src = '/www/images/barrel-' + color + '.svg';
  BotImages[color].barrel.image.onload = function() {
    BotImages[color].barrel.loaded = true;
  }
})

BotImages.broken = {
  tank: {
    image: new Image()
  },
  barrel: {
    image: new Image()
  }
}

BotImages.broken.tank.image.src = '/www/images/tank-broken.svg';
BotImages.broken.tank.image.onload = function() {
  BotImages.broken.tank.loaded = true;
}

BotImages.broken.barrel.image.src = '/www/images/barrel-broken.svg';
BotImages.broken.barrel.image.onload = function() {
  BotImages.broken.barrel.loaded = true;
}

export default BotImages;
