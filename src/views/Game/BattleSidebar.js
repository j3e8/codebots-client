import React from 'react';
import PropTypes from 'prop-types';
import { RoomPropType } from '../../helpers/commonPropTypes';
import RoomStatuses from '../../helpers/RoomStatuses';
import Drawer from '../../components/Drawer';
import Modal from '../../components/Modal';
import ComputerBots from '../../helpers/ComputerBots';

class BattleSidebar extends React.Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
    room: RoomPropType,
    roomStatus: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);

    this.props.socket.on('broadcast', this.onBroadcast);

    this.state = {
      isAddingCmp: false,
      isEditingScript: false,

      // temporary
      botName: 'test',
      botScript: `class RotateAndFire extends Bot {
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
      `,
    };
  }

  componentWillUnmount() {
    this.props.socket.removeListener('broadcast', this.onBroadcast);
  }

  onBroadcast = (msg) => {
    console.log('received broadcast', msg);
    this.setState({
      messages: [
        ...this.state.messages,
        msg.bot.name + ': ' + msg.message,
      ],
    });
  }

  addCmp = (cmp) => {
    this.props.socket.emit('selectCmpBot', { name: cmp.botName, script: cmp.botScript });
    this.toggleCmp();
  }

  handleInputChange = (evt) => {
    this.setState({
      [evt.target.name]: evt.target.value,
    });
  }

  saveScript = () => {
    this.props.socket.emit('selectBot', { name: this.state.botName, script: this.state.botScript });
    this.toggleEditScript();
  }

  startMatch = () => {
    this.props.socket.emit('startMatch');
  }

  stopMatch = () => {
    this.props.socket.emit('stopMatch');
  }

  toggleCmp = () => {
    this.setState({
      isAddingCmp: !this.state.isAddingCmp,
    });
  }

  toggleEditScript = () => {
    this.setState({
      isEditingScript: !this.state.isEditingScript,
    })
  }

  render() {
    return (
      <React.Fragment>
        <div className="flex-column">
          <div className="flex-cell">
            <h1>Room { this.props.room.roomGuid }</h1>

            <h2>Players</h2>
            { this.props.room.players.map(player => this.renderPlayer(player)) }

            <div>
              <div className="flex-row mini-spaced vertical-center">
                <div className="flex-cell">
                </div>
                <div className="flex-cell fixed">
                  <button className="sm" onClick={ this.toggleCmp }>Add cmp</button>
                </div>
              </div>
            </div>

            { this.props.roomStatus === RoomStatuses.PREPARE &&
              <div className="breathe">
                Waiting for players to join...
              </div>
            }

            <div className="breathe text-center">
              { this.canStartMatch() && <button onClick={ this.startMatch }>Start Match</button> }
              { this.canStopMatch() && <button onClick={ this.stopMatch }>Stop Match</button> }
            </div>
          </div>
          { this.renderChatWindow() }
        </div>

        { this.renderBotChooserModal() }
        { this.renderBotScriptDrawer() }
      </React.Fragment>
    );
  }

  renderPlayer(player) {
    return (
      <div key={ player.username }>
        <div className="flex-row mini-spaced vertical-center">
          <div className="flex-cell">
            { player.username }
          </div>
          { player.bot
            ? <div className="flex-cell text-right">
                { player.bot.name }
              </div>
            : null
          }
          { player.id == this.props.room.me.id
            ? <div className="flex-cell fixed">
                <button className="sm" onClick={ this.toggleEditScript }>Add script</button>
              </div>
            : null
          }
        </div>
      </div>
    );
  }

  renderChatWindow() {
    if (!this.state.messages) {
      return null;
    }
    return(
      <div className="flex-cell fixed20" id="chat-window">
        { this.state.messages.map((msg, i) => (
          <div className="chat-message" key={ i }>
            { msg }
          </div>
        )) }
      </div>
    );
  }

  renderBotChooserModal() {
    if (!this.state.isAddingCmp) {
      return null;
    }
    return (
      <Modal onCancel={ this.toggleCmp }>
        <h2>Choose a computer bot to battle</h2>
        { ComputerBots.map((cmp, i) => (
          <div key={ i }>
            <div className="flex-row mini-spaced vertical-center">
              <div className="flex-cell text-left">
                { cmp.botName }
              </div>
              <div className="flex-cell fixed">
                <button className="sm" onClick={ () => this.addCmp(cmp) }>Choose</button>
              </div>
            </div>
          </div>
        )) }
      </Modal>
    );
  }

  renderBotScriptDrawer() {
    if (!this.state.isEditingScript) {
      return null;
    }
    return (
      <Drawer onCancel={ this.toggleEditScript }>
        <label>Bot name</label>
        <input type="text" name="botName" value={ this.state.botName } onChange={ this.handleInputChange }/>

        <div className="gap" id="script-container">
          <label>Javascript</label>
          <textarea name="botScript" value={ this.state.botScript } onChange={ this.handleInputChange }></textarea>
          <div className="text-center">
            <button onClick={ this.saveScript }>Save</button>
            <button className="cancel" onClick={ this.toggleEditScript }>Cancel</button>
          </div>
        </div>
      </Drawer>
    );
  }

  canStartMatch() {
    if (this.props.room.players && this.props.room.players.length) {
      const readyPlayers = this.props.room.players.filter(function(p) { return p.bot; });
      return this.props.room.isRoomOwner && readyPlayers.length >= 2 && this.props.roomStatus !== RoomStatuses.BATTLE;
    }
    return false;
  }

  canStopMatch() {
    return this.props.roomStatus === RoomStatuses.BATTLE;
  }

}

module.exports = BattleSidebar;