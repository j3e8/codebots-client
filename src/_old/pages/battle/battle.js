angular.module('app').controller('battleController', function($scope, CODEBOTS_SOCKET_URL, BotImages, BulletImages, ComputerBots) {

  function reset() {
    $scope.status = 'username';
    $scope.messages = [];

    $scope.cmpBots = ComputerBots;

    $scope.botName = 'test';
    $scope.botScript = `class RotateAndFire extends Bot {
      constructor() {
        super();
      }

      init() {
        this.setColor(Bot.BLUE);
      }

      start() {
        this.rotateAndFire();
      }

      rotateAndFire() {
        console.log('rotateAndFire');
        Promise.all([
          this.reload(),
          this.rotateBarrel(30)
        ])
        .then(() => this.fire())
        .then(() => this.rotateAndFire())
      }
    }
    `;

    try {
      $scope.username = localStorage.getItem('username');
    } catch(ex) { }
  }
  reset();

  var socket;
  var canvas;

  var pxratio = window.devicePixelRatio || 1;

  canvas = document.getElementById('arena');
  if (canvas.parentNode.offsetWidth < canvas.parentNode.offsetHeight) {
    canvas.width = canvas.parentNode.offsetWidth * pxratio;
    canvas.height = canvas.width;
    canvas.style.width = Math.floor(canvas.parentNode.offsetWidth) + "px";
    canvas.style.height = Math.floor(canvas.parentNode.offsetWidth) + "px";
  }
  else {
    canvas.height = canvas.parentNode.offsetHeight * pxratio;
    canvas.width = canvas.height;
    canvas.style.height = Math.floor(canvas.parentNode.offsetHeight) + "px";
    canvas.style.width = Math.floor(canvas.parentNode.offsetHeight) + "px";
  }

  socket = io(CODEBOTS_SOCKET_URL);

  socket.on('connection', function(msg) {
    console.log('connection', msg);
  })

  socket.on('disconnect', function(msg) {
    console.log('disconnected!', msg);
    reset();
    $scope.$apply();
  })

  socket.on('status', function(match) {
    // console.log('status', match);
    render(match);
  });

  socket.on('broadcast', function(msg) {
    console.log('received broadcast', msg);
    $scope.messages.push(msg.bot.name + ': ' + msg.message);
    $scope.$apply();
  });

  socket.on('createRoom', function(msg) {
    console.log('createRoom', msg);
    $scope.me = msg.owner;
    $scope.isRoomOwner = true;
    $scope.status = 'prepare'
    $scope.roomGuid = msg.guid;
    $scope.players = msg.players;
    $scope.$apply();
  });

  socket.on('joinRoomFail', function(msg) {
    $scope.status = 'choose';
    alert("Sorry, couldn't join that room", true);
    console.log('joinRoomFail', msg);
    $scope.$apply();
  });

  socket.on('joinRoomSuccess', function(msg) {
    $scope.me = msg.me;
    $scope.status = 'prepare';
    $scope.roomGuid = msg.guid;
    $scope.players = msg.players;
    clearArena();
    console.log('joinRoomSuccess', msg);
    $scope.$apply();
  });

  socket.on('memberJoined', function(msg) {
    $scope.isRoomOwner = msg.owner.id == $scope.me.id;
    $scope.players = msg.players;
    console.log('memberJoined', msg);
    $scope.$apply();
  });

  socket.on('memberLeft', function(msg) {
    $scope.isRoomOwner = msg.owner.id == $scope.me.id;
    $scope.players = msg.players;
    console.log('memberLeft', msg);
    $scope.$apply();
  });

  socket.on('matchStarted', function(msg) {
    console.log('matchStarted', msg);
    $scope.players = msg.players; // refresh any player data that may have changed during bot initialization
    $scope.status = 'battle';
    $scope.$apply();
  });

  socket.on('matchEnded', function(msg) {
    console.log('matchEnded', msg);
    $scope.status = 'prepare';
    $scope.results = msg.results;
    if (msg.results.status === 'canceled') {
      clearArena();
    }
    $scope.$apply();
  });

  socket.on('selectBotSuccess', function(msg) {
    console.log('selectBotSuccess', msg);
    $scope.players = msg.players;
    $scope.$apply();
  });


  $scope.canStartMatch = function() {
    if ($scope.players && $scope.players.length) {
      var readyPlayers = $scope.players.filter(function(p) { return p.bot; });
      return $scope.isRoomOwner && readyPlayers.length >= 2 && $scope.status != 'battle';
    }
    return false;
  }

  $scope.canStopMatch = function() {
    return $scope.status == 'battle';
  }

  $scope.setUsername = function() {
    console.log('setUsername');
    socket.emit('setUsername', { username: $scope.username });
    try {
      localStorage.setItem('username', $scope.username);
    } catch(ex) { }
    $scope.status = 'choose';
  }

  $scope.createRoom = function() {
    console.log('createRoom');
    socket.emit('createRoom', { });
  }

  $scope.joinRoom = function() {
    console.log('joinRoom', { guid: $scope.roomGuid });
    socket.emit('joinRoom', { guid: $scope.roomGuid });
  }

  $scope.saveScript = function() {
    socket.emit('selectBot', { name: $scope.botName, script: $scope.botScript });
    $scope.toggleEditScript();
  }

  $scope.toggleEditScript = function() {
    $scope.isEditingScript = $scope.isEditingScript ? false : true;
  }

  $scope.toggleCmp = function() {
    $scope.isAddingCmp = $scope.isAddingCmp ? false : true;
  }

  $scope.addCmp = function(cmp) {
    socket.emit('selectCmpBot', { name: cmp.botName, script: cmp.botScript });
    $scope.toggleCmp();
  }

  $scope.startMatch = function() {
    socket.emit('startMatch');
  }

  $scope.stopMatch = function() {
    socket.emit('stopMatch');
  }

  function clearArena() {
    if (!canvas) {
      return;
    }
    var ctx = canvas.getContext("2d");
    ctx.save();
    // ctx.scale(pxratio, pxratio);

    ctx.fillStyle = "#c1b49a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function render(match) {
    if (!canvas) {
      return;
    }
    var ctx = canvas.getContext("2d");
    ctx.save();
    // ctx.scale(pxratio, pxratio);

    clearArena();

    var scale = canvas.width / match.arena.width; // px per m

    match.bots.forEach(function(bot) {
      renderBot(ctx, bot, scale);
    });

    match.bullets.forEach(function(bullet) {
      renderBullet(ctx, bullet, scale);
    });

    ctx.restore();
  }

  function renderBot(ctx, bot, scale) {
    let PAD = 8; // px
    let HP_HEIGHT = 4; // px
    let HP_WIDTH = Math.max(bot.width, bot.height) * scale; // px
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
    let pctHp = bot.hp / bot.maxHp;
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(-HP_WIDTH / 2, bot.height * scale / 2 + PAD, HP_WIDTH, HP_HEIGHT);
    ctx.fillStyle = "#5F9F53";
    ctx.fillRect(-HP_WIDTH / 2, bot.height * scale / 2 + PAD, HP_WIDTH * pctHp, HP_HEIGHT);
    ctx.restore();
  }

  function renderBullet(ctx, bullet, scale) {
    if (!BulletImages.bullet.loaded) {
      return;
    }
    // console.log('renderBullet', bullet.location.x * scale, bullet.location.y * scale, bullet.width * scale, bullet.height * scale);
    ctx.save();
    ctx.translate(bullet.location.x * scale, bullet.location.y * scale);
    ctx.drawImage(BulletImages.bullet.image, -bullet.width * scale / 2, -bullet.height * scale / 2, bullet.width * scale, bullet.height * scale);
    ctx.restore();
  }

});
