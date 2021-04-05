const MineImages = {};

MineImages.mine = {
  image: new Image()
}

MineImages.mine.image.src = '/www/images/mine.svg';
MineImages.mine.image.onload = function() {
  MineImages.mine.loaded = true;
}

export default MineImages;
