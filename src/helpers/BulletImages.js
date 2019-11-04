const BulletImages = {};

BulletImages.bullet = {
  image: new Image()
}

BulletImages.bullet.image.src = '/www/images/bullet.svg';
BulletImages.bullet.image.onload = function() {
  BulletImages.bullet.loaded = true;
}

export default BulletImages;
