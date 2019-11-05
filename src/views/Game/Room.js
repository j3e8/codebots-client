import React from 'react';
import PropTypes from 'prop-types';
import BattleArena from './BattleArena';
import BattleSidebar from './BattleSidebar';
import { RoomPropType } from '../../helpers/commonPropTypes';
import RoomStatuses from '../../helpers/RoomStatuses';

class Room extends React.Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
    room: RoomPropType,
  }

  constructor(props) {
    super(props);
    this.state = {
      status: RoomStatuses.PREPARE,
      room: this.props.room,
    };

    this.props.socket.on('matchStarted', this.onMatchStart);
    this.props.socket.on('matchEnded', this.onMatchEnd);
    this.props.socket.on('selectBotSuccess', this.onSelectBotSuccess);
    this.props.socket.on('memberLeft', this.onMemberLeft);
    this.props.socket.on('memberJoined', this.onMemberJoined);
    this.props.socket.on('scriptLog', this.onScriptLog);
    this.props.socket.on('scriptError', this.onScriptError);
  }

  componentWillUnmount() {
    this.props.socket.removeListener('matchStarted', this.onMatchStart);
    this.props.socket.removeListener('matchEnded', this.onMatchEnd);
    this.props.socket.removeListener('selectBotSuccess', this.onSelectBotSuccess);
    this.props.socket.removeListener('memberLeft', this.onMemberLeft);
    this.props.socket.removeListener('memberJoined', this.onMemberJoined);
    this.props.socket.removeListener('scriptLog', this.onScriptLog);
    this.props.socket.removeListener('scriptError', this.onScriptError);
  }

  onMatchStart = (msg) => {
    console.log('matchStarted', msg);
    this.setState({
      status: RoomStatuses.BATTLE,
      room: {
        ...this.state.room,
        players: msg.players, // refresh any player data that may have changed during bot initialization
      },
    });
  }

  onMatchEnd = (msg) => {
    console.log('matchEnded', msg);
    this.setState({
      status: RoomStatuses.PREPARE,
      results: msg.results,
    });
  }

  onSelectBotSuccess = (msg) => {
    console.log('selectBotSuccess', msg);
    this.setState({
      room: {
        ...this.state.room,
        players: msg.players,
      }
    });
  }

  onMemberJoined = (msg) => {
    this.setState({
      room: {
        ...this.state.room,
        players: msg.players,
      },
    });
    console.log('memberJoined', msg);
  }

  onMemberLeft = (msg) => {
    this.setState({
      room: {
        ...this.state.room,
        isRoomOwner: msg.owner.id === this.state.room.me.id, // you may have become the new room owner
        players: msg.players,
      },
    });
    console.log('memberLeft', msg);
  }

  onScriptError = (msg) => {
    console.error('Script error:', msg.botId, msg.error);
  }

  onScriptLog = (msg) => {
    console.log('Script log:', msg.bot, ...msg.message);
  }

  render() {
    return (
      <div id="battle-view" className="content-fill-height" ng-show="status == 'prepare' || status == 'battle'">
        <div className="flex-row">
          <div className="flex-cell" id="arena-cell">
            <BattleArena socket={ this.props.socket } />
          </div>
          <div className="flex-cell" id="player-cell">
            <BattleSidebar socket={ this.props.socket } room={ this.state.room } roomStatus={ this.state.status } />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Room;
