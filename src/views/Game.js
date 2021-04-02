import React from 'react';
import io from 'socket.io-client';
import Room from './Game/Room';
import ENV from '../../www/env';

const GameStatuses = {
  PICK_USERNAME: 0,
  HOST_OR_JOIN: 1,
  IN_ROOM: 2,
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.socket = io(ENV['CODEBOTS_SOCKET_URL']);

    this.socket.on('connection', this.onSocketConnect);
    this.socket.on('disconnect', this.onSocketDisconnect);
    this.socket.on('createRoom', this.onCreateRoom);
    this.socket.on('joinRoomFail', this.onJoinRoomFail);
    this.socket.on('joinRoomSuccess', this.onJoinRoomSuccess);
    this.socket.on('leftRoom', this.onLeaveRoomSuccess);

    this.state = this.getInitialState();
  }

  componentWillUnmount() {
    this.socket.removeListener('connection', this.onSocketConnect);
    this.socket.removeListener('disconnect', this.onSocketDisconnect);
    this.socket.removeListener('createRoom', this.onCreateRoom);
    this.socket.removeListener('joinRoomFail', this.onJoinRoomFail);
    this.socket.removeListener('joinRoomSuccess', this.onJoinRoomSuccess);
    this.socket.removeListener('leftRoom', this.onLeaveRoomSuccess);
  }

  handleInputChange= (evt) => {
    this.setState({
      [evt.target.name]: evt.target.value,
    });
  }

  setUsername = () => {
    this.socket.emit('setUsername', { username: this.state.username });

    try {
      localStorage.setItem('username', this.state.username);
    } catch(ex) { }

    this.setState({
      status: GameStatuses.HOST_OR_JOIN,
    });
  }

  createRoom = () => {
    this.socket.emit('createRoom', { });
  }

  joinRoom = () => {
    this.socket.emit('joinRoom', { guid: this.state.roomGuid });
  }

  onSocketConnect = (msg) => {
  }

  onSocketDisconnect = (msg) => {
    this.setState(this.getInitialState());
  }

  onCreateRoom = (msg) => {
    this.setState({
      status: GameStatuses.IN_ROOM,
      room: {
        me: msg.owner,
        isRoomOwner: true,
        roomGuid: msg.guid,
        players: msg.players,
      },
    });
  }

  onJoinRoomFail = (msg) => {
    this.setState({
      status: GameStatuses.HOST_OR_JOIN,
    });
    alert("Sorry, couldn't join that room", true);
  }

  onJoinRoomSuccess = (msg) => {
    this.setState({
      status: GameStatuses.IN_ROOM,
      room: {
        me: msg.me,
        roomGuid: msg.guid,
        players: msg.players,
        isRoomOwner: false,
      },
    });
  }

  onLeaveRoom = () => {
    console.log('leave the room, please');
    this.socket.emit('leaveRoom', { guid: this.state.roomGuid });
  }

  onLeaveRoomSuccess = () => {
    this.setState({
      room: null,
      roomGuid: '',
      status: GameStatuses.HOST_OR_JOIN,
    });
  }

  render () {
    return (
      <div id="battle-page">
        { this.renderUsernameInput() }
        { this.renderRoomChooser() }
        { this.renderDocumentation() }
        { this.renderRoom() }
      </div>
    );
  }

  renderUsernameInput() {
    if (this.state.status !== GameStatuses.PICK_USERNAME) {
      return null;
    }
    return (
      <div id="username-chooser">
        <div className="flex-row spaced tiles-row">
          <div className="flex-cell choice-tile">
            <h2>Username</h2>
            <div>
              <input type="text" maxLength="20" name="username" value={ this.state.username } className="text-center" onChange={ this.handleInputChange }/>
            </div>
            <div className="gap"><button onClick={ this.setUsername }>Play</button></div>
          </div>
        </div>
      </div>
    );
  }

  renderRoomChooser() {
    if (this.state.status !== GameStatuses.HOST_OR_JOIN) {
      return null;
    }
    return (
      <div id="room-chooser">
        <div className="flex-row spaced tiles-row">
          <div className="flex-cell choice-tile text-center">
            <h2>Create a room</h2>
            <button onClick={ this.createRoom }>Create</button>
          </div>
          <div className="flex-cell choice-tile text-center">
            <h2>Join a room</h2>
            <div><input type="text" maxLength="6" name="roomGuid" value={ this.state.roomGuid } onChange={ this.handleInputChange } className="text-center"/></div>
            <div className="gap"><button onClick={ this.joinRoom }>Join</button></div>
          </div>
        </div>
      </div>
    );
  }

  renderDocumentation() {
    if (this.state.status === GameStatuses.IN_ROOM) {
      return null;
    }
    return (
      <div className="documentation">
        For documentation, please visit the Github Wiki at <a href="https://github.com/j3e8/codebots-client/wiki" target="_blank">https://github.com/j3e8/codebots-client/wiki</a>
      </div>
    )
  }

  renderRoom() {
    if (this.state.status !== GameStatuses.IN_ROOM) {
      return null;
    }
    return (
      <Room
        onLeaveRoom={ this.onLeaveRoom }
        socket={ this.socket }
        room={ this.state.room }
      />
    )
  }

  getInitialState = () => {
    let username;
    try {
      username = localStorage.getItem('username');
    } catch(ex) { }

    return {
      status: GameStatuses.PICK_USERNAME,
      messages: [],
      username,
      roomGuid: '',
    };
  }
}

module.exports = Game;
