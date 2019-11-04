import PropTypes from 'prop-types';

module.exports = {
  RoomPropType: PropTypes.shape({
    me: PropTypes.object.isRequired,
    isRoomOwner: PropTypes.bool.isRequired,
    roomGuid: PropTypes.string.isRequired,
    players: PropTypes.array.isRequired,
  }),
}
