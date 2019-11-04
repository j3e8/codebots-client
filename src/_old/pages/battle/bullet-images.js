angular.module('app').service('BulletImages', function() {
  var BulletImages = {};

  BulletImages.bullet = {
    image: new Image()
  }

  BulletImages.bullet.image.src = '/assets/images/bullet.svg';
  BulletImages.bullet.image.onload = function() {
    BulletImages.bullet.loaded = true;
  }

  return BulletImages;
})
