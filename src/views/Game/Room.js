import React from 'react';
import PropTypes from 'prop-types';
import BattleArena from './BattleArena';
import BattleSidebar from './BattleSidebar';
import { RoomPropType } from '../../helpers/commonPropTypes';
import RoomStatuses from '../../helpers/RoomStatuses';
import Modal from '../../components/Modal';

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
        { this.renderResults() }
      </div>
    );
  }

  renderResults() {
    if (!this.state.results) {
      return null;
    }
    if (this.state.results.status === 'canceled') {
      return (
        <Modal onCancel={ this.clearResults }>
          <h2>Match Canceled</h2>

          <div className="text-center pt-large">
            <button onClick={ this.clearResults }>Okay</button>
          </div>
        </Modal>
      );
    }

    const rankings = this.state.results.rankings.slice(0);
    rankings.sort((a, b) => a.stats.rank - b.stats.rank);

    return (
      <Modal onCancel={ this.clearResults }>
        <h2>Results</h2>
        <table className="results-table">
          <thead>
            <tr>
              <th className="text-left"></th>
              <th className="text-left">Bot</th>
              <th className="text-right">Kills</th>
              <th className="text-right">Bullets Fired</th>
              <th className="text-right">Hits</th>
              <th className="text-right">Accuracy</th>
              <th className="text-right">Killed By</th>
            </tr>
          </thead>
          <tbody>
            { rankings.map(bot => this.renderBotResultRow(bot)) }
          </tbody>
        </table>

        <div className="text-center pt-large">
          <button onClick={ this.clearResults }>Okay</button>
        </div>
      </Modal>
    );
  }

  renderBotResultRow(bot) {
    return (
      <tr key={ bot.id }>
        <td className="text-left results-table__rank">{ bot.stats.rank }</td>
        <td className="text-left results-table__name">{ bot.name }</td>
        <td className="text-right results-table__kills">{ bot.stats.kills || 0 }</td>
        <td className="text-right results-table__bullets-fired">{ bot.stats.bulletsFired || 0 }</td>
        <td className="text-right results-table__hits">{ bot.stats.hits || 0 }</td>
        <td className="text-right results-table__accuracy">{ bot.stats.bulletsFired ? `${(bot.stats.hits / bot.stats.bulletsFired * 100).toFixed(1)}%` : '-' }</td>
        <td className="text-right results-table__killed-by">{ bot.stats.killer ? bot.stats.killer.name : '-' }</td>
      </tr>
    )
  }

  clearResults = () => {
    this.setState({
      results: undefined,
    });
  }
}

module.exports = Room;
